// App.tsx – root router with improved toast and resilient WebSocket connection
import React, { useState } from 'react';
import { Route, Switch } from 'wouter';
// Using the region-aware SubmissionBuilder component
import SubmissionBuilder from './pages/SubmissionBuilder';
import IndSequenceDetail from './pages/IndSequenceDetail';
import IndSequenceManager from './pages/IndSequenceManager';
import HomeLanding from './pages/HomeLandingProtected';
import SimplifiedLandingPage from './components/SimplifiedLandingPage';
import ImprovedLandingPage from './components/ImprovedLandingPage';
import HomeLandingEnhanced from './pages/HomeLandingEnhanced';
import PersonaPages from './components/PersonaPages';
import GatedSalesInvestorAssets from './components/GatedSalesInvestorAssets';
import Walkthroughs from './pages/Walkthroughs';
import DebugInfo from './components/DebugInfo';
import ErrorBoundary from './ErrorBoundary';
import ProductFeatures from './pages/ProductFeatures';
import LumenBioDashboard from './pages/LumenBioDashboard';
import LumenBioReports from './pages/LumenBioReports';
import UseCaseLibrary from './pages/UseCaseLibrary';
import INDFullSolution from './pages/INDFullSolution';
import INDWizard from './pages/INDWizard';
import CERGenerator from './pages/CERGenerator';
import ClientPortal from './pages/ClientPortal';
import AIAdvancedAgent from './pages/AIAdvancedAgent';
import SimpleLearningInterface from './components/SimpleLearningInterface';
import { CheckCircle, AlertTriangle, Info, HelpCircle } from 'lucide-react';
// React Toastify for production-ready notifications
// Toast notifications now using custom SecureToast component
// which doesn't depend on external libraries
// Tour components
import { TourProvider, TourHelpButton } from './components/TourContext';
import InteractiveTour from './components/InteractiveTour';
import WelcomeAnimation from './components/WelcomeAnimation';
// Tour animations
import './styles/tour-animations.css';

/* ------------ Global Toast Context Import ------------- */
// We now import the useToast hook from our secure toast implementation
import { useToast } from './components/security/SecureToast';
export { useToast };
/* ------------------------------------------------------------------ */

// Import for useQCWebSocket now moved to SubmissionBuilder component
// Each page that needs WebSocket will initialize its own connection
import { ToastProvider as SecureToastProvider } from './components/security/SecureToast';

// Anti-flash CSS injection
if (typeof document !== 'undefined') {
  // Insert CSS that prevents flickering
  const style = document.createElement('style');
  style.textContent = `
    /* Disable all animations to prevent flickering */
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
    }
    
    /* Force scrollbar to prevent layout shifting */
    body {
      overflow-y: scroll !important;
    }
  `;
  document.head.appendChild(style);
}

export default function App() {
  // Use static state to prevent layout shifting
  const [tourCompleted] = useState(false);
  
  // Always skip welcome animation to prevent flashing
  const welcomeCompleted = true;

  return (
    <ErrorBoundary>
      <SecureToastProvider>
        <TourProvider>
          {/* Fixed position help button - always visible */}
          <div className="fixed bottom-6 right-6 z-50">
            <TourHelpButton />
          </div>
          
          <Switch>
            <Route path="/builder">
              <ErrorBoundary>
                <INDWizard />
              </ErrorBoundary>
            </Route>
            <Route path="/portal/ind/:sequenceId">
              <ErrorBoundary>
                <IndSequenceDetail />
              </ErrorBoundary>
            </Route>
            <Route path="/ind/planner">
              <ErrorBoundary>
                <IndSequenceManager />
              </ErrorBoundary>
            </Route>
            <Route path="/solutions">
              <ErrorBoundary>
                <HomeLanding />
              </ErrorBoundary>
            </Route>
            <Route path="/ind-architect">
              <ErrorBoundary>
                <INDWizard />
              </ErrorBoundary>
            </Route>
            <Route path="/csr-intelligence">
              <ErrorBoundary>
                <HomeLanding />
              </ErrorBoundary>
            </Route>
            <Route path="/use-case-library">
              <ErrorBoundary>
                <UseCaseLibrary />
              </ErrorBoundary>
            </Route>
            <Route path="/ind-full-solution">
              <ErrorBoundary>
                <INDWizard />
              </ErrorBoundary>
            </Route>
            <Route path="/ind/wizard/*">
              <ErrorBoundary>
                <INDWizard />
              </ErrorBoundary>
            </Route>
            <Route path="/cer-generator">
              <ErrorBoundary>
                <CERGenerator />
              </ErrorBoundary>
            </Route>
            <Route path="/portal">
              <ErrorBoundary>
                <HomeLanding />
              </ErrorBoundary>
            </Route>
            <Route path="/persona">
              <ErrorBoundary>
                <PersonaPages />
              </ErrorBoundary>
            </Route>
            <Route path="/persona/:role">
              <ErrorBoundary>
                <PersonaPages />
              </ErrorBoundary>
            </Route>
            <Route path="/investor-assets">
              <ErrorBoundary>
                <GatedSalesInvestorAssets />
              </ErrorBoundary>
            </Route>
            <Route path="/lumen-bio/dashboard">
              <ErrorBoundary>
                <LumenBioDashboard />
              </ErrorBoundary>
            </Route>
            <Route path="/lumen-bio/reports">
              <ErrorBoundary>
                <LumenBioReports />
              </ErrorBoundary>
            </Route>
            <Route path="/walkthroughs">
              <ErrorBoundary>
                <Walkthroughs />
              </ErrorBoundary>
            </Route>
            <Route path="/signup">
              <ErrorBoundary>
                <HomeLanding />
              </ErrorBoundary>
            </Route>
            <Route path="/demo">
              <ErrorBoundary>
                <Walkthroughs />
              </ErrorBoundary>
            </Route>
            <Route path="/client-portal">
              <ErrorBoundary>
                {/* Redirect to IND Wizard */}
                {typeof window !== 'undefined' && (window.location.href = '/ind/wizard')}
                <div>Redirecting to IND Wizard...</div>
              </ErrorBoundary>
            </Route>
            <Route path="/ai-agent">
              <ErrorBoundary>
                {/* Redirect to IND Wizard */}
                {typeof window !== 'undefined' && (window.location.href = '/ind/wizard')}
                <div>Redirecting to IND Wizard...</div>
              </ErrorBoundary>
            </Route>
            <Route path="/learning">
              <ErrorBoundary>
                <SimpleLearningInterface />
              </ErrorBoundary>
            </Route>
            <Route path="/">
              <ErrorBoundary>
                <HomeLandingEnhanced />
              </ErrorBoundary>
            </Route>
            <Route>
              <ErrorBoundary>
                <HomeLandingEnhanced />
              </ErrorBoundary>
            </Route>
          </Switch>
          <DebugInfo />
        </TourProvider>
      </SecureToastProvider>
    </ErrorBoundary>
  );
}