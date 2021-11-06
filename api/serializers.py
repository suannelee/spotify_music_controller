from rest_framework import serializers, validators
from .models import Room

# Outgoing Serializers convert python objects to json for the frontend to read
class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('id', 'code', 'host', 'guest_can_pause', 'votes_to_skip', 'created_at')

# Incoming serializers handles request then convert to python
# Handles the post request to create a new room
# We send a post request that has info hidden in it
# The serializer makes sure that the data being sent in the post request is valid
# and that the fields fit the fields that we need to create a new room
class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip')

class UpdateRoomSerializer(serializers.ModelSerializer):
    code = serializers.CharField(validators=[])
    
    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip', 'code')