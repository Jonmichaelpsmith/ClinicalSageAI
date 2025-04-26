import { QueryClient } from '@tanstack/react-query';

/**
 * Function to make API requests
 * 
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {Object} body - Request body
 * @returns {Promise<Response>} - Fetch response
 */
export async function apiRequest(method, path, body) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(path, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || response.statusText || 'An error occurred');
  }

  return response;
}

/**
 * Create a query function for TanStack Query
 * 
 * @param {Object} options - Query options
 * @returns {Function} - Query function
 */
export const getQueryFn = (options = {}) => {
  return async ({ queryKey }) => {
    const [path] = queryKey;
    try {
      const response = await apiRequest('GET', path);
      return response.json();
    } catch (error) {
      if (options.on401 === 'returnNull' && error.message === 'Unauthorized') {
        return null;
      }
      throw error;
    }
  };
};

/**
 * The query client instance
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn(),
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});