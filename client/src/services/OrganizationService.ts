/**
 * Organization Service
 * 
 * Provides methods for interacting with the organization API endpoints
 * for the multi-tenant platform.
 */
import { Tenant } from '../contexts/TenantContext';

export interface Organization {
  id: number;
  name: string;
  slug: string;
  domain?: string;
  logo?: string;
  tier: string;
  status: string;
  role?: string;
  userCount?: number;
  projectCount?: number;
  maxUsers?: number;
  maxProjects?: number;
  maxStorage?: number;
  settings?: any;
  createdAt?: string;
  updatedAt?: string;
}

export class OrganizationService {
  /**
   * Get all organizations the current user has access to
   */
  async getUserOrganizations(): Promise<Organization[]> {
    try {
      const response = await fetch('/api/organizations/user-organizations');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch organizations: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user organizations:', error);
      throw error;
    }
  }
  
  /**
   * Get detailed information about a specific organization
   */
  async getOrganizationDetails(organizationId: number): Promise<Organization> {
    try {
      const response = await fetch(`/api/organizations/${organizationId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch organization details: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching organization ${organizationId}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new organization (super admin only)
   */
  async createOrganization(data: {
    name: string;
    slug: string;
    domain?: string;
    logo?: string;
    tier?: string;
    status?: string;
    maxUsers?: number;
    maxProjects?: number;
    maxStorage?: number;
    settings?: any;
  }): Promise<Organization> {
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 
          `Failed to create organization: ${response.statusText}`
        );
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing organization (organization admin or super admin only)
   */
  async updateOrganization(
    organizationId: number,
    data: Partial<Organization>
  ): Promise<Organization> {
    try {
      const response = await fetch(`/api/organizations/${organizationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 
          `Failed to update organization: ${response.statusText}`
        );
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating organization ${organizationId}:`, error);
      throw error;
    }
  }
  
  /**
   * Set the default organization for the current user
   */
  async setDefaultOrganization(organizationId: number): Promise<void> {
    try {
      const response = await fetch('/api/organizations/set-default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 
          `Failed to set default organization: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error('Error setting default organization:', error);
      throw error;
    }
  }
  
  /**
   * Convert an Organization to Tenant interface for context compatibility
   */
  toTenant(org: Organization): Tenant {
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      logo: org.logo,
      settings: org.settings,
      tier: org.tier
    };
  }
}

export const organizationService = new OrganizationService();
export default organizationService;