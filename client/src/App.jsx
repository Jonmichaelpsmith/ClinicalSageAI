import React, { useState, useEffect, lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Switch, Route, useLocation } from 'wouter';
import { Button } from '@/components/ui/button'; // Assuming this path is correct
import queryClient from './lib/queryClient'; // Assuming this path is correct
import { TenantProvider } from './contexts/TenantContext.tsx';
import { LumenAiAssistantProvider } from './contexts/LumenAiAssistantContext';
import { LumenAiAssistantContainer } from '@/components/ai/LumenAiAssistantContainer';

// Import stability utilities
import freezeDetection from '@/utils/freezeDetection';
import networkResilience from '@/utils/networkResilience';
import memoryManagement from '@/utils/memoryManagement';
import StabilityEnabledLayout from '@/components/layout/StabilityEnabledLayout';

// Core navigation component (loaded immediately)
import UnifiedTopNavV3 from './components/navigation/UnifiedTopNavV3';
import { ErrorBoundary } from './ErrorBoundary.jsx';
import { ModuleErrorBoundary } from './components/ui/error-boundary.jsx';

// Loading component for lazy-loaded routes
const LoadingPage = () => (
  <div className="flex flex-col items-center justify-center p-8 h-screen">
    <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
    <p className="text-gray-600">Loading...</p>
  </div>
);

// Eagerly load the landing pages for faster initial render
import ClientPortalLanding from './pages/ClientPortalLanding';
import HomeLanding from './pages/HomeLanding';

// Placeholder import for SubmissionBuilder - temporarily commented out
// const SubmissionBuilder = lazy(() => import('./modules/SubmissionBuilder')); 

// Lazy load all other pages grouped by related functionality
const CERPage = lazy(() => import('./pages/CerPage'));
const CERV2Page = lazy(() => import('./pages/CERV2Page'));
const CerGeneratorLandingPage = lazy(() => import('./pages/CerGeneratorLandingPage'));
const CerGenerator = lazy(() => import('./modules/CerGenerator')); // Unused? CERV2Page is primary
const CmcWizard = lazy(() => import('./modules/CmcWizard'));
const CMCPage = lazy(() => import('./pages/CMCPage'));
const CsrAnalyzer = lazy(() => import('./modules/CsrAnalyzer'));
const CSRPage = lazy(() => import('./pages/CSRPage'));
const CSRLibraryPage = lazy(() => import('./pages/CSRLibraryPage'));
const VaultPage = lazy(() => import('./pages/VaultPage'));
const VaultTestPage = lazy(() => import('./pages/VaultTestPage'));
const CoAuthor = lazy(() => import('./pages/CoAuthor'));
const CanvasPage = lazy(() => import('./pages/CanvasPage'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));
const ValidationDashboard = lazy(() => import('./pages/ValidationDashboard'));
const DocumentTemplates = lazy(() => import('./pages/DocumentTemplates'));
const ProjectManagerPage = lazy(() => import('./pages/ProjectManagerPage')); 
const ProjectManagerFullScreen = lazy(() => import('./pages/ProjectManagerFullScreen'));
const RegulatoryRiskDashboard = lazy(() => import('./pages/RegulatoryRiskDashboard'));
const RegulatoryDashboard = lazy(() => import('./pages/RegulatoryDashboard'));
const RegulatoryIntelligenceHub = lazy(() => import('./pages/RegulatoryIntelligenceHub'));
const RegulatoryAITestPage = lazy(() => import('./pages/RegulatoryAITestPage'));
const IndWizard = lazy(() => import('./pages/INDWizardFixed'));
const INDFullSolution = lazy(() => import('./pages/INDFullSolution'));
const Module1AdminPage = lazy(() => import('./modules/Module1AdminPage'));
const Module2SummaryPage = lazy(() => import('./modules/Module2SummaryPage'));
const Module3QualityPage = lazy(() => import('./modules/Module3QualityPage'));
const Module4NonclinicalPage = lazy(() => import('./modules/Module4NonclinicalPage'));
const Module5ClinicalPage = lazy(() => import('./modules/Module5ClinicalPage'));
const StudyArchitectPage = lazy(() => import('./pages/StudyArchitectPage'));
const ProtocolDesignerPage = lazy(() => import('./pages/ProtocolDesignerPage'));
const AnalyticsDashboard = lazy(() => import('./modules/AnalyticsDashboard'));
const ModuleDashboard = lazy(() => import('./pages/ModuleDashboard'));
const ContextDemoPage = lazy(() => import('./pages/ContextDemoPage'));
const BlueprintPage = lazy(() => import('./pages/BlueprintPage'));
const CitationManagerPage = lazy(() => import('./pages/CitationManagerPage'));
const AuditPage = lazy(() => import('./pages/AuditPage'));
const SignaturePage = lazy(() => import('./pages/SignaturePage'));
const SubmissionStorylineDemoPage = lazy(() => import('./pages/SubmissionStorylineDemoPage'));
const EnhancedDocumentTemplates = lazy(() => import('./pages/EnhancedDocumentTemplates'));
const CollaborativeTemplateWorkspace = lazy(() => import('./pages/CollaborativeTemplateWorkspace'));
const AnalyticalMethodsStubPage = lazy(() => import('./pages/AnalyticalMethodsStubPage'));
const ComparabilityStudiesStubPage = lazy(() => import('./pages/ComparabilityStudiesStubPage'));
const StabilityStudiesStubPage = lazy(() => import('./pages/StabilityStudiesStubPage'));
const ShelfLifePredictorStubPage = lazy(() => import('./pages/ShelfLifePredictorStubPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const TenantManagement = lazy(() => import('./pages/TenantManagement'));
const ClientManagement = lazy(() => import('./pages/ClientManagement'));
const Settings = lazy(() => import('./pages/Settings'));


function App() {
  const [activeTab, setActiveTab] = useState('RiskHeatmap');
  const [location] = useLocation();

  useEffect(() => {
    console.log('🛡️ Initializing application stability measures...');
    freezeDetection.initFreezeDetection();
    networkResilience.initNetworkResilience();
    memoryManagement.setupMemoryMonitoring();
    window.stabilityUtils = {
      freezeDetection,
      networkResilience,
      memoryManagement
    };
    console.log('✅ Application stability measures initialized');
    return () => {
      freezeDetection.cleanupFreezeDetection();
      networkResilience.cleanupNetworkResilience();
    };
  }, []);

  const isLandingPage = location === '/' || location === '/client-portal';
  const isRegulatoryHub = location === '/regulatory-intelligence-hub' ||
                          location === '/client-portal/regulatory-intel';
  const isCoAuthorPage = location === '/coauthor' ||
                         location.startsWith('/coauthor/') ||
                         location === '/canvas' ||
                         location === '/timeline';
  const isDashboardPage = location === '/dashboard';
  const isProjectManagerFullScreen = location === '/project-manager';
  const isCERV2Page = location === '/cerv2' || location.startsWith('/cerv2/');

  const shouldShowNav = isCERV2Page || (!isLandingPage && !isRegulatoryHub && !isCoAuthorPage && !isDashboardPage && !isProjectManagerFullScreen);

  return (
    <ModuleErrorBoundary>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <TenantProvider>
            <LumenAiAssistantProvider>
              <StabilityEnabledLayout>
              {shouldShowNav && (
                <UnifiedTopNavV3 activeTab={activeTab} onTabChange={setActiveTab} />
              )}
              <div className={
                isLandingPage ? "p-4" : 
                isRegulatoryHub ? "p-0" : 
                isCoAuthorPage ? "p-0" : 
                isDashboardPage ? "p-0" :
                isProjectManagerFullScreen ? "p-0" :
                "p-4 mt-24" 
              }>
              <Suspense fallback={<LoadingPage />}>
                <Switch>
                  {/* Main Landing Page */}
                  <Route path="/" component={HomeLanding} />
                  <Route path="/client-portal" component={ClientPortalLanding} />

                  {/* Client Portal Sub-Pages */}
                  <Route path="/client-portal/vault" component={VaultPage} />
                  <Route path="/client-portal/regulatory-intel" component={RegulatoryIntelligenceHub} />
                  <Route path="/client-portal/cer-generator" component={CERV2Page} />
                  <Route path="/client-portal/cmc-wizard" component={CmcWizard} />
                  <Route path="/client-portal/csr-analyzer" component={CSRPage} />
                  <Route path="/client-portal/study-architect" component={StudyArchitectPage} />
                  <Route path="/client-portal/analytics" component={AnalyticsDashboard} />
                  <Route path="/client-portal/510k">
                    {() => <CERV2Page initialDocumentType="510k" initialActiveTab="predicates" />}
                  </Route>
                  <Route path="/client-portal/510k-dashboard">
                    {() => <CERV2Page initialDocumentType="510k" initialActiveTab="predicates" />}
                  </Route>
                  <Route path="/client-portal/client-management" component={ClientManagement}/>
                  <Route path="/client-portal/templates" component={EnhancedDocumentTemplates} />
                  <Route path="/client-portal/ind-wizard" component={IndWizard} />

                  {/* Module Dashboard */}
                  <Route path="/dashboard" component={ModuleDashboard} />

                  {/* Full Screen Project Manager */}
                  <Route path="/project-manager" component={ProjectManagerFullScreen} />
                  
                  {/* IND Wizard Routes */}
                  <Route path="/ind-wizard" component={IndWizard} />
                  <Route path="/ind-full-solution" component={INDFullSolution} />
                  
                  {/* Other Module Pages */}
                  <Route path="/cer-generator" component={CERPage} /> {/* Consider if this should be CERV2Page */}
                  <Route path="/cmc-wizard" component={CmcWizard} />
                  <Route path="/csr-analyzer" component={CSRPage} />
                  <Route path="/vault" component={VaultPage} />
                  <Route path="/vault-page" component={VaultPage} />
                  <Route path="/vault-test" component={VaultTestPage} />
                  <Route path="/context-demo" component={ContextDemoPage} />
                  <Route path="/coauthor" component={CoAuthor} />
                  <Route path="/coauthor/timeline" component={CoAuthor} />
                  <Route path="/coauthor/ask-lumen" component={CoAuthor} />
                  <Route path="/coauthor/canvas" component={CoAuthor} />
                  <Route path="/coauthor/validation" component={ValidationDashboard} />
                  <Route path="/coauthor/templates" component={DocumentTemplates} />
                  <Route path="/templates" component={EnhancedDocumentTemplates} />
                  <Route path="/template-workspace" component={CollaborativeTemplateWorkspace} />
                  <Route path="/canvas" component={CanvasPage} />
                  <Route path="/timeline" component={TimelinePage} />
                  <Route path="/protocol" component={ProtocolDesignerPage} />
                  <Route path="/510k">
                    {() => <CERV2Page initialDocumentType="510k" initialActiveTab="predicates" />}
                  </Route>
                  <Route path="/510k-dashboard">
                    {() => <CERV2Page initialDocumentType="510k" initialActiveTab="predicates" />}
                  </Route>
                  <Route path="/csr" component={CSRPage} />
                  <Route path="/csr-library" component={CSRLibraryPage} />
                  <Route path="/cmc" component={CMCPage} />
                  <Route path="/cer" component={CERPage} /> {/* Consider if this should be CERV2Page */}
                  <Route path="/cerV2" component={CERV2Page} />
                  <Route path="/cerv2" component={CERV2Page} />
                  <Route path="/cerv2/info" component={CerGeneratorLandingPage} />
                  <Route path="/blueprint" component={BlueprintPage} />
                  <Route path="/citations" component={CitationManagerPage} />
                  <Route path="/audit" component={AuditPage} />
                  <Route path="/signature" component={SignaturePage} />
                  <Route path="/study-architect" component={StudyArchitectPage} />
                  <Route path="/analytics" component={AnalyticsDashboard} />
                  <Route path="/submission-storyline" component={SubmissionStorylineDemoPage} />
                  
                  {/* These direct module routes help users navigate directly to specific CTD modules */}
                  {/* Note: These routes use SubmissionBuilder which needs to be correctly imported */}
                  <Route path="/module-1" component={Module1AdminPage} /> {/* Kept original module pages, SubmissionBuilder routes below */}
                  <Route path="/module-2" component={Module2SummaryPage} />
                  <Route path="/module-3" component={Module3QualityPage} />
                  <Route path="/module-4" component={Module4NonclinicalPage} />
                  <Route path="/module-5" component={Module5ClinicalPage} />
                  
                  <Route path="/ind-wizard/module-3" component={Module3QualityPage} />
                  <Route path="/ind-wizard/module-4" component={Module4NonclinicalPage} />

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
                  <Route path="/tenant-management" component={TenantManagement} />

                  {/* Client Management & Settings Routes */}
                  <Route path="/client-management" component={ClientManagement} />
                  <Route path="/settings" component={Settings} />

                  {/* Unified Submission Builder routes - temporarily disabled */}
                  {/* These routes will be enabled once SubmissionBuilder module is available */}
                  <Route path="/ectd-planner">
                    {() => <div className="p-8"><h2 className="text-2xl font-bold mb-4">eCTD Planner</h2><p>SubmissionBuilder module is currently unavailable.</p></div>}
                  </Route>
                  <Route path="/module-1-sb">
                    {() => <div className="p-8"><h2 className="text-2xl font-bold mb-4">Module 1</h2><p>SubmissionBuilder module is currently unavailable.</p></div>}
                  </Route>
                  <Route path="/module-2-sb">
                    {() => <div className="p-8"><h2 className="text-2xl font-bold mb-4">Module 2</h2><p>SubmissionBuilder module is currently unavailable.</p></div>}
                  </Route>
                  <Route path="/module-3-sb">
                    {() => <div className="p-8"><h2 className="text-2xl font-bold mb-4">Module 3</h2><p>SubmissionBuilder module is currently unavailable.</p></div>}
                  </Route>
                  <Route path="/module-4-sb">
                    {() => <div className="p-8"><h2 className="text-2xl font-bold mb-4">Module 4</h2><p>SubmissionBuilder module is currently unavailable.</p></div>}
                  </Route>
                  <Route path="/module-5-sb">
                    {() => <div className="p-8"><h2 className="text-2xl font-bold mb-4">Module 5</h2><p>SubmissionBuilder module is currently unavailable.</p></div>}
                  </Route>
                  <Route path="/ectd-module">
                    {() => <div className="p-8"><h2 className="text-2xl font-bold mb-4">eCTD Module</h2><p>SubmissionBuilder module is currently unavailable.</p></div>}
                  </Route>

                  {/* Error fallback and catch-all routes for specific modules */}
                  <Route path="/cer-*">
                    {() => (
                      <div className="p-8">
                        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
                        <p>The CER page you are looking for doesn't exist. Perhaps you should go to our main CER page.</p>
                        <div className="mt-4">
                          <Button variant="default" asChild>
                            <a href="/cerv2">Go to CER Dashboard</a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </Route>
                  
                  <Route>
                    {() => (
                      <div className="p-8">
                        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
                        <p>The page you are looking for doesn't exist or has been moved.</p>
                        <div className="mt-4">
                          <Button variant="default" asChild>
                            <a href="/">Go Home</a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </Route>
                </Switch>
              </Suspense>
              </div>
              <LumenAiAssistantContainer />
              </StabilityEnabledLayout>
            </LumenAiAssistantProvider>
          </TenantProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </ModuleErrorBoundary>
  );
}

export default App;