/**
 * ESTARPackageBuilder Service
 *
 * This service handles the creation, validation, and management of FDA eSTAR packages
 * for 510(k) submissions. It provides methods for assembling documents, validating content,
 * generating proper XML structure, and creating submission-ready packages.
 */

import apiRequest from '../lib/queryClient';

/**
 * Main ESTARPackageBuilder class implementing the singleton pattern
 */
class ESTARPackageBuilder {
  constructor() {
    if (ESTARPackageBuilder.instance) {
      return ESTARPackageBuilder.instance;
    }
    
    ESTARPackageBuilder.instance = this;
  }

  /**
   * Get available templates for eSTAR packages
   * @returns {Promise<Array>} Available eSTAR templates
   */
  async getTemplates() {
    try {
      const response = await apiRequest('/api/510k/estar-templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching eSTAR templates:', error);
      throw error;
    }
  }

  /**
   * Get required documents for an eSTAR package based on device type
   * @param {string} deviceType - The type of medical device
   * @param {string} submissionType - The type of 510(k) submission (Traditional, Abbreviated, Special)
   * @returns {Promise<Array>} Required documents list
   */
  async getRequiredDocuments(deviceType, submissionType) {
    try {
      const response = await apiRequest('/api/510k/estar-required-documents', {
        method: 'POST',
        data: { deviceType, submissionType }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching required documents:', error);
      throw error;
    }
  }

  /**
   * Validate an eSTAR package for completeness and compliance
   * @param {Object} packageData - The package data to validate
   * @returns {Promise<Object>} Validation results with issues if any
   */
  async validatePackage(packageData) {
    try {
      const response = await apiRequest('/api/510k/estar-validate', {
        method: 'POST',
        data: packageData
      });
      return response.data;
    } catch (error) {
      console.error('Error validating eSTAR package:', error);
      throw error;
    }
  }

  /**
   * Generate an eSTAR package in the correct XML format
   * @param {Object} packageData - The package data to build
   * @returns {Promise<Object>} Generated package details
   */
  async buildPackage(packageData) {
    try {
      const response = await apiRequest('/api/510k/estar-build', {
        method: 'POST',
        data: packageData
      });
      return response.data;
    } catch (error) {
      console.error('Error building eSTAR package:', error);
      throw error;
    }
  }

  /**
   * Get details about a specific eSTAR package
   * @param {string} packageId - The ID of the package to get
   * @returns {Promise<Object>} Package details
   */
  async getPackageDetails(packageId) {
    try {
      const response = await apiRequest(`/api/510k/estar-package/${packageId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching package details:', error);
      throw error;
    }
  }

  /**
   * Submit an eSTAR package to the FDA ESG
   * @param {string} packageId - The ID of the package to submit
   * @param {Object} submissionDetails - Additional submission details
   * @returns {Promise<Object>} Submission result
   */
  async submitPackage(packageId, submissionDetails) {
    try {
      const response = await apiRequest('/api/510k/estar-submit', {
        method: 'POST',
        data: { packageId, ...submissionDetails }
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting eSTAR package:', error);
      throw error;
    }
  }

  /**
   * Generate an XML structure from document metadata
   * @param {Object} metadata - Document metadata
   * @returns {string} XML structure
   */
  generateXmlStructure(metadata) {
    // In a real implementation, this would create proper XML
    // This is a simplified example that would be replaced with a real XML builder
    const header = `<?xml version="1.0" encoding="UTF-8"?>
<eSTAR-Submission xmlns="http://www.fda.gov/eSTAR" 
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                xsi:schemaLocation="http://www.fda.gov/eSTAR eSTAR_510k_Schema.xsd" 
                submissionType="${metadata.submissionType || 'Traditional'}">`;
    
    const footer = '</eSTAR-Submission>';
    
    // Build sections based on metadata
    const sections = Object.entries(metadata.sections || {}).map(([key, value]) => {
      return `  <${key}>\n    ${this._buildXmlContent(value)}\n  </${key}>`;
    }).join('\n  \n');
    
    return `${header}\n${sections}\n${footer}`;
  }
  
  /**
   * Internal helper to build XML content
   * @private
   */
  _buildXmlContent(data) {
    if (typeof data === 'string') {
      return data;
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this._buildXmlContent(item)).join('\n    ');
    }
    
    if (typeof data === 'object' && data !== null) {
      return Object.entries(data).map(([key, value]) => {
        return `<${key}>${this._buildXmlContent(value)}</${key}>`;
      }).join('\n    ');
    }
    
    return String(data);
  }
}

// Export a singleton instance
export default new ESTARPackageBuilder();