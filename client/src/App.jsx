import React from 'react';
import { Switch, Route } from 'wouter';
import CERV2Page from './pages/CERV2Page';
import CERPage from './pages/CERPage';

// Main application with routing
export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Switch>
        {/* New exact match Omnia-style CER page */}
        <Route path="/cerv2" component={CERPage} />
        
        {/* Client portal - served from client-portal.html on the server side */}
        <Route path="/client-portal">
          <iframe 
            src="/client-portal" 
            className="w-full h-screen border-none" 
            title="TrialSage Client Portal"
          />
        </Route>
        
        {/* Default route - redirect to client portal */}
        <Route path="/">
          <iframe 
            src="/client-portal" 
            className="w-full h-screen border-none" 
            title="TrialSage Client Portal"
          />
        </Route>
      </Switch>
    </div>
  );
}