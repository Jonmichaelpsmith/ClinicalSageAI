// /client/src/App.jsx

import { QueryClientProvider } from '@tanstack/react-query';
import { Switch, Route, useLocation } from 'wouter';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import queryClient from './lib/queryClient';
import { TenantProvider } from './contexts/TenantContext';

// Import stability utilities
import freezeDetection from '@/utils/freezeDetection';
import networkResilience from '@/utils/networkResilience';
import memoryManagement from '@/utils/memoryManagement';
import StabilityEnabledLayout from '@/components/layout/StabilityEnabledLayout';
import { initializeMemoryOptimization } from './utils/memoryOptimizer';

// Core navigation component (loaded immediately)
import UnifiedTopNavV3 from './components/navigation/UnifiedTopNavV3';

// Loading component for lazy-loaded routes
const LoadingPage = () => (
  <div className="flex flex-col items-center justify-center p-8 h-screen">
    <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
    <p className="text-gray-600">Loading...</p>
  </div>
);

// Eagerly load the landing page for faster initial render
import ClientPortalLanding from './pages/ClientPortalLanding';

// Lazy load all other pages grouped by related functionality
// CER-related pages
const CERPage = lazy(() => import('./pages/CerPage'));
const CERV2Page = lazy(() => import('./pages/CERV2Page'));
const CerGeneratorLandingPage = lazy(() => import('./pages/CerGeneratorLandingPage'));
const CerGenerator = lazy(() => import('./modules/CerGenerator'));

// CMC-related pages
const CmcWizard = lazy(() => import('./modules/CmcWizard'));
const CMCPage = lazy(() => import('./pages/CMCPage'));

// CSR-related pages
const CsrAnalyzer = lazy(() => import('./modules/CsrAnalyzer'));
const CSRPage = lazy(() => import('./pages/CSRPage'));
const CSRLibraryPage = lazy(() => import('./pages/CSRLibraryPage'));

// Vault-related pages
const Vault = lazy(() => import('./modules/Vault'));
const VaultPage = lazy(() => import('./pages/VaultPage'));
const VaultTestPage = lazy(() => import('./pages/VaultTestPage'));
const VaultDocumentViewer = lazy(() => import('./components/vault/VaultDocumentViewer'));

// CoAuthor and Canvas-related pages
const CoAuthor = lazy(() => import('./pages/CoAuthor'));
const CanvasPage = lazy(() => import('./pages/CanvasPage'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));
const ModuleSectionEditor = lazy(() => import('./components/ModuleSectionEditor'));

// Regulatory-related pages
const RegulatoryRiskDashboard = lazy(() => import('./pages/RegulatoryRiskDashboard'));
const EnhancedRegulatoryDashboard = lazy(() => import('./pages/EnhancedRegulatoryDashboard'));
const RegulatoryDashboard = lazy(() => import('./pages/RegulatoryDashboard'));
const RegulatoryIntelligenceHub = lazy(() => import('./pages/RegulatoryIntelligenceHub'));
const RegulatorySubmissionsPage = lazy(() => import('./pages/RegulatorySubmissionsPage'));

// IND Wizard-related pages
const IndWizard = lazy(() => import('./pages/INDWizardFixed'));
const INDFullSolution = lazy(() => import('./pages/INDFullSolution'));
const Module1AdminPage = lazy(() => import('./modules/Module1AdminPage'));
const Module2SummaryPage = lazy(() => import('./modules/Module2SummaryPage'));
const Module3QualityPage = lazy(() => import('./modules/Module3QualityPage'));
const Module4NonclinicalPage = lazy(() => import('./modules/Module4NonclinicalPage'));
const Module5ClinicalPage = lazy(() => import('./modules/Module5ClinicalPage'));

// Study and Protocol-related pages
const StudyArchitect = lazy(() => import('./modules/StudyArchitect'));
const StudyArchitectPage = lazy(() => import('./pages/StudyArchitectPage'));
const ProtocolDesignerPage = lazy(() => import('./pages/ProtocolDesignerPage'));

// Analytics and Dashboard pages
const AnalyticsDashboard = lazy(() => import('./modules/AnalyticsDashboard'));
const ModuleDashboard = lazy(() => import('./pages/ModuleDashboard'));

// Other utility pages
const ContextDemoPage = lazy(() => import('./pages/ContextDemoPage'));
const BlueprintPage = lazy(() => import('./pages/BlueprintPage'));
const CitationManagerPage = lazy(() => import('./pages/CitationManagerPage'));
const AuditPage = lazy(() => import('./pages/AuditPage'));
const SignaturePage = lazy(() => import('./pages/SignaturePage'));

// Analytical and Stability modules
const AnalyticalMethodsStubPage = lazy(() => import('./pages/AnalyticalMethodsStubPage'));
const ComparabilityStudiesStubPage = lazy(() => import('./pages/ComparabilityStudiesStubPage'));
const StabilityStudiesStubPage = lazy(() => import('./pages/StabilityStudiesStubPage'));
const ShelfLifePredictorStubPage = lazy(() => import('./pages/ShelfLifePredictorStubPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));

// Tenant Management, Client Management and Settings Pages
const TenantManagement = lazy(() => import('./pages/TenantManagement'));
const ClientManagement = lazy(() => import('./pages/ClientManagement'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  // Default tab for the UnifiedTopNavV3 component
  const [activeTab, setActiveTab] = useState('RiskHeatmap');

  // Get current location to determine when to show the unified nav
  const [location] = useLocation();

  // Initialize stability measures
  useEffect(() => {
    console.log('🛡️ Initializing application stability measures...');

    // Initialize freeze detection
    freezeDetection.initFreezeDetection();

    // Initialize network resilience
    networkResilience.initNetworkResilience();

    // Initialize memory management
    memoryManagement.setupMemoryMonitoring();

    // Make utilities available globally for emergency debugging
    window.stabilityUtils = {
      freezeDetection,
      networkResilience,
      memoryManagement
    };

    console.log('✅ Application stability measures initialized');

    // Clean up on unmount (though App should never unmount in normal operation)
    return () => {
      freezeDetection.cleanupFreezeDetection();
      networkResilience.cleanupNetworkResilience();
    };
  }, []);

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
      <TenantProvider>
        {/* Wrap the entire application in the StabilityEnabledLayout */}
        <StabilityEnabledLayout>
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
          <Route path="/client-portal/client-management">
            {() => (
              <Suspense fallback={<LoadingPage />}>
                <ClientManagement />
              </Suspense>
            )}
          </Route>

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
          <Route path="/regulatory-submissions" component={RegulatorySubmissionsPage} />
          <Route path="/client-portal/regulatory-submissions" component={RegulatorySubmissionsPage} />

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

          {/* Tenant Management Route */}
          <Route path="/tenant-management">
            {() => (
              <Suspense fallback={<LoadingPage />}>
                <TenantManagement />
              </Suspense>
            )}
          </Route>

          {/* Client Management & Settings Routes */}
          <Route path="/client-management">
            {() => (
              <Suspense fallback={<LoadingPage />}>
                <ClientManagement />
              </Suspense>
            )}
          </Route>
          <Route path="/settings">
            {() => (
              <Suspense fallback={<LoadingPage />}>
                <Settings />
              </Suspense>
            )}
          </Route>

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
        </StabilityEnabledLayout>
      </TenantProvider>
    </QueryClientProvider>
  );
}

export default App;