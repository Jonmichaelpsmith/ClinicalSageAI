import React from 'react';
import { Switch, Route } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ToastProvider } from './hooks/use-toast';
import FDACompliancePage from './pages/FDACompliancePage';

/**
 * Main Application Component
 * 
 * Provides routing for the TrialSage application
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Switch>
          <Route path="/fda-compliance" component={FDACompliancePage} />
          <Route path="/">
            <div className="container mx-auto py-12 px-4">
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  TrialSage™ FDA Compliance Portal
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Access advanced FDA 21 CFR Part 11 compliance controls for secure document management and regulatory submissions.
                </p>
                <a
                  href="/fda-compliance"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                >
                  Access FDA Compliance Dashboard
                </a>
              </div>
            </div>
          </Route>
        </Switch>
      </ToastProvider>
    </QueryClientProvider>
  );
}