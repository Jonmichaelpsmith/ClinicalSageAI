/**
 * Session Utilities
 * 
 * This module provides centralized session validation and handling
 * functionality for use across TrialSage components.
 */
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to access and manage the current study session
 * @returns {Object} Session management object
 */
export function useCurrentSession() {
  const [currentSession, setCurrentSession] = useState(null);
  
  // Fetch the active session from the server
  const { data: sessionData, isLoading } = useQuery({
    queryKey: ['/api/sessions/current'],
    staleTime: 60000, // 1 minute
  });
  
  useEffect(() => {
    if (sessionData && sessionData.session) {
      setCurrentSession(sessionData.session);
    }
  }, [sessionData]);
  
  // Set a different session as active
  const setActiveSession = async (sessionId) => {
    if (!isValidSessionId(sessionId)) return false;
    
    try {
      const response = await fetch('/api/sessions/set-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentSession(data.session);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting active session:', error);
      return false;
    }
  };
  
  return {
    currentSession,
    setActiveSession,
    isLoading
  };
}

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

/**
 * Log an insight/action to the study session memory
 * 
 * @param {string} sessionId - The session ID
 * @param {string} title - Title of the insight
 * @param {string} summary - Summary of the insight
 * @param {string} status - Status of the insight ('started', 'in_progress', 'completed', 'error')
 * @returns {Promise} - Promise resolving to the insight record
 */
export async function logInsight(sessionId, title, summary, status = 'completed') {
  if (!isValidSessionId(sessionId)) {
    console.error('Invalid session ID passed to logInsight');
    return null;
  }
  
  try {
    const response = await fetch('/api/insight/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        study_id: sessionId,
        title,
        summary,
        status
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to log insight: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error logging insight:', error);
    return null;
  }
}

/**
 * Log a wisdom trace entry to track decision-making steps
 * 
 * @param {string} sessionId - The session ID
 * @param {string} input - Original input or trigger
 * @param {string[]} reasoning - Array of reasoning steps
 * @param {string} output - Final output or decision
 * @returns {Promise} - Promise resolving to the created trace
 */
export async function logWisdomTrace(sessionId, input, reasoning, output) {
  if (!isValidSessionId(sessionId)) {
    console.error('Invalid session ID passed to logWisdomTrace');
    return null;
  }
  
  try {
    const response = await fetch('/api/wisdom/trace-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        study_id: sessionId,
        input,
        reasoning: Array.isArray(reasoning) ? reasoning : [reasoning],
        output
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to log wisdom trace: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error logging wisdom trace:', error);
    return null;
  }
}