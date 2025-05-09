import React from 'react';
import { Route, useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  path: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  path,
  ...rest
}) => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <Route
      path={path}
      {...rest}
      component={(props: any) => {
        // If still loading, show a loading indicator
        if (isLoading) {
          return (
            <div className="flex items-center justify-center h-screen">
              <div className="text-primary">Loading...</div>
            </div>
          );
        }

        // If not authenticated, redirect to login
        if (!user) {
          // Use a side effect to redirect
          React.useEffect(() => {
            setLocation('/auth');
          }, [setLocation]);

          // Return null to avoid flickering
          return null;
        }

        // If authenticated, render the component
        return <Component {...props} />;
      }}
    />
  );
};