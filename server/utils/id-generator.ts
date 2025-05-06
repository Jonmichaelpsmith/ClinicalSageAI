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
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a short, URL-friendly unique ID
 * @param {number} length - The desired length of the ID (default: 8)
 * @returns {string} A short unique ID
 */
export function generateShortId(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
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
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `${prefix}-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
}
