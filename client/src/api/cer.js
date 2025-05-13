import axios from 'axios';

const API_BASE_URL = '/api/cer';

/**
 * Post a new device profile
 * 
 * @param {Object} data - The device profile data to save
 * @returns {Promise<Object>} - The saved device profile
 */
export const postDeviceProfile = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/device-profile`, data);
    return response.data;
  } catch (error) {
    console.error('Error posting device profile:', error);
    throw error;
  }
};

/**
 * Get all device profiles, optionally filtered by organization
 * 
 * @param {string} organizationId - Optional organization ID filter
 * @returns {Promise<Array>} - Array of device profiles
 */
export const getDeviceProfiles = async (organizationId) => {
  try {
    let url = `${API_BASE_URL}/device-profile`;
    
    if (organizationId) {
      url = `${API_BASE_URL}/device-profile/organization/${organizationId}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error getting device profiles:', error);
    throw error;
  }
};

/**
 * Get a device profile by ID
 * 
 * @param {string} id - The device profile ID
 * @returns {Promise<Object>} - The device profile
 */
export const getDeviceProfileById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/device-profile/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting device profile ID ${id}:`, error);
    throw error;
  }
};

/**
 * Update a device profile
 * 
 * @param {string} id - The device profile ID
 * @param {Object} data - The updated device profile data
 * @returns {Promise<Object>} - The updated device profile
 */
export const updateDeviceProfile = async (id, data) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/device-profile/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating device profile ID ${id}:`, error);
    throw error;
  }
};