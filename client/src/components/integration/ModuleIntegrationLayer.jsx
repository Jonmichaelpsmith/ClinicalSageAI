/**
 * Module Integration Layer
 * 
 * This component provides a centralized integration layer for all TrialSage modules.
 * It manages shared services, state, and cross-module communication.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import securityService from '../../services/SecurityService';
import docuShareService from '../../services/DocuShareService';
import workflowService from '../../services/WorkflowService';
import blockchainService from '../../services/blockchain';
import { RegulatoryIntelligenceCore } from '../../services/RegulatoryIntelligenceCore';

// Create integration context
const IntegrationContext = createContext(null);

/**
 * Module Integration Provider
 * 
 * Provides integration services to all TrialSage modules
 */
export const ModuleIntegrationProvider = ({ children }) => {
  // Initialize regulatory core
  const [regulatoryCore] = useState(() => new RegulatoryIntelligenceCore());
  
  // Track registered modules
  const [registeredModules, setRegisteredModules] = useState({});
  
  // Track shared data between modules
  const [sharedData, setSharedData] = useState({});
  
  // Module event listeners
  const [eventListeners, setEventListeners] = useState({});
  
  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize regulatory core
        await regulatoryCore.initialize();
        console.log('[Integration] Regulatory Intelligence Core initialized');
      } catch (error) {
        console.error('[Integration] Error initializing services:', error);
      }
    };
    
    initializeServices();
  }, [regulatoryCore]);
  
  /**
   * Register a module with the integration layer
   * @param {string} moduleId - Module identifier
   * @param {object} metadata - Module metadata
   */
  const registerModule = useCallback((moduleId, metadata) => {
    console.log(`[Integration] Registering module: ${moduleId}`, metadata);
    
    setRegisteredModules(prevModules => ({
      ...prevModules,
      [moduleId]: {
        id: moduleId,
        ...metadata,
        registeredAt: new Date().toISOString()
      }
    }));
  }, []);
  
  /**
   * Share data between modules
   * @param {string} key - Data key
   * @param {any} data - Data to share
   * @param {string} sourceModuleId - Source module ID
   */
  const shareData = useCallback((key, data, sourceModuleId) => {
    console.log(`[Integration] Sharing data: ${key} from ${sourceModuleId}`);
    
    setSharedData(prevData => ({
      ...prevData,
      [key]: {
        data,
        sourceModuleId,
        timestamp: new Date().toISOString()
      }
    }));
    
    // Trigger any event listeners for this key
    if (eventListeners[key]) {
      eventListeners[key].forEach(listener => {
        if (listener.sourceModuleId !== sourceModuleId || listener.includeSource) {
          try {
            listener.callback(data, sourceModuleId);
          } catch (error) {
            console.error(`[Integration] Error in event listener for ${key}:`, error);
          }
        }
      });
    }
  }, [eventListeners]);
  
  /**
   * Get shared data
   * @param {string} key - Data key
   * @returns {any} Shared data
   */
  const getSharedData = useCallback((key) => {
    return sharedData[key]?.data;
  }, [sharedData]);
  
  /**
   * Register event listener
   * @param {string} key - Event key
   * @param {Function} callback - Event callback
   * @param {string} moduleId - Module ID
   * @param {boolean} includeSource - Whether to include events from the source module
   * @returns {Function} Unregister function
   */
  const registerEventListener = useCallback((key, callback, moduleId, includeSource = false) => {
    console.log(`[Integration] Registering event listener for ${key} from ${moduleId}`);
    
    const listenerId = `${moduleId}-${Date.now()}`;
    
    setEventListeners(prevListeners => ({
      ...prevListeners,
      [key]: [
        ...(prevListeners[key] || []),
        {
          id: listenerId,
          callback,
          sourceModuleId: moduleId,
          includeSource
        }
      ]
    }));
    
    // Return unregister function
    return () => {
      setEventListeners(prevListeners => ({
        ...prevListeners,
        [key]: (prevListeners[key] || []).filter(
          listener => listener.id !== listenerId
        )
      }));
    };
  }, []);
  
  /**
   * Trigger event across modules
   * @param {string} key - Event key
   * @param {any} data - Event data
   * @param {string} sourceModuleId - Source module ID
   */
  const triggerEvent = useCallback((key, data, sourceModuleId) => {
    console.log(`[Integration] Triggering event: ${key} from ${sourceModuleId}`);
    
    // Store in shared data
    setSharedData(prevData => ({
      ...prevData,
      [`event:${key}`]: {
        data,
        sourceModuleId,
        timestamp: new Date().toISOString()
      }
    }));
    
    // Trigger any event listeners for this key
    if (eventListeners[key]) {
      eventListeners[key].forEach(listener => {
        if (listener.sourceModuleId !== sourceModuleId || listener.includeSource) {
          try {
            listener.callback(data, sourceModuleId);
          } catch (error) {
            console.error(`[Integration] Error in event listener for ${key}:`, error);
          }
        }
      });
    }
  }, [eventListeners]);
  
  /**
   * Check if current user has access to a module
   * @param {string} moduleId - Module ID
   * @returns {boolean} Whether user has access
   */
  const hasModuleAccess = useCallback((moduleId) => {
    return securityService.hasModuleAccess(moduleId);
  }, []);
  
  // Expose integration context
  const integrationContext = {
    // Services
    securityService,
    docuShareService,
    workflowService,
    regulatoryCore,
    blockchainService,
    
    // Module registration
    registerModule,
    registeredModules,
    
    // Data sharing
    shareData,
    getSharedData,
    sharedData,
    
    // Event system
    registerEventListener,
    triggerEvent,
    
    // Access control
    hasModuleAccess
  };
  
  return (
    <IntegrationContext.Provider value={integrationContext}>
      {children}
    </IntegrationContext.Provider>
  );
};

/**
 * Hook to use integration context
 * @returns {object} Integration context
 */
export const useIntegration = () => {
  const context = useContext(IntegrationContext);
  
  if (!context) {
    throw new Error('useIntegration must be used within a ModuleIntegrationProvider');
  }
  
  return context;
};