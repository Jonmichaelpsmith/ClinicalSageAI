/**
 * ID Generator Utilities
 * 
 * Provides utility functions for generating unique identifiers.
 * These functions help avoid dependencies on third-party packages
 * and ensure consistent ID generation across the application.
 */

/**
 * Generate a UUID v4-compatible string without any dependencies
 * @returns {string} A UUID v4 string
 */
export function generateUuid(): string {
  let d = new Date().getTime();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now(); // Add high-precision timer if available
  }
  
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

/**
 * Generate a short, URL-friendly unique ID
 * @param {number} length - The desired length of the ID (default: 8)
 * @returns {string} A short unique ID
 */
export function generateShortId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charsLength = chars.length;
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  
  return result;
}

/**
 * Generate a numeric ID with a prefix
 * @param {string} prefix - The prefix to add to the ID (default: 'ID')
 * @returns {string} A numeric ID with prefix
 */
export function generateNumericId(prefix: string = 'ID'): string {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}${timestamp}${random}`;
}

/**
 * Generate a job ID with a formatted date
 * @param {string} prefix - The prefix to add to the ID (default: 'JOB')
 * @returns {string} A job ID with formatted date
 */
export function generateJobId(prefix: string = 'JOB'): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${prefix}-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
}
