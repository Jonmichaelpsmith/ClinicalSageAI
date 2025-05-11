/**
 * Google Authentication Service
 * 
 * This service handles authentication with Google APIs for document operations.
 * It manages OAuth 2.0 authentication flow and token management.
 */

import { GOOGLE_CONFIG } from '../config/googleConfig';

// Track authentication state
let isAuthenticated = false;
let currentUser = null;

/**
 * Initialize the Google Auth API
 * @returns {Promise<void>}
 */
export const initGoogleAuth = async () => {
  console.log('Initializing Google Auth Service');
  
  // Check if we already have cached credentials in localStorage
  const cachedToken = localStorage.getItem('google_access_token');
  if (cachedToken) {
    // Verify the token is still valid
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + cachedToken);
      const data = await response.json();
      
      if (data.error) {
        console.log('Cached token is invalid, clearing');
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_user_info');
        isAuthenticated = false;
        currentUser = null;
        return;
      }
      
      // Token is valid
      isAuthenticated = true;
      currentUser = JSON.parse(localStorage.getItem('google_user_info') || '{}');
      console.log('Using cached authentication');
      return;
    } catch (error) {
      console.error('Error verifying token:', error);
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('google_user_info');
      isAuthenticated = false;
      currentUser = null;
      return;
    }
  }
  
  // No cached credentials, we'd need to authenticate
  isAuthenticated = false;
  currentUser = null;
};

/**
 * Check if user is authenticated with Google
 * @returns {boolean}
 */
export const isGoogleAuthenticated = () => {
  return isAuthenticated;
};

/**
 * Get the currently authenticated user information
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
  return currentUser;
};

/**
 * Sign in with Google
 * @returns {Promise<Object>} User information
 */
export const signInWithGoogle = async () => {
  console.log('Initiating Google Sign-In with Client ID:', GOOGLE_CONFIG.CLIENT_ID);
  
  return new Promise((resolve, reject) => {
    try {
      // Create popup window for OAuth flow
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      // Build OAuth URL
      const scopes = encodeURIComponent(GOOGLE_CONFIG.SCOPES.join(' '));
      const redirectUri = encodeURIComponent(GOOGLE_CONFIG.REDIRECT_URI);
      const state = Math.random().toString(36).substring(2, 15); // Random state for security
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?`+
        `client_id=${GOOGLE_CONFIG.CLIENT_ID}`+
        `&redirect_uri=${redirectUri}`+
        `&response_type=token`+
        `&scope=${scopes}`+
        `&prompt=select_account`+
        `&state=${state}`+
        `&include_granted_scopes=true`;
      
      console.log('Opening Google Auth window with URL containing client ID:', GOOGLE_CONFIG.CLIENT_ID);
      
      const popupWindow = window.open(
        authUrl,
        'Google Sign In',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      // Check if popup was blocked
      if (!popupWindow) {
        console.error('Popup was blocked');
        reject(new Error('Popup was blocked. Please allow popups for this site.'));
        return;
      }
      
      // Handle authentication response
      window.handleGoogleAuthCallback = (result) => {
        if (result.error) {
          console.error('Auth callback error:', result.error);
          reject(new Error(result.error));
          return;
        }
        
        console.log('Received auth callback data');
        
        // Set authentication data
        isAuthenticated = true;
        currentUser = result.user;
        
        // Cache authentication in localStorage
        localStorage.setItem('google_access_token', result.access_token);
        localStorage.setItem('google_user_info', JSON.stringify(result.user));
        
        // Return user info
        resolve(result.user);
      };
      
      // Poll for changes in the popup URL
      const pollPopup = setInterval(() => {
        try {
          // Check if popup closed
          if (popupWindow.closed) {
            clearInterval(pollPopup);
            console.log('Auth popup closed by user');
            reject(new Error('Authentication cancelled by user'));
            return;
          }
          
          // Check for redirection to our callback URL
          try {
            const currentUrl = popupWindow.location.href;
            console.log('Checking popup URL:', currentUrl.substring(0, 50) + '...');
            
            if (currentUrl.includes('access_token=')) {
              clearInterval(pollPopup);
              console.log('Access token found in URL');
              
              // Parse token and user info from URL
              const params = new URLSearchParams(popupWindow.location.hash.substring(1));
              const access_token = params.get('access_token');
              
              // Close popup
              popupWindow.close();
              
              // Get user info with access token
              fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` }
              })
                .then(response => {
                  if (!response.ok) {
                    throw new Error('Failed to fetch user info: ' + response.status);
                  }
                  return response.json();
                })
                .then(userInfo => {
                  const user = {
                    id: userInfo.sub,
                    name: userInfo.name,
                    email: userInfo.email,
                    picture: userInfo.picture
                  };
                  
                  console.log('User info retrieved:', user.email);
                  
                  window.handleGoogleAuthCallback({
                    user,
                    access_token
                  });
                })
                .catch(error => {
                  console.error('Error fetching user info:', error);
                  reject(error);
                });
            }
          } catch (crossOriginError) {
            // Ignore cross-origin errors when polling
            // This happens when Google is authenticating
          }
        } catch (e) {
          // Ignore other errors during polling
          console.log('Auth poll error (normal during redirect):', e.message);
        }
      }, 700);
      
      // Set timeout (2 minutes)
      setTimeout(() => {
        clearInterval(pollPopup);
        if (!popupWindow.closed) {
          popupWindow.close();
        }
        console.error('Authentication timed out after 2 minutes');
        reject(new Error('Authentication timed out'));
      }, 120000);
    } catch (error) {
      console.error('Sign-in error:', error);
      reject(error);
    }
  });
};

/**
 * Sign out from Google
 * @returns {Promise<void>}
 */
export const signOutFromGoogle = async () => {
  // In a real implementation, this would sign out from the Google API
  // For now, we just clear our state
  
  console.log('Signing out from Google');
  
  // Clear state
  isAuthenticated = false;
  currentUser = null;
  
  // Clear cached credentials
  localStorage.removeItem('google_access_token');
  localStorage.removeItem('google_user_info');
};

/**
 * Get a Google access token for API calls
 * @returns {Promise<string>} Access token
 */
export const getGoogleAccessToken = async () => {
  // In a real implementation, this would retrieve (and refresh if needed) the access token
  // For now, we return a simulated token
  
  if (!isAuthenticated) {
    throw new Error('Not authenticated with Google');
  }
  
  return localStorage.getItem('google_access_token') || 'simulated-access-token';
};

/**
 * Check if the user has sufficient permissions for the given scopes
 * @param {string[]} requiredScopes - Array of required OAuth scopes
 * @returns {Promise<boolean>} Whether the user has all required permissions
 */
export const hasRequiredScopes = async (requiredScopes = []) => {
  // In a real implementation, this would check if the current auth token has the required scopes
  // For now, we always return true for simplicity
  
  if (!isAuthenticated) {
    return false;
  }
  
  // In a real implementation, you would check if all requiredScopes are included
  // in the granted scopes for the current token
  return true;
};

// Initialize auth on module load
initGoogleAuth().catch(err => {
  console.error('Failed to initialize Google Auth:', err);
});