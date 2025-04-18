import { useEffect, useState } from 'react'
import axios from 'axios';
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/calendar/api/events/')
      .then(res => {
        setEvents(res.data);
        console.log(res.data); // This prints response in your browser console
      })
      .catch(err => {
        console.error('API error:', err);
      });
  }, []);

  return (
    <div>
      <h1>Events</h1>
      <ul>
        {events.map(event => (
          <li key={event.id}>{event.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
