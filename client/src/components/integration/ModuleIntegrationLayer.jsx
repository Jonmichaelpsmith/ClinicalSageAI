import React, { createContext, useContext, useState, useCallback } from 'react';

// Create a context for the integration layer
const ModuleIntegrationContext = createContext();

/**
 * The ModuleIntegrationLayer serves as the central nervous system for 
 * the TrialSage platform, allowing modules to share data and communicate.
 */
export const ModuleIntegrationProvider = ({ children }) => {
  // Shared state accessible to all modules
  const [sharedData, setSharedData] = useState({
    trialData: null,
    selectedTrial: null,
    activeStudy: null,
    documentMetadata: {},
    regulatoryContext: {
      region: 'US', // Default to US FDA
      framework: 'ICH',
      applicationTypes: ['IND', 'NDA', 'BLA']
    }
  });

  // Event system for cross-module communication
  const [eventListeners, setEventListeners] = useState({});

  // Method to update shared data
  const updateSharedData = useCallback((path, data) => {
    setSharedData(prev => {
      const newData = { ...prev };
      
      // Handle nested paths like 'trialData.demographics'
      if (path.includes('.')) {
        const keys = path.split('.');
        let current = newData;
        
        // Navigate to the correct nesting level
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        // Set the value at the final key
        current[keys[keys.length - 1]] = data;
      } else {
        // Direct update for top-level keys
        newData[path] = data;
      }
      
      return newData;
    });
  }, []);

  // Method to get data from shared state
  const getSharedData = useCallback((path) => {
    if (!path) return sharedData;
    
    // Handle nested paths
    if (path.includes('.')) {
      const keys = path.split('.');
      let current = sharedData;
      
      for (const key of keys) {
        if (!current || !current[key]) {
          return null;
        }
        current = current[key];
      }
      
      return current;
    }
    
    // Direct retrieval for top-level keys
    return sharedData[path];
  }, [sharedData]);

  // Event system methods
  const addEventListener = useCallback((eventName, callback) => {
    setEventListeners(prev => {
      const listeners = prev[eventName] || [];
      return {
        ...prev,
        [eventName]: [...listeners, callback]
      };
    });
    
    // Return a function to remove this specific listener
    return () => {
      setEventListeners(prev => {
        const listeners = prev[eventName] || [];
        return {
          ...prev,
          [eventName]: listeners.filter(cb => cb !== callback)
        };
      });
    };
  }, []);

  const triggerEvent = useCallback((eventName, data) => {
    const listeners = eventListeners[eventName] || [];
    listeners.forEach(callback => callback(data));
  }, [eventListeners]);

  // For backward compatibility with older hook naming
  const useIntegration = (moduleId) => {
    // Additional module-specific functionality could be added here
    return {
      moduleId,
      sharedData,
      updateSharedData,
      getSharedData,
      addEventListener,
      triggerEvent
    };
  };

  // Expose the integration context value
  const value = {
    sharedData,
    updateSharedData,
    getSharedData,
    addEventListener,
    triggerEvent,
    useIntegration // For backward compatibility
  };

  return (
    <ModuleIntegrationContext.Provider value={value}>
      {children}
    </ModuleIntegrationContext.Provider>
  );
};

// Custom hook to access the integration layer
export const useModuleIntegration = () => {
  const context = useContext(ModuleIntegrationContext);
  if (!context) {
    throw new Error('useModuleIntegration must be used within a ModuleIntegrationProvider');
  }
  return context;
};