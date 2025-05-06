import React, { useEffect } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import CERV2Page from './pages/CERV2Page';
import CERPage from './pages/CERPage';

// Main application with routing
export default function App() {
  const [location, setLocation] = useLocation();
  
  // Handle direct access to the root - redirect to client portal
  useEffect(() => {
    if (location === '/') {
      window.location.href = '/client-portal';
    }
  }, [location]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Switch>
        {/* CER Builder page with full features */}
        <Route path="/cerv2" component={CERPage} />
        
        {/* Old CER page kept for backward compatibility */}
        <Route path="/cer-old" component={CERV2Page} />
        
        {/* Default route - placeholder while redirecting */}
        <Route path="/">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Redirecting to Client Portal...</h2>
              <p className="text-gray-600">Please wait while we redirect you to the TrialSage Client Portal.</p>
            </div>
          </div>
        </Route>
      </Switch>
    </div>
  );
}