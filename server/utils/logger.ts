/**
 * Logger Utility
 * 
 * This utility provides structured logging capabilities
 * for the application with different log levels and context.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogContext = {
  module?: string;
  timestamp?: string;
  requestId?: string;
  userId?: string | number;
  [key: string]: any;
};

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
}

const DEFAULT_CONTEXT: LogContext = {
  module: 'app'
};

/**
 * Get the current timestamp in ISO format
 * @returns {string} ISO timestamp
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Format a log entry to JSON
 * @param {LogEntry} entry - The log entry to format
 * @returns {string} The formatted log entry
 */
function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify(entry, null, 2);
}

/**
 * Log a message at the specified level
 * @param {LogLevel} level - The log level
 * @param {string} message - The log message
 * @param {LogContext} context - Additional context
 */
function log(level: LogLevel, message: string, context: LogContext = {}): void {
  const entry: LogEntry = {
    timestamp: getTimestamp(),
    level,
    message,
    context: {
      ...DEFAULT_CONTEXT,
      ...context
    }
  };

  // In production, you might want to send logs to external systems
  // like CloudWatch, Datadog, or Elasticsearch
  
  // For now, just output to console
  console.log(formatLogEntry(entry));
  
  // Additional handlers for different environments could be added here
}

/**
 * Log a debug message
 * @param {string} message - The log message
 * @param {LogContext} context - Additional context
 */
export function debug(message: string, context: LogContext = {}): void {
  // Only log debug in development
  if (process.env.NODE_ENV !== 'production') {
    log('debug', message, context);
  }
}

/**
 * Log an info message
 * @param {string} message - The log message
 * @param {LogContext} context - Additional context
 */
export function info(message: string, context: LogContext = {}): void {
  log('info', message, context);
}

/**
 * Log a warning message
 * @param {string} message - The log message
 * @param {LogContext} context - Additional context
 */
export function warn(message: string, context: LogContext = {}): void {
  log('warn', message, context);
}

/**
 * Log an error message
 * @param {string} message - The log message
 * @param {Error|null} error - The error object
 * @param {LogContext} context - Additional context
 */
export function error(message: string, err: Error | null = null, context: LogContext = {}): void {
  const errorContext = err ? {
    ...context,
    errorName: err.name,
    errorMessage: err.message,
    errorStack: err.stack
  } : context;
  
  log('error', message, errorContext);
}

/**
 * Create a scoped logger with predefined context
 * @param {string} module - The module name
 * @returns {Object} A logger with the scoped module name
 */
export function createScopedLogger(module: string) {
  return {
    debug: (message: string, context: LogContext = {}) => debug(message, { ...context, module }),
    info: (message: string, context: LogContext = {}) => info(message, { ...context, module }),
    warn: (message: string, context: LogContext = {}) => warn(message, { ...context, module }),
    error: (message: string, err: Error | null = null, context: LogContext = {}) => {
      const moduleContext = { ...context, module };
      error(message, err, moduleContext);
    }
  };
}

// Export the logger functions
export default {
  debug,
  info,
  warn,
  error,
  createScopedLogger
};