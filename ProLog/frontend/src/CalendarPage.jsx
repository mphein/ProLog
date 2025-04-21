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

  useEffect(() => {
    api.get('events/')
      .then(res => {
        const formatted = res.data.map(event => ({
          title: event.title,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
        }));
        setEvents(formatted);
      })
      .catch(err => {
        console.error('Failed to load events:', err);
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Calendar</h1>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
      />
    </div>
  );
}

export default CalendarPage;
