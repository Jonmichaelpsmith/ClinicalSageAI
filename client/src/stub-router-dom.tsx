// Stub implementation of react-router-dom for compatibility
// This will be replaced when react-router-dom is properly installed

import React from 'react';

// Stub components
export const BrowserRouter = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const Routes = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const Route = ({ path, element }: { path: string, element: React.ReactNode }) => <>{element}</>;
export const Link = ({ to, children }: { to: string, children: React.ReactNode }) => 
  <a href={to}>{children}</a>;
export const Outlet = () => <div>Outlet placeholder</div>;
export const Navigate = ({ to }: { to: string }) => <div>Navigate to {to}</div>;

// Stub hooks
export const useNavigate = () => (path: string) => {
  console.warn(`[stub] useNavigate() called with path ${path} – replace when react-router-dom is installed`);
  window.location.href = path;
};

export const useLocation = () => ({ 
  pathname: window.location.pathname,
  search: window.location.search,
  hash: window.location.hash
});

export const useParams = () => ({});