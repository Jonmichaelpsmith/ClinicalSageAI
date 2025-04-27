import React from 'react';
import { Route, Redirect, useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Protected Route Component
 * 
 * Wraps a Route to enforce authentication. If user is not authenticated,
 * they will be redirected to the login page.
 * 
 * @param {string} path - The route path
 * @param {React.ComponentType} component - Component to render if authenticated
 * @param {Array<string>} [requiredRoles] - Optional array of roles required to access the route
 */
const ProtectedRoute = ({ path, component: Component, requiredRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Check if user has required role (if specified)
  const hasRequiredRole = () => {
    if (requiredRoles.length === 0) return true;
    return user && requiredRoles.includes(user.role);
  };

  return (
    <Route path={path}>
      {() => {
        // Show loading state while authentication is being checked
        if (loading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
            </div>
          );
        }
        
        // If not authenticated, redirect to login
        if (!isAuthenticated) {
          // Save the current path to redirect back after login
          const returnTo = encodeURIComponent(path);
          setLocation(`/login?returnTo=${returnTo}`);
          return null;
        }
        
        // If roles are required but user doesn't have them, redirect to unauthorized
        if (!hasRequiredRole()) {
          return <Redirect to="/unauthorized" />;
        }
        
        // User is authenticated and has required role, render the component
        return <Component />;
      }}
    </Route>
  );
};

export default ProtectedRoute;