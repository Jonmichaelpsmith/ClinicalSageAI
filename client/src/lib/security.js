/**
 * Enhanced Security Library for TrialSage
 * 
 * This module provides security utilities for protecting sensitive data and implementing 
 * security best practices throughout the application.
 */

import { AES, enc } from 'crypto-js';

/**
 * Encrypts sensitive data using AES-256 encryption
 * @param {string} data - Data to encrypt
 * @param {string} key - Optional encryption key, defaults to environment variable
 * @returns {string} - Encrypted data
 */
export function encryptData(data, key = import.meta.env.VITE_ENCRYPTION_KEY || 'trialsage-default-key') {
  if (!data) return null;
  return AES.encrypt(JSON.stringify(data), key).toString();
}

/**
 * Decrypts data that was encrypted with encryptData
 * @param {string} encryptedData - Encrypted data string
 * @param {string} key - Optional encryption key, should match the one used for encryption
 * @returns {any} - Decrypted data
 */
export function decryptData(encryptedData, key = import.meta.env.VITE_ENCRYPTION_KEY || 'trialsage-default-key') {
  if (!encryptedData) return null;
  try {
    const bytes = AES.decrypt(encryptedData, key);
    return JSON.parse(bytes.toString(enc.Utf8));
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

/**
 * Securely stores sensitive data in localStorage with encryption
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 */
export function secureLocalStorage(key, data) {
  if (!key || data === undefined) return;
  const encryptedData = encryptData(data);
  localStorage.setItem(key, encryptedData);
}

/**
 * Retrieves and decrypts data from localStorage
 * @param {string} key - Storage key
 * @returns {any} - Decrypted data or null if not found
 */
export function getSecureLocalStorage(key) {
  if (!key) return null;
  const encryptedData = localStorage.getItem(key);
  if (!encryptedData) return null;
  return decryptData(encryptedData);
}

/**
 * Implement Content Security Policy headers in JS
 * This provides an additional layer beyond server headers
 */
export function setupCSP() {
  // Only run in browser environment
  if (typeof document === 'undefined') return;

  // Create and inject CSP meta tag
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.concept2cures.ai https://*.trialsage.com";
  document.head.appendChild(meta);
}

/**
 * Sanitizes user input to prevent XSS attacks
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
export function sanitizeInput(input) {
  if (!input) return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return input.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Validate that a session hasn't expired
 * @returns {boolean} - True if session is valid
 */
export function validateSession() {
  const sessionExpiry = getSecureLocalStorage('sessionExpiry');
  if (!sessionExpiry) return false;
  return new Date().getTime() < sessionExpiry;
}

/**
 * Implements a session timeout after inactivity
 * @param {number} timeoutMinutes - Timeout in minutes
 */
export function setupSessionTimeout(timeoutMinutes = 30) {
  if (typeof window === 'undefined') return;
  
  // Set initial session expiry
  const expiryTime = new Date().getTime() + (timeoutMinutes * 60 * 1000);
  secureLocalStorage('sessionExpiry', expiryTime);
  
  // Reset timer on user activity
  const resetTimer = () => {
    const newExpiryTime = new Date().getTime() + (timeoutMinutes * 60 * 1000);
    secureLocalStorage('sessionExpiry', newExpiryTime);
  };
  
  // Add event listeners for user activity
  const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
  events.forEach(event => {
    window.addEventListener(event, resetTimer);
  });
  
  // Check session validity periodically
  setInterval(() => {
    if (!validateSession()) {
      // Redirect to login or show session timeout dialog
      window.dispatchEvent(new CustomEvent('session-timeout'));
    }
  }, 60000); // Check every minute
}

// Export default utility object
export default {
  encrypt: encryptData,
  decrypt: decryptData,
  secureStore: secureLocalStorage,
  secureRetrieve: getSecureLocalStorage,
  sanitize: sanitizeInput,
  setupCSP,
  setupSessionTimeout,
  validateSession
};