/**
 * Google Authentication Service
 * 
 * This service provides methods for authenticating with Google
 */

// Mock user state 
let currentUser = null;

/**
 * Check if the user is authenticated with Google
 */
export function isGoogleAuthenticated() {
  return !!currentUser;
}

/**
 * Get the current user
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Sign in with Google
 * 
 * In a real implementation, this would use the Google OAuth flow
 */
export async function signInWithGoogle() {
  console.log('Signing in with Google');
  
  // Mock successful authentication
  currentUser = {
    id: 'google-user-' + Math.random().toString(36).substring(2, 10),
    name: 'John Doe',
    email: 'johndoe@example.com',
    picture: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff',
    accessToken: 'ya29.mock-token-' + Math.random().toString(36).substring(2, 10),
    authenticated: true
  };
  
  return currentUser;
}

/**
 * Sign out from Google
 */
export async function signOutFromGoogle() {
  console.log('Signing out from Google');
  
  // Clear the current user
  currentUser = null;
  
  return { success: true };
}