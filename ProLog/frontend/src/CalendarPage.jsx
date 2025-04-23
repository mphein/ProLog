import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US'; // Use import here
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState } from 'react';
import api from './api';

const locales = {
    'en-US': enUS,
  };
  

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});


function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);  // Track loading state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEditor, setShowEditor] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      // Redirect to login if no token
      window.location.href = '/';
      return;
    }

    api.get('events/', {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
    .then(res => {
      const formatted = res.data.map(event => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
      }));
      setEvents(formatted);
      setLoading(false);  // Set loading to false after data is loaded
    })
    .catch(err => {
      console.error('Failed to load events:', err);
      setLoading(false);  // Set loading to false in case of error
    });
  }, []);  // Only run on component mount

  if (loading) {
    return <div>Loading events...</div>;  // Display loading message while fetching
  }

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowEditor(true);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Calendar</h1>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelectEvent}
        style={{ height: 600 }}
      />
      {showEditor && selectedEvent && (
        <div className="mt-4 border p-4 rounded bg-gray-50 max-w-md">
          <h2 className="font-semibold mb-2">Edit Event</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              api
                .patch(`events/${selectedEvent.id}/update/`, {
                  title: selectedEvent.title,
                  start_time: selectedEvent.start,
                  end_time: selectedEvent.end,
                  description: selectedEvent.description,
                })
                .then(() => {
                  alert('Event updated!');
                  setShowEditor(false);
                  // Optionally re-fetch events here
                  setEvents((prevEvents) =>
                    prevEvents.map((e) =>
                      e.id === selectedEvent.id ? { ...selectedEvent } : e
                    )
                  );
                })
                .catch((err) => {
                  alert('Update failed');
                  console.error(err);
                });
            }}
            className="space-y-2"
          >
            <input
              type="text"
              value={selectedEvent.title}
              onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
              className="w-full border p-2"
              placeholder="Title"
            />
            <input
              type="datetime-local"
              value={new Date(selectedEvent.start).toISOString().slice(0, 16)}
              onChange={(e) => setSelectedEvent({ ...selectedEvent, start: new Date(e.target.value) })}
              className="w-full border p-2"
            />
            <input
              type="datetime-local"
              value={new Date(selectedEvent.end).toISOString().slice(0, 16)}
              onChange={(e) => setSelectedEvent({ ...selectedEvent, end: new Date(e.target.value) })}
              className="w-full border p-2"
            />
            <textarea
              value={selectedEvent.description || ''}
              onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
              className="w-full border p-2"
              placeholder="Description"
            />
            <div className="flex justify-between">
              <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className="bg-gray-400 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default CalendarPage;
