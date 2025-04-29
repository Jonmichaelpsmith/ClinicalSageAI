/**
 * CER (Clinical Evaluation Report) Service
 * 
 * Provides client-side methods for interacting with the CER API endpoints
 */

/**
 * Fetch all historical CER documents
 * @param {Object} filters - Optional filters (e.g., status, template)
 * @returns {Promise<Array>} List of CER records
 */
export async function fetchAllCERs(filters = {}) {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params if provided
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.template) queryParams.append('template', filters.template);
  if (filters.projectId) queryParams.append('projectId', filters.projectId);
  
  const queryString = queryParams.toString();
  const url = `/api/cer/reports${queryString ? `?${queryString}` : ''}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    console.error('Failed to fetch CER history:', await res.text());
    return [];
  }
  
  return await res.json();
}

/**
 * Generate a full CER based on provided data
 * @param {Object} data - CER generation data
 * @param {Object} data.deviceInfo - Device information
 * @param {Array} data.literature - Selected literature
 * @param {Array} data.fdaData - FDA data
 * @param {string} data.templateId - Template ID
 * @returns {Promise<Object>} Generated CER information
 */
export async function generateFullCER(data) {
  const res = await fetch('/api/cer/generate-full', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to generate CER: ${errorText}`);
  }
  
  return await res.json();
}

/**
 * Generate a sample CER based on template
 * @param {string} template - Template identifier
 * @returns {Promise<Object>} Sample CER information
 */
export async function generateSampleCER(template) {
  const res = await fetch('/api/cer/sample', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ template })
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to generate sample CER: ${errorText}`);
  }
  
  return await res.json();
}

/**
 * Submit feedback on a CER section
 * @param {string} reportId - Report ID
 * @param {string} sectionId - Section ID
 * @param {boolean} approval - Approval status
 * @param {string} comments - Feedback comments
 * @returns {Promise<Object>} Feedback submission result
 */
export async function submitCERFeedback(reportId, sectionId, approval, comments) {
  const res = await fetch('/api/cer/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reportId, sectionId, approval, comments })
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to submit feedback: ${errorText}`);
  }
  
  return await res.json();
}

/**
 * Validate a CER against eCTD schema
 * @param {string} reportId - Report ID
 * @returns {Promise<Object>} Validation results
 */
export async function validateCER(reportId) {
  const res = await fetch('/api/cer/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reportId })
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to validate CER: ${errorText}`);
  }
  
  return await res.json();
}