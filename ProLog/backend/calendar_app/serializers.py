from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'start_time', 'end_time', 'location', 'recurrence']  # EXCLUDE 'user' and 'created_at'
    
    def validate(self, data):
        start = data.get('start_time')
        end = data.get('end_time')

        if start and end and start >= end:
            raise serializers.ValidationError("Start time must be before end time.")

        return data
