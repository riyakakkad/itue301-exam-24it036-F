const express = require('express');
const router = express.Router();
const { getAllEvents, createEvent } = require('../controllers/eventController');
const { authGuard, requireRole } = require('../middleware/authGuard');

// GET /api/v1/events is public as specified in the question paper
router.get('/', getAllEvents);

// POST /api/v1/events is protected for organizer / admin
router.post('/', authGuard, requireRole('organizer', 'admin'), createEvent);

module.exports = router;
