// /client/src/App.jsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Switch, Route, useRoute, useLocation } from 'wouter';
import { useState } from 'react';

// Import Pages and Modules
import ClientPortalLanding from './pages/ClientPortalLanding';
import INDWizardAdvanced from './pages/INDWizardAdvanced';
import RegulatoryRiskDashboard from './pages/RegulatoryRiskDashboard';
import EnhancedRegulatoryDashboard from './pages/EnhancedRegulatoryDashboard';
import RegulatoryDashboard from './pages/RegulatoryDashboard';
import RegulatoryIntelligenceHub from './pages/RegulatoryIntelligenceHub';
import CerGenerator from './modules/CerGenerator';
import CmcWizard from './modules/CmcWizard';
import CsrAnalyzer from './modules/CsrAnalyzer';
import Vault from './modules/Vault';
import VaultPage from './pages/VaultPage';
import VaultTestPage from './pages/VaultTestPage'; // Import the test page
import StudyArchitect from './modules/StudyArchitect';
import AnalyticsDashboard from './modules/AnalyticsDashboard';
import Module1AdminPage from './modules/Module1AdminPage';
import Module2SummaryPage from './modules/Module2SummaryPage';
import Module3QualityPage from './modules/Module3QualityPage';
import Module4NonclinicalPage from './modules/Module4NonclinicalPage';
import Module5ClinicalPage from './modules/Module5ClinicalPage';
import VaultDocumentViewer from './components/vault/VaultDocumentViewer'; // Import VaultDocumentViewer

// Import Global Navigation
import UnifiedTopNavV3 from './components/navigation/UnifiedTopNavV3';

// IND Wizard step components
import IndWizardLayout from './components/ind-wizard/IndWizardLayout';

// Create a QueryClient instance to use with React Query
const queryClient = new QueryClient();

function App() {
  // Default tab for the UnifiedTopNavV3 component
  const [activeTab, setActiveTab] = useState('RiskHeatmap');
  
  // Get current location to determine when to show the unified nav
  const [location] = useLocation();
  
  // Check if we're on the landing page or regulatory hub (which has its own navigation)
  const isLandingPage = location === '/' || location === '/client-portal';
  const isRegulatoryHub = location === '/regulatory-intelligence-hub' || 
                          location === '/client-portal/regulatory-intel';
  const shouldShowNav = !isLandingPage && !isRegulatoryHub;
  
  return (
    <QueryClientProvider client={queryClient}>
      {/* Only show the UnifiedTopNavV3 if we're not on the landing page or regulatory hub */}
      {shouldShowNav && (
        <UnifiedTopNavV3 activeTab={activeTab} onTabChange={setActiveTab} />
      )}
      <div className={isLandingPage ? "p-4" : (isRegulatoryHub ? "p-0" : "p-4 mt-24")}>
        <Switch>
          {/* Main Portal Landing Page */}
          <Route path="/client-portal" component={ClientPortalLanding} />
          
          {/* Client Portal Sub-Pages */}
          <Route path="/client-portal/vault" component={VaultPage} />
          <Route path="/client-portal/regulatory-intel" component={RegulatoryIntelligenceHub} />

          {/* Advanced IND Wizard - Main Entry Point */}
          <Route path="/ind-wizard" component={INDWizardAdvanced} />
          
          {/* IND Wizard Step Routes - For Individual Steps */}
          <Route path="/ind-wizard/:projectId">
            {(params) => (
              <IndWizardLayout projectId={params.projectId} />
            )}
          </Route>
          
          {/* Individual IND Wizard Steps */}
          <Route path="/ind/wizard/:step">
            {(params) => (
              <IndWizardLayout currentStep={params.step} />
            )}
          </Route>

          {/* Client Portal IND Wizard Route */}
          <Route path="/client-portal/ind-wizard">
            <IndWizardLayout />
          </Route>

          {/* Other Module Pages */}
          <Route path="/cer-generator" component={CerGenerator} />
          <Route path="/cmc-wizard" component={CmcWizard} />
          <Route path="/csr-analyzer" component={CsrAnalyzer} />
          <Route path="/vault" component={VaultDocumentViewer} /> {/* Updated to use VaultDocumentViewer directly */}
          <Route path="/vault-page" component={VaultPage} />
          <Route path="/vault-test" component={VaultTestPage} /> {/* Add route for test page */}
          <Route path="/study-architect" component={StudyArchitect} />
          <Route path="/analytics" component={AnalyticsDashboard} />
          <Route path="/regulatory-risk-dashboard" component={RegulatoryRiskDashboard} />
          <Route path="/regulatory-intelligence-hub" component={RegulatoryIntelligenceHub} />
          <Route path="/regulatory-dashboard" component={RegulatoryDashboard} />
          
          {/* IND Wizard Module Pages - Direct Access */}
          <Route path="/module-1">
            <Module1AdminPage />
          </Route>
          <Route path="/module-2">
            <Module2SummaryPage />
          </Route>
          <Route path="/module-3">
            <Module3QualityPage />
          </Route>
          <Route path="/module-4">
            <Module4NonclinicalPage />
          </Route>
          <Route path="/module-5">
            <Module5ClinicalPage />
          </Route>
          <Route path="/ind-wizard/module-3">
            <Module3QualityPage />
          </Route>
          <Route path="/ind-wizard/module-4" component={Module4NonclinicalPage} />

          {/* Default Redirect */}
          <Route>404 - Page Not Found</Route>
        </Switch>
      </div>
    </QueryClientProvider>
  );
};

export default App;