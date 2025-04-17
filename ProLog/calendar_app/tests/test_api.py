# calendar_app/tests/test_api.py
import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from calendar_app.models import Event
from rest_framework import status

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

@pytest.fixture
def api_client():
    """Fixture to provide a test client for the API."""
    return APIClient()

@pytest.mark.django_db
def test_event_list_view(api_client, user, event):
    """Test that the event list view returns the correct events for a user."""
    api_client.login(username='testuser', password='testpassword')
    response = api_client.get('/calendar/api/events/')
    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]['title'] == 'Test Event'


@pytest.mark.django_db
def test_event_list_view_forbidden(api_client):
    """Test that a user who is not authenticated gets a 403 Forbidden response."""
    response = api_client.get('/calendar/api/events/')
    
    # Assert that the user receives a 403 Forbidden status code
    assert response.status_code == 403

######################################################################

@pytest.mark.django_db
def test_create_event(api_client, user):
    """Test that a user can create a new event."""
    data = {
        'title': 'Post Event',
        'description': 'Testing Post API',
        'start_time': '2025-04-20T10:00:00Z',
        'end_time': '2025-04-20T12:00:00Z',
        'location': 'San Francisco, CA',
        'user': user.id  
    }
    
    api_client.login(username='testuser', password='testpassword')
    
    # Use the APIClient to send a POST request to the create event endpoint
    response = api_client.post('/calendar/api/events/create', data)

    # Assert the status code is 201 (Created)
    assert response.status_code == status.HTTP_201_CREATED

    # Assert that the event was actually created in the database
    assert response.data['title'] == 'Post Event'
    assert response.data['description'] == 'Testing Post API'
    assert response.data['location'] == 'San Francisco, CA'
    assert response.data['user'] == user.id

@pytest.mark.django_db
def test_unauthenticated_user_cannot_create_event(api_client):
    # Test that users cannot create events when not logged in
    response = api_client.post('/calendar/api/events/create', {})
    assert response.status_code in [401, 403]

@pytest.mark.django_db
def test_invalid_date_format(user, api_client):
    # Test that users cannot create invalid events
    api_client.login(username='testuser', password='testpassword')
    data = {
        'title': 'Event',
        'start_time': 'not-a-date',
        'end_time': 'also-not-a-date'
    }
    response = api_client.post('/calendar/api/events/create', data)
    assert response.status_code == 400

@pytest.mark.django_db
def test_user_cannot_create_empty_event(api_client, user):
    # Test that users cannot create empty event
    api_client.login(username='testuser', password='testpassword')
    response = api_client.post('/calendar/api/events/create', {})
    assert response.status_code == 400