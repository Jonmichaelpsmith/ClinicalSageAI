/**
 * Semantic Search Service
 * 
 * This service provides advanced semantic search capabilities for 
 * medical literature, regulatory documents, and clinical trials.
 */

import { apiRequest } from '../lib/queryClient';

class SemanticSearchService {
  /**
   * Search medical literature using semantic matching
   * 
   * @param {string} query Search query
   * @param {Object} filters Search filters
   * @param {string} filters.date_range Date range filter (e.g., '1y', '5y', 'all')
   * @param {string} filters.document_type Document type filter (e.g., 'clinical_trial', 'publication')
   * @param {string} filters.source Source filter (e.g., 'pubmed', 'clinicaltrials.gov')
   * @param {number} filters.min_relevance Minimum relevance score (0-100)
   * @param {number} limit Maximum number of results
   * @returns {Promise<Object>} Search results with relevance scores
   */
  async searchMedicalLiterature(query, filters = {}, limit = 20) {
    try {
      const params = new URLSearchParams();
      params.append('query', query);
      params.append('limit', limit);
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value);
        }
      });
      
      const response = await apiRequest.get(`/api/literature/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching literature for "${query}":`, error);
      throw error;
    }
  }
  
  /**
   * Search regulatory documents
   * 
   * @param {string} query Search query
   * @param {Object} filters Search filters
   * @param {string} organizationId Optional organization ID for tenant context
   * @returns {Promise<Object>} Search results
   */
  async searchRegulatoryDocuments(query, filters = {}, organizationId = null) {
    try {
      const params = new URLSearchParams();
      params.append('query', query);
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value);
        }
      });
      
      const headers = organizationId ? { 'X-Organization-Id': organizationId } : undefined;
      
      const response = await apiRequest.get(`/api/regulatory-knowledge/search?${params.toString()}`, { headers });
      return response.data;
    } catch (error) {
      console.error(`Error searching regulatory documents for "${query}":`, error);
      throw error;
    }
  }
  
  /**
   * Search for predicate devices using semantic matching
   * 
   * @param {string} query Search query for device
   * @param {Object} filters Additional filters
   * @returns {Promise<Object>} Search results with predicate devices
   */
  async searchPredicateDevices(query, filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('query', query);
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value);
        }
      });
      
      const response = await apiRequest.get(`/api/fda510k/predicates/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching predicate devices for "${query}":`, error);
      throw error;
    }
  }
  
  /**
   * Find similar clinical trials using semantic search
   * 
   * @param {string} query Search query or trial details
   * @param {Object} filters Additional filters
   * @returns {Promise<Object>} Search results with similar trials
   */
  async findSimilarClinicalTrials(query, filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('query', query);
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value);
        }
      });
      
      const response = await apiRequest.get(`/api/clinical-trials/similar?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Error finding similar clinical trials for "${query}":`, error);
      throw error;
    }
  }
  
  /**
   * Search for applicable standards using semantic matching
   * 
   * @param {string} deviceDescription Device description for standard search
   * @param {Object} filters Additional filters
   * @returns {Promise<Object>} Search results with applicable standards
   */
  async findApplicableStandards(deviceDescription, filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('description', deviceDescription);
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value);
        }
      });
      
      const response = await apiRequest.get(`/api/fda510k/standards/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error finding applicable standards:', error);
      throw error;
    }
  }
  
  /**
   * Get literature review recommendations based on a device profile
   * 
   * @param {Object} deviceProfile Device profile data
   * @returns {Promise<Object>} Literature review recommendations
   */
  async getLiteratureReviewRecommendations(deviceProfile) {
    try {
      const response = await apiRequest.post('/api/literature/recommendations', deviceProfile);
      return response.data;
    } catch (error) {
      console.error('Error getting literature review recommendations:', error);
      throw error;
    }
  }
  
  /**
   * Generate structured literature review from search results
   * 
   * @param {Array} literatureItems Literature items to include in review
   * @param {Object} options Review generation options
   * @returns {Promise<Object>} Generated literature review
   */
  async generateLiteratureReview(literatureItems, options = {}) {
    try {
      const response = await apiRequest.post('/api/literature-review/generate', {
        literatureItems,
        options
      });
      return response.data;
    } catch (error) {
      console.error('Error generating literature review:', error);
      throw error;
    }
  }
  
  /**
   * Find state of the art articles for a medical device
   * 
   * @param {Object} deviceProfile Device profile data
   * @param {Object} options Search options
   * @returns {Promise<Object>} State of the art articles
   */
  async findStateOfArtArticles(deviceProfile, options = {}) {
    try {
      const response = await apiRequest.post('/api/cer/sota/search', {
        deviceProfile,
        options
      });
      return response.data;
    } catch (error) {
      console.error('Error finding state of art articles:', error);
      throw error;
    }
  }
  
  /**
   * Analyze clinical equivalence between devices
   * 
   * @param {Object} subjectDevice Subject device data
   * @param {Object} predicateDevice Predicate device data
   * @returns {Promise<Object>} Equivalence analysis results
   */
  async analyzeClinicalEquivalence(subjectDevice, predicateDevice) {
    try {
      const response = await apiRequest.post('/api/cer/equivalence/analyze', {
        subjectDevice,
        predicateDevice
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing clinical equivalence:', error);
      throw error;
    }
  }
}

// Create singleton instance
const semanticSearchService = new SemanticSearchService();
export default semanticSearchService;