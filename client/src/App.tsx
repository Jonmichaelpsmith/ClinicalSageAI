// App.tsx - Fixed version with simplified imports and no circular dependencies
import React, { useState } from 'react';
import { Route, Switch } from 'wouter';
import { ToastProvider } from './hooks/use-toast-context';
import { LumenAssistantProvider, LumenAssistant } from './components/assistant';

// Emergency fallback component to ensure something renders
const EmergencyFallback = ({ pageName }: { pageName: string }) => (
  <div className="p-8 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold mb-4">Loading {pageName}...</h1>
    <p className="mb-4">Please wait while the component loads.</p>
    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-blue-600 animate-pulse rounded-full"></div>
    </div>
  </div>
);

// Lazy load all components to prevent dependency issues
const LazyHomeMarketingPage = React.lazy(() => import('./pages/HomeMarketingPage'));
const LazySubmissionBuilder = React.lazy(() => import('./pages/SubmissionBuilder'));
const LazyCSRPage = React.lazy(() => import('./pages/csr'));
const LazyMetadataRepositoryPage = React.lazy(() => import('./pages/metadata'));
const LazyIndSequenceDetail = React.lazy(() => import('./pages/IndSequenceDetail'));
const LazyIndSequenceManager = React.lazy(() => import('./pages/IndSequenceManager'));
const LazyHomeLanding = React.lazy(() => import('./pages/HomeLanding'));
const LazyHomeLandingEnhanced = React.lazy(() => import('./pages/HomeLandingEnhanced'));
const LazyPersonaPages = React.lazy(() => import('./components/PersonaPages'));
const LazyGatedSalesInvestorAssets = React.lazy(() => import('./components/GatedSalesInvestorAssets'));
const LazyWalkthroughs = React.lazy(() => import('./pages/Walkthroughs'));
const LazyDebugInfo = React.lazy(() => import('./components/DebugInfo'));
// Force non-lazy loading of INDWizard to ensure it renders properly
import INDWizard from './pages/INDWizard';
const LazyINDWizard = INDWizard;
// Import IND Wizard 2.0 with modern UI components
import INDWizard2 from './pages/INDWizard2';
const LazyINDWizard2 = INDWizard2;
const LazyUseCaseLibrary = React.lazy(() => import('./pages/UseCaseLibrary'));
const LazyCERGenerator = React.lazy(() => import('./pages/EnterpriseGradeCERGenerator'));
const LazyCERGeneration = React.lazy(() => import('./pages/CERGeneration'));
// Add newly created CER Generator with streaming capabilities
const LazyStreamingCERGenerator = React.lazy(() => import('./pages/CERGenerator'));
// Add JP Validation Hub
const LazyValidationHub = React.lazy(() => import('./pages/ValidationHub'));
// Add Enhanced Validation Hub with Microsoft 365 UI
const LazyValidationHubEnhanced = React.lazy(() => import('./pages/ValidationHubEnhanced'));
// Add Adaptive Learning interface
const LazyAdaptiveLearning = React.lazy(() => import('./pages/AdaptiveLearning'));
// Add Document Risk Prediction with AI-powered insights
const LazyDocumentRiskPrediction = React.lazy(() => import('./pages/DocumentRiskPrediction'));
// Import our premium enterprise landing page that uses NO external dependencies
import PremiumEnterpriseLanding from './pages/PremiumEnterpriseLanding';
// Add Document Management with DocuShare integration
const LazyDocumentManagement = React.lazy(() => import('./pages/DocumentManagement'));
// Add Clinical Metadata Repository with AI-driven capabilities
const LazyClinicalMetadataRepository = React.lazy(() => import('./pages/ClinicalMetadataRepository'));
// Add Enterprise Document Vault with comprehensive showcase
const LazyEnterpriseDocumentVault = React.lazy(() => import('./pages/EnterpriseDocumentVault'));
// Add AI Chat Panel for document Q&A
const LazyChatPanel = React.lazy(() => import('./pages/ChatPanel'));
// Add Ask Lumen Chat interface
const LazyAskLumen = React.lazy(() => import('./pages/Chat'));
// Add Analytics Dashboard with Metabase integration
const LazyAnalyticsDashboard = React.lazy(() => import('./pages/AnalyticsDashboard'));
// Add Enterprise CSR Intelligence module
import EnterpriseCSRIntelligence from './pages/EnterpriseCSRIntelligence';
const LazyCSRIntelligence = EnterpriseCSRIntelligence;
// Add CMC Module with enhanced manufacturing controls capabilities
const LazyCMCModule = React.lazy(() => import('./pages/CMCModule'));
// Add AI-CMC Blueprint Generator for molecular structure to regulatory documents
const LazyCMCBlueprintGenerator = React.lazy(() => import('./pages/CMCBlueprintGenerator'));
const LazyLumenBioDashboard = React.lazy(() => import('./pages/LumenBioDashboard'));
const LazyLumenBioReports = React.lazy(() => import('./pages/LumenBioReports'));
const LazyLumenBioLanding = React.lazy(() => import('./pages/LumenBioLanding'));
const LazySimpleLearningInterface = React.lazy(() => import('./components/SimpleLearningInterface'));
// Add Protocol Review and Study Planner pages
const LazyProtocolReview = React.lazy(() => import('./pages/ProtocolReview'));
const LazyStudyPlanner = React.lazy(() => import('./pages/StudyPlanner'));
// Add ICH Wiz page
const LazyICHWizPage = React.lazy(() => import('./pages/ICHWizPage'));
// Admin Profile with role-switching capabilities
const LazyAdminProfile = React.lazy(() => import('./pages/AdminProfile'));
// Role-based dashboard with dynamically rendered KPIs
const LazyRoleDashboard = React.lazy(() => import('./pages/RoleDashboard'));
// eCTD Planner module for submission management
const LazyEctdPlanner = React.lazy(() => import('./pages/EctdPlanner'));

// Simple error boundary component
class SimpleErrorBoundary extends React.Component<
  { children: React.ReactNode, fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode, fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 bg-red-50 text-red-900 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p>The component encountered an error. Please try refreshing the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Removed TopNav import as we're using layout component instead
// Import auth components and context providers
import { AuthProvider, useAuth } from './hooks/use-auth';
import { useLocation } from 'wouter';
import AuthPage from './pages/auth-page';
import { ProtectedRoute } from './components/ProtectedRoute';
// Import UserContext for role-based dashboards
import { UserProvider } from './contexts/UserContext';
// Import onboarding context provider
import { OnboardingProvider } from './contexts/OnboardingContext';
// Import AuthRedirector component for authenticated user routing
import AuthRedirector from './components/AuthRedirector';
// Import NotFound page
const LazyNotFound = React.lazy(() => import('./pages/NotFound'));
// Import Versions page
const LazyVersions = React.lazy(() => import('./pages/versions'));
// Import Subscribed Solutions page
const LazySubscribedSolutions = React.lazy(() => import('./pages/SubscribedSolutions'));
// Import Client Portal Dashboard
const LazyClientPortal = React.lazy(() => import('./pages/ClientPortal'));
// Import Vault Upload Test page
const LazyVaultUploadTest = React.lazy(() => import('./pages/VaultUploadTest'));
// Team signup page with detailed profile and license management
const LazyTeamSignup = React.lazy(() => import('./pages/TeamSignup'));
// Case Studies page with authentic customer success stories
const LazyCaseStudies = React.lazy(() => import('./pages/CaseStudies'));
// Import MinimalEntryPage with no external dependencies
import MinimalEntryPage from './pages/MinimalEntryPage';
// Currently using a fallback for DemoStart page until we implement it fully
const LazyDemoStart = () => {
  // Redirects user to home if they're not logged in
  const handleAuth = () => {
    localStorage.setItem("token", "demo-token-" + Date.now());
    window.location.href = "/demo";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-regulatory-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-md w-full p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Start Demo</h1>
        <button 
          onClick={handleAuth}
          className="w-full bg-regulatory-600 hover:bg-regulatory-700 text-white py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-regulatory-500 focus:ring-offset-2 transition-colors"
        >
          Start Trial Wizard Demo
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <SimpleErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <UserProvider>
            <OnboardingProvider>
              <LumenAssistantProvider>
                <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Loading application...</div>}>
                  <div className=""> {/* No additional padding needed */}
                  <Switch>
              <Route path="/builder">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="IND Builder" />}>
                  <LazyINDWizard />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/portal/ind/:sequenceId">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Sequence Detail" />}>
                  <LazyIndSequenceDetail />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/ind/planner">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Sequence Manager" />}>
                  <LazyIndSequenceManager />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/solutions">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Solutions" />}>
                  <LazyHomeLanding />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/solutions/protocol-optimization">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Protocol Optimization" />}>
                  <LazyProtocolReview />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/ind-wizard">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="IND Wizard" />}>
                  <React.Suspense fallback={<EmergencyFallback pageName="IND Wizard" />}>
                    <LazyINDWizard />
                  </React.Suspense>
                </SimpleErrorBoundary>
              </Route>
              <Route path="/solutions/ind-wizard">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="IND Wizard" />}>
                  <React.Suspense fallback={<EmergencyFallback pageName="IND Wizard" />}>
                    <LazyINDWizard />
                  </React.Suspense>
                </SimpleErrorBoundary>
              </Route>
              <Route path="/ind-wizard">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="IND Wizard" />}>
                  <React.Suspense fallback={<EmergencyFallback pageName="IND Wizard" />}>
                    <LazyINDWizard />
                  </React.Suspense>
                </SimpleErrorBoundary>
              </Route>
              <Route path="/ind-architect">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="IND Accelerator" />}>
                  <React.Suspense fallback={<EmergencyFallback pageName="IND Accelerator" />}>
                    <LazyINDWizard />
                  </React.Suspense>
                </SimpleErrorBoundary>
              </Route>
              <Route path="/enterprise-csr-intelligence">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="CSR Intelligence" />}>
                  <LazyCSRIntelligence />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/csr-intelligence">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="CSR Intelligence" />}>
                  <LazyCSRIntelligence />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/solutions/csr-intelligence">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="CSR Intelligence" />}>
                  <LazyCSRIntelligence />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/csr">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="CSR Module" />}>
                  <LazyCSRPage />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/metadata">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Metadata Repository" />}>
                  <LazyMetadataRepositoryPage />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/use-case-library">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Use Case Library" />}>
                  <LazyUseCaseLibrary />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/ind-full-solution">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="IND Full Solution" />}>
                  <LazyINDWizard />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/ind/wizard-v2">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="IND Wizard 2.0" />}>
                  <React.Suspense fallback={<EmergencyFallback pageName="IND Wizard 2.0" />}>
                    <LazyINDWizard2 />
                  </React.Suspense>
                </SimpleErrorBoundary>
              </Route>
              <Route path="/ind/wizard/*">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="IND Wizard" />}>
                  <React.Suspense fallback={<EmergencyFallback pageName="IND Wizard" />}>
                    <LazyINDWizard />
                  </React.Suspense>
                </SimpleErrorBoundary>
              </Route>
              <Route path="/cer-generator">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="CER Generator" />}>
                  <LazyStreamingCERGenerator />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/cer-generator-streaming">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="CER Generator with Streaming" />}>
                  <LazyStreamingCERGenerator />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/validation-hub">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Validation Hub" />}>
                  <LazyValidationHub />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/validation-hub-enhanced">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Enhanced Validation Hub" />}>
                  <LazyValidationHubEnhanced />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/cmc-blueprint-generator">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="CMC Blueprint Generator" />}>
                  <LazyCMCBlueprintGenerator />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/ask-lumen">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Ask Lumen" />}>
                  <LazyAskLumen />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/solutions/ask-lumen">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Ask Lumen" />}>
                  <LazyAskLumen />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/chat">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="AI Chat" />}>
                  <LazyChatPanel />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/portal">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Portal" />}>
                  <LazyHomeLanding />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/persona*">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Persona Pages" />}>
                  <LazyPersonaPages />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/investor-assets">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Investor Assets" />}>
                  <LazyGatedSalesInvestorAssets />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/lumen-bio/dashboard">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Lumen Bio Dashboard" />}>
                  <LazyLumenBioDashboard />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/lumen-bio/reports">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Lumen Bio Reports" />}>
                  <LazyLumenBioReports />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/lumen-bio">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Lumen Bio Landing" />}>
                  <LazyLumenBioLanding />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/walkthroughs">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Walkthroughs" />}>
                  <LazyWalkthroughs />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/auth">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Login" />}>
                  <AuthPage />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/team-signup">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Team Signup" />}>
                  <LazyTeamSignup />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/start">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Demo Start" />}>
                  <LazyDemoStart />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/demo">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Demo" />}>
                  <ProtectedRoute>
                    <LazyWalkthroughs />
                  </ProtectedRoute>
                </SimpleErrorBoundary>
              </Route>
              <Route path="/learning">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Learning Interface" />}>
                  <LazySimpleLearningInterface />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/adaptive-learning">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Adaptive Learning" />}>
                  <LazyAdaptiveLearning />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/document-risk/:id?">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Document Risk Prediction" />}>
                  <LazyDocumentRiskPrediction />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/document-management">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Document Management" />}>
                  <LazyDocumentManagement />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/enterprise-vault">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Enterprise Document Vault" />}>
                  <LazyEnterpriseDocumentVault />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/vault-test">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Vault Test Interface" />}>
                  <LazyVaultUploadTest />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/protocol-review">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Protocol Review" />}>
                  <LazyProtocolReview />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/study-planner">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Study Planner" />}>
                  <LazyStudyPlanner />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/ich-wiz">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="ICH Wiz" />}>
                  <LazyICHWizPage />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/solutions/ich-wiz">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="ICH Wiz" />}>
                  <LazyICHWizPage />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/lumen-bio/ich-wiz">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="ICH Wiz - Lumen Bio" />}>
                  <LazyICHWizPage />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/lumen-bio/report-demo">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Lumen Bio Report Demo" />}>
                  <React.Suspense fallback={<EmergencyFallback pageName="Lumen Bio Report Demo" />}>
                    {/* Directly import to avoid Lazy loading issues during demo */}
                    {(() => {
                      const LumenBioReportDemo = React.lazy(() => import('./pages/LumenBioReportDemo'));
                      return <LumenBioReportDemo />;
                    })()}
                  </React.Suspense>
                </SimpleErrorBoundary>
              </Route>
              <Route path="/analytics-dashboard">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Analytics Dashboard" />}>
                  <LazyAnalyticsDashboard />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/cmc-module">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="CMC Module" />}>
                  <ProtectedRoute>
                    <LazyCMCModule />
                  </ProtectedRoute>
                </SimpleErrorBoundary>
              </Route>
              <Route path="/cer-module">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="CER Module" />}>
                  <LazyStreamingCERGenerator />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/regulatory-module">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Regulatory Module" />}>
                  <LazyValidationHubEnhanced />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/cmdr">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Clinical Metadata Repository" />}>
                  <ProtectedRoute>
                    <LazyClinicalMetadataRepository />
                  </ProtectedRoute>
                </SimpleErrorBoundary>
              </Route>
              <Route path="/use-cases">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Use Cases" />}>
                  <LazyUseCaseLibrary />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/solutions/cmc-insights">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="CMC Insights" />}>
                  <ProtectedRoute>
                    <LazyCMCModule />
                  </ProtectedRoute>
                </SimpleErrorBoundary>
              </Route>
              <Route path="/cmc-insights-use-case">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="CMC Insights Use Case" />}>
                  <ProtectedRoute>
                    <LazyCMCModule />
                  </ProtectedRoute>
                </SimpleErrorBoundary>
              </Route>
              <Route path="/cmc-blueprint-generator">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="AI-CMC Blueprint Generator" />}>
                  <ProtectedRoute>
                    <LazyCMCBlueprintGenerator />
                  </ProtectedRoute>
                </SimpleErrorBoundary>
              </Route>
              <Route path="/versions">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Document Versions" />}>
                  <LazyVersions />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/account">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Account Portal" />}>
                  <ProtectedRoute>
                    {/* Redirect account to client portal automatically */}
                    <AuthRedirector>
                      <LazyClientPortal />
                    </AuthRedirector>
                  </ProtectedRoute>
                </SimpleErrorBoundary>
              </Route>
              <Route path="/account/subscribed-solutions">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Subscribed Solutions" />}>
                  <ProtectedRoute>
                    {/* Redirect old subscribed solutions to client portal */}
                    <AuthRedirector>
                      <LazyClientPortal />
                    </AuthRedirector>
                  </ProtectedRoute>
                </SimpleErrorBoundary>
              </Route>
              <Route path="/portal/client">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Client Portal" />}>
                  <ProtectedRoute>
                    <LazyClientPortal />
                  </ProtectedRoute>
                </SimpleErrorBoundary>
              </Route>
              <Route path="/admin-profile">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Admin Profile" />}>
                  <LazyAdminProfile />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/case-studies">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Case Studies" />}>
                  <LazyCaseStudies />
                </SimpleErrorBoundary>
              </Route>
              {/* Protected root route with enhanced error handling for marketing page */}
              <Route path="/">
                <SimpleErrorBoundary 
                  fallback={
                    <div className="min-h-screen bg-white flex items-center justify-center p-4">
                      <div className="max-w-md mx-auto bg-white p-8 rounded shadow-md border border-gray-200 text-center">
                        <h1 className="text-xl font-semibold text-[#003057] mb-4">Welcome to TrialSage™</h1>
                        <p className="text-[#666] mb-6">
                          Our marketing page is currently loading. You can explore our solutions while you wait.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
                          <a href="/solutions" className="bg-[#0078d4] hover:bg-[#005fa6] text-white px-5 py-2.5 rounded text-sm font-medium">
                            Browse Solutions
                          </a>
                          <a href="/auth" className="bg-white border border-[#0078d4] text-[#0078d4] hover:bg-gray-50 px-5 py-2.5 rounded text-sm font-medium">
                            Sign In
                          </a>
                        </div>
                      </div>
                    </div>
                  }
                >
                  <React.Suspense 
                    fallback={
                      <div className="flex flex-col items-center justify-center h-screen bg-white">
                        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                        <p className="mt-4 text-lg text-[#003057]">Loading TrialSage™ Platform...</p>
                      </div>
                    }
                  >
                    <AuthRedirector>
                      <MinimalEntryPage />
                    </AuthRedirector>
                  </React.Suspense>
                </SimpleErrorBoundary>
              </Route>
              <Route>
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="404 Not Found" />}>
                  <LazyNotFound />
                </SimpleErrorBoundary>
              </Route>
            </Switch>
          </div>
          </React.Suspense>
          <LumenAssistant />
        </LumenAssistantProvider>
          </OnboardingProvider>
        </AuthProvider>
      </ToastProvider>
    </SimpleErrorBoundary>
  );
}