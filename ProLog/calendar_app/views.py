from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from .models import Event
from .serializers import EventSerializer

# Create your views here.
class UserEventListAPIView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EventSerializer

    def get_queryset(self):
        """
        Return the list of events for the currently authenticated user.
        """
        return Event.objects.filter(user=self.request.user)