import React from 'react';
import { useLocation, Route, Redirect } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page if not authenticated
    return <Redirect to="/login" />;
  }

  // Render the component if authenticated
  return <Route {...rest} component={Component} />;
};

export default ProtectedRoute;