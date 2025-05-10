/**
 * Tenant Context
 * 
 * This context provides multi-tenant functionality for the application,
 * allowing for organization and client workspace isolation.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the tenant context
const TenantContext = createContext();

// Custom hook for accessing the tenant context
export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  // Current organization and client workspace state
  const [organizationId, setOrganizationId] = useState(null);
  const [clientWorkspaceId, setClientWorkspaceId] = useState(null);
  const [module, setModule] = useState(null);
  
  // Track loaded state
  const [loaded, setLoaded] = useState(false);
  
  // Initialize from URL or localStorage on mount
  useEffect(() => {
    const initTenantContext = () => {
      try {
        // Try to get from localStorage first
        const storedOrgId = localStorage.getItem('organizationId');
        const storedClientId = localStorage.getItem('clientWorkspaceId');
        const storedModule = localStorage.getItem('module');
        
        // Set initial values
        setOrganizationId(storedOrgId);
        setClientWorkspaceId(storedClientId);
        setModule(storedModule);
        
        // Mark as loaded
        setLoaded(true);
        
        console.log('Tenant context initialized:', {
          organizationId: storedOrgId,
          clientWorkspaceId: storedClientId,
          module: storedModule
        });
      } catch (error) {
        console.error('Error initializing tenant context:', error);
        setLoaded(true); // Still mark as loaded even on error
      }
    };
    
    initTenantContext();
  }, []);
  
  // Update organization and store in localStorage
  const updateOrganization = (orgId) => {
    setOrganizationId(orgId);
    if (orgId) {
      localStorage.setItem('organizationId', orgId);
    } else {
      localStorage.removeItem('organizationId');
    }
  };
  
  // Update client workspace and store in localStorage
  const updateClientWorkspace = (clientId) => {
    setClientWorkspaceId(clientId);
    if (clientId) {
      localStorage.setItem('clientWorkspaceId', clientId);
    } else {
      localStorage.removeItem('clientWorkspaceId');
    }
  };
  
  // Update module and store in localStorage
  const updateModule = (newModule) => {
    setModule(newModule);
    if (newModule) {
      localStorage.setItem('module', newModule);
    } else {
      localStorage.removeItem('module');
    }
  };
  
  // Clear all tenant context data
  const clearTenantContext = () => {
    setOrganizationId(null);
    setClientWorkspaceId(null);
    setModule(null);
    localStorage.removeItem('organizationId');
    localStorage.removeItem('clientWorkspaceId');
    localStorage.removeItem('module');
  };
  
  // Export the current tenant context
  const getCurrentContext = () => {
    return {
      organizationId,
      clientWorkspaceId,
      module
    };
  };
  
  // Provide all tenant-related functionality
  const value = {
    loaded,
    organizationId,
    clientWorkspaceId,
    module,
    updateOrganization,
    updateClientWorkspace,
    updateModule,
    clearTenantContext,
    getCurrentContext
  };
  
  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};