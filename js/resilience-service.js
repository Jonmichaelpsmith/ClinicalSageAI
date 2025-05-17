/**
 * TrialSage Resilience Service
 * 
 * This service provides mechanisms to improve application stability on Replit:
 * 1. Server Pre-warming - Prevents server hibernation by regular pinging
 * 2. Auto-authentication - Ensures users can access protected areas
 * 3. Login state management - Maintains authentication across sessions
 */

class ResilienceService {
  constructor(options = {}) {
    this.options = {
      prewarmEndpoint: '/api/prewarm',
      prewarmInterval: 4 * 60 * 1000, // 4 minutes
      prewarmEnabled: true,
      autoLoginEnabled: true,
      authRedirectDelay: 1500, // 1.5 seconds
      silentMode: false,
      ...options
    };
    
    this.prewarmIntervalId = null;
    this.initialized = false;
    
  }
  
  /**
   * Initialize the resilience service
   */
  init() {
    if (this.initialized) {
      return;
    }
    
    this._log('Initializing TrialSage Resilience Service');
    
    // Start prewarming if enabled
    if (this.options.prewarmEnabled) {
      this.startPrewarming();
    }
    
    // Handle auto-login if enabled
    if (this.options.autoLoginEnabled) {
      this.ensureAuthentication();
    }
    
    this.initialized = true;
  }
  
  /**
   * Start the server prewarming process
   */
  startPrewarming() {
    this._log('Starting server prewarming');
    
    // Perform an initial prewarm
    this.prewarmServer();
    
    // Set up recurring prewarming
    this.prewarmIntervalId = setInterval(() => {
      this.prewarmServer();
    }, this.options.prewarmInterval);
  }
  
  /**
   * Stop the server prewarming process
   */
  stopPrewarming() {
    if (this.prewarmIntervalId) {
      clearInterval(this.prewarmIntervalId);
      this.prewarmIntervalId = null;
      this._log('Server prewarming stopped');
    }
  }
  
  /**
   * Perform a server prewarm request
   */
  prewarmServer() {
    this._log('Pre-warming server...');
    
    fetch(this.options.prewarmEndpoint)
      .then(response => {
        this._log('Server warm-up response:', response.status);
        return response;
      })
      .catch(err => {
        console.error('Server prewarm error:', err);
      });
  }
  
  /**
   * Ensure user is authenticated
   */
  async ensureAuthentication() {
    this._log('Checking authentication state');
    await this.performAutoLogin();
  }
  
  /**
   * Perform auto-login with default credentials
   */
  async performAutoLogin() {
    const token = localStorage.getItem('jwt');
    if (!token) {
      this._log('No stored authentication token found');
      return;
    }

    try {
      const response = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.user) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('user', JSON.stringify(data.user));
          this._log('Auto-login completed');
        }
      } else {
        this._log('Authentication token invalid');
        localStorage.removeItem('jwt');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
      }
    } catch (err) {
      console.error('Auto-login error:', err);
    }
  }
  
  /**
   * Redirect to a new page with delay to allow server stabilization
   */
  redirectWithDelay(url) {
    this._log(`Redirecting to ${url} with ${this.options.authRedirectDelay}ms delay`);
    
    setTimeout(() => {
      window.location.href = url;
    }, this.options.authRedirectDelay);
  }
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = localStorage.getItem('jwt');
    return localStorage.getItem('isAuthenticated') === 'true' && !!token;
  }
  
  /**
   * Get the current user
   */
  getCurrentUser() {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        return JSON.parse(userString);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    return null;
  }
  
  /**
   * Logout the user
   */
  logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('jwt');
    fetch('/api/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    this._log('User logged out');
  }
  
  /**
   * Internal logging function
   */
  _log(...args) {
    if (!this.options.silentMode) {
      console.log(...args);
    }
  }
}

// Export as a singleton
window.ResilienceService = ResilienceService;