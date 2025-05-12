/**
 * Google Auth Service
 * Handles authentication with Google APIs for document access
 */

import { GOOGLE_API_CONFIG } from '../config/googleConfig';

// Mock authentication state (in production would use actual Google Auth)
let authState = {
  isAuthenticated: false,
  user: null,
  token: null
};

/**
 * Initialize Google API client
 */
const initClient = async () => {
  console.log('Initializing Google API client...');
  // In production, this would initialize the actual Google API client
  return Promise.resolve();
};

/**
 * Sign in user with Google
 */
const signIn = async () => {
  // Simulate successful authentication
  authState = {
    isAuthenticated: true,
    user: {
      id: 'user_123',
      name: 'Test User',
      email: 'user@example.com',
      profilePicture: 'https://via.placeholder.com/40'
    },
    token: 'mock_token_' + Math.random().toString(36).substring(2, 15)
  };
  
  console.log('User signed in successfully');
  return authState;
};

/**
 * Sign out user
 */
const signOut = async () => {
  // Reset auth state
  authState = {
    isAuthenticated: false,
    user: null,
    token: null
  };
  
  console.log('User signed out successfully');
  return true;
};

/**
 * Check if user is authenticated
 */
const isAuthenticated = () => {
  return authState.isAuthenticated;
};

/**
 * Get current authenticated user
 */
const getCurrentUser = () => {
  return authState.user;
};

/**
 * Get auth token for API requests
 */
const getAuthToken = () => {
  return authState.token;
};

export default {
  initClient,
  signIn,
  signOut,
  isAuthenticated,
  getCurrentUser,
  getAuthToken
};