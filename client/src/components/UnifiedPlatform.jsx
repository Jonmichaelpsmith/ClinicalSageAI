/**
 * Unified Platform Component
 * 
 * This component serves as the main wrapper for the TrialSage platform,
 * integrating all modules and shared UI elements.
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useIntegration } from './integration/ModuleIntegrationLayer';

// Common components
import AppHeader from './common/AppHeader';
import AppSidebar from './common/AppSidebar';
import AIAssistantButton from './AIAssistantButton';
import ClientContextBar from './client-portal/ClientContextBar';

// Module components
import INDWizardModule from './ind-wizard/INDWizardModule';
import TrialVaultModule from './trial-vault/TrialVaultModule';
import CSRIntelligenceModule from './csr-intelligence/CSRIntelligenceModule';
import StudyArchitectModule from './study-architect/StudyArchitectModule';
import AnalyticsModule from './analytics/AnalyticsModule';

const UnifiedPlatform = () => {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, getCurrentUser } = useIntegration();
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  
  // Available modules
  const [modules] = useState([
    { id: 'ind-wizard', name: 'IND Wizard™', disabled: false },
    { id: 'trial-vault', name: 'TrialSage Vault™', disabled: false },
    { id: 'csr-intelligence', name: 'CSR Intelligence™', disabled: false },
    { id: 'study-architect', name: 'Study Architect™', disabled: false },
    { id: 'analytics', name: 'Analytics', disabled: false }
  ]);
  
  // Active module state
  const [activeModule, setActiveModule] = useState('ind-wizard');
  
  // Authentication check
  useEffect(() => {
    if (!isAuthenticated()) {
      setLocation('/auth');
    }
  }, [isAuthenticated, setLocation]);
  
  // Toggle AI assistant
  const toggleAIAssistant = () => {
    setShowAIAssistant(!showAIAssistant);
  };
  
  // Handle module change
  const handleModuleChange = (moduleId) => {
    setActiveModule(moduleId);
  };
  
  // Render active module component
  const renderActiveModule = () => {
    switch (activeModule) {
      case 'ind-wizard':
        return <INDWizardModule />;
      case 'trial-vault':
        return <TrialVaultModule />;
      case 'csr-intelligence':
        return <CSRIntelligenceModule />;
      case 'study-architect':
        return <StudyArchitectModule />;
      case 'analytics':
        return <AnalyticsModule />;
      default:
        return <INDWizardModule />;
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Client context bar */}
      <ClientContextBar />
      
      {/* Main header */}
      <AppHeader onToggleAIAssistant={toggleAIAssistant} />
      
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AppSidebar 
          modules={modules} 
          activeModule={activeModule} 
          onModuleChange={handleModuleChange} 
        />
        
        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {renderActiveModule()}
        </div>
      </div>
      
      {/* AI Assistant */}
      {showAIAssistant && (
        <AIAssistantButton 
          onClose={toggleAIAssistant} 
          context={{ activeModule }}
        />
      )}
    </div>
  );
};

export default UnifiedPlatform;