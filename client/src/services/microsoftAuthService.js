/**
 * Microsoft Authentication Service
 * 
 * This service provides integration with Microsoft authentication system,
 * enabling login, token management, and session handling for Microsoft 365.
 */

import axios from 'axios';

// Authentication state
let _isAuthenticated = false;
let _isInitialized = false;

/**
 * Initialize the Microsoft authentication service
 * 
 * @returns {Promise<boolean>} - True if initialization was successful
 */
export async function initializeAuth() {
  try {
    if (_isInitialized) {
      return true;
    }
    
    console.log('Initializing Microsoft authentication...');
    
    // Check if we have a valid token in local storage
    const accessToken = localStorage.getItem('ms_access_token');
    const expiresAt = localStorage.getItem('ms_token_expires_at');
    
    if (accessToken && expiresAt) {
      const now = new Date();
      const expirationDate = new Date(parseInt(expiresAt, 10));
      
      // Check if token is still valid
      if (expirationDate > now) {
        console.log('Found valid Microsoft token in local storage');
        _isAuthenticated = true;
      } else {
        console.log('Microsoft token expired, will need to refresh');
        
        // Try to refresh the token
        const refreshToken = localStorage.getItem('ms_refresh_token');
        if (refreshToken) {
          try {
            await refreshTokenSilently(refreshToken);
          } catch (refreshError) {
            console.warn('Failed to refresh token silently:', refreshError);
            clearTokens();
            _isAuthenticated = false;
          }
        } else {
          clearTokens();
          _isAuthenticated = false;
        }
      }
    } else {
      console.log('No Microsoft token found in local storage');
      _isAuthenticated = false;
    }
    
    _isInitialized = true;
    return true;
  } catch (error) {
    console.error('Error initializing Microsoft authentication:', error);
    _isInitialized = false;
    return false;
  }
}

/**
 * Check if user is authenticated with Microsoft
 * 
 * @returns {boolean} - True if user is authenticated
 */
export function isAuthenticated() {
  return _isAuthenticated;
}

/**
 * Get Microsoft access token
 * 
 * @returns {string|null} - Access token or null if not authenticated
 */
export function getAccessToken() {
  return localStorage.getItem('ms_access_token');
}

/**
 * Initiate Microsoft login flow
 * 
 * @returns {Promise<void>}
 */
export async function login() {
  try {
    // Get login URL from server
    const response = await axios.get('/api/microsoft-office/auth/login-url');
    
    // Store current location to redirect back after login
    localStorage.setItem('ms_auth_redirect', window.location.pathname);
    
    // Redirect to Microsoft login page
    window.location.href = response.data.url;
  } catch (error) {
    console.error('Error initiating Microsoft login:', error);
    throw error;
  }
}

/**
 * Handle the auth callback after Microsoft login
 * 
 * @param {Object} params - URL query params from the callback
 * @returns {Promise<Object>} - Auth result with tokens
 */
export async function handleAuthCallback(params) {
  try {
    if (!params.code) {
      throw new Error('No authorization code provided');
    }
    
    // Exchange code for tokens
    const response = await axios.post('/api/microsoft-office/auth/token', {
      code: params.code
    });
    
    // Store tokens in local storage
    storeTokens(response.data);
    
    _isAuthenticated = true;
    
    // Return to the original location
    const redirectPath = localStorage.getItem('ms_auth_redirect') || '/';
    localStorage.removeItem('ms_auth_redirect');
    
    return {
      success: true,
      redirectPath
    };
  } catch (error) {
    console.error('Error handling Microsoft auth callback:', error);
    _isAuthenticated = false;
    return {
      success: false,
      error: error.message || 'Authentication failed'
    };
  }
}

/**
 * Refresh token silently
 * 
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} - New tokens
 */
async function refreshTokenSilently(refreshToken) {
  try {
    const response = await axios.post('/api/microsoft-office/auth/refresh', {
      refreshToken
    });
    
    // Store new tokens
    storeTokens(response.data);
    
    _isAuthenticated = true;
    
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    _isAuthenticated = false;
    throw error;
  }
}

/**
 * Store tokens in local storage
 * 
 * @param {Object} tokens - Auth tokens
 */
function storeTokens(tokens) {
  const now = new Date();
  const expiresAt = now.getTime() + (tokens.expiresIn * 1000);
  
  localStorage.setItem('ms_access_token', tokens.accessToken);
  localStorage.setItem('ms_refresh_token', tokens.refreshToken);
  localStorage.setItem('ms_token_expires_at', expiresAt.toString());
}

/**
 * Clear tokens from local storage
 */
function clearTokens() {
  localStorage.removeItem('ms_access_token');
  localStorage.removeItem('ms_refresh_token');
  localStorage.removeItem('ms_token_expires_at');
}

/**
 * Logout from Microsoft
 * 
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    // Call logout endpoint
    await axios.post('/api/microsoft-office/auth/logout');
    
    // Clear tokens
    clearTokens();
    
    _isAuthenticated = false;
  } catch (error) {
    console.error('Error logging out from Microsoft:', error);
    
    // Still clear tokens even if the API call fails
    clearTokens();
    _isAuthenticated = false;
    
    throw error;
  }
}