import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
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

  return (
    <Router>
      <Routes>
        {/* Home route redirects based on login status */}
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

        {/* Calendar (protected route) */}
        <Route
          path="/calendar"
          element={
            isLoggedIn ? (
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