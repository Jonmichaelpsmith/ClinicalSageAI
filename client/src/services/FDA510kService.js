/**
 * FDA 510(k) Service
 * 
 * This service handles interactions with the 510(k) API endpoints,
 * including eSTAR integration, package validation, and workflow management.
 */

import { apiRequest } from '../lib/queryClient';

class FDA510kService {
  /**
   * Fetch a list of all 510(k) projects
   * 
   * @returns Promise with array of projects
   */
  async fetchProjects() {
    try {
      const response = await apiRequest.get('/api/fda510k/projects');
      return response.data;
    } catch (error) {
      console.error('Error fetching 510(k) projects:', error);
      throw error;
    }
  }

  /**
   * Fetch a specific 510(k) project by ID
   * 
   * @param {string} projectId Project ID
   * @returns Promise with project data
   */
  async fetchProject(projectId) {
    try {
      const response = await apiRequest.get(`/api/fda510k/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching 510(k) project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Validate an eSTAR package for FDA compliance
   * 
   * @param {string} projectId Project ID
   * @param {boolean} strictMode Whether to apply strict validation rules
   * @returns Promise with validation result (issues and score)
   */
  async validateESTARPackage(projectId, strictMode = false) {
    try {
      const response = await apiRequest.post(`/api/fda510k/estar/validate`, {
        projectId,
        strictMode
      });
      return response.data;
    } catch (error) {
      console.error(`Error validating eSTAR package for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Build an eSTAR package for submission
   * 
   * @param {string} projectId Project ID
   * @param {Object} options Build options
   * @returns Promise with build result
   */
  async buildESTARPackage(projectId, options = {}) {
    try {
      const response = await apiRequest.post(`/api/fda510k/estar/build`, {
        projectId,
        options
      });
      return response.data;
    } catch (error) {
      console.error(`Error building eSTAR package for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Submit an eSTAR package to FDA
   * 
   * @param {string} projectId Project ID
   * @param {Object} options Submission options
   * @returns Promise with submission result
   */
  async submitESTARPackage(projectId, options = {}) {
    try {
      const response = await apiRequest.post(`/api/fda510k/estar/submit`, {
        projectId,
        options
      });
      return response.data;
    } catch (error) {
      console.error(`Error submitting eSTAR package for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Integrate an eSTAR package with workflow
   * 
   * @param {string} reportId Report ID from which to create the eSTAR package
   * @param {string} projectId Project ID
   * @param {Object} options Integration options including validation preferences
   * @returns Promise with integration result
   */
  async integrateWithESTAR(reportId, projectId, options = {}) {
    try {
      // Extract options
      const { validateFirst = true, strictValidation = false } = options;
      
      // If validation is requested, perform it first
      let validationResult = null;
      if (validateFirst) {
        try {
          validationResult = await this.validateESTARPackage(projectId, strictValidation);
          
          // If validation fails and we're in strict mode, return the validation result
          if (strictValidation && validationResult && !validationResult.valid) {
            return {
              success: false,
              validated: true,
              packageGenerated: false,
              validationResult,
              message: 'eSTAR package validation failed. Please resolve the issues before proceeding.'
            };
          }
        } catch (validationError) {
          console.warn('Validation error, but continuing with integration:', validationError);
        }
      }
      
      // Proceed with integration
      const response = await apiRequest.post(`/api/fda510k/estar/workflow/integrate`, {
        reportId,
        projectId,
        validationResult: validationResult?.result, // Match server schema expectation
        options
      });
      
      // Enhance the response with validation data if performed
      return {
        ...response.data,
        validated: !!validationResult,
        validationResult
      };
    } catch (error) {
      console.error(`Error integrating eSTAR with workflow for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch predicate devices for comparison
   * 
   * @param {string} searchTerm Search term for predicate devices
   * @returns Promise with array of predicate devices
   */
  async fetchPredicateDevices(searchTerm) {
    try {
      const response = await apiRequest.get(`/api/fda510k/predicates`, {
        params: { search: searchTerm }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching predicate devices:', error);
      throw error;
    }
  }

  /**
   * Add a predicate device to a 510(k) project
   * 
   * @param {string} projectId Project ID
   * @param {Object} predicateDevice Predicate device data
   * @returns Promise with updated project data
   */
  async addPredicateDevice(projectId, predicateDevice) {
    try {
      const response = await apiRequest.post(`/api/fda510k/projects/${projectId}/predicates`, predicateDevice);
      return response.data;
    } catch (error) {
      console.error(`Error adding predicate device to project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Generate a FDA-compliant PDF for a 510(k) section
   * 
   * @param {string} projectId Project ID
   * @param {string} sectionId Section ID
   * @returns Promise with PDF URL
   */
  async generateSectionPDF(projectId, sectionId) {
    try {
      const response = await apiRequest.post(`/api/fda510k/pdf/section`, {
        projectId,
        sectionId
      });
      return response.data;
    } catch (error) {
      console.error(`Error generating PDF for section ${sectionId}:`, error);
      throw error;
    }
  }

  /**
   * Generate a complete FDA-compliant 510(k) submission PDF
   * 
   * @param {string} projectId Project ID
   * @returns Promise with PDF URL
   */
  async generateSubmissionPDF(projectId) {
    try {
      const response = await apiRequest.post(`/api/fda510k/pdf/submission`, {
        projectId
      });
      return response.data;
    } catch (error) {
      console.error(`Error generating submission PDF for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch FDA requirements for a specific section
   * 
   * @param {string} sectionId Section ID
   * @returns Promise with section requirements
   */
  async fetchSectionRequirements(sectionId) {
    try {
      const response = await apiRequest.get(`/api/fda510k/requirements/${sectionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching requirements for section ${sectionId}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export default new FDA510kService();