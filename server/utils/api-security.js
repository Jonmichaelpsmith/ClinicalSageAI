/**
 * API Security Utilities
 * 
 * This module provides security-related utilities for API endpoints.
 */

/**
 * Middleware to check if OpenAI API key is set
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function checkForOpenAIKey(req, res, next) {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: 'OpenAI API key not configured',
      message: 'Please set the OPENAI_API_KEY environment variable to use this feature.'
    });
  }
  next();
}

/**
 * Middleware to check if API route requires authentication
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function requireAuth(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access this resource.'
    });
  }
  next();
}

/**
 * Middleware to check if user has required role
 * 
 * @param {string|Array} roles - Required role(s)
 * @returns {Function} - Express middleware function
 */
export function requireRole(roles) {
  const roleList = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource.'
      });
    }
    
    if (!roleList.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this resource.'
      });
    }
    
    next();
  };
}

export default {
  checkForOpenAIKey,
  requireAuth,
  requireRole
};