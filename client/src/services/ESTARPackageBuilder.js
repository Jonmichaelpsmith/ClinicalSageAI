/**
 * eSTAR Package Builder Service
 * 
 * This service provides specialized methods for building, validating,
 * and generating eSTAR packages for FDA 510(k) submissions.
 */

import axios from 'axios';

class ESTARPackageBuilder {
  /**
   * Generate a normalized XML structure for the eSTAR package
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @returns {Promise<Object>} - XML structure data
   */
  async generateXMLStructure(projectId) {
    try {
      const response = await axios.post(`/api/fda510k/generate-xml/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error generating XML structure:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate XML structure');
    }
  }

  /**
   * Validate the eSTAR package and check for missing required information
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @returns {Promise<Object>} - Validation results with issues categorized by severity
   */
  async validatePackage(projectId) {
    try {
      const response = await axios.post(`/api/fda510k/validate-package/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error validating eSTAR package:', error);
      throw new Error(error.response?.data?.message || 'Failed to validate eSTAR package');
    }
  }

  /**
   * Get the list of documents for a project that can be included in the eSTAR package
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @returns {Promise<Array>} - Array of document objects with metadata
   */
  async getProjectDocuments(projectId) {
    try {
      const response = await axios.get(`/api/fda510k/project-documents/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project documents:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch project documents');
    }
  }

  /**
   * Update document selection for an eSTAR package
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @param {Array<string>} documentIds - Array of document IDs to include
   * @returns {Promise<Object>} - Update result
   */
  async updateDocumentSelection(projectId, documentIds) {
    try {
      const response = await axios.post(`/api/fda510k/update-document-selection/${projectId}`, {
        documentIds
      });
      return response.data;
    } catch (error) {
      console.error('Error updating document selection:', error);
      throw new Error(error.response?.data?.message || 'Failed to update document selection');
    }
  }

  /**
   * Generate a cover letter for the eSTAR package submission
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @param {Object} additionalInfo - Additional information for the cover letter
   * @returns {Promise<Object>} - Generated cover letter data
   */
  async generateCoverLetter(projectId, additionalInfo = {}) {
    try {
      const response = await axios.post(`/api/fda510k/generate-cover-letter/${projectId}`, additionalInfo);
      return response.data;
    } catch (error) {
      console.error('Error generating cover letter:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate cover letter');
    }
  }

  /**
   * Build and generate the final eSTAR package
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @param {Object} options - Build options
   * @param {boolean} options.includeCoverLetter - Whether to include a cover letter
   * @param {boolean} options.includeDigitalSignature - Whether to include a digital signature
   * @returns {Promise<Object>} - Build result with download URL
   */
  async buildFinalPackage(projectId, { includeCoverLetter = true, includeDigitalSignature = true } = {}) {
    try {
      const response = await axios.post(`/api/fda510k/build-final-package/${projectId}`, {
        includeCoverLetter,
        includeDigitalSignature
      });
      return response.data;
    } catch (error) {
      console.error('Error building final eSTAR package:', error);
      throw new Error(error.response?.data?.message || 'Failed to build final eSTAR package');
    }
  }

  /**
   * Submit the eSTAR package to the FDA ESG (Electronic Submissions Gateway)
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @param {Object} submissionInfo - Submission metadata
   * @returns {Promise<Object>} - Submission result with ESG tracking number
   */
  async submitToFdaEsg(projectId, submissionInfo = {}) {
    try {
      const response = await axios.post(`/api/fda510k/submit-to-esg/${projectId}`, submissionInfo);
      return response.data;
    } catch (error) {
      console.error('Error submitting to FDA ESG:', error);
      throw new Error(error.response?.data?.message || 'Failed to submit to FDA ESG');
    }
  }

  /**
   * Get submission history for a project
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @returns {Promise<Array>} - Array of submission history entries
   */
  async getSubmissionHistory(projectId) {
    try {
      const response = await axios.get(`/api/fda510k/submission-history/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching submission history:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch submission history');
    }
  }
}

// Create and export a singleton instance
const estarPackageBuilder = new ESTARPackageBuilder();
export default estarPackageBuilder;
export { ESTARPackageBuilder };