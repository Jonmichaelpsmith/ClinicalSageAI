/**
 * Module Integration Layer
 * 
 * This component provides a comprehensive integration layer for connecting all TrialSage modules,
 * enabling seamless data flow, cross-module workflows, shared context, and unified user experience.
 * 
 * It serves as the central nervous system for the platform, connecting the AI-powered intelligence core
 * with all frontend modules and shared services.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useToast } from "@/hooks/use-toast";

// Core services
import regulatoryIntelligenceCore from '@/services/RegulatoryIntelligenceCore';
import docuShareService from '@/services/DocuShareService';
import mashableService from '@/services/MashableService';
import workflowService from '@/services/WorkflowService';
import securityService from '@/services/SecurityService';

// Notification components
import { Toaster } from "@/components/ui/toaster";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Context type
export const ModuleIntegrationContext = createContext({
  // Active module
  activeModule: null,
  setActiveModule: () => {},
  
  // Cross-module context
  crossModuleContext: {},
  updateCrossModuleContext: () => {},
  
  // Resource sharing
  shareResource: () => {},
  getSharedResource: () => {},
  
  // Workflow integration
  startCrossModuleWorkflow: () => {},
  getCrossModuleTasksCount: () => 0,
  
  // Intelligence integration
  getIntelligenceInsights: () => {},
  
  // Security integration
  hasPermission: () => false,
  
  // Module navigation
  navigateToModule: () => {},
  
  // Data synchronization
  syncModuleData: () => {},
  
  // Service instances
  services: {
    intelligence: null,
    docuShare: null,
    mashable: null,
    workflow: null,
    security: null
  },
  
  // Integration status
  isInitialized: false,
  modulesStatus: {},
  
  // Client context (for CRO users)
  clientContext: null,
  switchClient: () => {}
});

// Available modules
export const MODULES = {
  IND_WIZARD: 'ind-wizard',
  CSR_INTELLIGENCE: 'csr-intelligence',
  TRIAL_VAULT: 'trial-vault',
  STUDY_ARCHITECT: 'study-architect',
  ICH_WIZ: 'ich-wiz',
  CLINICAL_METADATA: 'clinical-metadata',
  ANALYTICS: 'analytics',
  ADMIN: 'admin',
  CLIENT_PORTAL: 'client-portal'
};

// Module routes
const MODULE_ROUTES = {
  [MODULES.IND_WIZARD]: '/ind-wizard',
  [MODULES.CSR_INTELLIGENCE]: '/csr-intelligence',
  [MODULES.TRIAL_VAULT]: '/vault',
  [MODULES.STUDY_ARCHITECT]: '/study-architect',
  [MODULES.ICH_WIZ]: '/ich-wiz',
  [MODULES.CLINICAL_METADATA]: '/clinical-metadata',
  [MODULES.ANALYTICS]: '/analytics',
  [MODULES.ADMIN]: '/admin',
  [MODULES.CLIENT_PORTAL]: '/client-portal'
};

// Module display names
export const MODULE_NAMES = {
  [MODULES.IND_WIZARD]: 'IND Wizard™',
  [MODULES.CSR_INTELLIGENCE]: 'CSR Intelligence™',
  [MODULES.TRIAL_VAULT]: 'TrialSage Vault™',
  [MODULES.STUDY_ARCHITECT]: 'Study Architect™',
  [MODULES.ICH_WIZ]: 'ICH Wiz',
  [MODULES.CLINICAL_METADATA]: 'Clinical Metadata Repository',
  [MODULES.ANALYTICS]: 'Analytics',
  [MODULES.ADMIN]: 'Administration',
  [MODULES.CLIENT_PORTAL]: 'Client Portal'
};

/**
 * Module Integration Layer Component
 * 
 * Provides a context provider for all TrialSage modules to interact with each other.
 */
export const ModuleIntegrationLayer = ({ children }) => {
  // State management
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModule, setActiveModule] = useState(null);
  const [crossModuleContext, setCrossModuleContext] = useState({});
  const [modulesStatus, setModulesStatus] = useState({});
  const [sharedResources, setSharedResources] = useState({});
  const [clientContext, setClientContext] = useState(null);
  const [alertDialog, setAlertDialog] = useState({ open: false, data: {} });
  
  // Hook integrations
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  
  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        setIsLoading(true);
        
        // Initialize security service first
        await securityService.initialize();
        
        // Initialize other services in parallel
        await Promise.all([
          regulatoryIntelligenceCore.initialize(),
          docuShareService.initialize(),
          mashableService.initialize(),
          workflowService.initialize()
        ]);
        
        // Get client context if available
        if (securityService.clientContext) {
          setClientContext(securityService.clientContext);
        }
        
        // Determine active module from route
        const module = determineActiveModuleFromRoute();
        setActiveModule(module);
        
        // Check module statuses
        await checkModulesStatus();
        
        setIsInitialized(true);
        setIsLoading(false);
        
        console.log('ModuleIntegrationLayer initialized successfully');
      } catch (error) {
        console.error('Failed to initialize ModuleIntegrationLayer:', error);
        
        toast({
          title: "Integration Layer Error",
          description: "Failed to initialize platform integration services. Some features may be unavailable.",
          variant: "destructive"
        });
        
        setIsLoading(false);
      }
    };
    
    initializeServices();
  }, []);
  
  // Update active module when route changes
  useEffect(() => {
    if (isInitialized) {
      const module = determineActiveModuleFromRoute();
      setActiveModule(module);
    }
  }, [location, isInitialized]);
  
  // Set up event listeners for cross-module communication
  useEffect(() => {
    if (!isInitialized) return;
    
    // Listen for workflow assignments
    window.addEventListener('task-assigned', handleTaskAssigned);
    window.addEventListener('workflow-completed', handleWorkflowCompleted);
    
    // Listen for security events
    window.addEventListener('security-alert', handleSecurityAlert);
    
    // Listen for module data updates
    window.addEventListener('module-data-updated', handleModuleDataUpdated);
    
    // Listen for client context changes (CRO switching clients)
    window.addEventListener('client-context-changed', handleClientContextChanged);
    
    return () => {
      window.removeEventListener('task-assigned', handleTaskAssigned);
      window.removeEventListener('workflow-completed', handleWorkflowCompleted);
      window.removeEventListener('security-alert', handleSecurityAlert);
      window.removeEventListener('module-data-updated', handleModuleDataUpdated);
      window.removeEventListener('client-context-changed', handleClientContextChanged);
    };
  }, [isInitialized]);
  
  /**
   * Determine the active module from the current route
   * @returns {string|null} - Active module code
   */
  const determineActiveModuleFromRoute = () => {
    const path = location.split('/')[1] || '';
    
    // Map path to module
    for (const [moduleCode, modulePath] of Object.entries(MODULE_ROUTES)) {
      const routePath = modulePath.replace('/', '');
      if (path === routePath) {
        return moduleCode;
      }
    }
    
    // Handle root path or unknown paths
    if (path === '') {
      return null; // Landing page
    }
    
    return null;
  };
  
  /**
   * Check the status of all modules
   */
  const checkModulesStatus = async () => {
    try {
      // This would ideally call an API to check module health
      // For now, we'll simulate with a mock status
      const status = {
        [MODULES.IND_WIZARD]: { available: true, initialized: true },
        [MODULES.CSR_INTELLIGENCE]: { available: true, initialized: true },
        [MODULES.TRIAL_VAULT]: { available: true, initialized: true },
        [MODULES.STUDY_ARCHITECT]: { available: true, initialized: true },
        [MODULES.ICH_WIZ]: { available: true, initialized: true },
        [MODULES.CLINICAL_METADATA]: { available: true, initialized: true },
        [MODULES.ANALYTICS]: { available: true, initialized: true },
        [MODULES.ADMIN]: { available: true, initialized: true },
        [MODULES.CLIENT_PORTAL]: { available: true, initialized: true }
      };
      
      setModulesStatus(status);
    } catch (error) {
      console.error('Failed to check modules status:', error);
    }
  };
  
  /**
   * Update the cross-module context
   * @param {Object} updates - Context updates 
   */
  const updateCrossModuleContext = (updates) => {
    setCrossModuleContext(prevContext => ({
      ...prevContext,
      ...updates
    }));
  };
  
  /**
   * Share a resource across modules
   * @param {string} resourceType - Resource type
   * @param {string} resourceId - Resource ID
   * @param {Object} resourceData - Resource data
   * @param {Array} targetModules - Target modules (optional)
   */
  const shareResource = (resourceType, resourceId, resourceData, targetModules = []) => {
    const resource = {
      type: resourceType,
      id: resourceId,
      data: resourceData,
      sourceModule: activeModule,
      timestamp: new Date().toISOString()
    };
    
    setSharedResources(prevResources => ({
      ...prevResources,
      [resourceType]: {
        ...prevResources[resourceType],
        [resourceId]: resource
      }
    }));
    
    // Notify target modules if specified
    if (targetModules.length > 0) {
      // This would typically use a messaging system or event bus
      // For now, we'll dispatch a custom event
      window.dispatchEvent(new CustomEvent('resource-shared', {
        detail: {
          resource,
          targetModules
        }
      }));
    }
  };
  
  /**
   * Get a shared resource
   * @param {string} resourceType - Resource type
   * @param {string} resourceId - Resource ID 
   * @returns {Object|null} - Shared resource or null if not found
   */
  const getSharedResource = (resourceType, resourceId) => {
    return sharedResources[resourceType]?.[resourceId] || null;
  };
  
  /**
   * Start a cross-module workflow
   * @param {string} workflowType - Workflow type
   * @param {Object} context - Workflow context
   * @param {Object} options - Workflow options
   * @returns {Promise<Object>} - Started workflow
   */
  const startCrossModuleWorkflow = async (workflowType, context, options = {}) => {
    try {
      // Add current module as source in context
      const enhancedContext = {
        ...context,
        sourceModule: activeModule
      };
      
      // Start workflow using workflow service
      const workflow = await workflowService.startWorkflow(
        workflowType,
        enhancedContext,
        options
      );
      
      // Update cross-module context with workflow ID
      updateCrossModuleContext({
        lastWorkflow: {
          id: workflow.id,
          type: workflowType,
          startedAt: new Date().toISOString()
        }
      });
      
      return workflow;
    } catch (error) {
      console.error(`Failed to start cross-module workflow ${workflowType}:`, error);
      
      toast({
        title: "Workflow Error",
        description: `Failed to start workflow: ${error.message}`,
        variant: "destructive"
      });
      
      throw error;
    }
  };
  
  /**
   * Get the count of cross-module tasks for the current user
   * @returns {number} - Task count
   */
  const getCrossModuleTasksCount = () => {
    return workflowService.userTasks.length;
  };
  
  /**
   * Get insights from the regulatory intelligence core
   * @param {string} contextType - Context type
   * @param {string} contextId - Context ID
   * @param {string} insightType - Insight type (regulatory or scientific)
   * @param {Object} options - Options
   * @returns {Promise<Object>} - Intelligence insights
   */
  const getIntelligenceInsights = async (contextType, contextId, insightType = 'regulatory', options = {}) => {
    try {
      if (insightType === 'scientific') {
        return await regulatoryIntelligenceCore.getScientificInsights(contextType, contextId, options);
      } else {
        return await regulatoryIntelligenceCore.getRegulatoryInsights(contextType, contextId, options);
      }
    } catch (error) {
      console.error(`Failed to get ${insightType} insights:`, error);
      throw error;
    }
  };
  
  /**
   * Check if user has permission for a resource
   * @param {string} resourceType - Resource type
   * @param {string} permission - Permission to check
   * @param {string} resourceId - Specific resource ID (optional)
   * @returns {boolean} - Whether user has the permission
   */
  const hasPermission = (resourceType, permission, resourceId = null) => {
    return securityService.hasPermission(resourceType, permission, resourceId);
  };
  
  /**
   * Navigate to a specific module
   * @param {string} moduleCode - Module code
   * @param {string} path - Specific path within the module (optional)
   * @param {Object} params - Navigation parameters (optional)
   */
  const navigateToModule = (moduleCode, path = '', params = {}) => {
    if (!moduleCode || !MODULE_ROUTES[moduleCode]) {
      console.error(`Invalid module code: ${moduleCode}`);
      return;
    }
    
    // Check if module is available
    if (!modulesStatus[moduleCode]?.available) {
      toast({
        title: "Module Unavailable",
        description: `The ${MODULE_NAMES[moduleCode]} module is currently unavailable.`,
        variant: "destructive"
      });
      return;
    }
    
    // Build route
    let route = MODULE_ROUTES[moduleCode];
    if (path) {
      route = `${route}/${path}`.replace('//', '/');
    }
    
    // Add query parameters if provided
    if (Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        queryParams.append(key, value);
      }
      route = `${route}?${queryParams.toString()}`;
    }
    
    // Navigate to the route
    setLocation(route);
  };
  
  /**
   * Synchronize data between modules
   * @param {string} sourceModule - Source module
   * @param {string} targetModule - Target module
   * @param {string} dataType - Data type
   * @param {Object} data - Data to synchronize
   * @returns {Promise<Object>} - Synchronization result
   */
  const syncModuleData = async (sourceModule, targetModule, dataType, data) => {
    try {
      // In a real implementation, this would call an API to sync data
      // For now, we'll just update the cross-module context
      updateCrossModuleContext({
        [`${sourceModule}_${targetModule}_sync`]: {
          dataType,
          timestamp: new Date().toISOString(),
          status: 'completed'
        }
      });
      
      // Trigger module data updated event
      window.dispatchEvent(new CustomEvent('module-data-updated', {
        detail: {
          sourceModule,
          targetModule,
          dataType,
          timestamp: new Date().toISOString()
        }
      }));
      
      return { success: true };
    } catch (error) {
      console.error(`Failed to sync data between ${sourceModule} and ${targetModule}:`, error);
      throw error;
    }
  };
  
  /**
   * Switch to a different client context (for CRO users)
   * @param {string} clientId - Client organization ID
   * @returns {Promise<Object>} - Updated client context
   */
  const switchClient = async (clientId) => {
    try {
      // Switch client context in security service
      const context = await securityService.switchToClientContext(clientId);
      
      // Update local client context
      setClientContext(context.clientContext);
      
      // Update cross-module context
      updateCrossModuleContext({
        clientContext: context.clientContext
      });
      
      // Trigger client context changed event
      window.dispatchEvent(new CustomEvent('client-context-changed', {
        detail: context.clientContext
      }));
      
      return context.clientContext;
    } catch (error) {
      console.error(`Failed to switch to client ${clientId}:`, error);
      
      toast({
        title: "Client Switch Error",
        description: `Failed to switch client context: ${error.message}`,
        variant: "destructive"
      });
      
      throw error;
    }
  };
  
  /**
   * Handle task assigned event
   * @param {CustomEvent} event - Task assigned event
   */
  const handleTaskAssigned = (event) => {
    const task = event.detail;
    
    toast({
      title: "New Task Assigned",
      description: task.name,
      action: (
        <button 
          className="bg-primary text-white px-3 py-1 rounded hover:bg-primary/90"
          onClick={() => navigateToModule(MODULES.TRIAL_VAULT, `tasks/${task.id}`)}
        >
          View
        </button>
      )
    });
  };
  
  /**
   * Handle workflow completed event
   * @param {CustomEvent} event - Workflow completed event 
   */
  const handleWorkflowCompleted = (event) => {
    const workflow = event.detail;
    
    toast({
      title: "Workflow Completed",
      description: `Workflow "${workflow.name}" has been completed`,
      variant: "default"
    });
  };
  
  /**
   * Handle security alert event
   * @param {CustomEvent} event - Security alert event
   */
  const handleSecurityAlert = (event) => {
    const alert = event.detail;
    
    // Show alert dialog for critical security alerts
    if (alert.severity === 'critical') {
      setAlertDialog({
        open: true,
        data: {
          title: "Security Alert",
          description: alert.message,
          action: alert.action
        }
      });
    } else {
      // Show toast for non-critical alerts
      toast({
        title: "Security Alert",
        description: alert.message,
        variant: "destructive"
      });
    }
  };
  
  /**
   * Handle module data updated event
   * @param {CustomEvent} event - Module data updated event
   */
  const handleModuleDataUpdated = (event) => {
    const update = event.detail;
    
    // Only notify if the current module is the target
    if (update.targetModule === activeModule) {
      toast({
        title: "Data Update",
        description: `New data available from ${MODULE_NAMES[update.sourceModule]}`,
        variant: "default"
      });
    }
  };
  
  /**
   * Handle client context changed event
   * @param {CustomEvent} event - Client context changed event
   */
  const handleClientContextChanged = (event) => {
    const context = event.detail;
    
    toast({
      title: "Client Context Changed",
      description: `Now working with client: ${context.name}`,
      variant: "default"
    });
  };
  
  // Context value
  const contextValue = {
    // Active module
    activeModule,
    setActiveModule,
    
    // Cross-module context
    crossModuleContext,
    updateCrossModuleContext,
    
    // Resource sharing
    shareResource,
    getSharedResource,
    
    // Workflow integration
    startCrossModuleWorkflow,
    getCrossModuleTasksCount,
    
    // Intelligence integration
    getIntelligenceInsights,
    
    // Security integration
    hasPermission,
    
    // Module navigation
    navigateToModule,
    
    // Data synchronization
    syncModuleData,
    
    // Service instances
    services: {
      intelligence: regulatoryIntelligenceCore,
      docuShare: docuShareService,
      mashable: mashableService,
      workflow: workflowService,
      security: securityService
    },
    
    // Integration status
    isInitialized,
    isLoading,
    modulesStatus,
    
    // Client context (for CRO users)
    clientContext,
    switchClient
  };
  
  // If still loading, show minimal loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Initializing platform integration...</p>
        </div>
      </div>
    );
  }
  
  return (
    <ModuleIntegrationContext.Provider value={contextValue}>
      {children}
      
      <Toaster />
      
      {/* Alert Dialog for Critical Security Alerts */}
      <AlertDialog open={alertDialog.open} onOpenChange={(open) => setAlertDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialog.data.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertDialog.data.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {alertDialog.data.action && (
              <AlertDialogAction onClick={alertDialog.data.action.onClick}>
                {alertDialog.data.action.label || 'Continue'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ModuleIntegrationContext.Provider>
  );
};

/**
 * Custom hook to use the module integration context
 * @returns {Object} - Module integration context
 */
export const useModuleIntegration = () => {
  const context = useContext(ModuleIntegrationContext);
  
  if (context === undefined) {
    throw new Error('useModuleIntegration must be used within a ModuleIntegrationLayer');
  }
  
  return context;
};