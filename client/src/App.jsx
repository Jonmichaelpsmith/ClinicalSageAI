/**
 * Main App Component
 * 
 * This is the root component of the TrialSage platform.
 */

import React from 'react';
import { Route, Switch } from 'wouter';
import { ModuleIntegrationProvider } from './components/integration/ModuleIntegrationLayer';

// Pages
import UnifiedPlatform from './components/UnifiedPlatform';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ModuleIntegrationProvider>
      <Switch>
        <Route path="/:rest*" component={UnifiedPlatform} />
        <Route component={NotFoundPage} />
      </Switch>
    </ModuleIntegrationProvider>
  );
}

export default App;