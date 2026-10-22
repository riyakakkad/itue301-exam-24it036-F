const Event = require('../models/Event');
const { getMongoStatus } = require('../config/db');
const { inMemoryData, generateId } = require('../config/inMemoryDb');

/**
 * @route   GET /api/v1/events
 * @desc    Return all events (public)
 * @access  Public
 */
const getAllEvents = async (req, res, next) => {
  try {
    let events = [];

    if (getMongoStatus()) {
      events = await Event.find().sort({ date: 1 });
    } else {
      events = [...inMemoryData.events].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
    }

    return res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/events
 * @desc    Create a new event
 * @access  Protected (Organizer / Admin)
 */
const createEvent = async (req, res, next) => {
  try {
    const { title, category, date, venue, ticketsAvailable, price, description } = req.body;

    if (!title || !date || !venue || ticketsAvailable === undefined) {
      return res.status(400).json({
        success: false,
        message: 'title, date, venue, and ticketsAvailable are required fields.'
      });
    }

    if (Number(ticketsAvailable) < 0) {
      return res.status(400).json({
        success: false,
        message: 'ticketsAvailable cannot be negative.'
      });
    }

    if (getMongoStatus()) {
      const newEvent = await Event.create({
        title,
        category: category || 'General',
        date,
        venue,
        ticketsAvailable: Number(ticketsAvailable),
        price: Number(price || 0),
        description: description || ''
      });

      return res.status(201).json({
        success: true,
        message: 'Event created successfully',
        event: newEvent
      });
    } else {
      const newEvent = {
        _id: generateId(),
        title,
        category: category || 'General',
        date: new Date(date),
        venue,
        ticketsAvailable: Number(ticketsAvailable),
        price: Number(price || 0),
        description: description || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryData.events.push(newEvent);

      return res.status(201).json({
        success: true,
        message: 'Event created successfully',
        event: newEvent
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEvents,
  createEvent
};
