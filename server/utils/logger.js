import pino from 'pino';
import * as Sentry from '@sentry/node';

// Initialize Sentry with the DSN from environment variable
Sentry.init({ 
  dsn: process.env.SENTRY_DSN, 
  tracesSampleRate: 0.1  // Adjust sample rate as needed
});

// Create a logger instance
export const logger = pino({ 
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

// Middleware for capturing exceptions in Sentry
export function sentryMiddleware(err, req, res, next) {
  // Capture the error in Sentry
  Sentry.captureException(err);
  
  // Log the error locally
  logger.error({
    err: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      url: req.url,
      method: req.method,
      ip: req.ip
    }
  }, 'Error captured by Sentry middleware');
  
  // Continue to the next error handler
  next(err);
}