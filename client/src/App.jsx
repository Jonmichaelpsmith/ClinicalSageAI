// /client/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your Pages
import ClientPortalLanding from './pages/ClientPortalLanding';

// Import your Modules (Module Home Pages)
import IndWizard from './modules/IndWizard';
import CerGenerator from './modules/CerGenerator';
import CmcWizard from './modules/CmcWizard';
import CsrAnalyzer from './modules/CsrAnalyzer';
import Vault from './modules/Vault';
import StudyArchitect from './modules/StudyArchitect';
import AnalyticsDashboard from './modules/AnalyticsDashboard';

// You can add any other pages/modules you have here

const App = () => {
  return (
    <Router>
      <Routes>

        {/* Main Portal Landing Page */}
        <Route path="/client-portal" element={<ClientPortalLanding />} />

        {/* Module Pages */}
        <Route path="/ind-wizard" element={<IndWizard />} />
        <Route path="/cer-generator" element={<CerGenerator />} />
        <Route path="/cmc-wizard" element={<CmcWizard />} />
        <Route path="/csr-analyzer" element={<CsrAnalyzer />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/study-architect" element={<StudyArchitect />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />

        {/* Fallback Route */}
        <Route path="*" element={<ClientPortalLanding />} />

      </Routes>
    </Router>
  );
};

export default App;