/**
 * API Security Utilities for TrialSage
 * 
 * This module provides functions for API request sanitization, logging, and error handling.
 * It implements security best practices for handling user inputs and preventing common
 * security vulnerabilities.
 */

const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;

// Ensure logs directory exists
const LOGS_DIR = path.join(process.cwd(), 'logs');

// Initialize logs directory
async function ensureLogsDir() {
  try {
    await fsPromises.mkdir(LOGS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating logs directory:', error);
  }
}

// Initialize directory on module load
ensureLogsDir();

/**
 * Sanitize API input data to prevent injection attacks
 * @param {Object} data - The request body data to sanitize
 * @returns {Object} Sanitized data object
 */
function sanitizeInput(data) {
  // Don't process null or undefined
  if (data === null || data === undefined) {
    return data;
  }
  
  // Handle different data types
  if (typeof data === 'string') {
    // Sanitize strings by removing potentially dangerous characters
    return data.replace(/[<>]/g, '');
  } else if (Array.isArray(data)) {
    // Recursively sanitize array elements
    return data.map(item => sanitizeInput(item));
  } else if (typeof data === 'object') {
    // Recursively sanitize object properties
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      // Sanitize the key and value
      const sanitizedKey = key.replace(/[<>]/g, '');
      sanitized[sanitizedKey] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  // Return other data types as is (numbers, booleans, etc.)
  return data;
}

/**
 * Log API usage for audit and monitoring purposes
 * @param {Object} req - Express request object
 * @param {string} endpoint - API endpoint name
 * @param {boolean} success - Whether the request was successful
 * @param {Object} details - Optional additional details to log
 */
async function logApiUsage(req, endpoint, success, details = {}) {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      endpoint,
      success,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id || 'anonymous',
      details
    };
    
    // Log to console
    console.log(`API ${endpoint} - ${success ? 'SUCCESS' : 'FAILURE'} - ${JSON.stringify(details)}`);
    
    // In a production system, this would write to a secure, tamper-proof audit log
    // and potentially send alerts for suspicious activity
    const logFile = path.join(LOGS_DIR, `api-usage-${timestamp.split('T')[0]}.log`);
    await fsPromises.appendFile(logFile, JSON.stringify(logEntry) + '\n', 'utf8');
    
  } catch (error) {
    console.error('Error logging API usage:', error);
  }
}

/**
 * Handle API errors consistently
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Error} error - The error that occurred
 * @param {string} endpoint - API endpoint name
 */
function handleApiError(req, res, error, endpoint) {
  // Log the error
  console.error(`API Error in ${endpoint}:`, error);
  
  // Log the failed API request
  logApiUsage(req, endpoint, false, { 
    errorMessage: error.message,
    errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
  });
  
  // Send appropriate response to client
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 
    ? 'An internal server error occurred. Please try again later.'
    : error.message;
  
  res.status(statusCode).json({
    error: message,
    requestId: req.id // Assuming request ID middleware is used
  });
}

// Export utility functions
export { sanitizeInput, logApiUsage, handleApiError };