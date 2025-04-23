import { useState } from 'react';
import api from './api';

function CreateEvent({ onEventCreated }) {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('events/', {
        title,
        start_time: start,
        end_time: end,
      });

      alert('Event created!');
      setTitle('');
      setStart('');
      setEnd('');
      onEventCreated?.();
    } catch (err) {
      setError('Error creating event');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold">Create Event</h2>

      <input
        type="text"
        placeholder="Event title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />

      <input
        type="datetime-local"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />

      <input
        type="datetime-local"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />

      {error && <p className="text-red-500">{error}</p>}

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Create Event
      </button>
    </form>
  );
}

export default CreateEvent;
