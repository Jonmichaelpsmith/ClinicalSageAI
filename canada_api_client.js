/**
 * Health Canada API Client
 * 
 * This module provides functions to interact with the Health Canada Clinical Trials Database API
 */

import https from 'https';
import fs from 'fs';
import path from 'path';

// API Constants
const API_BASE_URL = 'https://health-products.canada.ca/ctdb-bdec/api';
const CACHE_DIR = './canada_api_cache';

// Create cache directory if it doesn't exist
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Make an HTTP request to the Health Canada API
 */
function makeRequest(endpoint, params = {}) {
  return new Promise((resolve, reject) => {
    // Build URL with query parameters
    let url = `${API_BASE_URL}${endpoint}`;
    if (Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      }
      url = `${url}?${queryParams.toString()}`;
    }
    
    // Check if we have a cached response
    const cacheKey = Buffer.from(url).toString('base64');
    const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);
    
    // Use cached response if available and not older than 24 hours
    if (fs.existsSync(cacheFile)) {
      const stats = fs.statSync(cacheFile);
      const fileTimeMs = stats.mtime.getTime();
      const currentTimeMs = new Date().getTime();
      
      // Use cache if file is less than 24 hours old
      if (currentTimeMs - fileTimeMs < 24 * 60 * 60 * 1000) {
        try {
          const cachedData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
          console.log(`Using cached response for: ${url}`);
          return resolve(cachedData);
        } catch (error) {
          console.error(`Error reading cache file: ${error.message}`);
          // Continue with API request if cache read fails
        }
      }
    }
    
    console.log(`Making API request to: ${url}`);
    
    // Configure request options with SSL verification disabled
    const options = {
      rejectUnauthorized: false, // Disable SSL certificate verification
      timeout: 30000 // 30 second timeout
    };
    
    const request = https.get(url, options, (response) => {
      let data = '';
      
      // Handle HTTP errors
      if (response.statusCode < 200 || response.statusCode >= 300) {
        return reject(new Error(`HTTP Error: ${response.statusCode}`));
      }
      
      // Collect data chunks
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      // Process complete response
      response.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          
          // Cache the response
          fs.writeFileSync(cacheFile, data);
          
          resolve(parsedData);
        } catch (error) {
          reject(new Error(`Error parsing response: ${error.message}`));
        }
      });
    });
    
    // Handle connection errors
    request.on('error', (error) => {
      reject(new Error(`Request error: ${error.message}`));
    });
    
    // Handle timeouts
    request.setTimeout(30000, () => {
      request.abort();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Search for clinical trials
 * 
 * @param {Object} params - Search parameters
 * @param {string} params.searchText - Text to search for
 * @param {string} params.therapeuticArea - Therapeutic area to filter by
 * @param {string} params.phase - Trial phase to filter by 
 * @param {number} params.offset - Pagination offset
 * @param {number} params.limit - Maximum number of results to return
 * @returns {Promise<Object>} Search results
 */
export async function searchTrials(params = {}) {
  const searchParams = {
    searchText: params.searchText,
    therapeuticArea: params.therapeuticArea,
    phase: params.phase,
    offset: params.offset || 0,
    limit: params.limit || 50, // Default to 50 results per page
    lang: 'en', // Default to English
  };
  
  return makeRequest('/trials', searchParams);
}

/**
 * Get detailed information for a specific trial
 * 
 * @param {string} trialId - The trial identifier
 * @returns {Promise<Object>} Trial details
 */
export async function getTrialDetails(trialId) {
  if (!trialId) {
    throw new Error('Trial ID is required');
  }
  
  return makeRequest(`/trials/${trialId}`);
}

/**
 * Get a list of all available therapeutic areas
 * 
 * @returns {Promise<Array>} List of therapeutic areas
 */
export async function getTherapeuticAreas() {
  return makeRequest('/therapeutic-areas');
}

/**
 * Fetch a batch of trials
 * 
 * @param {number} offset - Starting offset for pagination
 * @param {number} limit - Maximum number of trials to fetch (max 50)
 * @returns {Promise<Object>} Batch of trials
 */
export async function fetchTrialBatch(offset = 0, limit = 50) {
  // Enforce maximum limit of 50
  const safeLimit = Math.min(limit, 50);
  
  return searchTrials({
    offset,
    limit: safeLimit
  });
}

/**
 * Get complete details for a batch of trials
 * 
 * @param {Array} trialIds - Array of trial IDs to fetch details for
 * @returns {Promise<Array>} Array of trial details
 */
export async function fetchTrialDetails(trialIds) {
  // Fetch details for each trial with some concurrency control
  const results = [];
  const errors = [];
  const concurrentRequests = 5;
  
  // Process in batches to control concurrency
  for (let i = 0; i < trialIds.length; i += concurrentRequests) {
    const batch = trialIds.slice(i, i + concurrentRequests);
    
    const batchPromises = batch.map(trialId => {
      return getTrialDetails(trialId)
        .then(details => {
          console.log(`Successfully fetched details for trial ${trialId}`);
          return { id: trialId, details, success: true };
        })
        .catch(error => {
          console.error(`Error fetching details for trial ${trialId}:`, error.message);
          errors.push({ id: trialId, error: error.message });
          return { id: trialId, error: error.message, success: false };
        });
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.filter(r => r.success));
    
    // Small delay between batches to be gentle on the API
    if (i + concurrentRequests < trialIds.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return {
    results: results.map(r => r.details),
    errors
  };
}

/**
 * Convert Canada API response to our CSR format
 * 
 * @param {Object} trialData - Trial data from Canada API
 * @returns {Object} Formatted trial data
 */
export function convertToCSRFormat(trialData) {
  // Extract basic information
  const protocolDetails = trialData.protocolDetails || {};
  const studyPopulation = trialData.studyPopulation || {};
  const productDetails = trialData.productDetails || {};
  
  // Map phases from Canada format to our format
  const phaseMap = {
    'Phase 1': 'Phase 1',
    'Phase 1/Phase 2': 'Phase 1/2',
    'Phase 2': 'Phase 2',
    'Phase 2/Phase 3': 'Phase 2/3',
    'Phase 3': 'Phase 3',
    'Phase 4': 'Phase 4',
    'Not Applicable': 'N/A',
    'Early Phase 1': 'Phase 1'
  };
  
  // Extract therapeutic areas and indications
  const therapeuticAreas = trialData.therapeuticAreas || [];
  const medicalConditions = trialData.medicalConditions || [];
  
  // Extract the study design details
  const studyDesignDetails = {
    design: protocolDetails.studyDesign || '',
    masking: protocolDetails.masking || '',
    randomization: protocolDetails.randomization || 'Not Specified',
    primaryEndpoints: protocolDetails.primaryEndpoints || [],
    secondaryEndpoints: protocolDetails.secondaryEndpoints || []
  };
  
  // Extract eligibility criteria
  const inclusionCriteria = studyPopulation.inclusionCriteria || [];
  const exclusionCriteria = studyPopulation.exclusionCriteria || [];
  
  // Create endpoints object
  const endpoints = {
    primary: studyDesignDetails.primaryEndpoints,
    secondary: studyDesignDetails.secondaryEndpoints
  };
  
  return {
    title: trialData.title || `Health Canada Trial ${trialData.id}`,
    indication: medicalConditions.length > 0 ? medicalConditions[0] : 
                 (therapeuticAreas.length > 0 ? therapeuticAreas[0] : 'Not Specified'),
    phase: phaseMap[protocolDetails.phase] || protocolDetails.phase || 'Not Specified',
    sponsor: trialData.sponsorName || 'Unknown Sponsor',
    uploadDate: trialData.lastModified || new Date().toISOString(),
    summary: trialData.description || `Clinical trial for ${medicalConditions.join(', ')}`,
    region: 'Health Canada',
    nctrialId: `HC-${trialData.id}`,
    fileSize: Math.floor(Math.random() * 5000) + 500, // Simulated file size
    fileName: `HC_${trialData.id}_report.pdf`, // Simulated file name
    drugName: productDetails.name || 'Not Specified',
    studyStatus: trialData.status || 'Unknown',
    startDate: trialData.startDate,
    completionDate: trialData.completionDate,
    eligibilityCriteria: {
      inclusion: inclusionCriteria,
      exclusion: exclusionCriteria
    },
    endpoints: endpoints,
    therapeuticAreas: therapeuticAreas,
    studyDesign: {
      design: studyDesignDetails.design,
      masking: studyDesignDetails.masking,
      randomization: studyDesignDetails.randomization,
      enrollment: studyPopulation.sampleSize
    }
  };
}

// Export the main functions
export default {
  searchTrials,
  getTrialDetails,
  getTherapeuticAreas,
  fetchTrialBatch,
  fetchTrialDetails,
  convertToCSRFormat
};