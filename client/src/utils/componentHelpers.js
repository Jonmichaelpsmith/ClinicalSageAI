/**
 * Component Helper Utilities
 * 
 * This module provides simple utilities for working with React components
 * in a way that prevents common errors and crashes.
 */

/**
 * Safely renders a component that might not be loaded yet
 * 
 * @param {React.ReactNode} component - The component to render
 * @param {React.ReactNode} fallback - What to show while loading
 * @returns {React.ReactNode} - The component or fallback
 */
export const withSafeLoad = (component, fallback = null) => {
  if (!component) {
    return fallback;
  }
  return component;
};

/**
 * Safely access object properties without crashing on undefined
 * 
 * @param {Object} obj - The object to access
 * @param {string} path - Dot notation path to the property
 * @param {*} defaultValue - Default value if property doesn't exist
 * @returns {*} The property value or default value
 */
export const safeProp = (obj, path, defaultValue = null) => {
  if (!obj) return defaultValue;
  
  const props = path.split('.');
  let result = obj;
  
  for (const prop of props) {
    if (result === undefined || result === null) {
      return defaultValue;
    }
    result = result[prop];
  }
  
  return result === undefined ? defaultValue : result;
};

/**
 * Safely maps an array with error handling
 * 
 * @param {Array} array - The array to map
 * @param {Function} mapFn - Mapping function
 * @param {Array} fallback - Fallback if array is undefined or mapping fails
 * @returns {Array} - The mapped array or fallback
 */
export const safeMap = (array, mapFn, fallback = []) => {
  if (!Array.isArray(array)) return fallback;
  
  try {
    return array.map(mapFn);
  } catch (error) {
    console.error('Error in safeMap:', error);
    return fallback;
  }
};

/**
 * Checks if a value is defined and not null
 * 
 * @param {*} value - Value to check
 * @returns {boolean} Whether the value exists
 */
export const exists = (value) => {
  return value !== undefined && value !== null;
};

/**
 * Provides a default value if the specified value doesn't exist
 * 
 * @param {*} value - Value to check
 * @param {*} defaultValue - Default value to use if value doesn't exist
 * @returns {*} The value or default value
 */
export const defaultIfMissing = (value, defaultValue) => {
  return exists(value) ? value : defaultValue;
};