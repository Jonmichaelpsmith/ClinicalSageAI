// /client/src/App.jsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Switch, Route, useRoute, useLocation } from 'wouter';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// Import Pages and Modules
import ClientPortalLanding from './pages/ClientPortalLanding';
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
import ContextDemoPage from './pages/ContextDemoPage'; // Import our new context demo page
import CoAuthor from './pages/CoAuthor'; // Import our new CoAuthor page
import ModuleDashboard from './pages/ModuleDashboard'; // Import our Module Dashboard page
import CanvasPage from './pages/CanvasPage'; // Import our Canvas page
import TimelinePage from './pages/TimelinePage'; // Import our Timeline page
import ProtocolDesignerPage from './pages/ProtocolDesignerPage'; // Import Protocol Designer page
import CSRPage from './pages/CSRPage'; // Import CSR Deep Intelligence page
import CSRLibraryPage from './pages/CSRLibraryPage'; // Import CSR Library page
import CMCPage from './pages/CMCPage'; // Import CMC Module page
import CERPage from './pages/CerPage'; // Import CER Generator page
import CERV2Page from './pages/CERV2Page'; // Import Advanced CER Generator page
import CerGeneratorLandingPage from './pages/CerGeneratorLandingPage'; // Import CER Generator Landing page
import BlueprintPage from './pages/BlueprintPage'; // Import Blueprint Generator page
import CitationManagerPage from './pages/CitationManagerPage'; // Import Citation Manager page
import AuditPage from './pages/AuditPage'; // Import Audit Trail page
import SignaturePage from './pages/SignaturePage'; // Import Digital Signature page
import ModuleSectionEditor from './components/ModuleSectionEditor'; // Import ModuleSectionEditor for co-author page
import StudyArchitect from './modules/StudyArchitect';
import StudyArchitectPage from './pages/StudyArchitectPage'; // Import Study Architect page
import AnalyticsDashboard from './modules/AnalyticsDashboard';
// !!! CRITICAL: ONLY USE THE INDWIZARDFIXED IMPLEMENTATION - All other implementations have been deleted !!!
import IndWizard from './pages/INDWizardFixed'; // FINAL VERSION 5.0 - Only correct implementation of IND Wizard
import INDFullSolution from './pages/INDFullSolution'; // Import the IND Full Solution page
// Module page imports for IND Wizard
import Module1AdminPage from './modules/Module1AdminPage';
import Module2SummaryPage from './modules/Module2SummaryPage';
import Module3QualityPage from './modules/Module3QualityPage';
import Module4NonclinicalPage from './modules/Module4NonclinicalPage';
import Module5ClinicalPage from './modules/Module5ClinicalPage';
import VaultDocumentViewer from './components/vault/VaultDocumentViewer'; // Import VaultDocumentViewer

// Import new Analytical & Stability modules (Stub versions)
import AnalyticalMethodsStubPage from './pages/AnalyticalMethodsStubPage'; // Import Analytical Methods page
import ComparabilityStudiesStubPage from './pages/ComparabilityStudiesStubPage'; // Import Comparability Studies page
import StabilityStudiesStubPage from './pages/StabilityStudiesStubPage'; // Import Stability Studies page
import ShelfLifePredictorStubPage from './pages/ShelfLifePredictorStubPage'; // Import Shelf Life Predictor page
import ReportsPage from './pages/ReportsPage'; // Import comprehensive Reports page

// Import Global Navigation
import UnifiedTopNavV3 from './components/navigation/UnifiedTopNavV3';

// IND Wizard step components
// Advanced IND Wizard implementation is now used exclusively

// Create a QueryClient instance to use with React Query
const queryClient = new QueryClient();

function App() {
  // Default tab for the UnifiedTopNavV3 component
  const [activeTab, setActiveTab] = useState('RiskHeatmap');
  
  // Get current location to determine when to show the unified nav
  const [location] = useLocation();
  
  // Check if we're on the landing page, regulatory hub, coauthor pages, or dashboard (which have their own navigation)
  const isLandingPage = location === '/' || location === '/client-portal';
  const isRegulatoryHub = location === '/regulatory-intelligence-hub' || 
                          location === '/client-portal/regulatory-intel';
  const isCoAuthorPage = location === '/coauthor' || 
                         location.startsWith('/coauthor/') ||
                         location === '/canvas' ||
                         location === '/timeline';
  const isDashboardPage = location === '/dashboard';
                         
  const shouldShowNav = !isLandingPage && !isRegulatoryHub && !isCoAuthorPage && !isDashboardPage;
  
  return (
    <QueryClientProvider client={queryClient}>
      {/* Only show the UnifiedTopNavV3 if we're not on the landing page, regulatory hub, or dashboard */}
      {shouldShowNav && (
        <UnifiedTopNavV3 activeTab={activeTab} onTabChange={setActiveTab} />
      )}
      <div className={
        isLandingPage ? "p-4" : 
        isRegulatoryHub ? "p-0" : 
        isCoAuthorPage ? "p-0" : // No padding for CoAuthor pages
        isDashboardPage ? "p-0" : // No padding for Dashboard page
        "p-4 mt-24"
      }>
        <Switch>
          {/* Main Portal Landing Pages - both root and /client-portal go to same component */}
          <Route path="/" component={ClientPortalLanding} />
          <Route path="/client-portal" component={ClientPortalLanding} />
          
          {/* Client Portal Sub-Pages */}
          <Route path="/client-portal/vault" component={VaultPage} />
          <Route path="/client-portal/regulatory-intel" component={RegulatoryIntelligenceHub} />
          <Route path="/client-portal/cer-generator" component={CERV2Page} />
          <Route path="/client-portal/cmc-wizard" component={CmcWizard} />
          <Route path="/client-portal/csr-analyzer" component={CSRPage} />
          <Route path="/client-portal/study-architect" component={StudyArchitectPage} />
          <Route path="/client-portal/analytics" component={AnalyticsDashboard} />

          {/* Module Dashboard */}
          <Route path="/dashboard" component={ModuleDashboard} />

          {/* IND Wizard Routes - ALWAYS USE THE INDWIZARDFIXED (VERSION 5.0) IMPLEMENTATION */}
          <Route path="/ind-wizard" component={IndWizard} /> {/* Using fixed implementation */}
          <Route path="/ind-full-solution" component={INDFullSolution} />
          
          {/* Client Portal IND Wizard Route - ALWAYS USE THE INDWIZARDFIXED (VERSION 5.0) IMPLEMENTATION */}
          <Route path="/client-portal/ind-wizard" component={IndWizard} /> {/* Using fixed implementation */}

          {/* Other Module Pages */}
          <Route path="/cer-generator" component={CERPage} />
          <Route path="/cmc-wizard" component={CmcWizard} />
          <Route path="/csr-analyzer" component={CSRPage} />
          <Route path="/vault" component={VaultPage} /> {/* Use VaultPage which includes VaultDocumentViewer */}
          <Route path="/vault-page" component={VaultPage} />
          <Route path="/vault-test" component={VaultTestPage} /> {/* Add route for test page */}
          <Route path="/context-demo" component={ContextDemoPage} /> {/* Add our context demo page */}
          <Route path="/coauthor" component={CoAuthor} /> {/* Add our CoAuthor page */}
          <Route path="/coauthor/timeline" component={CoAuthor} /> {/* CoAuthor timeline tab */}
          <Route path="/coauthor/ask-lumen" component={CoAuthor} /> {/* CoAuthor Ask Lumen tab */}
          <Route path="/coauthor/canvas" component={CoAuthor} /> {/* CoAuthor Canvas Workbench tab */}
          <Route path="/canvas" component={CanvasPage} /> {/* Canvas page route */}
          <Route path="/timeline" component={TimelinePage} /> {/* Timeline page route */}
          <Route path="/protocol" component={ProtocolDesignerPage} /> {/* Protocol Designer page route */}
          <Route path="/csr" component={CSRPage} /> {/* CSR Deep Intelligence page route */}
          <Route path="/csr-library" component={CSRLibraryPage} /> {/* CSR Library page route */}
          <Route path="/cmc" component={CMCPage} /> {/* CMC Module page route */}
          <Route path="/cer" component={CERPage} /> {/* CER Generator page route */}
          <Route path="/cerV2" component={CERV2Page} /> {/* Advanced CER Generator page route */}
          <Route path="/cerv2" component={CERV2Page} /> {/* Additional lowercase route for Advanced CER Generator */}
          <Route path="/cerv2/info" component={CerGeneratorLandingPage} /> {/* CER Generator Landing page with detailed info */}
          <Route path="/blueprint" component={BlueprintPage} /> {/* Blueprint Generator page route */}
          <Route path="/citations" component={CitationManagerPage} /> {/* Citation Manager page route */}
          <Route path="/audit" component={AuditPage} /> {/* Audit Trail page route */}
          <Route path="/signature" component={SignaturePage} /> {/* Digital Signature page route */}
          <Route path="/study-architect" component={StudyArchitectPage} />
          <Route path="/analytics" component={AnalyticsDashboard} />
          <Route path="/regulatory-risk-dashboard" component={RegulatoryRiskDashboard} />
          <Route path="/regulatory-intelligence-hub" component={RegulatoryIntelligenceHub} />
          <Route path="/regulatory-dashboard" component={RegulatoryDashboard} />
          
          {/* IND Wizard Module Routes - ALWAYS USE THE INDWIZARDFIXED (VERSION 5.0) IMPLEMENTATION */}
          {/* These direct module routes help users navigate directly to specific IND modules */}
          <Route path="/module-1" component={IndWizard} /> {/* Using fixed implementation v5.0 */}
          <Route path="/module-2" component={IndWizard} /> {/* Using fixed implementation v5.0 */}
          <Route path="/module-3" component={IndWizard} /> {/* Using fixed implementation v5.0 */}
          <Route path="/module-4" component={IndWizard} /> {/* Using fixed implementation v5.0 */}
          <Route path="/module-5" component={IndWizard} /> {/* Using fixed implementation v5.0 */}
          <Route path="/ind-wizard/module-3" component={IndWizard} /> {/* Using fixed implementation v5.0 */}
          <Route path="/ind-wizard/module-4" component={IndWizard} /> {/* Using fixed implementation v5.0 */}
          
          {/* Analytical Control & Method Management Routes */}
          <Route path="/analytical" component={AnalyticalMethodsStubPage} />
          <Route path="/comparability" component={ComparabilityStudiesStubPage} />
          
          {/* Stability Study Management Routes */}
          <Route path="/stability" component={StabilityStudiesStubPage} />
          <Route path="/stability/shelf-life-predictor" component={ShelfLifePredictorStubPage} />
          
          {/* Reports Module Routes */}
          <Route path="/reports" component={ReportsPage} />
          <Route path="/cer-reports" component={ReportsPage} />
          <Route path="/cerv2/reports" component={ReportsPage} />

          {/* Error fallback and catch-all routes for specific modules */}
          <Route path="/cer-*">
            {() => (
              <div className="flex flex-col items-center justify-center p-8">
                <h2 className="text-2xl font-bold mb-4 text-indigo-700">Redirecting to CER Generator</h2>
                <p className="mb-4 text-gray-600">The URL you're trying to access is being redirected to the CER Generator module.</p>
                <Button 
                  onClick={() => window.location.href = '/cerv2'}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                >
                  Go to CER Generator
                </Button>
              </div>
            )}
          </Route>
          
          {/* CER Generator catch-all routes */}
          <Route path="/cer-generator/*">
            {() => <CERV2Page />}
          </Route>
          <Route path="/client-portal/cer-generator/*">
            {() => <CERV2Page />}
          </Route>
          <Route path="/cerv2/*">
            {() => <CERV2Page />}
          </Route>
          <Route path="/cerV2/*">
            {() => <CERV2Page />}
          </Route>
          
          {/* Default Redirect to Client Portal */}
          <Route>
            {() => {
              // Automatically redirect to client portal
              window.location.href = '/client-portal';
              return (
                <div className="flex flex-col items-center justify-center p-8">
                  <h2 className="text-xl font-medium mb-4">Redirecting to Client Portal...</h2>
                  <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              );
            }}
          </Route>
        </Switch>
      </div>
    </QueryClientProvider>
  );
};

export default App;