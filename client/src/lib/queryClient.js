/**
 * QueryClient Configuration
 * 
 * This module configures the React Query client and provides utility functions for API requests.
 */

import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

/**
 * Helper to handle HTTP errors
 * @param {Response} response - Fetch Response object
 * @param {Object} options - Options for error handling
 * @returns {Promise<Response>} Response if ok, throws otherwise
 */
async function handleErrors(response, options = {}) {
  if (!response.ok) {
    // Handle 401 specially for auth
    if (response.status === 401 && options.on401 === 'returnNull') {
      return null;
    }
    
    // Try to parse error message
    let errorMessage;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || `Error: ${response.status} ${response.statusText}`;
    } catch (e) {
      errorMessage = `Error: ${response.status} ${response.statusText}`;
    }
    
    throw new Error(errorMessage);
  }
  
  return response;
}

/**
 * API request function
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {any} body - Request body
 * @param {Object} options - Request options
 * @returns {Promise<Response>} Fetch response
 */
export async function apiRequest(method, url, body, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  
  const fetchOptions = {
    method,
    headers,
    credentials: 'include',
    ...options
  };
  
  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }
  
  return fetch(url, fetchOptions);
}

/**
 * Get a query function with error handling
 * @param {Object} options - Query function options
 * @returns {Function} Query function for React Query
 */
export function getQueryFn(options = {}) {
  return async ({ queryKey }) => {
    // Extract URL from query key
    const url = Array.isArray(queryKey) ? queryKey[0] : queryKey;
    
    // Make the fetch request
    const response = await apiRequest('GET', url, null, options);
    
    // Handle errors
    const checkedResponse = await handleErrors(response, options);
    
    // Return null for 401 if specified
    if (checkedResponse === null) {
      return undefined;
    }
    
    // Parse and return JSON
    return await checkedResponse.json();
  };
}

export default queryClient;