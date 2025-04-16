/**
 * Cache Manager
 * 
 * This module provides a cache system for storing API responses and intermediate data
 * to improve performance and reduce unnecessary API calls for the CER generation process.
 */

const fs = require('fs');
const path = require('path');

// Cache directory
const CACHE_DIR = path.join(process.cwd(), 'data', 'cache');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Create a cache manager for a specific data source
 * 
 * @param {string} sourceId Identifier for the data source (e.g., 'fda_maude', 'fda_faers', 'eu_eudamed')
 * @returns {Object} Cache manager object
 */
function createCache(sourceId) {
  // Create source-specific cache directory
  const sourceCacheDir = path.join(CACHE_DIR, sourceId);
  if (!fs.existsSync(sourceCacheDir)) {
    fs.mkdirSync(sourceCacheDir, { recursive: true });
  }
  
  /**
   * Get the cache file path for a key
   * 
   * @param {string} key Cache key
   * @returns {string} Cache file path
   */
  function getCachePath(key) {
    // Create a safe filename by replacing non-alphanumeric chars
    const safeKey = key.replace(/[^a-z0-9]/gi, '_');
    return path.join(sourceCacheDir, `${safeKey}.json`);
  }
  
  /**
   * Get cached data if it exists and is not expired
   * 
   * @param {string} key Cache key
   * @param {number} maxAgeSeconds Maximum age in seconds (default: 24 hours)
   * @returns {Promise<any>} Cached data or null if not found or expired
   */
  async function getCachedData(key, maxAgeSeconds = 24 * 60 * 60) {
    const cachePath = getCachePath(key);
    
    try {
      if (!fs.existsSync(cachePath)) {
        return null;
      }
      
      // Check if file is expired
      const stats = fs.statSync(cachePath);
      const fileAgeSeconds = (Date.now() - stats.mtime.getTime()) / 1000;
      
      if (fileAgeSeconds > maxAgeSeconds) {
        console.log(`Cache expired for key: ${key}`);
        return null;
      }
      
      // Read and parse the cached data
      const data = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      return data;
    } catch (error) {
      console.error(`Error reading cache for key ${key}:`, error.message);
      return null;
    }
  }
  
  /**
   * Save data to cache with expiration time
   * 
   * @param {string} key Cache key
   * @param {any} data Data to cache
   * @param {number} ttlSeconds Time to live in seconds
   * @returns {Promise<boolean>} True if saved successfully
   */
  async function saveToCacheWithExpiry(key, data, ttlSeconds) {
    const cachePath = getCachePath(key);
    
    try {
      // Add metadata including expiration
      const cacheData = {
        data: data,
        metadata: {
          cached_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + (ttlSeconds * 1000)).toISOString(),
          ttl_seconds: ttlSeconds
        }
      };
      
      fs.writeFileSync(cachePath, JSON.stringify(cacheData), 'utf8');
      return true;
    } catch (error) {
      console.error(`Error saving cache for key ${key}:`, error.message);
      return false;
    }
  }
  
  /**
   * Clear cache for a specific key
   * 
   * @param {string} key Cache key
   * @returns {Promise<boolean>} True if cleared successfully
   */
  async function clearCache(key) {
    const cachePath = getCachePath(key);
    
    try {
      if (fs.existsSync(cachePath)) {
        fs.unlinkSync(cachePath);
      }
      return true;
    } catch (error) {
      console.error(`Error clearing cache for key ${key}:`, error.message);
      return false;
    }
  }
  
  /**
   * Clear all cache for this source
   * 
   * @returns {Promise<boolean>} True if cleared successfully
   */
  async function clearAllCache() {
    try {
      const files = fs.readdirSync(sourceCacheDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(sourceCacheDir, file));
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Error clearing all cache for source ${sourceId}:`, error.message);
      return false;
    }
  }
  
  return {
    getCachedData,
    saveToCacheWithExpiry,
    clearCache,
    clearAllCache
  };
}

module.exports = {
  createCache
};