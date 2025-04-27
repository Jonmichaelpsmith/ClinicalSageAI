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
    // In a real app, this would check localStorage, session or cookies
    // For demo purposes, we're defaulting to not authenticated
    setIsAuthenticated(false);
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