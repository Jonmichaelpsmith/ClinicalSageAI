/**
 * Centralized Error Handling Service
 * 
 * This service provides standardized error handling, logging, and recovery
 * mechanisms for API calls and service interactions.
 */

// Keep track of failed API calls for automatic retry
const apiErrorTracker = {
  failures: {},
  maxFailures: 3,
  
  // Record a failure for a specific endpoint
  recordFailure(endpoint, error) {
    if (!this.failures[endpoint]) {
      this.failures[endpoint] = { count: 0, lastError: null, timestamp: Date.now() };
    }
    
    this.failures[endpoint].count += 1;
    this.failures[endpoint].lastError = error;
    this.failures[endpoint].timestamp = Date.now();
    
    return this.failures[endpoint].count;
  },
  
  // Reset failure count for an endpoint
  resetFailures(endpoint) {
    if (this.failures[endpoint]) {
      this.failures[endpoint].count = 0;
    }
  },
  
  // Get current failure count for an endpoint
  getFailureCount(endpoint) {
    return this.failures[endpoint]?.count || 0;
  },
  
  // Check if we should trigger a fallback for an endpoint
  shouldUseFallback(endpoint) {
    return this.getFailureCount(endpoint) >= this.maxFailures;
  }
};

/**
 * Standard error handler for API calls
 * 
 * @param {string} context - Where the error occurred (for logging)
 * @param {Error} error - The error that was thrown
 * @param {string} endpoint - The API endpoint that was called
 * @param {Function} onFallback - Optional fallback function to call when max failures reached
 * @returns {Error} The original error with additional context
 */
export function handleApiError(context, error, endpoint, onFallback = null) {
  // Enrich error with additional context
  const enrichedError = error;
  enrichedError.context = context;
  enrichedError.endpoint = endpoint;
  enrichedError.timestamp = new Date().toISOString();
  
  // Log the error with context for easier debugging
  console.error(`API Error in ${context} calling ${endpoint}:`, error);
  
  // Track API failures
  const failureCount = apiErrorTracker.recordFailure(endpoint, error);
  
  // Report error to monitoring service if available
  if (window.analytics && typeof window.analytics.track === 'function') {
    window.analytics.track('API Error', {
      context,
      endpoint,
      error: error.message,
      failureCount,
      timestamp: enrichedError.timestamp
    });
  }
  
  // If we've exceeded failure threshold and have a fallback, use it
  if (failureCount >= apiErrorTracker.maxFailures && onFallback) {
    console.warn(`Using fallback for ${endpoint} after ${failureCount} failures`);
    return onFallback(error);
  }
  
  return enrichedError;
}

/**
 * Retry a failed API call with exponential backoff
 * 
 * @param {Function} apiFn - The API function to retry
 * @param {Array} args - Arguments to pass to the API function
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.baseDelay - Base delay in ms before first retry (default: 1000)
 * @param {boolean} options.exponential - Whether to use exponential backoff (default: true)
 * @returns {Promise} - Promise that resolves with the API response or rejects after max retries
 */
export async function retryApiCall(apiFn, args = [], options = {}) {
  const { 
    maxRetries = 3, 
    baseDelay = 1000, 
    exponential = true 
  } = options;
  
  let lastError = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // If this isn't the first attempt, wait before retrying
      if (attempt > 0) {
        const delay = exponential 
          ? baseDelay * Math.pow(2, attempt - 1) // Exponential backoff
          : baseDelay; // Constant delay
          
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`Retry attempt ${attempt} for API call`);
      }
      
      // Attempt the API call
      const result = await apiFn(...args);
      
      // If successful, reset the failure counter
      if (typeof args[0] === 'string') {
        apiErrorTracker.resetFailures(args[0]);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt + 1}/${maxRetries + 1} failed:`, error.message);
    }
  }
  
  // If we reach here, all retries failed
  throw new Error(`All ${maxRetries + 1} attempts failed. Last error: ${lastError?.message}`);
}

/**
 * Create a version of an API function with automatic retry capability
 * 
 * @param {Function} apiFn - The original API function
 * @param {Object} options - Retry options (see retryApiCall)
 * @returns {Function} - Wrapped function with retry capability
 */
export function withRetry(apiFn, options = {}) {
  return (...args) => retryApiCall(apiFn, args, options);
}

// Export a health check function for service availability
export async function checkApiHealth() {
  try {
    const response = await fetch('/api/health');
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}