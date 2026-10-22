/**
 * Global Error-Handling Middleware
 * Returns structured JSON responses instead of raw stack traces.
 * Handles Mongoose validation errors, duplicate key errors, CastErrors, etc.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode || 500;
  if (statusCode === 200) statusCode = 500;

  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle Mongoose Validation Error (demonstrate meaningful JSON error)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error: Invalid input data provided.';
    errors = Object.values(err.errors).map((val) => val.message);
  }

  // Handle Mongoose Duplicate Key Error (e.g. unique email)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value error: ${field} '${err.keyValue[field]}' already exists.`;
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found: invalid ID format '${err.value}'.`;
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    errors: errors || undefined
  });
};

module.exports = errorHandler;
