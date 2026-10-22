const express = require('express');
const router = express.Router();
const {
  bookTicket,
  getMyTickets,
  updateTicketStatus
} = require('../controllers/ticketController');
const { authGuard } = require('../middleware/authGuard');

// All ticket routes are protected by authGuard as specified
router.post('/', authGuard, bookTicket);
router.get('/my', authGuard, getMyTickets);
router.patch('/:id/status', authGuard, updateTicketStatus);

module.exports = router;
