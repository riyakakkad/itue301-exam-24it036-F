const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Event date is required']
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true
    },
    ticketsAvailable: {
      type: Number,
      required: [true, 'Tickets available count is required'],
      min: [0, 'ticketsAvailable cannot be negative']
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative']
    },
    description: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Event', eventSchema);
