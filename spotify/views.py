from django.shortcuts import render, redirect
from requests.sessions import session
from rest_framework.response import Response
from .credentials import REDIRECT_URI, CLIENT_ID, CLIENT_SECRET
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .util import *
from api.models import Room
from .models import Vote

# https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
# Call this API endpoint from the frontend, take the url returned and redirect to that page (Spotify Authorization Page)
class AuthURL(APIView):
    def get(self, request, format=None):

        # https://developer.spotify.com/documentation/general/guides/authorization/scopes/
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)

# When the url is done authorizing, redirect to this callback
# We'll send a request for the tokens, and store it in our database, then redirect back to the orignal application
# grant_Type meaning what are we sending
def spotify_callback(request, format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')

    if not request.session.exists(request.session.session_key):    
        request.session.create()

    update_or_create_user_tokens(request.session.session_key, access_token, token_type, expires_in, refresh_token)

    return redirect('frontend:')

# API endpoint that tells us whether or not user is authenticated
class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)

# Checks which room the user is in, and who the host is to get the information for the song
class CurrentSong(APIView):
    def get(self, request,format=None):
        room_code = self.request.session.get('room_code')
        queryset = Room.objects.filter(code=room_code)
        if queryset.exists():
            room = queryset[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        host = room.host
        endpoint = "player/currently-playing"
        response = execute_spotify_api_request(host, endpoint)
        
        if 'error' in response or 'item' not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get('item')
        song_title = item.get('name')
        song_id = item.get('id')
        album_cover = item.get('album').get('images')[0].get('url')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        is_playing = response.get('is_playing')
        votes = Vote.objects.filter(room=room, song_id=song_id)

        artist_string = ""

        for i, artist in enumerate(item.get('artists')):
            if i > 0:
                artist_string += ", "
            name = artist.get('name')
            artist_string += name
        
        song = {
            'title': song_title,
            'id': song_id,
            'artist': artist_string,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': len(votes)
        }

        self.update_room_song(room, song_id)

        return Response(song, status=status.HTTP_200_OK)

    def update_room_song(self, room, song_id):
        current_song = room.current_song

        # if song has changed, delete votes
        if current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=['current_song'])
            votes = Vote.objects.filter(room=room)
            votes.delete()


class PlaySong(APIView):
    def put(self, response, format=None):
        room_code = self.request.session.get('room_code')
        queryset = Room.objects.filter(code=room_code)
        if queryset.exists():
            room = queryset[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)

        # Checks if its the host
        # If not, check if guest can play/pause
        if room.host == self.request.session.session_key or room.guest_can_pause:
            endpoint = "player/play"
            execute_spotify_api_request(room.host, endpoint, put_=True)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)


class PauseSong(APIView):
    def put(self, response, format=None):
        room_code = self.request.session.get('room_code')
        queryset = Room.objects.filter(code=room_code)
        if queryset.exists():
            room = queryset[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)

        # Checks if its the host
        # If not, check if guest can play/pause
        if room.host == self.request.session.session_key or room.guest_can_pause:
            endpoint = "player/pause"
            execute_spotify_api_request(room.host, endpoint, put_=True)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        return Response({}, status=status.HTTP_403_FORBIDDEN)

class SkipSong(APIView):
    def post(self, response, format=None):
        room_code = self.request.session.get('room_code')
        queryset = Room.objects.filter(code=room_code)

        if queryset.exists():
            room = queryset[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)

        
        votes = Vote.objects.filter(room=room, song_id=room.current_song) 
        votes_needed = room.votes_to_skip

        # Checks if its the host
        # If not, check number of votes needed
        if self.request.session.session_key == room.host or len(votes) + 1 >= votes_needed:
            endpoint = "player/next"
            execute_spotify_api_request(room.host, endpoint, post_=True)
            votes.delete()
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        else:
            vote = Vote(user=self.request.session.session_key, room=room, song_id=room.current_song)
            vote.save()
        
        return Response({}, status=status.HTTP_403_FORBIDDEN)

