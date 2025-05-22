from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import models
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Event, EventInvitation
from .serializers import EventSerializer, EventInvitationSerializer

# Create your views here.
class UserEventListAPIView(ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        # Return the list of events owned or invited to for the currently authenticated user.
        user = self.request.user
        return Event.objects.filter(models.Q(user=user) | models.Q(eventinvitation__user=user, eventinvitation__is_accepted=True)).distinct()

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

class UserPendingInvitationsView(ListAPIView):
    serializer_class = EventInvitationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return EventInvitation.objects.filter(user=user, responded=False)


class RespondToInvitationView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            invitation = EventInvitation.objects.get(pk=pk, user=request.user)
        except EventInvitation.DoesNotExist:
            return Response({'detail': 'Invitation not found.'}, status=status.HTTP_404_NOT_FOUND)

        invitation.is_accepted = request.data.get('is_accepted', False)
        invitation.responded = request.data.get('responded', True)
        invitation.save()

        return Response({'detail': 'Response recorded.'}, status=status.HTTP_200_OK)