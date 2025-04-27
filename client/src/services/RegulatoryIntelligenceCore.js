/**
 * Regulatory Intelligence Core
 * 
 * This service acts as the central AI intelligence system for the TrialSage platform.
 * It provides regulatory and scientific intelligence, document processing capabilities,
 * and integrates with blockchain for enhanced security and verification.
 * 
 * The intelligence core serves as the "central nervous system" for the platform,
 * connecting all modules with shared intelligence and insights.
 */

// API client 
const API_BASE = '/api/intelligence';

class RegulatoryIntelligenceCore {
  constructor() {
    this.isInitialized = false;
    this.config = {
      blockchain: {
        enabled: false,
        verificationEnabled: false
      },
      ai: {
        enabled: false,
        model: null
      },
      regulatory: {
        enabled: false,
        lastUpdate: null
      }
    };
    this.user = null;
    this.insightsCache = new Map();
    this.documentsCache = new Map();
    this.pendingRequests = new Map();
  }

  /**
   * Initialize the intelligence core
   * @param {Object} options - Initialization options
   * @returns {Promise<Object>} - Initialization status
   */
  async initialize(options = {}) {
    if (this.isInitialized) {
      console.log('RegulatoryIntelligenceCore already initialized');
      return { status: 'already_initialized', config: this.config };
    }
    
    console.log('Initializing RegulatoryIntelligenceCore...');
    
    try {
      // Initialize services
      const response = await fetch(`${API_BASE}/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          blockchain: options.enableBlockchain ? { enabled: true } : undefined
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to initialize services: ${errorData.message || response.statusText}`);
      }
      
      const initStatus = await response.json();
      
      // Check service status
      const statusResponse = await fetch(`${API_BASE}/status`);
      const serviceStatus = await statusResponse.json();
      
      // Update configuration
      this.config = {
        blockchain: {
          enabled: serviceStatus.services.blockchain.initialized && serviceStatus.services.blockchain.config.enabled,
          verificationEnabled: serviceStatus.services.blockchain.config?.verificationEnabled || false
        },
        ai: {
          enabled: serviceStatus.services.ai.available,
          model: serviceStatus.services.ai.model
        },
        regulatory: {
          enabled: serviceStatus.services.regulatory.isUpToDate,
          lastUpdate: serviceStatus.services.regulatory.lastUpdated
        }
      };
      
      this.isInitialized = true;
      console.log('RegulatoryIntelligenceCore initialized successfully');
      
      return {
        status: 'success',
        config: this.config,
        serviceStatus
      };
    } catch (error) {
      console.error('Failed to initialize RegulatoryIntelligenceCore:', error);
      
      return {
        status: 'error',
        error: error.message
      };
    }
  }
  
  /**
   * Set user context
   * @param {Object} user - User object
   */
  setUser(user) {
    this.user = user;
  }
  
  /**
   * Get regulatory insights for a context
   * @param {string} contextType - Context type (document, submission, product, etc.)
   * @param {string} contextId - Context ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Regulatory insights
   */
  async getRegulatoryInsights(contextType, contextId, options = {}) {
    try {
      if (!this.isInitialized) {
        console.warn('RegulatoryIntelligenceCore not initialized. Initializing now...');
        await this.initialize();
      }
      
      // Check cache first if caching is enabled
      if (options.useCache !== false) {
        const cacheKey = `regulatory-${contextType}-${contextId}-${JSON.stringify(options)}`;
        
        if (this.insightsCache.has(cacheKey)) {
          console.log(`Using cached regulatory insights for ${contextType}:${contextId}`);
          return this.insightsCache.get(cacheKey);
        }
      }
      
      // Build the topic from context
      let topic;
      if (options.topic) {
        topic = options.topic;
      } else {
        topic = `${contextType} ${contextId}`;
        if (options.keywords && options.keywords.length > 0) {
          topic += ` ${options.keywords.join(' ')}`;
        }
      }
      
      // Call API
      const response = await fetch(`${API_BASE}/regulatory/intelligence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic,
          options: {
            authority: options.authority,
            limit: options.limit || 5,
            includeGuidance: options.includeGuidance !== false,
            includeRegulations: options.includeRegulations !== false,
            includeStandards: options.includeStandards !== false
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get regulatory insights: ${errorData.message || response.statusText}`);
      }
      
      const insightsData = await response.json();
      
      // Cache results if caching is enabled
      if (options.useCache !== false) {
        const cacheKey = `regulatory-${contextType}-${contextId}-${JSON.stringify(options)}`;
        this.insightsCache.set(cacheKey, insightsData);
        
        // Set cache expiry (24 hours)
        setTimeout(() => {
          this.insightsCache.delete(cacheKey);
        }, 24 * 60 * 60 * 1000);
      }
      
      return insightsData;
    } catch (error) {
      console.error(`Error getting regulatory insights for ${contextType}:${contextId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get scientific insights for a context
   * @param {string} contextType - Context type (document, submission, product, etc.)
   * @param {string} contextId - Context ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Scientific insights
   */
  async getScientificInsights(contextType, contextId, options = {}) {
    try {
      if (!this.isInitialized) {
        console.warn('RegulatoryIntelligenceCore not initialized. Initializing now...');
        await this.initialize();
      }
      
      // Check cache first if caching is enabled
      if (options.useCache !== false) {
        const cacheKey = `scientific-${contextType}-${contextId}-${JSON.stringify(options)}`;
        
        if (this.insightsCache.has(cacheKey)) {
          console.log(`Using cached scientific insights for ${contextType}:${contextId}`);
          return this.insightsCache.get(cacheKey);
        }
      }
      
      // This would call a scientific insights endpoint in production
      // For now, we'll simulate with regulatory insights endpoint
      
      // Build the topic from context
      let topic;
      if (options.topic) {
        topic = options.topic;
      } else {
        topic = `scientific ${contextType} ${contextId}`;
        if (options.keywords && options.keywords.length > 0) {
          topic += ` ${options.keywords.join(' ')}`;
        }
      }
      
      // Call API
      const response = await fetch(`${API_BASE}/regulatory/intelligence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic,
          options: {
            limit: options.limit || 5,
            includeGuidance: options.includeGuidance !== false,
            includeRegulations: false, // Not relevant for scientific insights
            includeStandards: options.includeStandards !== false
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get scientific insights: ${errorData.message || response.statusText}`);
      }
      
      const insightsData = await response.json();
      
      // Transform to scientific insights format
      const scientificInsights = {
        ...insightsData,
        insightType: 'scientific',
        analysis: {
          ...insightsData.analysis,
          scientificRelevance: 'high'
        }
      };
      
      // Cache results if caching is enabled
      if (options.useCache !== false) {
        const cacheKey = `scientific-${contextType}-${contextId}-${JSON.stringify(options)}`;
        this.insightsCache.set(cacheKey, scientificInsights);
        
        // Set cache expiry (24 hours)
        setTimeout(() => {
          this.insightsCache.delete(cacheKey);
        }, 24 * 60 * 60 * 1000);
      }
      
      return scientificInsights;
    } catch (error) {
      console.error(`Error getting scientific insights for ${contextType}:${contextId}:`, error);
      throw error;
    }
  }
  
  /**
   * Generate text with AI for regulatory content
   * @param {string} prompt - Generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<string>} - Generated text
   */
  async generateRegulatoryText(prompt, options = {}) {
    try {
      if (!this.isInitialized) {
        console.warn('RegulatoryIntelligenceCore not initialized. Initializing now...');
        await this.initialize();
      }
      
      // Call API
      const response = await fetch(`${API_BASE}/regulatory-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          options: {
            temperature: options.temperature || 0.2,
            maxTokens: options.maxTokens || 2000,
            model: options.model || this.config.ai.model,
            systemPrompt: options.systemPrompt
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to generate regulatory text: ${errorData.message || response.statusText}`);
      }
      
      const result = await response.json();
      return result.text;
    } catch (error) {
      console.error('Error generating regulatory text:', error);
      throw error;
    }
  }
  
  /**
   * Extract structured data from regulatory text
   * @param {string} text - Text to extract from
   * @param {Array} fields - Fields to extract
   * @param {Object} options - Extraction options
   * @returns {Promise<Object>} - Extracted data
   */
  async extractRegulatoryData(text, fields, options = {}) {
    try {
      if (!this.isInitialized) {
        console.warn('RegulatoryIntelligenceCore not initialized. Initializing now...');
        await this.initialize();
      }
      
      // Call API
      const response = await fetch(`${API_BASE}/extract-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          fields,
          options: {
            model: options.model || this.config.ai.model,
            systemPrompt: options.systemPrompt
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to extract regulatory data: ${errorData.message || response.statusText}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error extracting regulatory data:', error);
      throw error;
    }
  }
  
  /**
   * Analyze document for regulatory compliance
   * @param {string} text - Document text
   * @param {string} standard - Regulatory standard
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} - Compliance analysis
   */
  async analyzeCompliance(text, standard, options = {}) {
    try {
      if (!this.isInitialized) {
        console.warn('RegulatoryIntelligenceCore not initialized. Initializing now...');
        await this.initialize();
      }
      
      // Call API
      const response = await fetch(`${API_BASE}/compliance-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          standard,
          options: {
            model: options.model || this.config.ai.model,
            systemPrompt: options.systemPrompt
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to analyze compliance: ${errorData.message || response.statusText}`);
      }
      
      const result = await response.json();
      return result.analysis;
    } catch (error) {
      console.error('Error analyzing compliance:', error);
      throw error;
    }
  }
  
  /**
   * Generate summary of regulatory document
   * @param {string} text - Document text
   * @param {Object} options - Summary options
   * @returns {Promise<string>} - Generated summary
   */
  async generateDocumentSummary(text, options = {}) {
    try {
      if (!this.isInitialized) {
        console.warn('RegulatoryIntelligenceCore not initialized. Initializing now...');
        await this.initialize();
      }
      
      // Call API
      const response = await fetch(`${API_BASE}/document-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          options: {
            length: options.length,
            focus: options.focus,
            includeHeadings: options.includeHeadings,
            maxTokens: options.maxTokens,
            model: options.model || this.config.ai.model,
            systemPrompt: options.systemPrompt
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to generate document summary: ${errorData.message || response.statusText}`);
      }
      
      const result = await response.json();
      return result.summary;
    } catch (error) {
      console.error('Error generating document summary:', error);
      throw error;
    }
  }
  
  /**
   * Process document (PDF)
   * @param {File} file - File object
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} - Processing result
   */
  async processDocument(file, options = {}) {
    try {
      if (!this.isInitialized) {
        console.warn('RegulatoryIntelligenceCore not initialized. Initializing now...');
        await this.initialize();
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      if (options.title) formData.append('title', options.title);
      if (options.author) formData.append('author', options.author);
      if (options.options) formData.append('options', JSON.stringify(options.options));
      
      // Call API
      const response = await fetch(`${API_BASE}/documents/process`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to process document: ${errorData.message || response.statusText}`);
      }
      
      const result = await response.json();
      
      // Cache document info
      this.documentsCache.set(result.resultId, {
        fileName: result.fileName,
        metadata: result.metadata,
        status: result.status,
        processedAt: new Date().toISOString()
      });
      
      return result;
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  }
  
  /**
   * Extract structured data from processed document
   * @param {string} resultId - Processing result ID
   * @param {Object} options - Extraction options
   * @returns {Promise<Object>} - Structured data
   */
  async extractDocumentData(resultId, options = {}) {
    try {
      if (!this.isInitialized) {
        console.warn('RegulatoryIntelligenceCore not initialized. Initializing now...');
        await this.initialize();
      }
      
      // Call API
      const response = await fetch(`${API_BASE}/documents/extract/${resultId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          options
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to extract document data: ${errorData.message || response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error extracting data from document ${resultId}:`, error);
      throw error;
    }
  }
  
  /**
   * Generate document from template
   * @param {string} templateId - Template ID
   * @param {Object} data - Template data
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - Generated document
   */
  async generateDocument(templateId, data, options = {}) {
    try {
      if (!this.isInitialized) {
        console.warn('RegulatoryIntelligenceCore not initialized. Initializing now...');
        await this.initialize();
      }
      
      // Call API
      const response = await fetch(`${API_BASE}/documents/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId,
          data,
          options
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to generate document: ${errorData.message || response.statusText}`);
      }
      
      const result = await response.json();
      return result.document;
    } catch (error) {
      console.error(`Error generating document from template ${templateId}:`, error);
      throw error;
    }
  }
  
  /**
   * Register document in blockchain
   * @param {Object} document - Document object
   * @returns {Promise<Object>} - Registration result
   */
  async registerDocumentWithBlockchain(document) {
    try {
      if (!this.isInitialized) {
        console.warn('RegulatoryIntelligenceCore not initialized. Initializing now...');
        await this.initialize();
      }
      
      if (!this.config.blockchain.enabled) {
        throw new Error('Blockchain service is not enabled');
      }
      
      // Call API
      const response = await fetch(`${API_BASE}/blockchain/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          document
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to register document in blockchain: ${errorData.message || response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error registering document ${document.id} in blockchain:`, error);
      throw error;
    }
  }
  
  /**
   * Update document in blockchain
   * @param {Object} document - Document object
   * @returns {Promise<Object>} - Update result
   */
  async updateDocumentInBlockchain(document) {
    try {
      if (!this.isInitialized) {
        console.warn('RegulatoryIntelligenceCore not initialized. Initializing now...');
        await this.initialize();
      }
      
      if (!this.config.blockchain.enabled) {
        throw new Error('Blockchain service is not enabled');
      }
      
      // Call API
      const response = await fetch(`${API_BASE}/blockchain/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          document
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update document in blockchain: ${errorData.message || response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error updating document ${document.id} in blockchain:`, error);
      throw error;
    }
  }
  
  /**
   * Verify document with blockchain
   * @param {Object} document - Document object
   * @returns {Promise<Object>} - Verification result
   */
  async verifyDocumentWithBlockchain(document) {
    try {
      if (!this.isInitialized) {
        console.warn('RegulatoryIntelligenceCore not initialized. Initializing now...');
        await this.initialize();
      }
      
      if (!this.config.blockchain.enabled || !this.config.blockchain.verificationEnabled) {
        throw new Error('Blockchain verification is not enabled');
      }
      
      // Call API
      const response = await fetch(`${API_BASE}/blockchain/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          document
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to verify document with blockchain: ${errorData.message || response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error verifying document ${document.id} with blockchain:`, error);
      throw error;
    }
  }
  
  /**
   * Create blockchain audit trail
   * @param {string} operation - Operation type
   * @param {string} resourceId - Resource ID
   * @param {Object} data - Audit data
   * @returns {Promise<Object>} - Audit trail result
   */
  async createBlockchainAuditTrail(operation, resourceId, data) {
    try {
      if (!this.isInitialized) {
        console.warn('RegulatoryIntelligenceCore not initialized. Initializing now...');
        await this.initialize();
      }
      
      if (!this.config.blockchain.enabled) {
        throw new Error('Blockchain service is not enabled');
      }
      
      // Call API
      const response = await fetch(`${API_BASE}/blockchain/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation,
          resourceId,
          data
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create blockchain audit trail: ${errorData.message || response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error creating blockchain audit trail for ${resourceId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get document blockchain history
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} - Blockchain history
   */
  async getDocumentBlockchainHistory(documentId) {
    try {
      if (!this.isInitialized) {
        console.warn('RegulatoryIntelligenceCore not initialized. Initializing now...');
        await this.initialize();
      }
      
      if (!this.config.blockchain.enabled) {
        throw new Error('Blockchain service is not enabled');
      }
      
      // Call API
      const response = await fetch(`${API_BASE}/blockchain/history/${documentId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get document blockchain history: ${errorData.message || response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error getting blockchain history for document ${documentId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get chat response from AI
   * @param {string} message - User message
   * @param {Object} context - Chat context
   * @returns {Promise<string>} - AI response
   */
  async getChatResponse(message, context = {}) {
    try {
      if (!this.isInitialized) {
        console.warn('RegulatoryIntelligenceCore not initialized. Initializing now...');
        await this.initialize();
      }
      
      if (!this.config.ai.enabled) {
        throw new Error('AI service is not enabled');
      }
      
      // Build prompt based on context
      let prompt = message;
      
      if (context.activeModule) {
        prompt = `[Module: ${context.moduleName || context.activeModule}] ${prompt}`;
      }
      
      // Add previous messages if available
      let systemPrompt = "You are an AI specialized in regulatory science, drug development, and clinical trial documentation. Provide accurate and helpful responses to questions about regulatory affairs, document preparation, and scientific topics.";
      
      if (context.previousMessages && context.previousMessages.length > 0) {
        // Would use a more sophisticated prompt building approach in production
        systemPrompt += "\n\nHere's the conversation history:";
        context.previousMessages.forEach(msg => {
          if (msg.type === 'user') {
            systemPrompt += `\nUser: ${msg.content}`;
          } else if (msg.type === 'assistant') {
            systemPrompt += `\nAssistant: ${msg.content}`;
          }
        });
      }
      
      // Generate text
      return await this.generateRegulatoryText(prompt, {
        systemPrompt,
        temperature: 0.7 // More creative for chat
      });
    } catch (error) {
      console.error('Error getting chat response:', error);
      throw error;
    }
  }
  
  /**
   * Generate recommendations based on context
   * @param {string} contextType - Context type
   * @param {string} contextId - Context ID
   * @param {Object} options - Generation options
   * @returns {Promise<Array>} - Recommendations
   */
  async generateRecommendations(contextType, contextId, options = {}) {
    try {
      if (!this.isInitialized) {
        console.warn('RegulatoryIntelligenceCore not initialized. Initializing now...');
        await this.initialize();
      }
      
      // Check cache first if caching is enabled
      if (options.useCache !== false) {
        const cacheKey = `recommendations-${contextType}-${contextId}-${JSON.stringify(options)}`;
        
        if (this.insightsCache.has(cacheKey)) {
          console.log(`Using cached recommendations for ${contextType}:${contextId}`);
          return this.insightsCache.get(cacheKey);
        }
      }
      
      // Get context data
      let contextData = null;
      if (options.contextData) {
        contextData = options.contextData;
      }
      
      // Get regulatory insights
      const regulatoryInsights = await this.getRegulatoryInsights(contextType, contextId, {
        ...options,
        useCache: true
      });
      
      // Generate recommendations using insights
      const prompt = `
        Generate actionable recommendations based on the following regulatory insights:
        ${JSON.stringify(regulatoryInsights)}
        
        ${contextData ? `Additional context: ${JSON.stringify(contextData)}` : ''}
        
        Provide 3-5 specific recommendations that are:
        1. Practical and actionable
        2. Relevant to the regulatory context
        3. Prioritized by importance
        
        Format each recommendation with:
        - A clear title
        - A concise description
        - A priority level (high, medium, low)
        - A category (regulatory, scientific, operational, etc.)
        
        Return as a JSON array of recommendation objects.
      `;
      
      const systemPrompt = "You are an AI regulatory expert that provides practical recommendations to help users navigate complex regulatory environments. Focus on actionable advice that is well-prioritized.";
      
      // Generate text
      const recommendationsText = await this.generateRegulatoryText(prompt, {
        systemPrompt,
        temperature: 0.3
      });
      
      // Parse recommendations
      let recommendations = [];
      try {
        recommendations = JSON.parse(recommendationsText);
      } catch (e) {
        console.error('Error parsing recommendations JSON:', e);
        
        // Try to extract JSON if not valid
        const jsonStart = recommendationsText.indexOf('[');
        const jsonEnd = recommendationsText.lastIndexOf(']');
        
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const jsonStr = recommendationsText.substring(jsonStart, jsonEnd + 1);
          try {
            recommendations = JSON.parse(jsonStr);
          } catch (e2) {
            console.error('Error parsing extracted recommendations JSON:', e2);
          }
        }
      }
      
      // Cache results if caching is enabled
      if (options.useCache !== false && recommendations.length > 0) {
        const cacheKey = `recommendations-${contextType}-${contextId}-${JSON.stringify(options)}`;
        this.insightsCache.set(cacheKey, recommendations);
        
        // Set cache expiry (24 hours)
        setTimeout(() => {
          this.insightsCache.delete(cacheKey);
        }, 24 * 60 * 60 * 1000);
      }
      
      return recommendations;
    } catch (error) {
      console.error(`Error generating recommendations for ${contextType}:${contextId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get status of intelligence services
   * @returns {Promise<Object>} - Service status
   */
  async getStatus() {
    try {
      const response = await fetch(`${API_BASE}/status`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get service status: ${errorData.message || response.statusText}`);
      }
      
      const statusData = await response.json();
      
      // Update configuration
      this.config = {
        blockchain: {
          enabled: statusData.services.blockchain.initialized && statusData.services.blockchain.config.enabled,
          verificationEnabled: statusData.services.blockchain.config?.verificationEnabled || false
        },
        ai: {
          enabled: statusData.services.ai.available,
          model: statusData.services.ai.model
        },
        regulatory: {
          enabled: statusData.services.regulatory.isUpToDate,
          lastUpdate: statusData.services.regulatory.lastUpdated
        }
      };
      
      return statusData;
    } catch (error) {
      console.error('Error getting intelligence service status:', error);
      throw error;
    }
  }
  
  /**
   * Clear caches
   * @param {string} cacheType - Type of cache to clear (insights, documents, all)
   */
  clearCaches(cacheType = 'all') {
    if (cacheType === 'all' || cacheType === 'insights') {
      this.insightsCache.clear();
    }
    
    if (cacheType === 'all' || cacheType === 'documents') {
      this.documentsCache.clear();
    }
    
    console.log(`Cleared ${cacheType} caches`);
  }
}

// Create singleton instance
const regulatoryIntelligenceCore = new RegulatoryIntelligenceCore();
export default regulatoryIntelligenceCore;