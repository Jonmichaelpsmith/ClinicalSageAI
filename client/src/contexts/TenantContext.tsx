import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define Tenant and TenantContext interfaces
export interface Tenant {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  settings?: any;
  tier: string;
}

interface TenantContextType {
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
  availableTenants: Tenant[];
  setAvailableTenants: (tenants: Tenant[]) => void;
  isLoading: boolean;
  error: Error | null;
}

// Create the context with a default value
const TenantContext = createContext<TenantContextType>({
  currentTenant: null,
  setCurrentTenant: () => {},
  availableTenants: [],
  setAvailableTenants: () => {},
  isLoading: true,
  error: null
});

// Custom hook to use the tenant context
export const useTenant = () => useContext(TenantContext);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load the tenant data on component mount
  useEffect(() => {
    const loadTenantData = async () => {
      try {
        setIsLoading(true);
        
        // Get available tenants for the current user
        const tenantsResponse = await fetch('/api/tenants');
        if (!tenantsResponse.ok) {
          throw new Error('Failed to fetch tenant data');
        }
        
        const tenantsData = await tenantsResponse.json();
        setAvailableTenants(tenantsData);
        
        // If there are tenants, set the current tenant to the first one or
        // the one saved in localStorage
        if (tenantsData.length > 0) {
          const savedTenantId = localStorage.getItem('currentTenantId');
          const tenantToSelect = savedTenantId 
            ? tenantsData.find(t => t.id.toString() === savedTenantId) 
            : tenantsData[0];
          
          if (tenantToSelect) {
            setCurrentTenant(tenantToSelect);
            localStorage.setItem('currentTenantId', tenantToSelect.id.toString());
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsLoading(false);
      }
    };
    
    loadTenantData();
  }, []);
  
  // Update localStorage and API headers when current tenant changes
  useEffect(() => {
    if (currentTenant) {
      localStorage.setItem('currentTenantId', currentTenant.id.toString());
      
      // Update the tenant ID HTTP header for API requests
      const originalFetch = window.fetch;
      window.fetch = function(input, init) {
        init = init || {};
        init.headers = init.headers || {};
        
        // Add tenant header to all API requests
        if (typeof input === 'string' && input.startsWith('/api/')) {
          init.headers = {
            ...init.headers,
            'X-Tenant-ID': currentTenant.id.toString()
          };
        }
        
        return originalFetch(input, init);
      };
      
      // Cleanup the fetch override on unmount
      return () => {
        window.fetch = originalFetch;
      };
    }
  }, [currentTenant]);
  
  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        setCurrentTenant,
        availableTenants,
        setAvailableTenants,
        isLoading,
        error
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};