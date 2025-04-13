/**
 * Session Utilities
 * 
 * This module provides centralized session validation and handling
 * functionality for use across TrialSage components.
 */

/**
 * Check if a given sessionId is valid
 * 
 * @param {any} sessionId - The session ID to validate
 * @returns {boolean} True if the session ID is valid, false otherwise
 */
export function isValidSessionId(sessionId) {
  // Basic validation: not null/undefined, is a string, and not empty
  if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
    return false;
  }

  // Optional: Check format requirements if needed 
  // (e.g., UUID pattern, specific prefix, or length requirements)
  // For example, if session IDs should follow a UUID pattern:
  // const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  // return uuidPattern.test(sessionId);

  return true;
}

/**
 * Format a session ID for display
 * 
 * @param {string} sessionId - The session ID to format
 * @returns {string} Formatted session ID for display
 */
export function formatSessionId(sessionId) {
  if (!isValidSessionId(sessionId)) {
    return 'Invalid Session';
  }

  // Could add formatting here if desired
  // For example, truncating very long IDs, adding prefix/suffix, etc.
  return sessionId;
}

/**
 * Create error message for invalid session
 *
 * @returns {string} Standardized error message
 */
export function getInvalidSessionMessage() {
  return "Please select a valid study session before continuing.";
}

/**
 * Get session-aware request options to send to API endpoints
 * 
 * @param {string} sessionId - The session ID
 * @param {object} data - The data object to include in the request
 * @returns {object} Configured request options with session ID
 */
export function getSessionRequestOptions(sessionId, data = {}) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      study_id: sessionId
    }),
  };
}