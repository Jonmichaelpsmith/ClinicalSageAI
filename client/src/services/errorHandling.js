/**
 * Error Handling Service
 * 
 * This module provides standardized error handling for API calls
 * and UI components throughout the application.
 */

/**
 * Handle API errors with standardized approach
 * 
 * @param {Error} error - The error object
 * @param {Object} options - Options for error handling
 * @param {string} options.context - Context where the error occurred (component/feature name)
 * @param {string} options.endpoint - API endpoint that failed
 * @param {Function} options.toast - Optional toast function for UI notification
 * @param {Function} options.onError - Optional callback for custom error handling
 */
export const handleApiError = (error, { context, endpoint, toast, onError } = {}) => {
  // Log errors to console with useful context
  console.error(`API Error [${context || 'Unknown'}] ${endpoint || ''}:`, error);
  
  // Determine error message to display
  let errorMessage = 'An unexpected error occurred';
  
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const serverMessage = 
      error.response.data?.error || 
      error.response.data?.message || 
      error.response.statusText;
    
    if (status === 401 || status === 403) {
      errorMessage = 'Authentication error: Please log in again';
    } else if (status === 404) {
      errorMessage = 'Resource not found';
    } else if (status === 400) {
      errorMessage = `Bad request: ${serverMessage}`;
    } else if (status >= 500) {
      errorMessage = `Server error (${status}): ${serverMessage}`;
    } else {
      errorMessage = serverMessage || errorMessage;
    }
  } else if (error.request) {
    // Request was made but no response
    errorMessage = 'No response from server. Please check your connection.';
  } else if (error.message) {
    // Something else caused the error
    errorMessage = error.message;
  }
  
  // Display toast notification if available
  if (toast) {
    toast({
      title: `Error in ${context || 'API Call'}`,
      description: errorMessage,
      variant: "destructive",
    });
  }
  
  // Call custom error handler if provided
  if (onError && typeof onError === 'function') {
    onError(errorMessage, error);
  }
  
  return errorMessage;
};

/**
 * Format error details for display
 * 
 * @param {Error} error - The error object
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (!error) return 'Unknown error';
  
  if (typeof error === 'string') return error;
  
  if (error.response?.data?.error) return error.response.data.error;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  
  return JSON.stringify(error);
};