/**
 * Unified Platform Component
 * 
 * This component provides the core unified platform for TrialSage,
 * integrating all modules with shared navigation, context, and layouts.
 */

import React, { useState, useEffect } from 'react';
import { useIntegration } from './integration/ModuleIntegrationLayer';
import AppHeader from './common/AppHeader';
import AppSidebar from './common/AppSidebar';
import AIAssistantButton from './AIAssistantButton';
import ClientContextBar from './client-portal/ClientContextBar';
import INDWizardModule from './ind-wizard/INDWizardModule';
import TrialVaultModule from './trial-vault/TrialVaultModule';
import CSRIntelligenceModule from './csr-intelligence/CSRIntelligenceModule';

// Import module components as needed
// These will be conditionally rendered based on selected module

// Define available modules
const MODULES = {
  'ind-wizard': {
    id: 'ind-wizard',
    name: 'IND Wizard™',
    component: INDWizardModule,
    icon: 'file-text'
  },
  'trial-vault': {
    id: 'trial-vault',
    name: 'Trial Vault™',
    component: TrialVaultModule,
    icon: 'database'
  },
  'csr-intelligence': {
    id: 'csr-intelligence',
    name: 'CSR Intelligence™',
    component: CSRIntelligenceModule,
    icon: 'file-text'
  },
  'study-architect': {
    id: 'study-architect',
    name: 'Study Architect™',
    component: () => <div>Study Architect Module</div>,
    icon: 'layout'
  },
  'analytics': {
    id: 'analytics',
    name: 'Analytics',
    component: () => <div>Analytics Module</div>,
    icon: 'bar-chart'
  },
  'admin': {
    id: 'admin',
    name: 'Admin',
    component: () => <div>Admin Module</div>,
    icon: 'settings'
  }
};

const UnifiedPlatform = () => {
  const { securityService } = useIntegration();
  const [activeModule, setActiveModule] = useState('ind-wizard');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  
  // Handle module change
  const handleModuleChange = (moduleId) => {
    if (MODULES[moduleId]) {
      setActiveModule(moduleId);
    }
  };
  
  // Toggle AI assistant
  const toggleAIAssistant = () => {
    setShowAIAssistant(!showAIAssistant);
  };
  
  // Get available modules for the current user/organization
  const getAvailableModules = () => {
    return Object.values(MODULES).filter(module => 
      securityService.hasModuleAccess(module.id)
    );
  };
  
  // Render the active module component
  const renderActiveModule = () => {
    const ModuleComponent = MODULES[activeModule]?.component;
    
    if (!ModuleComponent) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Module Not Found</h2>
            <p className="text-gray-500">
              The selected module could not be found or is not accessible.
            </p>
          </div>
        </div>
      );
    }
    
    return <ModuleComponent />;
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <AppSidebar 
        modules={getAvailableModules()}
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
      />
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <AppHeader
          onToggleAIAssistant={toggleAIAssistant}
        />
        
        {/* Client context bar */}
        <ClientContextBar />
        
        {/* Module content */}
        <main className="flex-1 overflow-hidden">
          {renderActiveModule()}
        </main>
      </div>
      
      {/* AI Assistant */}
      {showAIAssistant && (
        <AIAssistantButton 
          onClose={() => setShowAIAssistant(false)}
          context={{ activeModule }}
        />
      )}
    </div>
  );
};

export default UnifiedPlatform;