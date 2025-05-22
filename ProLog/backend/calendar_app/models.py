from django.db import models
from django.contrib.auth.models import User

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True, null=True)
    recurrence = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        choices=[
            ('none', 'None'),
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
            ('monthly', 'Monthly'),
            ('yearly', 'Yearly'),
        ],
        default='none'
    )
    invited_users = models.ManyToManyField(User, through="EventInvitation", related_name='event_invitations', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Link each event to a user

    def __str__(self):
        return self.title

class EventInvitation(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_accepted = models.BooleanField(default=False)    # Whether they accepted
    responded = models.BooleanField(default=False)      # Whether they responded