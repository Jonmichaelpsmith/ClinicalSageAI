/**
 * Main Application Component
 * 
 * This is the entry point for the TrialSage platform.
 */

import React from 'react';
import { Switch, Route, Redirect } from 'wouter';
import { ModuleIntegrationProvider } from './components/integration/ModuleIntegrationLayer';
import UnifiedPlatform from './components/UnifiedPlatform';

// Authentication pages
import AuthPage from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
  return (
    <ModuleIntegrationProvider>
      <div className="min-h-screen bg-white">
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <Route path="/" component={UnifiedPlatform} />
          <Route component={NotFoundPage} />
        </Switch>
      </div>
    </ModuleIntegrationProvider>
  );
};

export default App;