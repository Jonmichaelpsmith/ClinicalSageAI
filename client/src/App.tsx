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
const LazyIndSequenceDetail = React.lazy(() => import('./pages/IndSequenceDetail'));
const LazyIndSequenceManager = React.lazy(() => import('./pages/IndSequenceManager'));
const LazyHomeLanding = React.lazy(() => import('./pages/HomeLandingProtected'));
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
// Add Adaptive Learning interface
const LazyAdaptiveLearning = React.lazy(() => import('./pages/AdaptiveLearning'));
// Add Document Risk Prediction with AI-powered insights
const LazyDocumentRiskPrediction = React.lazy(() => import('./pages/DocumentRiskPrediction'));
// Add Document Management with DocuShare integration
const LazyDocumentManagement = React.lazy(() => import('./pages/DocumentManagement'));
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
const LazySimpleLearningInterface = React.lazy(() => import('./components/SimpleLearningInterface'));
// Admin Profile with role-switching capabilities
const LazyAdminProfile = React.lazy(() => import('./pages/AdminProfile'));

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
import { AuthProvider } from './hooks/use-auth';
import AuthPage from './pages/auth-page';
import { ProtectedRoute } from './components/ProtectedRoute';
// Import onboarding context provider
import { OnboardingProvider } from './contexts/OnboardingContext';
// Import NotFound page
const LazyNotFound = React.lazy(() => import('./pages/NotFound'));
// Import Versions page
const LazyVersions = React.lazy(() => import('./pages/versions'));
// Team signup page with detailed profile and license management
const LazyTeamSignup = React.lazy(() => import('./pages/TeamSignup'));
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
              <Route path="/admin-profile">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Admin Profile" />}>
                  <LazyAdminProfile />
                </SimpleErrorBoundary>
              </Route>
              <Route path="/">
                <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Home" />}>
                  <React.Suspense fallback={<EmergencyFallback pageName="Marketing" />}>
                    <LazyHomeMarketingPage />
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