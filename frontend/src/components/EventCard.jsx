import React from 'react';

/**
 * Task 1: Reusable EventCard Component
 * Accepts the five required props:
 * 1. title
 * 2. category
 * 3. date
 * 4. venue
 * 5. ticketsAvailable
 *
 * Displays all five values.
 * Conditional check: If ticketsAvailable is 0, renders a "Sold Out" badge instead of a "Book" button.
 */
const EventCard = ({ title, category, date, venue, ticketsAvailable, onBook }) => {
  // Hint from Question Paper: keep the sold-out check as a simple conditional at the top
  const isSoldOut = ticketsAvailable === 0 || ticketsAvailable <= 0;

  // Format date nicely
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`event-card ${isSoldOut ? 'event-sold-out' : ''}`}>
      <div className="event-card-header">
        <span className="event-category">{category || 'General'}</span>
        <span className={`inventory-tag ${isSoldOut ? 'tag-sold-out' : 'tag-available'}`}>
          {isSoldOut ? 'Sold Out' : `${ticketsAvailable} tickets left`}
        </span>
      </div>

      <h3 className="event-title">{title}</h3>

      <div className="event-details">
        <div className="detail-item">
          <span className="detail-icon">📅</span>
          <span className="detail-text">{formattedDate}</span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">📍</span>
          <span className="detail-text">{venue}</span>
        </div>
      </div>

      <div className="event-card-footer">
        {/* Conditional rendering required by Task 1 */}
        {isSoldOut ? (
          <span className="sold-out-badge">Sold Out</span>
        ) : (
          <button
            type="button"
            className="btn-book"
            onClick={() => onBook && onBook()}
          >
            Book Tickets
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;
