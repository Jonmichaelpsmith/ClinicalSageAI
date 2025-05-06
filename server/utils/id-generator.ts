/**
 * ID Generator Utility
 * 
 * Provides functions to generate various types of IDs for use in the application.
 */

/**
 * Generate a random UUID
 */
export function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a random ID string with a custom prefix
 * 
 * @param prefix - Optional prefix for the ID
 * @param length - Length of the random part of the ID (default: 8)
 */
export function generateRandomId(prefix: string = '', length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix;
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Generate a sequential ID based on a timestamp and random suffix
 * 
 * @param prefix - Optional prefix for the ID
 */
export function generateSequentialId(prefix: string = ''): string {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}${timestamp}${random}`;
}
