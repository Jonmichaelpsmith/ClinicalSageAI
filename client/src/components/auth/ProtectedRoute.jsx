import React, { useEffect } from 'react';
import { Redirect, Route } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedRoute component that redirects unauthenticated users to the login page
 * But also provides a direct access option for demonstration purposes
 * 
 * @param {Object} props - Component props
 * @param {string} props.path - The route path
 * @param {React.ComponentType} props.component - The component to render if authenticated
 * @param {Array<string>} [props.requiredRoles] - Optional roles required to access this route
 * @returns {JSX.Element} - The protected route
 */
const ProtectedRoute = ({ path, component: Component, requiredRoles = [] }) => {
  const { isAuthenticated, loading, user, directAccess } = useAuth();

  // Disabled auto-login to require manual credentials
  // useEffect(() => {
  //   if (!isAuthenticated && !loading) {
  //     // Auto-login for demonstration
  //     directAccess('admin');
  //   }
  // }, [isAuthenticated, loading, directAccess]);

  // Show a loading state while checking authentication
  if (loading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
        </div>
      </Route>
    );
  }

  // Check role requirements if user is authenticated
  const hasRequiredRole = requiredRoles.length === 0 || 
    (user && requiredRoles.includes(user.role));

  // Render the component if authenticated, otherwise redirect to login
  return (
    <Route path={path}>
      {isAuthenticated ? (
        hasRequiredRole ? (
          <Component />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-700 text-center mb-6">
              You don't have the required permissions to access this page.
            </p>
            <button
              onClick={() => directAccess('admin')}
              className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
            >
              Get Admin Access
            </button>
          </div>
        )
      ) : (
        <Redirect to="/login" />
      )}
    </Route>
  );
};

export default ProtectedRoute;