import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:8000/api/token/', {
        username,
        password,
      });

      const { access, refresh } = res.data;

      // Save tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // Call parent login handler (optional)
      onLogin?.();

      alert('Login successful!');
    } catch (err) {
      alert('Login failed. Check your credentials.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-2">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border p-2 w-full"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Log In
      </button>
      <button
        type="button"
        onClick={() => navigate('/register')}
        className="text-sm text-blue-500 mt-2"
      >
        Don’t have an account? Sign up
      </button>
    </form>
  );
}

export default Login;
