/**
 * Google Auth Service
 * 
 * Handles authentication with Google, stores tokens, and provides
 * helper methods for the Google Docs integration.
 */

import { useToast } from '../hooks/use-toast';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = '1045075234440-sve60m8va1d4djdistod8g4lbo8vp791.apps.googleusercontent.com';
const REDIRECT_URI = `${window.location.origin}/google/auth/callback`;

// Scopes required for Google Docs integration
const SCOPES = [
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
].join(' ');

// Storage keys
const TOKEN_STORAGE_KEY = 'trialsage_google_auth_token';
const USER_STORAGE_KEY = 'trialsage_google_user';

class GoogleAuthService {
  constructor() {
    console.log('Initializing Google Auth Service');
    
    // Check if the user is already authenticated
    this.token = this.getToken();
    this.user = this.getUser();
    
    // Log the authentication status (without exposing the token)
    if (this.token) {
      console.log('User is authenticated with Google');
    } else {
      console.log('User is not authenticated with Google');
    }
  }

  /**
   * Initiates the OAuth flow by redirecting to Google's authorization page
   */
  initiateAuth() {
    try {
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
      authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.append('response_type', 'token');
      authUrl.searchParams.append('scope', SCOPES);
      authUrl.searchParams.append('include_granted_scopes', 'true');
      authUrl.searchParams.append('prompt', 'consent');
      
      // Redirect to Google's authorization page
      window.location.href = authUrl.toString();
    } catch (error) {
      console.error('Error initiating Google authentication:', error);
      throw new Error('Failed to initiate Google authentication');
    }
  }

  /**
   * Handles the authentication callback and extracts the token
   * @param {string} callbackUrl - The full URL with hash parameters from Google
   * @returns {Promise<object>} The authentication result
   */
  async handleAuthCallback(callbackUrl) {
    try {
      // Extract the token from the URL hash
      const hashParams = new URLSearchParams(callbackUrl.split('#')[1]);
      const accessToken = hashParams.get('access_token');
      const expiresIn = hashParams.get('expires_in');
      
      if (!accessToken) {
        throw new Error('No access token received from Google');
      }
      
      // Calculate expiration time
      const expirationTime = Date.now() + (parseInt(expiresIn, 10) * 1000);
      
      const tokenData = {
        accessToken,
        expirationTime
      };
      
      // Store the token
      this.storeToken(tokenData);
      this.token = tokenData;
      
      // Fetch and store the user info
      await this.fetchAndStoreUserInfo(accessToken);
      
      return {
        success: true,
        message: 'Successfully authenticated with Google'
      };
    } catch (error) {
      console.error('Error handling Google authentication callback:', error);
      return {
        success: false,
        message: error.message || 'Authentication failed'
      };
    }
  }

  /**
   * Fetches the user's information from Google and stores it
   * @param {string} accessToken - The Google access token
   */
  async fetchAndStoreUserInfo(accessToken) {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user info from Google');
      }
      
      const userData = await response.json();
      this.storeUser(userData);
      this.user = userData;
      
      return userData;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  /**
   * Stores the authentication token in localStorage
   * @param {object} tokenData - The token data to store
   */
  storeToken(tokenData) {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
    } catch (error) {
      console.error('Error storing Google authentication token:', error);
    }
  }

  /**
   * Retrieves the authentication token from localStorage
   * @returns {object|null} The token data or null if not found/expired
   */
  getToken() {
    try {
      const tokenData = JSON.parse(localStorage.getItem(TOKEN_STORAGE_KEY));
      
      // Check if the token exists and is still valid
      if (tokenData && tokenData.expirationTime > Date.now()) {
        return tokenData;
      }
      
      // Token is expired or doesn't exist
      this.clearToken();
      return null;
    } catch (error) {
      console.error('Error retrieving Google authentication token:', error);
      this.clearToken();
      return null;
    }
  }

  /**
   * Clears the authentication token from localStorage
   */
  clearToken() {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      this.token = null;
    } catch (error) {
      console.error('Error clearing Google authentication token:', error);
    }
  }

  /**
   * Stores the user information in localStorage
   * @param {object} userData - The user data to store
   */
  storeUser(userData) {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing Google user information:', error);
    }
  }

  /**
   * Retrieves the user information from localStorage
   * @returns {object|null} The user data or null if not found
   */
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
    } catch (error) {
      console.error('Error retrieving Google user information:', error);
      return null;
    }
  }

  /**
   * Clears the user information from localStorage
   */
  clearUser() {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      this.user = null;
    } catch (error) {
      console.error('Error clearing Google user information:', error);
    }
  }

  /**
   * Logs the user out by clearing all stored data
   */
  logout() {
    this.clearToken();
    this.clearUser();
  }

  /**
   * Checks if the user is authenticated with Google
   * @returns {boolean} True if authenticated, false otherwise
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Gets the authenticated user's information
   * @returns {object|null} The user information or null if not authenticated
   */
  getCurrentUser() {
    return this.getUser();
  }

  /**
   * Gets the active access token for API calls
   * @returns {string|null} The access token or null if not authenticated
   */
  getAccessToken() {
    const tokenData = this.getToken();
    return tokenData ? tokenData.accessToken : null;
  }
}

// Create a singleton instance
const googleAuthService = new GoogleAuthService();

export default googleAuthService;