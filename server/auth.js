/**
 * Authentication utilities for the RegIntel API
 * 
 * This module provides JWT authentication functions for the Express application.
 */
const jwt = require('jsonwebtoken');

// JWT secret - in production, use an environment variable
const JWT_SECRET = process.env.JWT_SECRET_KEY || 'regintel_development_key';

/**
 * Middleware to authenticate JWT tokens
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function authenticateToken(req, res, next) {
  // Get the authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    // Also check localStorage token set via frontend JavaScript
    const localToken = req.cookies && req.cookies.authToken;
    if (!localToken) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
  }
  
  // Use either the Authorization header token or localStorage token
  const tokenToVerify = token || req.cookies.authToken;
  
  jwt.verify(tokenToVerify, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err.message);
      return res.status(403).json({ error: 'Forbidden - Invalid token' });
    }
    
    // Add user data to request
    req.user = {
      id: decoded.user_id,
      username: decoded.username,
      tenant_id: decoded.tenant_id || 'default',
    };
    
    next();
  });
}

/**
 * Generate a JWT token for a user
 * 
 * @param {Object} user - User object
 * @param {number} expiresIn - Token expiration time in seconds (default: 24 hours)
 * @returns {string} - JWT token
 */
function generateToken(user, expiresIn = 60 * 60 * 24) {
  return jwt.sign(
    {
      sub: String(user.id),
      user_id: user.id,
      username: user.username,
      tenant_id: user.tenant_id || 'default',
    },
    JWT_SECRET,
    { expiresIn }
  );
}

module.exports = {
  authenticateToken,
  generateToken,
};