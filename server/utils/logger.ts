/**
 * Logger Utility
 * 
 * Provides a centralized logging system with structured output format, context tracking,
 * and consistent log levels across the application. This utility helps ensure all logs
 * follow the same format and contain appropriate context information for debugging.
 */

// Define log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Define context interface for structured logging
interface LogContext {
  module?: string;
  component?: string;
  action?: string;
  [key: string]: any;
}

// Simple log message interface
interface LogMessage {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  data?: any;
}

/**
 * Create a logger with a specific context
 * @param {LogContext} baseContext - Base context to include in all logs
 * @returns {Object} - Logger object with methods for each log level
 */
export function createContextLogger(baseContext: LogContext = {}) {
  // Utility function to create log entries
  const createLogEntry = (
    level: LogLevel,
    message: string,
    context: LogContext = {},
    data?: any
  ): LogMessage => {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...baseContext, ...context },
      data
    };
  };

  // Print log entry to console, formatted based on level
  const printLogEntry = (entry: LogMessage) => {
    // Print log message to console
    const logMessage = JSON.stringify(entry, null, 2);
    
    // Use different console methods based on level
    switch (entry.level) {
      case 'debug':
        console.debug(logMessage);
        break;
      case 'info':
        console.info(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
        console.error(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  };

  // Return logger object with methods for each log level
  return {
    debug: (message: string, context: LogContext = {}, data?: any) => {
      const entry = createLogEntry('debug', message, context, data);
      printLogEntry(entry);
      return entry;
    },

    info: (message: string, context: LogContext = {}, data?: any) => {
      const entry = createLogEntry('info', message, context, data);
      printLogEntry(entry);
      return entry;
    },

    warn: (message: string, context: LogContext = {}, data?: any) => {
      const entry = createLogEntry('warn', message, context, data);
      printLogEntry(entry);
      return entry;
    },

    error: (message: string, context: LogContext = {}, data?: any) => {
      const entry = createLogEntry('error', message, context, data);
      printLogEntry(entry);
      return entry;
    },

    // Create a new logger with extended context
    withContext: (additionalContext: LogContext) => {
      return createContextLogger({ ...baseContext, ...additionalContext });
    }
  };
}

// Create a default logger for direct use
const logger = createContextLogger();
export default logger;