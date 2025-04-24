/**
 * Structured Logging System for TrialSage
 * 
 * Features:
 * - Context-aware logging with automatic metadata
 * - Configurable log levels and transport destinations
 * - Log rotation for production environments
 * - Request logging middleware for HTTP API access
 */
import winston, { format, transports, Logger } from 'winston';
import { Request, Response, NextFunction } from 'express';
import path from 'path';

// Define log levels and colors
const LOG_LEVELS = {
  error: 0,   // Errors that require immediate attention
  warn: 1,    // Warning conditions 
  info: 2,    // Informational messages
  http: 3,    // HTTP request logs
  debug: 4,   // Detailed debug information
  trace: 5    // Very detailed tracing information
};

// Determine environment
const isDevelopment = process.env.NODE_ENV !== 'production';

// Configure log level based on environment
const level = () => {
  return isDevelopment ? 'debug' : 'info';
};

// Define custom format for console output
const consoleFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  format.colorize({ all: true }),
  format.printf((info) => {
    const { timestamp, level, message, ...metadata } = info;
    
    // Extract context for cleaner logs
    const { module, service, endpoint, ...otherMeta } = metadata;
    
    // Format context parts
    const contextParts = [];
    if (module) contextParts.push(`[${module}]`);
    if (service) contextParts.push(`<${service}>`);
    if (endpoint) contextParts.push(`${endpoint}`);
    
    const context = contextParts.length > 0 ? contextParts.join(' ') + ' ' : '';
    
    // Format metadata if present
    const metaStr = Object.keys(otherMeta).length > 0 
      ? '\n' + JSON.stringify(otherMeta, null, 2)
      : '';
    
    return `${timestamp} ${level}: ${context}${message}${metaStr}`;
  })
);

// Define JSON format for file output
const fileFormat = format.combine(
  format.timestamp(),
  format.json()
);

// Define transports
const logTransports = [
  // Console transport (for all environments)
  new transports.Console({
    format: consoleFormat,
    level: isDevelopment ? 'debug' : 'info',
  }),
];

// Add file transport in production
if (!isDevelopment) {
  // Add rotating file transport for production
  logTransports.push(
    new transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  level: level(),
  levels: LOG_LEVELS,
  format: fileFormat,
  transports: logTransports,
  // Don't exit on uncaught error
  exitOnError: false,
});

// Create a context logger with metadata
export function createContextLogger(context: Record<string, any>): Logger {
  return logger.child(context);
}

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Add unique ID to the request for tracking
  const id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  (req as any).id = id;
  
  // Log request start
  const requestLogger = createContextLogger({
    module: 'http', 
    method: req.method,
    path: req.path,
    ip: req.ip,
    id
  });
  
  // Skip health checks in logs to reduce noise
  if (!req.path.includes('/health')) {
    requestLogger.http(`${req.method} ${req.path} - Start`, { 
      query: req.query,
      headers: req.headers,
      body: req.method !== 'GET' ? req.body : undefined
    });
  }
  
  // Track response time
  const start = Date.now();
  
  // Capture original end function
  const originalEnd = res.end;
  
  // Override end function to log response
  res.end = function(...args: any[]): any {
    const duration = Date.now() - start;
    
    // Skip health checks in logs to reduce noise
    if (!req.path.includes('/health')) {
      const level = res.statusCode >= 500 ? 'error' : 
                    res.statusCode >= 400 ? 'warn' : 
                    'http';
      
      requestLogger.log(level, `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    }
    
    // Call original end
    return originalEnd.apply(res, args);
  };
  
  next();
}

// Export default logger
export default logger;