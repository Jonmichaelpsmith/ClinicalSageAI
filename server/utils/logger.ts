/**
 * Structured Logging Utility
 * 
 * Provides a standardized logging interface with context support and structured output.
 * Supports different log levels and contextual information for enhanced debugging.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  module?: string;
  component?: string;
  action?: string;
  [key: string]: any;
}

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
  // Helper function to generate a log entry
  const generateLogEntry = (
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
      ...(data !== undefined ? { data } : {}),
    };
  };

  // Helper to print the log entry
  const printLogEntry = (entry: LogMessage) => {
    // In production, we might want to use a logging service
    // But for now, we'll just use console.log with formatting
    const logFn = 
      entry.level === 'debug' ? console.debug :
      entry.level === 'info' ? console.info :
      entry.level === 'warn' ? console.warn :
      console.error;
    
    // JSON stringify the entry for structured logging
    logFn(JSON.stringify(entry, null, 2));
    
    return entry;
  };

  // Return logger interface
  return {
    debug: (message: string, context: LogContext = {}, data?: any) => {
      return printLogEntry(generateLogEntry('debug', message, context, data));
    },
    
    info: (message: string, context: LogContext = {}, data?: any) => {
      return printLogEntry(generateLogEntry('info', message, context, data));
    },
    
    warn: (message: string, context: LogContext = {}, data?: any) => {
      return printLogEntry(generateLogEntry('warn', message, context, data));
    },
    
    error: (message: string, context: LogContext = {}, data?: any) => {
      return printLogEntry(generateLogEntry('error', message, context, data));
    },
    
    // Create a new logger with additional context
    withContext: (additionalContext: LogContext) => {
      return createContextLogger({
        ...baseContext,
        ...additionalContext
      });
    }
  };
}

// Export a default logger
export const logger = createContextLogger();
