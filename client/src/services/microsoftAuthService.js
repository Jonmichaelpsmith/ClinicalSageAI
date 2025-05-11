/**
 * Microsoft Authentication Service
 * 
 * This service handles authentication with Microsoft services for accessing
 * Microsoft Graph API, SharePoint, and other Microsoft services.
 * 
 * NOTE: This is a simplified version that simulates authentication without
 * actual MSAL integration. In production, this would use @azure/msal-browser.
 */

import { loginRequest } from '../config/microsoftConfig';

// Mock user account and authentication state
let authenticatedAccount = null;
let accessToken = null;
let tokenExpiresOn = null;

/**
 * Initialize the Microsoft Authentication Library (simulation)
 * @returns {Object} The auth instance
 */
export const initializeMsal = () => {
  console.log('Initializing Microsoft authentication (simulation)');
  return {
    getAllAccounts: () => authenticatedAccount ? [authenticatedAccount] : [],
    getActiveAccount: () => authenticatedAccount,
    loginPopup: async () => simulateLogin(),
    acquireTokenSilent: async () => {
      if (!accessToken || new Date() > tokenExpiresOn) {
        throw new Error('Token expired or not available');
      }
      return { accessToken, expiresOn: tokenExpiresOn };
    },
    acquireTokenPopup: async () => simulateLogin(),
    logout: async () => {
      authenticatedAccount = null;
      accessToken = null;
      tokenExpiresOn = null;
      return true;
    }
  };
};

/**
 * Simulate a login response
 * @returns {Object} The auth result
 */
const simulateLogin = async () => {
  // Generate a mock token that expires in 1 hour
  const mockToken = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJDbGluaWNhbFNhZ2VBSSIsImlhdCI6JHtEYXRlLm5vdygpfSwiZXhwIjoke0RhdGUubm93KCkgKyAzNjAwMDAwfSwiYXVkIjoid3d3LmNsaW5pY2Fsc2FnZWFpLmNvbSIsInN1YiI6InVzZXJAY2xpbmljYWxzYWdlYWkuY29tIn0.${Math.random().toString(36).substring(2)}`;
  tokenExpiresOn = new Date(Date.now() + 3600000); // 1 hour from now
  
  // Create a mock user account
  authenticatedAccount = {
    homeAccountId: 'user-1',
    environment: 'msft.com',
    tenantId: 'tenant-1',
    username: 'user@example.com',
    name: 'Demo User',
    localAccountId: 'user-1'
  };
  
  accessToken = mockToken;
  
  return {
    account: authenticatedAccount,
    accessToken: mockToken,
    expiresOn: tokenExpiresOn
  };
};

/**
 * Sign in the user with Microsoft
 * @returns {Promise<Object>} The authentication result
 */
export const signInWithMicrosoft = async () => {
  try {
    // Check if user is already signed in
    if (authenticatedAccount && accessToken && new Date() < tokenExpiresOn) {
      return {
        success: true,
        account: authenticatedAccount,
        accessToken,
        expiresOn: tokenExpiresOn
      };
    }
    
    // Simulate new login
    const result = await simulateLogin();
    
    return {
      success: true,
      account: result.account,
      accessToken: result.accessToken,
      expiresOn: result.expiresOn
    };
  } catch (error) {
    console.error('Error signing in with Microsoft:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sign out the user from Microsoft
 * @returns {Promise<boolean>} Whether sign out succeeded
 */
export const signOutFromMicrosoft = async () => {
  try {
    // Clear authentication state
    authenticatedAccount = null;
    accessToken = null;
    tokenExpiresOn = null;
    
    return true;
  } catch (error) {
    console.error('Error signing out from Microsoft:', error);
    return false;
  }
};

/**
 * Get the current authenticated user
 * @returns {Object|null} The authenticated user or null if not authenticated
 */
export const getCurrentUser = () => {
  return authenticatedAccount;
};

/**
 * Get an access token for Microsoft services
 * @param {Array<string>} scopes OAuth scopes to request
 * @returns {Promise<string>} The access token
 */
export const getAccessToken = async (scopes = loginRequest.scopes) => {
  try {
    if (!authenticatedAccount) {
      throw new Error('No authenticated user');
    }
    
    if (!accessToken || new Date() > tokenExpiresOn) {
      const result = await simulateLogin();
      return result.accessToken;
    }
    
    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

/**
 * Check if the user is authenticated
 * @returns {boolean} Whether the user is authenticated
 */
export const isAuthenticated = () => {
  return !!authenticatedAccount && !!accessToken && new Date() < tokenExpiresOn;
};

/**
 * Get Microsoft Graph client authentication headers
 * @returns {Promise<Object>} Headers for Graph API requests
 */
export const getGraphAuthHeaders = async () => {
  try {
    const token = await getAccessToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.error('Error getting Graph auth headers:', error);
    throw error;
  }
};

// Export a default API for importing
export default {
  initializeMsal,
  signInWithMicrosoft,
  signOutFromMicrosoft,
  getCurrentUser,
  getAccessToken,
  isAuthenticated,
  getGraphAuthHeaders
};