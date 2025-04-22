# calendar_app/tests/test_api.py
import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from calendar_app.models import Event
from rest_framework import status
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken




######################################################################
#                 Tests for User event API retrieval                 #
######################################################################

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
def api_client(user, request, authenticated):
    """Fixture to provide an authenticated or unauthenticated API client."""
    client = APIClient()
    
    # Check if the test wants an authenticated user
    if getattr(request, 'param', None):  # This checks for 'authenticated' param
        # Generate a JWT token for the user and authenticate the client
        refresh = RefreshToken.for_user(user)
        token = str(refresh.access_token)
        client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
    
    return client

@pytest.mark.django_db
@pytest.mark.parametrize('authenticated', [True])  # This will create an authenticated client
def test_event_list_view(api_client, user, event):
    """Test that the event list view returns the correct events for a user."""
     # Generate JWT token for the user
    refresh = RefreshToken.for_user(user)
    token = str(refresh.access_token)
    api_client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
    
    url = reverse('event_list')
    response = api_client.get(url)
    
    # Assert the expected status code and response content
    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]['title'] == 'Test Event'


@pytest.mark.django_db
@pytest.mark.parametrize('authenticated', [False])  # This will create an unauthenticated client
def test_event_list_view_forbidden(api_client):
    """Test that a user who is not authenticated gets a 401 Unauthorized response."""
    # Since the api_client is not authenticated, no token is attached
    url = reverse('event_list')
    response = api_client.get(url)
    
    # Assert that the user receives a 401 Unauthorized status code (not 403)
    assert response.status_code == 401

######################################################################
#                  Tests for API Event Creation                      #
######################################################################
@pytest.mark.django_db
@pytest.mark.parametrize('authenticated', [True])  # This will create an authenticated client
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
    url = reverse('event_create')
    response = api_client.post(url, data)

    # Assert the status code is 201 (Created)
    assert response.status_code == status.HTTP_201_CREATED

    # Assert that the event was actually created in the database
    assert response.data['title'] == 'Post Event'
    assert response.data['description'] == 'Testing Post API'
    assert response.data['location'] == 'San Francisco, CA'
    assert response.data['user'] == user.id

@pytest.mark.django_db
@pytest.mark.parametrize('authenticated', [False])  # This will create an unauthenticated client
def test_unauthenticated_user_cannot_create_event(api_client):
    # Test that users cannot create events when not logged in
    url = reverse('event_create')
    response = api_client.post(url, {})
    assert response.status_code in [401, 403]

@pytest.mark.django_db
@pytest.mark.parametrize('authenticated', [True])  # This will create an authenticated client
def test_invalid_date_format(user, api_client):
    # Test that users cannot create invalid events
    api_client.login(username='testuser', password='testpassword')
    data = {
        'title': 'Event',
        'start_time': 'not-a-date',
        'end_time': 'also-not-a-date'
    }

    url = reverse('event_create')
    response = api_client.post(url, data)
    assert response.status_code == 400

@pytest.mark.django_db
@pytest.mark.parametrize('authenticated', [True])  # This will create an authenticated client
def test_user_cannot_create_empty_event(api_client, user):
    # Test that users cannot create empty event
    api_client.login(username='testuser', password='testpassword')
    url = reverse('event_create')
    response = api_client.post(url, {})
    assert response.status_code == 400


######################################################################
#                  Tests for API Updating Event                      #
######################################################################


@pytest.mark.django_db
@pytest.mark.parametrize('authenticated', [True])  # This will create an authenticated client
def test_update_event(api_client, user, event):
    # Test that a user can update an event.
    api_client.login(username='testuser', password='testpassword')
    event_id = event.id

    updated_data = {
        'title': 'Updated Event',
        'description': 'Testing Update API',
        'start_time': '2025-04-20T10:00:00Z',
        'end_time': '2025-04-20T12:00:00Z',
        'location': 'UPDATELAND',
        'user': user.id  
    }

    url = reverse('event_update', args=[event.id])
    response = api_client.put(url, updated_data, format='json')

    assert response.status_code == status.HTTP_200_OK
    event.refresh_from_db()
    assert event.title == updated_data['title']
    assert event.description == updated_data['description']
    assert event.location == updated_data['location']

@pytest.mark.django_db
@pytest.mark.parametrize('authenticated', [True])  # This will create an authenticated client
def test_update_event_wrong_user(api_client, user, event):
    # Test to ensure user cannot modify another user's event.
    other_user = User.objects.create_user(username='otheruser', password='otherpassword')

    api_client.login(username='otherusername', password='otherpassword')

    updated_data = {
        'title': 'Updated Event',
        'description': 'Testing Update API',
        'start_time': '2025-04-20T10:00:00Z',
        'end_time': '2025-04-20T12:00:00Z',
        'location': 'UPDATELAND',
        'user': user.id  
    }
    url = reverse('event_update', args=[event.id])
    response = api_client.put(url, updated_data, format='json')

    assert response.status_code == status.HTTP_403_FORBIDDEN

    event.refresh_from_db()
    assert event.title != updated_data['title']
    assert event.description != updated_data['description']
    assert event.location != updated_data['location']

@pytest.mark.django_db
@pytest.mark.parametrize('authenticated', [True])  # This will create an authenticated client
# Test that user's can only update existing events.
def test_update_non_existent_event(api_client, user, event):
    api_client.login(username='testuser', password='testpassword')
    event_id = 9999
    url = reverse('event_update', args=[event_id])
    response = api_client.put(url, {}, format='json')

    assert response.status_code == status.HTTP_404_NOT_FOUND


######################################################################
#                  Tests for API Deleting Event                      #
######################################################################

@pytest.mark.django_db
@pytest.mark.parametrize('authenticated', [True])  # This will create an authenticated client
def test_update_event(api_client, user, event):
    # Test that a user can delete an event.
    api_client.login(username='testuser', password='testpassword')
    event_id = event.id

    url = reverse("event_delete", args=[event.id])
    response = api_client.delete(url)

    assert response.status_code == status.HTTP_204_NO_CONTENT

