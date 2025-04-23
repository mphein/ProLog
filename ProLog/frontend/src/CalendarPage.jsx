import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US'; // Use import here
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
  };

  useEffect(() => {
    refreshCalendar(); // Fetch events when the component mounts
  }, []);  // Only run on component mount

  if (loading) {
    return <div>Loading events...</div>;  // Display loading message while fetching
  }
  

  return (
    <div className="columns is-variable is-6 is-multiline is-desktop">
      <div className="column is-full-touch is-two-thirds-desktop">
        <h1 className="text-2xl font-bold mb-4">Your Calendar</h1>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
        />
      </div>
      <div className="column is-full-touch is-one-third-desktop">
        {/* CreateEvent form on the right */}
        <CreateEvent onEventCreated={refreshCalendar} />
      </div>
    </div>
  );
}

export default CalendarPage;
