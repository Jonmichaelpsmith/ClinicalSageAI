import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';

// Predefined demo users
const DEMO_USERS = {
  admin: {
    id: 1,
    username: 'admin',
    email: 'admin@trialsage.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  client: {
    id: 2,
    username: 'client',
    email: 'client@example.com',
    firstName: 'Client',
    lastName: 'User',
    role: 'client',
    createdAt: new Date().toISOString()
  }
};

// Create the Auth Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false); // Changed to false for immediate UI access
  const [error, setError] = useState(null);
  const { toast } = useToast();
  
  // Generate a mock token
  const generateMockToken = (userData) => {
    // This isn't a real JWT, just a placeholder
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      id: userData.id,
      username: userData.username,
      role: userData.role,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    }));
    const signature = btoa('mocksignature');
    
    return `${header}.${payload}.${signature}`;
  };
  
  // Direct access function - bypasses API calls completely
  const directAccess = (role = 'admin') => {
    setLoading(true);
    
    try {
      const userData = DEMO_USERS[role] || DEMO_USERS.admin;
      const mockToken = generateMockToken(userData);
      
      // Save to localStorage and state
      localStorage.setItem('token', mockToken);
      setToken(mockToken);
      setUser(userData);
      
      toast({
        title: 'Access Granted',
        description: `Welcome, ${userData.firstName}! You now have full access to TrialSage.`,
        variant: 'success'
      });
      
      return userData;
    } catch (err) {
      console.error('Error in direct access:', err);
      setError('Unable to grant access');
      
      toast({
        title: 'Access Error',
        description: 'Unable to grant platform access',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Login immediately with the stored token
  useEffect(() => {
    if (token) {
      // For demo purposes, we'll create a fake user from the token
      // In production, this would verify with the backend
      try {
        // If there's a token, let's auto-login with admin privileges
        directAccess('admin');
      } catch (error) {
        console.error('Auto-login failed:', error);
        localStorage.removeItem('token');
        setToken(null);
      }
    }
  }, []);

  // Login function - will bypass API calls and use direct access
  const login = async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      // For demo, we accept any credentials and grant admin access
      const role = username.toLowerCase().includes('admin') ? 'admin' : 'client';
      return directAccess(role);
    } catch (err) {
      setError(err.message || 'Login failed');
      toast({
        title: 'Login failed',
        description: err.message || 'An error occurred during login',
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mock login mutations for compatibility with existing code
  const loginMutation = {
    mutate: async (credentials) => {
      return await login(credentials.username, credentials.password);
    },
    isPending: loading
  };

  // Mock register mutations for compatibility with existing code
  const registerMutation = {
    mutate: async (userData) => {
      setLoading(true);
      try {
        // Always succeed and give admin access
        return directAccess('admin');
      } finally {
        setLoading(false);
      }
    },
    isPending: loading
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
      variant: 'default'
    });
  };

  // Direct access methods for different roles
  const loginAsMock = (role = 'admin') => {
    return directAccess(role);
  };
  
  // Specific method for client portal access
  const loginAsClient = () => {
    return directAccess('client');
  };

  // Value to be provided to consumers
  const value = {
    user,
    token,
    loading,
    error,
    login,
    loginMutation,
    registerMutation,
    logout,
    loginAsMock,
    loginAsClient,
    directAccess,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};