/**
 * Module Integration Layer
 * 
 * This component provides a centralized integration layer for all TrialSage modules,
 * managing shared services and state.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// Import services
import DocuShareService from '../../services/DocuShareService';
import RegulatoryIntelligenceCore from '../../services/RegulatoryIntelligenceCore';
import WorkflowService from '../../services/WorkflowService';
import SecurityService from '../../services/SecurityService';
import blockchainService from '../../services/blockchain';

// Create contexts
const IntegrationContext = createContext(null);

export const ModuleIntegrationProvider = ({ children }) => {
  // Create service instances
  const [docuShareService] = useState(new DocuShareService());
  const [regulatoryCore] = useState(new RegulatoryIntelligenceCore());
  const [workflowService] = useState(new WorkflowService());
  const [securityService] = useState(new SecurityService());
  const [blockchainInstance, setBlockchainInstance] = useState(null);
  
  // Track service initialization status
  const [servicesInitialized, setServicesInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState(null);
  
  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        console.log('Initializing TrialSage services...');
        
        // Initialize services in parallel
        await Promise.all([
          docuShareService.initialize(),
          regulatoryCore.initialize(),
          workflowService.initialize(),
          securityService.initialize()
        ]);
        
        // Initialize blockchain service separately
        const blockchain = await blockchainService.initBlockchainService();
        setBlockchainInstance(blockchain);
        
        console.log('All services initialized successfully');
        setServicesInitialized(true);
      } catch (error) {
        console.error('Error initializing services:', error);
        setInitializationError(error);
      }
    };
    
    initializeServices();
    
    // Cleanup on unmount
    return () => {
      console.log('Cleaning up services...');
      docuShareService.cleanup();
      regulatoryCore.cleanup();
      workflowService.cleanup();
      securityService.cleanup();
    };
  }, [docuShareService, regulatoryCore, workflowService, securityService]);
  
  // Create integration context value
  const integrationValue = {
    // Services
    docuShareService,
    regulatoryCore,
    workflowService,
    securityService,
    blockchainService: blockchainInstance,
    
    // Status
    servicesInitialized,
    initializationError,
    
    // Helper methods
    isAuthenticated: () => securityService.isAuthenticated(),
    getCurrentUser: () => securityService.currentUser,
    getCurrentOrganization: () => securityService.getCurrentOrganization(),
    
    // Event emitters
    emitEvent: (eventName, data) => {
      console.log(`Event emitted: ${eventName}`, data);
      // In a production app, this would use a proper event bus
    }
  };
  
  return (
    <IntegrationContext.Provider value={integrationValue}>
      {/* Loading state handling */}
      {!servicesInitialized && !initializationError ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Loading TrialSage™</h2>
            <p className="text-gray-500">Initializing platform services...</p>
          </div>
        </div>
      ) : initializationError ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="text-center max-w-md p-6">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Initialization Error</h2>
            <p className="text-gray-700 mb-4">
              An error occurred while initializing the platform services:
            </p>
            <div className="bg-red-50 p-3 rounded-md text-red-700 text-sm mb-4">
              {initializationError.message || 'Unknown error'}
            </div>
            <button 
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        // Render children once services are initialized
        children
      )}
    </IntegrationContext.Provider>
  );
};

// Hook for accessing the integration context
export const useIntegration = () => {
  const context = useContext(IntegrationContext);
  
  if (!context) {
    throw new Error('useIntegration must be used within a ModuleIntegrationProvider');
  }
  
  return context;
};

export default ModuleIntegrationProvider;