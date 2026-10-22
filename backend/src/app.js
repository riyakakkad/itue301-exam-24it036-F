const express = require('express');
const cors = require('cors');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(requestLogger); // Custom request logger applied globally

// Health check / Welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EventHub Ticket Booking API is live',
    version: '1.0.0',
    documentation: '/api/v1'
  });
});

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/tickets', ticketRoutes);

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: `Endpoint ${req.originalUrl} not found.`
  });
});

// Global Error Handler Middleware (Applied as last middleware)
app.use(errorHandler);

module.exports = app;
