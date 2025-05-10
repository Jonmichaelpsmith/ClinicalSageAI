/**
 * Network Resilience Hook
 * 
 * This hook provides network resilience capabilities to React components,
 * including automatic retries, offline detection, and connection status.
 * 
 * CRITICAL STABILITY COMPONENT - DO NOT MODIFY WITHOUT THOROUGH TESTING
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import networkResilience from '@/utils/networkResilience';
import { NETWORK_CONFIG } from '@/config/stabilityConfig';

/**
 * Hook for resilient network operations in React components
 * 
 * @param {Object} options Hook configuration
 * @param {string} options.baseUrl Base URL for API requests
 * @param {Object} options.defaultOptions Default fetch options
 * @returns {Object} Network resilience utilities and state
 */
export default function useNetworkResilience({
  baseUrl = '',
  defaultOptions = {}
} = {}) {
  // Track online status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Track pending requests
  const [pendingRequests, setPendingRequests] = useState(0);
  
  // Track failed requests
  const [failedRequests, setFailedRequests] = useState(0);
  
  // Create a resilient API client
  const apiClient = useRef(
    networkResilience.createResilientApiClient(baseUrl, defaultOptions)
  ).current;
  
  // Update online status
  const handleOnlineStatus = useCallback(() => {
    setIsOnline(navigator.onLine);
  }, []);
  
  // Setup network status listeners
  useEffect(() => {
    // Initialize network resilience features
    networkResilience.initNetworkResilience();
    
    // Setup listeners for online/offline events
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    // Cleanup when component unmounts
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      networkResilience.cleanupNetworkResilience();
    };
  }, [handleOnlineStatus]);
  
  // Enhanced fetch with request tracking
  const fetch = useCallback(async (url, options = {}) => {
    setPendingRequests(prev => prev + 1);
    
    try {
      const response = await networkResilience.resilientFetch(url, options);
      return response;
    } catch (error) {
      setFailedRequests(prev => prev + 1);
      throw error;
    } finally {
      setPendingRequests(prev => Math.max(0, prev - 1));
    }
  }, []);
  
  /**
   * Enhanced GET request with resilience
   */
  const get = useCallback(async (path, options = {}) => {
    setPendingRequests(prev => prev + 1);
    
    try {
      const data = await apiClient.get(path, options);
      return data;
    } catch (error) {
      setFailedRequests(prev => prev + 1);
      throw error;
    } finally {
      setPendingRequests(prev => Math.max(0, prev - 1));
    }
  }, [apiClient]);
  
  /**
   * Enhanced POST request with resilience
   */
  const post = useCallback(async (path, data, options = {}) => {
    setPendingRequests(prev => prev + 1);
    
    try {
      const response = await apiClient.post(path, data, options);
      return response;
    } catch (error) {
      setFailedRequests(prev => prev + 1);
      throw error;
    } finally {
      setPendingRequests(prev => Math.max(0, prev - 1));
    }
  }, [apiClient]);
  
  /**
   * Enhanced PUT request with resilience
   */
  const put = useCallback(async (path, data, options = {}) => {
    setPendingRequests(prev => prev + 1);
    
    try {
      const response = await apiClient.put(path, data, options);
      return response;
    } catch (error) {
      setFailedRequests(prev => prev + 1);
      throw error;
    } finally {
      setPendingRequests(prev => Math.max(0, prev - 1));
    }
  }, [apiClient]);
  
  /**
   * Enhanced DELETE request with resilience
   */
  const del = useCallback(async (path, options = {}) => {
    setPendingRequests(prev => prev + 1);
    
    try {
      const response = await apiClient.delete(path, options);
      return response;
    } catch (error) {
      setFailedRequests(prev => prev + 1);
      throw error;
    } finally {
      setPendingRequests(prev => Math.max(0, prev - 1));
    }
  }, [apiClient]);
  
  /**
   * Retry all failed requests
   */
  const retryFailedRequests = useCallback(() => {
    const networkState = apiClient.getNetworkState();
    setFailedRequests(0);
    return networkState.retryQueueSize;
  }, [apiClient]);
  
  /**
   * Get current network state
   */
  const getNetworkState = useCallback(() => {
    return apiClient.getNetworkState();
  }, [apiClient]);
  
  return {
    // Network status
    isOnline,
    pendingRequests,
    failedRequests,
    isBusy: pendingRequests > 0,
    
    // Enhanced fetch with resilience
    fetch,
    
    // API methods with resilience
    api: {
      get,
      post,
      put,
      delete: del
    },
    
    // Utility methods
    retryFailedRequests,
    getNetworkState
  };
}