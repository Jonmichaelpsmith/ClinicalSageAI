import axios from 'axios';

const API_BASE_URL = '/api/cer';
const LITERATURE_SEARCH_URL = '/api/literature';
const PUBMED_API_URL = '/api/pubmed';
const IEEE_API_URL = '/api/ieee';
const DISCOVERY_API_URL = '/api/discovery';

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

/**
 * Search literature using the unified discovery service
 * 
 * @param {string} query - The search query
 * @param {Object} options - Search options (limit, module context)
 * @returns {Promise<Array>} - Array of literature results
 */
export const searchUnifiedLiterature = async (query, options = { limit: 10, module: 'cer' }) => {
  try {
    console.log('Searching literature with unified discovery service:', { query, options });
    const response = await axios.post('/api/discovery/literature-search', {
      query,
      limit: options.limit || 10,
      module: options.module || 'cer'
    });
    console.log('Unified literature search response:', response.data);
    return response.data.results || [];
  } catch (error) {
    console.error('Error using unified literature search:', error);
    // Fallback to traditional literature search
    console.log('Falling back to traditional literature search');
    return searchLiterature(query);
  }
};

/**
 * Find predicate devices using the unified discovery service
 * 
 * @param {string} deviceDescription - The device description to search for predicates
 * @param {Object} options - Search options (limit, module context)
 * @returns {Promise<Array>} - Array of predicate device results
 */
export const findPredicateDevices = async (deviceDescription, options = { limit: 8, module: '510k' }) => {
  try {
    console.log('Finding predicates with unified discovery service:', { deviceDescription, options });
    const response = await axios.post('/api/discovery/find-predicates', {
      deviceDescription,
      limit: options.limit || 8,
      module: options.module || '510k'
    });
    console.log('Unified predicate search response:', response.data);
    return response.data.predicates || [];
  } catch (error) {
    console.error('Error using unified predicate search:', error);
    // Return empty array as fallback since there's no traditional endpoint
    return [];
  }
};

/**
 * Generate a literature review from selected articles
 * 
 * @param {string} deviceName - The device name for context
 * @param {Array} literatureReferences - Array of selected literature references
 * @param {Object} options - Additional options for generation
 * @param {string} options.manufacturer - The manufacturer name
 * @param {string} options.modelNumber - The device model number
 * @param {boolean} options.useEnhancedGeneration - Whether to use enhanced AI generation
 * @returns {Promise<Object>} - The generated literature review content
 */
export const generateLiteratureReview = async (deviceName, literatureReferences, options = {}) => {
  const { 
    manufacturer = '', 
    modelNumber = '',
    useEnhancedGeneration = true 
  } = options;

  // Import the error handling utility
  const errorHandling = await import('../utils/errorHandling');
  
  // Timeout for API request in milliseconds (2 minutes)
  const API_TIMEOUT = 120000;
  
  // Create a fallback function that generates a basic literature review
  // when the main API call fails or times out
  const fallbackLiteratureReviewGenerator = async (deviceName, literatureReferences, originalError) => {
    console.log('Using fallback literature review generator');
    
    // Extract key information from references for the fallback generator
    const extractedInfo = literatureReferences.map(ref => ({
      title: ref.title,
      authors: ref.authors,
      year: ref.year,
      journal: ref.journal,
      abstract: ref.abstract?.substring(0, 200) || '',
      id: ref.id
    }));
    
    // Structure basic literature review
    const fallbackReview = {
      content: `# Literature Review for ${deviceName || 'Medical Device'}\n\n` +
        `## Introduction\n\nThis literature review summarizes findings from ${literatureReferences.length} ` +
        `scientific articles relevant to ${deviceName || 'the device'}${manufacturer ? ' manufactured by ' + manufacturer : ''}.\n\n` +
        `## Methodology\n\nA literature search was conducted across medical and scientific databases. ` +
        `${literatureReferences.length} relevant articles were selected for this review.\n\n` +
        `## Summary of Findings\n\n` +
        literatureReferences.map(ref => 
          `- **${ref.title}** (${ref.authors}, ${ref.year}): ${ref.abstract?.substring(0, 150)}...`
        ).join('\n\n') +
        `\n\n## Conclusion\n\nBased on the literature reviewed, additional analysis is recommended.`,
      error: {
        original: originalError?.message || 'Unknown error',
        type: 'fallback_generated',
        timestamp: new Date().toISOString()
      },
      metadata: {
        generatedWithFallback: true,
        sourceCount: literatureReferences.length,
        generationTimestamp: new Date().toISOString(),
        generationMethod: 'basic'
      }
    };
    
    return { review: fallbackReview };
  };

  try {
    // Wrap the API call with timeout
    const apiCallWithTimeout = errorHandling.withTimeout(
      axios.post(`${API_BASE_URL}/generate-literature-review`, {
        deviceName,
        manufacturer,
        modelNumber,
        literatureReferences,
        useEnhancedGeneration
      }),
      API_TIMEOUT,
      'Literature review generation timed out'
    );
    
    // Execute the API call with error handling and fallback
    const response = await errorHandling.withErrorHandling(
      async () => {
        const result = await apiCallWithTimeout;
        return result.data;
      },
      {
        fallback: (deviceNameArg, literatureRefsArg) => 
          fallbackLiteratureReviewGenerator(deviceNameArg, literatureRefsArg, new Error('API call failed')),
        retries: 1,
        retryDelay: 2000,
        onError: (error) => {
          console.error('Error in literature review generation:', error);
          // You could add analytics tracking here
        }
      }
    )(deviceName, literatureReferences);
    
    return response;
  } catch (error) {
    // Format error for consistent handling
    const formattedError = errorHandling.formatErrorForDisplay(error, {
      friendlyMessages: {
        ...errorHandling.defaultFriendlyMessages,
        timeout: 'The literature review is taking longer than expected to generate. Please try again with fewer articles.'
      }
    });
    
    console.error('Literature review generation failed:', formattedError);
    
    // Try the fallback generator as a last resort
    try {
      return await fallbackLiteratureReviewGenerator(deviceName, literatureReferences, error);
    } catch (fallbackError) {
      console.error('Even fallback generation failed:', fallbackError);
      throw new Error(`Failed to generate literature review: ${formattedError.message}`);
    }
  }
};

/**
 * Save a generated literature review to a CER project
 * 
 * @param {string} cerProjectId - The CER project ID
 * @param {Object} reviewData - The generated review data
 * @param {Object} options - Additional options
 * @param {boolean} options.validateBeforeSave - Whether to validate the review before saving
 * @param {boolean} options.addComplianceData - Whether to add compliance metadata
 * @returns {Promise<Object>} - The result of saving the review
 */
export const saveGeneratedLiteratureReview = async (cerProjectId, reviewData, options = {}) => {
  const {
    validateBeforeSave = true,
    addComplianceData = true
  } = options;
  
  // Import error handling utility
  const errorHandling = await import('../utils/errorHandling');
  
  // Add compliance and validation metadata if requested
  const prepareReviewData = async (data) => {
    let enhancedData = { ...data };
    
    if (addComplianceData) {
      try {
        // Add timestamp and version info
        enhancedData.metadata = {
          ...(enhancedData.metadata || {}),
          savedAt: new Date().toISOString(),
          version: '2.0',
          validated: validateBeforeSave
        };
      } catch (error) {
        console.warn('Error adding compliance data:', error);
        // Continue with saving even if metadata enhancement fails
      }
    }
    
    return enhancedData;
  };
  
  // Create offline storage fallback function
  const saveToLocalStorageFallback = async (projectId, data) => {
    try {
      // Prepare data with compliance info
      const preparedData = await prepareReviewData(data);
      
      // Store in localStorage for offline resilience
      const storageKey = `cer_literature_review_${projectId}`;
      const savedReviews = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Add new review with pending sync flag
      savedReviews.push({
        ...preparedData,
        _pendingSync: true,
        _savedAt: new Date().toISOString()
      });
      
      // Keep only the last 5 to avoid storage limits
      const trimmedReviews = savedReviews.slice(-5);
      localStorage.setItem(storageKey, JSON.stringify(trimmedReviews));
      
      console.log('Literature review saved to local storage as fallback');
      
      return {
        success: true,
        savedLocally: true,
        pendingSync: true,
        data: preparedData
      };
    } catch (error) {
      console.error('Failed to save to local storage:', error);
      throw new Error('Failed to save literature review to both server and local storage');
    }
  };

  try {
    // First, optionally apply validation and prepare review data
    const preparedReviewData = await prepareReviewData(reviewData);
    
    // Wrap the API call with timeout and error handling
    const apiCallWithTimeout = errorHandling.withTimeout(
      axios.post(`${API_BASE_URL}/literature-review/${cerProjectId}`, {
        reviewData: preparedReviewData
      }),
      30000, // 30 second timeout
      'Literature review save operation timed out'
    );
    
    // Execute API call with automatic retries and fallback
    const response = await errorHandling.withErrorHandling(
      async () => {
        const result = await apiCallWithTimeout;
        return result.data;
      },
      {
        fallback: () => saveToLocalStorageFallback(cerProjectId, preparedReviewData),
        retries: 2,
        retryDelay: 1000,
        onError: (error) => {
          console.error('Error saving literature review:', error);
        }
      }
    )();
    
    return response;
  } catch (error) {
    // Format the error for display
    const formattedError = errorHandling.formatErrorForDisplay(error, {
      friendlyMessages: {
        network: 'Unable to save the literature review due to network issues. The review has been saved locally and will sync when connection is restored.',
        server: 'The server encountered an issue while saving the literature review. Please try again later.',
        default: 'There was a problem saving the literature review.'
      }
    });
    
    console.error('Failed to save literature review:', formattedError);
    
    // Try local storage as last resort
    try {
      return await saveToLocalStorageFallback(cerProjectId, reviewData);
    } catch (fallbackError) {
      throw new Error(`Failed to save literature review: ${formattedError.message}`);
    }
  }
};

/**
 * Generate a preview of a CER document
 * 
 * @param {Object} cerData - The CER data including device profile and sections
 * @returns {Promise<Object>} - The preview document
 */
export const generateCERPreview = async (cerData) => {
  try {
    const response = await axios.post('/api/document-assembly/preview', {
      cerData
    });
    return response.data;
  } catch (error) {
    console.error('Error generating CER preview:', error);
    throw error;
  }
};

/**
 * Generate a complete CER document and save it
 * 
 * @param {Object} cerData - The CER data including device profile and sections
 * @param {boolean} enhance - Whether to enhance the document with AI
 * @returns {Promise<Object>} - The result of the operation
 */
export const generateAndSaveCER = async (cerData, enhance = true) => {
  // Import error handling utility
  const errorHandling = await import('../utils/errorHandling');
  
  try {
    // Try to use the document assembly service first
    try {
      const options = { enhance };
      
      const assemblyResponse = await errorHandling.withTimeout(
        axios.post(`/api/document-assembly/cer`, { cerData, options }),
        60000, // 1 minute timeout
        'Document assembly timed out'
      );
      
      return assemblyResponse.data;
    } catch (assemblyError) {
      console.warn('Document assembly service failed, falling back to legacy endpoint:', assemblyError);
      
      // Fall back to the legacy endpoint
      const response = await axios.post('/api/document-assembly/generate', {
        cerData,
        enhance
      });
      
      return response.data;
    }
  } catch (error) {
    console.error('Error generating CER document:', error);
    
    // Format error for display
    const formattedError = errorHandling.formatErrorForDisplay(error, {
      friendlyMessages: {
        network: 'Unable to connect to the document generation service. Please check your internet connection and try again.',
        timeout: 'The document generation is taking longer than expected. Please try again with fewer sections or contact support.',
        server: 'Our document generation service is experiencing issues. Please try again later.',
        default: 'An error occurred while generating your document. Please try again or contact support.'
      }
    });
    
    throw new Error(formattedError.message || error.message);
  }
};

/**
 * Generate a specific section for a CER
 * 
 * @param {string} sectionKey - The section key/identifier
 * @param {Object} deviceProfile - The device profile
 * @param {Object} sectionData - Data specific to the section
 * @returns {Promise<Object>} - The generated section
 */
export const generateCERSection = async (sectionKey, deviceProfile, sectionData = {}) => {
  try {
    const response = await axios.post(`/api/document-assembly/section/${sectionKey}`, {
      deviceProfile,
      sectionData
    });
    return response.data;
  } catch (error) {
    console.error(`Error generating CER section ${sectionKey}:`, error);
    throw error;
  }
};