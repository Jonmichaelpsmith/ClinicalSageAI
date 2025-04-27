import React, { useEffect, useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from './components/ui/toaster';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import ClientPortalPage from './pages/ClientPortalPage';
import UnifiedPlatform from './components/UnifiedPlatform';
import DashboardModule from './components/dashboard/DashboardModule';
import TrialVaultModule from './components/trial-vault/TrialVaultModule';
import CSRIntelligenceModule from './components/csr-intelligence/CSRIntelligenceModule';
import StudyArchitectModule from './components/study-architect/StudyArchitectModule';

// Standalone pages (to use when server is down)
import StandaloneLoginPage from './pages/StandaloneLoginPage';
import StandaloneClientPortalPage from './pages/StandaloneClientPortalPage';

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

// ServerErrorBanner that shows when the server is unreachable
const ServerErrorBanner = ({ onSwitchToStandalone }) => (
  <div className="fixed top-0 inset-x-0 bg-red-600 text-white px-4 py-3 flex justify-between items-center z-50">
    <p>
      <span className="font-bold">Server connection error:</span> Unable to connect to the TrialSage server.
    </p>
    <button 
      onClick={onSwitchToStandalone}
      className="bg-white text-red-600 px-4 py-1 rounded-md text-sm font-medium hover:bg-red-50"
    >
      Switch to Standalone Mode
    </button>
  </div>
);

const NormalApp = ({ onServerError }) => {
  // Check server health after mounting
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const response = await fetch('/api/health', { 
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          // Short timeout to avoid long wait
          signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) {
          throw new Error('Server returned error status');
        }
      } catch (error) {
        console.error('Server health check failed:', error);
        onServerError(true);
      }
    };
    
    checkServerHealth();
  }, [onServerError]);

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
            
            {/* Client Portal Route - Special layout without sidebar */}
            <ProtectedRoute 
              path="/client-portal" 
              component={ClientPortalPage}
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

// Standalone app that doesn't require server connection
const StandaloneApp = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50">
      <div className="fixed top-0 inset-x-0 bg-yellow-500 text-white px-4 py-3 flex justify-between items-center z-50">
        <p>
          <span className="font-bold">Standalone Mode:</span> You are running in offline mode without server connection.
        </p>
      </div>
      
      <div className="pt-12"> {/* Add padding to account for the banner */}
        <Switch>
          <Route path="/standalone-login" component={StandaloneLoginPage} />
          <Route path="/client-portal" component={StandaloneClientPortalPage} />
          <Route>
            <div className="flex flex-col items-center justify-center min-h-screen p-8">
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
          </Route>
        </Switch>
        <Toaster />
      </div>
    </div>
  );
};

// Main App wrapper that decides which app to render
const App = () => {
  const [serverError, setServerError] = useState(false);
  const [useStandalone, setUseStandalone] = useState(false);
  
  // Function to handle server error
  const handleServerError = (hasError) => {
    setServerError(hasError);
  };
  
  // Function to switch to standalone mode
  const switchToStandalone = () => {
    setUseStandalone(true);
    // Store preference in localStorage
    localStorage.setItem('use_standalone_mode', 'true');
  };
  
  // Check if user previously chose standalone mode
  useEffect(() => {
    const savedPreference = localStorage.getItem('use_standalone_mode');
    if (savedPreference === 'true') {
      setUseStandalone(true);
    }
  }, []);
  
  // Render the appropriate app based on server status
  return (
    <>
      {serverError && !useStandalone && 
        <ServerErrorBanner onSwitchToStandalone={switchToStandalone} />
      }
      
      {useStandalone ? (
        <StandaloneApp />
      ) : (
        <NormalApp onServerError={handleServerError} />
      )}
    </>
  );
};

export default App;