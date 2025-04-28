// /client/src/App.jsx

import { Switch, Route } from 'wouter';

// Import Pages and Modules
import ClientPortalLanding from './pages/ClientPortalLanding';
import INDWizardAdvanced from './pages/INDWizardAdvanced';
import CerGenerator from './modules/CerGenerator';
import CmcWizard from './modules/CmcWizard';
import CsrAnalyzer from './modules/CsrAnalyzer';
import Vault from './modules/Vault';
import StudyArchitect from './modules/StudyArchitect';
import AnalyticsDashboard from './modules/AnalyticsDashboard';

// IND Wizard step components
import IndWizardLayout from './components/ind-wizard/IndWizardLayout';

function App() {
  return (
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
        <Route path="/study-architect" component={StudyArchitect} />
        <Route path="/analytics" component={AnalyticsDashboard} />

        {/* Default Redirect */}
        <Route>404 - Page Not Found</Route>
      </Switch>
    </div>
  );
};

export default App;