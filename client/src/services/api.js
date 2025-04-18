/**
 * API Service - Enhanced Axios wrapper for the IND Automation API
 * 
 * This service provides a consistent interface for making API requests
 * with proper error handling, logging, and response parsing.
 */
import axios from "axios";

// Create an API client configured for our backend services
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8001",
  timeout: 30000, // 30 second timeout for long-running operations
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for logging and authentication
api.interceptors.request.use(function (config) {
  // Log all API requests in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
  }
  
  // Add authentication token to requests if available
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, function (error) {
  return Promise.reject(error);
});

// Add response interceptor for error handling
api.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  // Format error messages for consistent handling
  let message = 'An unexpected error occurred';
  
  if (error.response) {
    // The server responded with a status code outside of 2xx range
    const serverError = error.response.data;
    if (serverError && serverError.detail) {
      message = serverError.detail;
    } else if (error.response.status === 404) {
      message = "Resource not found";
    } else if (error.response.status === 403) {
      message = "You don't have permission to access this resource";
    } else if (error.response.status === 401) {
      message = "Authentication required";
    } else if (error.response.status >= 500) {
      message = "Server error, please try again later";
    }
  } else if (error.request) {
    // The request was made but no response received
    message = "No response from server, please check your connection";
  }
  
  // Add the formatted message to the error object
  error.userMessage = message;
  
  // Log all API errors in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`API Error (${error.config?.method} ${error.config?.url}):`, message);
  }
  
  return Promise.reject(error);
});

/**
 * Make a GET request and return the response data
 * 
 * @param {string} url - The URL to request
 * @param {Object} params - Optional query parameters
 * @returns {Promise<any>} The response data
 */
export const getJson = async (url, params = {}) => {
  const response = await api.get(url, { params });
  return response.data;
};

/**
 * Make a POST request with JSON data
 * 
 * @param {string} url - The URL to request
 * @param {Object} data - The data to send
 * @returns {Promise<any>} The response data
 */
export const postJson = async (url, data = {}) => {
  const response = await api.post(url, data);
  return response.data;
};

/**
 * Make a PUT request with JSON data
 * 
 * @param {string} url - The URL to request
 * @param {Object} data - The data to send
 * @returns {Promise<any>} The response data
 */
export const putJson = async (url, data = {}) => {
  const response = await api.put(url, data);
  return response.data;
};

/**
 * Make a DELETE request
 * 
 * @param {string} url - The URL to request
 * @returns {Promise<any>} The response data
 */
export const deleteJson = async (url) => {
  const response = await api.delete(url);
  return response.data;
};

// Export the configured API instance for direct use if needed
export default api;