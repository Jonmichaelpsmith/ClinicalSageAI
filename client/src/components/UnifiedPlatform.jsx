/**
 * Unified Platform Component
 * 
 * This is the main container for the TrialSage platform, integrating
 * all modules and shared services.
 */

import React, { useState, useEffect } from 'react';
import AppHeader from './common/AppHeader';
import AppSidebar from './common/AppSidebar';
import ClientContextBar from './client-portal/ClientContextBar';
import AIAssistantButton from './AIAssistantButton';
import { useIntegration } from './integration/ModuleIntegrationLayer';

// Import modules
import INDWizardModule from './ind-wizard/INDWizardModule';
import TrialVaultModule from './trial-vault/TrialVaultModule';
import CSRIntelligenceModule from './csr-intelligence/CSRIntelligenceModule';

const UnifiedPlatform = () => {
  const integration = useIntegration();
  const [activeModule, setActiveModule] = useState('ind-wizard');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  
  // Available modules definition
  const modules = [
    {
      id: 'ind-wizard',
      name: 'IND Wizard™',
      description: 'Investigational New Drug Application Management'
    },
    {
      id: 'trial-vault',
      name: 'TrialSage Vault™',
      description: 'Document Management and Blockchain Verification'
    },
    {
      id: 'csr-intelligence',
      name: 'CSR Intelligence™',
      description: 'Clinical Study Report Management'
    },
    {
      id: 'study-architect',
      name: 'Study Architect™',
      description: 'Protocol Design and Statistical Planning',
      disabled: true // Not implemented yet
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'Data Visualization and Reporting',
      disabled: true // Not implemented yet
    }
  ];
  
  // Effect to handle any initialization
  useEffect(() => {
    document.title = 'TrialSage™ Platform';
  }, []);
  
  // Handle module change
  const handleModuleChange = (moduleId) => {
    setActiveModule(moduleId);
  };
  
  // Toggle AI Assistant
  const handleToggleAIAssistant = () => {
    setShowAIAssistant(!showAIAssistant);
  };
  
  // Render active module
  const renderActiveModule = () => {
    switch (activeModule) {
      case 'ind-wizard':
        return <INDWizardModule />;
      case 'trial-vault':
        return <TrialVaultModule />;
      case 'csr-intelligence':
        return <CSRIntelligenceModule />;
      case 'study-architect':
        return <div className="p-8 text-center text-gray-500">Study Architect™ module coming soon.</div>;
      case 'analytics':
        return <div className="p-8 text-center text-gray-500">Analytics module coming soon.</div>;
      default:
        return <div className="p-8 text-center text-gray-500">Module not found.</div>;
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <AppHeader onToggleAIAssistant={handleToggleAIAssistant} />
      
      {/* Organization context bar */}
      <ClientContextBar />
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AppSidebar 
          modules={modules.filter(m => !m.disabled)} 
          activeModule={activeModule} 
          onModuleChange={handleModuleChange} 
        />
        
        {/* Module content */}
        <main className="flex-1 overflow-auto">
          {renderActiveModule()}
        </main>
      </div>
      
      {/* AI Assistant */}
      {showAIAssistant && (
        <AIAssistantButton 
          onClose={handleToggleAIAssistant} 
          context={{ activeModule }}
        />
      )}
    </div>
  );
};

export default UnifiedPlatform;