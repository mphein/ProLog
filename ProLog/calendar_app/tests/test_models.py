import pytest
from calendar_app.models import Event
from django.contrib.auth.models import User

@pytest.fixture
def user():
    """ Create a user to use in tests."""
    return User.objects.create_user(username="test_user", password="testpassword")

@pytest.fixture
def event(user):
    """Create an event to use in tests."""
    return Event.objects.create(
        title='Test Event',
        description='A test event description',
        start_time='2025-04-18T17:56:24Z',
        end_time='2025-04-18T17:56:34Z',
        location='Monterey, CA',
        user=user
    )

def test_event_creation(event):
    """Test that the event is correctly created in the database."""
    assert event.title == 'Test Event'
    assert event.description == 'A test event description'
    assert event.user.username == 'testuser'

def test_event_list_view(client, user, event):
    """Test that the event list view returns the correct events for a user."""
    # Use Django's test client to make a request to the API endpoint
    client.login(username='testuser', password='testpassword')
    response = client.get('/api/events/')
    
    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]['title'] == 'Test Event'