import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { enUS } from 'date-fns/locale'; // Use import here
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState } from 'react';
import api from './api';
import CreateEvent from './CreateEvent'

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
<<<<<<< HEAD
  const [view, setView] = useState('week'); // default view
  const [currentDate, setCurrentDate] = useState(new Date()); // Track current date
=======
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(true);

>>>>>>> shloak

  const refreshCalendar = () => {
    setLoading(true); // Start loading while fetching
    const token = localStorage.getItem('access_token');
    if (!token) {
      // Redirect to login if no token
      window.location.href = '/';
      return;
    }

    api.get('events/', {
      headers: {
        'Authorization': `Bearer ${token}`, // Use backticks for correct string interpolation
      }
    })
    .then(res => {
      const formatted = res.data.map(event => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        description: event.description
      }));
      setEvents(formatted);
      setLoading(false);  // Set loading to false after data is loaded
    })
    .catch(err => {
      console.error('Failed to load events:', err);
      setLoading(false);  // Set loading to false in case of error
    });
  };

  useEffect(() => {
    refreshCalendar(); // Fetch events when the component mounts
  }, []);  // Only run on component mount

  if (loading) {
    return <div>Loading events...</div>;  // Display loading message while fetching
  }
  

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setReadOnlyMode(true); // Always start in view-only mode
    setShowEditor(true);
  };

  return (
    <div className="columns is-variable is-6 is-multiline is-desktop">
      <div className="column is-full-touch is-two-thirds-desktop">
        <h1 className="text-2xl font-bold mb-4">Your Calendar</h1>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
<<<<<<< HEAD
          view={view}
          onView={setView}
          date={currentDate} // Set the current date
          onNavigate={(date) => setCurrentDate(date)} // Update the current date on navigation
          views={['month', 'week', 'day']}
          style={{ height: 500 }}
          scrollToTime={new Date()}
=======
          onSelectEvent={handleSelectEvent}
          style={{ height: 600 }}
>>>>>>> shloak
        />
      </div>
      <div className="column is-full-touch is-one-third-desktop">
        {/* CreateEvent form on the right */}
        <CreateEvent onEventCreated={refreshCalendar} />
      </div>
      {showEditor && selectedEvent && (
        <div className="mt-4 border p-4 rounded bg-gray-50 max-w-md">
          <h2 className="font-semibold mb-2">
            {readOnlyMode ? 'Event Details' : 'Edit Event'}
          </h2>

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
              readOnly={readOnlyMode}
              onChange={(e) =>
                setSelectedEvent({ ...selectedEvent, title: e.target.value })
              }
              className="w-full border p-2"
            />

            <input
              type="datetime-local"
              value={new Date(selectedEvent.start).toISOString().slice(0, 16)}
              readOnly={readOnlyMode}
              onChange={(e) =>
                setSelectedEvent({
                  ...selectedEvent,
                  start: new Date(e.target.value),
                })
              }
              className="w-full border p-2"
            />

            <input
              type="datetime-local"
              value={new Date(selectedEvent.end).toISOString().slice(0, 16)}
              readOnly={readOnlyMode}
              onChange={(e) =>
                setSelectedEvent({
                  ...selectedEvent,
                  end: new Date(e.target.value),
                })
              }
              className="w-full border p-2"
            />

            <textarea
              value={selectedEvent.description || ''}
              readOnly={readOnlyMode}
              onChange={(e) =>
                setSelectedEvent({
                  ...selectedEvent,
                  description: e.target.value,
                })
              }
              className="w-full border p-2"
            />

            {/* ✅ Only show SAVE + CANCEL when editing */}
            {!readOnlyMode && (
              <div className="flex justify-between mt-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
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
            )}
          </form>

          {/* ✅ Buttons outside form = safe from triggering submit */}
          {readOnlyMode && (
            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => setReadOnlyMode(false)}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this event?')) {
                    api
                      .delete(`events/${selectedEvent.id}/delete/`)
                      .then(() => {
                        alert('Event deleted.');
                        setEvents((prev) =>
                          prev.filter((e) => e.id !== selectedEvent.id)
                        );
                        setShowEditor(false);
                      })
                      .catch((err) => {
                        alert('Failed to delete event');
                        console.error(err);
                      });
                  }
                }}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default CalendarPage;
