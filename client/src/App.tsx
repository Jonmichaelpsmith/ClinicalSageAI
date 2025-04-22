// App.tsx - Fixed version with simplified imports and no circular dependencies
import React, { useState } from 'react';
import { Route, Switch } from 'wouter';
import { ToastProvider } from './hooks/use-toast-context';

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
const LazyUseCaseLibrary = React.lazy(() => import('./pages/UseCaseLibrary'));
const LazyCERGenerator = React.lazy(() => import('./pages/EnterpriseGradeCERGenerator'));
// Add Enterprise CSR Intelligence module
import EnterpriseCSRIntelligence from './pages/EnterpriseCSRIntelligence';
const LazyCSRIntelligence = EnterpriseCSRIntelligence;
const LazyLumenBioDashboard = React.lazy(() => import('./pages/LumenBioDashboard'));
const LazyLumenBioReports = React.lazy(() => import('./pages/LumenBioReports'));
const LazySimpleLearningInterface = React.lazy(() => import('./components/SimpleLearningInterface'));

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

export default function App() {
  return (
    <SimpleErrorBoundary>
      <ToastProvider>
        <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Loading application...</div>}>
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
            <Route path="/ind-architect">
              <SimpleErrorBoundary fallback={<EmergencyFallback pageName="IND Accelerator" />}>
                <React.Suspense fallback={<EmergencyFallback pageName="IND Accelerator" />}>
                  <LazyINDWizard />
                </React.Suspense>
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
            <Route path="/ind/wizard/*">
              <SimpleErrorBoundary fallback={<EmergencyFallback pageName="IND Wizard" />}>
                <React.Suspense fallback={<EmergencyFallback pageName="IND Wizard" />}>
                  <LazyINDWizard />
                </React.Suspense>
              </SimpleErrorBoundary>
            </Route>
            <Route path="/cer-generator">
              <SimpleErrorBoundary fallback={<EmergencyFallback pageName="CER Generator" />}>
                <LazyCERGenerator />
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
            <Route path="/demo">
              <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Demo" />}>
                <LazyWalkthroughs />
              </SimpleErrorBoundary>
            </Route>
            <Route path="/learning">
              <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Learning Interface" />}>
                <LazySimpleLearningInterface />
              </SimpleErrorBoundary>
            </Route>
            <Route path="/">
              <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Home" />}>
                <LazyHomeLandingEnhanced />
              </SimpleErrorBoundary>
            </Route>
            <Route>
              <SimpleErrorBoundary fallback={<EmergencyFallback pageName="Home" />}>
                <LazyHomeLandingEnhanced />
              </SimpleErrorBoundary>
            </Route>
          </Switch>
        </React.Suspense>
      </ToastProvider>
    </SimpleErrorBoundary>
  );
}