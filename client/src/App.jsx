import React, { useState, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import VaultMarketingPage from './pages/VaultMarketingPage.jsx';
import VaultUploadTest from './pages/VaultUploadTest.jsx';
import ClientPortalDashboard from './pages/ClientPortalDashboard.jsx';
import CMCRoutes from './pages/CMCBlueprintPage.jsx';
import ReferenceModelPage from './pages/ReferenceModelPage.jsx';
import INDWizardContainer from './components/ind-wizard/INDWizardContainer.jsx';
import MainNavigation from './components/MainNavigation.jsx';
import { LumenAssistantProvider } from './components/assistant';
import UnifiedPlatform from './components/UnifiedPlatform';
import securityService from './services/SecurityService';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("authenticated") === "true" || securityService.authenticated);
  const [location] = useLocation();
  const [useUnifiedPlatform, setUseUnifiedPlatform] = useState(true);
  
  useEffect(() => {
    // Check authentication state when location changes
    setIsLoggedIn(localStorage.getItem("authenticated") === "true" || securityService.authenticated);
    
    // For demo purposes, we'll always use the unified platform
    // In a real app, this would be based on some condition
    setUseUnifiedPlatform(true);
  }, [location]);
  
  // If using the unified platform, render it
  if (useUnifiedPlatform) {
    return <UnifiedPlatform />;
  }
  
  // Legacy routing below (kept for backward compatibility)
  // Determine if we should show the nav bar (hide it on client portal)
  const showNavBar = !location.startsWith('/client-portal');
  
  // Determine if we should show the new main navigation or the original nav bar
  const useMainNav = isLoggedIn && location.startsWith('/ind-wizard');
  
  return (
    <LumenAssistantProvider>
      <div className="flex h-screen overflow-hidden">
        {useMainNav && <MainNavigation />}
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Legacy navbar (no longer used with unified platform) */}
          {showNavBar && !useMainNav && (
            <nav className="bg-gray-800 text-white p-4">
              <div className="max-w-7xl mx-auto flex justify-between">
                <div className="text-xl font-bold">TrialSage™</div>
                <div className="space-x-4">
                  {/* Legacy navigation links */}
                </div>
              </div>
            </nav>
          )}
          
          <div className="flex-1 overflow-auto">
            <Switch>
              <Route path="/" component={VaultMarketingPage} />
              <Route path="/vault-test" component={VaultUploadTest} />
              <Route path="/client-portal" component={ClientPortalDashboard} />
              <Route path="/reference-model" component={ReferenceModelPage} />
              <Route path="/security-compliance" component={() => {
                window.location.href = "/security_compliance.html";
                return null;
              }} />
              <Route path="/heor-security" component={() => {
                window.location.href = "/heor_security.html";
                return null;
              }} />
              <Route path="/cmc">
                <CMCRoutes />
              </Route>
              <Route path="/cmc/blueprints/:id">
                <CMCRoutes />
              </Route>
              <Route path="/ind-wizard">
                <INDWizardContainer projectId="12345" />
              </Route>
              <Route path="/ind-wizard/:subPath*">
                <INDWizardContainer projectId="12345" />
              </Route>
            </Switch>
          </div>
        </div>
      </div>
    </LumenAssistantProvider>
  );
}