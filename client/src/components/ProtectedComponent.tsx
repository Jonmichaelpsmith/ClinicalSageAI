import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect, useLocation } from 'wouter';

interface ProtectedComponentProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * A component that only renders its children if the user is authenticated.
 * Otherwise, it redirects to the specified path or renders a fallback component.
 */
export function ProtectedComponent({
  children,
  redirectTo = '/auth',
  fallback = null
}: ProtectedComponentProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // If still loading authentication state, show nothing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If not authenticated and a redirect path is provided, redirect
  if (!user && redirectTo) {
    return <Redirect to={redirectTo} />;
  }

  // If not authenticated and a fallback is provided, show fallback
  if (!user && fallback) {
    return <>{fallback}</>;
  }

  // If authenticated, render children
  return <>{children}</>;
}

/**
 * Higher-order component that wraps a component with ProtectedComponent
 */
export function withProtection(Component: React.ComponentType, options: Omit<ProtectedComponentProps, 'children'> = {}) {
  return function ProtectedWrapper(props: any) {
    return (
      <ProtectedComponent {...options}>
        <Component {...props} />
      </ProtectedComponent>
    );
  };
}

/**
 * Component for showing content only for authenticated users without redirecting
 */
export function AuthOnly({ 
  children, 
  fallback = <p className="text-center p-4">🔒 Please login to access this content</p> 
}: Omit<ProtectedComponentProps, 'redirectTo'>) {
  const { user } = useAuth();
  
  if (!user) return <>{fallback}</>;
  
  return <>{children}</>;
}