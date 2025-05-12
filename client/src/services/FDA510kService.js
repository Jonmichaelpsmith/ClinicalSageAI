/**
 * FDA510kService
 * 
 * This service provides functionality for working with FDA 510(k) Premarket Notifications,
 * including predicate device search, substantial equivalence analysis, and recommendations
 * for regulatory submissions.
 */
 
import { apiRequest } from '@/lib/queryClient';

class FDA510kService {
  /**
   * Search for predicate devices based on search term and optional filters
   * 
   * @param {string} searchTerm - Term to search for (device name, product code, etc.)
   * @param {string} productCode - Optional product code filter
   * @returns {Promise<Array>} - List of matching predicate devices
   */
  async searchPredicateDevices(searchTerm, productCode = null) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('term', searchTerm);
      
      if (productCode) {
        queryParams.append('product_code', productCode);
      }
      
      const response = await apiRequest(`/api/510k/predicate-search?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error in searchPredicateDevices:', error);
      throw error;
    }
  }
  
  /**
   * Get detailed information about a specific predicate device
   * 
   * @param {string} kNumber - K-number of the predicate device
   * @returns {Promise<Object>} - Detailed predicate device information
   */
  async getPredicateDetails(kNumber) {
    try {
      const response = await apiRequest(`/api/510k/predicate/${kNumber}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get predicate details: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.predicateDevice || {};
    } catch (error) {
      console.error('Error in getPredicateDetails:', error);
      throw error;
    }
  }
  
  /**
   * Draft a substantial equivalence analysis between subject and predicate devices
   * 
   * @param {Object} subjectDevice - The subject device information
   * @param {Object} predicateDevice - The predicate device information
   * @returns {Promise<Object>} - Substantial equivalence analysis
   */
  async draftEquivalence(subjectDevice, predicateDevice) {
    try {
      const response = await apiRequest('/api/510k/equivalence-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectDevice,
          predicateDevice,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to draft equivalence: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.analysis || null;
    } catch (error) {
      console.error('Error in draftEquivalence:', error);
      throw error;
    }
  }
  
  /**
   * Get recommendations based on equivalence analysis
   * 
   * @param {Object} subjectDevice - The subject device information
   * @param {Object} predicateDevice - The predicate device information
   * @param {Object} analysis - The equivalence analysis
   * @returns {Promise<Object>} - Recommendations
   */
  async getRecommendations(subjectDevice, predicateDevice, analysis) {
    try {
      const response = await apiRequest('/api/510k/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectDevice,
          predicateDevice,
          analysis,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get recommendations: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.recommendations || { text: '' };
    } catch (error) {
      console.error('Error in getRecommendations:', error);
      throw error;
    }
  }
  
  /**
   * Save a device profile
   * 
   * @param {Object} organizationId - The organization ID
   * @param {Object} deviceProfile - The device profile to save
   * @returns {Promise<Object>} - The saved device profile
   */
  async saveDeviceProfile(organizationId, deviceProfile) {
    try {
      const response = await apiRequest('/api/510k/device-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          deviceProfile,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save device profile: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.profile || null;
    } catch (error) {
      console.error('Error in saveDeviceProfile:', error);
      throw error;
    }
  }
  
  /**
   * Get device profile for an organization
   * 
   * @param {string} organizationId - The organization ID
   * @returns {Promise<Object>} - The device profile
   */
  async getDeviceProfile(organizationId) {
    try {
      const response = await apiRequest(`/api/510k/device-profile/${organizationId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get device profile: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.profile || null;
    } catch (error) {
      console.error('Error in getDeviceProfile:', error);
      throw error;
    }
  }
  
  /**
   * Generate recommended 510(k) pathway for a device
   * 
   * @param {Object} deviceProfile - The device profile
   * @returns {Promise<Object>} - Recommended pathway information
   */
  async getRecommendedPathway(deviceProfile) {
    try {
      const response = await apiRequest('/api/510k/pathway-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceProfile }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get pathway recommendation: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.recommendation || null;
    } catch (error) {
      console.error('Error in getRecommendedPathway:', error);
      throw error;
    }
  }
}

export default new FDA510kService();