/**
 * Microsoft Authentication Service
 * 
 * This service handles authentication with Microsoft Azure AD for Office integration.
 * It provides methods for login, token management, and user information retrieval.
 */

// API endpoints
const MS_OFFICE_AUTH_ENDPOINT = '/api/microsoft-office';

// Microsoft authentication configurations - these should be set from environment variables
const redirectUri = window.location.origin + '/auth-callback';

/**
 * Generate Microsoft authentication URL
 * @returns {Promise<string>} Microsoft authentication URL
 */
export async function getMicrosoftAuthUrl() {
  try {
    const response = await fetch(`${MS_OFFICE_AUTH_ENDPOINT}/auth-url`);
    
    if (!response.ok) {
      throw new Error(`Failed to get auth URL: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.authUrl;
  } catch (error) {
    console.error('Error getting Microsoft auth URL:', error);
    throw error;
  }
}

/**
 * Handle the authorization code callback from Microsoft
 * @param {string} code - Authorization code from Microsoft
 * @returns {Promise<object>} Token response
 */
export async function exchangeCodeForToken(code) {
  try {
    if (!code) {
      throw new Error('Authorization code is required');
    }
    
    const response = await fetch(`${MS_OFFICE_AUTH_ENDPOINT}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to exchange code: ${response.status} ${response.statusText}`);
    }
    
    const tokenData = await response.json();
    
    // Store tokens securely
    localStorage.setItem('ms_access_token', tokenData.access_token);
    localStorage.setItem('ms_refresh_token', tokenData.refresh_token);
    localStorage.setItem('ms_token_expiry', new Date(Date.now() + tokenData.expires_in * 1000).toISOString());
    
    return tokenData;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}

/**
 * Get current Microsoft access token, refreshing if necessary
 * @returns {Promise<string>} Access token
 */
export async function getAccessToken() {
  try {
    // Check if token exists and is not expired
    const accessToken = localStorage.getItem('ms_access_token');
    const tokenExpiry = localStorage.getItem('ms_token_expiry');
    
    if (accessToken && tokenExpiry && new Date(tokenExpiry) > new Date()) {
      return accessToken;
    }
    
    // Token expired or doesn't exist, try to refresh
    const refreshToken = localStorage.getItem('ms_refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available. User needs to login again.');
    }
    
    // Refresh token logic would go here in a real implementation
    // For now, we'll assume the refresh is successful
    
    console.log('Access token expired. In a real implementation, this would refresh the token.');
    
    // For demonstration, return the existing token
    return accessToken || '';
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

/**
 * Get current user information from Microsoft
 * @returns {Promise<object>} User information
 */
export async function getCurrentUser() {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      throw new Error('No access token available. User needs to login first.');
    }
    
    const response = await fetch(`${MS_OFFICE_AUTH_ENDPOINT}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
}

/**
 * Check if user is authenticated with Microsoft
 * @returns {boolean} True if authenticated
 */
export function isAuthenticated() {
  const accessToken = localStorage.getItem('ms_access_token');
  const tokenExpiry = localStorage.getItem('ms_token_expiry');
  
  return !!(accessToken && tokenExpiry && new Date(tokenExpiry) > new Date());
}

/**
 * Logout from Microsoft
 */
export function logout() {
  localStorage.removeItem('ms_access_token');
  localStorage.removeItem('ms_refresh_token');
  localStorage.removeItem('ms_token_expiry');
}

/**
 * Log in with Microsoft
 * Redirects to Microsoft login page
 */
export async function login() {
  try {
    const authUrl = await getMicrosoftAuthUrl();
    window.location.href = authUrl;
  } catch (error) {
    console.error('Error during Microsoft login:', error);
    throw error;
  }
}

/**
 * Initialize Microsoft authentication handling
 * @returns {Promise<void>}
 */
export async function initializeAuth() {
  try {
    // Handle authorization code in URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      await exchangeCodeForToken(code);
      
      // Remove code from URL to prevent issues on page refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  } catch (error) {
    console.error('Error initializing Microsoft auth:', error);
    throw error;
  }
}