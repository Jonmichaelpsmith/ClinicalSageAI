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
   * Check compliance for a 510(k) submission
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @returns {Promise<Object>} - Compliance report
   */
  async checkCompliance(projectId) {
    try {
      const response = await axios.get(`/api/fda510k/compliance-check/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking 510(k) compliance:', error);
      throw new Error(error.response?.data?.message || 'Failed to check compliance');
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
}

// Create and export a singleton instance
const fda510kService = new FDA510kService();
export default fda510kService;
export { fda510kService as FDA510kService };