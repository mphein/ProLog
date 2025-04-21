from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Event
from .serializers import EventSerializer

# Create your views here.
class UserEventListAPIView(ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        """
        Return the list of events for the currently authenticated user.
        """
        return Event.objects.filter(user=self.request.user)

class UserEventCreateAPIView(CreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    def perform_create(self, serializer):
        # Automatically set the user when creating an event
        serializer.save(user=self.request.user)

class UserEventUpdateAPIView(UpdateAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Limit the queryset to the events owned by the authenticated user.
        # This ensures that users can only update their own events.
        return Event.objects.filter(user=self.request.user)
    
    def perform_update(self, serializer):
        # If user is trying to update an event that does not belong to them.
        if serializer.instance.user != self.request.user:
            raise PermissionDenied("You cannot update this event.")
        
        # Save the updated event.
        serializer.save()

class UserEventDeleteAPIView(DestroyAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Limit the queryset to the events owned by the authenticated user.
        # This ensures that users can only update their own events.
        return Event.objects.filter(user=self.request.user)