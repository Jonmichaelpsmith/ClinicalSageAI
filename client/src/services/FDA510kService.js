/**
 * FDA510kService
 * 
 * This service handles API interactions related to the 510(k) automation
 * workflow, including predicate device searches, literature searches,
 * regulatory pathway analysis, and 510(k) submission generation.
 */

const API_BASE_URL = '/api/510k';

/**
 * Search for predicate devices based on device information
 * 
 * @param {Object} deviceData - The device data to use for search
 * @param {string} organizationId - Optional organization ID for multi-tenant support
 * @returns {Promise<Object>} Search results with potential predicate devices
 */
export const findPredicateDevices = async (deviceData, organizationId = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (organizationId) {
      headers['X-Organization-ID'] = organizationId;
    }
    
    const response = await fetch(`${API_BASE_URL}/predicate-search`, {
      method: 'POST',
      headers,
      body: JSON.stringify(deviceData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to search for predicate devices');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error finding predicate devices:', error);
    return {
      success: false,
      error: error.message || 'Failed to search for predicate devices'
    };
  }
};

/**
 * Get a specific predicate device by ID
 * 
 * @param {string} predicateId - The 510(k) number of the predicate device
 * @param {string} organizationId - Optional organization ID for multi-tenant support
 * @returns {Promise<Object>} Predicate device details
 */
export const getPredicateById = async (predicateId, organizationId = null) => {
  try {
    const headers = {};
    
    if (organizationId) {
      headers['X-Organization-ID'] = organizationId;
    }
    
    const response = await fetch(`${API_BASE_URL}/predicate/${predicateId}`, {
      headers
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get predicate device');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting predicate device:', error);
    return {
      success: false,
      error: error.message || 'Failed to get predicate device'
    };
  }
};

/**
 * Search for relevant literature based on device information
 * 
 * @param {Object} deviceData - The device data to use for search
 * @param {string} organizationId - Optional organization ID for multi-tenant support
 * @returns {Promise<Object>} Search results with relevant scientific literature
 */
export const searchLiterature = async (deviceData, organizationId = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (organizationId) {
      headers['X-Organization-ID'] = organizationId;
    }
    
    const response = await fetch(`${API_BASE_URL}/literature-search`, {
      method: 'POST',
      headers,
      body: JSON.stringify(deviceData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to search for literature');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching literature:', error);
    return {
      success: false,
      error: error.message || 'Failed to search for literature'
    };
  }
};

/**
 * Get a specific article by PubMed ID
 * 
 * @param {string} pmid - The PubMed ID of the article
 * @param {string} organizationId - Optional organization ID for multi-tenant support
 * @returns {Promise<Object>} Article details
 */
export const getArticleById = async (pmid, organizationId = null) => {
  try {
    const headers = {};
    
    if (organizationId) {
      headers['X-Organization-ID'] = organizationId;
    }
    
    const response = await fetch(`${API_BASE_URL}/article/${pmid}`, {
      headers
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get article');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting article:', error);
    return {
      success: false,
      error: error.message || 'Failed to get article'
    };
  }
};

/**
 * Get regulatory pathway analysis for a device
 * 
 * @param {Object} deviceData - The device data to analyze
 * @param {string} organizationId - Optional organization ID for multi-tenant support
 * @returns {Promise<Object>} Regulatory pathway analysis
 */
export const analyzeRegulatoryPathway = async (deviceData, organizationId = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (organizationId) {
      headers['X-Organization-ID'] = organizationId;
    }
    
    const response = await fetch(`${API_BASE_URL}/regulatory-pathway`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        deviceProfile: deviceData,
        predicateDevices: deviceData.predicates || []
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze regulatory pathway');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing regulatory pathway:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze regulatory pathway'
    };
  }
};

/**
 * Generate an AI-drafted section for a 510(k) submission
 * 
 * @param {string} sectionType - The type of section to generate
 * @param {Object} deviceData - The device data to use for generation
 * @param {Array} predicateDevices - Array of predicate devices to reference
 * @param {string} organizationId - Optional organization ID for multi-tenant support
 * @returns {Promise<Object>} Generated section content
 */
export const generateSection = async (sectionType, deviceData, predicateDevices = [], organizationId = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (organizationId) {
      headers['X-Organization-ID'] = organizationId;
    }
    
    const response = await fetch(`${API_BASE_URL}/generate-section`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sectionType,
        deviceProfile: deviceData,
        predicateDevices
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate section');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating section:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate section'
    };
  }
};

/**
 * Run a full 510(k) draft generator for a device
 * 
 * @param {Object} deviceData - The device data to use for generation
 * @param {Array} predicateDevices - Array of predicate devices to reference
 * @param {string} organizationId - Optional organization ID for multi-tenant support
 * @returns {Promise<Object>} Generated 510(k) draft information
 */
export const generate510kDraft = async (deviceData, predicateDevices = [], organizationId = null) => {
  try {
    // In a full implementation, this would be a separate endpoint
    // For now, we'll call generateSection for each required section
    
    const sectionTypes = [
      'substantial_equivalence',
      'device_description',
      'intended_use',
      'technological_characteristics',
      'performance_testing'
    ];
    
    const sections = {};
    const errors = [];
    
    // Generate each section in parallel
    const sectionPromises = sectionTypes.map(async (sectionType) => {
      try {
        const result = await generateSection(sectionType, deviceData, predicateDevices, organizationId);
        if (result.success && result.section) {
          sections[sectionType] = result.section;
        } else {
          errors.push(`Failed to generate ${sectionType} section: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        errors.push(`Error generating ${sectionType} section: ${error.message}`);
      }
    });
    
    await Promise.all(sectionPromises);
    
    return {
      success: errors.length === 0,
      sections,
      errors: errors.length > 0 ? errors : null,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating 510(k) draft:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate 510(k) draft'
    };
  }
};

/**
 * Get list of standard 510(k) submission requirements
 * 
 * @param {string} deviceClass - Optional device class filter (I, II, III)
 * @param {string} organizationId - Optional organization ID for multi-tenant support
 * @returns {Promise<Array>} List of submission requirements
 */
export const getSubmissionRequirements = async (deviceClass = null, organizationId = null) => {
  try {
    const headers = {};
    
    if (organizationId) {
      headers['X-Organization-ID'] = organizationId;
    }
    
    let url = `${API_BASE_URL}/requirements`;
    if (deviceClass) {
      url += `?deviceClass=${deviceClass}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get submission requirements');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting submission requirements:', error);
    return {
      success: false,
      error: error.message || 'Failed to get submission requirements'
    };
  }
};

/**
 * Validate a 510(k) submission for completeness and compliance
 * 
 * @param {Object} submissionData - The submission data to validate
 * @param {string} organizationId - Optional organization ID for multi-tenant support
 * @returns {Promise<Object>} Validation results
 */
export const validateSubmission = async (submissionData, organizationId = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (organizationId) {
      headers['X-Organization-ID'] = organizationId;
    }
    
    const response = await fetch(`${API_BASE_URL}/validate-submission`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        submission: submissionData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to validate submission');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error validating submission:', error);
    return {
      success: false,
      error: error.message || 'Failed to validate submission'
    };
  }
};

/**
 * Export the FDA510kService as both a named export and default export
 */
export const FDA510kService = {
  findPredicateDevices,
  getPredicateById,
  searchLiterature,
  getArticleById,
  analyzeRegulatoryPathway,
  generateSection,
  generate510kDraft,
  getSubmissionRequirements,
  validateSubmission
};

export default FDA510kService;