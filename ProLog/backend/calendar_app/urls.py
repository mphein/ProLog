from django.urls import path
from .views import UserEventListAPIView, UserEventCreateAPIView, UserEventUpdateAPIView, UserEventDeleteAPIView
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

urlpatterns = [
    path('events/', UserEventListAPIView.as_view(), name='event_list'),  # GET request for listing events.
    path('events/create', UserEventCreateAPIView.as_view(), name='event_create'),  # POST request for creating an event.
    path('events/<int:pk>/update/', UserEventUpdateAPIView.as_view(), name='event_update'), # UPDATE request for updating an event with the specified ID.
    path('events/<int:pk>/delete/', UserEventDeleteAPIView.as_view(), name='event_delete'), # DELETE request for removing an event with the specified ID.
    path('users/', UserListView.as_view(), name='user_list'), # GET request for fetching users
]