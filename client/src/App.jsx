/**
 * Main App Component
 * 
 * Entry point for the TrialSage platform.
 */

import React from 'react';
import { Route, Switch } from 'wouter';

// Integration Provider
import { IntegrationProvider } from './components/integration/ModuleIntegrationLayer';

// Pages
import AuthPage from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';

// Main Platform Component
import UnifiedPlatform from './components/UnifiedPlatform';

// Protected Route Component
const ProtectedRoute = ({ path, children }) => {
  return (
    <Route path={path}>
      {children}
    </Route>
  );
};

const App = () => {
  return (
    <IntegrationProvider>
      <div className="App min-h-screen bg-gray-50">
        <Switch>
          <Route path="/auth">
            <AuthPage />
          </Route>
          
          <ProtectedRoute path="/">
            <UnifiedPlatform />
          </ProtectedRoute>
          
          <Route path="/:rest*">
            <NotFoundPage />
          </Route>
        </Switch>
      </div>
    </IntegrationProvider>
  );
};

export default App;