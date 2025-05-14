import axios from 'axios';

const API_BASE_URL = '/api/cer';
const LITERATURE_SEARCH_URL = '/api/literature';
const PUBMED_API_URL = '/api/pubmed';
const IEEE_API_URL = '/api/ieee';

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

/**
 * Delete a device profile
 * 
 * @param {number} id - The device profile ID to delete
 * @returns {Promise<boolean>} - True if successful
 */
export const deleteDeviceProfile = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/device-profile/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting device profile ID ${id}:`, error);
    throw error;
  }
};

/**
 * Search for literature across multiple sources
 * 
 * @param {string} query - The search query
 * @param {Object} filters - Search filters (year range, types, etc.)
 * @returns {Promise<Array>} - Array of literature results
 */
export const searchLiterature = async (query, filters = {}) => {
  try {
    const response = await axios.post(LITERATURE_SEARCH_URL, {
      query,
      filters
    });
    return response.data;
  } catch (error) {
    console.error('Error searching literature:', error);
    throw error;
  }
};

/**
 * Search PubMed for medical literature
 * 
 * @param {string} query - The search query
 * @param {Object} filters - Search filters
 * @returns {Promise<Array>} - Array of PubMed results
 */
export const searchPubMed = async (query, filters = {}) => {
  try {
    const response = await axios.post(`${PUBMED_API_URL}/search`, {
      query,
      filters
    });
    return response.data;
  } catch (error) {
    console.error('Error searching PubMed:', error);
    throw error;
  }
};

/**
 * Get PubMed article details by PMID
 * 
 * @param {string} pmid - The PubMed ID
 * @returns {Promise<Object>} - The article details
 */
export const getPubMedArticle = async (pmid) => {
  try {
    const response = await axios.get(`${PUBMED_API_URL}/article/${pmid}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting PubMed article ID ${pmid}:`, error);
    throw error;
  }
};

/**
 * Search IEEE Xplore for technical literature
 * 
 * @param {string} query - The search query
 * @param {Object} filters - Search filters
 * @returns {Promise<Array>} - Array of IEEE Xplore results
 */
export const searchIEEE = async (query, filters = {}) => {
  try {
    const response = await axios.post(`${IEEE_API_URL}/search`, {
      query,
      filters
    });
    return response.data;
  } catch (error) {
    console.error('Error searching IEEE Xplore:', error);
    throw error;
  }
};

/**
 * Save selected literature for a CER
 * 
 * @param {string} cerProjectId - The CER project ID
 * @param {Array} articles - The selected literature articles
 * @returns {Promise<Object>} - The saved literature data
 */
export const saveLiteratureSelection = async (cerProjectId, articles) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/literature/${cerProjectId}`, {
      articles
    });
    return response.data;
  } catch (error) {
    console.error('Error saving literature selection:', error);
    throw error;
  }
};

/**
 * Get saved literature for a CER project
 * 
 * @param {string} cerProjectId - The CER project ID
 * @returns {Promise<Array>} - Array of saved literature
 */
export const getSavedLiterature = async (cerProjectId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/literature/${cerProjectId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting saved literature for CER ID ${cerProjectId}:`, error);
    throw error;
  }
};