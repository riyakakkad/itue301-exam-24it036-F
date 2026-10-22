import React, { useState, useEffect } from 'react';
import { fetchEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Lazy-loaded Organizer Panel Component
 * Accessible only by users with role: 'organizer'
 */
const OrganizerPanel = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { attendee, token } = useAuth();

  // New Event Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [ticketsAvailable, setTicketsAvailable] = useState(50);
  const [createLoading, setCreateLoading] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(null);
  const [createError, setCreateError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateSuccess(null);
    setCreateError(null);

    try {
      const response = await fetch('/api/v1/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          category,
          date,
          venue,
          ticketsAvailable: Number(ticketsAvailable)
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create event');
      }

      setCreateSuccess(`Event "${title}" published successfully!`);
      setTitle('');
      setDate('');
      setVenue('');
      setTicketsAvailable(50);
      loadEvents();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const totalCapacity = events.reduce((acc, ev) => acc + (ev.ticketsAvailable || 0), 0);
  const soldOutCount = events.filter((ev) => ev.ticketsAvailable === 0).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <span className="badge-pill">🔒 Organizer Panel (Lazy Loaded)</span>
          <h1 className="page-title">Event & Capacity Dashboard</h1>
          <p className="page-subtitle">
            Welcome, <strong>{attendee?.name}</strong>! Manage event inventory and publish new campus events.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📅</span>
          <div className="stat-content">
            <span className="stat-value">{events.length}</span>
            <span className="stat-label">Total Events</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🎟️</span>
          <div className="stat-content">
            <span className="stat-value">{totalCapacity}</span>
            <span className="stat-label">Available Tickets</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🔥</span>
          <div className="stat-content">
            <span className="stat-value">{soldOutCount}</span>
            <span className="stat-label">Sold Out Events</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🛡️</span>
          <div className="stat-content">
            <span className="stat-value">Active</span>
            <span className="stat-label">Organizer AuthGuard</span>
          </div>
        </div>
      </div>

      <div className="dashboard-columns">
        {/* Publish Event Form */}
        <div className="dashboard-card">
          <h2>Publish New Event</h2>
          <p className="card-subtitle">
            Create an event listing with initial inventory capacity.
          </p>

          {createSuccess && (
            <div className="alert alert-success">
              <span>✅</span>
              <span>{createSuccess}</span>
            </div>
          )}
          {createError && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <span>{createError}</span>
            </div>
          )}

          <form onSubmit={handleCreateEvent} className="organizer-form">
            <div className="form-group">
              <label>Event Title</label>
              <input
                type="text"
                placeholder="e.g. AI Hackathon 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Technology">Technology</option>
                  <option value="Music">Music</option>
                  <option value="Business">Business</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Cultural">Cultural</option>
                </select>
              </div>

              <div className="form-group">
                <label>Available Tickets</label>
                <input
                  type="number"
                  min="0"
                  value={ticketsAvailable}
                  onChange={(e) => setTicketsAvailable(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Date & Time</label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Venue Location</label>
              <input
                type="text"
                placeholder="e.g. CSPIT Seminar Hall"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={createLoading}
            >
              {createLoading ? 'Publishing Event...' : 'Publish Event'}
            </button>
          </form>
        </div>

        {/* Existing Events Inventory Table */}
        <div className="dashboard-card">
          <h2>Active Inventory Tracker</h2>
          <p className="card-subtitle">
            Real-time remaining ticket counts across all published events.
          </p>

          {loading ? (
            <p>Loading events...</p>
          ) : (
            <div className="table-responsive">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Venue</th>
                    <th>Tickets Left</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev._id}>
                      <td className="font-semibold">{ev.title}</td>
                      <td>{ev.category}</td>
                      <td>{ev.venue}</td>
                      <td>{ev.ticketsAvailable}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            ev.ticketsAvailable === 0
                              ? 'status-sold-out'
                              : 'status-active'
                          }`}
                        >
                          {ev.ticketsAvailable === 0 ? 'Sold Out' : 'Available'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerPanel;
