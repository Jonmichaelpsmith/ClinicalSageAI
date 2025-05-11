/**
 * Microsoft Authentication Service
 * 
 * This service provides integration with Microsoft authentication system,
 * enabling login, token management, and session handling for Microsoft 365
 * for the eCTD Co-Author module.
 */

// Microsoft Authentication Configuration
const MS_AUTH_CONFIG = {
  clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
  tenantId: import.meta.env.VITE_MICROSOFT_TENANT_ID || '',
  redirectUri: window.location.origin + '/auth/microsoft/callback',
  scopes: [
    'User.Read',
    'Files.ReadWrite',
    'Files.ReadWrite.All',
    'Sites.ReadWrite.All',
    'Office.Desktop'
  ]
};

// Token Storage Keys
const TOKEN_STORAGE_KEYS = {
  accessToken: 'ms_access_token',
  refreshToken: 'ms_refresh_token',
  expiresAt: 'ms_expires_at',
  userInfo: 'ms_user_info'
};

/**
 * Initialize the Microsoft authentication service
 * 
 * @returns {Promise<boolean>} - True if initialization was successful
 */
export async function initializeAuth() {
  try {
    // Check if we have a valid token
    if (isTokenValid()) {
      return true;
    }
    
    // Check if we're in a callback scenario
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      // Process the code and get tokens
      const result = await processAuthCode(code);
      return result;
    }
    
    // Not authenticated and not in callback flow
    return false;
  } catch (error) {
    console.error('Failed to initialize Microsoft authentication:', error);
    return false;
  }
}

/**
 * Check if user is authenticated with Microsoft
 * 
 * @returns {boolean} - True if user is authenticated
 */
export function isAuthenticated() {
  return isTokenValid();
}

/**
 * Check if current token is valid
 * 
 * @returns {boolean} - True if token is valid and not expired
 */
function isTokenValid() {
  const accessToken = localStorage.getItem(TOKEN_STORAGE_KEYS.accessToken);
  const expiresAt = localStorage.getItem(TOKEN_STORAGE_KEYS.expiresAt);
  
  if (!accessToken || !expiresAt) {
    return false;
  }
  
  // Check if token is expired
  const now = Date.now();
  const expiration = parseInt(expiresAt, 10);
  
  // Add a 5-minute buffer to ensure we don't use tokens that are about to expire
  return now < (expiration - 5 * 60 * 1000);
}

/**
 * Get Microsoft access token
 * 
 * @returns {string|null} - Access token or null if not authenticated
 */
export function getAccessToken() {
  if (!isTokenValid()) {
    return null;
  }
  
  return localStorage.getItem(TOKEN_STORAGE_KEYS.accessToken);
}

/**
 * Get user information
 * 
 * @returns {Object|null} - User information or null if not authenticated
 */
export function getUserInfo() {
  const userInfoStr = localStorage.getItem(TOKEN_STORAGE_KEYS.userInfo);
  
  if (!userInfoStr) {
    return null;
  }
  
  try {
    return JSON.parse(userInfoStr);
  } catch (error) {
    console.error('Failed to parse user info:', error);
    return null;
  }
}

/**
 * Initiate Microsoft login flow
 * 
 * @returns {Promise<void>}
 */
export async function login() {
  try {
    const { clientId, tenantId, redirectUri, scopes } = MS_AUTH_CONFIG;
    
    if (!clientId || !tenantId) {
      console.error('Microsoft authentication is not configured correctly');
      return false;
    }
    
    // Construct the authorization URL
    const authUrl = new URL('https://login.microsoftonline.com/' + tenantId + '/oauth2/v2.0/authorize');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', scopes.join(' '));
    authUrl.searchParams.append('response_mode', 'query');
    
    // Generate and store a state parameter to prevent CSRF
    const state = generateRandomString(32);
    localStorage.setItem('ms_auth_state', state);
    authUrl.searchParams.append('state', state);
    
    // Redirect to Microsoft login
    window.location.href = authUrl.toString();
    
    // Return true to indicate login flow initiated
    return true;
  } catch (error) {
    console.error('Failed to initiate Microsoft login:', error);
    return false;
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
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    // Check for errors
    if (error) {
      throw new Error(`Authentication error: ${error}. ${errorDescription}`);
    }
    
    // Verify state to prevent CSRF
    const storedState = localStorage.getItem('ms_auth_state');
    if (!storedState || storedState !== state) {
      throw new Error('Invalid state parameter');
    }
    
    // Clear state
    localStorage.removeItem('ms_auth_state');
    
    // Process the authorization code
    const result = await processAuthCode(code);
    return result;
  } catch (error) {
    console.error('Failed to handle auth callback:', error);
    throw error;
  }
}

/**
 * Process the authorization code to get tokens
 * 
 * @param {string} code - Authorization code
 * @returns {Promise<boolean>} - Success status
 */
async function processAuthCode(code) {
  try {
    const { clientId, redirectUri } = MS_AUTH_CONFIG;
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        scope: MS_AUTH_CONFIG.scopes.join(' ')
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(`Token error: ${tokenData.error}. ${tokenData.error_description}`);
    }
    
    // Store tokens
    storeTokens(tokenData);
    
    // Get user info
    await fetchAndStoreUserInfo(tokenData.access_token);
    
    return true;
  } catch (error) {
    console.error('Failed to process authorization code:', error);
    return false;
  }
}

/**
 * Fetch and store user information
 * 
 * @param {string} accessToken - Access token
 * @returns {Promise<Object>} - User information
 */
async function fetchAndStoreUserInfo(accessToken) {
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const userInfo = await response.json();
    
    if (userInfo.error) {
      throw new Error(`User info error: ${userInfo.error.code}. ${userInfo.error.message}`);
    }
    
    // Store user info
    localStorage.setItem(TOKEN_STORAGE_KEYS.userInfo, JSON.stringify(userInfo));
    
    return userInfo;
  } catch (error) {
    console.error('Failed to fetch user info:', error);
    throw error;
  }
}

/**
 * Refresh token silently
 * 
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} - New tokens
 */
export async function refreshTokenSilently() {
  try {
    const refreshToken = localStorage.getItem(TOKEN_STORAGE_KEYS.refreshToken);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const { clientId } = MS_AUTH_CONFIG;
    
    // Exchange refresh token for new tokens
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        scope: MS_AUTH_CONFIG.scopes.join(' ')
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(`Token refresh error: ${tokenData.error}. ${tokenData.error_description}`);
    }
    
    // Store tokens
    storeTokens(tokenData);
    
    return tokenData;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    
    // Clear tokens on refresh failure
    clearTokens();
    
    throw error;
  }
}

/**
 * Store tokens in local storage
 * 
 * @param {Object} tokens - Auth tokens
 */
function storeTokens(tokens) {
  const now = Date.now();
  const expiresIn = tokens.expires_in || 3600; // Default to 1 hour if not provided
  const expiresAt = now + (expiresIn * 1000);
  
  localStorage.setItem(TOKEN_STORAGE_KEYS.accessToken, tokens.access_token);
  
  if (tokens.refresh_token) {
    localStorage.setItem(TOKEN_STORAGE_KEYS.refreshToken, tokens.refresh_token);
  }
  
  localStorage.setItem(TOKEN_STORAGE_KEYS.expiresAt, expiresAt.toString());
}

/**
 * Clear tokens from local storage
 */
function clearTokens() {
  localStorage.removeItem(TOKEN_STORAGE_KEYS.accessToken);
  localStorage.removeItem(TOKEN_STORAGE_KEYS.refreshToken);
  localStorage.removeItem(TOKEN_STORAGE_KEYS.expiresAt);
  localStorage.removeItem(TOKEN_STORAGE_KEYS.userInfo);
}

/**
 * Logout from Microsoft
 * 
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    const { clientId, tenantId, redirectUri } = MS_AUTH_CONFIG;
    
    // Clear tokens
    clearTokens();
    
    // Redirect to logout endpoint
    const logoutUrl = new URL(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout`);
    logoutUrl.searchParams.append('post_logout_redirect_uri', redirectUri);
    logoutUrl.searchParams.append('client_id', clientId);
    
    window.location.href = logoutUrl.toString();
    
    return true;
  } catch (error) {
    console.error('Failed to logout:', error);
    return false;
  }
}

/**
 * Generate a random string for state parameter
 * 
 * @param {number} length - Length of the random string
 * @returns {string} - Random string
 */
function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset[randomIndex];
  }
  
  return result;
}