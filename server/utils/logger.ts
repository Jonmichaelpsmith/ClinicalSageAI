/**
 * Simple Logging System for TrialSage
 * 
 * A simplified logger implementation without external dependencies
 */
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';

// Log levels
type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug' | 'trace';

// Logger interface
interface SimpleLogger {
  error: (message: string, meta?: Record<string, any>) => void;
  warn: (message: string, meta?: Record<string, any>) => void;
  info: (message: string, meta?: Record<string, any>) => void;
  http: (message: string, meta?: Record<string, any>) => void;
  debug: (message: string, meta?: Record<string, any>) => void;
  trace: (message: string, meta?: Record<string, any>) => void;
  log: (level: LogLevel, message: string, meta?: Record<string, any>) => void;
  child: (metadata: Record<string, any>) => SimpleLogger;
}

// Determine environment
const isDevelopment = process.env.NODE_ENV !== 'production';

// Configure log level based on environment
const getCurrentLevel = (): LogLevel => {
  return isDevelopment ? 'debug' : 'info';
};

const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  trace: 5
};

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m',  // Yellow
  info: '\x1b[36m',  // Cyan
  http: '\x1b[35m',  // Magenta
  debug: '\x1b[32m', // Green
  trace: '\x1b[90m'  // Grey
};

const RESET_COLOR = '\x1b[0m';

// Create a simple logger
const createLogger = (defaultMeta: Record<string, any> = {}): SimpleLogger => {
  const currentLevel = getCurrentLevel();
  
  const shouldLog = (level: LogLevel): boolean => {
    return LOG_LEVEL_VALUES[level] <= LOG_LEVEL_VALUES[currentLevel];
  };
  
  const formatMessage = (level: LogLevel, message: string, meta: Record<string, any> = {}): string => {
    const timestamp = new Date().toISOString();
    const combinedMeta = { ...defaultMeta, ...meta };
    
    // Extract context for cleaner logs
    const { module, service, endpoint, ...otherMeta } = combinedMeta;
    
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
      
    const color = LOG_LEVEL_COLORS[level];
    const levelFormatted = `${color}${level.toUpperCase()}${RESET_COLOR}`;
    
    return `${timestamp} ${levelFormatted}: ${context}${message}${metaStr}`;
  };
  
  const logToConsole = (level: LogLevel, message: string, meta: Record<string, any> = {}): void => {
    if (!shouldLog(level)) return;
    
    const formattedMessage = formatMessage(level, message, meta);
    
    if (level === 'error') {
      console.error(formattedMessage);
    } else if (level === 'warn') {
      console.warn(formattedMessage);
    } else {
      console.log(formattedMessage);
    }
  };
  
  // Create logger methods
  const logger: SimpleLogger = {
    error: (message, meta) => logger.log('error', message, meta),
    warn: (message, meta) => logger.log('warn', message, meta),
    info: (message, meta) => logger.log('info', message, meta),
    http: (message, meta) => logger.log('http', message, meta),
    debug: (message, meta) => logger.log('debug', message, meta),
    trace: (message, meta) => logger.log('trace', message, meta),
    log: (level, message, meta) => {
      logToConsole(level, message, meta);
      
      // In production, we would add file logging here
      if (!isDevelopment && (level === 'error' || level === 'warn')) {
        // Implementation for file logging would go here
        // For now, we're just logging to console
      }
    },
    child: (metadata) => {
      return createLogger({ ...defaultMeta, ...metadata });
    }
  };
  
  return logger;
};

// Create the main logger instance
export const logger = createLogger();

// Create a context logger with metadata
export function createContextLogger(context: Record<string, any>): SimpleLogger {
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
      const level = res.statusCode >= 500 ? 'error' as LogLevel : 
                   res.statusCode >= 400 ? 'warn' as LogLevel : 
                   'http' as LogLevel;
      
      requestLogger.log(level, `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    }
    
    // Call original end
    return originalEnd.apply(res, args);
  };
  
  next();
}

// Export default logger
export default logger;