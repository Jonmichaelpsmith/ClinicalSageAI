/**
 * Unified Platform
 * 
 * This component serves as the main container for the entire TrialSage platform.
 * It integrates all modules and shared services into a cohesive application.
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import ModuleIntegrationLayer, { useModuleIntegration, MODULES } from './integration/ModuleIntegrationLayer';
import securityService from '../services/SecurityService';
import AIAssistantButton from './AIAssistantButton';
import AIAssistantPanel from './AIAssistantPanel';
import AppHeader from './common/AppHeader';
import AppSidebar from './common/AppSidebar';
import AppFooter from './common/AppFooter';
import NotificationCenter from './common/NotificationCenter';
import ClientContextBar from './client-portal/ClientContextBar';
import LoadingOverlay from './common/LoadingOverlay';

// Module components (would be imported from respective modules)
const INDWizardModule = React.lazy(() => import('./ind-wizard/INDWizardModule'));
const TrialVaultModule = React.lazy(() => import('./trial-vault/TrialVaultModule'));
const CSRIntelligenceModule = React.lazy(() => import('./csr-intelligence/CSRIntelligenceModule'));
const StudyArchitectModule = React.lazy(() => import('./study-architect/StudyArchitectModule'));
const AnalyticsModule = React.lazy(() => import('./analytics/AnalyticsModule'));
const AdminModule = React.lazy(() => import('./admin/AdminModule'));

// Placeholder for module components while they're loading
const ModulePlaceholder = ({ moduleName }) => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
    <div className="mt-4 text-lg font-medium">Loading {moduleName} module...</div>
  </div>
);

// Error boundary for module loading failures
class ModuleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`Error loading module:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-800 p-8">
          <h2 className="text-2xl font-bold mb-4">Module Error</h2>
          <p className="mb-4">Failed to load the requested module.</p>
          <pre className="bg-white p-4 rounded shadow-inner text-sm overflow-auto max-w-full">
            {this.state.error?.toString()}
          </pre>
          <button 
            className="mt-8 px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
            onClick={() => window.location.href = '/'}
          >
            Return to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main platform wrapper
const UnifiedPlatformWrapper = ({ children }) => {
  return (
    <ModuleIntegrationLayer>
      {children}
    </ModuleIntegrationLayer>
  );
};

// Main platform content
const UnifiedPlatformContent = () => {
  const { activeModule, moduleCapabilities, initialized, error, switchActiveModule } = useModuleIntegration();
  const [location, setLocation] = useLocation();
  const [, params] = useRoute("/:module");
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clientContextOpen, setClientContextOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  
  // Handle authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Initialize security service
        const authResult = await securityService.initialize();
        
        if (authResult.authenticated) {
          setAuthenticated(true);
          setUser(authResult.user);
          setOrganization(securityService.currentOrganization);
        } else {
          // In a real app, redirect to login
          console.log('User not authenticated');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Authentication error:', error);
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);
  
  // Handle module routing
  useEffect(() => {
    if (!initialized) return;
    
    const moduleParam = params?.module;
    
    if (moduleParam) {
      const module = Object.values(MODULES).find(m => m === moduleParam);
      
      if (module && moduleCapabilities[module]?.available) {
        switchActiveModule(module);
      } else {
        // Redirect to default module
        setLocation('/');
      }
    } else if (!activeModule && location === '/') {
      // Set default module
      const defaultModule = Object.values(MODULES)[0];
      
      if (moduleCapabilities[defaultModule]?.available) {
        switchActiveModule(defaultModule);
        setLocation(`/${defaultModule}`);
      }
    }
  }, [initialized, params, location, activeModule, moduleCapabilities, switchActiveModule, setLocation]);
  
  // Handle AI assistant toggle
  const toggleAIAssistant = () => {
    setAiAssistantOpen(prev => !prev);
  };
  
  // Handle client context toggle
  const toggleClientContext = () => {
    setClientContextOpen(prev => !prev);
  };
  
  // Render module based on active module
  const renderModule = () => {
    if (!activeModule) {
      return <div className="flex-1 p-8">Select a module to begin</div>;
    }
    
    return (
      <ModuleErrorBoundary>
        <React.Suspense fallback={<ModulePlaceholder moduleName={activeModule} />}>
          {activeModule === MODULES.IND_WIZARD && <INDWizardModule />}
          {activeModule === MODULES.TRIAL_VAULT && <TrialVaultModule />}
          {activeModule === MODULES.CSR_INTELLIGENCE && <CSRIntelligenceModule />}
          {activeModule === MODULES.STUDY_ARCHITECT && <StudyArchitectModule />}
          {activeModule === MODULES.ANALYTICS && <AnalyticsModule />}
          {activeModule === MODULES.ADMIN && <AdminModule />}
        </React.Suspense>
      </ModuleErrorBoundary>
    );
  };
  
  if (loading) {
    return <LoadingOverlay message="Loading TrialSage platform..." />;
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-800 p-8">
        <h2 className="text-2xl font-bold mb-4">Initialization Error</h2>
        <p className="mb-4">Failed to initialize the platform.</p>
        <pre className="bg-white p-4 rounded shadow-inner text-sm overflow-auto max-w-full">
          {error}
        </pre>
        <button 
          className="mt-8 px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }
  
  if (!authenticated) {
    // In a real app, would redirect to login page
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="mb-4">Please log in to access the TrialSage platform.</p>
        <button 
          className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
          onClick={() => {
            // For demo purposes, simulate login with admin user
            securityService.login('admin', 'password').then(result => {
              if (result.success) {
                setAuthenticated(true);
                setUser(result.user);
                setOrganization(result.organization);
              }
            });
          }}
        >
          Login
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AppHeader 
        user={user} 
        organization={organization}
        onClientContextToggle={toggleClientContext}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar activeModule={activeModule} />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Client context bar (for CRO managing multiple clients) */}
          {clientContextOpen && (
            <ClientContextBar 
              organization={organization}
              onClose={() => setClientContextOpen(false)}
            />
          )}
          
          {/* Main content area */}
          <main className="flex-1 overflow-auto">
            {renderModule()}
          </main>
        </div>
        
        {/* AI Assistant Panel */}
        <AIAssistantPanel 
          isOpen={aiAssistantOpen} 
          onClose={() => setAiAssistantOpen(false)}
          activeModule={activeModule}
        />
      </div>
      
      <AppFooter />
      
      {/* Notification Center */}
      <NotificationCenter />
      
      {/* AI Assistant Button */}
      <AIAssistantButton 
        isOpen={aiAssistantOpen}
        onClick={toggleAIAssistant}
      />
    </div>
  );
};

// Unified Platform component
const UnifiedPlatform = () => {
  return (
    <UnifiedPlatformWrapper>
      <UnifiedPlatformContent />
    </UnifiedPlatformWrapper>
  );
};

export default UnifiedPlatform;