import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import CalendarPage from './CalendarPage';
import CreateEvent from './CreateEvent';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Redirect based on login */}
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/calendar" /> : <Navigate to="/login" />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/calendar" />
            ) : (
              <Login onLogin={() => setIsLoggedIn(true)} />
            )
          }
        />

        {/* Register */}
        <Route
          path="/register"
          element={
            isLoggedIn ? (
              <Navigate to="/calendar" />
            ) : (
              <Register onRegister={() => setIsLoggedIn(true)} />
            )
          }
        />

        {/* Calendar */}
        <Route
          path="/calendar"
          element={
            isLoggedIn ? (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-xl font-bold">Calendar</h1>
                  <div className="space-x-2">
                    <Link to="/create-event" className="bg-green-500 text-white px-3 py-1 rounded">
                      + Create Event
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
                <CalendarPage />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Create Event */}
        <Route
          path="/create-event"
          element={
            isLoggedIn ? (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-xl font-bold">Create Event</h1>
                  <div className="space-x-2">
                    <Link to="/calendar" className="bg-blue-500 text-white px-3 py-1 rounded">
                      ← Calendar
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
                <CreateEvent />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
