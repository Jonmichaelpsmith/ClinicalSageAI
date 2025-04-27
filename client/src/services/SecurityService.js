/**
 * Security Service
 * 
 * This service provides authentication, authorization, and multi-tenant organization management
 * for the TrialSage platform, supporting CRO master accounts managing multiple biotech clients.
 */

class SecurityService {
  constructor() {
    this.initialized = false;
    this.authenticated = false;
    this.currentUser = null;
    this.currentOrganization = null;
    this.organizations = [];
    this.users = [];
    this.roles = [];
    this.permissions = [];
    this.sessions = [];
    this.status = 'initializing';
    this.authToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.secureModeEnabled = false; // Enhanced security mode with blockchain verification
  }
  
  // Initialize Security service
  async initialize() {
    try {
      console.log('[Security] Initializing Security service...');
      
      // In a real implementation, this would connect to an authentication service
      // For now, simulated with a delay and demo data
      await new Promise(resolve => setTimeout(resolve, 600));
      
      this.initialized = true;
      this.status = 'initialized';
      
      // Initialize demo data
      this.initializeDemoData();
      
      console.log('[Security] Security service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('[Security] Initialization error:', error);
      this.status = 'error';
      return false;
    }
  }
  
  // Initialize demo data
  initializeDemoData() {
    // Define organization types
    const ORGANIZATION_TYPES = {
      CRO: 'cro',
      BIOTECH: 'biotech',
      PHARMA: 'pharma',
      MEDICAL_DEVICE: 'medical_device',
      ACADEMIC: 'academic'
    };
    
    // Define user roles
    const USER_ROLES = {
      SUPER_ADMIN: 'super_admin',
      ADMIN: 'admin',
      MANAGER: 'manager',
      WRITER: 'writer',
      REVIEWER: 'reviewer',
      VIEWER: 'viewer'
    };
    
    // Demo organizations
    const demoOrganizations = [
      {
        id: 'org-1',
        name: 'TrialCRO',
        type: ORGANIZATION_TYPES.CRO,
        description: 'CRO master account',
        parentId: null,
        settings: {
          secureMode: true,
          mfaRequired: true,
          passwordPolicy: 'strong',
          sessionTimeout: 30 // minutes
        },
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString() // 180 days ago
      },
      {
        id: 'org-2',
        name: 'BioInnovate Therapeutics',
        type: ORGANIZATION_TYPES.BIOTECH,
        description: 'Biotech client organization',
        parentId: 'org-1', // Child of TrialCRO
        settings: {
          secureMode: true,
          mfaRequired: true,
          passwordPolicy: 'strong',
          sessionTimeout: 30 // minutes
        },
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days ago
      },
      {
        id: 'org-3',
        name: 'GenomeWave Pharma',
        type: ORGANIZATION_TYPES.PHARMA,
        description: 'Pharmaceutical client organization',
        parentId: 'org-1', // Child of TrialCRO
        settings: {
          secureMode: true,
          mfaRequired: true,
          passwordPolicy: 'strong',
          sessionTimeout: 30 // minutes
        },
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days ago
      },
      {
        id: 'org-4',
        name: 'NeuroCrest Biologics',
        type: ORGANIZATION_TYPES.BIOTECH,
        description: 'Biotech client organization',
        parentId: 'org-1', // Child of TrialCRO
        settings: {
          secureMode: true,
          mfaRequired: false,
          passwordPolicy: 'medium',
          sessionTimeout: 60 // minutes
        },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
      },
      {
        id: 'org-5',
        name: 'MedTech Innovations',
        type: ORGANIZATION_TYPES.MEDICAL_DEVICE,
        description: 'Medical device client organization',
        parentId: 'org-1', // Child of TrialCRO
        settings: {
          secureMode: false,
          mfaRequired: false,
          passwordPolicy: 'medium',
          sessionTimeout: 60 // minutes
        },
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
      }
    ];
    
    // Demo users
    const demoUsers = [
      // CRO Users
      {
        id: 'user-1',
        username: 'admin',
        email: 'admin@trialcro.com',
        firstName: 'Admin',
        lastName: 'User',
        organizationId: 'org-1',
        role: USER_ROLES.SUPER_ADMIN,
        permissions: ['all'],
        mfaEnabled: true,
        lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString() // 180 days ago
      },
      {
        id: 'user-2',
        username: 'manager',
        email: 'manager@trialcro.com',
        firstName: 'Manager',
        lastName: 'User',
        organizationId: 'org-1',
        role: USER_ROLES.MANAGER,
        permissions: ['read', 'write', 'manage'],
        mfaEnabled: true,
        lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString() // 150 days ago
      },
      
      // BioInnovate Users
      {
        id: 'user-3',
        username: 'john.smith',
        email: 'john.smith@bioinnovate.com',
        firstName: 'John',
        lastName: 'Smith',
        organizationId: 'org-2',
        role: USER_ROLES.ADMIN,
        permissions: ['read', 'write', 'manage'],
        mfaEnabled: true,
        lastLogin: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days ago
      },
      {
        id: 'user-4',
        username: 'sarah.johnson',
        email: 'sarah.johnson@bioinnovate.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        organizationId: 'org-2',
        role: USER_ROLES.WRITER,
        permissions: ['read', 'write'],
        mfaEnabled: true,
        lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString() // 85 days ago
      },
      
      // GenomeWave Users
      {
        id: 'user-5',
        username: 'michael.brown',
        email: 'michael.brown@genomewave.com',
        firstName: 'Michael',
        lastName: 'Brown',
        organizationId: 'org-3',
        role: USER_ROLES.ADMIN,
        permissions: ['read', 'write', 'manage'],
        mfaEnabled: true,
        lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days ago
      },
      {
        id: 'user-6',
        username: 'emily.chen',
        email: 'emily.chen@genomewave.com',
        firstName: 'Emily',
        lastName: 'Chen',
        organizationId: 'org-3',
        role: USER_ROLES.REVIEWER,
        permissions: ['read', 'review'],
        mfaEnabled: false,
        lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString() // 55 days ago
      }
    ];
    
    // Demo roles with permissions
    const demoRoles = [
      {
        id: 'role-1',
        name: USER_ROLES.SUPER_ADMIN,
        description: 'Full access to all system features',
        permissions: ['all']
      },
      {
        id: 'role-2',
        name: USER_ROLES.ADMIN,
        description: 'Administrative access to organization features',
        permissions: ['read', 'write', 'manage']
      },
      {
        id: 'role-3',
        name: USER_ROLES.MANAGER,
        description: 'Management access to organization projects',
        permissions: ['read', 'write', 'manage_projects']
      },
      {
        id: 'role-4',
        name: USER_ROLES.WRITER,
        description: 'Create and edit documents',
        permissions: ['read', 'write']
      },
      {
        id: 'role-5',
        name: USER_ROLES.REVIEWER,
        description: 'Review and approve documents',
        permissions: ['read', 'review']
      },
      {
        id: 'role-6',
        name: USER_ROLES.VIEWER,
        description: 'View-only access to documents',
        permissions: ['read']
      }
    ];
    
    // Demo permissions
    const demoPermissions = [
      {
        id: 'perm-1',
        name: 'all',
        description: 'All permissions'
      },
      {
        id: 'perm-2',
        name: 'read',
        description: 'Read access'
      },
      {
        id: 'perm-3',
        name: 'write',
        description: 'Write access'
      },
      {
        id: 'perm-4',
        name: 'manage',
        description: 'Management access'
      },
      {
        id: 'perm-5',
        name: 'review',
        description: 'Review access'
      },
      {
        id: 'perm-6',
        name: 'manage_projects',
        description: 'Project management access'
      }
    ];
    
    // Set demo data
    this.organizations = demoOrganizations;
    this.users = demoUsers;
    this.roles = demoRoles;
    this.permissions = demoPermissions;
    
    // Set current user and organization (simulating login)
    this.currentUser = demoUsers[0]; // Admin user
    this.currentOrganization = demoOrganizations[0]; // TrialCRO
    this.authenticated = true;
    this.authToken = 'demo-token';
    this.refreshToken = 'demo-refresh-token';
    this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now
    this.secureModeEnabled = this.currentOrganization.settings.secureMode;
  }
  
  // Login user
  async login(username, password, mfaCode = null) {
    try {
      console.log(`[Security] Logging in user: ${username}...`);
      
      // In a real implementation, this would authenticate with a server
      // For now, check against demo users
      const user = this.users.find(u => u.username === username);
      
      if (!user) {
        throw new Error('Invalid username or password');
      }
      
      // Simulate password verification (in reality, would check against hashed password)
      if (password !== 'password') {
        throw new Error('Invalid username or password');
      }
      
      // Check if MFA is required
      if (user.mfaEnabled && !mfaCode) {
        return {
          success: false,
          mfaRequired: true,
          message: 'MFA code required'
        };
      }
      
      // Verify MFA code if provided
      if (user.mfaEnabled && mfaCode) {
        // In reality, would verify the MFA code
        if (mfaCode !== '123456') {
          throw new Error('Invalid MFA code');
        }
      }
      
      // Get the user's organization
      const organization = this.organizations.find(org => org.id === user.organizationId);
      
      if (!organization) {
        throw new Error('User organization not found');
      }
      
      // Set current user and organization
      this.currentUser = user;
      this.currentOrganization = organization;
      this.authenticated = true;
      
      // Generate tokens
      this.authToken = `auth-token-${Date.now()}`;
      this.refreshToken = `refresh-token-${Date.now()}`;
      this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now
      
      // Update last login
      user.lastLogin = new Date().toISOString();
      
      // Set secure mode based on organization settings
      this.secureModeEnabled = organization.settings.secureMode;
      
      // Record session
      this.recordSession({
        userId: user.id,
        organizationId: organization.id,
        ipAddress: '127.0.0.1', // Simulated IP
        userAgent: navigator.userAgent,
        loginTime: new Date().toISOString()
      });
      
      console.log(`[Security] User ${username} logged in successfully`);
      
      return {
        success: true,
        user: this.sanitizeUserData(user),
        organization: this.sanitizeOrganizationData(organization),
        token: this.authToken,
        expiresAt: this.tokenExpiry
      };
    } catch (error) {
      console.error('[Security] Login error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
  
  // Logout user
  async logout() {
    try {
      console.log('[Security] Logging out user...');
      
      // Find current session
      const currentSession = this.sessions.find(session => 
        session.userId === this.currentUser?.id && 
        !session.logoutTime
      );
      
      // Update session with logout time
      if (currentSession) {
        currentSession.logoutTime = new Date().toISOString();
      }
      
      // Clear current user and tokens
      this.currentUser = null;
      this.currentOrganization = null;
      this.authenticated = false;
      this.authToken = null;
      this.refreshToken = null;
      this.tokenExpiry = null;
      this.secureModeEnabled = false;
      
      console.log('[Security] User logged out successfully');
      
      return {
        success: true
      };
    } catch (error) {
      console.error('[Security] Logout error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
  
  // Switch organization (for CRO users managing multiple organizations)
  async switchOrganization(organizationId) {
    try {
      console.log(`[Security] Switching to organization: ${organizationId}...`);
      
      if (!this.authenticated || !this.currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Check if the user has access to the organization
      // For CRO users, they can access child organizations
      const isCroUser = this.currentUser.organizationId === 'org-1'; // TrialCRO
      
      let accessibleOrganizations = [];
      
      if (isCroUser) {
        // CRO users can access their own organization and child organizations
        accessibleOrganizations = this.organizations.filter(org => 
          org.id === 'org-1' || org.parentId === 'org-1'
        );
      } else {
        // Regular users can only access their own organization
        accessibleOrganizations = this.organizations.filter(org => 
          org.id === this.currentUser.organizationId
        );
      }
      
      const organization = accessibleOrganizations.find(org => org.id === organizationId);
      
      if (!organization) {
        throw new Error('Organization not accessible');
      }
      
      // Switch organization
      this.currentOrganization = organization;
      
      // Update secure mode based on organization settings
      this.secureModeEnabled = organization.settings.secureMode;
      
      console.log(`[Security] Switched to organization: ${organization.name}`);
      
      return {
        success: true,
        organization: this.sanitizeOrganizationData(organization)
      };
    } catch (error) {
      console.error('[Security] Switch organization error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
  
  // Get accessible organizations for the current user
  async getAccessibleOrganizations() {
    try {
      if (!this.authenticated || !this.currentUser) {
        throw new Error('User not authenticated');
      }
      
      const isCroUser = this.currentUser.organizationId === 'org-1'; // TrialCRO
      
      let accessibleOrganizations = [];
      
      if (isCroUser) {
        // CRO users can access their own organization and child organizations
        accessibleOrganizations = this.organizations.filter(org => 
          org.id === 'org-1' || org.parentId === 'org-1'
        );
      } else {
        // Regular users can only access their own organization
        accessibleOrganizations = this.organizations.filter(org => 
          org.id === this.currentUser.organizationId
        );
      }
      
      return accessibleOrganizations.map(org => this.sanitizeOrganizationData(org));
    } catch (error) {
      console.error('[Security] Get accessible organizations error:', error);
      throw error;
    }
  }
  
  // Get users for an organization
  async getOrganizationUsers(organizationId) {
    try {
      if (!this.authenticated || !this.currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Check if the user has access to the organization
      const isCroUser = this.currentUser.organizationId === 'org-1'; // TrialCRO
      const isOrgAdmin = this.currentUser.role === 'admin' && this.currentUser.organizationId === organizationId;
      
      if (!isCroUser && !isOrgAdmin) {
        throw new Error('Unauthorized');
      }
      
      const users = this.users.filter(user => user.organizationId === organizationId);
      
      return users.map(user => this.sanitizeUserData(user));
    } catch (error) {
      console.error('[Security] Get organization users error:', error);
      throw error;
    }
  }
  
  // Create a new user
  async createUser(userData) {
    try {
      if (!this.authenticated || !this.currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Check if the user has permission to create users
      const isCroUser = this.currentUser.organizationId === 'org-1'; // TrialCRO
      const isOrgAdmin = this.currentUser.role === 'admin';
      
      if (!isCroUser && !isOrgAdmin) {
        throw new Error('Unauthorized');
      }
      
      // Check if the organization exists
      const organization = this.organizations.find(org => org.id === userData.organizationId);
      
      if (!organization) {
        throw new Error('Organization not found');
      }
      
      // Check if the user has access to the organization
      if (!isCroUser && this.currentUser.organizationId !== userData.organizationId) {
        throw new Error('Unauthorized to create users for this organization');
      }
      
      // Check if username or email already exists
      const existingUser = this.users.find(
        user => user.username === userData.username || user.email === userData.email
      );
      
      if (existingUser) {
        throw new Error('Username or email already exists');
      }
      
      // Generate a new user ID
      const userId = `user-${Date.now()}`;
      
      // Create the new user
      const newUser = {
        id: userId,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        organizationId: userData.organizationId,
        role: userData.role || 'viewer',
        permissions: userData.permissions || ['read'],
        mfaEnabled: userData.mfaEnabled || false,
        lastLogin: null,
        createdAt: new Date().toISOString()
      };
      
      // Add the user to the list
      this.users.push(newUser);
      
      console.log(`[Security] User ${newUser.username} created successfully`);
      
      return {
        success: true,
        user: this.sanitizeUserData(newUser)
      };
    } catch (error) {
      console.error('[Security] Create user error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
  
  // Update a user
  async updateUser(userId, updates) {
    try {
      if (!this.authenticated || !this.currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Find the user to update
      const userIndex = this.users.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      const user = this.users[userIndex];
      
      // Check if the current user has permission to update this user
      const isCroUser = this.currentUser.organizationId === 'org-1'; // TrialCRO
      const isOrgAdmin = this.currentUser.role === 'admin' && this.currentUser.organizationId === user.organizationId;
      const isSelf = this.currentUser.id === userId;
      
      const canUpdateRole = isCroUser || isOrgAdmin;
      const canUpdateDetails = isCroUser || isOrgAdmin || isSelf;
      
      if (!canUpdateDetails) {
        throw new Error('Unauthorized');
      }
      
      // Create updated user object
      const updatedUser = { ...user };
      
      // Update fields
      if (updates.firstName !== undefined) updatedUser.firstName = updates.firstName;
      if (updates.lastName !== undefined) updatedUser.lastName = updates.lastName;
      if (updates.email !== undefined) updatedUser.email = updates.email;
      if (updates.mfaEnabled !== undefined) updatedUser.mfaEnabled = updates.mfaEnabled;
      
      // Role and permissions can only be updated by CRO users or org admins
      if (canUpdateRole) {
        if (updates.role !== undefined) updatedUser.role = updates.role;
        if (updates.permissions !== undefined) updatedUser.permissions = updates.permissions;
      }
      
      // Update the user in the list
      this.users[userIndex] = updatedUser;
      
      // If updating the current user, update currentUser
      if (isSelf) {
        this.currentUser = updatedUser;
      }
      
      console.log(`[Security] User ${user.username} updated successfully`);
      
      return {
        success: true,
        user: this.sanitizeUserData(updatedUser)
      };
    } catch (error) {
      console.error('[Security] Update user error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
  
  // Delete a user
  async deleteUser(userId) {
    try {
      if (!this.authenticated || !this.currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Find the user to delete
      const userIndex = this.users.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      const user = this.users[userIndex];
      
      // Check if the current user has permission to delete this user
      const isCroUser = this.currentUser.organizationId === 'org-1'; // TrialCRO
      const isOrgAdmin = this.currentUser.role === 'admin' && this.currentUser.organizationId === user.organizationId;
      
      if (!isCroUser && !isOrgAdmin) {
        throw new Error('Unauthorized');
      }
      
      // Cannot delete self
      if (this.currentUser.id === userId) {
        throw new Error('Cannot delete your own account');
      }
      
      // Remove the user from the list
      this.users.splice(userIndex, 1);
      
      console.log(`[Security] User ${user.username} deleted successfully`);
      
      return {
        success: true
      };
    } catch (error) {
      console.error('[Security] Delete user error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
  
  // Create a new organization (CRO only)
  async createOrganization(organizationData) {
    try {
      if (!this.authenticated || !this.currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Only CRO users can create organizations
      const isCroUser = this.currentUser.organizationId === 'org-1'; // TrialCRO
      
      if (!isCroUser) {
        throw new Error('Unauthorized');
      }
      
      // Generate a new organization ID
      const organizationId = `org-${Date.now()}`;
      
      // Create the new organization
      const newOrganization = {
        id: organizationId,
        name: organizationData.name,
        type: organizationData.type || 'biotech',
        description: organizationData.description || '',
        parentId: 'org-1', // Child of TrialCRO
        settings: organizationData.settings || {
          secureMode: true,
          mfaRequired: true,
          passwordPolicy: 'strong',
          sessionTimeout: 30 // minutes
        },
        createdAt: new Date().toISOString()
      };
      
      // Add the organization to the list
      this.organizations.push(newOrganization);
      
      console.log(`[Security] Organization ${newOrganization.name} created successfully`);
      
      return {
        success: true,
        organization: this.sanitizeOrganizationData(newOrganization)
      };
    } catch (error) {
      console.error('[Security] Create organization error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
  
  // Update an organization
  async updateOrganization(organizationId, updates) {
    try {
      if (!this.authenticated || !this.currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Find the organization to update
      const organizationIndex = this.organizations.findIndex(org => org.id === organizationId);
      
      if (organizationIndex === -1) {
        throw new Error('Organization not found');
      }
      
      const organization = this.organizations[organizationIndex];
      
      // Check if the current user has permission to update this organization
      const isCroUser = this.currentUser.organizationId === 'org-1'; // TrialCRO
      const isOrgAdmin = this.currentUser.role === 'admin' && this.currentUser.organizationId === organizationId;
      
      if (!isCroUser && !isOrgAdmin) {
        throw new Error('Unauthorized');
      }
      
      // Create updated organization object
      const updatedOrganization = { ...organization };
      
      // Update fields
      if (updates.name !== undefined) updatedOrganization.name = updates.name;
      if (updates.description !== undefined) updatedOrganization.description = updates.description;
      if (updates.settings !== undefined) {
        updatedOrganization.settings = {
          ...updatedOrganization.settings,
          ...updates.settings
        };
      }
      
      // Only CRO users can update organization type
      if (isCroUser && updates.type !== undefined) {
        updatedOrganization.type = updates.type;
      }
      
      // Update the organization in the list
      this.organizations[organizationIndex] = updatedOrganization;
      
      // If updating the current organization, update currentOrganization
      if (this.currentOrganization.id === organizationId) {
        this.currentOrganization = updatedOrganization;
        this.secureModeEnabled = updatedOrganization.settings.secureMode;
      }
      
      console.log(`[Security] Organization ${organization.name} updated successfully`);
      
      return {
        success: true,
        organization: this.sanitizeOrganizationData(updatedOrganization)
      };
    } catch (error) {
      console.error('[Security] Update organization error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
  
  // Delete an organization (CRO only)
  async deleteOrganization(organizationId) {
    try {
      if (!this.authenticated || !this.currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Only CRO users can delete organizations
      const isCroUser = this.currentUser.organizationId === 'org-1'; // TrialCRO
      
      if (!isCroUser) {
        throw new Error('Unauthorized');
      }
      
      // Cannot delete the CRO organization
      if (organizationId === 'org-1') {
        throw new Error('Cannot delete the CRO organization');
      }
      
      // Find the organization to delete
      const organizationIndex = this.organizations.findIndex(org => org.id === organizationId);
      
      if (organizationIndex === -1) {
        throw new Error('Organization not found');
      }
      
      const organization = this.organizations[organizationIndex];
      
      // Delete all users in the organization
      this.users = this.users.filter(user => user.organizationId !== organizationId);
      
      // Remove the organization from the list
      this.organizations.splice(organizationIndex, 1);
      
      console.log(`[Security] Organization ${organization.name} deleted successfully`);
      
      return {
        success: true
      };
    } catch (error) {
      console.error('[Security] Delete organization error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
  
  // Check if a user has a specific permission
  hasPermission(userId, permission) {
    try {
      // Find the user
      const user = this.users.find(u => u.id === userId);
      
      if (!user) {
        return false;
      }
      
      // Check if the user has the 'all' permission
      if (user.permissions.includes('all')) {
        return true;
      }
      
      // Check if the user has the specific permission
      return user.permissions.includes(permission);
    } catch (error) {
      console.error('[Security] Check permission error:', error);
      return false;
    }
  }
  
  // Check if the current user has a specific permission
  currentUserHasPermission(permission) {
    if (!this.authenticated || !this.currentUser) {
      return false;
    }
    
    return this.hasPermission(this.currentUser.id, permission);
  }
  
  // Record a user session
  recordSession(sessionData) {
    const session = {
      id: `session-${Date.now()}`,
      userId: sessionData.userId,
      organizationId: sessionData.organizationId,
      ipAddress: sessionData.ipAddress || '127.0.0.1',
      userAgent: sessionData.userAgent || navigator.userAgent,
      loginTime: sessionData.loginTime || new Date().toISOString(),
      logoutTime: sessionData.logoutTime || null
    };
    
    this.sessions.push(session);
    
    return session;
  }
  
  // Get user sessions
  async getUserSessions(userId) {
    try {
      if (!this.authenticated || !this.currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Check if the current user has permission to view these sessions
      const isCroUser = this.currentUser.organizationId === 'org-1'; // TrialCRO
      const isOrgAdmin = this.currentUser.role === 'admin';
      const isSelf = this.currentUser.id === userId;
      
      if (!isCroUser && !isOrgAdmin && !isSelf) {
        throw new Error('Unauthorized');
      }
      
      // Get sessions for the user
      const sessions = this.sessions.filter(session => session.userId === userId);
      
      // Sort by login time (newest first)
      sessions.sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime));
      
      return sessions;
    } catch (error) {
      console.error('[Security] Get user sessions error:', error);
      throw error;
    }
  }
  
  // Get organization activity log
  async getOrganizationActivityLog(organizationId) {
    try {
      if (!this.authenticated || !this.currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Check if the current user has permission to view the activity log
      const isCroUser = this.currentUser.organizationId === 'org-1'; // TrialCRO
      const isOrgAdmin = this.currentUser.role === 'admin' && this.currentUser.organizationId === organizationId;
      
      if (!isCroUser && !isOrgAdmin) {
        throw new Error('Unauthorized');
      }
      
      // Get sessions for the organization
      const sessions = this.sessions.filter(session => session.organizationId === organizationId);
      
      // Sort by login time (newest first)
      sessions.sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime));
      
      return sessions;
    } catch (error) {
      console.error('[Security] Get organization activity log error:', error);
      throw error;
    }
  }
  
  // Sanitize user data for client
  sanitizeUserData(user) {
    // Return a copy without sensitive data
    const { ...sanitizedUser } = user;
    
    // Remove sensitive fields
    delete sanitizedUser.password;
    
    return sanitizedUser;
  }
  
  // Sanitize organization data for client
  sanitizeOrganizationData(organization) {
    // Return a copy
    return { ...organization };
  }
}

// Export as singleton instance
const securityService = new SecurityService();

// Initialize the service on import
securityService.initialize();

export default securityService;