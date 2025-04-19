import { useEffect, useState } from 'react';
import api from './api';
import Login from './Login';

function App() {
  const [events, setEvents] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    api.get('events/')
      .then((res) => setEvents(res.data))
      .catch((err) => {
        console.error('Auth error:', err);
        handleLogout(); // If the request fails due to invalid token
      });
  }, [isLoggedIn]);

  if (!isLoggedIn) return <Login onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Events</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Log Out
        </button>
      </div>

      <ul className="space-y-2">
        {events.map((event) => (
          <li key={event.id} className="p-2 border rounded">{event.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;



