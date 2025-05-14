/**
 * Error Handling Utility
 * 
 * This module provides standardized error handling, fallback mechanisms,
 * and error recovery strategies for API calls.
 */

/**
 * Creates a wrapped version of an async function with enhanced error handling
 * 
 * @param {Function} asyncFn - The async function to wrap
 * @param {Object} options - Error handling options
 * @param {Function} options.fallback - Optional fallback function if main function fails
 * @param {number} options.retries - Number of retry attempts (default: 1)
 * @param {number} options.retryDelay - Delay between retries in ms (default: 1000)
 * @param {Function} options.onError - Error callback function
 * @param {Function} options.beforeRetry - Function to call before retry
 * @param {boolean} options.silent - Whether to suppress error logging
 * @returns {Function} - Wrapped function with error handling
 */
export const withErrorHandling = (asyncFn, options = {}) => {
  const {
    fallback = null,
    retries = 1,
    retryDelay = 1000,
    onError = null,
    beforeRetry = null,
    silent = false
  } = options;
  
  return async (...args) => {
    let lastError = null;
    let attempt = 0;
    
    // Try the main function with retries
    while (attempt <= retries) {
      try {
        return await asyncFn(...args);
      } catch (error) {
        lastError = error;
        attempt++;
        
        if (!silent) {
          console.error(`Error in ${asyncFn.name || 'async function'} (attempt ${attempt}/${retries + 1}):`, error);
        }
        
        // Call error callback if provided
        if (onError) {
          onError(error, attempt);
        }
        
        // If we have remaining retries, wait and try again
        if (attempt <= retries) {
          if (beforeRetry) {
            await beforeRetry(attempt);
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    // If fallback is provided, try it after all retries have failed
    if (fallback) {
      try {
        return await fallback(...args, lastError);
      } catch (fallbackError) {
        if (!silent) {
          console.error('Fallback function also failed:', fallbackError);
        }
        throw fallbackError;
      }
    }
    
    // If we get here, all retries failed and we have no fallback
    throw lastError;
  };
};

/**
 * Apply timeout to any promise
 * 
 * @param {Promise} promise - The promise to apply timeout to
 * @param {number} ms - Timeout in milliseconds
 * @param {string} errorMessage - Optional custom error message
 * @returns {Promise} Promise with timeout
 */
export const withTimeout = (promise, ms, errorMessage = 'Operation timed out') => {
  const timeout = new Promise((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(errorMessage));
    }, ms);
  });
  
  return Promise.race([promise, timeout]);
};

/**
 * Formats error messages for user display
 * 
 * @param {Error} error - The error object
 * @param {Object} options - Formatting options
 * @param {boolean} options.includeStack - Whether to include stack trace for developers
 * @param {Object} options.friendlyMessages - Map of error types to user-friendly messages
 * @returns {Object} Formatted error object for display
 */
export const formatErrorForDisplay = (error, options = {}) => {
  const {
    includeStack = false,
    friendlyMessages = {}
  } = options;
  
  // Default error type
  let errorType = 'unknown';
  
  // Determine error type
  if (error.name === 'TypeError') {
    errorType = 'type';
  } else if (error.name === 'SyntaxError') {
    errorType = 'syntax';
  } else if (error.name === 'ReferenceError') {
    errorType = 'reference';
  } else if (error.message && error.message.includes('Network')) {
    errorType = 'network';
  } else if (error.message && error.message.includes('timeout')) {
    errorType = 'timeout';
  } else if (error.status || error.statusCode) {
    const status = error.status || error.statusCode;
    if (status === 401 || status === 403) {
      errorType = 'auth';
    } else if (status === 404) {
      errorType = 'not_found';
    } else if (status >= 500) {
      errorType = 'server';
    }
  }
  
  // Get friendly message based on error type
  const friendlyMessage = friendlyMessages[errorType] || 
    friendlyMessages.default || 
    'An unexpected error occurred. Please try again.';
  
  return {
    message: friendlyMessage,
    originalMessage: error.message,
    type: errorType,
    status: error.status || error.statusCode,
    stack: includeStack ? error.stack : undefined,
    timestamp: new Date().toISOString()
  };
};

/**
 * Generic API error handler with fallback strategy
 * 
 * @param {Error} error - The caught error
 * @param {string} operation - Description of the operation that failed
 * @param {Function} fallbackFn - Optional fallback function
 * @param {boolean} rethrow - Whether to rethrow the error after handling
 * @returns {Object|null} Fallback result or null
 */
export const handleApiError = async (error, operation, fallbackFn = null, rethrow = true) => {
  console.error(`Error during ${operation}:`, error);
  
  let result = null;
  
  // Try fallback if provided
  if (fallbackFn) {
    try {
      console.log(`Attempting fallback for ${operation}...`);
      result = await fallbackFn();
      console.log(`Fallback for ${operation} succeeded`);
    } catch (fallbackError) {
      console.error(`Fallback for ${operation} also failed:`, fallbackError);
      if (rethrow) {
        throw fallbackError;
      }
    }
  } else if (rethrow) {
    throw error;
  }
  
  return result;
};

/**
 * Default friendly error messages for common error types
 */
export const defaultFriendlyMessages = {
  network: 'Unable to connect to the server. Please check your internet connection and try again.',
  auth: 'You are not authorized to perform this action. Please log in and try again.',
  not_found: 'The requested resource could not be found. It may have been moved or deleted.',
  server: 'Our server is experiencing issues. Please try again later.',
  timeout: 'The request took too long to complete. Please try again.',
  default: 'An unexpected error occurred. Our team has been notified.',
  openai: 'The AI service is currently unavailable. A simplified version is being used instead.'
};

export default {
  withErrorHandling,
  withTimeout,
  formatErrorForDisplay,
  handleApiError,
  defaultFriendlyMessages
};