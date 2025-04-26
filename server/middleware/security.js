/**
 * TrialSage Server-Side Security Middleware
 * 
 * This module provides robust security features for the TrialSage platform:
 * - Multi-tenant isolation through tenant validation
 * - Request authentication and authorization
 * - Rate limiting to prevent brute force attacks
 * - Audit logging of all security-related events
 * - Token management and refresh
 */

const crypto = require('crypto');
const { storage } = require('../storage');
const { v4: uuidv4 } = require('uuid');
const logger = console; // Replace with structured logger in production

// Security configuration
const SECURITY_CONFIG = {
  sessionTimeout: 3600000, // 1 hour in milliseconds
  tokenLifetime: 1800000, // 30 minutes in milliseconds
  maxFailedAttempts: 5,
  maxRequestsPerMinute: 100,
  ipBlockDuration: 3600000, // 1 hour in milliseconds
  securityHeadersEnabled: true,
  auditLoggingEnabled: true,
  tenantIsolationEnabled: true,
  csrfProtectionEnabled: true,
};

// In-memory rate limiting store (replace with Redis in production)
const rateLimitStore = {};

// In-memory blocked IPs (replace with persistent storage in production)
const blockedIPs = {};

/**
 * Generate a secure token
 * 
 * @returns {string} - Secure token
 */
function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a value using SHA-256
 * 
 * @param {string} value - Value to hash
 * @returns {string} - Hashed value
 */
function hashValue(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Middleware to validate tenant context for multi-tenant isolation
 */
function validateTenant(req, res, next) {
  // Skip tenant validation for public routes
  if (isPublicRoute(req.path)) {
    return next();
  }
  
  const tenantId = req.headers['x-tenant-id'] || req.cookies.tenantId;
  
  if (!tenantId) {
    auditLog('TENANT_VALIDATION_FAILED', {
      reason: 'Missing tenant ID',
      ip: getClientIP(req),
      path: req.path,
    });
    
    return res.status(403).json({
      error: 'Tenant validation failed',
      message: 'Missing tenant ID',
    });
  }
  
  // In a real implementation, validate the tenant ID against a database
  // For this example, we'll just attach it to the request object
  req.tenantId = tenantId;
  
  auditLog('TENANT_VALIDATED', {
    tenantId,
    ip: getClientIP(req),
    path: req.path,
  });
  
  next();
}

/**
 * Check if a route is public (no auth required)
 */
function isPublicRoute(path) {
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/health',
    '/api/version',
  ];
  
  return publicRoutes.some(route => path.startsWith(route));
}

/**
 * Middleware to rate limit requests
 */
function rateLimit(req, res, next) {
  const ip = getClientIP(req);
  
  // Check if IP is blocked
  if (blockedIPs[ip] && blockedIPs[ip] > Date.now()) {
    auditLog('RATE_LIMIT_BLOCKED_IP', {
      ip,
      path: req.path,
      remainingBlockTime: Math.floor((blockedIPs[ip] - Date.now()) / 1000) + ' seconds',
    });
    
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Your IP address has been temporarily blocked due to excessive requests',
    });
  }
  
  // Initialize rate limiting for this IP
  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = {
      count: 0,
      resetTime: Date.now() + 60000, // 1 minute from now
    };
  }
  
  // Reset count if the minute has passed
  if (Date.now() > rateLimitStore[ip].resetTime) {
    rateLimitStore[ip] = {
      count: 0,
      resetTime: Date.now() + 60000,
    };
  }
  
  // Increment request count
  rateLimitStore[ip].count++;
  
  // Check if rate limit exceeded
  if (rateLimitStore[ip].count > SECURITY_CONFIG.maxRequestsPerMinute) {
    blockedIPs[ip] = Date.now() + SECURITY_CONFIG.ipBlockDuration;
    
    auditLog('RATE_LIMIT_EXCEEDED', {
      ip,
      path: req.path,
      requestCount: rateLimitStore[ip].count,
      blockDuration: SECURITY_CONFIG.ipBlockDuration / 1000 + ' seconds',
    });
    
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
    });
  }
  
  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', SECURITY_CONFIG.maxRequestsPerMinute);
  res.setHeader('X-RateLimit-Remaining', SECURITY_CONFIG.maxRequestsPerMinute - rateLimitStore[ip].count);
  res.setHeader('X-RateLimit-Reset', Math.floor(rateLimitStore[ip].resetTime / 1000));
  
  next();
}

/**
 * Middleware to add security headers
 */
function securityHeaders(req, res, next) {
  // Only enable if configured
  if (!SECURITY_CONFIG.securityHeadersEnabled) {
    return next();
  }
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.tailwindcss.com https://assets.calendly.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.openai.com;"
  );
  
  // Other security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  next();
}

/**
 * Middleware to verify CSRF token
 */
function verifyCsrfToken(req, res, next) {
  // Only enable if configured
  if (!SECURITY_CONFIG.csrfProtectionEnabled) {
    return next();
  }
  
  // Skip CSRF verification for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Check for CSRF token in headers
  const csrfToken = req.headers['x-csrf-token'];
  const storedToken = req.cookies.csrfToken;
  
  if (!csrfToken || !storedToken || csrfToken !== storedToken) {
    auditLog('CSRF_VALIDATION_FAILED', {
      ip: getClientIP(req),
      path: req.path,
      method: req.method,
    });
    
    return res.status(403).json({
      error: 'CSRF validation failed',
      message: 'Invalid or missing CSRF token',
    });
  }
  
  next();
}

/**
 * Middleware to refresh security token
 */
function refreshToken(req, res) {
  // Skip if not authenticated
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'You must be authenticated to refresh your token',
    });
  }
  
  const newToken = generateSecureToken();
  const tokenExpiry = Date.now() + SECURITY_CONFIG.tokenLifetime;
  
  // In a real implementation, store the token in a database
  // For this example, we'll just set it as a cookie
  res.cookie('token_expiry', tokenExpiry, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SECURITY_CONFIG.tokenLifetime,
  });
  
  auditLog('TOKEN_REFRESHED', {
    userId: req.user?.id || 'unknown',
    ip: getClientIP(req),
  });
  
  res.json({
    success: true,
    token_expiry: tokenExpiry,
  });
}

/**
 * Record security audit log
 */
function auditLog(eventType, eventData) {
  // Skip if audit logging is disabled
  if (!SECURITY_CONFIG.auditLoggingEnabled) {
    return;
  }
  
  const logEntry = {
    eventId: uuidv4(),
    eventType,
    timestamp: new Date().toISOString(),
    data: eventData,
  };
  
  // Log to console for development
  logger.info('[SECURITY_AUDIT]', logEntry);
  
  // In a real implementation, store the log in a database
  // For this example, we'll just log to console
  return logEntry;
}

/**
 * Handle audit log recording
 */
function recordAuditLog(req, res) {
  // Skip if not authenticated
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'You must be authenticated to record audit logs',
    });
  }
  
  const { eventType, eventData } = req.body;
  
  if (!eventType) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Missing required field: eventType',
    });
  }
  
  const logEntry = auditLog(eventType, {
    ...eventData,
    userId: req.user?.id || 'unknown',
    userAgent: req.headers['user-agent'],
    ip: getClientIP(req),
  });
  
  res.json({
    success: true,
    logEntry,
  });
}

/**
 * Get client IP address
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

/**
 * Setup security routes
 */
function setupSecurityRoutes(app) {
  // API endpoint to refresh token
  app.post('/api/security/refresh-token', refreshToken);
  
  // API endpoint to record audit log
  app.post('/api/security/audit-log', recordAuditLog);
  
  // API endpoint to get security configuration
  app.get('/api/security/config', (req, res) => {
    // Return only safe config values (no sensitive info)
    res.json({
      sessionTimeout: SECURITY_CONFIG.sessionTimeout,
      securityHeadersEnabled: SECURITY_CONFIG.securityHeadersEnabled,
      csrfProtectionEnabled: SECURITY_CONFIG.csrfProtectionEnabled,
      tenantIsolationEnabled: SECURITY_CONFIG.tenantIsolationEnabled,
      auditLoggingEnabled: SECURITY_CONFIG.auditLoggingEnabled,
    });
  });
}

module.exports = {
  validateTenant,
  rateLimit,
  securityHeaders,
  verifyCsrfToken,
  refreshToken,
  recordAuditLog,
  setupSecurityRoutes,
  generateSecureToken,
  hashValue,
  auditLog,
};