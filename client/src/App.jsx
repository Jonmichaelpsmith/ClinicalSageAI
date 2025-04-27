import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { ModuleIntegrationProvider } from './components/integration/ModuleIntegrationLayer';
import { AuthProvider } from './contexts/AuthContext';
import { useToast, ToastContainer } from './hooks/use-toast.jsx';
import { queryClient } from './lib/queryClient';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppHeader from './components/common/AppHeader';
import AppSidebar from './components/common/AppSidebar';
import ClientContextBar from './components/common/ClientContextBar';
import DashboardModule from './components/dashboard/DashboardModule';
import TrialVaultModule from './components/trial-vault/TrialVaultModule';
import CSRIntelligenceModule from './components/csr-intelligence/CSRIntelligenceModule';
import StudyArchitectModule from './components/study-architect/StudyArchitectModule';
import UnifiedPlatform from './components/UnifiedPlatform';
import NotFound from './components/common/NotFound';
import AIAssistantButton from './components/AIAssistantButton';
import LoginPage from './pages/LoginPage';
import { useAuth } from './contexts/AuthContext';

// Main application layout with navigation and protected content
const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header is consistent across all pages */}
      <AppHeader />
      <ClientContextBar />

      <div className="flex flex-1">
        {/* Sidebar for navigation between modules */}
        <AppSidebar />

        {/* Main content area */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* AI Assistant button */}
      <AIAssistantButton />
    </div>
  );
};

// Wrapper component to provide toast functionality
const AppContent = () => {
  const { toast, dismissToast, toasts } = useToast();
  
  return (
    <ModuleIntegrationProvider>
      <Switch>
        <Route path="/login" component={LoginPage} />
        
        <Route path="/">
          <AppLayout>
            <Route path="/" component={UnifiedPlatform} />
          </AppLayout>
        </Route>
        
        <Route path="/dashboard">
          <AppLayout>
            <DashboardModule />
          </AppLayout>
        </Route>
        
        <Route path="/vault">
          <AppLayout>
            <TrialVaultModule />
          </AppLayout>
        </Route>
        
        <Route path="/csr-intelligence">
          <AppLayout>
            <CSRIntelligenceModule />
          </AppLayout>
        </Route>
        
        <Route path="/study-architect">
          <AppLayout>
            <StudyArchitectModule />
          </AppLayout>
        </Route>
        
        <Route>
          <AppLayout>
            <NotFound />
          </AppLayout>
        </Route>
      </Switch>
      
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />
    </ModuleIntegrationProvider>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;