/**
 * FDA 510(k) Service
 * 
 * This service provides methods for interacting with the FDA 510(k) APIs,
 * including eSTAR package assembly, validation, and submission.
 */

import axios from 'axios';

class FDA510kService {
  /**
   * Generate a preview of the eSTAR package for a project
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @param {Object} options - Optional parameters
   * @param {boolean} options.includeCoverLetter - Whether to include AI-generated cover letter
   * @returns {Promise<Object>} - Preview data including files and compliance report
   */
  async previewESTARPackage(projectId, { includeCoverLetter = true } = {}) {
    try {
      const response = await axios.post(`/api/fda510k/preview-estar-plus/${projectId}`, {
        includeCoverLetter
      });
      
      return response.data;
    } catch (error) {
      console.error('Error previewing eSTAR package:', error);
      throw new Error(error.response?.data?.message || 'Failed to preview eSTAR package');
    }
  }

  /**
   * Build and download/upload an eSTAR package
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @param {Object} options - Optional parameters
   * @param {boolean} options.includeCoverLetter - Whether to include AI-generated cover letter
   * @param {boolean} options.autoUpload - Whether to auto-upload to FDA ESG
   * @returns {Promise<Object>} - Result object with download URL or ESG status
   */
  async buildESTARPackage(projectId, { includeCoverLetter = true, autoUpload = false } = {}) {
    try {
      const response = await axios.post(`/api/fda510k/build-estar-plus/${projectId}`, {
        includeCoverLetter,
        autoUpload
      });
      
      return response.data;
    } catch (error) {
      console.error('Error building eSTAR package:', error);
      throw new Error(error.response?.data?.message || 'Failed to build eSTAR package');
    }
  }

  /**
   * Verify digital signature on an eSTAR package
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @returns {Promise<Object>} - Verification result
   */
  async verifySignature(projectId) {
    try {
      const response = await axios.get(`/api/fda510k/verify-signature/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying digital signature:', error);
      throw new Error(error.response?.data?.message || 'Failed to verify digital signature');
    }
  }
  
  /**
   * Create default sections for a new 510(k) project
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @param {number} organizationId - The organization ID
   * @returns {Promise<Object>} - Created sections
   */
  async createDefaultSections(projectId, organizationId) {
    try {
      const response = await axios.post(`/api/fda510k/create-default-sections/${projectId}`, {
        organizationId
      });
      return response.data;
    } catch (error) {
      console.error('Error creating default sections:', error);
      throw new Error(error.response?.data?.message || 'Failed to create default sections');
    }
  }

  /**
   * Check compliance for a 510(k) submission using a project ID
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @returns {Promise<Object>} - Compliance report
   */
  async checkCompliance(projectId) {
    try {
      // Get the project details first to get the device data
      console.log('Checking compliance for project:', projectId);
      const response = await axios.get(`/api/fda510k/compliance-check/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking 510(k) compliance:', error);
      throw new Error(error.response?.data?.message || 'Failed to check compliance');
    }
  }
  
  /**
   * Run compliance check on a device profile directly
   * 
   * @param {Object} deviceData - Device profile data
   * @param {number} organizationId - The organization ID
   * @returns {Promise<Object>} - Compliance check results
   */
  async runComplianceCheck(deviceData, organizationId) {
    try {
      const response = await axios.post('/api/fda510k/compliance-check', {
        deviceData,
        organizationId
      });
      return response.data;
    } catch (error) {
      console.error('Error running compliance check:', error);
      throw new Error(error.response?.data?.message || 'Failed to run compliance check');
    }
  }

  /**
   * Get predicate device information
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @returns {Promise<Object>} - Predicate device data
   */
  async getPredicateDevices(projectId) {
    try {
      const response = await axios.get(`/api/fda510k/predicate-devices/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching predicate devices:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch predicate devices');
    }
  }

  /**
   * Add a new predicate device
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @param {Object} deviceData - Predicate device data
   * @returns {Promise<Object>} - Added device data
   */
  async addPredicateDevice(projectId, deviceData) {
    try {
      const response = await axios.post(`/api/fda510k/predicate-devices/${projectId}`, deviceData);
      return response.data;
    } catch (error) {
      console.error('Error adding predicate device:', error);
      throw new Error(error.response?.data?.message || 'Failed to add predicate device');
    }
  }
  
  /**
   * Find predicate devices based on device characteristics
   * 
   * @param {Object} deviceData - Device characteristics to match against
   * @param {number} organizationId - The organization ID
   * @param {Object} relevanceCriteria - Optional criteria for weighting different device aspects
   * @returns {Promise<Object>} - Found predicate devices and literature references
   */
  async findPredicateDevices(deviceData, organizationId, relevanceCriteria = null) {
    try {
      const response = await axios.post('/api/fda510k/find-predicates', {
        deviceData,
        organizationId,
        relevanceCriteria
      });
      return response.data;
    } catch (error) {
      console.error('Error finding predicate devices:', error);
      throw new Error(error.response?.data?.message || 'Failed to find predicate devices');
    }
  }
  
  /**
   * Summarize text using NLP
   * 
   * @param {string} text - The text to summarize
   * @returns {Promise<string>} - Generated summary
   */
  async summarizeText(text) {
    try {
      const response = await axios.post('/api/fda510k/summarize', {
        text
      });
      return response.data.summary;
    } catch (error) {
      console.error('Error summarizing text:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate summary');
    }
  }
  
  /**
   * Find predicate devices and literature references (alias method)
   * 
   * This method is an alias for findPredicateDevices to ensure both naming
   * conventions work in the application.
   * 
   * @param {Object} deviceData - Device characteristics to match against
   * @param {number} organizationId - The organization ID
   * @param {Object} relevanceCriteria - Optional criteria for weighting different device aspects
   * @returns {Promise<Object>} - Found predicate devices and literature references
   */
  async findPredicatesAndLiterature(deviceData, organizationId, relevanceCriteria = null) {
    console.log('Finding predicates and literature for device:', deviceData.deviceName);
    if (relevanceCriteria) {
      console.log('Using custom relevance criteria:', relevanceCriteria);
    }
    return this.findPredicateDevices(deviceData, organizationId, relevanceCriteria);
  }
  
  /**
   * Analyze and recommend regulatory pathway for a device
   * 
   * @param {Object} deviceData - Device characteristics to analyze
   * @param {number} organizationId - The organization ID
   * @returns {Promise<Object>} - Regulatory pathway analysis
   */
  async analyzeRegulatoryPathway(deviceData, organizationId) {
    try {
      const response = await axios.post('/api/fda510k/analyze-pathway', {
        deviceData,
        organizationId
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing regulatory pathway:', error);
      throw new Error(error.response?.data?.message || 'Failed to analyze regulatory pathway');
    }
  }
  
  /**
   * Get 510(k) submission requirements for a device class
   * 
   * @param {string} deviceClass - Device classification (I, II, III)
   * @returns {Promise<Object>} - Submission requirements
   */
  async getRequirements(deviceClass) {
    try {
      const response = await axios.get(`/api/fda510k/requirements/${deviceClass}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching 510(k) requirements:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch requirements');
    }
  }
  
  /**
   * Get analysis for a specific submission requirement
   * 
   * @param {string} requirementId - The requirement ID
   * @param {string} projectId - The 510(k) project ID
   * @returns {Promise<Object>} - Requirement analysis
   */
  async getRequirementAnalysis(requirementId, projectId) {
    try {
      const response = await axios.get(`/api/fda510k/requirement-analysis/${requirementId}/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching requirement analysis:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch requirement analysis');
    }
  }
  
  /**
   * Get AI-generated recommendations for predicate devices based on device profile
   * 
   * @param {Object} deviceProfile - Device profile data to generate recommendations for
   * @returns {Promise<Array>} - List of recommended predicate devices
   */
  async getRecommendations(deviceProfile) {
    try {
      const response = await axios.post('/api/fda510k/recommend', {
        deviceProfile
      });
      
      return response.data.recommendations || [];
    } catch (error) {
      console.error('Error getting predicate recommendations:', error);
      throw new Error(error.response?.data?.message || 'Failed to get recommendations');
    }
  }
  
  /**
   * Perform semantic search on predicate devices using natural language
   * 
   * @param {string} query - Natural language query describing the device or requirements
   * @returns {Promise<Array>} - Search results with relevance scores
   */
  async semanticSearch(query) {
    try {
      const response = await axios.post('/api/fda510k/semantic-search', {
        query
      });
      
      return response.data.results || [];
    } catch (error) {
      console.error('Error performing semantic search:', error);
      throw new Error(error.response?.data?.message || 'Failed to perform semantic search');
    }
  }
}

// Create and export a singleton instance
const fda510kService = new FDA510kService();
export default fda510kService;
export { FDA510kService };