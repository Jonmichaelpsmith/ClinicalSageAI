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

// Cache for network requests
const requestCache = new Map();

/**
 * Initialize basic network resilience features
 */
function initBasicNetworkResilience() {
  // Listen for online/offline events
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Start retry queue processor
  processRetryQueue();

  // Clear expired cache entries periodically
  setInterval(cleanupExpiredCache, 60000);

  console.info('Network resilience features initialized');

  return {
    clearCache: () => requestCache.clear(),
    getCacheStats: () => ({
      size: requestCache.size,
      maxSize: NETWORK_CONFIG.requestCacheSize
    })
  };
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
 * Clean up expired cache entries
 */
function cleanupExpiredCache() {
  const now = Date.now();

  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > NETWORK_CONFIG.requestCacheExpiry) {
      requestCache.delete(key);
    }
  }
}

/**
 * Create a resilient fetch function
 * @param {Function} originalFetch - Original fetch function
 * @returns {Function} Enhanced fetch function with retries
 */
export function createResilientFetch(originalFetch = window.fetch) {
  return async function resilientFetch(url, options = {}) {
    const isGetRequest = !options.method || options.method === 'GET';
    const shouldCache = NETWORK_CONFIG.cacheRequests && isGetRequest;

    // Check cache for GET requests
    if (shouldCache) {
      const cacheKey = `${url}:${JSON.stringify(options)}`;
      const cachedResponse = requestCache.get(cacheKey);

      if (cachedResponse && (Date.now() - cachedResponse.timestamp < NETWORK_CONFIG.requestCacheExpiry)) {
        console.debug('Using cached response for:', url);
        return cachedResponse.response.clone();
      }
    }

    // Setup for retries
    let lastError;
    let retries = 0;

    while (retries <= NETWORK_CONFIG.maxRetries) {
      try {
        const response = await originalFetch(url, options);

        // Cache successful GET responses
        if (shouldCache && response.ok) {
          const cacheKey = `${url}:${JSON.stringify(options)}`;
          const clonedResponse = response.clone();

          requestCache.set(cacheKey, {
            response: clonedResponse,
            timestamp: Date.now()
          });

          // Maintain cache size
          if (requestCache.size > NETWORK_CONFIG.requestCacheSize) {
            // Remove oldest entry
            const oldestKey = [...requestCache.entries()]
              .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
            requestCache.delete(oldestKey);
          }
        }

        return response;
      } catch (error) {
        lastError = error;
        retries++;

        if (retries <= NETWORK_CONFIG.maxRetries) {
          console.warn(`Network request failed, retrying (${retries}/${NETWORK_CONFIG.maxRetries}):`, url);
          // Wait before retrying with exponential backoff
          await new Promise(resolve => setTimeout(resolve, NETWORK_CONFIG.retryDelay * Math.pow(2, retries - 1)));
        }
      }
    }

    // All retries failed
    console.error(`Request failed after ${NETWORK_CONFIG.maxRetries} retries:`, url, lastError);
    throw lastError;
  };
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
  initNetworkResilience: initBasicNetworkResilience,
  cleanupNetworkResilience,
  fetchWithExponentialBackoff,
  resilientFetch,
  createResilientApiClient,
  createResilientFetch
};
/**
 * Monitors network status and provides resilience
 * @param {Object} options - Configuration options
 * @param {Function} options.onStatusChange - Callback when network status changes
 * @param {number} options.maxRetries - Maximum number of retries for failed requests
 * @param {number} options.retryDelay - Base delay between retries in ms
 * @param {boolean} options.useExponentialBackoff - Whether to use exponential backoff for retries
 * @param {Array<string>} options.criticalEndpoints - Endpoints that should always be retried
 * @returns {Object} Network resilience controller
 */
export function initAdvancedNetworkResilience(options = {}) {
  const { 
    onStatusChange = null,
    maxRetries = 3,
    retryDelay = 1000,
    useExponentialBackoff = true,
    criticalEndpoints = ['/api/auth', '/api/cer', '/api/health']
  } = options;

  // Network status
  let isOnline = navigator.onLine;
  let lastConnectedTime = isOnline ? Date.now() : null;
  let connectionQuality = 'unknown'; // 'unknown', 'poor', 'good', 'excellent'
  let latencyHistory = []; // Track recent latencies to assess connection quality

  // Queue for failed requests with retry metadata
  const requestQueue = [];

  // Statistics tracking
  const stats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    retriedRequests: 0,
    successAfterRetry: 0,
    networkDowntime: 0, // in milliseconds
    lastDowntime: null,
    averageLatency: 0,
    latencySamples: 0
  };

  // Track the network status
  const handleNetworkChange = (online) => {
    const wasOnline = isOnline;
    isOnline = online;

    const now = Date.now();

    if (online) {
      // Calculate downtime if we were previously offline
      if (!wasOnline && stats.lastDowntime) {
        stats.networkDowntime += (now - stats.lastDowntime);
      }

      lastConnectedTime = now;

      // Process queue when back online with a small delay to ensure connection is stable
      setTimeout(processQueue, 1000);
    } else {
      // Mark downtime start
      stats.lastDowntime = now;
    }

    // Notify status change if callback provided
    if (wasOnline !== online && onStatusChange) {
      onStatusChange({
        online,
        lastConnectedTime,
        connectionQuality,
        queuedRequests: requestQueue.length,
        stats
      });
    }

    // Log status
    if (online) {
      console.log('🌐 Network connection restored');
    } else {
      console.log('🔌 Network connection lost');
    }
  };

  // Calculate retry delay using exponential backoff if enabled
  const calculateRetryDelay = (attempt) => {
    if (!useExponentialBackoff) return retryDelay;

    // Exponential backoff with jitter: base * 2^attempt + random jitter
    const exponentialPart = retryDelay * Math.pow(2, attempt);
    const jitter = Math.random() * retryDelay * 0.1; // 10% jitter
    return exponentialPart + jitter;
  };

  // Test connection quality periodically
  const testConnectionQuality = async () => {
    if (!isOnline) {
      connectionQuality = 'unknown';
      return connectionQuality;
    }

    try {
      const startTime = performance.now();
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      const latency = performance.now() - startTime;

      // Update latency tracking
      latencyHistory.push(latency);
      if (latencyHistory.length > 10) latencyHistory.shift();

      // Calculate average latency
      const avgLatency = latencyHistory.reduce((a, b) => a + b, 0) / latencyHistory.length;

      // Update statistics
      stats.averageLatency = ((stats.averageLatency * stats.latencySamples) + latency) / 
                            (stats.latencySamples + 1);
      stats.latencySamples++;

      // Determine connection quality based on latency and response status
      if (!response.ok) {
        connectionQuality = 'poor';
      } else if (avgLatency < 100) {
        connectionQuality = 'excellent';
      } else if (avgLatency < 300) {
        connectionQuality = 'good';
      } else {
        connectionQuality = 'poor';
      }
    } catch (error) {
      // If the test fails, set quality to poor
      connectionQuality = 'poor';
    }

    return connectionQuality;
  };

  // Start periodic connection quality testing
  const qualityTestInterval = setInterval(testConnectionQuality, 30000);

  // Process the request queue
  const processQueue = async () => {
    if (!isOnline || requestQueue.length === 0) return;

    // Process one at a time to avoid overwhelming
    while (requestQueue.length > 0 && isOnline) {
      const { 
        request, 
        resolve, 
        reject, 
        retries, 
        isCritical,
        lastAttempt
      } = requestQueue.shift();

      // If this is a retry, calculate delay based on retry count
      if (retries > 0 && lastAttempt) {
        const timeSinceLastAttempt = Date.now() - lastAttempt;
        const targetDelay = calculateRetryDelay(retries - 1);

        // If we haven't waited long enough, push back to queue
        if (timeSinceLastAttempt < targetDelay) {
          requestQueue.push({
            request, resolve, reject, retries, isCritical, lastAttempt
          });

          // Wait a bit before processing more
          await new Promise(r => setTimeout(r, 100));
          continue;
        }
      }

      try {
        const startTime = performance.now();
        const response = await fetch(request.url, request.options);
        const requestLatency = performance.now() - startTime;

        // Update statistics
        stats.successfulRequests++;
        if (retries > 0) stats.successAfterRetry++;

        // Update latency tracking
        stats.averageLatency = ((stats.averageLatency * stats.latencySamples) + requestLatency) / 
                              (stats.latencySamples + 1);
        stats.latencySamples++;

        resolve(response);
      } catch (error) {
        // Check if should retry
        if (retries < maxRetries || isCritical) {
          stats.retriedRequests++;

          // Queue for retry with incremented retry count
          requestQueue.push({
            request,
            resolve,
            reject,
            retries: retries + 1,
            isCritical,
            lastAttempt: Date.now()
          });
        } else {
          // Max retries exceeded
          stats.failedRequests++;
          reject(error);
        }
      }

      // Small pause between processing queue items
      if (requestQueue.length > 0) {
        await new Promise(r => setTimeout(r, 50));
      }
    }
  };

  // Check if URL matches critical endpoints
  const isCriticalEndpoint = (url) => {
    return criticalEndpoints.some(endpoint => url.includes(endpoint));
  };

  // Add listeners for online/offline events
  window.addEventListener('online', () => handleNetworkChange(true));
  window.addEventListener('offline', () => handleNetworkChange(false));

  // Execute a fetch with resilience
  const resilientFetch = (url, options = {}) => {
    // Track total requests
    stats.totalRequests++;

    // Determine if this is a critical request that always gets retried
    const isCritical = isCriticalEndpoint(url);

    // Add custom headers for tracking
    const enhancedOptions = {
      ...options,
      headers: {
        ...options.headers,
        'X-Request-ID': `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        'X-Client-Quality': connectionQuality
      }
    };

    if (isOnline) {
      return fetch(url, enhancedOptions)
        .then(response => {
          stats.successfulRequests++;
          return response;
        })
        .catch(error => {
          // Check if it's a network error
          if (error.name === 'TypeError' || !isOnline) {
            // Network error, queue for retry
            return new Promise((resolve, reject) => {
              requestQueue.push({
                request: { url, options: enhancedOptions },
                resolve,
                reject,
                retries: 0,
                isCritical,
                lastAttempt: Date.now()
              });
            });
          }

          // Other error, just reject
          stats.failedRequests++;
          return Promise.reject(error);
        });
    } else {
      // Already offline, queue immediately
      return new Promise((resolve, reject) => {
        requestQueue.push({
          request: { url, options: enhancedOptions },
          resolve,
          reject,
          retries: 0,
          isCritical,
          lastAttempt: Date.now()
        });
      });
    }
  };

  // Reset statistics
  const resetStats = () => {
    Object.assign(stats, {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      retriedRequests: 0,
      successAfterRetry: 0,
      networkDowntime: 0,
      lastDowntime: isOnline ? null : Date.now(),
      averageLatency: 0,
      latencySamples: 0
    });
  };

  // Initial connection quality test
  testConnectionQuality();

  // Return controller
  return {
    isOnline: () => isOnline,
    fetch: resilientFetch,
    getConnectionQuality: () => connectionQuality,
    testConnectionQuality,
    getQueueLength: () => requestQueue.length,
    getStats: () => ({ ...stats }), // Return a copy to prevent external modification
    resetStats,
    processQueue,
    cleanup: () => {
      window.removeEventListener('online', () => handleNetworkChange(true));
      window.removeEventListener('offline', () => handleNetworkChange(false));
      clearInterval(qualityTestInterval);
    }
  };
}

/**
 * Utility to check if a request should be retried based on the error and status code
 * @param {Error} error - The error that occurred
 * @param {number} statusCode - The HTTP status code (if available)
 * @returns {boolean} Whether the request should be retried
 */
export function shouldRetryRequest(error, statusCode = null) {
  // Network errors should be retried
  if (error && (error.name === 'TypeError' || error.name === 'NetworkError')) {
    return true;
  }

  // 5xx errors should be retried (server errors)
  if (statusCode && statusCode >= 500 && statusCode < 600) {
    return true;
  }

  // 429 Too Many Requests should be retried after a delay
  if (statusCode === 429) {
    return true;
  }

  // Don't retry 4xx errors (except 429)
  if (statusCode && statusCode >= 400 && statusCode < 500) {
    return false;
  }

  return false;
}