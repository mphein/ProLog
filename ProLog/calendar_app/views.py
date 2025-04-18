from rest_framework.generics import ListAPIView, CreateAPIView
from rest_framework.permissions import IsAuthenticated
from .models import Event
from .serializers import EventSerializer

# Create your views here.
class UserEventListAPIView(ListAPIView):
    serializer_class = EventSerializer
    #permission_classes = [IsAuthenticated]
    def get_queryset(self):
        """
        Return the list of events for the currently authenticated user.
        """
        return Event.objects.filter(user=self.request.user)

class UserEventCreateAPIView(CreateAPIView):
    serializer_class = EventSerializer
    #permission_classes = [IsAuthenticated]
    def perform_create(self, serializer):
        # Automatically set the user when creating an event
        serializer.save(user=self.request.user)