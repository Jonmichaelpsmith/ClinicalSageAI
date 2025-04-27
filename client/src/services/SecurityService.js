/**
 * Security Service
 * 
 * This service handles authentication, authorization, and multi-tenant
 * functionality across the TrialSage platform.
 */

class SecurityService {
  constructor() {
    this.isInitialized = false;
    this.currentUser = null;
    this.currentOrganization = null;
    this.accessibleOrganizations = [];
    this.userPermissions = new Map();
    this.sessionToken = null;
    this.roles = new Map();
  }
  
  /**
   * Initialize the security service
   */
  async initialize() {
    try {
      console.log('Initializing Security Service');
      
      // Check for existing auth session
      const existingSession = this.getStoredSession();
      
      if (existingSession && existingSession.token) {
        // Validate the session
        const isValid = await this.validateSession(existingSession.token);
        
        if (isValid) {
          this.sessionToken = existingSession.token;
          await this.loadCurrentUser();
        } else {
          // Clear invalid session
          this.clearStoredSession();
        }
      }
      
      // Load roles and permissions regardless of authentication status
      await this.loadRoles();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing Security Service:', error);
      this.isInitialized = true; // Still mark as initialized to allow the app to function
      return false;
    }
  }
  
  /**
   * Get stored session from localStorage
   */
  getStoredSession() {
    try {
      const sessionData = localStorage.getItem('trialsage_session');
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Error getting stored session:', error);
      return null;
    }
  }
  
  /**
   * Store session in localStorage
   */
  storeSession(token, expiresAt) {
    try {
      const sessionData = {
        token,
        expiresAt
      };
      
      localStorage.setItem('trialsage_session', JSON.stringify(sessionData));
    } catch (error) {
      console.error('Error storing session:', error);
    }
  }
  
  /**
   * Clear stored session
   */
  clearStoredSession() {
    try {
      localStorage.removeItem('trialsage_session');
      this.sessionToken = null;
      this.currentUser = null;
      this.currentOrganization = null;
    } catch (error) {
      console.error('Error clearing stored session:', error);
    }
  }
  
  /**
   * Validate session token
   */
  async validateSession(token) {
    try {
      // In production, this would make an API call to validate the token
      console.log('Validating session token');
      
      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // For development, always return true if token exists
      return !!token;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  }
  
  /**
   * Load current user data
   */
  async loadCurrentUser() {
    try {
      // In production, this would make an API call to get user data
      console.log('Loading current user data');
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate current user
      this.currentUser = {
        id: 'user-001',
        username: 'jsmith',
        email: 'john.smith@example.com',
        firstName: 'John',
        lastName: 'Smith',
        role: 'admin',
        organizationId: 'org-001',
        createdAt: '2023-01-15T10:00:00Z',
        lastLoginAt: new Date().toISOString()
      };
      
      // Load user's organizations
      await this.loadUserOrganizations();
      
      // Load user's permissions
      await this.loadUserPermissions();
      
      console.log('Current user loaded:', this.currentUser.username);
      return this.currentUser;
    } catch (error) {
      console.error('Error loading current user:', error);
      throw error;
    }
  }
  
  /**
   * Load user's organizations
   */
  async loadUserOrganizations() {
    try {
      // In production, this would make an API call to get user's organizations
      console.log('Loading user organizations');
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Simulate organizations
      this.accessibleOrganizations = [
        {
          id: 'org-001',
          name: 'Concept2Cures',
          type: 'cro',
          role: 'admin',
          isActive: true,
          createdAt: '2023-01-10T10:00:00Z'
        },
        {
          id: 'org-002',
          name: 'BioPharma Inc.',
          type: 'pharma',
          role: 'manager',
          isActive: true,
          createdAt: '2023-02-15T14:30:00Z'
        },
        {
          id: 'org-003',
          name: 'MedTech Innovations',
          type: 'biotech',
          role: 'viewer',
          isActive: true,
          createdAt: '2023-03-20T09:15:00Z'
        }
      ];
      
      // Set current organization (the primary one)
      this.currentOrganization = this.accessibleOrganizations.find(org => org.id === this.currentUser.organizationId);
      
      console.log('User organizations loaded:', this.accessibleOrganizations.length);
      return this.accessibleOrganizations;
    } catch (error) {
      console.error('Error loading user organizations:', error);
      throw error;
    }
  }
  
  /**
   * Load all available roles
   */
  async loadRoles() {
    try {
      // In production, this would make an API call to get roles
      console.log('Loading roles');
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Simulate roles
      const roles = [
        {
          id: 'role-001',
          name: 'admin',
          displayName: 'Administrator',
          description: 'Full access to all features and data',
          isSystemRole: true
        },
        {
          id: 'role-002',
          name: 'manager',
          displayName: 'Manager',
          description: 'Can manage most features and access most data',
          isSystemRole: true
        },
        {
          id: 'role-003',
          name: 'editor',
          displayName: 'Editor',
          description: 'Can edit documents and workflows',
          isSystemRole: true
        },
        {
          id: 'role-004',
          name: 'viewer',
          displayName: 'Viewer',
          description: 'Read-only access to data',
          isSystemRole: true
        }
      ];
      
      // Store roles
      roles.forEach(role => {
        this.roles.set(role.name, role);
      });
      
      console.log('Roles loaded:', roles.length);
      return roles;
    } catch (error) {
      console.error('Error loading roles:', error);
      throw error;
    }
  }
  
  /**
   * Load user permissions
   */
  async loadUserPermissions() {
    try {
      // In production, this would make an API call to get user permissions
      console.log('Loading user permissions');
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Simulate permissions based on role
      const rolePermissions = {
        admin: [
          'users:create', 'users:read', 'users:update', 'users:delete',
          'organizations:create', 'organizations:read', 'organizations:update', 'organizations:delete',
          'documents:create', 'documents:read', 'documents:update', 'documents:delete',
          'workflows:create', 'workflows:read', 'workflows:update', 'workflows:delete'
        ],
        manager: [
          'users:read', 'users:update',
          'organizations:read',
          'documents:create', 'documents:read', 'documents:update', 'documents:delete',
          'workflows:create', 'workflows:read', 'workflows:update', 'workflows:delete'
        ],
        editor: [
          'documents:create', 'documents:read', 'documents:update',
          'workflows:read', 'workflows:update'
        ],
        viewer: [
          'documents:read',
          'workflows:read'
        ]
      };
      
      // Set user permissions based on role
      if (this.currentUser && this.currentUser.role) {
        this.userPermissions.set(this.currentUser.id, rolePermissions[this.currentUser.role] || []);
      }
      
      console.log('User permissions loaded for role:', this.currentUser?.role);
      return this.userPermissions.get(this.currentUser?.id) || [];
    } catch (error) {
      console.error('Error loading user permissions:', error);
      throw error;
    }
  }
  
  /**
   * Login user
   */
  async login(credentials) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      console.log('Logging in user:', credentials.username);
      
      // In production, this would make an API call to authenticate
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful login
      if (credentials.username && credentials.password) {
        // Create session token (simulated)
        this.sessionToken = `session-token-${Date.now()}`;
        
        // Set token expiration (24 hours from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        
        // Store session
        this.storeSession(this.sessionToken, expiresAt.toISOString());
        
        // Load user data
        await this.loadCurrentUser();
        
        console.log('Login successful:', this.currentUser.username);
        return {
          success: true,
          user: this.currentUser
        };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Logout user
   */
  async logout() {
    try {
      console.log('Logging out user');
      
      // In production, this would make an API call to invalidate the session
      // Simulate logout delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear stored session
      this.clearStoredSession();
      
      console.log('Logout successful');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.sessionToken && !!this.currentUser;
  }
  
  /**
   * Check if user has a specific permission
   */
  hasPermission(permission) {
    if (!this.isAuthenticated() || !this.currentUser) {
      return false;
    }
    
    const userPermissions = this.userPermissions.get(this.currentUser.id) || [];
    return userPermissions.includes(permission);
  }
  
  /**
   * Switch current organization
   */
  async switchOrganization(organizationId) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User not authenticated');
      }
      
      console.log('Switching organization:', organizationId);
      
      // Find organization in accessible organizations
      const organization = this.accessibleOrganizations.find(org => org.id === organizationId);
      
      if (!organization) {
        throw new Error('Organization not accessible');
      }
      
      // In production, this would make an API call to switch context
      // Simulate switch delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update current organization
      this.currentOrganization = organization;
      
      // Update user's primary organization
      this.currentUser = {
        ...this.currentUser,
        organizationId
      };
      
      // Reload permissions for the new organization context
      await this.loadUserPermissions();
      
      console.log('Organization switched successfully:', organization.name);
      return {
        success: true,
        organization
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
   * Get accessible organizations
   */
  getAccessibleOrganizations() {
    if (!this.isAuthenticated()) {
      return [];
    }
    
    return this.accessibleOrganizations;
  }
  
  /**
   * Get current organization
   */
  getCurrentOrganization() {
    return this.currentOrganization;
  }
  
  /**
   * Get user role info
   */
  getUserRole() {
    if (!this.isAuthenticated() || !this.currentUser) {
      return null;
    }
    
    return this.roles.get(this.currentUser.role);
  }
  
  /**
   * Clean up resources
   */
  cleanup() {
    this.isInitialized = false;
    console.log('Security Service cleaned up');
  }
}

export default SecurityService;