from django.shortcuts import render
from .models import Project
from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import ProjectSerializer

# Create your views here.
class UserProjectListAPIView(ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        """
        Return the list of events for the currently authenticated user.
        """
        return Project.objects.filter(user=self.request.user)