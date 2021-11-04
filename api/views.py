from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from .models import Room
from .serializers import RoomSerializer, CreateRoomSerializer

# Create a Room and view all the rooms
class RoomView(generics.ListAPIView):
    # What do we wanna return? All the room objects
    queryset = Room.objects.all()
    # in json format
    serializer_class = RoomSerializer

# When we call the GetRoomView with a GET request, we need to pass parameter roomcode
class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'

    def get(self, request, format=None):
        # give information about the url from GET request
        # .get looks for parameter in the url
        # one that matches the name code
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            queryset = Room.objects.filter(code=code)
            if queryset.exists():
                room = queryset[0]
                data = RoomSerializer(room).data
                data['is_host'] = self.request.session.session_key == room.host
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request' : 'Code parameter not found.'}, status=status.HTTP_400_BAD_REQUEST)

class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        # Checks if the user has an active session with the web server
        if not self.request.session.exists(self.request.session.session_key):
            # If not, create session 
            self.request.session.create()

        # Serialize all of the data and return a python representation of it
        # and check whether the data sent is valid
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause,
                            votes_to_skip=votes_to_skip)
                room.save()
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)

class UserInRoom(APIView):
    def get(self, request, format=None):
        # Checks if the user has an active session with the web server
        if not self.request.session.exists(self.request.session.session_key):
            # If not, create session 
            self.request.session.create()

        data = {
            'code': self.request.session.get('room_code')
        }

        # takes a arbitrary python dictionary and serialize it into json
        return JsonResponse(data, status=status.HTTP_200_OK)

