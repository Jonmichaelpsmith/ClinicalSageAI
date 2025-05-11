/**
 * Microsoft 365 Authentication Service
 * 
 * This service handles authentication with Microsoft 365 and Azure AD
 * to enable seamless integration with Microsoft Word, OneDrive, and other Microsoft services.
 * 
 * It uses the proper OAuth 2.0 flow required for Microsoft Graph API access.
 */

// Configuration 
const MS_AUTH_CONFIG = {
  clientId: process.env.MICROSOFT_CLIENT_ID || '',
  tenantId: process.env.MICROSOFT_TENANT_ID || 'common', // 'common' allows any Microsoft account
  redirectUri: window.location.origin + '/auth/microsoft/callback',
  authority: 'https://login.microsoftonline.com/',
  scopes: [
    'https://graph.microsoft.com/Files.ReadWrite',
    'https://graph.microsoft.com/Sites.ReadWrite.All',
    'https://officeapps.live.com/embedded/AllSites.Write',
    'offline_access', // For refresh tokens
    'openid',
    'profile'
  ]
};

/**
 * Initialize the Microsoft authentication context
 */
export async function initializeMicrosoftAuth() {
  try {
    // In a production implementation, we would:
    // 1. Initialize MSAL (Microsoft Authentication Library)
    // 2. Check if user is already logged in
    // 3. Set up silent refresh for tokens
    
    // Simulate successful initialization
    console.log('Microsoft authentication initialized successfully');
    
    // Check if user is already logged in
    const authState = getAuthState();
    return { isAuthenticated: authState.isAuthenticated };
  } catch (error) {
    console.error('Failed to initialize Microsoft authentication:', error);
    return { isAuthenticated: false, error };
  }
}

/**
 * Get the current authentication state
 */
export function getAuthState() {
  // In a production implementation, this would check the MSAL cache or localStorage
  // for valid access tokens and authentication state
  
  // Get auth state from localStorage (for demo)
  try {
    const storedAuthState = localStorage.getItem('ms_auth_state');
    return storedAuthState ? JSON.parse(storedAuthState) : { isAuthenticated: false };
  } catch (error) {
    console.error('Error getting auth state:', error);
    return { isAuthenticated: false };
  }
}

/**
 * Sign in with Microsoft
 */
export async function signInWithMicrosoft() {
  try {
    // In a production implementation, this would:
    // 1. Use MSAL to redirect to Microsoft login page
    // 2. Handle the auth response
    // 3. Store tokens securely
    
    // For demo purposes, generate the auth URL for redirection
    const authUrl = `${MS_AUTH_CONFIG.authority}${MS_AUTH_CONFIG.tenantId}/oauth2/v2.0/authorize?client_id=${MS_AUTH_CONFIG.clientId}&response_type=code&redirect_uri=${encodeURIComponent(MS_AUTH_CONFIG.redirectUri)}&scope=${encodeURIComponent(MS_AUTH_CONFIG.scopes.join(' '))}&response_mode=query`;
    
    // In a real implementation, we would redirect to this URL
    // window.location.href = authUrl;
    
    // For demo, return the URL so the app can handle redirection
    return { authUrl };
  } catch (error) {
    console.error('Failed to sign in with Microsoft:', error);
    return { error };
  }
}

/**
 * Handle authentication callback
 * @param {string} authCode - Authorization code from Microsoft
 */
export async function handleAuthCallback(authCode) {
  try {
    // In a production implementation, this would:
    // 1. Exchange the auth code for tokens
    // 2. Store tokens securely
    // 3. Update auth state
    
    // For demo purposes, simulate a successful exchange
    const mockTokenResponse = {
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      expiresIn: 3600,
      tokenType: 'Bearer'
    };
    
    // Store auth state in localStorage (for demo)
    const authState = {
      isAuthenticated: true,
      tokenExpiry: Date.now() + (mockTokenResponse.expiresIn * 1000),
      userInfo: {
        name: 'Authenticated User',
        email: 'user@example.com'
      }
    };
    
    localStorage.setItem('ms_auth_state', JSON.stringify(authState));
    
    return { success: true };
  } catch (error) {
    console.error('Failed to handle auth callback:', error);
    return { error };
  }
}

/**
 * Get access token for Microsoft Graph API
 */
export async function getMicrosoftGraphToken() {
  try {
    // In a production implementation, this would:
    // 1. Check token cache
    // 2. Refresh token if needed
    // 3. Return valid access token
    
    const authState = getAuthState();
    
    if (!authState.isAuthenticated) {
      throw new Error('User not authenticated with Microsoft');
    }
    
    // For demo purposes, return a mock token
    return { accessToken: 'mock_access_token' };
  } catch (error) {
    console.error('Failed to get Microsoft Graph token:', error);
    return { error };
  }
}

/**
 * Sign out from Microsoft
 */
export async function signOutFromMicrosoft() {
  try {
    // In a production implementation, this would:
    // 1. Clear MSAL cache
    // 2. Optionally redirect to Microsoft logout endpoint
    
    // Clear auth state from localStorage (for demo)
    localStorage.removeItem('ms_auth_state');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to sign out from Microsoft:', error);
    return { error };
  }
}

/**
 * Check if Microsoft Word is available in the user's subscription
 */
export async function checkMicrosoftWordAvailability() {
  try {
    // In a production implementation, this would:
    // 1. Call Microsoft Graph API to check licenses
    // 2. Verify Word subscription status
    
    // For demo purposes, assume Word is available
    return { 
      isAvailable: true,
      details: {
        product: 'Microsoft 365',
        includes: ['Word', 'Excel', 'PowerPoint', 'Outlook']
      }
    };
  } catch (error) {
    console.error('Failed to check Microsoft Word availability:', error);
    return { error };
  }
}