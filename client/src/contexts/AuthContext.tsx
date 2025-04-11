import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        const storedUser = localStorage.getItem('trialsage_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would be a call to your auth API
      // const response = await apiRequest('POST', '/api/auth/login', { email, password });
      // const data = await response.json();
      
      // For development purposes, we'll simulate a successful login
      const mockUser = {
        id: '123',
        email,
        username: email.split('@')[0]
      };
      
      setUser(mockUser);
      localStorage.setItem('trialsage_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would be a call to your auth API
      // const response = await apiRequest('POST', '/api/auth/signup', { email, username, password });
      // const data = await response.json();
      
      // For development purposes, we'll simulate a successful signup
      const mockUser = {
        id: '123',
        email,
        username
      };
      
      setUser(mockUser);
      localStorage.setItem('trialsage_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be a call to your auth API
      // await apiRequest('POST', '/api/auth/logout');
      
      setUser(null);
      localStorage.removeItem('trialsage_user');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}