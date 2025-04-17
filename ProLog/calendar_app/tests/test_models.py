# calendar_app/tests/test_models.py
import pytest
from django.contrib.auth.models import User
from calendar_app.models import Event

@pytest.fixture
def user():
    """Create a user to use in tests."""
    return User.objects.create_user(username="testuser", password="testpassword")

@pytest.fixture
def event(user):
    """Create an event to use in tests."""
    return Event.objects.create(
        title='Test Event',
        description='Test description',
        start_time='2025-04-18T17:56:24Z',
        end_time='2025-04-18T17:56:34Z',
        location='City, USA',
        user=user
    )

@pytest.mark.django_db
def test_event_creation(event):
    """Test that the event is correctly created in the database."""
    assert event.title == 'Test Event'
    assert event.description == 'Test description'
    assert event.user.username == 'testuser'
    assert event.location == 'City, USA'