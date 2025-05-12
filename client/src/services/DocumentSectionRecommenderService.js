/**
 * DocumentSectionRecommenderService
 * 
 * This service provides functionality for recommending document sections for regulatory submissions,
 * analyzing content gaps, and generating section content suggestions based on device profiles.
 */

import { apiRequest } from '@/lib/queryClient';

class DocumentSectionRecommenderService {
  /**
   * Get recommended sections for a document type
   * 
   * @param {string} documentType - The type of document (e.g., '510k', 'cer')
   * @param {Object} deviceProfile - The device profile information
   * @returns {Promise<Array>} - List of recommended sections with priorities
   */
  async getRecommendedSections(documentType, deviceProfile) {
    try {
      const response = await apiRequest('/api/document-recommender/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType,
          deviceProfile,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get recommended sections: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.sections || [];
    } catch (error) {
      console.error('Error in getRecommendedSections:', error);
      throw error;
    }
  }
  
  /**
   * Analyze content gaps in a document
   * 
   * @param {string} documentType - The type of document (e.g., '510k', 'cer')
   * @param {Object} deviceProfile - The device profile information
   * @param {Object} existingContent - Content that already exists in the document
   * @returns {Promise<Object>} - Analysis of content gaps
   */
  async analyzeContentGaps(documentType, deviceProfile, existingContent) {
    try {
      const response = await apiRequest('/api/document-recommender/gap-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType,
          deviceProfile,
          existingContent,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to analyze content gaps: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.analysis || {};
    } catch (error) {
      console.error('Error in analyzeContentGaps:', error);
      throw error;
    }
  }
  
  /**
   * Get content suggestions for a specific section
   * 
   * @param {string} documentType - The type of document (e.g., '510k', 'cer')
   * @param {string} sectionKey - The key of the section to get suggestions for
   * @param {Object} deviceProfile - The device profile information
   * @param {Object} predicateDevice - Optional predicate device information (for 510k)
   * @returns {Promise<Object>} - Content suggestions for the section
   */
  async getSectionSuggestions(documentType, sectionKey, deviceProfile, predicateDevice = null) {
    try {
      const payload = {
        documentType,
        sectionKey,
        deviceProfile,
      };
      
      if (predicateDevice) {
        payload.predicateDevice = predicateDevice;
      }
      
      const response = await apiRequest('/api/document-recommender/section-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get section suggestions: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.suggestions || {};
    } catch (error) {
      console.error('Error in getSectionSuggestions:', error);
      throw error;
    }
  }
  
  /**
   * Get section templates for a document type
   * 
   * @param {string} documentType - The type of document (e.g., '510k', 'cer')
   * @returns {Promise<Object>} - Section templates
   */
  async getSectionTemplates(documentType) {
    try {
      const response = await apiRequest(`/api/document-recommender/templates?type=${documentType}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get section templates: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.templates || {};
    } catch (error) {
      console.error('Error in getSectionTemplates:', error);
      throw error;
    }
  }
  
  /**
   * Generate regulatory overview based on device profile
   * 
   * @param {string} documentType - The type of document (e.g., '510k', 'cer')
   * @param {Object} deviceProfile - The device profile information
   * @returns {Promise<Object>} - Regulatory overview
   */
  async generateRegulatoryOverview(documentType, deviceProfile) {
    try {
      const response = await apiRequest('/api/document-recommender/regulatory-overview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType,
          deviceProfile,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate regulatory overview: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.overview || {};
    } catch (error) {
      console.error('Error in generateRegulatoryOverview:', error);
      throw error;
    }
  }
}

export default new DocumentSectionRecommenderService();