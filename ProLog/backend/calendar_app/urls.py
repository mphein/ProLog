from django.urls import path
from .views import UserEventListAPIView, UserEventCreateAPIView, UserEventUpdateAPIView, UserEventDeleteAPIView, UserPendingInvitationsView, RespondToInvitationView
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

urlpatterns = [
    path('events/', UserEventListAPIView.as_view(), name='event_list'),  # GET events.
    path('events/create', UserEventCreateAPIView.as_view(), name='event_create'),  # POST request for creating an event.
    path('events/<int:pk>/update/', UserEventUpdateAPIView.as_view(), name='event_update'), # PATCH an event with the specified ID.
    path('events/<int:pk>/delete/', UserEventDeleteAPIView.as_view(), name='event_delete'), # DELETE an event with the specified ID.
    path('users/', UserListView.as_view(), name='user_list'), # GET users
    path('invitations/pending/', UserPendingInvitationsView.as_view(), name='pending_invitations'), # GET pending invitations
    path('invitations/<int:pk>/respond/', RespondToInvitationView.as_view(), name='respond_invitation'), # PATCH invited event, accept/decline
]