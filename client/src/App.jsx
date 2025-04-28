// /client/src/App.jsx

import React from 'react';
import { Route, Switch } from 'wouter';

// Import your Pages
import ClientPortalLanding from './pages/ClientPortalLanding';

// Import your Modules (Module Home Pages) - we'll create placeholders
const IndWizard = () => <div>IND Wizard Module Coming Soon</div>;
const CerGenerator = () => <div>CER Generator Module Coming Soon</div>;
const CmcWizard = () => <div>CMC Wizard Module Coming Soon</div>;
const CsrAnalyzer = () => <div>CSR Analyzer Module Coming Soon</div>;
const Vault = () => <div>Vault Module Coming Soon</div>;
const StudyArchitect = () => <div>Study Architect Module Coming Soon</div>;
const AnalyticsDashboard = () => <div>Analytics Dashboard Module Coming Soon</div>;

// You can add any other pages/modules you have here

const App = () => {
  return (
    <div className="min-h-screen">
      <Switch>
        {/* Main Portal Landing Page */}
        <Route path="/client-portal">
          <ClientPortalLanding />
        </Route>

        {/* Module Pages */}
        <Route path="/ind-wizard">
          <IndWizard />
        </Route>
        <Route path="/cer-generator">
          <CerGenerator />
        </Route>
        <Route path="/cmc-wizard">
          <CmcWizard />
        </Route>
        <Route path="/csr-analyzer">
          <CsrAnalyzer />
        </Route>
        <Route path="/vault">
          <Vault />
        </Route>
        <Route path="/study-architect">
          <StudyArchitect />
        </Route>
        <Route path="/analytics">
          <AnalyticsDashboard />
        </Route>

        {/* Fallback Route */}
        <Route path="*">
          <ClientPortalLanding />
        </Route>
      </Switch>
    </div>
  );
};

export default App;