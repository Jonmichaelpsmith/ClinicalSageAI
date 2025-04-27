/**
 * Main App Component
 * 
 * This is the root component for the TrialSage platform.
 * It provides the integration layer and routing for the application.
 */

import React from 'react';
import { Route, Switch } from 'wouter';
import { ModuleIntegrationProvider } from './components/integration/ModuleIntegrationLayer';
import UnifiedPlatform from './components/UnifiedPlatform';

// Import CSS
import './index.css';

const App = () => {
  return (
    <ModuleIntegrationProvider>
      <Switch>
        <Route path="/" component={UnifiedPlatform} />
        {/* Add more routes as needed */}
      </Switch>
    </ModuleIntegrationProvider>
  );
};

export default App;