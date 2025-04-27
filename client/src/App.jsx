import React, { useState, useEffect } from 'react';
import { Route, Switch, Link, useLocation } from 'wouter';
import VaultMarketingPage from './pages/VaultMarketingPage.jsx';
import VaultUploadTest from './pages/VaultUploadTest.jsx';
import ClientPortalDashboard from './pages/ClientPortalDashboard.jsx';
import CMCRoutes from './pages/CMCBlueprintPage.jsx';
import ReferenceModelPage from './pages/ReferenceModelPage.jsx';
import INDWizardContainer from './components/ind-wizard/INDWizardContainer.jsx';
import MainNavigation from './components/MainNavigation.jsx';
import { LumenAssistantProvider } from './components/assistant';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("authenticated") === "true");
  const [location] = useLocation();
  
  useEffect(() => {
    // Check authentication state when location changes
    setIsLoggedIn(localStorage.getItem("authenticated") === "true");
  }, [location]);
  
  // Determine if we should show the nav bar (hide it on client portal)
  const showNavBar = !location.startsWith('/client-portal');
  
  // Determine if we should show the new main navigation or the original nav bar
  const useMainNav = isLoggedIn && location.startsWith('/ind-wizard');
  
  return (
    <LumenAssistantProvider>
      <div className="flex h-screen overflow-hidden">
        {useMainNav && <MainNavigation />}
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Show original navbar when not using MainNavigation */}
          {showNavBar && !useMainNav && (
            <nav className="bg-gray-800 text-white p-4">
              <div className="max-w-7xl mx-auto flex justify-between">
                <div className="text-xl font-bold">TrialSage™</div>
                <div className="space-x-4">
                  <Link href="/" className="hover:text-gray-300">Home</Link>
                  <Link href="/security-compliance" className="hover:text-gray-300">Security & Compliance</Link>
                  <Link href="/vault-test" className="hover:text-gray-300">Vault Test</Link>
                  {isLoggedIn ? (
                    <>
                      <Link href="/client-portal" className="hover:text-gray-300">Client Portal</Link>
                      <Link href="/cmc" className="hover:text-gray-300">CMC Blueprint</Link>
                      <Link href="/reference-model" className="hover:text-gray-300">Reference Model</Link>
                      <Link href="/ind-wizard" className="hover:text-gray-300">IND Wizard</Link>
                      <button 
                        className="hover:text-gray-300"
                        onClick={() => {
                          localStorage.removeItem("authenticated");
                          setIsLoggedIn(false);
                          window.location.href = "/";
                        }}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link href="/vault-test" className="hover:text-gray-300">Login</Link>
                  )}
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