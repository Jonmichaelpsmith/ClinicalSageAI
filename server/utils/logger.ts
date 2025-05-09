/**
 * Logger Utility
 * 
 * Provides a unified logging interface for the application.
 */

/**
 * Create a logger scoped to a specific module
 * @param scope The logging scope (module name, component, etc.)
 * @returns A logger object with methods for different log levels
 */
export function createScopedLogger(scope: string) {
  const formatMessage = (level: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const context = data ? { module: scope, ...data } : { module: scope };
    
    return {
      timestamp,
      level,
      message,
      context
    };
  };
  
  return {
    debug: (message: string, data?: any) => {
      console.debug(JSON.stringify(formatMessage('debug', message, data)));
    },
    
    info: (message: string, data?: any) => {
      console.info(JSON.stringify(formatMessage('info', message, data)));
    },
    
    warn: (message: string, data?: any) => {
      console.warn(JSON.stringify(formatMessage('warn', message, data)));
    },
    
    error: (message: string, error?: any) => {
      const errorData = error ? { 
        error: error instanceof Error 
          ? { message: error.message, stack: error.stack }
          : error 
      } : undefined;
      
      console.error(JSON.stringify(formatMessage('error', message, errorData)));
    }
  };
}