/**
 * DocumentSectionRecommenderService - Service for intelligent document section recommendations
 * 
 * This service leverages AI to analyze a device profile and document content to provide 
 * intelligent recommendations for prioritizing document sections, suggesting content,
 * and highlighting regulatory gaps in documentation.
 */

import { apiRequest } from "../lib/queryClient";
import { API_BASE_URL } from "../config/constants";

/**
 * Convert errors to a standardized format
 * @param {Error} error - The error object
 * @returns {Object} Formatted error response
 */
const handleError = (error) => {
  console.error("Document Section Recommender Service Error:", error);
  return {
    success: false,
    error: error.message || "An error occurred while processing your request",
    status: error.status || 500
  };
};

export class DocumentSectionRecommenderService {
  /**
   * Get section recommendations based on device profile and document type
   * 
   * @param {Object} deviceProfile - The device profile data
   * @param {string} documentType - The document type (e.g., '510k', 'cer')
   * @param {string} organizationId - The organization ID
   * @returns {Promise<Object>} Response containing section recommendations or error
   */
  static async getSectionRecommendations(deviceProfile, documentType, organizationId) {
    try {
      const url = `${API_BASE_URL}/section-recommender/recommendations`;
      const response = await apiRequest(url, {
        method: "POST",
        body: JSON.stringify({
          deviceProfile,
          documentType,
          organizationId
        })
      });

      return {
        success: true,
        recommendations: response.recommendations || [],
        priorityOrder: response.priorityOrder || [],
        insightSummary: response.insightSummary || ""
      };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Get content suggestions for a specific document section
   * 
   * @param {Object} deviceProfile - The device profile data
   * @param {string} documentType - The document type (e.g., '510k', 'cer')
   * @param {string} sectionKey - The section key
   * @param {string} organizationId - The organization ID
   * @returns {Promise<Object>} Response containing content suggestions or error
   */
  static async getSectionContentSuggestions(deviceProfile, documentType, sectionKey, organizationId) {
    try {
      const url = `${API_BASE_URL}/section-recommender/content-suggestions`;
      const response = await apiRequest(url, {
        method: "POST",
        body: JSON.stringify({
          deviceProfile,
          documentType,
          sectionKey,
          organizationId
        })
      });

      return {
        success: true,
        suggestions: response.suggestions || [],
        keyPoints: response.keyPoints || [],
        regulatoryRequirements: response.regulatoryRequirements || []
      };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Get gap analysis for current document
   * 
   * @param {Object} deviceProfile - The device profile data
   * @param {string} documentType - The document type (e.g., '510k', 'cer')
   * @param {Object} currentContent - The current document content
   * @param {string} organizationId - The organization ID
   * @returns {Promise<Object>} Response containing gap analysis or error
   */
  static async getDocumentGapAnalysis(deviceProfile, documentType, currentContent, organizationId) {
    try {
      const url = `${API_BASE_URL}/section-recommender/gap-analysis`;
      const response = await apiRequest(url, {
        method: "POST",
        body: JSON.stringify({
          deviceProfile,
          documentType,
          currentContent,
          organizationId
        })
      });

      return {
        success: true,
        gaps: response.gaps || [],
        completeness: response.completeness || 0,
        recommendations: response.recommendations || []
      };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Get section prioritization for a document with current state
   * 
   * @param {Object} deviceProfile - The device profile data
   * @param {string} documentType - The document type (e.g., '510k', 'cer')
   * @param {Object} currentState - The current document state
   * @param {string} organizationId - The organization ID 
   * @returns {Promise<Object>} Response containing priority order or error
   */
  static async getSectionPrioritization(deviceProfile, documentType, currentState, organizationId) {
    try {
      const url = `${API_BASE_URL}/section-recommender/section-priorities`;
      const response = await apiRequest(url, {
        method: "POST",
        body: JSON.stringify({
          deviceProfile,
          documentType,
          currentState,
          organizationId
        })
      });

      return {
        success: true,
        priorityOrder: response.priorityOrder || [],
        rationale: response.rationale || {},
        nextSteps: response.nextSteps || []
      };
    } catch (error) {
      return handleError(error);
    }
  }
}

export default DocumentSectionRecommenderService;