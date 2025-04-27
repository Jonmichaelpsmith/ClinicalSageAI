/**
 * Security Service
 * 
 * This service handles authentication, authorization, and user management
 * for the TrialSage platform.
 */

class SecurityService {
  constructor() {
    // Current authenticated user
    this.currentUser = {
      id: 'user-001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      permissions: [
        'read:documents',
        'write:documents',
        'manage:users',
        'manage:settings'
      ]
    };
    
    // Current organization (for multi-tenant support)
    this.currentOrganization = {
      id: 'org-001',
      name: 'BioGenix Therapeutics',
      type: 'cro', // 'cro', 'biotech', 'pharma', etc.
      plan: 'enterprise',
      modules: [
        'ind-wizard',
        'trial-vault',
        'csr-intelligence',
        'study-architect',
        'analytics'
      ]
    };
    
    this.authenticated = true;
    
    // Organizations accessible to the current user
    this.accessibleOrganizations = [
      {
        id: 'org-001',
        name: 'BioGenix Therapeutics',
        type: 'cro',
        role: 'admin'
      },
      {
        id: 'org-002',
        name: 'NeuroCure Biotech',
        type: 'biotech',
        role: 'admin'
      },
      {
        id: 'org-003',
        name: 'CardioMed Pharma',
        type: 'pharma',
        role: 'admin'
      },
      {
        id: 'org-004',
        name: 'ImmunoTech Research',
        type: 'biotech',
        role: 'admin'
      }
    ];
  }
  
  /**
   * Login a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<object>} - Authenticated user object
   */
  async login(email, password) {
    // In a real implementation, this would make an API call
    console.log(`[Security] Login attempt: ${email}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Hardcoded for demo
    if (email === 'john.doe@example.com' && password === 'password') {
      this.authenticated = true;
      localStorage.setItem('authenticated', 'true');
      
      return {
        success: true,
        user: this.currentUser
      };
    } else {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }
  }
  
  /**
   * Logout the current user
   * @returns {Promise<object>} - Logout result
   */
  async logout() {
    // In a real implementation, this would call an API
    console.log('[Security] Logout');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Clear authentication state
    this.authenticated = false;
    localStorage.removeItem('authenticated');
    
    return {
      success: true
    };
  }
  
  /**
   * Get the user's accessible organizations
   * @returns {Promise<Array>} - List of organizations
   */
  async getAccessibleOrganizations() {
    // In a real implementation, this would call an API
    console.log('[Security] Getting accessible organizations');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return this.accessibleOrganizations;
  }
  
  /**
   * Switch the current organization
   * @param {string} organizationId - Organization ID to switch to
   * @returns {Promise<object>} - Switch result
   */
  async switchOrganization(organizationId) {
    // In a real implementation, this would call an API
    console.log(`[Security] Switching organization: ${organizationId}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the organization in accessible organizations
    const organization = this.accessibleOrganizations.find(org => org.id === organizationId);
    
    if (organization) {
      // Update current organization
      this.currentOrganization = {
        ...organization,
        modules: [
          'ind-wizard',
          'trial-vault',
          'csr-intelligence',
          'study-architect',
          'analytics'
        ]
      };
      
      return {
        success: true,
        organization: this.currentOrganization
      };
    } else {
      return {
        success: false,
        message: 'Organization not found or not accessible'
      };
    }
  }
  
  /**
   * Check if the current user has a specific permission
   * @param {string} permission - Permission to check
   * @returns {boolean} - Whether the user has the permission
   */
  hasPermission(permission) {
    if (!this.authenticated || !this.currentUser) {
      return false;
    }
    
    return this.currentUser.permissions.includes(permission);
  }
  
  /**
   * Check if the current user has access to a specific module
   * @param {string} moduleId - Module ID to check
   * @returns {boolean} - Whether the user has access to the module
   */
  hasModuleAccess(moduleId) {
    if (!this.authenticated || !this.currentOrganization) {
      return false;
    }
    
    return this.currentOrganization.modules.includes(moduleId);
  }
}

// Export a singleton instance
const securityService = new SecurityService();
export default securityService;