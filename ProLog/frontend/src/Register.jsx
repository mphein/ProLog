import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';

function Register({ onRegister }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate()

    const handleRegister = async (e) => {
        e.preventDefault()
        try {
            await axios.post('http://localhost:8000/api/register/', {
                username,
                password,
                email,
            });
            toast.success('Account created! You can now log in');
            navigate('/login');
        } catch (err) {
            toast.error('Registration failed.');
            console.error(err)
        }
    };

    return (
        <form onSubmit={handleRegister} className="p-4 space-y-2">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 w-full"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full"
          />
          <button type="submit" className="bg-green-500 text-white p-2 rounded">
            Create Account
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm text-blue-500 mt-2"
          >
            Already have an account? Log In
          </button>
        </form>
      );
    }
    
export default Register;