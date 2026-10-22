const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const Attendee = require('../models/Attendee');
const { getMongoStatus } = require('../config/db');
const { inMemoryData, generateId } = require('../config/inMemoryDb');

/**
 * @route   POST /api/v1/tickets
 * @desc    Book tickets for an event (protected)
 * @access  Protected (Attendee)
 */
const bookTicket = async (req, res, next) => {
  try {
    const { eventId, quantity } = req.body;
    const attendeeId = req.user.id;

    // Validate request inputs
    if (!eventId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'eventId and quantity are required.'
      });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer (at least 1).'
      });
    }

    if (getMongoStatus()) {
      // 1. Check availability with findById before Ticket.create() (as required by Hint)
      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event ID format.'
        });
      }

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found.'
        });
      }

      // Check if requested quantity exceeds availability (never let count go negative)
      if (event.ticketsAvailable < qty) {
        return res.status(400).json({
          success: false,
          message: `Booking failed: only ${event.ticketsAvailable} ticket(s) available, but ${qty} requested.`
        });
      }

      // 2. Create the ticket document
      const newTicket = await Ticket.create({
        attendeeId,
        eventId,
        quantity: qty,
        status: 'booked',
        bookingDate: new Date()
      });

      // 3. Update the event with findByIdAndUpdate, decrementing ticketsAvailable atomically
      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $inc: { ticketsAvailable: -qty } },
        { new: true, runValidators: true }
      );

      // Populate references for the response
      await newTicket.populate([
        { path: 'attendeeId', select: 'name email' },
        { path: 'eventId', select: 'title date venue' }
      ]);

      return res.status(201).json({
        success: true,
        message: 'Tickets booked successfully',
        ticket: newTicket,
        remainingTickets: updatedEvent.ticketsAvailable
      });
    } else {
      // In-Memory Fallback Implementation
      const event = inMemoryData.events.find(
        (e) => e._id.toString() === eventId.toString()
      );

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found.'
        });
      }

      if (event.ticketsAvailable < qty) {
        return res.status(400).json({
          success: false,
          message: `Booking failed: only ${event.ticketsAvailable} ticket(s) available, but ${qty} requested.`
        });
      }

      // Decrement inventory
      event.ticketsAvailable -= qty;
      event.updatedAt = new Date();

      const attendee = inMemoryData.attendees.find(
        (a) => a._id.toString() === attendeeId.toString()
      ) || {
        _id: attendeeId,
        name: req.user.name,
        email: req.user.email
      };

      const newTicket = {
        _id: generateId(),
        attendeeId: {
          _id: attendee._id,
          name: attendee.name,
          email: attendee.email
        },
        eventId: {
          _id: event._id,
          title: event.title,
          date: event.date,
          venue: event.venue
        },
        quantity: qty,
        status: 'booked',
        bookingDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      inMemoryData.tickets.push(newTicket);

      return res.status(201).json({
        success: true,
        message: 'Tickets booked successfully',
        ticket: newTicket,
        remainingTickets: event.ticketsAvailable
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/tickets/my
 * @desc    Return the attendee's own tickets (protected)
 * @access  Protected (Attendee)
 */
const getMyTickets = async (req, res, next) => {
  try {
    const attendeeId = req.user.id;

    if (getMongoStatus()) {
      // Use .populate('attendeeId', 'name email') and .populate('eventId', 'title date venue')
      const tickets = await Ticket.find({ attendeeId })
        .populate('attendeeId', 'name email')
        .populate('eventId', 'title date venue')
        .sort({ bookingDate: -1 });

      return res.status(200).json({
        success: true,
        count: tickets.length,
        tickets
      });
    } else {
      const tickets = inMemoryData.tickets
        .filter((t) => {
          const tAttId =
            typeof t.attendeeId === 'object'
              ? t.attendeeId._id.toString()
              : t.attendeeId.toString();
          return tAttId === attendeeId.toString();
        })
        .map((t) => {
          let att = t.attendeeId;
          if (typeof att !== 'object' || !att.name) {
            const foundAtt = inMemoryData.attendees.find(
              (a) => a._id.toString() === att.toString()
            );
            att = foundAtt
              ? { _id: foundAtt._id, name: foundAtt.name, email: foundAtt.email }
              : { _id: attendeeId, name: req.user.name, email: req.user.email };
          }

          let ev = t.eventId;
          if (typeof ev !== 'object' || !ev.title) {
            const foundEv = inMemoryData.events.find(
              (e) => e._id.toString() === ev.toString()
            );
            ev = foundEv
              ? {
                  _id: foundEv._id,
                  title: foundEv.title,
                  date: foundEv.date,
                  venue: foundEv.venue
                }
              : { _id: t.eventId, title: 'Unknown Event', date: new Date(), venue: 'N/A' };
          }

          return {
            ...t,
            attendeeId: att,
            eventId: ev
          };
        })
        .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

      return res.status(200).json({
        success: true,
        count: tickets.length,
        tickets
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/v1/tickets/:id/status
 * @desc    Update ticket status (protected)
 * @access  Protected
 */
const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['booked', 'cancelled', 'used'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    if (getMongoStatus()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ticket ID format.'
        });
      }

      const ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found.'
        });
      }

      // Check ownership unless organizer/admin
      if (
        req.user.role !== 'organizer' &&
        req.user.role !== 'admin' &&
        ticket.attendeeId.toString() !== req.user.id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: you cannot modify another attendee’s ticket.'
        });
      }

      const prevStatus = ticket.status;
      ticket.status = status;
      await ticket.save();

      // If cancelling a booked ticket, release inventory back
      if (prevStatus === 'booked' && status === 'cancelled') {
        await Event.findByIdAndUpdate(ticket.eventId, {
          $inc: { ticketsAvailable: ticket.quantity }
        });
      }

      await ticket.populate([
        { path: 'attendeeId', select: 'name email' },
        { path: 'eventId', select: 'title date venue' }
      ]);

      return res.status(200).json({
        success: true,
        message: `Ticket status successfully updated to '${status}'.`,
        ticket
      });
    } else {
      const ticket = inMemoryData.tickets.find((t) => t._id.toString() === id.toString());
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found.'
        });
      }

      const tAttId =
        typeof ticket.attendeeId === 'object'
          ? ticket.attendeeId._id.toString()
          : ticket.attendeeId.toString();

      if (
        req.user.role !== 'organizer' &&
        req.user.role !== 'admin' &&
        tAttId !== req.user.id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: you cannot modify another attendee’s ticket.'
        });
      }

      const prevStatus = ticket.status;
      ticket.status = status;
      ticket.updatedAt = new Date();

      // Release tickets back if cancelled
      if (prevStatus === 'booked' && status === 'cancelled') {
        const evId =
          typeof ticket.eventId === 'object'
            ? ticket.eventId._id.toString()
            : ticket.eventId.toString();
        const event = inMemoryData.events.find((e) => e._id.toString() === evId);
        if (event) {
          event.ticketsAvailable += ticket.quantity;
        }
      }

      return res.status(200).json({
        success: true,
        message: `Ticket status successfully updated to '${status}'.`,
        ticket
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookTicket,
  getMyTickets,
  updateTicketStatus
};
