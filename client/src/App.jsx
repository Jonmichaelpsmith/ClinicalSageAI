import React, { useState, useEffect } from 'react';
import { Route, Switch, useLocation, Redirect } from 'wouter';
import { ModuleIntegrationProvider } from './components/integration/ModuleIntegrationLayer';
import UnifiedPlatform from './components/UnifiedPlatform';
import Login from './components/auth/Login';

function App() {
  // Get location for navigation
  const [location, setLocation] = useLocation();
  
  // Check if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check for authentication on mount
  useEffect(() => {
    // Check localStorage for authentication
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(isAuth);
    console.log('Authentication state:', isAuth);
    
    // Listen for storage changes (in case auth changes in another tab)
    const handleStorageChange = () => {
      const newAuthState = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(newAuthState);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <ModuleIntegrationProvider>
      <div className="min-h-screen flex flex-col">
        <Switch>
          {/* Login route */}
          <Route path="/login">
            <Login />
          </Route>
          
          {/* Authenticated routes */}
          <Route path="/dashboard">
            {isAuthenticated ? <UnifiedPlatform /> : <Redirect to="/login" />}
          </Route>
          <Route path="/vault">
            {isAuthenticated ? <UnifiedPlatform /> : <Redirect to="/login" />}
          </Route>
          <Route path="/csr-intelligence">
            {isAuthenticated ? <UnifiedPlatform /> : <Redirect to="/login" />}
          </Route>
          <Route path="/study-architect">
            {isAuthenticated ? <UnifiedPlatform /> : <Redirect to="/login" />}
          </Route>
          <Route path="/ind-wizard">
            {isAuthenticated ? <UnifiedPlatform /> : <Redirect to="/login" />}
          </Route>
          <Route path="/portal">
            {isAuthenticated ? <UnifiedPlatform /> : <Redirect to="/login" />}
          </Route>
          <Route path="/portal/ind">
            {isAuthenticated ? <UnifiedPlatform /> : <Redirect to="/login" />}
          </Route>
          
          {/* Additional module routes based on dashboard */}
          <Route path="/cer-developer">
            {isAuthenticated ? <UnifiedPlatform /> : <Redirect to="/login" />}
          </Route>
          <Route path="/protocol-optimizer">
            {isAuthenticated ? <UnifiedPlatform /> : <Redirect to="/login" />}
          </Route>
          <Route path="/ind-automation">
            {isAuthenticated ? <UnifiedPlatform /> : <Redirect to="/login" />}
          </Route>
          <Route path="/study-designer">
            {isAuthenticated ? <UnifiedPlatform /> : <Redirect to="/login" />}
          </Route>
          <Route path="/deep-learning">
            {isAuthenticated ? <UnifiedPlatform /> : <Redirect to="/login" />}
          </Route>
          <Route path="/analytics">
            {isAuthenticated ? <UnifiedPlatform /> : <Redirect to="/login" />}
          </Route>
          <Route path="/cer-generator">
            {isAuthenticated ? <UnifiedPlatform /> : <Redirect to="/login" />}
          </Route>
          <Route path="/cmc-wizard">
            {isAuthenticated ? <UnifiedPlatform /> : <Redirect to="/login" />}
          </Route>
          <Route path="/csr-analyzer">
            {isAuthenticated ? <UnifiedPlatform /> : <Redirect to="/login" />}
          </Route>
          
          {/* Client portal detail routes */}
          <Route path="/projects">
            {isAuthenticated ? <UnifiedPlatform /> : <Redirect to="/login" />}
          </Route>
          <Route path="/documents">
            {isAuthenticated ? <UnifiedPlatform /> : <Redirect to="/login" />}
          </Route>
          <Route path="/activity">
            {isAuthenticated ? <UnifiedPlatform /> : <Redirect to="/login" />}
          </Route>
          
          {/* Client Portal route - redirects to the main portal */}
          <Route path="/client-portal">
            {isAuthenticated ? <Redirect to="/portal" /> : <Redirect to="/login" />}
          </Route>
          
          {/* Default route */}
          <Route path="/" exact>
            <Redirect to="/login" />
          </Route>
          
          {/* Catch all routes and redirect to login */}
          <Route path="/:rest*">
            <Redirect to="/login" />
          </Route>
        </Switch>
      </div>
    </ModuleIntegrationProvider>
  );
}

export default App;