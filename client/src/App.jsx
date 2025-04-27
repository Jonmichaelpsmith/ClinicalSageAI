import React from 'react';
import { Route, Switch } from 'wouter';
import NotFound from './components/common/NotFound';
import { ModuleIntegrationProvider } from './components/integration/ModuleIntegrationLayer';
import UnifiedPlatform from './components/UnifiedPlatform';

function App() {
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