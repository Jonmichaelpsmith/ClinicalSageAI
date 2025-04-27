/**
 * Security Service
 * 
 * This service provides user authentication, access control, and security features
 * for the TrialSage platform, supporting a multi-tenant model where CRO master
 * accounts can manage multiple biotech client accounts.
 */

import { jwtDecode } from 'jwt-decode';

const API_BASE = '/api/security';

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  CRO_ADMIN: 'cro_admin',
  CRO_USER: 'cro_user',
  CLIENT_ADMIN: 'client_admin',
  CLIENT_USER: 'client_user',
  REGULATORY_SPECIALIST: 'regulatory_specialist',
  MEDICAL_WRITER: 'medical_writer',
  CLINICAL_RESEARCHER: 'clinical_researcher',
  DATA_MANAGER: 'data_manager',
  STATISTICIAN: 'statistician',
  APPROVER: 'approver',
  AUDITOR: 'auditor'
};

// Resource types for access control
export const RESOURCE_TYPES = {
  MODULE: 'module',
  DOCUMENT: 'document',
  COLLECTION: 'collection',
  WORKFLOW: 'workflow',
  TASK: 'task',
  REPORT: 'report',
  SUBMISSION: 'submission',
  ORGANIZATION: 'organization'
};

// Permission types
export const PERMISSIONS = {
  VIEW: 'view',
  EDIT: 'edit',
  CREATE: 'create',
  DELETE: 'delete',
  APPROVE: 'approve',
  ASSIGN: 'assign',
  ADMIN: 'admin'
};

class SecurityService {
  constructor() {
    this.isInitialized = false;
    this.config = {
      multiTenant: true,
      blockchainVerification: false,
      passwordPolicyStrength: 'high',
      sessionTimeout: 60 * 60 * 1000, // 1 hour
      refreshTokenEnabled: true
    };
    this.currentUser = null;
    this.currentOrganization = null;
    this.authToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.organizations = new Map();
    this.users = new Map();
    this.permissions = new Map();
    this.accessControlCache = new Map();
    this.sessionExpiryTimer = null;
  }

  /**
   * Initialize Security service
   * @param {Object} options - Initialization options
   * @returns {Promise<Object>} - Initialization status
   */
  async initialize(options = {}) {
    if (this.isInitialized) {
      console.log('SecurityService already initialized');
      return { status: 'already_initialized', config: this.config };
    }
    
    console.log('Initializing SecurityService...');
    
    try {
      // Update configuration
      this.config = {
        ...this.config,
        ...options
      };
      
      // Check for existing session
      const storedToken = localStorage.getItem('auth_token');
      const storedRefreshToken = localStorage.getItem('refresh_token');
      
      if (storedToken) {
        try {
          // Validate token
          const decoded = jwtDecode(storedToken);
          
          if (decoded.exp * 1000 > Date.now()) {
            // Token is still valid
            this.authToken = storedToken;
            this.refreshToken = storedRefreshToken;
            this.tokenExpiry = new Date(decoded.exp * 1000);
            
            // Set current user
            this.currentUser = {
              id: decoded.sub,
              username: decoded.username,
              email: decoded.email,
              roles: decoded.roles || [],
              organizationId: decoded.organizationId,
              permissions: decoded.permissions || []
            };
            
            // Start session expiry timer
            this.startSessionExpiryTimer();
            
            // Load current organization
            if (this.currentUser.organizationId) {
              await this.loadOrganization(this.currentUser.organizationId);
            }
          } else {
            // Token expired, try to refresh
            if (storedRefreshToken && this.config.refreshTokenEnabled) {
              await this.refreshAuthToken(storedRefreshToken);
            }
          }
        } catch (tokenError) {
          console.warn('Invalid token:', tokenError);
          // Clear invalid tokens
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
        }
      }
      
      this.isInitialized = true;
      console.log('SecurityService initialized successfully');
      
      return {
        status: 'success',
        config: this.config,
        authenticated: !!this.currentUser,
        user: this.currentUser
      };
    } catch (error) {
      console.error('Failed to initialize SecurityService:', error);
      
      return {
        status: 'error',
        error: error.message
      };
    }
  }
  
  /**
   * Login user
   * @param {string} username - Username
   * @param {string} password - Password
   * @param {Object} options - Login options
   * @returns {Promise<Object>} - Login result
   */
  async login(username, password, options = {}) {
    try {
      // In production, would call API
      // const response = await fetch(`${API_BASE}/login`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ username, password })
      // });
      
      // if (!response.ok) {
      //   const error = await response.json();
      //   throw new Error(error.message || 'Login failed');
      // }
      
      // const data = await response.json();
      
      // For now, simulate login
      // In production, this would be handled by the server
      const mockUsers = [
        {
          id: 'user-1',
          username: 'admin',
          password: 'password',
          email: 'admin@trialsage.com',
          roles: [USER_ROLES.ADMIN],
          organizationId: 'org-1',
          permissions: [
            { resource: '*', type: '*', permission: '*' }
          ]
        },
        {
          id: 'user-2',
          username: 'cro_admin',
          password: 'password',
          email: 'cro_admin@trialsage.com',
          roles: [USER_ROLES.CRO_ADMIN],
          organizationId: 'org-2',
          permissions: [
            { resource: 'organization:org-2', type: RESOURCE_TYPES.ORGANIZATION, permission: PERMISSIONS.ADMIN },
            { resource: 'module:*', type: RESOURCE_TYPES.MODULE, permission: PERMISSIONS.VIEW }
          ]
        },
        {
          id: 'user-3',
          username: 'regulatory',
          password: 'password',
          email: 'regulatory@trialsage.com',
          roles: [USER_ROLES.REGULATORY_SPECIALIST, USER_ROLES.CRO_USER],
          organizationId: 'org-2',
          permissions: [
            { resource: 'module:ind-wizard', type: RESOURCE_TYPES.MODULE, permission: PERMISSIONS.EDIT },
            { resource: 'module:trial-vault', type: RESOURCE_TYPES.MODULE, permission: PERMISSIONS.VIEW }
          ]
        },
        {
          id: 'user-4',
          username: 'client_admin',
          password: 'password',
          email: 'client_admin@biotech.com',
          roles: [USER_ROLES.CLIENT_ADMIN],
          organizationId: 'org-3',
          parentOrgId: 'org-2',
          permissions: [
            { resource: 'organization:org-3', type: RESOURCE_TYPES.ORGANIZATION, permission: PERMISSIONS.ADMIN },
            { resource: 'module:*', type: RESOURCE_TYPES.MODULE, permission: PERMISSIONS.VIEW }
          ]
        }
      ];
      
      // Find user
      const user = mockUsers.find(u => u.username === username);
      
      if (!user || user.password !== password) {
        throw new Error('Invalid username or password');
      }
      
      // Generate token
      const now = Math.floor(Date.now() / 1000);
      const expiryTime = now + 3600; // 1 hour
      
      const tokenPayload = {
        sub: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        organizationId: user.organizationId,
        permissions: user.permissions,
        iat: now,
        exp: expiryTime
      };
      
      // In production, this would be signed with a server-side secret
      const mockToken = btoa(JSON.stringify(tokenPayload));
      const mockRefreshToken = `refresh_${mockToken}`;
      
      // Set tokens and user
      this.authToken = mockToken;
      this.refreshToken = mockRefreshToken;
      this.tokenExpiry = new Date(expiryTime * 1000);
      
      this.currentUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        organizationId: user.organizationId,
        permissions: user.permissions
      };
      
      // Store tokens
      localStorage.setItem('auth_token', mockToken);
      
      if (this.config.refreshTokenEnabled) {
        localStorage.setItem('refresh_token', mockRefreshToken);
      }
      
      // Start session expiry timer
      this.startSessionExpiryTimer();
      
      // Load organization
      if (user.organizationId) {
        await this.loadOrganization(user.organizationId);
      }
      
      // Cache user
      this.users.set(user.id, this.currentUser);
      
      return {
        success: true,
        user: this.currentUser,
        organization: this.currentOrganization
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  /**
   * Logout current user
   * @returns {Promise<Object>} - Logout result
   */
  async logout() {
    try {
      // In production, would call API
      // await fetch(`${API_BASE}/logout`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.authToken}`
      //   }
      // });
      
      // Clear tokens and user
      this.authToken = null;
      this.refreshToken = null;
      this.tokenExpiry = null;
      this.currentUser = null;
      this.currentOrganization = null;
      
      // Clear session expiry timer
      if (this.sessionExpiryTimer) {
        clearTimeout(this.sessionExpiryTimer);
        this.sessionExpiryTimer = null;
      }
      
      // Clear stored tokens
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
  
  /**
   * Refresh authentication token
   * @param {string} refreshToken - Refresh token (optional, uses stored token if not provided)
   * @returns {Promise<Object>} - Refresh result
   */
  async refreshAuthToken(refreshToken = null) {
    if (!this.config.refreshTokenEnabled) {
      throw new Error('Token refresh is not enabled');
    }
    
    try {
      const tokenToUse = refreshToken || this.refreshToken;
      
      if (!tokenToUse) {
        throw new Error('No refresh token available');
      }
      
      // In production, would call API
      // const response = await fetch(`${API_BASE}/refresh-token`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ refreshToken: tokenToUse })
      // });
      
      // if (!response.ok) {
      //   const error = await response.json();
      //   throw new Error(error.message || 'Token refresh failed');
      // }
      
      // const data = await response.json();
      
      // For now, simulate token refresh
      // In production, this would be handled by the server
      if (!tokenToUse.startsWith('refresh_')) {
        throw new Error('Invalid refresh token');
      }
      
      // Extract user info from token
      const encodedToken = tokenToUse.substring(8); // Remove 'refresh_' prefix
      const tokenData = JSON.parse(atob(encodedToken));
      
      // Generate new tokens
      const now = Math.floor(Date.now() / 1000);
      const expiryTime = now + 3600; // 1 hour
      
      const tokenPayload = {
        ...tokenData,
        iat: now,
        exp: expiryTime
      };
      
      // In production, this would be signed with a server-side secret
      const mockToken = btoa(JSON.stringify(tokenPayload));
      const mockRefreshToken = `refresh_${mockToken}`;
      
      // Set new tokens
      this.authToken = mockToken;
      this.refreshToken = mockRefreshToken;
      this.tokenExpiry = new Date(expiryTime * 1000);
      
      // Update current user from token
      this.currentUser = {
        id: tokenPayload.sub,
        username: tokenPayload.username,
        email: tokenPayload.email,
        roles: tokenPayload.roles,
        organizationId: tokenPayload.organizationId,
        permissions: tokenPayload.permissions
      };
      
      // Store new tokens
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('refresh_token', mockRefreshToken);
      
      // Restart session expiry timer
      this.startSessionExpiryTimer();
      
      return {
        success: true,
        user: this.currentUser
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      
      // Clear tokens and user on refresh failure
      this.authToken = null;
      this.refreshToken = null;
      this.tokenExpiry = null;
      this.currentUser = null;
      this.currentOrganization = null;
      
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      
      throw error;
    }
  }
  
  /**
   * Start session expiry timer
   */
  startSessionExpiryTimer() {
    // Clear existing timer
    if (this.sessionExpiryTimer) {
      clearTimeout(this.sessionExpiryTimer);
      this.sessionExpiryTimer = null;
    }
    
    if (!this.tokenExpiry) {
      return;
    }
    
    const timeUntilExpiry = this.tokenExpiry.getTime() - Date.now();
    const refreshThreshold = 5 * 60 * 1000; // 5 minutes before expiry
    
    if (timeUntilExpiry <= 0) {
      // Token already expired
      this.logout();
      return;
    }
    
    if (timeUntilExpiry <= refreshThreshold && this.config.refreshTokenEnabled) {
      // Token is close to expiring, refresh it now
      this.refreshAuthToken().catch(() => {
        // If refresh fails, log out
        this.logout();
      });
      return;
    }
    
    // Set timer to refresh token before expiry
    const refreshTime = timeUntilExpiry - refreshThreshold;
    
    this.sessionExpiryTimer = setTimeout(() => {
      if (this.config.refreshTokenEnabled && this.refreshToken) {
        this.refreshAuthToken().catch(() => {
          // If refresh fails, log out
          this.logout();
        });
      } else {
        // No refresh token, just log out
        this.logout();
      }
    }, refreshTime);
  }
  
  /**
   * Load organization data
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Object>} - Organization data
   */
  async loadOrganization(organizationId) {
    try {
      // Check cache
      if (this.organizations.has(organizationId)) {
        this.currentOrganization = this.organizations.get(organizationId);
        return this.currentOrganization;
      }
      
      // In production, would call API
      // const response = await fetch(`${API_BASE}/organizations/${organizationId}`, {
      //   headers: {
      //     'Authorization': `Bearer ${this.authToken}`
      //   }
      // });
      
      // if (!response.ok) {
      //   const error = await response.json();
      //   throw new Error(error.message || 'Failed to load organization');
      // }
      
      // const organization = await response.json();
      
      // For now, simulate organization data
      const mockOrganizations = [
        {
          id: 'org-1',
          name: 'TrialSage Inc.',
          type: 'platform_admin',
          features: ['all'],
          modules: ['all'],
          parentId: null,
          childOrganizations: ['org-2']
        },
        {
          id: 'org-2',
          name: 'CRO Master Account',
          type: 'cro',
          features: ['ind-wizard', 'trial-vault', 'csr-intelligence', 'study-architect'],
          modules: ['ind-wizard', 'trial-vault', 'csr-intelligence', 'study-architect'],
          parentId: 'org-1',
          childOrganizations: ['org-3', 'org-4']
        },
        {
          id: 'org-3',
          name: 'Biotech Client A',
          type: 'biotech',
          features: ['trial-vault', 'csr-intelligence'],
          modules: ['trial-vault', 'csr-intelligence'],
          parentId: 'org-2',
          childOrganizations: []
        },
        {
          id: 'org-4',
          name: 'Biotech Client B',
          type: 'biotech',
          features: ['ind-wizard', 'trial-vault'],
          modules: ['ind-wizard', 'trial-vault'],
          parentId: 'org-2',
          childOrganizations: []
        }
      ];
      
      const organization = mockOrganizations.find(org => org.id === organizationId);
      
      if (!organization) {
        throw new Error(`Organization not found: ${organizationId}`);
      }
      
      // Cache organization
      this.organizations.set(organizationId, organization);
      
      // Set current organization
      this.currentOrganization = organization;
      
      return organization;
    } catch (error) {
      console.error(`Error loading organization ${organizationId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get child organizations (for multi-tenant CRO accounts)
   * @returns {Promise<Array>} - Child organizations
   */
  async getChildOrganizations() {
    if (!this.currentUser || !this.currentOrganization) {
      throw new Error('User not authenticated');
    }
    
    try {
      // In production, would call API
      // const response = await fetch(`${API_BASE}/organizations/${this.currentOrganization.id}/children`, {
      //   headers: {
      //     'Authorization': `Bearer ${this.authToken}`
      //   }
      // });
      
      // if (!response.ok) {
      //   const error = await response.json();
      //   throw new Error(error.message || 'Failed to load child organizations');
      // }
      
      // const children = await response.json();
      
      // For now, use cached organization data
      if (!this.currentOrganization.childOrganizations || this.currentOrganization.childOrganizations.length === 0) {
        return [];
      }
      
      const childOrgs = [];
      
      for (const childId of this.currentOrganization.childOrganizations) {
        if (this.organizations.has(childId)) {
          childOrgs.push(this.organizations.get(childId));
        } else {
          // Load organization if not cached
          try {
            const org = await this.loadOrganization(childId);
            childOrgs.push(org);
          } catch (orgError) {
            console.warn(`Failed to load child organization ${childId}:`, orgError);
          }
        }
      }
      
      return childOrgs;
    } catch (error) {
      console.error('Error getting child organizations:', error);
      throw error;
    }
  }
  
  /**
   * Switch active organization (for CRO users managing multiple clients)
   * @param {string} organizationId - Organization ID to switch to
   * @returns {Promise<Object>} - Switch result
   */
  async switchOrganization(organizationId) {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }
    
    try {
      // Check if organization is accessible
      const currentOrgId = this.currentOrganization?.id;
      
      if (currentOrgId === organizationId) {
        return { success: true, organization: this.currentOrganization };
      }
      
      // Check if target org is a child of current org
      if (this.currentOrganization && this.currentOrganization.childOrganizations) {
        if (!this.currentOrganization.childOrganizations.includes(organizationId)) {
          throw new Error('Organization not accessible');
        }
      } else {
        // Admin can access any organization
        if (!this.hasRole(USER_ROLES.ADMIN)) {
          throw new Error('Organization not accessible');
        }
      }
      
      // Load organization
      const organization = await this.loadOrganization(organizationId);
      
      // In production, would update session context on server
      // const response = await fetch(`${API_BASE}/switch-context`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.authToken}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ organizationId })
      // });
      
      // Update current organization
      this.currentOrganization = organization;
      
      // Clear access control cache
      this.accessControlCache.clear();
      
      return {
        success: true,
        organization
      };
    } catch (error) {
      console.error(`Error switching to organization ${organizationId}:`, error);
      throw error;
    }
  }
  
  /**
   * Check if current user has role
   * @param {string} role - Role to check
   * @returns {boolean} - Whether user has role
   */
  hasRole(role) {
    if (!this.currentUser || !this.currentUser.roles) {
      return false;
    }
    
    return this.currentUser.roles.includes(role) || this.currentUser.roles.includes(USER_ROLES.ADMIN);
  }
  
  /**
   * Check if current user has permission for resource
   * @param {string} resource - Resource identifier
   * @param {string} permission - Permission type
   * @returns {boolean} - Whether user has permission
   */
  hasPermission(resource, permission) {
    if (!this.currentUser) {
      return false;
    }
    
    // Admin has all permissions
    if (this.hasRole(USER_ROLES.ADMIN)) {
      return true;
    }
    
    // Check permission cache
    const cacheKey = `${resource}:${permission}`;
    if (this.accessControlCache.has(cacheKey)) {
      return this.accessControlCache.get(cacheKey);
    }
    
    let hasPermission = false;
    
    // Check user permissions
    if (this.currentUser.permissions) {
      // Check for direct permission
      const directPermission = this.currentUser.permissions.find(p => 
        (p.resource === resource || p.resource === '*') &&
        (p.permission === permission || p.permission === '*')
      );
      
      if (directPermission) {
        hasPermission = true;
      } else {
        // Check for wildcard resource permissions (e.g., module:* for all modules)
        const resourceType = resource.split(':')[0];
        const wildcardPermission = this.currentUser.permissions.find(p => 
          p.resource === `${resourceType}:*` &&
          (p.permission === permission || p.permission === '*')
        );
        
        if (wildcardPermission) {
          hasPermission = true;
        }
      }
    }
    
    // Cache result
    this.accessControlCache.set(cacheKey, hasPermission);
    
    return hasPermission;
  }
  
  /**
   * Get available modules for current user/organization
   * @returns {Array} - Available modules
   */
  getAvailableModules() {
    if (!this.currentUser || !this.currentOrganization) {
      return [];
    }
    
    // Admin can access all modules
    if (this.hasRole(USER_ROLES.ADMIN)) {
      return [
        'ind-wizard',
        'trial-vault',
        'csr-intelligence',
        'study-architect',
        'analytics',
        'admin'
      ];
    }
    
    // Use organization's available modules
    if (this.currentOrganization.modules) {
      if (this.currentOrganization.modules.includes('all')) {
        return [
          'ind-wizard',
          'trial-vault',
          'csr-intelligence',
          'study-architect',
          'analytics'
        ];
      }
      
      return this.currentOrganization.modules;
    }
    
    return [];
  }
  
  /**
   * Reset password
   * @param {string} email - User email
   * @returns {Promise<Object>} - Reset result
   */
  async resetPassword(email) {
    try {
      // In production, would call API
      // const response = await fetch(`${API_BASE}/reset-password`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ email })
      // });
      
      // if (!response.ok) {
      //   const error = await response.json();
      //   throw new Error(error.message || 'Password reset failed');
      // }
      
      // Simulate password reset
      console.log(`Would send password reset email to: ${email}`);
      
      return {
        success: true,
        message: 'Password reset email sent'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
  
  /**
   * Update current user's password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} - Update result
   */
  async updatePassword(currentPassword, newPassword) {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }
    
    try {
      // In production, would call API
      // const response = await fetch(`${API_BASE}/update-password`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.authToken}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ currentPassword, newPassword })
      // });
      
      // if (!response.ok) {
      //   const error = await response.json();
      //   throw new Error(error.message || 'Password update failed');
      // }
      
      // Simulate password update
      console.log(`Would update password for user: ${this.currentUser.username}`);
      
      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  }
  
  /**
   * Verify if a document has been blockchain-verified
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} - Verification result
   */
  async verifyDocumentAuthenticity(documentId) {
    if (!this.config.blockchainVerification) {
      return {
        verified: false,
        message: 'Blockchain verification not enabled'
      };
    }
    
    try {
      // In production, would call API
      // const response = await fetch(`${API_BASE}/verify-document/${documentId}`, {
      //   headers: {
      //     'Authorization': `Bearer ${this.authToken}`
      //   }
      // });
      
      // if (!response.ok) {
      //   const error = await response.json();
      //   throw new Error(error.message || 'Document verification failed');
      // }
      
      // const result = await response.json();
      
      // Simulate verification
      const verified = documentId.length > 5; // Mock verification
      
      return {
        verified,
        timestamp: new Date().toISOString(),
        hash: `hash_${documentId}`,
        message: verified ? 'Document verified' : 'Document not verified'
      };
    } catch (error) {
      console.error(`Error verifying document ${documentId}:`, error);
      throw error;
    }
  }
  
  /**
   * Request audit trail for resource
   * @param {string} resourceType - Resource type (document, collection, etc.)
   * @param {string} resourceId - Resource ID
   * @returns {Promise<Array>} - Audit trail events
   */
  async getAuditTrail(resourceType, resourceId) {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }
    
    try {
      // In production, would call API
      // const response = await fetch(`${API_BASE}/audit-trail/${resourceType}/${resourceId}`, {
      //   headers: {
      //     'Authorization': `Bearer ${this.authToken}`
      //   }
      // });
      
      // if (!response.ok) {
      //   const error = await response.json();
      //   throw new Error(error.message || 'Failed to retrieve audit trail');
      // }
      
      // const trail = await response.json();
      
      // Simulate audit trail
      const now = new Date();
      const trail = [
        {
          timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          user: 'user-1',
          username: 'admin',
          action: 'CREATE',
          resourceType,
          resourceId,
          details: 'Resource created'
        },
        {
          timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
          user: 'user-2',
          username: 'cro_admin',
          action: 'MODIFY',
          resourceType,
          resourceId,
          details: 'Resource modified'
        },
        {
          timestamp: new Date().toISOString(),
          user: 'user-3',
          username: 'regulatory',
          action: 'VIEW',
          resourceType,
          resourceId,
          details: 'Resource viewed'
        }
      ];
      
      return trail;
    } catch (error) {
      console.error(`Error getting audit trail for ${resourceType}:${resourceId}:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const securityService = new SecurityService();
export default securityService;