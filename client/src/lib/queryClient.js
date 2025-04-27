import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: import.meta.env.PROD, // Only in production
    },
  },
});

/**
 * Helper function to create a query function for React Query
 * @param {Object} options - Options for the fetch function
 * @param {string} options.on401 - What to do when a 401 error occurs. 'throw' (default) or 'returnNull'
 * @returns {Function} A fetch function for React Query
 */
export const getQueryFn = (options = {}) => {
  const { on401 = 'throw' } = options;

  return async ({ queryKey }) => {
    const [url, params] = Array.isArray(queryKey) ? queryKey : [queryKey];
    
    try {
      const response = await apiRequest('GET', url, params);
      
      // Handle 204 No Content responses
      if (response.status === 204) return null;
      
      return await response.json();
    } catch (error) {
      if (error.status === 401 && on401 === 'returnNull') {
        return null;
      }
      throw error;
    }
  };
};

/**
 * Helper function to make API requests
 * @param {string} method - The HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param {string} url - The URL to make the request to
 * @param {Object} body - The body of the request
 * @returns {Promise<Response>} The fetch response
 */
export const apiRequest = async (method, url, body = undefined) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const options = {
    method,
    headers,
    credentials: 'include',
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = new Error(response.statusText);
    error.status = response.status;
    
    try {
      const data = await response.json();
      error.message = data.message || error.message;
      error.details = data;
    } catch (e) {
      // Ignore JSON parsing errors
    }
    
    throw error;
  }

  return response;
};