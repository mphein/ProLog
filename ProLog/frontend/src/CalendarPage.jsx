import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState } from 'react';
import api from './api';
import CreateEvent from './CreateEvent';
import { toast } from 'react-toastify';

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
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(true);

  const refreshCalendar = () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    api.get('events/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        const formatted = res.data.map((event) => ({
          id: event.id,
          title: event.title,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
          description: event.description,
          location: event.location,
        }));
        setEvents(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load events:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    refreshCalendar();
  }, []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setReadOnlyMode(true);
    setShowEditor(true);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    api
      .patch(`events/${selectedEvent.id}/update/`, {
        title: selectedEvent.title,
        start_time: selectedEvent.start,
        end_time: selectedEvent.end,
        description: selectedEvent.description,
        location: selectedEvent.location,
      })
      .then(() => {
        toast.success('Event updated!');
        setShowEditor(false);
        setSelectedEvent(null);
        setEvents((prevEvents) =>
          prevEvents.map((e) =>
            e.id === selectedEvent.id ? { ...selectedEvent } : e
          )
        );
      })
      .catch((err) => {
        toast.error('Update failed');
        console.error(err);
      });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this event?')) {
      api
        .delete(`events/${selectedEvent.id}/delete/`)
        .then(() => {
          toast.success('Event deleted.');
          setEvents((prev) =>
            prev.filter((e) => e.id !== selectedEvent.id)
          );
          setShowEditor(false);
          setSelectedEvent(null);
        })
        .catch((err) => {
          toast.error('Failed to delete event');
          console.error(err);
        });
    }
  };

  if (loading) return <div>Loading events...</div>;

  return (
    <div className="columns is-variable is-6 is-multiline is-desktop">
      <div className="column is-full-touch is-two-thirds-desktop">
        <h1 className="text-2xl font-bold mb-4">Your Calendar</h1>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          style={{ height: 600 }}
        />
      </div>

      <div className="column is-full-touch is-one-third-desktop">
        {!showEditor && <CreateEvent onEventCreated={refreshCalendar} />}

        {showEditor && selectedEvent && (
          <div className="box mt-4">
            <h2 className="title is-4">
              {readOnlyMode ? 'Event Details' : 'Edit Event'}
            </h2>

            <form onSubmit={handleUpdateSubmit} className="mb-4">
              {['title', 'description', 'location'].map((field) => (
                <div className="field" key={field}>
                  <label className="label">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      value={selectedEvent[field] || ''}
                      readOnly={readOnlyMode}
                      onChange={(e) =>
                        setSelectedEvent({
                          ...selectedEvent,
                          [field]: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ))}

              {['start', 'end'].map((field) => (
                <div className="field" key={field}>
                  <label className="label">
                    {field === 'start' ? 'Start Time' : 'End Time'}
                  </label>
                  <div className="control">
                    <input
                      className="input"
                      type="datetime-local"
                      value={new Date(selectedEvent[field]).toISOString().slice(0, 16)}
                      readOnly={readOnlyMode}
                      onChange={(e) =>
                        setSelectedEvent({
                          ...selectedEvent,
                          [field]: new Date(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              ))}

              {!readOnlyMode && (
                <div className="field is-grouped is-grouped-right mt-4">
                  <p className="control">
                    <button type="submit" className="button is-primary">
                      Save
                    </button>
                  </p>
                  <p className="control">
                    <button
                      type="button"
                      className="button"
                      onClick={() => {
                        setShowEditor(false);
                        setSelectedEvent(null);
                      }}
                    >
                      Cancel
                    </button>
                  </p>
                </div>
              )}
            </form>

            {readOnlyMode && (
              <div className="field is-grouped is-grouped-right">
                <p className="control">
                  <button
                    type="button"
                    className="button is-info"
                    onClick={() => setReadOnlyMode(false)}
                  >
                    Edit
                  </button>
                </p>
                <p className="control">
                  <button
                    type="button"
                    className="button is-danger"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CalendarPage;

