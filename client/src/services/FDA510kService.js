/**
 * FDA510kService - Service for interacting with FDA 510(k) API endpoints
 * 
 * This service handles all interactions with the FDA 510(k) related endpoints,
 * including device profile management, predicate device search, literature search,
 * and regulatory pathway analysis.
 */

import { apiRequest } from "../lib/queryClient";
import { API_BASE_URL } from "../config/constants";

/**
 * Convert errors to a standardized format
 * @param {Error} error - The error object
 * @returns {Object} Formatted error response
 */
const handleError = (error) => {
  console.error("FDA510k Service Error:", error);
  return {
    success: false,
    error: error.message || "An error occurred while processing your request",
    status: error.status || 500
  };
};

export class FDA510kService {
  /**
   * Save a device profile to the server
   * 
   * @param {Object} deviceProfile - The device profile to save
   * @param {string} organizationId - The organization ID
   * @returns {Promise<Object>} Response containing saved profile or error
   */
  static async saveDeviceProfile(deviceProfile, organizationId) {
    try {
      const url = `${API_BASE_URL}/510k/device-profiles`;
      const response = await apiRequest(url, {
        method: "POST",
        body: JSON.stringify({
          deviceProfile,
          organizationId
        })
      });

      return {
        success: true,
        profile: response.profile
      };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Get a device profile by ID
   * 
   * @param {string} profileId - The profile ID to retrieve
   * @param {string} organizationId - The organization ID
   * @returns {Promise<Object>} Response containing the profile or error
   */
  static async getDeviceProfile(profileId, organizationId) {
    try {
      const url = `${API_BASE_URL}/510k/device-profiles/${profileId}`;
      const response = await apiRequest(url, {
        method: "GET",
        params: { organizationId }
      });

      return {
        success: true,
        profile: response.profile
      };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * List all device profiles for an organization
   * 
   * @param {string} organizationId - The organization ID
   * @param {Object} filters - Optional filters for the profiles list
   * @returns {Promise<Object>} Response containing profiles or error
   */
  static async listDeviceProfiles(organizationId, filters = {}) {
    try {
      const url = `${API_BASE_URL}/510k/device-profiles`;
      const response = await apiRequest(url, {
        method: "GET",
        params: {
          organizationId,
          ...filters
        }
      });

      return {
        success: true,
        profiles: response.profiles || [],
        total: response.total || 0
      };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Delete a device profile
   * 
   * @param {string} profileId - The profile ID to delete
   * @param {string} organizationId - The organization ID
   * @returns {Promise<Object>} Response indicating success or error
   */
  static async deleteDeviceProfile(profileId, organizationId) {
    try {
      const url = `${API_BASE_URL}/510k/device-profiles/${profileId}`;
      await apiRequest(url, {
        method: "DELETE",
        params: { organizationId }
      });

      return {
        success: true
      };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Update an existing device profile
   * 
   * @param {string} profileId - The profile ID to update
   * @param {Object} deviceProfile - The updated device profile
   * @param {string} organizationId - The organization ID
   * @returns {Promise<Object>} Response containing updated profile or error
   */
  static async updateDeviceProfile(profileId, deviceProfile, organizationId) {
    try {
      const url = `${API_BASE_URL}/510k/device-profiles/${profileId}`;
      const response = await apiRequest(url, {
        method: "PUT",
        body: JSON.stringify({
          deviceProfile,
          organizationId
        })
      });

      return {
        success: true,
        profile: response.profile
      };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Validate a device profile against the schema
   * 
   * @param {Object} deviceProfile - The device profile to validate
   * @returns {Promise<Object>} Response containing validation results
   */
  static async validateDeviceProfile(deviceProfile) {
    try {
      const url = `${API_BASE_URL}/510k/validate-profile`;
      const response = await apiRequest(url, {
        method: "POST",
        body: JSON.stringify({ deviceProfile })
      });

      return {
        success: true,
        isValid: response.isValid,
        errors: response.errors || []
      };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Find potential predicate devices based on device profile
   * 
   * @param {Object} searchData - Search criteria for predicate devices
   * @param {string} organizationId - The organization ID
   * @returns {Promise<Object>} Response containing predicate devices or error
   */
  static async findPredicateDevices(searchData, organizationId) {
    try {
      const url = `${API_BASE_URL}/510k/predicate-devices`;
      const response = await apiRequest(url, {
        method: "POST",
        body: JSON.stringify({
          searchData,
          organizationId
        })
      });

      return {
        success: true,
        predicates: response.predicates || []
      };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Get detailed information about a specific predicate device
   * 
   * @param {string} predicateId - The ID of the predicate device
   * @param {string} organizationId - The organization ID
   * @returns {Promise<Object>} Response containing detailed predicate information or error
   */
  static async getPredicateDetails(predicateId, organizationId) {
    try {
      const url = `${API_BASE_URL}/510k/predicate-devices/${predicateId}`;
      const response = await apiRequest(url, {
        method: "GET",
        params: { organizationId }
      });

      return {
        success: true,
        predicateDetails: response.predicateDetails
      };
    } catch (error) {
      return handleError(error);
    }
  }
  
  /**
   * Generate a substantial equivalence draft based on device and predicate data
   * 
   * @param {Object} payload - Contains deviceProfile, predicateProfile, and equivalenceData
   * @param {string} organizationId - The organization ID
   * @returns {Promise<Object>} Response containing generated draft text or error
   */
  static async draftEquivalence(payload, organizationId) {
    try {
      const url = `${API_BASE_URL}/510k/draft-equivalence`;
      const response = await apiRequest(url, {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          organizationId
        })
      });

      return {
        success: true,
        draftText: response.draftText
      };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Search for relevant scientific literature
   * 
   * @param {Object} searchData - Search criteria for literature
   * @param {string} organizationId - The organization ID
   * @returns {Promise<Object>} Response containing articles or error
   */
  static async searchLiterature(searchData, organizationId) {
    try {
      const url = `${API_BASE_URL}/510k/literature`;
      const response = await apiRequest(url, {
        method: "POST",
        body: JSON.stringify({
          searchData,
          organizationId
        })
      });

      return {
        success: true,
        articles: response.articles || []
      };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Analyze the regulatory pathway for a device
   * 
   * @param {Object} deviceProfile - The device profile to analyze
   * @param {string} organizationId - The organization ID
   * @returns {Promise<Object>} Response containing pathway analysis or error
   */
  static async analyzeRegulatoryPathway(deviceProfile, organizationId) {
    try {
      const url = `${API_BASE_URL}/510k/pathway-analysis`;
      const response = await apiRequest(url, {
        method: "POST",
        body: JSON.stringify({
          deviceProfile,
          organizationId
        })
      });

      return {
        success: true,
        pathwayAnalysis: response.pathwayAnalysis
      };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Get 510(k) submission requirements by device class
   * 
   * @param {string} deviceClass - The device class (I, II, III)
   * @returns {Promise<Object>} Response containing requirements or error
   */
  static async getRequirements(deviceClass) {
    try {
      const url = `${API_BASE_URL}/510k/requirements`;
      const response = await apiRequest(url, {
        method: "GET",
        params: { deviceClass }
      });

      return {
        success: true,
        requirements: response.requirements || []
      };
    } catch (error) {
      return handleError(error);
    }
  }
  
  /**
   * Generate a section draft for a 510(k) submission
   * 
   * @param {string} sectionKey - The section key to generate
   * @param {Object} deviceProfile - The device profile 
   * @param {Array} predicateDevices - Selected predicate devices
   * @param {Array} literature - Selected literature
   * @param {string} organizationId - The organization ID
   * @returns {Promise<Object>} Response with generated content or error
   */
  static async generateSectionDraft(sectionKey, deviceProfile, predicateDevices, literature, organizationId) {
    try {
      const url = `${API_BASE_URL}/510k/generate-section`;
      const response = await apiRequest(url, {
        method: "POST",
        body: JSON.stringify({
          sectionKey,
          deviceProfile, 
          predicateDevices,
          literature,
          organizationId
        })
      });

      return {
        success: true,
        content: response.content,
        metadata: response.metadata || {}
      };
    } catch (error) {
      return handleError(error);
    }
  }
}

export default FDA510kService;