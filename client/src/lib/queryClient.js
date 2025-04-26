import { QueryClient } from '@tanstack/react-query';

/**
 * API request function for making HTTP requests
 * 
 * @param {string} method HTTP method (GET, POST, etc.)
 * @param {string} url API endpoint URL
 * @param {object} data Request body data (for POST, PUT, etc.)
 * @param {object} options Additional request options
 * @returns {Promise} Fetch promise
 */
export const apiRequest = async (method, url, data, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    method,
    headers,
    ...options,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.error || 'API request failed');
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  return response;
};

/**
 * Default fetcher function for react-query
 * 
 * @param {string} url API endpoint URL
 * @returns {Promise} Response JSON data
 */
export const defaultFetcher = async (url) => {
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.error || 'API request failed');
    error.status = response.status;
    error.data = errorData;
    throw error;
  }
  
  return response.json();
};

/**
 * Get query function with error handling options
 * 
 * @param {object} options Error handling options
 * @returns {Function} Query function for react-query
 */
export const getQueryFn = (options = {}) => {
  return async ({ queryKey }) => {
    const url = Array.isArray(queryKey) ? queryKey[0] : queryKey;
    try {
      const response = await fetch(url);
      
      if (response.status === 401 && options.on401 === 'returnNull') {
        return null;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || 'API request failed');
        error.status = response.status;
        error.data = errorData;
        throw error;
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  };
};

/**
 * Fetch FDA compliance status
 * 
 * @returns {Promise} FDA compliance status data
 */
export const fetchFDAComplianceStatus = async () => {
  return defaultFetcher('/api/fda-compliance/status');
};

/**
 * Run FDA compliance validation
 * 
 * @returns {Promise} Validation results
 */
export const runFDAComplianceValidation = async () => {
  const response = await apiRequest('POST', '/api/fda-compliance/validate');
  return response.json();
};

/**
 * Generate FDA compliance report
 * 
 * @returns {Promise} FDA compliance report data
 */
export const generateFDAComplianceReport = async () => {
  return defaultFetcher('/api/fda-compliance/report');
};

/**
 * Get blockchain status
 * 
 * @returns {Promise} Blockchain status data
 */
export const getBlockchainStatus = async () => {
  return defaultFetcher('/api/fda-compliance/blockchain/status');
};

/**
 * Get recent blockchain transactions
 * 
 * @param {number} limit Maximum number of transactions to return
 * @returns {Promise} Blockchain transactions data
 */
export const getBlockchainTransactions = async (limit = 5) => {
  return defaultFetcher(`/api/fda-compliance/blockchain/transactions?limit=${limit}`);
};

/**
 * Create QueryClient instance with default options
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn(),
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});