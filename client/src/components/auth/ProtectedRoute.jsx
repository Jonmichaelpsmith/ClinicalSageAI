import React from 'react';
import { Route, Redirect, useLocation } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';

// Protected route component that redirects to login if not authenticated
const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, isInitialized } = useAuth();
  const [, setLocation] = useLocation();

  // If auth is still initializing, show loading
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  // Render the actual route, redirecting to login if not authenticated
  return (
    <Route
      {...rest}
      render={(props) => {
        if (isAuthenticated) {
          return <Component {...props} />;
        } else {
          setLocation('/login');
          return null;
        }
      }}
    />
  );
};

export default ProtectedRoute;