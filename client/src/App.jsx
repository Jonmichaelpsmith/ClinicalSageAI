// /client/src/App.jsx

import { Switch, Route } from 'wouter';

// Import Pages and Modules
import ClientPortalLanding from './pages/ClientPortalLanding';
import IndWizard from './modules/IndWizard';
import CerGenerator from './modules/CerGenerator';
import CmcWizard from './modules/CmcWizard';
import CsrAnalyzer from './modules/CsrAnalyzer';
import Vault from './modules/Vault';
import StudyArchitect from './modules/StudyArchitect';
import AnalyticsDashboard from './modules/AnalyticsDashboard';

function App() {
  return (
    <div className="p-4">
      <Switch>
        {/* Main Portal Landing Page */}
        <Route path="/client-portal" component={ClientPortalLanding} />

        {/* Module Pages */}
        <Route path="/ind-wizard" component={IndWizard} />
        <Route path="/cer-generator" component={CerGenerator} />
        <Route path="/cmc-wizard" component={CmcWizard} />
        <Route path="/csr-analyzer" component={CsrAnalyzer} />
        <Route path="/vault" component={Vault} />
        <Route path="/study-architect" component={StudyArchitect} />
        <Route path="/analytics" component={AnalyticsDashboard} />

        {/* Default Redirect (Optional) */}
        <Route>404 - Page Not Found</Route>
      </Switch>
    </div>
  );
};

export default App;