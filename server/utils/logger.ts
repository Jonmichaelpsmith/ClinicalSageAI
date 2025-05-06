/**
 * Logger Utility
 * 
 * Provides a standardized logging interface that includes context information.
 */

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Logger context options
 */
interface LoggerContextOptions {
  module?: string;
  component?: string;
  action?: string;
  [key: string]: any;
}

/**
 * Logger interface
 */
export interface Logger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, data?: any): void;
}

/**
 * Create a logger with the specified context
 */
export function createContextLogger(context: LoggerContextOptions = {}): Logger {
  return {
    debug(message: string, data?: any) {
      logWithContext(LogLevel.DEBUG, message, context, data);
    },
    info(message: string, data?: any) {
      logWithContext(LogLevel.INFO, message, context, data);
    },
    warn(message: string, data?: any) {
      logWithContext(LogLevel.WARN, message, context, data);
    },
    error(message: string, data?: any) {
      logWithContext(LogLevel.ERROR, message, context, data);
    }
  };
}

/**
 * Log a message with context
 */
function logWithContext(
  level: LogLevel,
  message: string,
  context: LoggerContextOptions = {},
  data?: any
): void {
  // Get context details
  const { module, component, action, ...otherContext } = context;
  
  // Construct log entry
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: {
      module,
      component,
      action,
      ...otherContext
    },
    data
  };
  
  // Log to console with appropriate level
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(logEntry);
      break;
    case LogLevel.INFO:
      console.info(logEntry);
      break;
    case LogLevel.WARN:
      console.warn(logEntry);
      break;
    case LogLevel.ERROR:
      console.error(logEntry);
      break;
    default:
      console.log(logEntry);
  }
}
