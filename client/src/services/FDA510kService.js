/**
 * FDA 510(k) Service
 * 
 * This service provides functions for interacting with FDA 510(k) submission related APIs,
 * including compliance checking, risk assessment, and document generation.
 */

import api from '../utils/api';

class FDA510kService {
  /**
   * Run a compliance check against FDA requirements
   * 
   * @param {Object} deviceProfile - Device profile data
   * @param {string} organizationId - Organization ID
   * @param {Object} options - Additional options for the compliance check
   * @returns {Promise<Object>} Compliance check results
   */
  async runComplianceCheck(deviceProfile, organizationId, options = {}) {
    try {
      const response = await api.post('/510k/compliance-check', {
        deviceProfile,
        organizationId,
        options
      });
      
      return response.data;
    } catch (error) {
      console.error('Error running compliance check:', error);
      throw error;
    }
  }
  
  /**
   * Predict FDA submission risks for a 510(k) device
   * 
   * This function uses AI to analyze device profiles, predicate comparisons, and
   * literature evidence to predict FDA clearance likelihood and identify risk factors.
   * 
   * @param {Object} deviceProfile - Device profile data
   * @param {Array} predicateDevices - Array of predicate devices
   * @param {Object} equivalenceData - Equivalence data including literature evidence
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Risk assessment results
   */
  async predictFdaSubmissionRisks(deviceProfile, predicateDevices, equivalenceData, options = {}) {
    try {
      const response = await api.post('/510k-risk-assessment/predict-submission-risks', {
        deviceProfile,
        predicateDevices,
        equivalenceData,
        options
      });
      
      return response.data;
    } catch (error) {
      console.error('Error predicting FDA submission risks:', error);
      throw error;
    }
  }
  
  /**
   * Generate AI-powered suggestions for fixing compliance issues
   * 
   * @param {Array} issues - Array of compliance issues to fix
   * @param {Object} deviceProfile - Device profile data
   * @param {Object} options - Additional options for fix generation
   * @returns {Promise<Object>} Generated fixes
   */
  async suggestFixesForComplianceIssues(issues, deviceProfile, options = {}) {
    try {
      const response = await api.post('/510k-risk-assessment/suggest-compliance-fixes', {
        issues,
        deviceProfile,
        options
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating compliance fixes:', error);
      throw error;
    }
  }
  
  /**
   * Generate software documentation template for FDA submission
   * 
   * @param {string} deviceId - Device ID
   * @returns {Promise<Object>} Generated template
   */
  async generateSoftwareDocumentationTemplate(deviceId) {
    try {
      const response = await api.post(`/510k-risk-assessment/generate-documentation-template/software`, {
        deviceId
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating software documentation template:', error);
      throw error;
    }
  }
  
  /**
   * Generate biocompatibility template for FDA submission
   * 
   * @param {string} deviceId - Device ID
   * @returns {Promise<Object>} Generated template
   */
  async generateBiocompatibilityTemplate(deviceId) {
    try {
      const response = await api.post(`/510k-risk-assessment/generate-documentation-template/biocompatibility`, {
        deviceId
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating biocompatibility template:', error);
      throw error;
    }
  }
  
  /**
   * Save compliance input data to Document Vault
   * 
   * @param {string} folderId - Document Vault folder ID
   * @param {File} file - File object to upload
   * @param {string} deviceId - Device ID
   * @returns {Promise<Object>} Upload result
   */
  async saveComplianceInput(folderId, file, deviceId) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', folderId);
      formData.append('deviceId', deviceId);
      formData.append('documentType', 'compliance-input');
      
      const response = await api.post('/document-vault/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error saving compliance input:', error);
      throw error;
    }
  }
  
  /**
   * Save compliance report to Document Vault
   * 
   * @param {string} folderId - Document Vault folder ID
   * @param {File} file - File object to upload
   * @param {string} deviceId - Device ID
   * @returns {Promise<Object>} Upload result
   */
  async saveComplianceReport(folderId, file, deviceId) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', folderId);
      formData.append('deviceId', deviceId);
      formData.append('documentType', 'compliance-report');
      
      const response = await api.post('/document-vault/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error saving compliance report:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const instance = new FDA510kService();

// Export both as default export and named export to support both import styles
export default instance;
export { instance as FDA510kService };