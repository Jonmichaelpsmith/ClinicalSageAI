/**
 * Tenant Context Provider
 *
 * This context manages organization and client workspace selection,
 * providing tenant context across the entire application.
 * 
 * It handles:
 * - Loading available organizations and client workspaces
 * - Setting the current organization and client workspace
 * - Persisting selections to localStorage
 * - Providing tenant headers for API requests
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Organization {
  id: string;
  name: string;
  logo?: string;
}

interface ClientWorkspace {
  id: string;
  name: string;
  organizationId: string;
  logo?: string;
}

interface Module {
  id: string;
  name: string;
  path: string;
  icon?: string;
}

interface TenantContextType {
  // Organizations
  organizations: Organization[];
  currentOrganization: Organization | null;
  setCurrentOrganization: (org: Organization | null) => void;
  
  // Client Workspaces
  clientWorkspaces: ClientWorkspace[];
  currentClientWorkspace: ClientWorkspace | null;
  setCurrentClientWorkspace: (client: ClientWorkspace | null) => void;
  filteredClientWorkspaces: ClientWorkspace[];
  
  // Modules
  modules: Module[];
  currentModule: Module | null;
  setCurrentModule: (module: Module | null) => void;
  
  // Loading states
  isLoading: boolean;
  
  // API Headers
  getTenantHeaders: () => Record<string, string>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenantContext = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
};

// Export the same hook with an alternate name to maintain backward compatibility
// with components using the old name
export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider = ({ children }: TenantProviderProps) => {
  // State for organizations
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  
  // State for client workspaces
  const [clientWorkspaces, setClientWorkspaces] = useState<ClientWorkspace[]>([]);
  const [currentClientWorkspace, setCurrentClientWorkspace] = useState<ClientWorkspace | null>(null);
  
  // State for modules
  const [modules, setModules] = useState<Module[]>([
    { id: 'cer', name: 'Clinical Evaluation Reports', path: '/cer', icon: 'file-text' },
    { id: 'ind', name: 'IND Wizard', path: '/ind-wizard', icon: 'wand-2' },
    { id: 'vault', name: 'Document Vault', path: '/vault', icon: 'archive' },
    { id: 'csr', name: 'CSR Builder', path: '/csr', icon: 'file-code' }
  ]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter client workspaces based on selected organization
  const filteredClientWorkspaces = currentOrganization
    ? clientWorkspaces.filter(c => c.organizationId === currentOrganization.id)
    : [];
  
  // Load sample organizations and client workspaces
  // In a real implementation, this would fetch from an API
  useEffect(() => {
    const loadTenantData = async () => {
      setIsLoading(true);
      
      try {
        // This would be an API call in a real implementation
        const orgData: Organization[] = [
          { id: '1', name: 'Acme Pharmaceuticals', logo: '/logos/acme.png' },
          { id: '2', name: 'Biotech Innovations', logo: '/logos/biotech.png' },
          { id: '3', name: 'MedDevice Corp', logo: '/logos/meddevice.png' }
        ];
        
        const clientData: ClientWorkspace[] = [
          { id: '101', name: 'Acme Clinical Team', organizationId: '1', logo: '/logos/acme-clinical.png' },
          { id: '102', name: 'Acme Regulatory Affairs', organizationId: '1', logo: '/logos/acme-regulatory.png' },
          { id: '201', name: 'Biotech Research Division', organizationId: '2', logo: '/logos/biotech-research.png' },
          { id: '301', name: 'MedDevice Quality', organizationId: '3', logo: '/logos/meddevice-quality.png' },
          { id: '302', name: 'MedDevice Compliance', organizationId: '3', logo: '/logos/meddevice-compliance.png' }
        ];
        
        setOrganizations(orgData);
        setClientWorkspaces(clientData);
        
        // Load saved preferences from localStorage
        const savedOrgId = localStorage.getItem('currentOrganizationId');
        const savedClientId = localStorage.getItem('currentClientWorkspaceId');
        const savedModuleId = localStorage.getItem('currentModuleId');
        
        if (savedOrgId) {
          const savedOrg = orgData.find(o => o.id === savedOrgId);
          if (savedOrg) setCurrentOrganization(savedOrg);
        }
        
        if (savedClientId) {
          const savedClient = clientData.find(c => c.id === savedClientId);
          if (savedClient) setCurrentClientWorkspace(savedClient);
        }
        
        if (savedModuleId) {
          const savedModule = modules.find(m => m.id === savedModuleId);
          if (savedModule) setCurrentModule(savedModule);
        }
      } catch (error) {
        console.error('Error loading tenant data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTenantData();
  }, []);
  
  // Save selections to localStorage
  useEffect(() => {
    if (currentOrganization) {
      localStorage.setItem('currentOrganizationId', currentOrganization.id);
    } else {
      localStorage.removeItem('currentOrganizationId');
    }
  }, [currentOrganization]);
  
  useEffect(() => {
    if (currentClientWorkspace) {
      localStorage.setItem('currentClientWorkspaceId', currentClientWorkspace.id);
    } else {
      localStorage.removeItem('currentClientWorkspaceId');
    }
  }, [currentClientWorkspace]);
  
  useEffect(() => {
    if (currentModule) {
      localStorage.setItem('currentModuleId', currentModule.id);
    } else {
      localStorage.removeItem('currentModuleId');
    }
  }, [currentModule]);
  
  // When organization changes, reset client workspace if it doesn't belong to the new organization
  useEffect(() => {
    if (currentOrganization && currentClientWorkspace) {
      if (currentClientWorkspace.organizationId !== currentOrganization.id) {
        setCurrentClientWorkspace(null);
      }
    }
  }, [currentOrganization, currentClientWorkspace]);
  
  // Helper to get tenant headers for API requests
  const getTenantHeaders = () => {
    const headers: Record<string, string> = {};
    
    if (currentOrganization) {
      headers['X-Org-ID'] = currentOrganization.id;
    }
    
    if (currentClientWorkspace) {
      headers['X-Client-ID'] = currentClientWorkspace.id;
    }
    
    if (currentModule) {
      headers['X-Module'] = currentModule.id;
    }
    
    return headers;
  };
  
  // Custom handlers for organization and client workspace selection
  const handleSetCurrentOrganization = (org: Organization | null) => {
    setCurrentOrganization(org);
    
    // If organization changes, check if current client workspace belongs to it
    if (org && currentClientWorkspace && currentClientWorkspace.organizationId !== org.id) {
      // If not, reset client workspace or set to first valid one
      const firstClientForOrg = clientWorkspaces.find(c => c.organizationId === org.id) || null;
      setCurrentClientWorkspace(firstClientForOrg);
    } else if (!org) {
      // If organization is cleared, clear client workspace too
      setCurrentClientWorkspace(null);
    }
  };
  
  return (
    <TenantContext.Provider
      value={{
        // Organizations
        organizations,
        currentOrganization,
        setCurrentOrganization: handleSetCurrentOrganization,
        
        // Client Workspaces
        clientWorkspaces,
        currentClientWorkspace,
        setCurrentClientWorkspace,
        filteredClientWorkspaces,
        
        // Modules
        modules,
        currentModule,
        setCurrentModule,
        
        // Loading state
        isLoading,
        
        // API Headers
        getTenantHeaders
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export default TenantContext;