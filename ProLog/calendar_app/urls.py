from django.urls import path
from .views import UserEventListAPIView

urlpatterns = [
    path('api/events/', UserEventListAPIView.as_view(), name='event_list') # URL for event list
]
