import React, { useState, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import NotFound from './components/common/NotFound';
import { ModuleIntegrationProvider } from './components/integration/ModuleIntegrationLayer';
import UnifiedPlatform from './components/UnifiedPlatform';
import LoginPage from './components/auth/LoginPage';

function App() {
  // Get location for navigation
  const [location, setLocation] = useLocation();

  return (
    <ModuleIntegrationProvider>
      <div className="min-h-screen flex flex-col">
        <Switch>
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
          
          <Route path="/login">
            <LoginPage />
          </Route>
          
          {/* 404 Route */}
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </div>
    </ModuleIntegrationProvider>
  );
}

export default App;