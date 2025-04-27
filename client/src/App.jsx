import React, { useState, useEffect } from 'react';
import { Route, Switch, useLocation, Redirect } from 'wouter';
import NotFound from './components/common/NotFound';
import { ModuleIntegrationProvider } from './components/integration/ModuleIntegrationLayer';
import UnifiedPlatform from './components/UnifiedPlatform';

// Simple client portal stub
const ClientPortal = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Client Portal</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="********"
            />
          </div>
          <button 
            type="button"
            className="w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700 transition duration-200"
          >
            Sign In
          </button>
          <div className="text-center mt-4">
            <a href="/" className="text-sm text-pink-600 hover:underline">
              Return to TrialSage
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

function App() {
  // Get location for navigation
  const [location, setLocation] = useLocation();

  return (
    <ModuleIntegrationProvider>
      <div className="min-h-screen flex flex-col">
        <Switch>
          <Route path="/" exact>
            <UnifiedPlatform />
          </Route>
          <Route path="/dashboard">
            <UnifiedPlatform />
          </Route>
          <Route path="/vault">
            <UnifiedPlatform />
          </Route>
          <Route path="/csr-intelligence">
            <UnifiedPlatform />
          </Route>
          <Route path="/study-architect">
            <UnifiedPlatform />
          </Route>
          <Route path="/ind-wizard">
            <UnifiedPlatform />
          </Route>
          
          {/* Client Portal Routes */}
          <Route path="/portal">
            <ClientPortal />
          </Route>
          <Route path="/portal/ind">
            <ClientPortal />
          </Route>
          
          {/* 404 Route */}
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </div>
    </ModuleIntegrationProvider>
  );
}

export default App;