import React, { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import { fetchEvents, bookTicket } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EventsPage = () => {
  // Task 4: Maintain three states: events, loading, and error
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Task 4: Client-side title search state
  const [searchQuery, setSearchQuery] = useState('');

  // Task 2: Booking form state - at least two state values managed meaningfully with useState
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);

  // Booking UI state
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  const { token, attendee } = useAuth();

  // Task 4: useEffect() to retrieve event information on mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch events from API');
    } finally {
      setLoading(false);
    }
  };

  // Task 4 Hint: Keep full events array in state; derive the filtered list with .filter() on render
  const filteredEvents = events.filter((ev) =>
    ev.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Open booking modal/form for an event
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setTicketQuantity(1);
    setBookingMessage(null);
    setBookingError(null);
  };

  // Submit booking form
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setBookingLoading(true);
    setBookingMessage(null);
    setBookingError(null);

    try {
      const result = await bookTicket(selectedEvent._id, ticketQuantity, token);

      // Decrement ticketsAvailable in local events state immediately
      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === selectedEvent._id
            ? { ...ev, ticketsAvailable: result.remainingTickets }
            : ev
        )
      );

      setBookingMessage(
        `Successfully booked ${ticketQuantity} ticket(s) for "${selectedEvent.title}"! View it in My Tickets.`
      );
      setSelectedEvent(null);
      setTicketQuantity(1);
    } catch (err) {
      // Meaningful validation error handling (e.g. quantity exceeding ticketsAvailable)
      setBookingError(err.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Explore Events</h1>
          <p className="page-subtitle">
            Browse upcoming university, tech, and cultural events. Book your tickets instantly.
          </p>
        </div>

        {/* Task 4: Client-side search box filtering already-fetched events by title */}
        <div className="search-box-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search events by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="btn-clear-search"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Global Booking Notifications */}
      {bookingMessage && (
        <div className="alert alert-success">
          <span>✅</span>
          <span>{bookingMessage}</span>
        </div>
      )}
      {bookingError && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{bookingError}</span>
        </div>
      )}

      {/* Task 4.1: Display loading indicator while request is in progress */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Fetching events from EventHub API...</p>
        </div>
      )}

      {/* Task 4.2: Display error message if request fails */}
      {error && !loading && (
        <div className="error-card">
          <span className="error-icon">❌</span>
          <h3>Error Loading Events</h3>
          <p>{error}</p>
          <button className="btn-secondary" onClick={loadEvents}>
            Retry Request
          </button>
        </div>
      )}

      {/* Task 4.3: Render events via EventCard after successful request */}
      {!loading && !error && (
        <>
          {filteredEvents.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🎟️</span>
              <h3>No events found matching "{searchQuery}"</h3>
              <p>Try clearing your search query or check back later.</p>
              {searchQuery && (
                <button
                  className="btn-secondary"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="events-grid">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event._id}
                  title={event.title}
                  category={event.category}
                  date={event.date}
                  venue={event.venue}
                  ticketsAvailable={event.ticketsAvailable}
                  onBook={() => handleSelectEvent(event)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Task 2: Booking Form Modal managing selectedEvent and ticketQuantity via useState */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Book Tickets</h2>
              <button
                className="btn-close-modal"
                onClick={() => setSelectedEvent(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="booking-form">
              <div className="form-info-card">
                <h3>{selectedEvent.title}</h3>
                <p>📍 {selectedEvent.venue}</p>
                <p>📅 {new Date(selectedEvent.date).toLocaleString()}</p>
                <p className="available-count">
                  Available: <strong>{selectedEvent.ticketsAvailable} tickets</strong>
                </p>
              </div>

              {bookingError && (
                <div className="alert alert-error">
                  <span>⚠️</span>
                  <span>{bookingError}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="quantity">Number of Tickets</label>
                <div className="quantity-control">
                  <button
                    type="button"
                    className="btn-qty"
                    onClick={() => setTicketQuantity((q) => Math.max(1, q - 1))}
                    disabled={ticketQuantity <= 1}
                  >
                    -
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={selectedEvent.ticketsAvailable + 5} // allows user to test validation failure
                    value={ticketQuantity}
                    onChange={(e) =>
                      setTicketQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    required
                  />
                  <button
                    type="button"
                    className="btn-qty"
                    onClick={() => setTicketQuantity((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
                <small className="form-hint">
                  Tip: Requesting more than {selectedEvent.ticketsAvailable} will trigger the 400 validation error check.
                </small>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSelectedEvent(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Confirming Booking...' : `Confirm Booking (${ticketQuantity} Ticket${ticketQuantity > 1 ? 's' : ''})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
