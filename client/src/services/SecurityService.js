/**
 * Security Service
 * 
 * Enterprise-grade security service that provides authentication, authorization,
 * multi-tenant isolation, audit logging, and compliance management for the TrialSage platform.
 * Designed to support CRO master accounts managing multiple biotech customers with role-based
 * access control and strict data segregation.
 */

// Permission types
export const PERMISSION_TYPES = {
  VIEW: 'view',
  EDIT: 'edit',
  CREATE: 'create',
  DELETE: 'delete',
  APPROVE: 'approve',
  EXPORT: 'export',
  SHARE: 'share',
  ADMIN: 'admin'
};

// User roles
export const USER_ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  CRO_ADMIN: 'cro_admin',
  CLIENT_ADMIN: 'client_admin',
  PROJECT_MANAGER: 'project_manager',
  REGULATORY_MANAGER: 'regulatory_manager',
  MEDICAL_WRITER: 'medical_writer',
  QUALITY_REVIEWER: 'quality_reviewer',
  DATA_MANAGER: 'data_manager',
  CLINICAL_SCIENTIST: 'clinical_scientist',
  VIEWER: 'viewer'
};

// Resource types
export const RESOURCE_TYPES = {
  PROJECT: 'project',
  DOCUMENT: 'document',
  SUBMISSION: 'submission',
  MODULE: 'module',
  TEMPLATE: 'template',
  DASHBOARD: 'dashboard',
  WORKFLOW: 'workflow',
  USER: 'user',
  CLIENT: 'client',
  SETTINGS: 'settings'
};

// Security event types
export const SECURITY_EVENTS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  PERMISSION_CHANGE: 'permission_change',
  ROLE_CHANGE: 'role_change',
  RESOURCE_ACCESS: 'resource_access',
  FAILED_LOGIN: 'failed_login',
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  PASSWORD_CHANGED: 'password_changed',
  MFA_ENABLED: 'mfa_enabled',
  MFA_DISABLED: 'mfa_disabled'
};

class SecurityService {
  constructor() {
    this.apiBase = '/api/security';
    this.currentUser = null;
    this.currentOrganization = null;
    this.clients = [];
    this.permissionCache = new Map();
    this.roleCache = new Map();
    this.securityEventListeners = new Map();
  }

  /**
   * Get current authenticated user
   * @returns {Promise<Object>} - Current user data
   */
  async getCurrentUser() {
    if (this.currentUser) {
      return Promise.resolve(this.currentUser);
    }

    try {
      const response = await fetch(`${this.apiBase}/users/me`);
      if (!response.ok) {
        throw new Error(`Failed to fetch current user: ${response.statusText}`);
      }
      
      this.currentUser = await response.json();
      return this.currentUser;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  /**
   * Get current organization
   * @returns {Promise<Object>} - Current organization data
   */
  async getCurrentOrganization() {
    if (this.currentOrganization) {
      return Promise.resolve(this.currentOrganization);
    }

    try {
      const response = await fetch(`${this.apiBase}/organizations/current`);
      if (!response.ok) {
        throw new Error(`Failed to fetch organization: ${response.statusText}`);
      }
      
      this.currentOrganization = await response.json();
      return this.currentOrganization;
    } catch (error) {
      console.error('Error fetching organization:', error);
      throw error;
    }
  }

  /**
   * Authenticate user (login)
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} rememberMe - Remember login
   * @returns {Promise<Object>} - Authentication result
   */
  async login(email, password, rememberMe = false) {
    try {
      const response = await fetch(`${this.apiBase}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, rememberMe })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const authResult = await response.json();
      this.currentUser = authResult.user;
      this._logSecurityEvent(SECURITY_EVENTS.LOGIN, { userId: this.currentUser.id });
      return authResult;
    } catch (error) {
      console.error('Login error:', error);
      this._logSecurityEvent(SECURITY_EVENTS.FAILED_LOGIN, { email });
      throw error;
    }
  }

  /**
   * Logout current user
   * @returns {Promise<boolean>} - Logout success
   */
  async logout() {
    try {
      const userId = this.currentUser?.id;
      const response = await fetch(`${this.apiBase}/auth/logout`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Failed to logout: ${response.statusText}`);
      }

      this.currentUser = null;
      this.permissionCache.clear();
      this.roleCache.clear();
      
      if (userId) {
        this._logSecurityEvent(SECURITY_EVENTS.LOGOUT, { userId });
      }
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Complete multi-factor authentication
   * @param {string} code - MFA verification code
   * @returns {Promise<Object>} - Authentication result
   */
  async completeMfa(code) {
    try {
      const response = await fetch(`${this.apiBase}/auth/mfa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'MFA verification failed');
      }

      const authResult = await response.json();
      this.currentUser = authResult.user;
      return authResult;
    } catch (error) {
      console.error('MFA verification error:', error);
      throw error;
    }
  }

  /**
   * Setup multi-factor authentication
   * @returns {Promise<Object>} - MFA setup data
   */
  async setupMfa() {
    try {
      const response = await fetch(`${this.apiBase}/auth/mfa/setup`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Failed to setup MFA: ${response.statusText}`);
      }

      const setupData = await response.json();
      return setupData;
    } catch (error) {
      console.error('MFA setup error:', error);
      throw error;
    }
  }

  /**
   * Check if user has permission for a resource
   * @param {string} permission - Permission type
   * @param {string} resourceType - Resource type
   * @param {string} resourceId - Resource ID
   * @returns {Promise<boolean>} - Has permission
   */
  async hasPermission(permission, resourceType, resourceId) {
    const cacheKey = `${permission}:${resourceType}:${resourceId}`;
    
    if (this.permissionCache.has(cacheKey)) {
      return Promise.resolve(this.permissionCache.get(cacheKey));
    }
    
    if (!this.currentUser) {
      await this.getCurrentUser().catch(() => null);
    }
    
    if (!this.currentUser) {
      return false;
    }

    try {
      const response = await fetch(`${this.apiBase}/permissions/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          permission,
          resourceType,
          resourceId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to check permission: ${response.statusText}`);
      }

      const { hasPermission } = await response.json();
      this.permissionCache.set(cacheKey, hasPermission);
      
      if (hasPermission) {
        this._logSecurityEvent(SECURITY_EVENTS.RESOURCE_ACCESS, {
          userId: this.currentUser.id,
          resourceType,
          resourceId,
          permission
        });
      }
      
      return hasPermission;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  /**
   * Get user roles
   * @param {string} userId - User ID (optional, defaults to current user)
   * @returns {Promise<Array>} - User roles
   */
  async getUserRoles(userId) {
    const targetUserId = userId || this.currentUser?.id;
    
    if (!targetUserId) {
      throw new Error('No user ID provided and no current user');
    }
    
    if (this.roleCache.has(targetUserId)) {
      return Promise.resolve(this.roleCache.get(targetUserId));
    }

    try {
      const response = await fetch(`${this.apiBase}/users/${targetUserId}/roles`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user roles: ${response.statusText}`);
      }
      
      const roles = await response.json();
      this.roleCache.set(targetUserId, roles);
      return roles;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      throw error;
    }
  }

  /**
   * Get available biotech clients (for CRO master account)
   * @returns {Promise<Array>} - List of clients
   */
  async getClients() {
    if (this.clients.length > 0) {
      return Promise.resolve(this.clients);
    }

    try {
      const response = await fetch(`${this.apiBase}/clients`);
      if (!response.ok) {
        throw new Error(`Failed to fetch clients: ${response.statusText}`);
      }
      
      this.clients = await response.json();
      return this.clients;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }

  /**
   * Switch active client context (for CRO users)
   * @param {string} clientId - Client ID to switch to
   * @returns {Promise<Object>} - Updated session info
   */
  async switchClientContext(clientId) {
    try {
      const response = await fetch(`${this.apiBase}/clients/switch-context`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ clientId })
      });

      if (!response.ok) {
        throw new Error(`Failed to switch client context: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Clear caches as permissions may have changed
      this.permissionCache.clear();
      
      this._logSecurityEvent('client_context_switch', {
        userId: this.currentUser?.id,
        clientId
      });
      
      return result;
    } catch (error) {
      console.error('Error switching client context:', error);
      throw error;
    }
  }

  /**
   * Get user permission assignment for a client
   * @param {string} clientId - Client ID
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Permission assignments
   */
  async getUserClientPermissions(clientId, userId) {
    try {
      const response = await fetch(`${this.apiBase}/clients/${clientId}/users/${userId}/permissions`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user client permissions: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user client permissions:', error);
      throw error;
    }
  }

  /**
   * Update user permission assignment for a client
   * @param {string} clientId - Client ID
   * @param {string} userId - User ID
   * @param {Array} permissions - Permission assignments
   * @returns {Promise<Object>} - Updated permissions
   */
  async updateUserClientPermissions(clientId, userId, permissions) {
    try {
      const response = await fetch(`${this.apiBase}/clients/${clientId}/users/${userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permissions })
      });

      if (!response.ok) {
        throw new Error(`Failed to update user client permissions: ${response.statusText}`);
      }

      const result = await response.json();
      
      this._logSecurityEvent(SECURITY_EVENTS.PERMISSION_CHANGE, {
        clientId,
        userId,
        updatedBy: this.currentUser?.id
      });
      
      // Clear permission cache for this user
      this.permissionCache.clear();
      
      return result;
    } catch (error) {
      console.error('Error updating user client permissions:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Created user
   */
  async createUser(userData) {
    try {
      const response = await fetch(`${this.apiBase}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.statusText}`);
      }

      const user = await response.json();
      
      this._logSecurityEvent(SECURITY_EVENTS.USER_CREATED, {
        createdBy: this.currentUser?.id,
        newUserId: user.id
      });
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user information
   * @param {string} userId - User ID
   * @param {Object} updates - User updates
   * @returns {Promise<Object>} - Updated user
   */
  async updateUser(userId, updates) {
    try {
      const response = await fetch(`${this.apiBase}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      const user = await response.json();
      
      this._logSecurityEvent(SECURITY_EVENTS.USER_UPDATED, {
        updatedBy: this.currentUser?.id,
        userId
      });
      
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Assign user roles
   * @param {string} userId - User ID
   * @param {Array} roles - Roles to assign
   * @returns {Promise<Array>} - Updated roles
   */
  async assignUserRoles(userId, roles) {
    try {
      const response = await fetch(`${this.apiBase}/users/${userId}/roles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roles })
      });

      if (!response.ok) {
        throw new Error(`Failed to assign roles: ${response.statusText}`);
      }

      const updatedRoles = await response.json();
      this.roleCache.set(userId, updatedRoles);
      
      this._logSecurityEvent(SECURITY_EVENTS.ROLE_CHANGE, {
        assignedBy: this.currentUser?.id,
        userId
      });
      
      return updatedRoles;
    } catch (error) {
      console.error('Error assigning roles:', error);
      throw error;
    }
  }

  /**
   * Get security audit logs
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} - Audit logs
   */
  async getAuditLogs(options = {}) {
    const queryParams = new URLSearchParams(options).toString();

    try {
      const response = await fetch(`${this.apiBase}/audit?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch audit logs: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  /**
   * Get security event for specific resource
   * @param {string} resourceType - Resource type
   * @param {string} resourceId - Resource ID
   * @returns {Promise<Array>} - Security events
   */
  async getResourceSecurityEvents(resourceType, resourceId) {
    try {
      const response = await fetch(`${this.apiBase}/audit/resources/${resourceType}/${resourceId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch resource security events: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching resource security events:', error);
      throw error;
    }
  }

  /**
   * Create a new client (biotech customer for CRO)
   * @param {Object} clientData - Client data
   * @returns {Promise<Object>} - Created client
   */
  async createClient(clientData) {
    try {
      const response = await fetch(`${this.apiBase}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create client: ${response.statusText}`);
      }

      const client = await response.json();
      this.clients.push(client);
      
      return client;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  /**
   * Update client information
   * @param {string} clientId - Client ID
   * @param {Object} updates - Client updates
   * @returns {Promise<Object>} - Updated client
   */
  async updateClient(clientId, updates) {
    try {
      const response = await fetch(`${this.apiBase}/clients/${clientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update client: ${response.statusText}`);
      }

      const client = await response.json();
      
      // Update client in cache
      const clientIndex = this.clients.findIndex(c => c.id === clientId);
      if (clientIndex >= 0) {
        this.clients[clientIndex] = client;
      }
      
      return client;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  /**
   * Get users associated with a client
   * @param {string} clientId - Client ID
   * @returns {Promise<Array>} - Client users
   */
  async getClientUsers(clientId) {
    try {
      const response = await fetch(`${this.apiBase}/clients/${clientId}/users`);
      if (!response.ok) {
        throw new Error(`Failed to fetch client users: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching client users:', error);
      throw error;
    }
  }

  /**
   * Get available roles for a client
   * @param {string} clientId - Client ID
   * @returns {Promise<Array>} - Available roles
   */
  async getClientRoles(clientId) {
    try {
      const response = await fetch(`${this.apiBase}/clients/${clientId}/roles`);
      if (!response.ok) {
        throw new Error(`Failed to fetch client roles: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching client roles:', error);
      throw error;
    }
  }

  /**
   * Create client-specific role
   * @param {string} clientId - Client ID
   * @param {Object} roleData - Role data
   * @returns {Promise<Object>} - Created role
   */
  async createClientRole(clientId, roleData) {
    try {
      const response = await fetch(`${this.apiBase}/clients/${clientId}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create client role: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating client role:', error);
      throw error;
    }
  }

  /**
   * Enable blockchain verification for document
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} - Blockchain verification status
   */
  async enableBlockchainVerification(documentId) {
    try {
      const response = await fetch(`${this.apiBase}/blockchain/documents/${documentId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Failed to enable blockchain verification: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error enabling blockchain verification:', error);
      throw error;
    }
  }

  /**
   * Verify document integrity using blockchain
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} - Verification result
   */
  async verifyDocumentWithBlockchain(documentId) {
    try {
      const response = await fetch(`${this.apiBase}/blockchain/documents/${documentId}/verify`);
      if (!response.ok) {
        throw new Error(`Failed to verify document: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error verifying document:', error);
      throw error;
    }
  }

  /**
   * Subscribe to security events
   * @param {string} eventType - The event type
   * @param {Function} callback - The callback function
   * @returns {string} - Subscription ID
   */
  subscribeToSecurityEvents(eventType, callback) {
    const subscriptionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    if (!this.securityEventListeners.has(eventType)) {
      this.securityEventListeners.set(eventType, new Map());
    }
    
    this.securityEventListeners.get(eventType).set(subscriptionId, callback);
    return subscriptionId;
  }

  /**
   * Unsubscribe from security events
   * @param {string} eventType - Event type
   * @param {string} subscriptionId - Subscription ID
   */
  unsubscribeFromSecurityEvents(eventType, subscriptionId) {
    if (this.securityEventListeners.has(eventType)) {
      this.securityEventListeners.get(eventType).delete(subscriptionId);
    }
  }

  /**
   * Log security event
   * @param {string} eventType - Event type
   * @param {Object} data - Event data
   * @private
   */
  _logSecurityEvent(eventType, data) {
    // Send to server in production, but for now just notify listeners
    if (this.securityEventListeners.has(eventType)) {
      this.securityEventListeners.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in security event listener for ${eventType}:`, error);
        }
      });
    }
  }
}

// Create singleton instance
const securityService = new SecurityService();
export default securityService;