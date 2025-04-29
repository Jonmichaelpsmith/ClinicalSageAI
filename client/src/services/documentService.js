/**
 * Document Service
 * 
 * Provides client-side methods for interacting with document and vault related API endpoints
 * with enhanced error handling and automatic retry capabilities.
 */

import { handleApiError, retryApiCall, withRetry } from './errorHandling';

/**
 * Fetch documents with optional filtering
 * @param {Object} filters - Filter parameters for documents
 * @param {string} filters.module - Filter by module type (cer, ind, csr, etc.)
 * @param {string} filters.section - Filter by document section
 * @param {string} filters.status - Filter by document status (draft, review, approved, etc.)
 * @param {string} filters.owner - Filter by document owner
 * @param {string} filters.search - Free text search term
 * @param {Date} filters.dateFrom - Filter by documents modified after this date
 * @param {Date} filters.dateTo - Filter by documents modified before this date
 * @param {number} page - Page number for pagination (starting from 1)
 * @param {number} limit - Number of documents per page
 * @returns {Promise<Object>} Documents and pagination information
 */
export async function fetchDocuments(filters = {}, page = 1, limit = 10) {
  // Build query string from filters
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      // Handle date objects
      if (value instanceof Date) {
        queryParams.append(key, value.toISOString());
      } else {
        queryParams.append(key, value);
      }
    }
  });
  
  // Add pagination
  queryParams.append('page', page);
  queryParams.append('limit', limit);
  
  const endpoint = `/api/docs?${queryParams.toString()}`;
  
  try {
    // Use retry mechanism with exponential backoff
    const response = await retryApiCall(async () => {
      const res = await fetch(endpoint);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch documents: ${errorText}`);
      }
      
      return res;
    }, [], { maxRetries: 2 });
    
    return await response.json();
  } catch (error) {
    // Enhanced error handling with fallback empty documents
    handleApiError('Fetch Documents', error, endpoint);
    
    // Return empty document list with pagination to prevent UI crashes
    return {
      documents: [],
      pagination: {
        page: page,
        totalPages: 1,
        totalDocuments: 0
      }
    };
  }
}

/**
 * Fetch a single document by ID
 * @param {string} id - Document ID
 * @returns {Promise<Object>} Document details
 */
export async function fetchDocument(id) {
  const endpoint = `/api/docs/${id}`;
  
  try {
    const response = await retryApiCall(async () => {
      const res = await fetch(endpoint);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch document: ${errorText}`);
      }
      
      return res;
    }, [], { maxRetries: 2 });
    
    return await response.json();
  } catch (error) {
    // Enhanced error handling
    handleApiError('Fetch Document', error, endpoint);
    
    // Return error object that can be handled gracefully by UI
    return {
      id,
      status: 'error',
      error: error.message,
      title: 'Document Unavailable',
      message: 'Unable to retrieve document. Please try again later.'
    };
  }
}

/**
 * Approve a document
 * @param {string} id - Document ID to approve
 * @returns {Promise<Object>} Updated document
 */
export async function approveDocument(id) {
  const endpoint = `/api/docs/${id}/approve`;
  
  try {
    const response = await retryApiCall(async () => {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to approve document: ${errorText}`);
      }
      
      return res;
    }, [], { maxRetries: 2 });
    
    return await response.json();
  } catch (error) {
    // Enhanced error handling
    handleApiError('Approve Document', error, endpoint);
    
    // Rethrow to allow component to handle with toast notification
    throw error;
  }
}

/**
 * Submit a document for review
 * @param {string} id - Document ID to submit for review
 * @param {string} comments - Review comments
 * @returns {Promise<Object>} Updated document
 */
export async function submitDocumentForReview(id, comments = '') {
  const endpoint = `/api/docs/${id}/review`;
  
  try {
    const response = await retryApiCall(async () => {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comments })
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to submit document for review: ${errorText}`);
      }
      
      return res;
    }, [], { maxRetries: 2 });
    
    return await response.json();
  } catch (error) {
    // Enhanced error handling
    handleApiError('Submit Document for Review', error, endpoint);
    
    // Rethrow to allow component to handle with toast notification
    throw error;
  }
}

/**
 * Fetch document history specifically for CERs
 * @param {string} deviceId - Device ID to fetch history for
 * @returns {Promise<Array>} List of CER document history
 */
export async function fetchCERHistory(deviceId) {
  const queryParams = new URLSearchParams();
  
  if (deviceId) {
    queryParams.append('deviceId', deviceId);
  }
  
  queryParams.append('module', 'cer');
  
  const endpoint = `/api/docs?${queryParams.toString()}`;
  
  try {
    const response = await retryApiCall(async () => {
      const res = await fetch(endpoint);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch CER history: ${errorText}`);
      }
      
      return res;
    }, [], { maxRetries: 2 });
    
    const result = await response.json();
    return result.documents;
  } catch (error) {
    // Enhanced error handling
    handleApiError('Fetch CER History', error, endpoint);
    
    // Return empty array to prevent UI crashes
    return [];
  }
}

/**
 * Check document service health
 * @returns {Promise<boolean>} Whether document services are available
 */
export async function checkDocumentServiceHealth() {
  try {
    const response = await fetch('/api/docs/health');
    return response.ok;
  } catch (error) {
    console.error('Document service health check failed:', error);
    return false;
  }
}