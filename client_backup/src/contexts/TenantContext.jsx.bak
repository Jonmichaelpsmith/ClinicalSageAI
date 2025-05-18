import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

// Create the tenant context with default values
const TenantContext = createContext({
  organizationId: null,
  setOrganizationId: () => {},
  clientWorkspaceId: null,
  setClientWorkspaceId: () => {},
  moduleId: null,
  setModuleId: () => {},
  tenantData: {},
  refreshTenantData: () => {},
  isLoaded: false,
});

/**
 * TenantProvider Component
 * 
 * Provides organization, client workspace, and module context throughout the application.
 * This enables multi-tenant isolation of data and functionality.
 */
export const TenantProvider = ({ children }) => {
  const [organizationId, setOrganizationId] = useState(null);
  const [clientWorkspaceId, setClientWorkspaceId] = useState(null);
  const [moduleId, setModuleId] = useState(null);
  const [tenantData, setTenantData] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load tenant data from API or localStorage on initial mount
  useEffect(() => {
    const loadTenantData = async () => {
      try {
        // Try to load from localStorage first for persistence
        const storedOrganizationId = localStorage.getItem('currentOrganizationId');
        const storedClientWorkspaceId = localStorage.getItem('currentClientWorkspaceId');
        const storedModuleId = localStorage.getItem('currentModuleId');
        
        if (storedOrganizationId) {
          setOrganizationId(storedOrganizationId);
        }
        
        if (storedClientWorkspaceId) {
          setClientWorkspaceId(storedClientWorkspaceId);
        }
        
        if (storedModuleId) {
          setModuleId(storedModuleId);
        }
        
        // In a real application, this would make an API call to load tenant data
        // For demo purposes, we'll just set a flag to indicate data is loaded
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading tenant data:', error);
        setIsLoaded(true); // Still mark as loaded to prevent infinite loading state
      }
    };
    
    loadTenantData();
  }, []);
  
  // Save changes to localStorage for persistence
  useEffect(() => {
    if (organizationId) {
      localStorage.setItem('currentOrganizationId', organizationId);
    } else {
      localStorage.removeItem('currentOrganizationId');
    }
  }, [organizationId]);
  
  useEffect(() => {
    if (clientWorkspaceId) {
      localStorage.setItem('currentClientWorkspaceId', clientWorkspaceId);
    } else {
      localStorage.removeItem('currentClientWorkspaceId');
    }
  }, [clientWorkspaceId]);
  
  useEffect(() => {
    if (moduleId) {
      localStorage.setItem('currentModuleId', moduleId);
    } else {
      localStorage.removeItem('currentModuleId');
    }
  }, [moduleId]);
  
  // Refresh tenant data (would fetch from API in a real application)
  const refreshTenantData = async () => {
    try {
      // In a real application, this would make an API call to refresh tenant data
      console.log('Refreshing tenant data for:', { organizationId, clientWorkspaceId, moduleId });
      
      // For demo purposes, we'll just update the timestamp
      setTenantData(prev => ({
        ...prev,
        lastRefreshed: new Date().toISOString(),
      }));
      
      return true;
    } catch (error) {
      console.error('Error refreshing tenant data:', error);
      return false;
    }
  };
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    organizationId,
    setOrganizationId,
    clientWorkspaceId,
    setClientWorkspaceId,
    moduleId,
    setModuleId,
    tenantData,
    refreshTenantData,
    isLoaded,
  }), [organizationId, clientWorkspaceId, moduleId, tenantData, isLoaded]);
  
  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
};

// Custom hook to use the tenant context
export const useTenant = () => {
  const context = useContext(TenantContext);
  
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  
  return context;
};

export default TenantContext;