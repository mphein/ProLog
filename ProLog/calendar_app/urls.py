from django.urls import path
from .views import UserEventListAPIView, UserEventCreateAPIView

urlpatterns = [
    path('api/events/', UserEventListAPIView.as_view(), name='event_list'),  # GET request for listing events
    path('api/events/create', UserEventCreateAPIView.as_view(), name='event_create'),  # POST request for creating an event
]