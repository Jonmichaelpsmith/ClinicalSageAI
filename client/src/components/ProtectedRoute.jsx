import React, { useEffect, useState } from 'react';
import { Redirect } from 'wouter';
import api from '../services/api';

/**
 * Protected Route Component
 * 
 * Wraps routes that require authentication.
 * Checks for presence of a valid token and redirects to login if none exists.
 * 
 * @param {React.Component} Component - The component to render if authenticated
 * @param {Object} rest - Other props to pass to the component
 */
const ProtectedRoute = ({ component: Component, ...rest }) => {
  const [isAuth, setIsAuth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a token
        const token = localStorage.getItem('jwt');
        if (!token) {
          setIsAuth(false);
          setIsLoading(false);
          return;
        }
        
        // Verify token with backend
        await api.get('/api/auth/verify');
        setIsAuth(true);
      } catch (error) {
        console.error('Auth verification failed', error);
        localStorage.removeItem('jwt'); // Clear invalid token
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuth) {
    return <Redirect to="/login" />;
  }

  return <Component {...rest} />;
};

export default ProtectedRoute;