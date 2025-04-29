/**
 * CER Service
 * Provides client-side methods for interacting with CER API endpoints with
 * enhanced error handling and fallback strategies for SLA reliability.
 */

import { handleApiError, retryApiCall, withRetry } from './errorHandling';

// Fallback CER templates that can be used when API is unavailable
const FALLBACK_TEMPLATES = {
  'template_mdr_full': { templateId: 'template_mdr_full', name: 'EU MDR 2017/745 Full Template' },
  'template_mdr_lite': { templateId: 'template_mdr_lite', name: 'EU MDR Simplified Template' },
  'template_meddev': { templateId: 'template_meddev', name: 'MEDDEV 2.7/1 Rev 4 Template' }
};

/**
 * Generate a full CER (Clinical Evaluation Report)
 * @param {Object} params - Parameters for CER generation
 * @param {Object} params.deviceInfo - Device information (name, type, manufacturer)
 * @param {Array} params.literature - Selected literature references
 * @param {Array} params.fdaData - FDA adverse event data
 * @param {string} params.templateId - Template identifier
 * @returns {Promise<Object>} Generated CER data
 */
export async function generateFullCER(params) {
  const endpoint = '/api/cer/generate-full';
  
  try {
    // Use retry mechanism with exponential backoff
    const response = await retryApiCall(async () => {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      
      if (!res.ok) {
        throw new Error(`Failed to generate CER: ${res.statusText}`);
      }
      
      return res;
    }, [], { maxRetries: 2, baseDelay: 1000 });
    
    return await response.json();
  } catch (error) {
    // Advanced error handling with context
    const enhancedError = handleApiError('CER Generation', error, endpoint, () => {
      // Create a basic placeholder response when all retries fail
      // This prevents the UI from crashing, letting users try again later
      return {
        id: `error-${Date.now()}`,
        status: 'error',
        message: 'Failed to generate CER. Please try again later.',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    });
    
    // Only throw if we don't have a fallback response
    if (!enhancedError.id) {
      throw enhancedError;
    }
    
    return enhancedError;
  }
}

/**
 * Fetch all CER reports for the current user
 * @returns {Promise<Array>} List of CER reports
 */
export async function fetchAllCERs() {
  const endpoint = '/api/cer/reports';
  
  try {
    const response = await retryApiCall(async () => {
      const res = await fetch(endpoint);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch CER reports: ${res.statusText}`);
      }
      
      return res;
    }, [], { maxRetries: 2 });
    
    return await response.json();
  } catch (error) {
    // Enhanced error handling with fallback data
    handleApiError('Fetch CER Reports', error, endpoint, () => {
      // Return an empty array with an error flag when all retries fail
      // This prevents the UI from crashing
      return [];
    });
    
    // Return empty array to prevent UI crashes
    return [];
  }
}

/**
 * Fetch a specific CER report by ID
 * @param {string} id - Report ID
 * @returns {Promise<Object>} CER report data
 */
export async function fetchCERReport(id) {
  const endpoint = `/api/cer/report/${id}`;
  
  try {
    const response = await retryApiCall(async () => {
      const res = await fetch(endpoint);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch CER report: ${res.statusText}`);
      }
      
      return res;
    }, [], { maxRetries: 2 });
    
    return await response.json();
  } catch (error) {
    // Enhanced error handling with context
    handleApiError('Fetch CER Report', error, endpoint);
    
    // Return error object that can be handled by the UI
    return {
      id,
      status: 'error',
      message: `Could not retrieve report ${id}. Please try again later.`,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Generate a sample CER based on a template
 * @param {string} template - Template identifier
 * @returns {Promise<Object>} Sample CER data with URL
 */
export async function generateSampleCER(template) {
  const endpoint = '/api/cer/sample';
  
  try {
    const response = await retryApiCall(async () => {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ template })
      });
      
      if (!res.ok) {
        throw new Error(`Failed to generate sample CER: ${res.statusText}`);
      }
      
      return res;
    }, [], { maxRetries: 2 });
    
    return await response.json();
  } catch (error) {
    // Enhanced error handling with fallback
    handleApiError('Generate Sample CER', error, endpoint);
    
    // Return fallback path to a static sample file to prevent UI crashes
    return {
      url: `/samples/fallback-${template}-sample.pdf`,
      success: false,
      error: error.message
    };
  }
}

/**
 * Get available CER templates with fallback
 * @returns {Promise<Array>} List of available templates
 */
export async function getCERTemplates() {
  const endpoint = '/api/cer/templates';
  
  try {
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CER templates: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    // Enhanced error handling with context
    handleApiError('Fetch CER Templates', error, endpoint);
    
    // Return fallback templates to prevent UI crashes
    return Object.values(FALLBACK_TEMPLATES);
  }
}

/**
 * Check if CER services are available
 * @returns {Promise<boolean>} Whether services are available
 */
export async function checkCERServicesHealth() {
  try {
    const response = await fetch('/api/cer/health');
    return response.ok;
  } catch (error) {
    console.error('CER services health check failed:', error);
    return false;
  }
}