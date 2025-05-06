import React from 'react';
import { Switch, Route, Link } from 'wouter';
import CERV2Page from './pages/CERV2Page';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Switch>
        <Route path="/cerv2" component={CERV2Page} />
        <Route path="/client-portal">
          <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <h1 className="text-3xl font-bold mb-8">TrialSage Clinical Evaluation Report Builder</h1>
            <p className="text-lg mb-8 max-w-2xl text-center text-gray-600">
              Enterprise-grade platform for creating, analyzing, and managing clinical evaluation reports 
              with advanced regulatory compliance features.
            </p>
            <Link 
              to="/cerv2" 
              className="px-5 py-3 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition-colors inline-block"
            >
              Open CER Builder
            </Link>
          </div>
        </Route>
        <Route path="/">
          <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <h1 className="text-3xl font-bold mb-8">TrialSage Clinical Evaluation Report Builder</h1>
            <p className="text-lg mb-8 max-w-2xl text-center text-gray-600">
              Enterprise-grade platform for creating, analyzing, and managing clinical evaluation reports 
              with advanced regulatory compliance features.
            </p>
            <Link 
              to="/cerv2" 
              className="px-5 py-3 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition-colors inline-block"
            >
              Open CER Builder
            </Link>
          </div>
        </Route>
      </Switch>
    </div>
  );
}