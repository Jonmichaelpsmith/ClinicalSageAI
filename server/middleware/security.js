/**
 * TrialSage Security Middleware
 * 
 * Implements enterprise-grade security features:
 * - Multi-tenant validation
 * - Content Security Policy (CSP)
 * - Cross-Site Request Forgery (CSRF) protection
 * - Rate limiting
 * - Data encryption validation
 * - Integrity checks for document operations
 */

const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');

// Multi-tenant validator middleware
const validateTenant = (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'] || req.query.tenantId || (req.body && req.body.tenantId);
  
  if (!tenantId) {
    return res.status(400).json({
      error: 'Missing tenant identifier',
      code: 'TENANT_REQUIRED',
      message: 'A valid tenant identifier is required for all operations'
    });
  }

  // Add validated tenant to request object
  req.tenant = {
    id: tenantId,
    validated: true,
    timestamp: new Date().toISOString()
  };

  // Add tenant context to all subsequent operations
  const originalSend = res.send;
  res.send = function(data) {
    // Add audit log entry for tenant operations
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[AUDIT] ${new Date().toISOString()} - TenantID: ${tenantId} - Operation: ${req.method} ${req.originalUrl}`);
    }
    
    return originalSend.call(this, data);
  };

  next();
};

// Content Security Policy configuration
const configureHelmet = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdn.trialsage.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://cdn.trialsage.com"],
        connectSrc: ["'self'", "https://*.trialsage.com", "https://api.openai.com", 
                    "https://fda.gov", "https://clinicaltrials.gov"],
      },
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: 'same-origin' }
  });
};

// Rate limiting configuration for API endpoints
const configureRateLimit = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // limit each IP to 300 requests per windowMs
    message: {
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'You have exceeded the request limit. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Document integrity verification middleware
const verifyDocumentIntegrity = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.path.includes('/api/documents')) {
    const { document, hash } = req.body;
    
    if (!document || !hash) {
      return res.status(400).json({
        error: 'Integrity check failed',
        code: 'INTEGRITY_CHECK_FAILED',
        message: 'Document integrity information is missing'
      });
    }
    
    // Calculate SHA-256 hash of the document
    const calculatedHash = crypto
      .createHash('sha256')
      .update(typeof document === 'string' ? document : JSON.stringify(document))
      .digest('hex');
    
    if (calculatedHash !== hash) {
      // Log potential tampering attempt
      console.error(`[SECURITY] Integrity check failed for document operation: ${req.path}`);
      
      return res.status(400).json({
        error: 'Integrity check failed',
        code: 'INTEGRITY_CHECK_FAILED',
        message: 'Document integrity verification failed. The document may have been tampered with.'
      });
    }
  }
  
  next();
};

// CSRF protection middleware
const configureCsrf = () => {
  return (req, res, next) => {
    // Skip for non-mutating operations or API endpoints that use token auth
    if (req.method === 'GET' || req.path.startsWith('/api/auth')) {
      return next();
    }
    
    const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
    const storedToken = req.cookies && req.cookies.csrfToken;
    
    if (!csrfToken || !storedToken || csrfToken !== storedToken) {
      return res.status(403).json({
        error: 'CSRF validation failed',
        code: 'CSRF_CHECK_FAILED',
        message: 'Cross-Site Request Forgery protection validation failed'
      });
    }
    
    next();
  };
};

// Set CSRF token middleware - creates and sets token in cookie
const setCsrfToken = (cookieOptions = {}) => {
  return (req, res, next) => {
    if (!req.cookies.csrfToken) {
      const token = uuidv4();
      
      // Set HTTP-only cookie with the token
      res.cookie('csrfToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        ...cookieOptions
      });
      
      // Also store in response locals for templates to access
      res.locals.csrfToken = token;
    } else {
      res.locals.csrfToken = req.cookies.csrfToken;
    }
    
    next();
  };
};

// Audit logging middleware
const configureAuditLogging = () => {
  return (req, res, next) => {
    // Skip health check endpoints
    if (req.path === '/api/health' || req.path === '/health') {
      return next();
    }
    
    const start = Date.now();
    const user = req.user ? req.user.id : 'unauthenticated';
    const tenant = req.tenant ? req.tenant.id : 'unknown';
    
    // Record the start of the request
    console.log(`[AUDIT] REQUEST_START - User: ${user}, Tenant: ${tenant}, Method: ${req.method}, Path: ${req.path}`);
    
    // Capture response completion
    res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      
      console.log(`[AUDIT] REQUEST_END - User: ${user}, Tenant: ${tenant}, Method: ${req.method}, Path: ${req.path}, Status: ${status}, Duration: ${duration}ms`);
    });
    
    next();
  };
};

// Data encryption validation middleware
const validateEncryption = () => {
  return (req, res, next) => {
    // Skip for GET requests and non-sensitive endpoints
    if (req.method === 'GET' || !req.path.includes('/api/sensitive')) {
      return next();
    }
    
    const encryptionHeader = req.headers['x-encryption-method'];
    
    if (!encryptionHeader || encryptionHeader !== 'AES-256-GCM') {
      return res.status(400).json({
        error: 'Encryption validation failed',
        code: 'ENCRYPTION_CHECK_FAILED',
        message: 'This endpoint requires all data to be encrypted using AES-256-GCM'
      });
    }
    
    next();
  };
};

module.exports = {
  validateTenant,
  configureHelmet,
  configureRateLimit,
  verifyDocumentIntegrity,
  configureCsrf,
  setCsrfToken,
  configureAuditLogging,
  validateEncryption
};