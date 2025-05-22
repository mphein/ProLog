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

import './CalendarPage.css';

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
  const [view, setView] = useState('month'); // default view
  const [currentDate, setCurrentDate] = useState(new Date()); // Track current date
  const [inboxOpen, setInboxOpen] = useState(false);
  const [invitations, setInvitations] = useState([]);


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
          recurrence: event.recurrence,
          shared: event.invited_users_data.length > 0, 
          invited_users: event.invited_users_data,
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

  useEffect(() => {
    if (inboxOpen) {
      api.get('/invitations/pending/')
        .then((res) => setInvitations(res.data))
        .catch(() => toast.error('Failed to load invitations.'));
    }
  }, [inboxOpen]);

  const respondToInvite = (id, isAccepted) => {
    api
      .patch(`/invitations/${id}/respond/`, {
        is_accepted: isAccepted,
        responded: true,
      })

      .then(() => {
        toast.success(isAccepted ? 'Accepted!' : 'Declined!');
        setInvitations((prev) => prev.filter((inv) => inv.id !== id));
        refreshCalendar(); // so accepted events appear
      })

      .catch(() => toast.error('Failed to respond to invite.'));
  };

  
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

    const invitedUserIds = selectedEvent.invited_users
      ? selectedEvent.invited_users.map((user) => user.id)
      : [];

    api
      .patch(`events/${selectedEvent.id}/update/`, {
        title: selectedEvent.title,
        start_time: selectedEvent.start,
        end_time: selectedEvent.end,
        description: selectedEvent.description,
        location: selectedEvent.location,
        invited_users: invitedUserIds,
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

    const invitedUserIds = event.invited_users ? event.invited_users.map((u) => u.id) : [];

    api.patch(`events/${event.id}/update/`, {
      start_time: start.toISOString().slice(0, 16),
      end_time: end.toISOString().slice(0, 16),
      invited_users: invitedUserIds,
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

    const invitedUserIds = event.invited_users ? event.invited_users.map((u) => u.id) : [];

    api.patch(`events/${event.id}/update/`, {
      start_time: start.toISOString().slice(0, 16),
      end_time: end.toISOString().slice(0, 16),
      invited_users: invitedUserIds,
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
        eventPropGetter={(event) => ({
          className: event.shared ? 'shared-event' : ''
        })}
        onSelectEvent={handleSelectEvent}
        onEventDrop={handleMoveEvent}
        onEventResize={handleResizeEvent}
        resizable
        view={view}
        onView={setView}
        date={currentDate}
        onNavigate={(date) => setCurrentDate(date)}
        views={['month', 'week', 'day']}
        scrollToTime={new Date()}
        style={{ height: 600 }}
      />
    </div>
    <div className="column is-full-touch is-one-third-desktop">
      {!showEditor && <CreateEvent onEventCreated={refreshCalendar} />}
    </div>

    {/* 🔥 MODAL START */}
    {showEditor && selectedEvent && (
      <div className={`modal ${showEditor ? 'is-active' : ''}`}>
        <div
          className="modal-background"
          onClick={() => setShowEditor(false)}
        ></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">
              {readOnlyMode ? 'Event Details' : 'Edit Event'}
            </p>
            <button
              className="delete"
              aria-label="close"
              onClick={() => setShowEditor(false)}
            ></button>
          </header>

          <section className="modal-card-body">
            {/* 🔁 Fields */}
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

            {/* 🔥 NEW: Invited Users Display */}
            <div className="field">
              <label className="label">Invited Users</label>
              <div className="control">
                <div className="select is-multiple is-fullwidth">
                  <select
                    multiple
                    readOnly={readOnlyMode}
                    value={selectedEvent.invited_users ? selectedEvent.invited_users.map((u) => u.id) : []}
                  >
                    {selectedEvent.invited_users && selectedEvent.invited_users.length > 0 ? (
                      selectedEvent.invited_users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username} - {user.email}
                        </option>
                      ))
                    ) : (
                      <option>No users invited.</option>
                    )}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <footer className="modal-card-foot">
            {readOnlyMode ? (
              <>
                <button
                  className="button is-info"
                  onClick={() => setReadOnlyMode(false)}
                >
                  Edit
                </button>
                <button className="button is-danger" onClick={handleDelete}>
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  className="button is-primary"
                  onClick={handleUpdateSubmit}
                >
                  Save
                </button>
                <button
                  className="button"
                  onClick={() => {
                    setReadOnlyMode(true);
                    setShowEditor(false);
                    setSelectedEvent(null);
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </footer>
        </div>
      </div>
    )}
    {/* 🔥 MODAL END */}
    {/* 📨 Inbox Toggle Button */}
    <button
      onClick={() => setInboxOpen(!inboxOpen)}
      className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded shadow"
    >
      {inboxOpen ? 'Close Inbox' : 'Open Inbox'}
    </button>

    {/* 📨 Inbox Panel */}
    {inboxOpen && (
      <div className="fixed top-0 right-0 w-80 h-full bg-white border-l shadow-lg z-40 overflow-y-auto p-4">
        <h2 className="text-lg font-bold mb-4">Invitations</h2>
        {invitations.length === 0 ? (
          <p>No pending invites.</p>
        ) : (
          invitations.map((inv) => (
            <div key={inv.id} className="mb-4 p-2 border rounded">
              <p className="font-semibold">{inv.event.title}</p>
              <p className="text-sm text-gray-600">
                {new Date(inv.event.start_time).toLocaleString()}
              </p>
              <div className="mt-2 space-x-2">
                <button
                  className="button is-small is-success"
                  onClick={() => respondToInvite(inv.id, true)}
                >
                  Accept
                </button>
                <button
                  className="button is-small is-danger"
                  onClick={() => respondToInvite(inv.id, false)}
                >
                  Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    )}
  </div>
);

}

export default CalendarPage;

