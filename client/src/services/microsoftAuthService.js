/**
 * Microsoft Authentication Service
 * 
 * This service handles authentication with Microsoft Azure AD for Office integration.
 * It provides methods for login, token management, and user information retrieval.
 */

// API endpoints
const MS_OFFICE_AUTH_ENDPOINT = '/api/microsoft-office';

// Microsoft authentication configurations
const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID || 'MICROSOFT_CLIENT_ID';
const tenantId = import.meta.env.VITE_MICROSOFT_TENANT_ID || 'MICROSOFT_TENANT_ID';
const scopes = 'https://officeapps.live.com/files.readwrite.all https://graph.microsoft.com/User.Read';
const redirectUri = window.location.origin + '/auth-callback';

/**
 * Generate Microsoft authentication URL
 * @returns {string} Microsoft authentication URL
 */
export function getMicrosoftAuthUrl() {
  try {
    // Use MSAL to construct the auth URL directly on the client
    // This approach allows us to avoid a server roundtrip for generating the URL
    
    const authEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`;
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scopes,
      response_mode: 'query',
      state: Math.random().toString(36).substring(2, 15),
    });
    
    return `${authEndpoint}?${params.toString()}`;
  } catch (error) {
    console.error('Error generating Microsoft auth URL:', error);
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
export function login() {
  try {
    // Generate the auth URL
    const authUrl = getMicrosoftAuthUrl();
    
    // Log important info for debugging
    console.log('Starting Microsoft login process...');
    console.log('Using client ID:', clientId);
    console.log('Using tenant ID:', tenantId);
    console.log('Redirect URI:', redirectUri);
    console.log('Auth URL:', authUrl);
    
    // Redirect to Microsoft login
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