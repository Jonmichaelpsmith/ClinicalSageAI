/**
 * Network Resilience Utility
 * 
 * This module provides utilities to handle network failures gracefully,
 * including automatic retries, timeouts, and offline detection.
 * 
 * CRITICAL STABILITY COMPONENT - DO NOT MODIFY WITHOUT THOROUGH TESTING
 */

import { NETWORK_CONFIG } from '@/config/stabilityConfig';

/**
 * Network state tracking
 */
const networkState = {
  isOnline: navigator.onLine,
  failedRequests: new Map(),
  retryQueue: [],
  isRetrying: false,
};

/**
 * Initialize network resilience features
 */
export function initNetworkResilience() {
  // Listen for online/offline events
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Start retry queue processor
  processRetryQueue();
}

/**
 * Clean up network resilience features
 */
export function cleanupNetworkResilience() {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
}

/**
 * Handle browser going online
 */
function handleOnline() {
  console.log('🌐 Network connection restored');
  networkState.isOnline = true;
  
  // Retry any queued requests
  if (networkState.retryQueue.length > 0) {
    processRetryQueue();
  }
}

/**
 * Handle browser going offline
 */
function handleOffline() {
  console.log('🔌 Network connection lost');
  networkState.isOnline = false;
}

/**
 * Process the retry queue
 */
async function processRetryQueue() {
  if (networkState.isRetrying || networkState.retryQueue.length === 0) {
    return;
  }
  
  networkState.isRetrying = true;
  
  while (networkState.retryQueue.length > 0 && networkState.isOnline) {
    const retryItem = networkState.retryQueue.shift();
    
    try {
      // Attempt the fetch with exponential backoff
      const result = await fetchWithExponentialBackoff(
        retryItem.url,
        retryItem.options,
        retryItem.attemptsMade,
        retryItem.maxRetries
      );
      
      // Call success callback if provided
      if (retryItem.onSuccess) {
        retryItem.onSuccess(result);
      }
    } catch (error) {
      console.error(`Failed to retry request to ${retryItem.url} after ${retryItem.attemptsMade} attempts`, error);
      
      // Call failure callback if provided
      if (retryItem.onFailure) {
        retryItem.onFailure(error);
      }
    }
    
    // Small delay between processing retry items
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  networkState.isRetrying = false;
}

/**
 * Tracks a failed request and optionally queues it for retry
 */
function trackFailedRequest(url, options, error, shouldRetry = true) {
  const key = `${options.method || 'GET'}-${url}`;
  const failedRequest = networkState.failedRequests.get(key) || { 
    count: 0, 
    lastError: null,
    lastAttempt: 0
  };
  
  failedRequest.count += 1;
  failedRequest.lastError = error;
  failedRequest.lastAttempt = Date.now();
  
  networkState.failedRequests.set(key, failedRequest);
  
  // Add to retry queue if we should retry
  if (shouldRetry) {
    enqueueRetry(url, options);
  }
}

/**
 * Add a request to the retry queue
 */
function enqueueRetry(url, options, attemptsMade = 0, maxRetries = NETWORK_CONFIG.maxRetryAttempts, 
                       onSuccess = null, onFailure = null) {
  // Don't retry if max attempts exceeded
  if (attemptsMade >= maxRetries) {
    if (onFailure) {
      onFailure(new Error(`Maximum retry attempts (${maxRetries}) exceeded`));
    }
    return;
  }
  
  networkState.retryQueue.push({
    url,
    options,
    attemptsMade,
    maxRetries,
    onSuccess,
    onFailure,
    queuedAt: Date.now()
  });
  
  // Start processing queue if we're online and not already processing
  if (networkState.isOnline && !networkState.isRetrying) {
    processRetryQueue();
  }
}

/**
 * Calculate exponential backoff time
 */
function calculateBackoff(attemptsMade) {
  const baseDelay = NETWORK_CONFIG.retryBackoffMs;
  const maxDelay = NETWORK_CONFIG.maxBackoffMs;
  
  // Exponential backoff with jitter
  const exponentialDelay = Math.min(
    maxDelay,
    baseDelay * Math.pow(2, attemptsMade)
  );
  
  // Add random jitter (±20%)
  const jitter = exponentialDelay * 0.2 * (Math.random() * 2 - 1);
  
  return Math.floor(exponentialDelay + jitter);
}

/**
 * Fetch with exponential backoff for automatic retries
 */
export async function fetchWithExponentialBackoff(url, options = {}, 
                                                 attemptsMade = 0, 
                                                 maxRetries = NETWORK_CONFIG.maxRetryAttempts) {
  // Setup timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, options.timeout || NETWORK_CONFIG.defaultTimeoutMs);
  
  try {
    // Merge abort signal with existing options
    const fetchOptions = {
      ...options,
      signal: controller.signal
    };
    
    const response = await fetch(url, fetchOptions);
    
    // Handle non-success responses
    if (!response.ok) {
      // Only retry for specific status codes (server errors, throttling, etc.)
      const shouldRetry = [408, 429, 500, 502, 503, 504].includes(response.status);
      
      const error = new Error(`Request failed with status ${response.status}`);
      error.status = response.status;
      
      if (shouldRetry && attemptsMade < maxRetries) {
        const backoffTime = calculateBackoff(attemptsMade);
        console.log(`Retrying request to ${url} in ${backoffTime}ms (attempt ${attemptsMade + 1}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        
        return fetchWithExponentialBackoff(url, options, attemptsMade + 1, maxRetries);
      }
      
      // Track failed request but don't auto-retry
      trackFailedRequest(url, options, error, false);
      throw error;
    }
    
    return response;
  } catch (error) {
    // Handle network errors and timeouts
    if (error.name === 'AbortError') {
      const timeoutError = new Error(`Request to ${url} timed out after ${options.timeout || NETWORK_CONFIG.defaultTimeoutMs}ms`);
      timeoutError.name = 'TimeoutError';
      
      // Track failed request
      trackFailedRequest(url, options, timeoutError, true);
      throw timeoutError;
    }
    
    // Handle real network errors
    if (attemptsMade < maxRetries && networkState.isOnline) {
      const backoffTime = calculateBackoff(attemptsMade);
      console.log(`Retrying request to ${url} in ${backoffTime}ms (attempt ${attemptsMade + 1}/${maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      
      return fetchWithExponentialBackoff(url, options, attemptsMade + 1, maxRetries);
    }
    
    // Track failed request
    trackFailedRequest(url, options, error, true);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Enhanced fetch with timeout, retries, and offline handling
 */
export async function resilientFetch(url, options = {}) {
  const {
    timeout = NETWORK_CONFIG.defaultTimeoutMs,
    retries = NETWORK_CONFIG.maxRetryAttempts,
    critical = false,  // If true, will queue if offline
    ...fetchOptions
  } = options;
  
  // If offline and this is a critical request, queue for later
  if (!networkState.isOnline && critical) {
    return new Promise((resolve, reject) => {
      console.log(`Network offline. Queuing critical request to ${url}`);
      enqueueRetry(url, fetchOptions, 0, retries, resolve, reject);
    });
  }
  
  // Otherwise attempt with backoff
  return fetchWithExponentialBackoff(
    url,
    { ...fetchOptions, timeout },
    0,
    retries
  );
}

/**
 * Creates an enhanced API client with resilient network behavior
 */
export function createResilientApiClient(baseUrl = '', defaultOptions = {}) {
  return {
    /**
     * Make a GET request with resilient network behavior
     */
    async get(path, options = {}) {
      const url = `${baseUrl}${path}`;
      const response = await resilientFetch(url, {
        method: 'GET',
        ...defaultOptions,
        ...options,
      });
      return response.json();
    },
    
    /**
     * Make a POST request with resilient network behavior
     */
    async post(path, data, options = {}) {
      const url = `${baseUrl}${path}`;
      const response = await resilientFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...defaultOptions.headers,
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...defaultOptions,
        ...options,
      });
      return response.json();
    },
    
    /**
     * Make a PUT request with resilient network behavior
     */
    async put(path, data, options = {}) {
      const url = `${baseUrl}${path}`;
      const response = await resilientFetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...defaultOptions.headers,
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...defaultOptions,
        ...options,
      });
      return response.json();
    },
    
    /**
     * Make a DELETE request with resilient network behavior
     */
    async delete(path, options = {}) {
      const url = `${baseUrl}${path}`;
      const response = await resilientFetch(url, {
        method: 'DELETE',
        ...defaultOptions,
        ...options,
      });
      return response.json();
    },
    
    /**
     * Get current network state
     */
    getNetworkState() {
      return {
        isOnline: networkState.isOnline,
        failedRequestCount: networkState.failedRequests.size,
        retryQueueSize: networkState.retryQueue.length,
      };
    },
  };
}

export default {
  initNetworkResilience,
  cleanupNetworkResilience,
  fetchWithExponentialBackoff,
  resilientFetch,
  createResilientApiClient,
};