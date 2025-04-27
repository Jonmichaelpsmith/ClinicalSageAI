/**
 * Security Service
 * 
 * This service manages authentication, authorization, and multi-tenant access control
 * for the TrialSage platform, with special support for CRO master accounts managing
 * multiple biotech clients.
 */

import { apiRequest } from '../lib/queryClient';

// Organization types
const ORGANIZATION_TYPES = {
  CRO: 'cro',           // Contract Research Organization (master account)
  BIOTECH: 'biotech',    // Biotech company (client account)
  PHARMA: 'pharma',      // Pharmaceutical company (client account)
  MEDICAL_DEVICE: 'medical_device', // Medical device company (client account)
  ACADEMIC: 'academic'   // Academic institution (client account)
};

// User roles
const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  WRITER: 'writer',
  REVIEWER: 'reviewer',
  VIEWER: 'viewer'
};

// Permission levels for module access
const ACCESS_LEVELS = {
  NONE: 0,
  READ: 1,
  WRITE: 2,
  ADMIN: 3
};

class SecurityService {
  constructor() {
    this.authenticated = false;
    this.user = null;
    this.currentOrganization = null;
    this.childOrganizations = [];
    this.parentOrganization = null;
    this.availableModules = [];
    this.permissions = {};
    this.token = null;
    this.initialized = false;
    this.blockchainEnabled = false;
    this.serviceSettings = {};
  }

  /**
   * Initialize security service
   * @returns {Promise<{authenticated: boolean, user: Object|null}>} Authentication result
   */
  async initialize(options = {}) {
    try {
      // In a real implementation, would fetch from server
      // Simulate authentication status check
      const authResult = await this._fetchAuthStatus();
      
      this.authenticated = authResult.authenticated;
      
      if (this.authenticated) {
        this.user = authResult.user;
        this.token = authResult.token;
        this.currentOrganization = authResult.organization;
        this.parentOrganization = authResult.parentOrganization || null;
        this.availableModules = authResult.availableModules || [];
        this.permissions = authResult.permissions || {};
        
        // Fetch child organizations if this is a CRO
        if (this.currentOrganization?.type === ORGANIZATION_TYPES.CRO) {
          await this.getChildOrganizations();
        }
      }
      
      this.blockchainEnabled = options.enableBlockchain || false;
      this.serviceSettings = options.settings || {};
      this.initialized = true;
      
      return {
        authenticated: this.authenticated,
        user: this.user
      };
    } catch (error) {
      console.error('Security service initialization error:', error);
      this.initialized = true;
      return {
        authenticated: false,
        error: error.message
      };
    }
  }

  /**
   * Log in a user
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<{success: boolean, user: Object|null, error: string|null}>} Login result
   */
  async login(username, password) {
    try {
      // In a real implementation, would call API
      // Simulate login API call
      const response = await this._simulateApiCall({
        success: true,
        user: {
          id: 1,
          username: username,
          email: `${username}@example.com`,
          firstName: 'Demo',
          lastName: 'User',
          roles: [USER_ROLES.ADMIN]
        },
        token: 'demo-token-12345',
        organization: {
          id: 1,
          name: 'Concept2Cures',
          type: ORGANIZATION_TYPES.CRO
        },
        availableModules: ['ind-wizard', 'trial-vault', 'csr-intelligence', 'study-architect', 'analytics', 'admin'],
        permissions: {
          'ind-wizard': ACCESS_LEVELS.ADMIN,
          'trial-vault': ACCESS_LEVELS.ADMIN,
          'csr-intelligence': ACCESS_LEVELS.ADMIN,
          'study-architect': ACCESS_LEVELS.ADMIN,
          'analytics': ACCESS_LEVELS.ADMIN,
          'admin': ACCESS_LEVELS.ADMIN
        }
      });
      
      this.authenticated = true;
      this.user = response.user;
      this.token = response.token;
      this.currentOrganization = response.organization;
      this.availableModules = response.availableModules;
      this.permissions = response.permissions;
      
      // Fetch child organizations if this is a CRO
      if (this.currentOrganization?.type === ORGANIZATION_TYPES.CRO) {
        await this.getChildOrganizations();
      }
      
      return {
        success: true,
        user: this.user,
        organization: this.currentOrganization
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Log out the current user
   * @returns {Promise<{success: boolean, error: string|null}>} Logout result
   */
  async logout() {
    try {
      // In a real implementation, would call API
      // Simulate logout API call
      await this._simulateApiCall({ success: true });
      
      this.authenticated = false;
      this.user = null;
      this.token = null;
      this.currentOrganization = null;
      this.parentOrganization = null;
      this.childOrganizations = [];
      this.availableModules = [];
      this.permissions = {};
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get child organizations for a CRO master account
   * @returns {Promise<Array>} Child organizations
   */
  async getChildOrganizations() {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated');
      }
      
      if (this.currentOrganization?.type !== ORGANIZATION_TYPES.CRO) {
        // Only CROs can have child organizations
        this.childOrganizations = [];
        return this.childOrganizations;
      }
      
      // In a real implementation, would call API
      // Simulate child organizations API call
      const response = await this._simulateApiCall({
        organizations: [
          {
            id: 2,
            name: 'BioInnovate Therapeutics',
            type: ORGANIZATION_TYPES.BIOTECH,
            parent: this.currentOrganization.id
          },
          {
            id: 3,
            name: 'GenomeWave Pharma',
            type: ORGANIZATION_TYPES.PHARMA,
            parent: this.currentOrganization.id
          },
          {
            id: 4,
            name: 'NeuroCrest Biologics',
            type: ORGANIZATION_TYPES.BIOTECH,
            parent: this.currentOrganization.id
          },
          {
            id: 5,
            name: 'MedTech Innovations',
            type: ORGANIZATION_TYPES.MEDICAL_DEVICE,
            parent: this.currentOrganization.id
          }
        ]
      });
      
      this.childOrganizations = response.organizations;
      return this.childOrganizations;
    } catch (error) {
      console.error('Error fetching child organizations:', error);
      return [];
    }
  }

  /**
   * Switch to a different organization context
   * @param {number} organizationId - Organization ID to switch to
   * @returns {Promise<{success: boolean, organization: Object|null, error: string|null}>} Switch result
   */
  async switchOrganization(organizationId) {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated');
      }
      
      // Check if target organization is the current one
      if (this.currentOrganization?.id === organizationId) {
        return {
          success: true,
          organization: this.currentOrganization
        };
      }
      
      // Check if target organization is a child organization
      const targetOrg = this.childOrganizations.find(org => org.id === organizationId);
      
      if (!targetOrg) {
        throw new Error('Organization not found or access denied');
      }
      
      // In a real implementation, would call API
      // Simulate organization switch API call
      const response = await this._simulateApiCall({
        success: true,
        organization: targetOrg,
        parentOrganization: this.currentOrganization,
        availableModules: ['ind-wizard', 'trial-vault', 'csr-intelligence', 'study-architect'],
        permissions: {
          'ind-wizard': ACCESS_LEVELS.ADMIN,
          'trial-vault': ACCESS_LEVELS.ADMIN,
          'csr-intelligence': ACCESS_LEVELS.ADMIN,
          'study-architect': ACCESS_LEVELS.ADMIN
        }
      });
      
      // Store original organization as parent
      this.parentOrganization = this.currentOrganization;
      
      // Update current organization
      this.currentOrganization = response.organization;
      this.availableModules = response.availableModules;
      this.permissions = response.permissions;
      
      return {
        success: true,
        organization: this.currentOrganization
      };
    } catch (error) {
      console.error('Error switching organization:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Return to parent organization (for CRO users who switched to a client)
   * @returns {Promise<{success: boolean, organization: Object|null, error: string|null}>} Switch result
   */
  async returnToParentOrganization() {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated');
      }
      
      if (!this.parentOrganization) {
        throw new Error('No parent organization available');
      }
      
      // In a real implementation, would call API
      // Simulate return to parent organization API call
      const response = await this._simulateApiCall({
        success: true,
        organization: this.parentOrganization,
        parentOrganization: null,
        availableModules: ['ind-wizard', 'trial-vault', 'csr-intelligence', 'study-architect', 'analytics', 'admin'],
        permissions: {
          'ind-wizard': ACCESS_LEVELS.ADMIN,
          'trial-vault': ACCESS_LEVELS.ADMIN,
          'csr-intelligence': ACCESS_LEVELS.ADMIN,
          'study-architect': ACCESS_LEVELS.ADMIN,
          'analytics': ACCESS_LEVELS.ADMIN,
          'admin': ACCESS_LEVELS.ADMIN
        }
      });
      
      // Swap organizations
      this.currentOrganization = this.parentOrganization;
      this.parentOrganization = null;
      this.availableModules = response.availableModules;
      this.permissions = response.permissions;
      
      // Refresh child organizations
      await this.getChildOrganizations();
      
      return {
        success: true,
        organization: this.currentOrganization
      };
    } catch (error) {
      console.error('Error returning to parent organization:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if the user has permission for a module
   * @param {string} moduleId - Module ID
   * @param {number} requiredLevel - Required access level
   * @returns {boolean} Whether the user has permission
   */
  hasPermission(moduleId, requiredLevel = ACCESS_LEVELS.READ) {
    if (!this.authenticated) {
      return false;
    }
    
    const permissionLevel = this.permissions[moduleId] || ACCESS_LEVELS.NONE;
    return permissionLevel >= requiredLevel;
  }

  /**
   * Get available modules for the current user
   * @returns {Array} Available module IDs
   */
  getAvailableModules() {
    if (!this.authenticated) {
      return [];
    }
    
    return this.availableModules;
  }

  /**
   * Fetch authentication status (simulated)
   * @private
   * @returns {Promise<Object>} Authentication status
   */
  async _fetchAuthStatus() {
    // In a real implementation, would call API
    // Simulate a non-authenticated state by default
    return this._simulateApiCall({
      authenticated: false,
      user: null
    });
  }

  /**
   * Simulate API call (helper for demo)
   * @private
   * @param {Object} response - Simulated response
   * @returns {Promise<Object>} Simulated response
   */
  async _simulateApiCall(response) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(response);
      }, 300);
    });
  }
}

const securityService = new SecurityService();
export default securityService;