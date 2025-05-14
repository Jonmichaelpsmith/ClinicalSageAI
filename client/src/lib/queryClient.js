import axios from 'axios';
import { QueryClient } from '@tanstack/react-query';

// Create axios instance with default config
export const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Default query function that works with the TenantContext
// to automatically include X-Tenant-ID header for authenticated requests
const defaultQueryFn = async ({ queryKey }) => {
  // The first item in the query key should be the endpoint URL
  const [endpoint, ...params] = queryKey;
  
  try {
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    // Handle errors consistently
    const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
    console.error(`[API Error]: ${errorMessage}`, error);
    throw new Error(errorMessage);
  }
};

// Helper for API requests with various methods (POST, PATCH, DELETE, etc.)
export const apiRequest = {
  async get(url, options = {}) {
    try {
      const response = await api.get(url, options);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
      console.error(`[API Error GET]: ${errorMessage}`, error);
      throw new Error(errorMessage);
    }
  },
  
  async post(url, data, options = {}) {
    try {
      const response = await api.post(url, data, options);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
      console.error(`[API Error POST]: ${errorMessage}`, error);
      throw new Error(errorMessage);
    }
  },
  
  async put(url, data, options = {}) {
    try {
      const response = await api.put(url, data, options);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
      console.error(`[API Error PUT]: ${errorMessage}`, error);
      throw new Error(errorMessage);
    }
  },
  
  async delete(url, options = {}) {
    try {
      const response = await api.delete(url, options);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
      console.error(`[API Error DELETE]: ${errorMessage}`, error);
      throw new Error(errorMessage);
    }
  }
};

// Create the query client with default settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default queryClient;