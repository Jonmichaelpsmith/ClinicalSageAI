import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the interfaces for our multi-tenant model
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  subscriptionTier: string;
  maxUsers: number;
  maxProjects: number;
  maxStorageGB: number;
  billingContact?: string;
}

export interface ClientWorkspace {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  quotaProjects: number;
  quotaStorageGB: number;
  activeProjects?: number;
  storageUsedGB?: number;
  lastActivity?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Module {
  id: string;
  name: string;
  slug: string;
  isEnabled: boolean;
}

interface TenantContextType {
  // Organization context
  currentOrganization: Organization | null;
  setCurrentOrganization: (org: Organization | null) => void;
  availableOrganizations: Organization[];
  setAvailableOrganizations: (orgs: Organization[]) => void;
  
  // Client workspace context
  currentClientWorkspace: ClientWorkspace | null;
  setCurrentClientWorkspace: (client: ClientWorkspace | null) => void;
  availableClientWorkspaces: ClientWorkspace[];
  setAvailableClientWorkspaces: (clients: ClientWorkspace[]) => void;
  
  // Current module context
  currentModule: string;
  setCurrentModule: (moduleName: string) => void;
  
  // Loading and error states
  isLoading: boolean;
  error: Error | null;
}

// Create the context with a default value
const TenantContext = createContext<TenantContextType>({
  currentOrganization: null,
  setCurrentOrganization: () => {},
  availableOrganizations: [],
  setAvailableOrganizations: () => {},
  
  currentClientWorkspace: null,
  setCurrentClientWorkspace: () => {},
  availableClientWorkspaces: [],
  setAvailableClientWorkspaces: () => {},
  
  currentModule: 'cer', // Default module
  setCurrentModule: () => {},
  
  isLoading: true,
  error: null
});

// Custom hook to use the tenant context
export const useTenant = () => useContext(TenantContext);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  // Organization state
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [availableOrganizations, setAvailableOrganizations] = useState<Organization[]>([]);
  
  // Client workspace state
  const [currentClientWorkspace, setCurrentClientWorkspace] = useState<ClientWorkspace | null>(null);
  const [availableClientWorkspaces, setAvailableClientWorkspaces] = useState<ClientWorkspace[]>([]);
  
  // Current module state
  const [currentModule, setCurrentModule] = useState<string>('cer');
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load the organization data on component mount
  useEffect(() => {
    const loadOrganizationsData = async () => {
      try {
        setIsLoading(true);
        
        // Get available organizations for the current user
        const orgsResponse = await fetch('/api/organizations');
        if (!orgsResponse.ok) {
          throw new Error('Failed to fetch organization data');
        }
        
        const orgsData = await orgsResponse.json();
        setAvailableOrganizations(orgsData);
        
        // If there are organizations, set the current organization to the first one or
        // the one saved in localStorage
        if (orgsData.length > 0) {
          const savedOrgId = localStorage.getItem('currentOrgId');
          const orgToSelect = savedOrgId 
            ? orgsData.find(o => o.id.toString() === savedOrgId) 
            : orgsData[0];
          
          if (orgToSelect) {
            setCurrentOrganization(orgToSelect);
            localStorage.setItem('currentOrgId', orgToSelect.id.toString());
            
            // Now load client workspaces for this organization
            await loadClientWorkspaces(orgToSelect.id);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsLoading(false);
      }
    };
    
    loadOrganizationsData();
  }, []);
  
  // Load client workspaces when organization changes
  const loadClientWorkspaces = async (orgId: string) => {
    try {
      // Get available client workspaces for the selected organization
      const clientsResponse = await fetch(`/api/organizations/${orgId}/clients`);
      if (!clientsResponse.ok) {
        throw new Error('Failed to fetch client workspace data');
      }
      
      const clientsData = await clientsResponse.json();
      setAvailableClientWorkspaces(clientsData);
      
      // If there are client workspaces, set the current client workspace to the first one or
      // the one saved in localStorage
      if (clientsData.length > 0) {
        const savedClientId = localStorage.getItem('currentClientId');
        const clientToSelect = savedClientId 
          ? clientsData.find(c => c.id.toString() === savedClientId) 
          : clientsData[0];
        
        if (clientToSelect) {
          setCurrentClientWorkspace(clientToSelect);
          localStorage.setItem('currentClientId', clientToSelect.id.toString());
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  };
  
  // Update when organization changes
  useEffect(() => {
    if (currentOrganization) {
      localStorage.setItem('currentOrgId', currentOrganization.id.toString());
      loadClientWorkspaces(currentOrganization.id);
    }
  }, [currentOrganization]);
  
  // Update localStorage when client workspace changes
  useEffect(() => {
    if (currentClientWorkspace) {
      localStorage.setItem('currentClientId', currentClientWorkspace.id.toString());
    }
  }, [currentClientWorkspace]);

  // Update localStorage when module changes
  useEffect(() => {
    if (currentModule) {
      localStorage.setItem('currentModule', currentModule);
    }
  }, [currentModule]);
  
  // Update API headers with tenant context information
  useEffect(() => {
    if (currentOrganization && currentClientWorkspace) {
      // Update the organization and client ID HTTP headers for API requests
      const originalFetch = window.fetch;
      window.fetch = function(input, init) {
        init = init || {};
        init.headers = init.headers || {};
        
        // Add organization and client headers to all API requests
        if (typeof input === 'string' && input.startsWith('/api/')) {
          init.headers = {
            ...init.headers,
            'X-Org-ID': currentOrganization.id.toString(),
            'X-Client-ID': currentClientWorkspace.id.toString(),
            'X-Module': currentModule
          };
        }
        
        return originalFetch(input, init);
      };
      
      // Cleanup the fetch override on unmount
      return () => {
        window.fetch = originalFetch;
      };
    }
  }, [currentOrganization, currentClientWorkspace, currentModule]);
  
  return (
    <TenantContext.Provider
      value={{
        currentOrganization,
        setCurrentOrganization,
        availableOrganizations,
        setAvailableOrganizations,
        
        currentClientWorkspace,
        setCurrentClientWorkspace,
        availableClientWorkspaces,
        setAvailableClientWorkspaces,
        
        currentModule,
        setCurrentModule,
        
        isLoading,
        error
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};