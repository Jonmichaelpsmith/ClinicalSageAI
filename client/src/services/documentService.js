/**
 * Document Service
 * 
 * Provides client-side methods for interacting with document and vault related API endpoints
 */

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
  
  // Make API request
  const response = await fetch(`/api/docs?${queryParams.toString()}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch documents: ${errorText}`);
  }
  
  return await response.json();
}

/**
 * Fetch a single document by ID
 * @param {string} id - Document ID
 * @returns {Promise<Object>} Document details
 */
export async function fetchDocument(id) {
  const response = await fetch(`/api/docs/${id}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch document: ${errorText}`);
  }
  
  return await response.json();
}

/**
 * Approve a document
 * @param {string} id - Document ID to approve
 * @returns {Promise<Object>} Updated document
 */
export async function approveDocument(id) {
  const response = await fetch(`/api/docs/${id}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to approve document: ${errorText}`);
  }
  
  return await response.json();
}

/**
 * Submit a document for review
 * @param {string} id - Document ID to submit for review
 * @param {string} comments - Review comments
 * @returns {Promise<Object>} Updated document
 */
export async function submitDocumentForReview(id, comments = '') {
  const response = await fetch(`/api/docs/${id}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ comments })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to submit document for review: ${errorText}`);
  }
  
  return await response.json();
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
  
  const response = await fetch(`/api/docs?${queryParams.toString()}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch CER history: ${errorText}`);
  }
  
  const result = await response.json();
  return result.documents;
}