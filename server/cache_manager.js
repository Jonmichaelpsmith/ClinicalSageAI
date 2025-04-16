/**
 * Cache Manager for LumenTrialGuide.AI
 * 
 * This module provides a simple caching mechanism to reduce redundant API calls
 * to external data sources and speed up report generation.
 */

const fs = require('fs');
const path = require('path');

// Ensure cache directory exists
const CACHE_DIR = path.join(process.cwd(), 'data', 'cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Create a new cache manager for a specific domain
 * 
 * @param {string} domain Cache domain (subdirectory)
 * @returns {Object} Cache manager object
 */
function createCache(domain) {
  // Create domain-specific cache directory
  const domainDir = path.join(CACHE_DIR, domain);
  if (!fs.existsSync(domainDir)) {
    fs.mkdirSync(domainDir, { recursive: true });
  }
  
  /**
   * Get cache file path for a key
   * 
   * @param {string} key Cache key
   * @returns {string} File path
   */
  function getCachePath(key) {
    // Create a safe filename by replacing non-alphanumeric characters
    const safeKey = key.replace(/[^a-z0-9]/gi, '_');
    return path.join(domainDir, `${safeKey}.json`);
  }
  
  /**
   * Get cached data if it exists and is not expired
   * 
   * @param {string} key Cache key
   * @param {number} maxAgeSeconds Maximum age in seconds
   * @returns {Promise<Object|null>} Cached data or null if not found or expired
   */
  async function getCachedData(key, maxAgeSeconds = 86400) { // Default: 24 hours
    const cachePath = getCachePath(key);
    
    try {
      // Check if file exists
      if (!fs.existsSync(cachePath)) {
        return null;
      }
      
      // Check file age
      const stats = fs.statSync(cachePath);
      const fileAgeSeconds = (Date.now() - stats.mtime.getTime()) / 1000;
      
      if (fileAgeSeconds > maxAgeSeconds) {
        console.log(`Cache expired for key ${key}`);
        return null;
      }
      
      // Read file
      const data = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      console.log(`Cache hit for key ${key}`);
      return data;
    } catch (error) {
      console.error(`Error reading cache for key ${key}:`, error.message);
      return null;
    }
  }
  
  /**
   * Save data to cache
   * 
   * @param {string} key Cache key
   * @param {Object} data Data to cache
   * @returns {Promise<void>}
   */
  async function saveToCache(key, data) {
    const cachePath = getCachePath(key);
    
    try {
      fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
      console.log(`Cache saved for key ${key}`);
    } catch (error) {
      console.error(`Error saving cache for key ${key}:`, error.message);
    }
  }
  
  /**
   * Save data to cache with expiry information
   * 
   * @param {string} key Cache key
   * @param {Object} data Data to cache
   * @param {number} expirySeconds Expiry time in seconds
   * @returns {Promise<void>}
   */
  async function saveToCacheWithExpiry(key, data, expirySeconds = 86400) {
    const cachePath = getCachePath(key);
    
    try {
      const wrappedData = {
        data: data,
        expires: Date.now() + (expirySeconds * 1000),
        created: Date.now()
      };
      
      fs.writeFileSync(cachePath, JSON.stringify(wrappedData, null, 2));
      console.log(`Cache saved for key ${key} with ${expirySeconds}s expiry`);
    } catch (error) {
      console.error(`Error saving cache with expiry for key ${key}:`, error.message);
    }
  }
  
  /**
   * Clear all cache for this domain
   * 
   * @returns {Promise<void>}
   */
  async function clearCache() {
    try {
      const files = fs.readdirSync(domainDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(domainDir, file));
        }
      }
      
      console.log(`Cache cleared for domain ${domain}`);
    } catch (error) {
      console.error(`Error clearing cache for domain ${domain}:`, error.message);
    }
  }
  
  return {
    getCachedData,
    saveToCache,
    saveToCacheWithExpiry,
    clearCache
  };
}

module.exports = {
  createCache
};