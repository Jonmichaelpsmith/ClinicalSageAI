/**
 * Module Integration Layer
 * 
 * This component provides the integration layer for all TrialSage modules.
 * It initializes and provides access to shared services like document management,
 * workflow, security, and the regulatory intelligence core.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import RegulatoryIntelligenceCore from '../../services/RegulatoryIntelligenceCore';
import DocuShareService from '../../services/DocuShareService';
import WorkflowService from '../../services/WorkflowService';
import SecurityService from '../../services/SecurityService';
import { initBlockchainService } from '../../services/blockchain';

// Create context
const IntegrationContext = createContext(null);

export const ModuleIntegrationProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [services, setServices] = useState({
    regulatoryCore: null,
    docuShareService: null,
    workflowService: null,
    securityService: null,
    blockchainService: null
  });
  
  // Initialize all services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        console.log('Initializing TrialSage integration services...');
        
        // Initialize Regulatory Intelligence Core
        const regulatoryCore = new RegulatoryIntelligenceCore();
        await regulatoryCore.initialize();
        console.log('Regulatory Intelligence Core initialized');
        
        // Initialize DocuShare Service
        const docuShareService = new DocuShareService();
        await docuShareService.initialize();
        console.log('DocuShare Service initialized');
        
        // Initialize Workflow Service
        const workflowService = new WorkflowService();
        await workflowService.initialize();
        console.log('Workflow Service initialized');
        
        // Initialize Security Service
        const securityService = new SecurityService();
        await securityService.initialize();
        console.log('Security Service initialized');
        
        // Initialize Blockchain Service
        const blockchainService = await initBlockchainService();
        console.log('Blockchain Service initialized');
        
        // Set all services in state
        setServices({
          regulatoryCore,
          docuShareService,
          workflowService,
          securityService,
          blockchainService
        });
        
        setIsInitialized(true);
        console.log('All TrialSage integration services initialized successfully');
      } catch (error) {
        console.error('Error initializing TrialSage integration services:', error);
      }
    };
    
    initializeServices();
    
    // Cleanup function
    return () => {
      console.log('Cleaning up TrialSage integration services...');
      // Cleanup code for each service if needed
    };
  }, []);
  
  // If not initialized yet, show loading
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-lg text-gray-700">Initializing TrialSage™ Platform...</p>
        </div>
      </div>
    );
  }
  
  return (
    <IntegrationContext.Provider value={services}>
      {children}
    </IntegrationContext.Provider>
  );
};

// Custom hook to use the integration context
export const useIntegration = () => {
  const context = useContext(IntegrationContext);
  if (!context) {
    throw new Error('useIntegration must be used within a ModuleIntegrationProvider');
  }
  return context;
};