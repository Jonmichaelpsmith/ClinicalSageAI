/**
 * Unified Platform Component
 * 
 * This is the main container component for the TrialSage platform,
 * integrating all modules and services in a unified interface.
 */

import React, { useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';

// Common components
import AppHeader from './common/AppHeader';
import AppSidebar from './common/AppSidebar';
import ClientContextBar from './common/ClientContextBar';
import AIAssistantButton from './AIAssistantButton';

// Module components
import INDWizardModule from './ind-wizard/INDWizardModule';
import CSRIntelligenceModule from './csr-intelligence/CSRIntelligenceModule';
import TrialVaultModule from './trial-vault/TrialVaultModule';
import StudyArchitectModule from './study-architect/StudyArchitectModule';
import AnalyticsModule from './analytics/AnalyticsModule';
import DashboardModule from './dashboard/DashboardModule';

// Not found page
import NotFoundPage from '../pages/NotFoundPage';

const UnifiedPlatform = () => {
  // Active module state
  const [activeModule, setActiveModule] = useState('dashboard');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [location] = useLocation();
  
  // Extract module from location
  React.useEffect(() => {
    const pathSegments = location.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      setActiveModule(pathSegments[0]);
    } else {
      setActiveModule('dashboard');
    }
  }, [location]);
  
  // Toggle AI Assistant
  const toggleAIAssistant = () => {
    setShowAIAssistant(!showAIAssistant);
  };
  
  // Close AI Assistant
  const closeAIAssistant = () => {
    setShowAIAssistant(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <AppHeader onToggleAIAssistant={toggleAIAssistant} />
      
      {/* Client Context Bar */}
      <ClientContextBar />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AppSidebar activeModule={activeModule} />
        
        {/* Module Content */}
        <main className="flex-1 overflow-y-auto">
          <Switch>
            <Route path="/" exact>
              <DashboardModule />
            </Route>
            
            <Route path="/ind-wizard">
              <INDWizardModule />
            </Route>
            
            <Route path="/csr-intelligence">
              <CSRIntelligenceModule />
            </Route>
            
            <Route path="/trial-vault">
              <TrialVaultModule />
            </Route>
            
            <Route path="/study-architect">
              <StudyArchitectModule />
            </Route>
            
            <Route path="/analytics">
              <AnalyticsModule />
            </Route>
            
            <Route>
              <NotFoundPage />
            </Route>
          </Switch>
        </main>
      </div>
      
      {/* AI Assistant */}
      {showAIAssistant && (
        <AIAssistantButton 
          onClose={closeAIAssistant} 
          context={{ activeModule }}
        />
      )}
    </div>
  );
};

export default UnifiedPlatform;