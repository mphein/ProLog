import { useEffect, useState } from 'react';
import api from './api';
import Login from './Login';
import CalendarPage from './CalendarPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
  };

  // Auto-check token on load
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsLoggedIn(false);
    }
  }, []);

  if (!isLoggedIn) return <Login onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Calendar</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Log Out
        </button>
      </div>

      <CalendarPage />
    </div>
  );
}

export default App;




