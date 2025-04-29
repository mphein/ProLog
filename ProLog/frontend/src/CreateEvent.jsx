import { useState } from 'react';
import api from './api';
import { toast } from 'react-toastify';

function CreateEvent({ onEventCreated }) {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const token = localStorage.getItem('access_token')

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send POST request with JWT token
      const response = await api.post('events/create', {
        title,
        start_time: start,
        end_time: end,
        description,
        location,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,  // Send the JWT token in the Authorization header
        },
      });
  
      toast.success('Event created!');
      setTitle('');
      setStart('');
      setEnd('');
      setDescription('');
      setLocation('');
      if (onEventCreated) {
        onEventCreated();
      }
    } catch (err) {
      console.error('Request failed:', err);
      if (err.response) {
        console.error('Error details:', err.response.data);
        setError(err.response.data);
      } else {
        setError('Something went wrong.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="box" style={{ margin: 'auto auto' }}>
      <h2 className="title is-4">Create Event</h2>

      <div className = "field">
        <label className="label">Event Title</label>
        <div className="control">
          <input
            type="text"
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>  
      </div>

      <div className="field">
        <label className="label">Start Time</label>
        <div className="control">
          <input
            className="input"
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="field">
        <label className="label">End Time</label>
        <div className="control">
          <input
            className="input"
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="field">
        <label className="label">Description (optional)</label>
        <div className="control">
          <input
            className="input"
            type="text"
            placeholder="Optional description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label className="label">Location (optional)</label>
        <div className="control">
          <input
            className="input"
            type="text"
            placeholder="Optional location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="help is-danger">{error}</p>}

      <div className="field is-grouped is-grouped-right">
        <div className="control">
          <button type="submit" className="button is-primary">
            Create Event
          </button>
        </div>
      </div>
    </form>
  );
}

export default CreateEvent;
