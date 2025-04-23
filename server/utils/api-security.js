/**
 * API Security Utilities for TrialSage
 * 
 * This module provides security utilities for API endpoints, including:
 * - Input sanitization
 * - Audit logging
 * - Error handling
 * - Rate limiting helpers
 * 
 * These utilities are designed to be reused across all API endpoints
 * to ensure consistent security practices.
 */

/**
 * Sanitize input to prevent injection attacks
 * @param {any} input - Input to sanitize
 * @returns {any} Sanitized input
 */
export function sanitizeInput(input) {
  if (typeof input === 'string') {
    // Basic sanitization - in production would use more robust methods
    // This removes potentially dangerous HTML/script tags
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<img[^>]*>/gi, '')
      .trim()
      .slice(0, 100000); // Reasonable length limit
  } else if (typeof input === 'object' && input !== null) {
    if (Array.isArray(input)) {
      return input.map(item => sanitizeInput(item));
    } else {
      const sanitized = {};
      for (const [key, value] of Object.entries(input)) {
        // Skip potentially dangerous keys
        if (key.toLowerCase().includes('script') || 
            key.toLowerCase().includes('exec') || 
            key.toLowerCase().includes('function')) {
          continue;
        }
        sanitized[key] = sanitizeInput(value);
      }
      return sanitized;
    }
  }
  return input;
}

/**
 * Log API usage for audit purposes
 * @param {Express.Request} req - Express request object
 * @param {string} endpoint - API endpoint name
 * @param {boolean} success - Whether the request was successful
 * @param {Object} details - Additional details to log
 */
export function logApiUsage(req, endpoint, success, details = {}) {
  const timestamp = new Date().toISOString();
  const userId = req.user?.id || 'anonymous';
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const method = req.method;
  const url = req.originalUrl;
  
  const logEntry = {
    timestamp,
    endpoint,
    userId,
    ipAddress,
    userAgent,
    method,
    url,
    success,
    ...details
  };
  
  // Remove any sensitive data before logging
  if (logEntry.password) delete logEntry.password;
  if (logEntry.token) delete logEntry.token;
  if (logEntry.apiKey) delete logEntry.apiKey;
  
  // In production, this would write to a secure audit log database or service
  // For development, we'll just console log
  console.log(`[AUDIT] ${timestamp} - ${method} ${url} - ${success ? 'SUCCESS' : 'FAILURE'} - User: ${userId}`);
  
  // Return the log entry for optional further processing
  return logEntry;
}

/**
 * Handle API errors with proper status codes and logging
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 * @param {Error} error - The error that occurred
 * @param {string} endpoint - API endpoint name
 */
export function handleApiError(req, res, error, endpoint) {
  // Log the error details (without sensitive information)
  console.error(`API Error in ${endpoint}:`, {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    timestamp: new Date().toISOString()
  });
  
  // Log the API usage with failure status
  logApiUsage(req, endpoint, false, { errorMessage: error.message });
  
  // Determine appropriate status code based on error type
  let statusCode = 500;
  let errorMessage = 'Internal server error';
  
  if (error.name === 'ValidationError' || error.name === 'ZodError') {
    statusCode = 400;
    errorMessage = 'Invalid input data';
  } else if (error.name === 'UnauthorizedError' || error.message.includes('unauthorized')) {
    statusCode = 401;
    errorMessage = 'Unauthorized access';
  } else if (error.name === 'ForbiddenError' || error.message.includes('forbidden')) {
    statusCode = 403;
    errorMessage = 'Access forbidden';
  } else if (error.name === 'NotFoundError' || error.message.includes('not found')) {
    statusCode = 404;
    errorMessage = 'Resource not found';
  } else if (error.name === 'ConflictError' || error.message.includes('conflict')) {
    statusCode = 409;
    errorMessage = 'Resource conflict';
  } else if (error.name === 'RateLimitError' || error.message.includes('rate limit')) {
    statusCode = 429;
    errorMessage = 'Too many requests, please try again later';
  } else if (error.name === 'APIError' && error.status) {
    // Handle external API errors (like OpenAI)
    statusCode = error.status >= 400 && error.status < 600 ? error.status : 502;
    errorMessage = 'External API error';
  }
  
  // Send appropriate error response
  res.status(statusCode).json({
    error: errorMessage,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    timestamp: new Date().toISOString()
  });
}

/**
 * Generate a unique request ID
 * @returns {string} Unique request ID
 */
export function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Check if a request should be rate limited
 * This is a simple in-memory implementation that would be replaced with Redis in production
 * @param {string} key - Rate limit key (typically user ID or IP)
 * @param {number} limit - Maximum requests allowed in the window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} True if the request should be rate limited, false otherwise
 */
const rateLimitTracker = {};

export function shouldRateLimit(key, limit, windowMs) {
  const now = Date.now();
  
  // Initialize or clean up old requests
  if (!rateLimitTracker[key] || now - rateLimitTracker[key].windowStart > windowMs) {
    rateLimitTracker[key] = {
      windowStart: now,
      count: 0
    };
  }
  
  // Increment request count
  rateLimitTracker[key].count++;
  
  // Check if over limit
  return rateLimitTracker[key].count > limit;
}

/**
 * Generate a secure hash for sensitive data
 * @param {string} value - Value to hash
 * @returns {string} Hashed value
 */
export function secureHash(value) {
  // In production, this would use a proper cryptographic hash function
  // For simplicity, we're just returning a placeholder
  return `hash_${value.substr(0, 3)}...${value.length}`;
}