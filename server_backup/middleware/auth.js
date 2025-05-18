/**
 * Authentication and Authorization Middleware
 * 
 * This module provides middleware for JWT authentication,
 * role-based access control (RBAC), and permission validation.
 */

const jwt = require('jsonwebtoken');
const config = require('../config/environment').config;
const { createLogger } = require('../utils/monitoring');

const logger = createLogger('auth');

/**
 * Verify JWT token and attach user to request
 */
const authenticateJWT = (req, res, next) => {
  // Skip authentication for public routes
  if (isPublicRoute(req.path)) {
    return next();
  }

  // Get the authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Authentication required' 
    });
  }
  
  // Extract the token
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify the token with appropriate secret for current environment
    const user = jwt.verify(token, config.jwt.secret);
    
    // Attach user to request
    req.user = user;
    
    // Log authentication success
    logger.debug('User authenticated', { 
      userId: user.id, 
      username: user.username,
      roles: user.roles 
    });
    
    next();
  } catch (error) {
    logger.warn('Authentication failed', { error: error.message });
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Token expired' 
      });
    }
    
    return res.status(401).json({ 
      status: 'error', 
      message: 'Invalid token' 
    });
  }
};

/**
 * Check if user has the required role
 */
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    // If not authenticated, deny access
    if (!req.user) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Authentication required' 
      });
    }
    
    // Get user roles from JWT payload
    const userRoles = req.user.roles || [];
    
    // Check if user has the required role or admin role
    if (userRoles.includes(requiredRole) || userRoles.includes('admin')) {
      return next();
    }
    
    // Log authorization failure
    logger.warn('Authorization failed: insufficient role', { 
      userId: req.user.id, 
      requiredRole, 
      userRoles 
    });
    
    return res.status(403).json({ 
      status: 'error', 
      message: 'Access denied: insufficient permissions' 
    });
  };
};

/**
 * Check if user has permission for a specific resource
 * This is more fine-grained than role-based checks
 */
const requirePermission = (resource, action) => {
  return (req, res, next) => {
    // If not authenticated, deny access
    if (!req.user) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Authentication required' 
      });
    }
    
    // Get user permissions from JWT payload
    const userPermissions = req.user.permissions || {};
    
    // Get resource permissions
    const resourcePermissions = userPermissions[resource] || [];
    
    // Check if user has the required permission or has wildcard permission
    if (resourcePermissions.includes(action) || resourcePermissions.includes('*')) {
      return next();
    }
    
    // Log authorization failure
    logger.warn('Authorization failed: insufficient permission', { 
      userId: req.user.id, 
      resource, 
      action, 
      userPermissions 
    });
    
    return res.status(403).json({ 
      status: 'error', 
      message: `Access denied: ${action} permission required for ${resource}` 
    });
  };
};

/**
 * Middleware to ensure user belongs to the organization
 * This enforces tenant isolation at the application level
 */
const requireSameOrganization = (req, res, next) => {
  // If not authenticated, deny access
  if (!req.user) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Authentication required' 
    });
  }
  
  // Get organization ID from request (set by tenantContext middleware)
  const organizationId = req.organizationId;
  
  // If no organization ID in request, skip this check
  if (!organizationId) {
    return next();
  }
  
  // Check if user belongs to the organization
  if (req.user.organizationId !== organizationId && !req.user.roles.includes('admin')) {
    logger.warn('Cross-tenant access attempt blocked', { 
      userId: req.user.id, 
      userOrganizationId: req.user.organizationId,
      requestedOrganizationId: organizationId 
    });
    
    return res.status(403).json({ 
      status: 'error', 
      message: 'Access denied: resource belongs to a different organization' 
    });
  }
  
  next();
};

/**
 * Check if route is public (no authentication required)
 */
const isPublicRoute = (path) => {
  const publicRoutes = [
    '/api/health', 
    '/health',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/api/public'
  ];
  
  // Check if path starts with any public route
  return publicRoutes.some(route => path.startsWith(route));
};

module.exports = {
  authenticateJWT,
  requireRole,
  requirePermission,
  requireSameOrganization,
  isPublicRoute
};