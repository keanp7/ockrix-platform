/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens and attaches user to request
 */

const { verifyToken } = require('../services/authService');
const { AuthenticationError } = require('./errorHandler');

/**
 * Middleware to require authentication
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Authorization token required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = await verifyToken(token);
    req.user = { id: decoded.userId };
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional auth middleware (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = await verifyToken(token);
      req.user = { id: decoded.userId };
    }
    
    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};

module.exports = {
  requireAuth,
  optionalAuth,
};

