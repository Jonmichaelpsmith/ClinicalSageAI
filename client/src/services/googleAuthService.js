/**
 * Google Authentication Service
 * 
 * A simple service to handle Google authentication for document editing.
 * This implementation uses a basic approach without requiring complex API integration.
 */

// Simple function to check if user is authenticated
// For real implementation, this would check a valid Google OAuth token
export function isAuthenticated() {
  // For demo purposes, always return true
  // In a real implementation, check for valid Google tokens
  return true;
}

// Simple function to get a mock access token
// For real implementation, this would return a valid Google OAuth token
export async function getAccessToken() {
  // For demo purposes, return a fake token
  // In a real implementation, get actual Google token
  return "demo_google_access_token";
}

// Function to trigger Google login
export function login() {
  // For demo purposes, just show an alert
  // In a real implementation, redirect to Google OAuth
  alert("In a real implementation, this would redirect to Google login");
  
  // Simulate successful login
  localStorage.setItem('google_auth_demo', 'true');
  
  return true;
}

// Function to handle logout
export function logout() {
  localStorage.removeItem('google_auth_demo');
}

// Function to initialize Google auth
export async function initializeAuth() {
  // For demo purposes, just return true
  // In a real implementation, initialize Google auth client
  return true;
}

// Function to get current user info
export async function getCurrentUser() {
  // For demo purposes, return a mock user
  return {
    name: "Demo User",
    email: "demo@example.com",
    picture: "https://via.placeholder.com/50"
  };
}