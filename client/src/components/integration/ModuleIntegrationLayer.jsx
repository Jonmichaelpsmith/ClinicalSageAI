/**
 * Module Integration Layer
 * 
 * This component provides seamless integration between different modules of the TrialSage platform.
 * It serves as a bridge that coordinates data flow, context sharing, and workflow transitions
 * between modules, ensuring a cohesive user experience.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import regulatoryIntelligenceCore from '../../services/RegulatoryIntelligenceCore';
import docuShareService from '../../services/DocuShareService';
import workflowService from '../../services/WorkflowService';
import securityService from '../../services/SecurityService';

// Module integration context
export const ModuleIntegrationContext = createContext(null);

// Available modules
export const MODULES = {
  IND_WIZARD: 'ind-wizard',
  TRIAL_VAULT: 'trial-vault',
  CSR_INTELLIGENCE: 'csr-intelligence',
  STUDY_ARCHITECT: 'study-architect',
  ANALYTICS: 'analytics',
  ADMIN: 'admin'
};

// Context types for cross-module sharing
export const CONTEXT_TYPES = {
  DOCUMENT: 'document',
  COLLECTION: 'collection',
  WORKFLOW: 'workflow',
  STUDY: 'study',
  SUBMISSION: 'submission',
  PRODUCT: 'product',
  SPONSOR: 'sponsor'
};

// Module integration provider
export const ModuleIntegrationProvider = ({ children }) => {
  // Service initialization state
  const [initialized, setInitialized] = useState(false);
  
  // Active module state
  const [activeModule, setActiveModule] = useState(null);
  
  // Shared context between modules
  const [sharedContext, setSharedContext] = useState({});
  
  // Cross-module workflows
  const [activeWorkflows, setActiveWorkflows] = useState([]);
  
  // Recent documents shared between modules
  const [recentDocuments, setRecentDocuments] = useState([]);
  
  // Pending tasks across modules
  const [pendingTasks, setPendingTasks] = useState([]);
  
  // Module capabilities and availability
  const [moduleCapabilities, setModuleCapabilities] = useState({});
  
  // Error state
  const [error, setError] = useState(null);
  
  // Initialize services
  useEffect(() => {
    const initServices = async () => {
      try {
        // Initialize security service first
        await securityService.initialize();
        
        // Initialize regulatory intelligence core
        await regulatoryIntelligenceCore.initialize({
          enableBlockchain: true
        });
        
        // Initialize DocuShare service
        await docuShareService.initialize({
          blockchainIntegration: true
        });
        
        // Initialize workflow service
        await workflowService.initialize();
        
        // After all services are initialized, populate module capabilities
        const availableModules = securityService.getAvailableModules();
        
        const capabilities = {};
        
        availableModules.forEach(module => {
          capabilities[module] = {
            available: true,
            canAccess: true,
            features: getModuleFeatures(module)
          };
        });
        
        setModuleCapabilities(capabilities);
        setInitialized(true);
      } catch (initError) {
        console.error('Failed to initialize module integration:', initError);
        setError(initError.message);
      }
    };
    
    initServices();
    
    // Cleanup on unmount
    return () => {
      // Clean up any subscriptions
    };
  }, []);
  
  // Load user tasks when services are initialized
  useEffect(() => {
    if (initialized) {
      refreshUserTasks();
      refreshRecentDocuments();
      refreshActiveWorkflows();
    }
  }, [initialized]);
  
  // Get module features based on module name
  const getModuleFeatures = (module) => {
    switch (module) {
      case MODULES.IND_WIZARD:
        return ['ind-preparation', 'form-templates', 'cmc-builder', 'submission-tracking'];
      
      case MODULES.TRIAL_VAULT:
        return ['document-management', 'version-control', 'search', 'audit-trail'];
      
      case MODULES.CSR_INTELLIGENCE:
        return ['csr-templates', 'auto-generation', 'data-integration', 'quality-checks'];
      
      case MODULES.STUDY_ARCHITECT:
        return ['protocol-builder', 'site-management', 'crf-designer', 'study-planning'];
      
      case MODULES.ANALYTICS:
        return ['dashboards', 'reports', 'metrics', 'predictions'];
      
      case MODULES.ADMIN:
        return ['user-management', 'organization-management', 'system-settings', 'audit-logs'];
      
      default:
        return [];
    }
  };
  
  // Refresh user tasks across modules
  const refreshUserTasks = async () => {
    try {
      const tasks = await workflowService.refreshUserTasks();
      setPendingTasks(tasks);
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    }
  };
  
  // Refresh recent documents across modules
  const refreshRecentDocuments = async () => {
    try {
      const collections = await docuShareService.getCollections();
      
      if (collections.length === 0) {
        setRecentDocuments([]);
        return;
      }
      
      const documents = [];
      
      // Get documents from first 2 collections
      for (let i = 0; i < Math.min(2, collections.length); i++) {
        try {
          const collectionDocs = await docuShareService.getSharedDocuments(collections[i].id, {
            sort: 'sharedAt:desc',
            limit: 5
          });
          
          documents.push(...collectionDocs);
        } catch (error) {
          console.warn(`Error getting documents from collection ${collections[i].id}:`, error);
        }
      }
      
      // Sort by shared date and limit to 10
      documents.sort((a, b) => new Date(b.sharedAt) - new Date(a.sharedAt));
      setRecentDocuments(documents.slice(0, 10));
    } catch (error) {
      console.error('Error refreshing recent documents:', error);
    }
  };
  
  // Refresh active workflows across modules
  const refreshActiveWorkflows = async () => {
    try {
      // In a real implementation, would fetch from API
      // For now, use cached workflows
      const workflowArray = Array.from(workflowService.workflows.values())
        .filter(w => w.status === 'in_progress')
        .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
      
      setActiveWorkflows(workflowArray);
    } catch (error) {
      console.error('Error refreshing active workflows:', error);
    }
  };
  
  /**
   * Set the active module
   * @param {string} module - Module name
   * @param {Object} options - Module options
   */
  const switchActiveModule = (module, options = {}) => {
    if (!moduleCapabilities[module]?.available) {
      setError(`Module ${module} is not available`);
      return false;
    }
    
    // Update active module
    setActiveModule(module);
    
    // Update shared context with module-specific information
    setSharedContext(prevContext => ({
      ...prevContext,
      activeModule: module,
      lastModuleSwitch: new Date().toISOString(),
      switchOptions: options
    }));
    
    return true;
  };
  
  /**
   * Share context between modules
   * @param {string} contextType - Context type
   * @param {string} contextId - Context ID
   * @param {Object} contextData - Context data
   * @param {Object} options - Sharing options
   */
  const shareContext = (contextType, contextId, contextData, options = {}) => {
    if (!contextType || !contextId) {
      console.warn('Invalid context parameters:', { contextType, contextId });
      return false;
    }
    
    // Update shared context
    setSharedContext(prevContext => ({
      ...prevContext,
      [contextType]: {
        ...prevContext[contextType],
        [contextId]: {
          ...contextData,
          updatedAt: new Date().toISOString(),
          sourceModule: activeModule || options.sourceModule
        }
      }
    }));
    
    return true;
  };
  
  /**
   * Get shared context
   * @param {string} contextType - Context type
   * @param {string} contextId - Context ID
   * @returns {Object|null} - Context data or null if not found
   */
  const getSharedContext = (contextType, contextId) => {
    if (!contextType) {
      return sharedContext;
    }
    
    if (!contextId) {
      return sharedContext[contextType] || null;
    }
    
    return sharedContext[contextType]?.[contextId] || null;
  };
  
  /**
   * Clear shared context
   * @param {string} contextType - Context type (optional, clears all if not provided)
   * @param {string} contextId - Context ID (optional, clears entire type if not provided)
   */
  const clearContext = (contextType, contextId) => {
    if (!contextType) {
      // Clear all context
      setSharedContext({
        activeModule
      });
      return;
    }
    
    if (!contextId) {
      // Clear entire context type
      setSharedContext(prevContext => {
        const newContext = { ...prevContext };
        delete newContext[contextType];
        return newContext;
      });
      return;
    }
    
    // Clear specific context ID
    setSharedContext(prevContext => {
      if (!prevContext[contextType] || !prevContext[contextType][contextId]) {
        return prevContext;
      }
      
      const newTypeContext = { ...prevContext[contextType] };
      delete newTypeContext[contextId];
      
      return {
        ...prevContext,
        [contextType]: newTypeContext
      };
    });
  };
  
  /**
   * Start cross-module workflow
   * @param {string} templateId - Workflow template ID
   * @param {Object} context - Workflow context
   * @param {Object} options - Workflow options
   * @returns {Promise<Object>} - Started workflow
   */
  const startCrossModuleWorkflow = async (templateId, context = {}, options = {}) => {
    try {
      // Start workflow
      const workflow = await workflowService.startWorkflow(templateId, {
        ...context,
        sourceModule: activeModule || options.sourceModule
      }, options);
      
      // Refresh workflows and tasks
      refreshActiveWorkflows();
      refreshUserTasks();
      
      return workflow;
    } catch (error) {
      console.error(`Error starting workflow ${templateId}:`, error);
      setError(error.message);
      throw error;
    }
  };
  
  /**
   * Get regulatory insights for a context
   * @param {string} contextType - Context type
   * @param {string} contextId - Context ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Regulatory insights
   */
  const getRegulatoryInsights = async (contextType, contextId, options = {}) => {
    try {
      return await regulatoryIntelligenceCore.getRegulatoryInsights(contextType, contextId, options);
    } catch (error) {
      console.error(`Error getting regulatory insights for ${contextType}:${contextId}:`, error);
      setError(error.message);
      throw error;
    }
  };
  
  /**
   * Share document between modules
   * @param {Object} document - Document to share
   * @param {string} targetModule - Target module
   * @param {Object} options - Sharing options
   * @returns {Promise<Object>} - Shared document
   */
  const shareDocument = async (document, targetModule, options = {}) => {
    try {
      // Get or create collection for target module
      let collection;
      
      const collections = await docuShareService.getCollections({
        module: targetModule
      });
      
      if (collections.length > 0) {
        // Use existing collection
        collection = collections[0];
      } else {
        // Create new collection
        collection = await docuShareService.createCollection(
          `${targetModule.toUpperCase()} Documents`,
          targetModule
        );
      }
      
      // Share document to collection
      const sharedDocument = await docuShareService.shareDocument(document, collection.id, {
        sourceModule: activeModule || options.sourceModule
      });
      
      // Refresh documents
      refreshRecentDocuments();
      
      return sharedDocument;
    } catch (error) {
      console.error(`Error sharing document to ${targetModule}:`, error);
      setError(error.message);
      throw error;
    }
  };
  
  /**
   * Handle transition completion (e.g., after a module finishes a task)
   * @param {string} transitionType - Transition type
   * @param {Object} data - Transition data
   */
  const completeTransition = (transitionType, data) => {
    // This would handle actions to take when a workflow/task stage is completed
    // For example, sending data to another module or triggering a new workflow
    console.log(`Transition completed: ${transitionType}`, data);
    
    // Refresh data
    refreshUserTasks();
    refreshRecentDocuments();
    refreshActiveWorkflows();
  };
  
  /**
   * Process cross-module action
   * @param {string} action - Action name
   * @param {Object} data - Action data
   */
  const processAction = (action, data) => {
    switch (action) {
      case 'switch_module':
        return switchActiveModule(data.module, data.options);
      
      case 'share_context':
        return shareContext(data.contextType, data.contextId, data.contextData, data.options);
      
      case 'start_workflow':
        return startCrossModuleWorkflow(data.templateId, data.context, data.options);
      
      case 'share_document':
        return shareDocument(data.document, data.targetModule, data.options);
      
      case 'complete_transition':
        return completeTransition(data.transitionType, data.data);
      
      default:
        console.warn(`Unknown action: ${action}`);
        return false;
    }
  };
  
  // Create context value
  const contextValue = {
    activeModule,
    sharedContext,
    switchActiveModule,
    shareContext,
    getSharedContext,
    clearContext,
    startCrossModuleWorkflow,
    getRegulatoryInsights,
    shareDocument,
    completeTransition,
    processAction,
    recentDocuments,
    pendingTasks,
    activeWorkflows,
    moduleCapabilities,
    refreshTasks: refreshUserTasks,
    refreshDocuments: refreshRecentDocuments,
    refreshWorkflows: refreshActiveWorkflows,
    initialized,
    error
  };
  
  return (
    <ModuleIntegrationContext.Provider value={contextValue}>
      {children}
    </ModuleIntegrationContext.Provider>
  );
};

// Custom hook for using the module integration context
export const useModuleIntegration = () => {
  const context = useContext(ModuleIntegrationContext);
  
  if (!context) {
    throw new Error('useModuleIntegration must be used within a ModuleIntegrationProvider');
  }
  
  return context;
};

// Module integration layer component
const ModuleIntegrationLayer = ({ children }) => {
  return (
    <ModuleIntegrationProvider>
      {children}
    </ModuleIntegrationProvider>
  );
};

export default ModuleIntegrationLayer;