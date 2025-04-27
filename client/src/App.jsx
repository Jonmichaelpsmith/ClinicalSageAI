import React from 'react';
import { Route, Switch } from 'wouter';
import { ModuleIntegrationProvider } from './components/integration/ModuleIntegrationLayer';
import AppHeader from './components/common/AppHeader';
import AppSidebar from './components/common/AppSidebar';
import ClientContextBar from './components/common/ClientContextBar';
import DashboardModule from './components/dashboard/DashboardModule';
import TrialVaultModule from './components/trial-vault/TrialVaultModule';
import CSRIntelligenceModule from './components/csr-intelligence/CSRIntelligenceModule';
import StudyArchitectModule from './components/study-architect/StudyArchitectModule';
import UnifiedPlatform from './components/UnifiedPlatform';
import NotFound from './components/common/NotFound';
import AIAssistantButton from './components/AIAssistantButton';

function App() {
  return (
    <ModuleIntegrationProvider>
      <div className="flex flex-col min-h-screen">
        {/* Header is consistent across all pages */}
        <AppHeader />
        <ClientContextBar />

        <div className="flex flex-1">
          {/* Sidebar for navigation between modules */}
          <AppSidebar />

          {/* Main content area */}
          <main className="flex-1 p-6 overflow-auto">
            <Switch>
              <Route path="/" component={UnifiedPlatform} />
              <Route path="/dashboard" component={DashboardModule} />
              <Route path="/vault" component={TrialVaultModule} />
              <Route path="/csr-intelligence" component={CSRIntelligenceModule} />
              <Route path="/study-architect" component={StudyArchitectModule} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>

        {/* AI Assistant button */}
        <AIAssistantButton />
      </div>
    </ModuleIntegrationProvider>
  );
}

export default App;