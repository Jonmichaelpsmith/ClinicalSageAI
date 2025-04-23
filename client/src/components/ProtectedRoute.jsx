import React, { useEffect, useState } from "react";
import { Redirect } from "wouter";

/**
 * ProtectedRoute component for guarding routes that require authentication
 * Checks for token in localStorage and redirects to login if not present
 */
export const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for authentication token
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;