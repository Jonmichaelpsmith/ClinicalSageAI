import { QueryClient } from '@tanstack/react-query';

// Default options for query fetcher
export const createDefaultOptions = () => ({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Common options for API queries that might need auth handling
export const getQueryOptions = ({ on401 = 'throw' } = {}) => ({
  staleTime: 5 * 60 * 1000, // 5 minutes
  retry: (failureCount, error) => {
    // Don't retry on 401/403
    if (error?.status === 401 || error?.status === 403) {
      if (on401 === 'returnNull') {
        return false;
      } else {
        throw new Error('Unauthorized');
      }
    }
    return failureCount < 3;
  },
});

// Fetcher function for useQuery
export const getQueryFn = (options = {}) => async ({ queryKey }) => {
  const [path] = queryKey;
  const response = await fetch(path, createDefaultOptions());

  // Handle authentication failures
  if (response.status === 401) {
    if (options.on401 === 'returnNull') {
      return null;
    } else {
      throw new Error('Unauthorized');
    }
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  // For endpoints that return no content
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// Helper for API requests (mainly for mutations)
export const apiRequest = async (method, url, body = undefined) => {
  const options = {
    method,
    ...createDefaultOptions(),
    ...(body && { body: JSON.stringify(body) }),
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Request failed with status ${response.status}`);
  }

  return response;
};

// Create the Query Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      ...getQueryOptions(),
      queryFn: getQueryFn(),
    },
  },
});