import React, { useState, useEffect } from 'react';
import { Route, Switch, Link, useLocation } from 'wouter';
import VaultMarketingPage from './pages/VaultMarketingPage.jsx';
import VaultUploadTest from './pages/VaultUploadTest.jsx';
import ClientPortalDashboard from './pages/ClientPortalDashboard.jsx';
import CMCRoutes from './pages/CMCBlueprintPage.jsx';
import ReferenceModelPage from './pages/ReferenceModelPage.jsx';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("authenticated") === "true");
  const [location] = useLocation();
  
  useEffect(() => {
    // Check authentication state when location changes
    setIsLoggedIn(localStorage.getItem("authenticated") === "true");
  }, [location]);
  
  // Determine if we should show the nav bar (hide it on client portal)
  const showNavBar = !location.startsWith('/client-portal');
  
  return (
    <>
      {showNavBar && (
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
      </Switch>
    </>
  );
}