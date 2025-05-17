// /client/src/App.jsx
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

// Placeholder import for SubmissionBuilder - REPLACE WITH ACTUAL PATH
const SubmissionBuilder = lazy(() => import('./modules/SubmissionBuilder')); 

// Lazy load all other pages grouped by related functionality
const CERPage = lazy(() => import('./pages/CerPage'));
const CERV2Page = lazy(() => import('./pages/CERV2Page'));
const CerGeneratorLandingPage = lazy(() => import('./pages/CerGeneratorLandingPage'));
const CerGenerator = lazy(() => import('./modules/CerGenerator'));
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
const ProjectManagerPage = lazy(() => import('./pages/ProjectManagerPage')); // Retained for potential use, though /project-manager now points to FullScreen
const ProjectManagerFullScreen = lazy(() => import('./pages/ProjectManagerFullScreen')); // Added this new component
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
  const isProjectManagerFullScreen = location === '/project-manager'; // Added check for full screen project manager
  const isCERV2Page = location === '/cerv2' || location.startsWith('/cerv2/');

  // Show nav if it's CERV2Page OR if none of the other specific no-nav conditions are met
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
                isProjectManagerFullScreen ? "p-0" : // No padding for full screen project manager
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
                  <Route path="/cer-generator" component={CERPage} />
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
                  <Route path="/cer" component={CERPage} />
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
                  <Route path="/regulatory-risk-dashboard" component={RegulatoryRiskDashboard} />
                  <Route path="/regulatory-intelligence-hub" component={RegulatoryIntelligenceHub} />
                  <Route path="/regulatory-dashboard" component={RegulatoryDashboard} />
                  <Route path="/regulatory-ai-test" component={RegulatoryAITestPage} />

                  {/* Direct Module Routes (IND) */}
                  <Route path="/module-1" component={Module1AdminPage} />
                  <Route path="/module-2" component={Module2SummaryPage} />
                  <Route path="/module-3" component={Module3QualityPage} />
                  <Route path="/module-4" component={Module4NonclinicalPage} />
                  <Route path="/module-5" component={Module5ClinicalPage} />
                  <Route path="/ind-wizard/module-3" component={Module3QualityPage} />
                  <Route path="/ind-wizard/module-4" component={Module4NonclinicalPage} />

                  {/* Analytical, Stability, Reports */}
                  <Route path="/analytical" component={AnalyticalMethodsStubPage} />
                  <Route path="/comparability" component={ComparabilityStudiesStubPage} />
                  <Route path="/stability" component={StabilityStudiesStubPage} />
                  <Route path="/stability/shelf-life-predictor" component={ShelfLifePredictorStubPage} />
                  <Route path="/reports" component={ReportsPage} />
                  <Route path="/cer-reports" component={ReportsPage} />
                  <Route path="/cerv2/reports" component={ReportsPage} />

                  {/* Admin/Management Pages */}
                  <Route path="/tenant-management" component={TenantManagement} />
                  <Route path="/client-management" component={ClientManagement} />
                  <Route path="/settings" component={Settings} />

                  {/* Unified Submission Builder Routes */}
                  <Route path="/ectd-planner">
                    {() => <SubmissionBuilder initialModule="ectd" />}
                  </Route>
                  <Route path="/module-1-sb">
                    {() => <SubmissionBuilder initialModule="m1" />}
                  </Route>
                  <Route path="/module-2-sb">
                    {() => <SubmissionBuilder initialModule="m2" />}
                  </Route>
                  <Route path="/module-3-sb">
                    {() => <SubmissionBuilder initialModule="m3" />}
                  </Route>
                  <Route path="/module-4-sb">
                    {() => <SubmissionBuilder initialModule="m4" />}
                  </Route>
                  <Route path="/module-5-sb">
                    {() => <SubmissionBuilder initialModule="m5" />}
                  </Route>
                  <Route path="/ectd-module">
                    {() => <SubmissionBuilder />}
                  </Route>

                  {/* CER Fallback/Catch-all */}
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
                  <Route path="/cer-generator/*" component={CERV2Page} />
                  <Route path="/client-portal/cer-generator/*" component={CERV2Page} />
                  <Route path="/cerv2/*" component={CERV2Page} />
                  <Route path="/cerV2/*" component={CERV2Page} />

                  {/* Default Redirect */}
                  <Route>
                    {() => {
                      if (typeof window !== 'undefined') {
                        window.location.href = '/client-portal';
                      }
                      return (
                        <div className="flex flex-col items-center justify-center p-8 h-screen">
                          <h2 className="text-xl font-medium mb-4">Redirecting to Client Portal...</h2>
                          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                        </div>
                      );
                    }}
                  </Route>
                </Switch>
              </Suspense>
              </div>
              </StabilityEnabledLayout>
              <LumenAiAssistantContainer />
            </LumenAiAssistantProvider>
          </TenantProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </ModuleErrorBoundary>
  );
}

export default App;
