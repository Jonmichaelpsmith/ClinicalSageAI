import React, { useEffect } from "react";
import { Redirect, Route } from "wouter";
import { useAuth } from "../hooks/use-auth";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, loading, checkTokenValidity } = useAuth();

  useEffect(() => {
    // Verify token validity on mount
    if (isAuthenticated) {
      checkTokenValidity();
    }
  }, [isAuthenticated, checkTokenValidity]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to="/auth" />
        )
      }
    />
  );
};

export default ProtectedRoute;