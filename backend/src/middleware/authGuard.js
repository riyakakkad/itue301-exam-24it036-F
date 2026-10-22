const jwt = require('jsonwebtoken');

/**
 * Custom authGuard middleware
 * Validates the Bearer token and returns 401 if missing or invalid.
 * Applied to protected routes (tickets, organizer, etc.).
 */
const authGuard = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Missing or invalid Bearer token.'
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Token is empty.'
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'eventhub_super_secret_jwt_key_2026';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Token is invalid or expired.'
    });
  }
};

/**
 * Role-based authorization middleware helper
 * Allows checking specific roles like 'organizer' or 'admin'
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user.role}' does not have permission to access this resource.`
      });
    }

    next();
  };
};

module.exports = {
  authGuard,
  requireRole
};
