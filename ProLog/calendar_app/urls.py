from django.urls import path
from .views import UserEventListAPIView, UserEventCreateAPIView

urlpatterns = [
    path('events/', UserEventListAPIView.as_view(), name='event_list'),  # GET request for listing events
    path('events/create', UserEventCreateAPIView.as_view(), name='event_create'),  # POST request for creating an event
]