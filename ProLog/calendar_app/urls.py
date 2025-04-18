from django.urls import path
from .views import UserEventListAPIView, UserEventCreateAPIView, UserEventUpdateAPIView

urlpatterns = [
    path('api/events/', UserEventListAPIView.as_view(), name='event_list'),  # GET request for listing events.
    path('api/events/create', UserEventCreateAPIView.as_view(), name='event_create'),  # POST request for creating an event.
    path('api/events/<int:pk>/update/', UserEventUpdateAPIView.as_view(), name='event_update') # UPDATE request for updating an event with the specified ID.
    #path('api/events/<int:pk>/delete/', UserEventDeleteAPIView.as_view(), name='event_delete') # DELETE request for removing an event with the specified ID.
]