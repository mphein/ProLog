from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Event, EventInvitation

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class EventSerializer(serializers.ModelSerializer):
    invited_users = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        write_only=True
    )
    invited_users_data = UserSerializer(many=True, read_only=True, source='invited_users')

    class Meta:
        model = Event
        # EXCLUDE 'user' and 'created_at'
        fields = [
            'id', 'title', 'description', 'start_time', 'end_time', 'location', 
            'recurrence', 'invited_users', 'invited_users_data'
        ]  

    def create(self, validated_data):
        invited_users = validated_data.pop('invited_users', [])
        validated_data.pop('user', None)
        creator = self.context['request'].user

        invited_users = [user for user in invited_users if user.id != creator.id]

        event = Event.objects.create(user=creator, **validated_data)
        event.invited_users.set(invited_users)
        return event

    def update(self, instance, validated_data):
        invited_users = validated_data.pop('invited_users', [])
        creator = self.context['request'].user

        invited_users = [user for user in invited_users if user.id != creator.id]

        instance = super().update(instance, validated_data)
        instance.invited_users.set(invited_users)  # Update invited users
        return instance

    def validate(self, data):
        start = data.get('start_time')
        end = data.get('end_time')
        if start and end and start >= end:
            raise serializers.ValidationError("Start time must be before end time.")

        return data

class EventInvitationSerializer(serializers.ModelSerializer):
    event = EventSerializer()         # Nest full event details
    user = UserSerializer()           # Nest user info

    class Meta:
        model = EventInvitation
        fields = ['id', 'event', 'user', 'is_accepted', 'responded']
