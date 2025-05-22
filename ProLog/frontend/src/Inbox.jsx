// Inbox.jsx
import React, { useEffect, useState } from 'react';
import api from './api';
import { toast } from 'react-toastify';

const Inbox = () => {
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = () => {
    api.get('/invitations/pending/')
      .then((res) => {
        setInvitations(res.data);
      })
      .catch((err) => {
        toast.error('Failed to fetch invitations.');
      });
  };

  const respondToInvite = (id, isAccepted) => {
    api.patch(`/invitations/${id}/respond/`, {
      is_accepted: isAccepted,
      responded: true,
    })
      .then(() => {
        toast.success(isAccepted ? 'Accepted!' : 'Declined.');
        fetchInvitations();  // Refresh list
      })
      .catch(() => toast.error('Failed to respond.'));
  };

  return (
    <div className="container mt-4">
      <h1 className="title is-4">Pending Invitations</h1>

      {invitations.length === 0 ? (
        <p>No pending invitations.</p>
      ) : (
        <div className="box">
          {invitations.map((inv) => (
            <div key={inv.id} className="mb-4">
              <p><strong>Event:</strong> {inv.event.title}</p>
              <p><strong>Time:</strong> {new Date(inv.event.start_time).toLocaleString()}</p>
              <div className="buttons mt-2">
                <button className="button is-success" onClick={() => respondToInvite(inv.id, true)}>
                  Accept
                </button>
                <button className="button is-danger" onClick={() => respondToInvite(inv.id, false)}>
                  Decline
                </button>
              </div>
              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inbox;
