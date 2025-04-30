import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';

import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

import { useEffect, useState } from 'react';
import api from './api';
import CreateEvent from './CreateEvent';
import { toast } from 'react-toastify';




const DnDCalendar = withDragAndDrop(Calendar);

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
          start: event.start_time,
          end: event.end_time,
          description: event.description,
          location: event.location,
          recurrence: event.recurrence
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
    const formatDateForInput = (dateObj) => {
      if (!(dateObj instanceof Date)) return '';
      return dateObj.toISOString().slice(0, 16);
    };
  
    setSelectedEvent({
      ...event,
      start: formatDateForInput(event.start),
      end: formatDateForInput(event.end),
    });
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
        location: selectedEvent.location
      })

      .then(() => {
        toast.success('Event updated!');
        setShowEditor(false);
        setSelectedEvent(null);
        refreshCalendar();
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

  const handleMoveEvent = ({ event, start, end }) => {
    api.patch(`events/${event.id}/update/`, {
      start_time: start.toISOString().slice(0, 16),
      end_time: end.toISOString().slice(0, 16),
    })
      .then(() => {
        toast.success('Event moved!');
        refreshCalendar();
      })
      .catch(err => {
        toast.error('Failed to move event');
        console.error(err);
      });
  };
  
  const handleResizeEvent = ({ event, start, end }) => {
    api.patch(`events/${event.id}/update/`, {
      start_time: start.toISOString().slice(0, 16),
      end_time: end.toISOString().slice(0, 16),
    })
      .then(() => {
        toast.success('Event resized!');
        refreshCalendar();
      })
      .catch(err => {
        toast.error('Failed to resize event');
        console.error(err);
      });
  }; 

  // Convert ISO string to local Date object (no timezone shift)
  const toLocalDate = (isoString) => {
    const date = new Date(isoString);
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes()
    );
  };

  const expandRecurringEvents = (events) => {
    const expanded = [];
  
    events.forEach((event) => {
      const startDate = toLocalDate(event.start);
      const endDate = toLocalDate(event.end);
  
      // Always push original event
      expanded.push({
        ...event,
        start: startDate,
        end: endDate,
      });

      console.log('Full event object:', event);
  
      if (event.recurrence && event.recurrence !== 'none') {
        const recurrenceType = event.recurrence;
        const limit = new Date();
        limit.setMonth(limit.getMonth() + 2);
      
        let iteration = 1; // Skip 0th (original)

        console.log(`Expanding event ${event.title} with recurrence: ${event.recurrence}`);
      
        while (iteration < 30) {  // limit max 30 repeats
          const offsetStart = new Date(startDate);
          const offsetEnd = new Date(endDate);
      
          if (recurrenceType === 'daily') {
            offsetStart.setDate(offsetStart.getDate() + iteration);
            offsetEnd.setDate(offsetEnd.getDate() + iteration);
          } else if (recurrenceType === 'weekly') {
            offsetStart.setDate(offsetStart.getDate() + iteration * 7);
            offsetEnd.setDate(offsetEnd.getDate() + iteration * 7);
          } else if (recurrenceType === 'monthly') {
            offsetStart.setMonth(offsetStart.getMonth() + iteration);
            offsetEnd.setMonth(offsetEnd.getMonth() + iteration);
          } else if (recurrenceType === 'yearly') {
            offsetStart.setFullYear(offsetStart.getFullYear() + iteration);
            offsetEnd.setFullYear(offsetEnd.getFullYear() + iteration);
          }
      
          if (offsetStart > limit) break;
      
          expanded.push({
            ...event,
            id: `${event.id}-recurring-${iteration}`,
            start: offsetStart,
            end: offsetEnd,
          });

          // BUG FIXING - CONSOLE LOGS
          console.log(`Pushed recurrence #${iteration}`, {
            start: offsetStart,
            end: offsetEnd,
          });
          
      
          iteration++;
        }
      }      
    });

    console.log("EXPANDED EVENTS:", expanded);
  
    return expanded;
  }  
   
  if (loading) return <div>Loading events...</div>;

  return (
    <div className="columns is-variable is-6 is-multiline is-desktop">
      <div className="column is-full-touch is-two-thirds-desktop">
        <h1 className="text-2xl font-bold mb-4">Your Calendar</h1>
        <DnDCalendar
          localizer={localizer}
          events={expandRecurringEvents(events)}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          onEventDrop={handleMoveEvent}      // handle drag
          onEventResize={handleResizeEvent}  // handle resize
          resizable
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

