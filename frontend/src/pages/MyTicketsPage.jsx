import React, { useState, useEffect } from 'react';
import { fetchMyTickets, updateTicketStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const { token, attendee } = useAuth();

  useEffect(() => {
    loadMyTickets();
  }, []);

  const loadMyTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyTickets(token);
      setTickets(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to cancel this ticket?')) return;

    setActionLoadingId(ticketId);
    setActionMessage(null);

    try {
      const result = await updateTicketStatus(ticketId, 'cancelled', token);
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, status: 'cancelled' } : t))
      );
      setActionMessage('Ticket successfully cancelled. Inventory released back to event.');
    } catch (err) {
      alert(err.message || 'Could not cancel ticket');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Booked Tickets</h1>
          <p className="page-subtitle">
            Showing tickets booked by <strong>{attendee?.name}</strong> ({attendee?.email}).
          </p>
        </div>
        <button className="btn-secondary" onClick={loadMyTickets}>
          🔄 Refresh Tickets
        </button>
      </div>

      {actionMessage && (
        <div className="alert alert-success">
          <span>✅</span>
          <span>{actionMessage}</span>
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your tickets...</p>
        </div>
      )}

      {error && !loading && (
        <div className="error-card">
          <span className="error-icon">❌</span>
          <h3>Error Fetching Tickets</h3>
          <p>{error}</p>
          <button className="btn-secondary" onClick={loadMyTickets}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {tickets.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🎟️</span>
              <h3>No tickets booked yet</h3>
              <p>Explore upcoming events and reserve your seats now.</p>
              <Link to="/events" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="tickets-grid">
              {tickets.map((ticket) => {
                const event = ticket.eventId || {};
                const attendeeInfo = ticket.attendeeId || {};
                const isCancelled = ticket.status === 'cancelled';

                return (
                  <div
                    key={ticket._id}
                    className={`ticket-card ${isCancelled ? 'ticket-cancelled' : ''}`}
                  >
                    <div className="ticket-header">
                      <span className={`status-badge status-${ticket.status}`}>
                        {ticket.status.toUpperCase()}
                      </span>
                      <span className="ticket-id">ID: {ticket._id.slice(-6)}</span>
                    </div>

                    <h3 className="ticket-event-title">{event.title || 'Untitled Event'}</h3>

                    <div className="ticket-info-grid">
                      <div className="ticket-info-item">
                        <span className="label">Event Date:</span>
                        <span className="value">
                          {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="ticket-info-item">
                        <span className="label">Venue:</span>
                        <span className="value">{event.venue || 'N/A'}</span>
                      </div>
                      <div className="ticket-info-item">
                        <span className="label">Booked By:</span>
                        <span className="value">
                          {attendeeInfo.name} ({attendeeInfo.email})
                        </span>
                      </div>
                      <div className="ticket-info-item">
                        <span className="label">Quantity:</span>
                        <span className="value quantity-highlight">
                          {ticket.quantity} {ticket.quantity === 1 ? 'Seat' : 'Seats'}
                        </span>
                      </div>
                      <div className="ticket-info-item">
                        <span className="label">Booked On:</span>
                        <span className="value">
                          {new Date(ticket.bookingDate).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="ticket-footer">
                      {ticket.status === 'booked' ? (
                        <button
                          className="btn-cancel"
                          onClick={() => handleCancelTicket(ticket._id)}
                          disabled={actionLoadingId === ticket._id}
                        >
                          {actionLoadingId === ticket._id
                            ? 'Cancelling...'
                            : 'Cancel Ticket'}
                        </button>
                      ) : (
                        <span className="cancelled-note">
                          Ticket is {ticket.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyTicketsPage;
