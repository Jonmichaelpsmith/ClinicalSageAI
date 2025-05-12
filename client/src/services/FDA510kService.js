/**
 * FDA 510(k) Service
 * 
 * This service handles interactions with the 510(k) API,
 * providing functionality for predicate device searches,
 * equivalence analysis, and regulatory pathway determination.
 */

import { apiRequest } from '../lib/queryClient';

class FDA510kService {
  /**
   * Search for predicate devices based on criteria
   * 
   * @param {Object} searchParams - Search parameters 
   * @param {string} searchParams.query - Text search query
   * @param {string} searchParams.productCode - FDA product code
   * @param {string} searchParams.deviceType - Type of medical device
   * @param {Array} searchParams.deviceClass - Device class (I, II, III)
   * @param {number} searchParams.page - Page number for pagination
   * @param {number} searchParams.limit - Results per page
   * @returns {Promise<Object>} - Search results with pagination
   */
  async searchPredicateDevices(searchParams) {
    try {
      const response = await apiRequest({
        url: '/api/510k/predicate-search',
        method: 'GET',
        params: searchParams
      });
      
      return response;
    } catch (error) {
      console.error('Error searching predicate devices:', error);
      throw error;
    }
  }
  
  /**
   * Get detailed information for a specific device by K-number
   * 
   * @param {string} kNumber - The FDA K-number for the device
   * @returns {Promise<Object>} - Detailed device information
   */
  async getDeviceDetails(kNumber) {
    try {
      const response = await apiRequest({
        url: `/api/510k/device/${kNumber}`,
        method: 'GET'
      });
      
      return response.device;
    } catch (error) {
      console.error('Error fetching device details:', error);
      throw error;
    }
  }
  
  /**
   * Analyze equivalence between subject and predicate devices
   * 
   * @param {Object} subjectDevice - Subject device information
   * @param {Object} predicateDevice - Predicate device information
   * @returns {Promise<Object>} - Equivalence analysis results
   */
  async analyzeEquivalence(subjectDevice, predicateDevice) {
    try {
      const response = await apiRequest({
        url: '/api/510k/analyze-equivalence',
        method: 'POST',
        data: {
          subjectDevice,
          predicateDevice
        }
      });
      
      return response.analysis;
    } catch (error) {
      console.error('Error analyzing device equivalence:', error);
      throw error;
    }
  }
  
  /**
   * Get a detailed comparison of specific aspects of two devices
   * 
   * @param {Object} subjectDevice - Subject device information
   * @param {Object} predicateDevice - Predicate device information
   * @param {string} aspect - Specific aspect to compare (e.g., 'technical', 'clinical', 'safety')
   * @returns {Promise<Object>} - Detailed comparison results
   */
  async getDetailedComparison(subjectDevice, predicateDevice, aspect) {
    try {
      const response = await apiRequest({
        url: '/api/510k/detailed-comparison',
        method: 'POST',
        data: {
          subjectDevice,
          predicateDevice,
          aspect
        }
      });
      
      return response.comparison;
    } catch (error) {
      console.error('Error getting detailed comparison:', error);
      throw error;
    }
  }
  
  /**
   * Determine the recommended regulatory pathway for a device
   * 
   * @param {Object} deviceProfile - Device profile information
   * @returns {Promise<Object>} - Regulatory pathway recommendation
   */
  async determineRegulatoryPathway(deviceProfile) {
    try {
      const response = await apiRequest({
        url: '/api/fda510k/regulatory-pathway-analysis',
        method: 'POST',
        data: {
          deviceProfile
        }
      });
      
      return response.pathway;
    } catch (error) {
      console.error('Error determining regulatory pathway:', error);
      throw error;
    }
  }
  
  /**
   * Validate a device profile for completeness and accuracy
   * 
   * @param {Object} deviceProfile - Device profile to validate
   * @returns {Promise<Object>} - Validation results
   */
  async validateDeviceProfile(deviceProfile) {
    try {
      const response = await apiRequest({
        url: '/api/510k/validate-profile',
        method: 'POST',
        data: {
          deviceProfile
        }
      });
      
      return response.validation;
    } catch (error) {
      console.error('Error validating device profile:', error);
      throw error;
    }
  }
  
  /**
   * Generate testing requirements for a device
   * 
   * @param {Object} deviceProfile - Device profile information
   * @returns {Promise<Object>} - Testing requirements
   */
  async generateTestingRequirements(deviceProfile) {
    try {
      const response = await apiRequest({
        url: '/api/510k/testing-requirements',
        method: 'POST',
        data: {
          deviceProfile
        }
      });
      
      return response.requirements;
    } catch (error) {
      console.error('Error generating testing requirements:', error);
      throw error;
    }
  }
  
  /**
   * Check if a device meets substantial equivalence criteria
   * 
   * @param {Object} subjectDevice - Subject device information
   * @param {Object} predicateDevice - Predicate device information
   * @returns {Promise<Object>} - Equivalence assessment
   */
  async checkSubstantialEquivalence(subjectDevice, predicateDevice) {
    try {
      const response = await apiRequest({
        url: '/api/510k/substantial-equivalence',
        method: 'POST',
        data: {
          subjectDevice,
          predicateDevice
        }
      });
      
      return response.assessment;
    } catch (error) {
      console.error('Error checking substantial equivalence:', error);
      throw error;
    }
  }
  
  /**
   * Generate submission timeline and milestones
   * 
   * @param {Object} deviceProfile - Device profile information
   * @param {Object} predicateDevice - Optional predicate device information
   * @returns {Promise<Object>} - Submission timeline and milestones
   */
  async generateSubmissionTimeline(deviceProfile, predicateDevice = null) {
    try {
      const response = await apiRequest({
        url: '/api/510k/submission-timeline',
        method: 'POST',
        data: {
          deviceProfile,
          predicateDevice
        }
      });
      
      return response.timeline;
    } catch (error) {
      console.error('Error generating submission timeline:', error);
      throw error;
    }
  }
  
  /**
   * Get guidance documents relevant to a device type
   * 
   * @param {string} deviceType - Type of medical device
   * @param {string} productCode - Optional FDA product code
   * @returns {Promise<Array>} - Relevant guidance documents
   */
  async getRelevantGuidance(deviceType, productCode = null) {
    try {
      const response = await apiRequest({
        url: '/api/510k/guidance-documents',
        method: 'GET',
        params: {
          deviceType,
          productCode
        }
      });
      
      return response.documents;
    } catch (error) {
      console.error('Error fetching guidance documents:', error);
      throw error;
    }
  }
  
  /**
   * Get recommended regulatory pathway for a specific project
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @returns {Promise<Object>} - Pathway recommendation details
   */
  async getPathwayRecommendation(projectId) {
    try {
      const response = await apiRequest({
        url: `/api/fda510k/pathway-recommendation/${projectId}`,
        method: 'GET'
      });
      
      return {
        recommendedPathway: response.recommendedPathway,
        alternativePathways: response.alternativePathways || [],
        rationale: response.rationale,
        estimatedTimelineInDays: response.estimatedTimelineInDays,
        requirements: response.requirements,
        confidenceScore: response.confidenceScore
      };
    } catch (error) {
      console.error('Error fetching pathway recommendation:', error);
      throw error;
    }
  }
  
  /**
   * Generate a substantial equivalence draft for a 510(k) submission
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @returns {Promise<Object>} - The generated draft text
   */
  async draftEquivalence(projectId) {
    try {
      const response = await apiRequest({
        url: '/api/fda510k/draft-equivalence',
        method: 'POST',
        data: { projectId }
      });
      
      return {
        draftText: response.draftText,
        wordCount: response.wordCount || response.draftText.split(' ').length,
        generationTime: response.generationTime || 'N/A'
      };
    } catch (error) {
      console.error('Error generating substantial equivalence draft:', error);
      throw error;
    }
  }
}

// Singleton instance
const fda510kService = new FDA510kService();

  /**
   * Get pathway comparison data for different regulatory pathways
   * 
   * @returns {Promise<Object>} Comparison data for different pathways
   */
  async getPathwayComparisonData() {
    try {
      const response = await apiRequest({
        url: '/api/fda510k/pathway-comparison',
        method: 'GET'
      });
      
      return response;
    } catch (error) {
      console.error('Error fetching pathway comparison data:', error);
      throw error;
    }
  }

  /**
   * Get historical success metrics for different pathways
   * 
   * @param {string} deviceType - Type of medical device
   * @param {string} deviceClass - Device class (I, II, III)
   * @returns {Promise<Object>} Historical success metrics
   */
  async getPathwaySuccessMetrics(deviceType, deviceClass) {
    try {
      const response = await apiRequest({
        url: '/api/fda510k/pathway-success-metrics',
        method: 'GET',
        params: { deviceType, deviceClass }
      });
      
      return response;
    } catch (error) {
      console.error('Error fetching pathway success metrics:', error);
      throw error;
    }
  }

  /**
   * Get detailed timeline for a specific regulatory pathway
   * 
   * @param {string} pathway - The regulatory pathway (e.g., "Traditional 510(k)")
   * @param {string} deviceType - Type of medical device
   * @returns {Promise<Object>} Timeline data
   */
  async getPathwayTimeline(pathway, deviceType) {
    try {
      const response = await apiRequest({
        url: '/api/fda510k/pathway-timeline',
        method: 'GET',
        params: { pathway, deviceType }
      });
      
      return response;
    } catch (error) {
      console.error('Error fetching pathway timeline:', error);
      throw error;
    }
  }

  /**
   * Get FDA guidance documents for a specific device type or pathway
   * 
   * @param {string} deviceType - Type of medical device
   * @param {string} pathway - Optional regulatory pathway
   * @returns {Promise<Array>} List of guidance documents
   */
  async getFdaGuidanceDocuments(deviceType, pathway = null) {
    try {
      const response = await apiRequest({
        url: '/api/fda510k/guidance-documents',
        method: 'GET',
        params: { deviceType, pathway }
      });
      
      return response.documents;
    } catch (error) {
      console.error('Error fetching FDA guidance documents:', error);
      throw error;
    }
  }

  /**
   * Get equivalence draft templates for various device types
   * 
   * @returns {Promise<Array>} List of available templates
   */
  async getDraftTemplates() {
    try {
      const response = await apiRequest({
        url: '/api/fda510k/draft-templates',
        method: 'GET'
      });
      
      return response.templates;
    } catch (error) {
      console.error('Error fetching draft templates:', error);
      throw error;
    }
  }

  /**
   * Save a draft version
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @param {string} draftText - The draft text to save
   * @param {string} versionName - Optional name for this version
   * @returns {Promise<Object>} Save result
   */
  async saveDraftVersion(projectId, draftText, versionName = null) {
    try {
      const response = await apiRequest({
        url: '/api/fda510k/save-draft',
        method: 'POST',
        data: { 
          projectId,
          draftText,
          versionName
        }
      });
      
      return response;
    } catch (error) {
      console.error('Error saving draft version:', error);
      throw error;
    }
  }

  /**
   * Get draft version history
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @returns {Promise<Array>} List of draft versions
   */
  async getDraftVersionHistory(projectId) {
    try {
      const response = await apiRequest({
        url: `/api/fda510k/draft-history/${projectId}`,
        method: 'GET'
      });
      
      return response.versions;
    } catch (error) {
      console.error('Error fetching draft version history:', error);
      throw error;
    }
  }

  /**
   * Export draft to different formats
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @param {string} format - Export format ('pdf', 'docx', etc.)
   * @returns {Promise<Object>} Export result with download URL
   */
  async exportDraft(projectId, format) {
    try {
      const response = await apiRequest({
        url: '/api/fda510k/export-draft',
        method: 'POST',
        data: { 
          projectId,
          format 
        }
      });
      
      return response;
    } catch (error) {
      console.error('Error exporting draft:', error);
      throw error;
    }
  }

  /**
   * Get submission progress across all 510(k) steps
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @returns {Promise<Object>} Progress data
   */
  async getSubmissionProgress(projectId) {
    try {
      const response = await apiRequest({
        url: `/api/fda510k/submission-progress/${projectId}`,
        method: 'GET'
      });
      
      return response;
    } catch (error) {
      console.error('Error fetching submission progress:', error);
      throw error;
    }
  }

  /**
   * Find relevant literature references based on draft content
   * 
   * @param {string} projectId - The ID of the 510(k) project
   * @param {string} draftText - The current draft text
   * @returns {Promise<Array>} Relevant literature references
   */
  async findRelevantLiterature(projectId, draftText) {
    try {
      const response = await apiRequest({
        url: '/api/fda510k/relevant-literature',
        method: 'POST',
        data: { 
          projectId,
          draftText 
        }
      });
      
      return response.references;
    } catch (error) {
      console.error('Error finding relevant literature:', error);
      throw error;
    }
  }
}

// Singleton instance
const fda510kService = new FDA510kService();

export default fda510kService;