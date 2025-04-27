/**
 * Unified Platform
 * 
 * This component provides the main shell for the TrialSage platform with standardized 
 * layout, header, sidebar, and module loading.
 */

import React, { useState, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import AppHeader from './common/AppHeader';
import AppSidebar from './common/AppSidebar';
import { ClientContextBar } from './client-portal/ClientContextBar';
import AIAssistantButton from './AIAssistantButton';
import ModuleIntegrationLayer from './integration/ModuleIntegrationLayer';
import securityService from '../services/SecurityService';
import { RegulatoryIntelligenceCore } from '../services/RegulatoryIntelligenceCore';
import { BlockchainService } from '../services/blockchain';

// Module components (lazy loaded in a real implementation)
import INDWizardModule from './ind-wizard/INDWizardModule';
import TrialVaultModule from './trial-vault/TrialVaultModule';
import CSRIntelligenceModule from './csr-intelligence/CSRIntelligenceModule';
import StudyArchitectModule from './study-architect/StudyArchitectModule';
import AnalyticsModule from './analytics/AnalyticsModule';
import AdminModule from './admin/AdminModule';

const UnifiedPlatform = () => {
  const [location, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeModule, setActiveModule] = useState('home');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        setIsInitializing(true);
        
        // Initialize the user (in a real app, retrieve from API or local storage)
        const isLoggedIn = localStorage.getItem("authenticated") === "true";
        setIsAuthenticated(isLoggedIn);
        
        // If not logged in, redirect to login page
        if (!isLoggedIn && !location.startsWith('/auth')) {
          setLocation('/auth');
          setIsInitializing(false);
          return;
        }
        
        // Initialize regulatory intelligence core
        const regulatoryCore = RegulatoryIntelligenceCore.getInstance();
        await regulatoryCore.initialize();
        
        // Initialize blockchain service
        const blockchainService = new BlockchainService();
        await blockchainService.initialize();
        
        setIsInitializing(false);
      } catch (error) {
        console.error('Error initializing platform services:', error);
        setIsInitializing(false);
      }
    };
    
    initializeServices();
  }, [location, setLocation]);
  
  // Update active module based on location
  useEffect(() => {
    if (location === '/' || location === '') {
      setActiveModule('home');
    } else if (location.startsWith('/ind-wizard')) {
      setActiveModule('ind-wizard');
    } else if (location.startsWith('/trial-vault')) {
      setActiveModule('trial-vault');
    } else if (location.startsWith('/csr-intelligence')) {
      setActiveModule('csr-intelligence');
    } else if (location.startsWith('/study-architect')) {
      setActiveModule('study-architect');
    } else if (location.startsWith('/analytics')) {
      setActiveModule('analytics');
    } else if (location.startsWith('/admin')) {
      setActiveModule('admin');
    } else if (location.startsWith('/settings')) {
      setActiveModule('settings');
    }
  }, [location]);
  
  // Handle sidebar toggle
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // If not authenticated, show loading or redirect
  if (!isAuthenticated && !location.startsWith('/auth')) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-lg">Initializing TrialSage™ Platform...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col">
      {/* Context bar for CRO users (top bar for organization switching) */}
      <ClientContextBar />
      
      {/* Header */}
      <AppHeader toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AppSidebar isOpen={isSidebarOpen} activeModule={activeModule} />
        
        {/* Main content with module integration */}
        <main 
          className={`flex-1 overflow-auto transition-all duration-300 ${
            isSidebarOpen ? 'md:ml-64' : 'ml-0 md:ml-16'
          }`}
        >
          {/* Module integration layer provides shared context for all modules */}
          <ModuleIntegrationLayer>
            <Switch>
              <Route path="/" component={() => <HomeDashboard />} />
              
              <Route path="/ind-wizard">
                <INDWizardModule />
              </Route>
              
              <Route path="/trial-vault">
                <TrialVaultModule />
              </Route>
              
              <Route path="/csr-intelligence">
                <CSRIntelligenceModule />
              </Route>
              
              <Route path="/study-architect">
                <StudyArchitectModule />
              </Route>
              
              <Route path="/analytics">
                <AnalyticsModule />
              </Route>
              
              <Route path="/admin">
                <AdminModule />
              </Route>
              
              <Route path="/settings">
                <SettingsPage />
              </Route>
              
              <Route>
                <NotFoundPage />
              </Route>
            </Switch>
          </ModuleIntegrationLayer>
        </main>
      </div>
      
      {/* AI Assistant Button (fixed position) */}
      <AIAssistantButton />
    </div>
  );
};

// Placeholder components for routes that don't have dedicated modules yet
const HomeDashboard = () => (
  <div className="container mx-auto p-6">
    <h1 className="text-3xl font-bold mb-8">TrialSage™ Platform</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ModuleCard 
        title="IND Wizard™" 
        description="Prepare submissions for Investigational New Drug applications with AI-assisted form filling and document generation."
        path="/ind-wizard"
        icon={<svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
      />
      
      <ModuleCard 
        title="Trial Vault™" 
        description="Securely store, manage, and share clinical and regulatory documents with blockchain verification."
        path="/trial-vault"
        icon={<svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
      />
      
      <ModuleCard 
        title="CSR Intelligence™" 
        description="Generate and manage Clinical Study Reports with AI assistance and ICH compliance checking."
        path="/csr-intelligence"
        icon={<svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
      />
      
      <ModuleCard 
        title="Study Architect™" 
        description="Design clinical trials with AI-guided protocol development and study planning."
        path="/study-architect"
        icon={<svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
      />
      
      <ModuleCard 
        title="Analytics" 
        description="Visualize and analyze data across your clinical and regulatory programs."
        path="/analytics"
        icon={<svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
      />
      
      <ModuleCard 
        title="Administration" 
        description="Manage users, permissions, and platform settings."
        path="/admin"
        icon={<svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>}
      />
    </div>
  </div>
);

const ModuleCard = ({ title, description, path, icon }) => {
  const [, setLocation] = useLocation();
  
  return (
    <div 
      className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
      onClick={() => setLocation(path)}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <button
          className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setLocation(path);
          }}
        >
          Launch Module
        </button>
      </div>
    </div>
  );
};

const SettingsPage = () => (
  <div className="container mx-auto p-6">
    <h1 className="text-3xl font-bold mb-6">Settings</h1>
    <p>Platform settings page (under development)</p>
  </div>
);

const NotFoundPage = () => (
  <div className="container mx-auto p-6 text-center">
    <h1 className="text-3xl font-bold mb-6">404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
  </div>
);

export default UnifiedPlatform;