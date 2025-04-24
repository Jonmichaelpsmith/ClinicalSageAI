/**
 * Version Checker Utility
 * 
 * This utility helps check for dependency version compatibility
 * and provides graceful degradation when needed.
 */

/**
 * Check if a library is available at runtime
 * 
 * @param {string} libraryName - Name of the library to check
 * @returns {boolean} Whether the library is available
 */
export const isLibraryAvailable = (libraryName) => {
  try {
    return typeof window !== 'undefined' && 
      window[libraryName] !== undefined;
  } catch (error) {
    console.warn(`Error checking for library ${libraryName}:`, error);
    return false;
  }
};

/**
 * Check if a specific feature is available
 * 
 * @param {object} obj - The object to check
 * @param {string} featurePath - Dot notation path to the feature
 * @returns {boolean} Whether the feature is available
 */
export const isFeatureAvailable = (obj, featurePath) => {
  if (!obj) return false;
  
  try {
    const parts = featurePath.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current[part] === undefined) {
        return false;
      }
      current = current[part];
    }
    
    return true;
  } catch (error) {
    console.warn(`Error checking for feature ${featurePath}:`, error);
    return false;
  }
};

/**
 * Checks if the browser supports a specific API
 * 
 * @param {string} apiName - Name of the API to check
 * @returns {boolean} Whether the API is supported
 */
export const isApiSupported = (apiName) => {
  if (typeof window === 'undefined') return false;
  
  try {
    switch (apiName) {
      case 'localStorage':
        return !!window.localStorage;
      case 'sessionStorage':
        return !!window.sessionStorage;
      case 'indexedDB':
        return !!window.indexedDB;
      case 'fetch':
        return !!window.fetch;
      case 'WebSocket':
        return !!window.WebSocket;
      case 'IntersectionObserver':
        return !!window.IntersectionObserver;
      case 'ResizeObserver':
        return !!window.ResizeObserver;
      case 'MutationObserver':
        return !!window.MutationObserver;
      default:
        console.warn(`Unknown API: ${apiName}`);
        return false;
    }
  } catch (error) {
    console.warn(`Error checking for API ${apiName}:`, error);
    return false;
  }
};

/**
 * Safely executes a function with fallback if it errors
 * 
 * @param {Function} fn - Function to execute
 * @param {*} fallbackValue - Value to return if function fails
 * @param {*} args - Arguments to pass to the function
 * @returns {*} Result of function or fallback value
 */
export const safeExecute = (fn, fallbackValue, ...args) => {
  try {
    return fn(...args);
  } catch (error) {
    console.warn('Error in safeExecute:', error);
    return fallbackValue;
  }
};

/**
 * Checks library versions to ensure compatibility
 * 
 * @param {Object} requiredVersions - Map of libraries and their required versions
 * @returns {Object} Results of the version checks
 */
export const checkDependencyVersions = (requiredVersions) => {
  const results = {};
  
  // Function to parse version string
  const parseVersion = (versionStr) => {
    const parts = versionStr.split('.').map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
      full: parts.join('.')
    };
  };
  
  // Function to compare versions
  const isVersionCompatible = (actual, required) => {
    const actualVer = parseVersion(actual);
    const requiredVer = parseVersion(required);
    
    // Major version must match exactly
    if (actualVer.major !== requiredVer.major) {
      return false;
    }
    
    // Minor version must be >= required
    if (actualVer.minor < requiredVer.minor) {
      return false;
    }
    
    // If minor matches exactly, patch must be >= required
    if (actualVer.minor === requiredVer.minor && actualVer.patch < requiredVer.patch) {
      return false;
    }
    
    return true;
  };
  
  Object.entries(requiredVersions).forEach(([lib, requiredVersion]) => {
    try {
      const libGlobal = window[lib];
      results[lib] = {
        available: !!libGlobal,
        required: requiredVersion,
        actual: libGlobal?.version || 'unknown',
        compatible: libGlobal?.version ? 
          isVersionCompatible(libGlobal.version, requiredVersion) : 
          false,
      };
    } catch (error) {
      results[lib] = {
        available: false,
        required: requiredVersion,
        actual: 'error',
        compatible: false,
        error: error.message
      };
    }
  });
  
  return results;
};