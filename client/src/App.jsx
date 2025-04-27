import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { ModuleIntegrationProvider } from './components/integration/ModuleIntegrationLayer';

// Common layout components
import AppHeader from './components/common/AppHeader';
import AppSidebar from './components/common/AppSidebar';
import ClientContextBar from './components/common/ClientContextBar';
import AIAssistantButton from './components/AIAssistantButton';
import NotFound from './components/common/NotFound';

// Protected route component
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import UnifiedPlatform from './components/UnifiedPlatform';
import DashboardModule from './components/dashboard/DashboardModule';
import TrialVaultModule from './components/trial-vault/TrialVaultModule';
import CSRIntelligenceModule from './components/csr-intelligence/CSRIntelligenceModule';
import StudyArchitectModule from './components/study-architect/StudyArchitectModule';

// Layout wrapper for authenticated pages
const AuthenticatedLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <AppHeader />
    <AppSidebar />
    <div className="md:ml-60 pt-16">
      <ClientContextBar />
      <div className="container mx-auto px-4 py-6">
        {children}
      </div>
    </div>
    <AIAssistantButton />
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ModuleIntegrationProvider>
          <Switch>
            {/* Public routes */}
            <Route path="/login" component={LoginPage} />
            
            {/* Protected route for home/landing */}
            <ProtectedRoute 
              path="/" 
              component={() => (
                <AuthenticatedLayout>
                  <UnifiedPlatform />
                </AuthenticatedLayout>
              )} 
            />
            
            {/* Protected dashboard route */}
            <ProtectedRoute 
              path="/dashboard" 
              component={() => (
                <AuthenticatedLayout>
                  <DashboardModule />
                </AuthenticatedLayout>
              )} 
            />
            
            {/* Protected vault route */}
            <ProtectedRoute 
              path="/vault" 
              component={() => (
                <AuthenticatedLayout>
                  <TrialVaultModule />
                </AuthenticatedLayout>
              )} 
            />
            
            {/* Protected CSR Intelligence route */}
            <ProtectedRoute 
              path="/csr-intelligence" 
              component={() => (
                <AuthenticatedLayout>
                  <CSRIntelligenceModule />
                </AuthenticatedLayout>
              )} 
            />
            
            {/* Protected Study Architect route */}
            <ProtectedRoute 
              path="/study-architect" 
              component={() => (
                <AuthenticatedLayout>
                  <StudyArchitectModule />
                </AuthenticatedLayout>
              )} 
            />
            
            {/* Admin routes with role requirement */}
            <ProtectedRoute 
              path="/admin" 
              component={() => (
                <AuthenticatedLayout>
                  <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                </AuthenticatedLayout>
              )} 
              requiredRoles={['admin']}
            />
            
            {/* 404 Not Found */}
            <Route component={NotFound} />
          </Switch>
          
          <Toaster />
        </ModuleIntegrationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;