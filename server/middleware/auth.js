import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';

/**
 * JWT Authentication Middleware
 * Verifies JWT tokens from the Authorization header
 * Adds decoded user info to req.user
 */
export const verifyJwt = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  // Check if token exists
  if (!token) {
    return res.status(401).json({ 
      message: 'Access denied. No token provided.' 
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role, tenantId }
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({ 
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Role-based Authorization Middleware
 * Verifies the user has required role(s)
 * @param {string[]} roles - Array of allowed roles
 */
export const requireRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied. Insufficient permissions.'
      });
    }
    
    next();
  };
};

/**
 * Generate JWT token for user
 * @param {Object} user - User object with id, role, tenantId
 * @param {string} expiresIn - Token expiration time (default: 24h)
 * @returns {string} JWT token
 */
export const generateToken = (user, expiresIn = '24h') => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role || 'user',
      tenantId: user.tenantId || user.tenant_id || user.id
    },
    JWT_SECRET,
    { expiresIn }
  );
};

/**
 * For demo purposes, generate a mock token
 * @returns {string} Mock JWT token
 */
export const generateMockToken = () => {
  const mockUser = {
    id: '123456',
    role: 'user',
    tenantId: '123456'
  };
  
  return generateToken(mockUser, '1h');
};