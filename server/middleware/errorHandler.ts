/**
 * Global Error Handler Middleware
 * 
 * This middleware provides centralized error handling for the Express application,
 * ensuring consistent error responses and proper logging.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Define error types for better categorization
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  CONFLICT = 'CONFLICT_ERROR',
  INTERNAL = 'INTERNAL_SERVER_ERROR',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  INPUT = 'INPUT_ERROR'
}

// Custom error class for application errors
export class AppError extends Error {
  statusCode: number;
  type: ErrorType;
  details?: any;

  constructor(
    message: string, 
    statusCode: number = 500, 
    type: ErrorType = ErrorType.INTERNAL, 
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Format error for consistent API responses
 */
function formatError(err: any) {
  return {
    error: {
      message: err.message || 'An unexpected error occurred',
      type: err.type || ErrorType.INTERNAL,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
      ...(err.details && { details: err.details })
    }
  };
}

/**
 * Not found handler - for undefined routes
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  const err = new AppError(
    `Route not found: ${req.method} ${req.path}`, 
    404, 
    ErrorType.NOT_FOUND
  );
  next(err);
}

/**
 * Main error handler middleware
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Set default values if not provided
  const statusCode = err.statusCode || 500;
  const errorType = err.type || ErrorType.INTERNAL;
  
  // Log the error with proper context
  const logMethod = statusCode >= 500 ? logger.error : logger.warn;
  
  logMethod(`${req.method} ${req.path} - ${statusCode} ${err.message}`, {
    error: {
      type: errorType,
      message: err.message,
      stack: err.stack,
      details: err.details
    },
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
        'accept': req.headers['accept']
      }
    }
  });
  
  // Prevent leaking error details in production
  const errorResponse = formatError(err);
  
  // Handle various error types with appropriate fallback messages
  let responseMessage = err.message;
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    responseMessage = 'An unexpected error occurred. Our team has been notified.';
    delete errorResponse.error.stack;
  }
  
  // Update the message for the response
  errorResponse.error.message = responseMessage;
  
  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * Safe async route wrapper to handle promise rejections
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}