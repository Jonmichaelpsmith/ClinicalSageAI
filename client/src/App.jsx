// /client/src/App.jsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Switch, Route } from 'wouter';

// Import Pages and Modules
import ClientPortalLanding from './pages/ClientPortalLanding';
import INDWizardAdvanced from './pages/INDWizardAdvanced';
import CerGenerator from './modules/CerGenerator';
import CmcWizard from './modules/CmcWizard';
import CsrAnalyzer from './modules/CsrAnalyzer';
import Vault from './modules/Vault';
import VaultPage from './pages/VaultPage';
import VaultTestPage from './pages/VaultTestPage'; // Import the test page
import StudyArchitect from './modules/StudyArchitect';
import AnalyticsDashboard from './modules/AnalyticsDashboard';
import Module4NonclinicalPage from './modules/Module4NonclinicalPage';

// IND Wizard step components
import IndWizardLayout from './components/ind-wizard/IndWizardLayout';

// Create a QueryClient instance to use with React Query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-4">
        <Switch>
          {/* Main Portal Landing Page */}
          <Route path="/client-portal" component={ClientPortalLanding} />

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

          {/* Other Module Pages */}
          <Route path="/cer-generator" component={CerGenerator} />
          <Route path="/cmc-wizard" component={CmcWizard} />
          <Route path="/csr-analyzer" component={CsrAnalyzer} />
          <Route path="/vault" component={Vault} />
          <Route path="/vault-page" component={VaultPage} />
          <Route path="/vault-test" component={VaultTestPage} /> {/* Add route for test page */}
          <Route path="/study-architect" component={StudyArchitect} />
          <Route path="/analytics" component={AnalyticsDashboard} />
          
          {/* IND Wizard Module Pages */}
          <Route path="/ind-wizard/module-4" component={Module4NonclinicalPage} />

          {/* Default Redirect */}
          <Route>404 - Page Not Found</Route>
        </Switch>
      </div>
    </QueryClientProvider>
  );
};

export default App;