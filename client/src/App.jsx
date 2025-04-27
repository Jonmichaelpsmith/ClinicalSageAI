import React, { useState, useEffect } from 'react';
import { Route, Switch, useLocation, Redirect } from 'wouter';
import { ModuleIntegrationProvider } from './components/integration/ModuleIntegrationLayer';
import UnifiedPlatform from './components/UnifiedPlatform';
import Login from './components/auth/Login';

function App() {
  // Get location for navigation
  const [location, setLocation] = useLocation();
  
  // Automatically redirect to dashboard/client portal
  useEffect(() => {
    if (location === "/" || location === "/login" || location.startsWith("/portal")) {
      window.location.href = "/dashboard";
    }
  }, [location]);

  return (
    <ModuleIntegrationProvider>
      <div className="min-h-screen flex flex-col">
        <Switch>
          {/* All routes point to the UnifiedPlatform (client portal) */}
          <Route path="/" exact>
            <UnifiedPlatform />
          </Route>
          <Route path="/dashboard">
            <UnifiedPlatform />
          </Route>
          <Route path="/vault">
            <UnifiedPlatform />
          </Route>
          <Route path="/csr-intelligence">
            <UnifiedPlatform />
          </Route>
          <Route path="/study-architect">
            <UnifiedPlatform />
          </Route>
          <Route path="/ind-wizard">
            <UnifiedPlatform />
          </Route>
          
          {/* These routes will be caught by the redirect in useEffect */}
          <Route path="/login">
            <UnifiedPlatform />
          </Route>
          <Route path="/portal">
            <UnifiedPlatform />
          </Route>
          <Route path="/portal/ind">
            <UnifiedPlatform />
          </Route>
          
          {/* Catch all routes and redirect to dashboard */}
          <Route path="/:rest*">
            <UnifiedPlatform />
          </Route>
        </Switch>
      </div>
    </ModuleIntegrationProvider>
  );
}

export default App;