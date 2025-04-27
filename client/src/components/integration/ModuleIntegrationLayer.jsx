/**
 * Module Integration Layer
 * 
 * This component provides a shared context for all modules in the TrialSage platform,
 * enabling seamless integration and data sharing between modules.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import securityService from '../../services/SecurityService';
import docuShareService from '../../services/DocuShareService';
import workflowService from '../../services/WorkflowService';
import { RegulatoryIntelligenceCore } from '../../services/RegulatoryIntelligenceCore';

// Create context for module integration
const ModuleIntegrationContext = createContext();

// Integration provider component
export const ModuleIntegrationProvider = ({ children }) => {
  const [sharedContext, setSharedContext] = useState({
    currentOrganization: null,
    currentUser: null,
    activeStudies: [],
    recentDocuments: [],
    settings: {},
  });
  
  const [regulatoryUpdates, setRegulatoryUpdates] = useState([]);
  const [docuShareStatus, setDocuShareStatus] = useState({ connected: false, status: 'initializing' });
  const [workflowStatus, setWorkflowStatus] = useState({ active: false, status: 'initializing' });
  
  // Initialize the integration layer
  useEffect(() => {
    // Get current user and organization
    const currentUser = securityService.currentUser;
    const currentOrganization = securityService.currentOrganization;
    
    // Initialize shared context with user and organization
    setSharedContext(prev => ({
      ...prev,
      currentUser,
      currentOrganization,
    }));
    
    // Initialize DocuShare service
    docuShareService.initialize()
      .then(() => {
        setDocuShareStatus({ connected: true, status: 'connected' });
      })
      .catch((error) => {
        console.error('DocuShare initialization error:', error);
        setDocuShareStatus({ connected: false, status: 'error', error });
      });
    
    // Initialize Workflow service
    workflowService.initialize()
      .then(() => {
        setWorkflowStatus({ active: true, status: 'active' });
      })
      .catch((error) => {
        console.error('Workflow initialization error:', error);
        setWorkflowStatus({ active: false, status: 'error', error });
      });
    
    // Subscribe to regulatory intelligence updates
    const regulatoryCore = RegulatoryIntelligenceCore.getInstance();
    
    const regulatorySubscription = regulatoryCore.subscribeToUpdates((updates) => {
      setRegulatoryUpdates(updates);
    });
    
    // Cleanup subscriptions on unmount
    return () => {
      regulatorySubscription.unsubscribe();
      docuShareService.disconnect();
      workflowService.disconnect();
    };
  }, []);
  
  // Method to get shared context for modules
  const getSharedContext = () => {
    return sharedContext;
  };
  
  // Method to update shared context
  const updateSharedContext = (partialContext) => {
    setSharedContext(prev => ({
      ...prev,
      ...partialContext,
    }));
  };
  
  // Method to get regulatory updates
  const getRegulatoryUpdates = () => {
    return regulatoryUpdates;
  };
  
  // Share document between modules
  const shareDocument = async (document, sourceModule, targetModule) => {
    try {
      // Use DocuShare service to share document
      const result = await docuShareService.shareDocument({
        document,
        sourceModule,
        targetModule,
        user: sharedContext.currentUser,
        organization: sharedContext.currentOrganization,
      });
      
      // Update shared context with recent documents
      updateSharedContext({
        recentDocuments: [
          result.document,
          ...sharedContext.recentDocuments.filter(doc => doc.id !== result.document.id).slice(0, 9)
        ]
      });
      
      return result;
    } catch (error) {
      console.error('Error sharing document:', error);
      throw error;
    }
  };
  
  // Create a new workflow
  const createWorkflow = async (workflowData) => {
    try {
      const result = await workflowService.createWorkflow({
        ...workflowData,
        user: sharedContext.currentUser,
        organization: sharedContext.currentOrganization,
      });
      
      return result;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  };
  
  // Value to be provided to consumers
  const value = {
    getSharedContext,
    updateSharedContext,
    getRegulatoryUpdates,
    shareDocument,
    createWorkflow,
    docuShareStatus,
    workflowStatus,
  };
  
  return (
    <ModuleIntegrationContext.Provider value={value}>
      {children}
    </ModuleIntegrationContext.Provider>
  );
};

// Hook for using the module integration context
export const useModuleIntegration = () => {
  const context = useContext(ModuleIntegrationContext);
  
  if (!context) {
    throw new Error('useModuleIntegration must be used within a ModuleIntegrationProvider');
  }
  
  return context;
};