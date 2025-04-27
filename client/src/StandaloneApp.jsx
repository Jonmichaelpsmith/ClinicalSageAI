import React from 'react';
import { Route, Switch } from 'wouter';
import StandaloneLoginPage from './pages/StandaloneLoginPage';
import StandaloneClientPortalPage from './pages/StandaloneClientPortalPage';

/**
 * Standalone App that doesn't require a backend
 * Use this for testing the UI when the server is not available
 */
const StandaloneApp = () => {
  return (
    <>
      <Switch>
        <Route path="/standalone-login" component={StandaloneLoginPage} />
        <Route path="/client-portal" component={StandaloneClientPortalPage} />
        <Route path="/" component={() => (
          <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-b from-white to-pink-50">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">TrialSage™ Standalone Demo</h1>
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <p className="text-gray-600 mb-6">
                  This is a standalone version of TrialSage that works without a server connection. 
                  Choose an option below to get started.
                </p>
                <div className="space-y-4">
                  <a 
                    href="/standalone-login" 
                    className="block w-full bg-pink-600 text-white py-3 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 text-center font-medium"
                  >
                    Go to Login Page
                  </a>
                  <a 
                    href="/client-portal" 
                    className="block w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center font-medium"
                  >
                    Go to Client Portal
                  </a>
                </div>
              </div>
            </div>
          </div>
        )} />
      </Switch>
    </>
  );
};

export default StandaloneApp;