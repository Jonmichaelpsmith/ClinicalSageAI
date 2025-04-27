import React, { useState } from 'react';
import { Route, Switch } from 'wouter';
import AppHeader from './components/common/AppHeader';
import AppSidebar from './components/common/AppSidebar';
import ClientContextBar from './components/common/ClientContextBar';
import UnifiedPlatform from './components/UnifiedPlatform';
import AIAssistantButton from './components/AIAssistantButton';
import DashboardModule from './components/dashboard/DashboardModule';
import TrialVaultModule from './components/trial-vault/TrialVaultModule';
import CSRIntelligenceModule from './components/csr-intelligence/CSRIntelligenceModule';
import StudyArchitectModule from './components/study-architect/StudyArchitectModule';
import NotFound from './components/common/NotFound';
import { ModuleIntegrationProvider } from './components/integration/ModuleIntegrationLayer';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ModuleIntegrationProvider>
      <div className="flex flex-col min-h-screen">
        <ClientContextBar />
        <AppHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex flex-1">
          <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-4 md:p-6">
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
        <AIAssistantButton />
      </div>
    </ModuleIntegrationProvider>
  );
}

export default App;