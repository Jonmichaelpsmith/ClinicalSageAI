import React from 'react';
import { Switch, Route, Router } from 'wouter';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ClientPortalPage from './pages/ClientPortalPage';
import VaultPage from './pages/VaultPage';
import INDWizardPage from './pages/INDWizardPage';
import CSRPage from './pages/CSRPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <div className="flex-1">
            <Switch>
              <Route path="/login" component={LoginPage} />
              <ProtectedRoute path="/" component={DashboardPage} />
              <ProtectedRoute path="/client-portal" component={ClientPortalPage} />
              <ProtectedRoute path="/vault" component={VaultPage} />
              <ProtectedRoute path="/ind-wizard" component={INDWizardPage} />
              <ProtectedRoute path="/csr" component={CSRPage} />
              <Route component={NotFoundPage} />
            </Switch>
          </div>
        </div>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;