/**
 * Regulatory Intelligence Core
 * 
 * This is the central intelligence system for the TrialSage platform, acting as the 
 * "brain" that coordinates across all modules and provides advanced regulatory and
 * scientific insights. It integrates with all other services to create a unified 
 * intelligence layer powered by state-of-the-art AI models and blockchain technology.
 * 
 * Key features:
 * - Cross-module intelligence coordination
 * - Real-time regulatory monitoring and insights
 * - Scientific data analysis and pattern recognition
 * - Blockchain-powered data integrity and verification
 * - Predictive analytics for regulatory submission success
 * - Smart document generation with regulatory compliance checks
 * - Global regulatory authority database with AI-powered updates
 */

import securityService from './SecurityService';
import docuShareService from './DocuShareService';
import mashableService from './MashableService';
import workflowService from './WorkflowService';
import adminService from './AdminService';
import enterpriseService from './EnterpriseService';

// Intelligence modules for specific domains
export const INTELLIGENCE_MODULES = {
  REGULATORY: 'regulatory',
  SCIENTIFIC: 'scientific',
  CLINICAL: 'clinical',
  CMC: 'cmc',
  SAFETY: 'safety',
  COMPLIANCE: 'compliance',
  PROTOCOL: 'protocol',
  NONCLINICAL: 'nonclinical',
  SUBMISSION: 'submission',
  STRATEGIC: 'strategic'
};

// Regulatory authorities tracked by the system
export const REGULATORY_AUTHORITIES = {
  FDA: 'fda',
  EMA: 'ema',
  PMDA: 'pmda',
  NMPA: 'nmpa',
  HEALTH_CANADA: 'health_canada',
  MHRA: 'mhra',
  TGA: 'tga',
  ANVISA: 'anvisa',
  KFDA: 'kfda',
  WHO: 'who'
};

// AI model tiers for different capabilities
export const AI_MODEL_TIERS = {
  STANDARD: 'standard',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
  ENTERPRISE: 'enterprise'
};

// Blockchain verification types
export const BLOCKCHAIN_VERIFICATION_TYPES = {
  DOCUMENT_INTEGRITY: 'document_integrity',
  REGULATORY_SUBMISSION: 'regulatory_submission',
  AUDIT_TRAIL: 'audit_trail',
  SCIENTIFIC_DATA: 'scientific_data',
  COMPLIANCE_RECORD: 'compliance_record',
  PROTOCOL_VERSION: 'protocol_version'
};

class RegulatoryIntelligenceCore {
  constructor() {
    this.apiBase = '/api/intelligence';
    this.blockchainApiBase = '/api/blockchain';
    this.intelligenceListeners = new Map();
    this.activePredictions = new Map();
    this.cachedInsights = new Map();
    this.activeAuthorities = [];
    this.currentActiveModel = null;
    this.modelLoadStatus = 'unloaded';
    this.lastModelUpdate = null;
  }

  /**
   * Initialize the intelligence core
   * @param {Object} options - Initialization options
   * @returns {Promise<Object>} - Initialization status
   */
  async initialize(options = {}) {
    try {
      const response = await fetch(`${this.apiBase}/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize intelligence core: ${response.statusText}`);
      }

      const initStatus = await response.json();
      
      // Cache available regulatory authorities
      if (initStatus.authorities) {
        this.activeAuthorities = initStatus.authorities;
      }
      
      // Set active AI model
      if (initStatus.activeModel) {
        this.currentActiveModel = initStatus.activeModel;
        this.modelLoadStatus = 'loaded';
        this.lastModelUpdate = new Date();
      }
      
      // Initialize blockchain connection
      if (options.enableBlockchain !== false) {
        await this._initializeBlockchain();
      }
      
      return initStatus;
    } catch (error) {
      console.error('Error initializing intelligence core:', error);
      throw error;
    }
  }

  /**
   * Initialize blockchain connection
   * @private
   */
  async _initializeBlockchain() {
    try {
      const response = await fetch(`${this.blockchainApiBase}/initialize`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        console.warn('Blockchain initialization failed, operating in fallback mode');
      }
    } catch (error) {
      console.warn('Blockchain service unavailable, operating in fallback mode:', error);
    }
  }

  /**
   * Get regulatory insights for a specific context
   * @param {string} contextType - Context type (e.g., project, document, submission)
   * @param {string} contextId - Context ID
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} - Regulatory insights
   */
  async getRegulatoryInsights(contextType, contextId, options = {}) {
    const cacheKey = `${contextType}:${contextId}:regulatory`;
    
    // Check cache first if not forcing refresh
    if (!options.forceRefresh && this.cachedInsights.has(cacheKey)) {
      return Promise.resolve(this.cachedInsights.get(cacheKey));
    }
    
    try {
      const queryParams = new URLSearchParams({
        contextType,
        contextId,
        ...options
      }).toString();

      const response = await fetch(`${this.apiBase}/regulatory-insights?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to get regulatory insights: ${response.statusText}`);
      }
      
      const insights = await response.json();
      
      // Cache insights for future use
      this.cachedInsights.set(cacheKey, insights);
      
      return insights;
    } catch (error) {
      console.error('Error getting regulatory insights:', error);
      throw error;
    }
  }

  /**
   * Get scientific insights for a specific context
   * @param {string} contextType - Context type (e.g., project, document, protocol)
   * @param {string} contextId - Context ID
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} - Scientific insights
   */
  async getScientificInsights(contextType, contextId, options = {}) {
    const cacheKey = `${contextType}:${contextId}:scientific`;
    
    // Check cache first if not forcing refresh
    if (!options.forceRefresh && this.cachedInsights.has(cacheKey)) {
      return Promise.resolve(this.cachedInsights.get(cacheKey));
    }
    
    try {
      const queryParams = new URLSearchParams({
        contextType,
        contextId,
        ...options
      }).toString();

      const response = await fetch(`${this.apiBase}/scientific-insights?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to get scientific insights: ${response.statusText}`);
      }
      
      const insights = await response.json();
      
      // Cache insights for future use
      this.cachedInsights.set(cacheKey, insights);
      
      return insights;
    } catch (error) {
      console.error('Error getting scientific insights:', error);
      throw error;
    }
  }

  /**
   * Generate smart regulatory recommendations
   * @param {string} contextType - Context type
   * @param {string} contextId - Context ID
   * @param {Object} options - Recommendation options
   * @returns {Promise<Array>} - List of recommendations
   */
  async generateRecommendations(contextType, contextId, options = {}) {
    try {
      const response = await fetch(`${this.apiBase}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contextType,
          contextId,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate recommendations: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  /**
   * Predict regulatory submission success probability
   * @param {string} submissionType - Submission type (e.g., IND, NDA, BLA)
   * @param {string} projectId - Project ID
   * @param {Object} submissionData - Submission data for analysis
   * @returns {Promise<Object>} - Success prediction with factors
   */
  async predictSubmissionSuccess(submissionType, projectId, submissionData) {
    try {
      const response = await fetch(`${this.apiBase}/predict/submission-success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          submissionType,
          projectId,
          submissionData
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to predict submission success: ${response.statusText}`);
      }

      const prediction = await response.json();
      
      // Store active prediction
      this.activePredictions.set(`${submissionType}:${projectId}`, prediction);
      
      return prediction;
    } catch (error) {
      console.error('Error predicting submission success:', error);
      throw error;
    }
  }

  /**
   * Generate regulatory document with AI
   * @param {string} documentType - Document type to generate
   * @param {Object} contextData - Context data for generation
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - Generated document
   */
  async generateRegulatoryDocument(documentType, contextData, options = {}) {
    try {
      const response = await fetch(`${this.apiBase}/generate/document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentType,
          contextData,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate document: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating document:', error);
      throw error;
    }
  }

  /**
   * Smart extraction of data from regulatory documents
   * @param {string} documentId - Document ID to analyze
   * @param {Array} extractionPoints - Data points to extract
   * @param {Object} options - Extraction options
   * @returns {Promise<Object>} - Extracted data
   */
  async extractRegulatoryData(documentId, extractionPoints = [], options = {}) {
    try {
      const response = await fetch(`${this.apiBase}/extract/document-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentId,
          extractionPoints,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to extract data: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error extracting regulatory data:', error);
      throw error;
    }
  }

  /**
   * Get global regulatory requirements for a product type
   * @param {string} productType - Product type
   * @param {Array} authorities - Regulatory authorities to include
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Regulatory requirements
   */
  async getGlobalRegulatoryRequirements(productType, authorities = [], options = {}) {
    try {
      const queryParams = new URLSearchParams({
        productType,
        authorities: authorities.join(','),
        ...options
      }).toString();

      const response = await fetch(`${this.apiBase}/global-requirements?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to get global requirements: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting global regulatory requirements:', error);
      throw error;
    }
  }

  /**
   * Perform regulatory gap analysis
   * @param {string} projectId - Project ID
   * @param {string} targetAuthority - Target regulatory authority
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} - Gap analysis results
   */
  async performRegulatoryGapAnalysis(projectId, targetAuthority, options = {}) {
    try {
      const response = await fetch(`${this.apiBase}/gap-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          targetAuthority,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to perform gap analysis: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error performing regulatory gap analysis:', error);
      throw error;
    }
  }

  /**
   * Get regulatory authority updates and guidance
   * @param {Array} authorities - Authorities to include
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} - Regulatory updates
   */
  async getRegulatoryUpdates(authorities = [], options = {}) {
    try {
      const queryParams = new URLSearchParams({
        authorities: authorities.join(','),
        ...options
      }).toString();

      const response = await fetch(`${this.apiBase}/regulatory-updates?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to get regulatory updates: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting regulatory updates:', error);
      throw error;
    }
  }

  /**
   * Check document compliance with regulatory standards
   * @param {string} documentId - Document ID
   * @param {Array} standards - Compliance standards to check
   * @param {Object} options - Check options
   * @returns {Promise<Object>} - Compliance check results
   */
  async checkDocumentCompliance(documentId, standards = [], options = {}) {
    try {
      const response = await fetch(`${this.apiBase}/compliance/check-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentId,
          standards,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to check document compliance: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking document compliance:', error);
      throw error;
    }
  }

  /**
   * Add document to blockchain for verification
   * @param {string} documentId - Document ID
   * @param {string} verificationType - Verification type
   * @param {Object} options - Blockchain options
   * @returns {Promise<Object>} - Blockchain receipt
   */
  async addDocumentToBlockchain(documentId, verificationType, options = {}) {
    try {
      const response = await fetch(`${this.blockchainApiBase}/add-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentId,
          verificationType,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to add document to blockchain: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding document to blockchain:', error);
      throw error;
    }
  }

  /**
   * Verify document integrity using blockchain
   * @param {string} documentId - Document ID
   * @param {string} blockchainReceipt - Blockchain receipt
   * @returns {Promise<Object>} - Verification result
   */
  async verifyDocumentWithBlockchain(documentId, blockchainReceipt = null) {
    try {
      const response = await fetch(`${this.blockchainApiBase}/verify-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentId,
          blockchainReceipt
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to verify document: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying document with blockchain:', error);
      throw error;
    }
  }

  /**
   * Create blockchain-verified audit trail
   * @param {string} contextType - Context type
   * @param {string} contextId - Context ID
   * @param {Object} auditData - Audit data
   * @returns {Promise<Object>} - Blockchain audit receipt
   */
  async createBlockchainAuditTrail(contextType, contextId, auditData) {
    try {
      const response = await fetch(`${this.blockchainApiBase}/audit-trail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contextType,
          contextId,
          auditData
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create blockchain audit trail: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating blockchain audit trail:', error);
      throw error;
    }
  }

  /**
   * Generate intelligent clinical protocol
   * @param {Object} protocolParams - Protocol parameters
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - Generated protocol
   */
  async generateIntelligentProtocol(protocolParams, options = {}) {
    try {
      const response = await fetch(`${this.apiBase}/generate/protocol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          protocolParams,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate protocol: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating intelligent protocol:', error);
      throw error;
    }
  }

  /**
   * Get scientific literature analysis
   * @param {string} query - Scientific query
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} - Scientific literature analysis
   */
  async getScientificLiteratureAnalysis(query, options = {}) {
    try {
      const response = await fetch(`${this.apiBase}/scientific/literature-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to analyze scientific literature: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing scientific literature:', error);
      throw error;
    }
  }

  /**
   * Generate CMC strategies
   * @param {string} projectId - Project ID
   * @param {Object} productData - Product data
   * @param {Object} options - Strategy options
   * @returns {Promise<Array>} - CMC strategies
   */
  async generateCmcStrategies(projectId, productData, options = {}) {
    try {
      const response = await fetch(`${this.apiBase}/generate/cmc-strategies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          productData,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate CMC strategies: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating CMC strategies:', error);
      throw error;
    }
  }

  /**
   * Get safety signal detection analysis
   * @param {string} productId - Product ID
   * @param {Object} safetyData - Safety data
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} - Safety analysis results
   */
  async getSafetySignalDetection(productId, safetyData, options = {}) {
    try {
      const response = await fetch(`${this.apiBase}/safety/signal-detection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          safetyData,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get safety signal detection: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting safety signal detection:', error);
      throw error;
    }
  }

  /**
   * Get strategic development recommendations
   * @param {string} projectId - Project ID
   * @param {Object} developmentData - Development data
   * @param {Object} options - Recommendation options
   * @returns {Promise<Object>} - Strategic recommendations
   */
  async getStrategicRecommendations(projectId, developmentData, options = {}) {
    try {
      const response = await fetch(`${this.apiBase}/strategic/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          developmentData,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get strategic recommendations: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting strategic recommendations:', error);
      throw error;
    }
  }

  /**
   * Update AI model parameters
   * @param {Object} modelParams - Model parameters
   * @returns {Promise<Object>} - Updated model status
   */
  async updateAiModelParameters(modelParams) {
    try {
      const response = await fetch(`${this.apiBase}/model/update-parameters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(modelParams)
      });

      if (!response.ok) {
        throw new Error(`Failed to update AI model parameters: ${response.statusText}`);
      }

      const status = await response.json();
      this.currentActiveModel = status.model;
      this.lastModelUpdate = new Date();
      
      return status;
    } catch (error) {
      console.error('Error updating AI model parameters:', error);
      throw error;
    }
  }

  /**
   * Get available intelligence modules
   * @returns {Promise<Array>} - Available modules
   */
  async getAvailableModules() {
    try {
      const response = await fetch(`${this.apiBase}/modules`);
      if (!response.ok) {
        throw new Error(`Failed to fetch available modules: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching available modules:', error);
      throw error;
    }
  }

  /**
   * Get intelligence module configuration
   * @param {string} moduleType - Module type
   * @returns {Promise<Object>} - Module configuration
   */
  async getModuleConfiguration(moduleType) {
    try {
      const response = await fetch(`${this.apiBase}/modules/${moduleType}/configuration`);
      if (!response.ok) {
        throw new Error(`Failed to fetch module configuration: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching module configuration:', error);
      throw error;
    }
  }

  /**
   * Configure intelligence module
   * @param {string} moduleType - Module type
   * @param {Object} config - Module configuration
   * @returns {Promise<Object>} - Updated configuration
   */
  async configureModule(moduleType, config) {
    try {
      const response = await fetch(`${this.apiBase}/modules/${moduleType}/configuration`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error(`Failed to configure module: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error configuring module:', error);
      throw error;
    }
  }

  /**
   * Get intelligence system health status
   * @returns {Promise<Object>} - System health status
   */
  async getSystemHealth() {
    try {
      const response = await fetch(`${this.apiBase}/system-health`);
      if (!response.ok) {
        throw new Error(`Failed to fetch system health: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching system health:', error);
      throw error;
    }
  }

  /**
   * Get AI model performance metrics
   * @param {Object} options - Metrics options
   * @returns {Promise<Object>} - Performance metrics
   */
  async getModelPerformanceMetrics(options = {}) {
    try {
      const queryParams = new URLSearchParams(options).toString();
      const response = await fetch(`${this.apiBase}/model/performance?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch model performance: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching model performance:', error);
      throw error;
    }
  }

  /**
   * Analyze cross-module data patterns
   * @param {Object} analysisConfig - Analysis configuration
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeCrossModulePatterns(analysisConfig) {
    try {
      const response = await fetch(`${this.apiBase}/analyze/cross-module`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(analysisConfig)
      });

      if (!response.ok) {
        throw new Error(`Failed to analyze cross-module patterns: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing cross-module patterns:', error);
      throw error;
    }
  }

  /**
   * Generate enterprise intelligence dashboard
   * @param {Object} dashboardConfig - Dashboard configuration
   * @returns {Promise<Object>} - Dashboard data
   */
  async generateIntelligenceDashboard(dashboardConfig) {
    try {
      const response = await fetch(`${this.apiBase}/dashboard/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dashboardConfig)
      });

      if (!response.ok) {
        throw new Error(`Failed to generate intelligence dashboard: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating intelligence dashboard:', error);
      throw error;
    }
  }

  /**
   * Subscribe to intelligence updates
   * @param {string} updateType - Update type
   * @param {Function} callback - Callback function
   * @returns {string} - Subscription ID
   */
  subscribeToIntelligenceUpdates(updateType, callback) {
    const subscriptionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    if (!this.intelligenceListeners.has(updateType)) {
      this.intelligenceListeners.set(updateType, new Map());
    }
    
    this.intelligenceListeners.get(updateType).set(subscriptionId, callback);
    return subscriptionId;
  }

  /**
   * Unsubscribe from intelligence updates
   * @param {string} updateType - Update type
   * @param {string} subscriptionId - Subscription ID
   */
  unsubscribeFromIntelligenceUpdates(updateType, subscriptionId) {
    if (this.intelligenceListeners.has(updateType)) {
      this.intelligenceListeners.get(updateType).delete(subscriptionId);
    }
  }

  /**
   * Clear cached insights
   * @param {string} contextType - Context type to clear (optional)
   * @param {string} contextId - Context ID to clear (optional)
   * @returns {number} - Number of cleared cache entries
   */
  clearCachedInsights(contextType = null, contextId = null) {
    if (contextType && contextId) {
      // Clear specific context
      let count = 0;
      for (const key of this.cachedInsights.keys()) {
        if (key.startsWith(`${contextType}:${contextId}:`)) {
          this.cachedInsights.delete(key);
          count++;
        }
      }
      return count;
    } else {
      // Clear all cached insights
      const count = this.cachedInsights.size;
      this.cachedInsights.clear();
      return count;
    }
  }

  /**
   * Get active AI model info
   * @returns {Object} - AI model info
   */
  getActiveModelInfo() {
    return {
      model: this.currentActiveModel,
      status: this.modelLoadStatus,
      lastUpdate: this.lastModelUpdate
    };
  }
}

// Create singleton instance
const regulatoryIntelligenceCore = new RegulatoryIntelligenceCore();
export default regulatoryIntelligenceCore;