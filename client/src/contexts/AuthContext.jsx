import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, queryClient } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';

// Create auth context
const AuthContext = createContext();

// Custom hook to access auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await apiRequest('GET', '/api/user');
        const userData = await res.json();
        setUser(userData);
        setError(null);
      } catch (err) {
        setUser(null);
        if (err.message !== 'Unauthorized') {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login mutation
  const loginMutation = {
    mutate: async (credentials) => {
      setLoading(true);
      try {
        const res = await apiRequest('POST', '/api/login', credentials);
        const userData = await res.json();
        setUser(userData);
        queryClient.setQueryData(['/api/user'], userData);
        toast({
          title: 'Login successful',
          description: `Welcome back, ${userData.name || 'User'}!`,
        });
        return userData;
      } catch (err) {
        setError(err);
        toast({
          title: 'Login failed',
          description: err.message || 'Invalid credentials',
          variant: 'destructive',
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    isPending: loading,
    error,
  };

  // Register mutation
  const registerMutation = {
    mutate: async (userData) => {
      setLoading(true);
      try {
        const res = await apiRequest('POST', '/api/register', userData);
        const newUser = await res.json();
        setUser(newUser);
        queryClient.setQueryData(['/api/user'], newUser);
        toast({
          title: 'Registration successful',
          description: `Welcome, ${newUser.name || 'User'}!`,
        });
        return newUser;
      } catch (err) {
        setError(err);
        toast({
          title: 'Registration failed',
          description: err.message || 'Could not create account',
          variant: 'destructive',
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    isPending: loading,
    error,
  };

  // Logout mutation
  const logoutMutation = {
    mutate: async () => {
      try {
        await apiRequest('POST', '/api/logout');
        setUser(null);
        queryClient.setQueryData(['/api/user'], null);
        toast({
          title: 'Logged out',
          description: 'You have been successfully logged out',
        });
      } catch (err) {
        setError(err);
        toast({
          title: 'Logout failed',
          description: err.message,
          variant: 'destructive',
        });
        throw err;
      }
    },
    isPending: loading,
    error,
  };

  // Update user mutation
  const updateUserMutation = {
    mutate: async (userData) => {
      try {
        const res = await apiRequest('PATCH', '/api/user', userData);
        const updatedUser = await res.json();
        setUser(updatedUser);
        queryClient.setQueryData(['/api/user'], updatedUser);
        toast({
          title: 'Profile updated',
          description: 'Your profile has been successfully updated',
        });
        return updatedUser;
      } catch (err) {
        setError(err);
        toast({
          title: 'Update failed',
          description: err.message,
          variant: 'destructive',
        });
        throw err;
      }
    },
    isPending: loading,
    error,
  };

  // For testing/demo purposes - mock user
  // Would be removed in production
  const loginAsMock = (role = 'user') => {
    const mockUser = {
      id: '123',
      name: 'Demo User',
      email: 'demo@example.com',
      role: role,
    };
    setUser(mockUser);
    queryClient.setQueryData(['/api/user'], mockUser);
    toast({
      title: 'Demo Mode',
      description: `Logged in as demo ${role}`,
    });
  };

  const contextValue = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    loginMutation,
    registerMutation,
    logoutMutation,
    updateUserMutation,
    loginAsMock, // Remove in production
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthContext;