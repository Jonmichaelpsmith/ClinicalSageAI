import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define the Organization type
export interface Organization {
  id: number;
  name: string;
  slug: string;
  domain?: string;
  tier: string;
  status: string;
  maxUsers?: number;
  maxProjects?: number;
  maxStorage?: number;
  userCount?: number;
  projectCount?: number;
  storageUsed?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Define the context type
interface TenantContextType {
  currentTenant: Organization | null;
  availableTenants: Organization[];
  isLoading: boolean;
  switchTenant: (tenantId: number) => Promise<void>;
  refreshTenants: () => Promise<void>;
}

// Create the context with default values
const TenantContext = createContext<TenantContextType>({
  currentTenant: null,
  availableTenants: [],
  isLoading: true,
  switchTenant: async () => {},
  refreshTenants: async () => {},
});

// Sample organizations for development
const sampleOrganizations: Organization[] = [
  {
    id: 1,
    name: 'Acme Pharma',
    slug: 'acme-pharma',
    domain: 'acmepharma.com',
    tier: 'enterprise',
    status: 'active',
    maxUsers: 50,
    maxProjects: 100,
    maxStorage: 500,
    userCount: 23,
    projectCount: 45,
    storageUsed: 156,
  },
  {
    id: 2,
    name: 'BioCore Research',
    slug: 'biocore-research',
    domain: 'biocore.org',
    tier: 'professional',
    status: 'active',
    maxUsers: 20,
    maxProjects: 50,
    maxStorage: 100,
    userCount: 12,
    projectCount: 18,
    storageUsed: 42,
  },
  {
    id: 3,
    name: 'MedTech Innovations',
    slug: 'medtech-innovations',
    domain: 'medtechinnovations.com',
    tier: 'standard',
    status: 'active',
    maxUsers: 10,
    maxProjects: 25,
    maxStorage: 50,
    userCount: 8,
    projectCount: 12,
    storageUsed: 28,
  },
  {
    id: 4,
    name: 'Trial Systems LLC',
    slug: 'trial-systems',
    domain: 'trialsystems.io',
    tier: 'enterprise',
    status: 'inactive',
    maxUsers: 30,
    maxProjects: 75,
    maxStorage: 250,
    userCount: 0,
    projectCount: 0,
    storageUsed: 0,
  },
];

interface TenantProviderProps {
  children: ReactNode;
}

// Create the Provider component
export const TenantProvider = ({ children }: TenantProviderProps) => {
  const [currentTenant, setCurrentTenant] = useState<Organization | null>(null);
  const [availableTenants, setAvailableTenants] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tenants on mount
  useEffect(() => {
    loadTenants();
  }, []);

  // Function to load available tenants
  const loadTenants = async () => {
    setIsLoading(true);
    try {
      // In a production app, we would fetch this from the API
      // const response = await fetch('/api/organizations');
      // const data = await response.json();
      
      // For development, we'll use sample data
      const data = sampleOrganizations;
      
      setAvailableTenants(data);
      
      // If no current tenant is set, set the first active one
      if (!currentTenant) {
        const defaultTenant = data.find(tenant => tenant.status === 'active');
        if (defaultTenant) {
          setCurrentTenant(defaultTenant);
          // Store selected tenant in localStorage
          localStorage.setItem('currentTenantId', defaultTenant.id.toString());
        }
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to switch tenants
  const switchTenant = async (tenantId: number) => {
    setIsLoading(true);
    try {
      const tenant = availableTenants.find(t => t.id === tenantId);
      if (tenant) {
        setCurrentTenant(tenant);
        // Store selected tenant in localStorage
        localStorage.setItem('currentTenantId', tenantId.toString());
      }
    } catch (error) {
      console.error('Error switching tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh tenants
  const refreshTenants = async () => {
    await loadTenants();
  };

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        availableTenants,
        isLoading,
        switchTenant,
        refreshTenants,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

// Custom hook to use the tenant context
export const useTenant = () => useContext(TenantContext);