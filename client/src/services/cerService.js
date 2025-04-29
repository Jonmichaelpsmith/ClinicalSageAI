/**
 * CER Service
 * Provides client-side methods for interacting with CER API endpoints
 */

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
  try {
    const response = await fetch('/api/cer/generate-full', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate CER: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in generateFullCER:', error);
    throw error;
  }
}

/**
 * Fetch all CER reports for the current user
 * @returns {Promise<Array>} List of CER reports
 */
export async function fetchAllCERs() {
  try {
    const response = await fetch('/api/cer/reports');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CER reports: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in fetchCERReports:', error);
    throw error;
  }
}

/**
 * Fetch a specific CER report by ID
 * @param {string} id - Report ID
 * @returns {Promise<Object>} CER report data
 */
export async function fetchCERReport(id) {
  try {
    const response = await fetch(`/api/cer/report/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CER report: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in fetchCERReport:', error);
    throw error;
  }
}

/**
 * Generate a sample CER based on a template
 * @param {string} template - Template identifier
 * @returns {Promise<Object>} Sample CER data with URL
 */
export async function generateSampleCER(template) {
  try {
    const response = await fetch('/api/cer/sample', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ template })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate sample CER: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in generateSampleCER:', error);
    throw error;
  }
}