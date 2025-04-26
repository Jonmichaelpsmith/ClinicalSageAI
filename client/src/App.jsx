import React from 'react';
import { Route, Switch, Link } from 'wouter';
import VaultMarketingPage from './pages/VaultMarketingPage.jsx';
import VaultUploadTest from './pages/VaultUploadTest.jsx';

export default function App() {
  return (
    <>
      <nav className="bg-gray-800 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between">
          <div className="text-xl font-bold">TrialSage Vault™</div>
          <div className="space-x-4">
            <Link href="/" className="hover:text-gray-300">Home</Link>
            <Link href="/vault-test" className="hover:text-gray-300">Vault Test</Link>
          </div>
        </div>
      </nav>
      
      <Switch>
        <Route path="/" component={VaultMarketingPage} />
        <Route path="/vault-test" component={VaultUploadTest} />
      </Switch>
    </>
  );
}