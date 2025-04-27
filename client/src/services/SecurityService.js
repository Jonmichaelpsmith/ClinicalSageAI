/**
 * Security Service
 * 
 * This service provides enterprise-grade security capabilities for the TrialSage platform,
 * including multi-tenant access control, authentication, authorization, audit logging,
 * encryption, and compliance management. It enables secure operation of the platform
 * for CROs managing multiple biotech clients.
 * 
 * Features:
 * - Multi-tenant security model with CRO master accounts
 * - Role-based access control (RBAC)
 * - Attribute-based access control (ABAC)
 * - Audit logging and compliance reporting
 * - Data encryption and protection
 * - Two-factor authentication
 * - Single sign-on (SSO) integration
 * - Security policy management
 */

import regulatoryIntelligenceCore from './RegulatoryIntelligenceCore';

const API_BASE = '/api/security';

/**
 * User roles
 */
export const USER_ROLES = {
  // System-level roles
  SYSTEM_ADMIN: 'system_admin',        // Full platform administration
  SECURITY_ADMIN: 'security_admin',    // Security administration
  SUPPORT: 'support',                  // Technical support access
  
  // Organization-level roles
  CRO_ADMIN: 'cro_admin',              // CRO administrator
  CRO_MANAGER: 'cro_manager',          // CRO manager
  CLIENT_ADMIN: 'client_admin',        // Biotech client administrator
  CLIENT_MANAGER: 'client_manager',    // Biotech client manager
  
  // Function-specific roles
  REGULATORY_SPECIALIST: 'regulatory_specialist',
  MEDICAL_WRITER: 'medical_writer',
  QUALITY_SPECIALIST: 'quality_specialist',
  DATA_MANAGER: 'data_manager',
  CLINICAL_RESEARCHER: 'clinical_researcher',
  STATISTICIAN: 'statistician',
  
  // Access-level roles
  CONTRIBUTOR: 'contributor',          // Can contribute content
  REVIEWER: 'reviewer',                // Can review content
  APPROVER: 'approver',                // Can approve content
  VIEWER: 'viewer'                     // Read-only access
};

/**
 * Access levels
 */
export const ACCESS_LEVELS = {
  NONE: 'none',                        // No access
  VIEW: 'view',                        // View-only access
  CONTRIBUTE: 'contribute',            // Can add/edit content
  MANAGE: 'manage',                    // Can manage resources
  ADMINISTER: 'administer'             // Full administrative access
};

/**
 * Security event types
 */
export const SECURITY_EVENTS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  FAILED_LOGIN: 'failed_login',
  PASSWORD_CHANGE: 'password_change',
  ROLE_CHANGE: 'role_change',
  PERMISSION_CHANGE: 'permission_change',
  ACCOUNT_LOCK: 'account_lock',
  ACCOUNT_UNLOCK: 'account_unlock',
  USER_CREATION: 'user_creation',
  USER_DELETION: 'user_deletion',
  TFA_ENABLE: 'tfa_enable',
  TFA_DISABLE: 'tfa_disable',
  POLICY_CHANGE: 'policy_change',
  SENSITIVE_DATA_ACCESS: 'sensitive_data_access',
  API_KEY_GENERATION: 'api_key_generation',
  API_KEY_DELETION: 'api_key_deletion'
};

/**
 * Authentication methods
 */
export const AUTH_METHODS = {
  PASSWORD: 'password',
  SSO: 'sso',
  SAML: 'saml',
  OAUTH: 'oauth',
  LDAP: 'ldap',
  CERTIFICATE: 'certificate',
  BIOMETRIC: 'biometric'
};

/**
 * Organization types
 */
export const ORGANIZATION_TYPES = {
  CRO: 'cro',                          // Contract Research Organization
  BIOTECH: 'biotech',                  // Biotech client
  PHARMA: 'pharma',                    // Pharmaceutical company
  ACADEMIC: 'academic',                // Academic institution
  HOSPITAL: 'hospital',                // Hospital/Medical center
  REGULATORY: 'regulatory',            // Regulatory authority
  SERVICE_PROVIDER: 'service_provider' // Service provider
};

class SecurityService {
  constructor() {
    this.currentUser = null;
    this.currentOrganization = null;
    this.currentRoles = [];
    this.currentPermissions = {};
    this.clientContext = null;
    this.isAuthenticated = false;
    this.lastAuthCheck = null;
    this.sessionExpiry = null;
    this.tfaEnabled = false;
    this.securityContext = {};
    this.policyCache = new Map();
    this.auditEventBuffer = [];
    this.blockchainEnabled = false;
  }

  /**
   * Initialize Security service
   * @param {Object} options - Initialization options
   * @returns {Promise<Object>} - Initialization status
   */
  async initialize(options = {}) {
    try {
      const response = await fetch(`${API_BASE}/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize Security service: ${response.statusText}`);
      }

      const initStatus = await response.json();
      
      this.isAuthenticated = initStatus.isAuthenticated;
      this.currentUser = initStatus.currentUser;
      this.currentOrganization = initStatus.organization;
      this.currentRoles = initStatus.roles || [];
      this.currentPermissions = initStatus.permissions || {};
      this.sessionExpiry = initStatus.sessionExpiry;
      this.tfaEnabled = initStatus.tfaEnabled;
      this.securityContext = initStatus.securityContext || {};
      this.blockchainEnabled = initStatus.blockchainEnabled;
      
      // Initialize client context if user is from a CRO and acting on behalf of a client
      if (initStatus.clientContext) {
        this.clientContext = initStatus.clientContext;
      }
      
      // Set up session expiry check
      if (typeof window !== 'undefined' && this.sessionExpiry) {
        this._setupSessionCheck();
      }
      
      // Initialize blockchain if enabled
      if (this.blockchainEnabled) {
        await regulatoryIntelligenceCore.initialize({ enableBlockchain: true });
      }
      
      // Set up security event listener
      this._setupSecurityEventListeners();
      
      return initStatus;
    } catch (error) {
      console.error('Error initializing Security service:', error);
      this.isAuthenticated = false;
      throw error;
    }
  }

  /**
   * Set up session expiry check
   * @private
   */
  _setupSessionCheck() {
    // Check every minute
    setInterval(() => {
      const now = new Date();
      const expiry = new Date(this.sessionExpiry);
      
      // If session expiry is less than 5 minutes away, refresh token
      if ((expiry - now) < 5 * 60 * 1000) {
        this.refreshSession()
          .catch(error => {
            console.error('Failed to refresh session:', error);
            // Redirect to login if refresh fails
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
          });
      }
    }, 60000);
  }

  /**
   * Set up security event listeners
   * @private
   */
  _setupSecurityEventListeners() {
    if (typeof window === 'undefined') return;
    
    // Listen for security-related events
    window.addEventListener('visibilitychange', () => {
      // Check session when tab becomes visible again
      if (document.visibilityState === 'visible' && this.isAuthenticated) {
        this.verifySession().catch(console.error);
      }
    });
    
    // Buffer audit events and flush periodically
    setInterval(() => {
      this._flushAuditEventBuffer();
    }, 10000); // Flush every 10 seconds
  }
  
  /**
   * Flush audit event buffer
   * @private
   */
  async _flushAuditEventBuffer() {
    if (this.auditEventBuffer.length === 0) return;
    
    const events = [...this.auditEventBuffer];
    this.auditEventBuffer = [];
    
    try {
      await fetch(`${API_BASE}/audit/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events })
      });
    } catch (error) {
      console.error('Failed to flush audit events:', error);
      // Push events back to buffer
      this.auditEventBuffer.push(...events);
    }
  }

  /**
   * Authenticate user
   * @param {Object} credentials - Authentication credentials
   * @param {Object} options - Authentication options
   * @returns {Promise<Object>} - Authentication result
   */
  async authenticate(credentials, options = {}) {
    try {
      const response = await fetch(`${API_BASE}/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          credentials,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const authResult = await response.json();
      
      // Update service state
      this.isAuthenticated = true;
      this.currentUser = authResult.user;
      this.currentOrganization = authResult.organization;
      this.currentRoles = authResult.roles || [];
      this.currentPermissions = authResult.permissions || {};
      this.sessionExpiry = authResult.sessionExpiry;
      this.tfaEnabled = authResult.tfaEnabled;
      
      if (authResult.clientContext) {
        this.clientContext = authResult.clientContext;
      }
      
      // Set up session expiry check
      if (typeof window !== 'undefined') {
        this._setupSessionCheck();
      }
      
      // Log authentication event
      this.logSecurityEvent(SECURITY_EVENTS.LOGIN, {
        userId: authResult.user.id,
        method: options.method || AUTH_METHODS.PASSWORD
      });
      
      return authResult;
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Log failed authentication
      if (credentials.username) {
        this.logSecurityEvent(SECURITY_EVENTS.FAILED_LOGIN, {
          username: credentials.username,
          method: options.method || AUTH_METHODS.PASSWORD,
          reason: error.message
        });
      }
      
      throw error;
    }
  }

  /**
   * Complete two-factor authentication
   * @param {string} code - Two-factor authentication code
   * @returns {Promise<Object>} - Authentication result
   */
  async completeTwoFactorAuth(code) {
    try {
      const response = await fetch(`${API_BASE}/authenticate/tfa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error(`Two-factor authentication failed: ${response.statusText}`);
      }

      const authResult = await response.json();
      
      // Update service state
      this.isAuthenticated = true;
      this.sessionExpiry = authResult.sessionExpiry;
      
      return authResult;
    } catch (error) {
      console.error('Two-factor authentication error:', error);
      throw error;
    }
  }

  /**
   * Verify current session
   * @returns {Promise<boolean>} - Session validity
   */
  async verifySession() {
    try {
      const response = await fetch(`${API_BASE}/session`);
      
      if (!response.ok) {
        this.isAuthenticated = false;
        return false;
      }
      
      const sessionInfo = await response.json();
      
      // Update expiry time
      this.sessionExpiry = sessionInfo.expiry;
      this.lastAuthCheck = new Date().toISOString();
      
      return sessionInfo.valid;
    } catch (error) {
      console.error('Session verification error:', error);
      return false;
    }
  }

  /**
   * Refresh authentication session
   * @returns {Promise<Object>} - Refreshed session info
   */
  async refreshSession() {
    try {
      const response = await fetch(`${API_BASE}/session/refresh`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Session refresh failed: ${response.statusText}`);
      }

      const sessionInfo = await response.json();
      
      // Update session expiry
      this.sessionExpiry = sessionInfo.expiry;
      this.lastAuthCheck = new Date().toISOString();
      
      return sessionInfo;
    } catch (error) {
      console.error('Session refresh error:', error);
      throw error;
    }
  }

  /**
   * Log out current user
   * @returns {Promise<Object>} - Logout result
   */
  async logout() {
    try {
      const response = await fetch(`${API_BASE}/logout`, {
        method: 'POST'
      });

      // Log security event before resetting state
      this.logSecurityEvent(SECURITY_EVENTS.LOGOUT, {
        userId: this.currentUser?.id
      });
      
      // Reset service state
      this.isAuthenticated = false;
      this.currentUser = null;
      this.currentOrganization = null;
      this.currentRoles = [];
      this.currentPermissions = {};
      this.clientContext = null;
      this.sessionExpiry = null;
      
      if (!response.ok) {
        throw new Error(`Logout failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Check if user has specific role
   * @param {string|Array} roles - Role(s) to check
   * @returns {boolean} - Whether user has the role(s)
   */
  hasRole(roles) {
    if (!this.isAuthenticated || !this.currentRoles.length) {
      return false;
    }
    
    if (Array.isArray(roles)) {
      return roles.some(role => this.currentRoles.includes(role));
    }
    
    return this.currentRoles.includes(roles);
  }

  /**
   * Check if user has permission for a resource
   * @param {string} resourceType - Resource type
   * @param {string} permission - Permission to check
   * @param {string} resourceId - Specific resource ID (optional)
   * @returns {boolean} - Whether user has the permission
   */
  hasPermission(resourceType, permission, resourceId = null) {
    if (!this.isAuthenticated) {
      return false;
    }
    
    // Check if user has system admin role
    if (this.hasRole(USER_ROLES.SYSTEM_ADMIN)) {
      return true;
    }
    
    // Check resource type permissions
    const resourcePermissions = this.currentPermissions[resourceType];
    if (!resourcePermissions) {
      return false;
    }
    
    // Check specific resource if ID provided
    if (resourceId) {
      const specificPermissions = resourcePermissions.resources?.[resourceId];
      
      if (specificPermissions) {
        if (specificPermissions.includes(permission) || specificPermissions.includes('*')) {
          return true;
        }
      }
    }
    
    // Check global permissions for resource type
    return resourcePermissions.global?.includes(permission) || resourcePermissions.global?.includes('*');
  }

  /**
   * Check if current user can access client data
   * @param {string} clientId - Client organization ID
   * @returns {boolean} - Whether user has client access
   */
  canAccessClient(clientId) {
    // If user is from the client organization, they can access
    if (this.currentOrganization?.id === clientId) {
      return true;
    }
    
    // If user is system admin, they have access
    if (this.hasRole(USER_ROLES.SYSTEM_ADMIN)) {
      return true;
    }
    
    // If user is from a CRO
    if (this.currentOrganization?.type === ORGANIZATION_TYPES.CRO) {
      // Check if they are authorized for this client
      const clientAuth = this.currentPermissions.clients?.resources?.[clientId];
      
      return !!clientAuth;
    }
    
    return false;
  }

  /**
   * Switch to client context
   * @param {string} clientId - Client organization ID
   * @returns {Promise<Object>} - Updated security context
   */
  async switchToClientContext(clientId) {
    if (!this.canAccessClient(clientId)) {
      throw new Error('You do not have permission to access this client');
    }
    
    try {
      const response = await fetch(`${API_BASE}/context/client/${clientId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Failed to switch context: ${response.statusText}`);
      }

      const contextResult = await response.json();
      
      // Update client context
      this.clientContext = contextResult.clientContext;
      
      // Log context switch
      this.logSecurityEvent('client_context_switch', {
        userId: this.currentUser?.id,
        clientId: clientId
      });
      
      return contextResult;
    } catch (error) {
      console.error('Context switch error:', error);
      throw error;
    }
  }

  /**
   * Clear client context
   * @returns {Promise<Object>} - Updated security context
   */
  async clearClientContext() {
    try {
      const response = await fetch(`${API_BASE}/context/clear`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Failed to clear context: ${response.statusText}`);
      }

      const contextResult = await response.json();
      
      // Clear client context
      this.clientContext = null;
      
      return contextResult;
    } catch (error) {
      console.error('Context clear error:', error);
      throw error;
    }
  }

  /**
   * Get security policy
   * @param {string} policyType - Policy type
   * @returns {Promise<Object>} - Security policy
   */
  async getSecurityPolicy(policyType) {
    try {
      // Check cache first
      if (this.policyCache.has(policyType)) {
        return Promise.resolve(this.policyCache.get(policyType));
      }
      
      const response = await fetch(`${API_BASE}/policies/${policyType}`);
      if (!response.ok) {
        throw new Error(`Failed to get security policy: ${response.statusText}`);
      }
      
      const policy = await response.json();
      
      // Cache policy
      this.policyCache.set(policyType, policy);
      
      return policy;
    } catch (error) {
      console.error(`Error getting security policy ${policyType}:`, error);
      throw error;
    }
  }

  /**
   * Update security policy
   * @param {string} policyType - Policy type
   * @param {Object} updates - Policy updates
   * @returns {Promise<Object>} - Updated policy
   */
  async updateSecurityPolicy(policyType, updates) {
    try {
      const response = await fetch(`${API_BASE}/policies/${policyType}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update security policy: ${response.statusText}`);
      }

      const updatedPolicy = await response.json();
      
      // Update cache
      this.policyCache.set(policyType, updatedPolicy);
      
      // Log policy change
      this.logSecurityEvent(SECURITY_EVENTS.POLICY_CHANGE, {
        policyType,
        changedBy: this.currentUser?.id
      });
      
      return updatedPolicy;
    } catch (error) {
      console.error(`Error updating security policy ${policyType}:`, error);
      throw error;
    }
  }

  /**
   * Get user security profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User security profile
   */
  async getUserSecurityProfile(userId) {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/security-profile`);
      if (!response.ok) {
        throw new Error(`Failed to get user security profile: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error getting security profile for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update user roles
   * @param {string} userId - User ID
   * @param {Array} roles - New roles
   * @returns {Promise<Object>} - Updated user
   */
  async updateUserRoles(userId, roles) {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/roles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roles })
      });

      if (!response.ok) {
        throw new Error(`Failed to update user roles: ${response.statusText}`);
      }

      const updatedUser = await response.json();
      
      // Log role change
      this.logSecurityEvent(SECURITY_EVENTS.ROLE_CHANGE, {
        userId,
        updatedBy: this.currentUser?.id,
        roles
      });
      
      return updatedUser;
    } catch (error) {
      console.error(`Error updating roles for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update user permissions
   * @param {string} userId - User ID
   * @param {Object} permissions - New permissions
   * @returns {Promise<Object>} - Updated user
   */
  async updateUserPermissions(userId, permissions) {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permissions })
      });

      if (!response.ok) {
        throw new Error(`Failed to update user permissions: ${response.statusText}`);
      }

      const updatedUser = await response.json();
      
      // Log permission change
      this.logSecurityEvent(SECURITY_EVENTS.PERMISSION_CHANGE, {
        userId,
        updatedBy: this.currentUser?.id
      });
      
      return updatedUser;
    } catch (error) {
      console.error(`Error updating permissions for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Lock user account
   * @param {string} userId - User ID
   * @param {string} reason - Lock reason
   * @returns {Promise<Object>} - Lock result
   */
  async lockUserAccount(userId, reason) {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/lock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error(`Failed to lock user account: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Log account lock
      this.logSecurityEvent(SECURITY_EVENTS.ACCOUNT_LOCK, {
        userId,
        lockedBy: this.currentUser?.id,
        reason
      });
      
      return result;
    } catch (error) {
      console.error(`Error locking account for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Unlock user account
   * @param {string} userId - User ID
   * @param {string} reason - Unlock reason
   * @returns {Promise<Object>} - Unlock result
   */
  async unlockUserAccount(userId, reason) {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error(`Failed to unlock user account: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Log account unlock
      this.logSecurityEvent(SECURITY_EVENTS.ACCOUNT_UNLOCK, {
        userId,
        unlockedBy: this.currentUser?.id,
        reason
      });
      
      return result;
    } catch (error) {
      console.error(`Error unlocking account for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Set up two-factor authentication
   * @param {string} method - TFA method
   * @returns {Promise<Object>} - TFA setup data
   */
  async setupTwoFactorAuth(method) {
    try {
      const response = await fetch(`${API_BASE}/tfa/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ method })
      });

      if (!response.ok) {
        throw new Error(`Failed to set up two-factor authentication: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Two-factor authentication setup error:', error);
      throw error;
    }
  }

  /**
   * Enable two-factor authentication
   * @param {string} code - Verification code
   * @param {string} method - TFA method
   * @returns {Promise<Object>} - TFA enable result
   */
  async enableTwoFactorAuth(code, method) {
    try {
      const response = await fetch(`${API_BASE}/tfa/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, method })
      });

      if (!response.ok) {
        throw new Error(`Failed to enable two-factor authentication: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update TFA status
      this.tfaEnabled = true;
      
      // Log TFA enable
      this.logSecurityEvent(SECURITY_EVENTS.TFA_ENABLE, {
        userId: this.currentUser?.id,
        method
      });
      
      return result;
    } catch (error) {
      console.error('Two-factor authentication enable error:', error);
      throw error;
    }
  }

  /**
   * Disable two-factor authentication
   * @param {string} code - Verification code
   * @returns {Promise<Object>} - TFA disable result
   */
  async disableTwoFactorAuth(code) {
    try {
      const response = await fetch(`${API_BASE}/tfa/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error(`Failed to disable two-factor authentication: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update TFA status
      this.tfaEnabled = false;
      
      // Log TFA disable
      this.logSecurityEvent(SECURITY_EVENTS.TFA_DISABLE, {
        userId: this.currentUser?.id
      });
      
      return result;
    } catch (error) {
      console.error('Two-factor authentication disable error:', error);
      throw error;
    }
  }

  /**
   * Generate API key
   * @param {Object} options - API key options
   * @returns {Promise<Object>} - Generated API key
   */
  async generateApiKey(options) {
    try {
      const response = await fetch(`${API_BASE}/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        throw new Error(`Failed to generate API key: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Log API key generation
      this.logSecurityEvent(SECURITY_EVENTS.API_KEY_GENERATION, {
        userId: this.currentUser?.id,
        keyId: result.id,
        expires: options.expiresAt
      });
      
      return result;
    } catch (error) {
      console.error('API key generation error:', error);
      throw error;
    }
  }

  /**
   * Revoke API key
   * @param {string} keyId - API key ID
   * @returns {Promise<Object>} - Revocation result
   */
  async revokeApiKey(keyId) {
    try {
      const response = await fetch(`${API_BASE}/api-keys/${keyId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to revoke API key: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Log API key deletion
      this.logSecurityEvent(SECURITY_EVENTS.API_KEY_DELETION, {
        userId: this.currentUser?.id,
        keyId
      });
      
      return result;
    } catch (error) {
      console.error(`Error revoking API key ${keyId}:`, error);
      throw error;
    }
  }

  /**
   * Configure SSO for an organization
   * @param {string} organizationId - Organization ID
   * @param {Object} ssoConfig - SSO configuration
   * @returns {Promise<Object>} - Configuration result
   */
  async configureSso(organizationId, ssoConfig) {
    try {
      const response = await fetch(`${API_BASE}/organizations/${organizationId}/sso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ssoConfig)
      });

      if (!response.ok) {
        throw new Error(`Failed to configure SSO: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error configuring SSO for organization ${organizationId}:`, error);
      throw error;
    }
  }

  /**
   * Get security audit logs
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Audit log entries
   */
  async getAuditLogs(options = {}) {
    try {
      const queryParams = new URLSearchParams({
        ...options
      }).toString();

      const response = await fetch(`${API_BASE}/audit?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to get audit logs: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting audit logs:', error);
      throw error;
    }
  }

  /**
   * Log security event
   * @param {string} eventType - Event type
   * @param {Object} eventData - Event data
   * @returns {Promise<void>}
   */
  async logSecurityEvent(eventType, eventData = {}) {
    try {
      const event = {
        type: eventType,
        timestamp: new Date().toISOString(),
        userId: this.currentUser?.id,
        organizationId: this.currentOrganization?.id,
        clientId: this.clientContext?.id,
        ipAddress: eventData.ipAddress || '0.0.0.0',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        data: eventData
      };
      
      // Add to buffer for batch processing
      this.auditEventBuffer.push(event);
      
      // If buffer is getting large, flush immediately
      if (this.auditEventBuffer.length >= 10) {
        this._flushAuditEventBuffer();
      }
      
      // If using blockchain for critical events
      if (this.blockchainEnabled && this._isCriticalEvent(eventType)) {
        // Create blockchain verification
        try {
          await regulatoryIntelligenceCore.createBlockchainAuditTrail(
            'security',
            `security-${Date.now()}`,
            {
              action: eventType,
              ...eventData,
              timestamp: event.timestamp
            }
          );
        } catch (blockchainError) {
          console.error('Error creating blockchain audit trail:', blockchainError);
        }
      }
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }
  
  /**
   * Check if event is critical (should be recorded on blockchain)
   * @param {string} eventType - Event type
   * @returns {boolean} - Whether event is critical
   * @private
   */
  _isCriticalEvent(eventType) {
    const criticalEvents = [
      SECURITY_EVENTS.ROLE_CHANGE,
      SECURITY_EVENTS.PERMISSION_CHANGE,
      SECURITY_EVENTS.ACCOUNT_LOCK,
      SECURITY_EVENTS.ACCOUNT_UNLOCK,
      SECURITY_EVENTS.USER_CREATION,
      SECURITY_EVENTS.USER_DELETION,
      SECURITY_EVENTS.POLICY_CHANGE,
      SECURITY_EVENTS.SENSITIVE_DATA_ACCESS,
      SECURITY_EVENTS.API_KEY_GENERATION
    ];
    
    return criticalEvents.includes(eventType);
  }

  /**
   * Get client organizations for current CRO
   * @returns {Promise<Array>} - Client organizations
   */
  async getClientOrganizations() {
    if (this.currentOrganization?.type !== ORGANIZATION_TYPES.CRO) {
      throw new Error('This operation is only available for CRO organizations');
    }
    
    try {
      const response = await fetch(`${API_BASE}/organizations/clients`);
      if (!response.ok) {
        throw new Error(`Failed to get client organizations: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting client organizations:', error);
      throw error;
    }
  }

  /**
   * Add client organization to CRO
   * @param {Object} clientData - Client organization data
   * @returns {Promise<Object>} - Created client organization
   */
  async addClientOrganization(clientData) {
    if (this.currentOrganization?.type !== ORGANIZATION_TYPES.CRO) {
      throw new Error('This operation is only available for CRO organizations');
    }
    
    try {
      const response = await fetch(`${API_BASE}/organizations/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
      });

      if (!response.ok) {
        throw new Error(`Failed to add client organization: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding client organization:', error);
      throw error;
    }
  }

  /**
   * Create user for client organization
   * @param {string} clientId - Client organization ID
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Created user
   */
  async createClientUser(clientId, userData) {
    if (!this.canAccessClient(clientId)) {
      throw new Error('You do not have permission to manage this client');
    }
    
    try {
      const response = await fetch(`${API_BASE}/organizations/${clientId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create client user: ${response.statusText}`);
      }

      const createdUser = await response.json();
      
      // Log user creation
      this.logSecurityEvent(SECURITY_EVENTS.USER_CREATION, {
        userId: createdUser.id,
        createdBy: this.currentUser?.id,
        organizationId: clientId
      });
      
      return createdUser;
    } catch (error) {
      console.error(`Error creating user for client ${clientId}:`, error);
      throw error;
    }
  }

  /**
   * Get compliance status
   * @param {string} complianceType - Compliance type
   * @returns {Promise<Object>} - Compliance status
   */
  async getComplianceStatus(complianceType) {
    try {
      const response = await fetch(`${API_BASE}/compliance/${complianceType}`);
      if (!response.ok) {
        throw new Error(`Failed to get compliance status: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error getting compliance status for ${complianceType}:`, error);
      throw error;
    }
  }

  /**
   * Verify if data was tampered using blockchain
   * @param {string} resourceType - Resource type
   * @param {string} resourceId - Resource ID
   * @returns {Promise<Object>} - Verification result
   */
  async verifyWithBlockchain(resourceType, resourceId) {
    if (!this.blockchainEnabled) {
      throw new Error('Blockchain verification is not enabled');
    }
    
    try {
      return await regulatoryIntelligenceCore.verifyDocumentWithBlockchain(resourceId);
    } catch (error) {
      console.error(`Error verifying ${resourceType}:${resourceId} with blockchain:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const securityService = new SecurityService();
export default securityService;