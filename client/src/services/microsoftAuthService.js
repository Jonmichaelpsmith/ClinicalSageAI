/**
 * Microsoft Authentication Service
 * 
 * This service handles authentication with Microsoft services for integration
 * with Office 365, SharePoint, and OneDrive. It provides methods for sign-in,
 * token management, and authorization for Microsoft Graph API access.
 * 
 * Note: This is a simplified implementation that simulates Microsoft authentication
 * for development purposes. In a production environment, you would implement
 * proper authentication using the Microsoft Authentication Library (MSAL).
 */

// Configuration for Microsoft Authentication
const msConfig = {
  clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
  tenantId: import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common',
  redirectUri: window.location.origin,
};

// Microsoft Graph API scopes needed for our application
const graphScopes = [
  'User.Read',
  'Files.ReadWrite',
  'Files.ReadWrite.All',
  'Sites.ReadWrite.All',
  'offline_access'
];

// Simulation state
let simulatedAuthState = {
  isAuthenticated: false,
  accessToken: null,
  user: null,
  tokenExpiry: null
};

/**
 * Initialize the Microsoft Auth service
 * @returns {Promise<boolean>} True if initialized successfully
 */
export const initializeMicrosoftAuth = async () => {
  try {
    console.log('Initializing Microsoft authentication simulation');
    
    // In a real implementation, you would initialize MSAL here
    // For now, we'll just check if the config is valid
    
    if (!msConfig.clientId) {
      console.warn('Microsoft Client ID not configured. Using simulated authentication.');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing Microsoft authentication:', error);
    return false;
  }
};

/**
 * Alias for initializeMicrosoftAuth to match imports
 */
export const initializeAuth = initializeMicrosoftAuth;

/**
 * Sign in with Microsoft
 * @returns {Promise<Object>} Authentication result
 */
export const signInWithMicrosoft = async () => {
  try {
    console.log('Simulating Microsoft sign-in');
    
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a fake token that expires in 1 hour
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 1);
    
    // Set the simulated auth state
    simulatedAuthState = {
      isAuthenticated: true,
      accessToken: `simulated-ms-token-${Date.now()}`,
      user: {
        username: 'demo.user@example.com',
        name: 'Demo User',
        tenantId: msConfig.tenantId,
        localAccountId: `local-account-${Date.now()}`,
        environment: 'development'
      },
      tokenExpiry: expiryTime
    };
    
    return {
      accessToken: simulatedAuthState.accessToken,
      account: simulatedAuthState.user,
      scopes: graphScopes,
      expiresOn: simulatedAuthState.tokenExpiry
    };
  } catch (error) {
    console.error('Sign-in error:', error);
    throw error;
  }
};

/**
 * Sign out from Microsoft
 * @returns {Promise<void>}
 */
export const signOutFromMicrosoft = async () => {
  try {
    console.log('Simulating Microsoft sign-out');
    
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Reset the simulated auth state
    simulatedAuthState = {
      isAuthenticated: false,
      accessToken: null,
      user: null,
      tokenExpiry: null
    };
    
    return;
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
};

/**
 * Get access token for Microsoft Graph API
 * @returns {Promise<string>} Access token
 */
export const getMicrosoftGraphToken = async () => {
  try {
    // Check if we have a valid token
    if (simulatedAuthState.isAuthenticated && simulatedAuthState.accessToken) {
      // Check if token is expired
      if (simulatedAuthState.tokenExpiry && new Date() < simulatedAuthState.tokenExpiry) {
        return simulatedAuthState.accessToken;
      }
    }
    
    // If no valid token, sign in
    console.log('No valid token found, signing in...');
    const authResult = await signInWithMicrosoft();
    return authResult.accessToken;
  } catch (error) {
    console.error('Error getting Microsoft Graph token:', error);
    throw error;
  }
};

/**
 * Check if user is signed in to Microsoft
 * @returns {boolean} True if signed in
 */
export const isSignedInToMicrosoft = () => {
  return simulatedAuthState.isAuthenticated;
};

/**
 * Alias for isSignedInToMicrosoft to match imports 
 */
export const isAuthenticated = isSignedInToMicrosoft;

/**
 * Get current Microsoft user information
 * @returns {Object|null} User information or null if not signed in
 */
export const getCurrentMicrosoftUser = () => {
  if (!simulatedAuthState.isAuthenticated) {
    return null;
  }
  
  return simulatedAuthState.user;
};

/**
 * Simulate Microsoft authentication for development
 * @returns {Promise<Object>} Simulated auth result
 */
export const simulateMicrosoftAuth = async () => {
  // This function is used for development/demo purposes when actual Microsoft credentials are not available
  console.warn('Using simulated Microsoft authentication for development');
  
  // Simulate a delay to mimic network request
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    accessToken: 'simulated-microsoft-access-token-for-development',
    account: {
      username: 'demo.user@example.com',
      name: 'Demo User',
      tenantId: 'demo-tenant-id',
      localAccountId: 'demo-local-account-id',
      environment: 'demo-environment'
    },
    scopes: graphScopes,
    expiresOn: new Date(Date.now() + 3600 * 1000)
  };
};

/**
 * Alias for signInWithMicrosoft to match imports
 */
export const login = signInWithMicrosoft;

/**
 * Get access token for external services
 * @returns {Promise<string>} Access token
 */
export const getAccessToken = getMicrosoftGraphToken;

// Default export as a service object
const microsoftAuthService = {
  initialize: initializeMicrosoftAuth,
  signIn: signInWithMicrosoft,
  signOut: signOutFromMicrosoft,
  getGraphToken: getMicrosoftGraphToken,
  isSignedIn: isSignedInToMicrosoft,
  getCurrentUser: getCurrentMicrosoftUser,
  simulateAuth: simulateMicrosoftAuth
};

export default microsoftAuthService;