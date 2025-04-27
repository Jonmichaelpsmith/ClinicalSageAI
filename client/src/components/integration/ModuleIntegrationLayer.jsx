/**
 * Module Integration Layer
 * 
 * This component provides a context provider for module integration,
 * allowing modules to communicate and share data throughout the platform.
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import { RegulatoryIntelligenceCore } from '../../services/RegulatoryIntelligenceCore';
import { BlockchainService } from '../../services/blockchain';
import DocuShareService from '../../services/DocuShareService';
import WorkflowService from '../../services/WorkflowService';
import securityService from '../../services/SecurityService';

// Create integration context
export const IntegrationContext = createContext({
  // Module data sharing
  sharedData: {},
  setSharedData: () => {},
  
  // Module communication
  notifyModule: () => {},
  registerModuleListener: () => {},
  
  // Cross-module document handling
  documentCache: {},
  cacheDocument: () => {},
  retrieveDocument: () => {},
  
  // Workflow coordination
  triggerWorkflow: () => {},
  
  // Security context
  currentUser: null,
  currentOrganization: null,
  
  // Services access
  regulatoryCore: null,
  blockchainService: null,
  docuShareService: null,
  workflowService: null,
  
  // Module registry
  registeredModules: [],
  registerModule: () => {},
  
  // Global platform state
  platformReady: false,
  platformState: 'initializing',
});

// Hook for using integration context
export const useIntegration = () => useContext(IntegrationContext);

// Integration Layer Component
const ModuleIntegrationLayer = ({ children }) => {
  // Shared data storage between modules
  const [sharedData, setSharedData] = useState({});
  
  // Module event listeners
  const [moduleListeners, setModuleListeners] = useState({});
  
  // Document cache for sharing documents between modules
  const [documentCache, setDocumentCache] = useState({});
  
  // Registered modules for cross-module communication
  const [registeredModules, setRegisteredModules] = useState([]);
  
  // Global platform state
  const [platformState, setPlatformState] = useState('initializing');
  const [platformReady, setPlatformReady] = useState(false);
  
  // Services initialization
  const [services, setServices] = useState({
    regulatoryCore: null,
    blockchainService: null,
    docuShareService: null,
    workflowService: null
  });
  
  // Initialize services when component mounts
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize regulatory intelligence core
        const regulatoryCore = RegulatoryIntelligenceCore.getInstance();
        await regulatoryCore.initialize();
        
        // Initialize blockchain service
        const blockchainService = new BlockchainService();
        await blockchainService.initialize();
        
        // Initialize document sharing service
        const docuShareService = new DocuShareService();
        await docuShareService.initialize();
        
        // Initialize workflow service
        const workflowService = new WorkflowService();
        await workflowService.initialize();
        
        setServices({
          regulatoryCore,
          blockchainService,
          docuShareService,
          workflowService
        });
        
        setPlatformState('ready');
        setPlatformReady(true);
      } catch (error) {
        console.error('Error initializing integration layer services:', error);
        setPlatformState('error');
      }
    };
    
    initializeServices();
    
    // Cleanup function
    return () => {
      console.log('Cleaning up integration layer...');
      
      // Cleanup would include service disposal if needed
      if (services.blockchainService) {
        services.blockchainService.dispose();
      }
    };
  }, []);
  
  // Update shared data with new data (merging with existing)
  const updateSharedData = (newData) => {
    setSharedData(prev => ({ ...prev, ...newData }));
  };
  
  // Notify a specific module or all modules with an event
  const notifyModule = (moduleId, eventType, eventData) => {
    console.log(`[IntegrationLayer] Notifying module: ${moduleId}, event: ${eventType}`);
    
    // If moduleId is "all", notify all modules
    if (moduleId === 'all') {
      Object.keys(moduleListeners).forEach(id => {
        moduleListeners[id].forEach(listener => {
          if (listener.eventType === eventType || listener.eventType === 'all') {
            listener.callback(eventData);
          }
        });
      });
      return;
    }
    
    // Notify specific module
    if (moduleListeners[moduleId]) {
      moduleListeners[moduleId].forEach(listener => {
        if (listener.eventType === eventType || listener.eventType === 'all') {
          listener.callback(eventData);
        }
      });
    }
  };
  
  // Register a module to listen for events
  const registerModuleListener = (moduleId, eventType, callback) => {
    console.log(`[IntegrationLayer] Registering listener for module: ${moduleId}, event: ${eventType}`);
    
    setModuleListeners(prev => {
      const moduleEvents = prev[moduleId] || [];
      return {
        ...prev,
        [moduleId]: [
          ...moduleEvents,
          { eventType, callback, id: Date.now() }
        ]
      };
    });
    
    // Return unsubscribe function
    return () => {
      setModuleListeners(prev => {
        const moduleEvents = prev[moduleId] || [];
        return {
          ...prev,
          [moduleId]: moduleEvents.filter(listener => 
            !(listener.eventType === eventType && listener.callback === callback)
          )
        };
      });
    };
  };
  
  // Cache a document for sharing between modules
  const cacheDocument = (documentId, document) => {
    setDocumentCache(prev => ({
      ...prev,
      [documentId]: {
        document,
        timestamp: new Date().toISOString()
      }
    }));
  };
  
  // Retrieve a document from cache
  const retrieveDocument = (documentId) => {
    return documentCache[documentId]?.document;
  };
  
  // Trigger a workflow across modules
  const triggerWorkflow = async (workflowId, workflowData) => {
    if (!services.workflowService) {
      console.error('[IntegrationLayer] Workflow service not initialized');
      return false;
    }
    
    try {
      // Start the workflow
      const workflowResult = await services.workflowService.startWorkflow(
        workflowId, 
        workflowData
      );
      
      // Notify all modules about the workflow
      notifyModule('all', 'workflow_started', {
        workflowId,
        workflowData,
        workflowResult
      });
      
      return workflowResult;
    } catch (error) {
      console.error('[IntegrationLayer] Error triggering workflow:', error);
      return false;
    }
  };
  
  // Register a module with the integration layer
  const registerModule = (moduleId, moduleMeta) => {
    console.log(`[IntegrationLayer] Registering module: ${moduleId}`);
    
    // Check if module is already registered
    if (registeredModules.some(m => m.id === moduleId)) {
      console.warn(`[IntegrationLayer] Module ${moduleId} already registered`);
      return;
    }
    
    // Add module to registry
    setRegisteredModules(prev => [
      ...prev,
      {
        id: moduleId,
        meta: moduleMeta,
        registeredAt: new Date().toISOString()
      }
    ]);
    
    // Notify other modules about the new module
    notifyModule('all', 'module_registered', {
      moduleId,
      moduleMeta
    });
  };
  
  // Define context value
  const contextValue = {
    // Module data sharing
    sharedData,
    setSharedData: updateSharedData,
    
    // Module communication
    notifyModule,
    registerModuleListener,
    
    // Cross-module document handling
    documentCache,
    cacheDocument,
    retrieveDocument,
    
    // Workflow coordination
    triggerWorkflow,
    
    // Security context
    currentUser: securityService.currentUser,
    currentOrganization: securityService.currentOrganization,
    
    // Services access
    regulatoryCore: services.regulatoryCore,
    blockchainService: services.blockchainService,
    docuShareService: services.docuShareService,
    workflowService: services.workflowService,
    
    // Module registry
    registeredModules,
    registerModule,
    
    // Global platform state
    platformReady,
    platformState,
  };
  
  return (
    <IntegrationContext.Provider value={contextValue}>
      {children}
    </IntegrationContext.Provider>
  );
};

export default ModuleIntegrationLayer;