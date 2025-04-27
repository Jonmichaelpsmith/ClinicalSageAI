/**
 * Module Integration Layer
 * 
 * This component provides a unified integration layer for all modules and services
 * in the TrialSage platform, serving as the central nervous system for data and services.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// Services
import RegulatoryIntelligenceCore from '../../services/RegulatoryIntelligenceCore';
import SecurityService from '../../services/SecurityService';
import WorkflowService from '../../services/WorkflowService';
import blockchainService from '../../services/blockchain';

// Document sharing service (simulated)
class DocuShareService {
  constructor() {
    this.isInitialized = false;
    this.documents = [];
  }
  
  async initialize() {
    try {
      console.log('Initializing DocuShare Service');
      
      // Simulate loading documents
      this.documents = [
        {
          id: 'doc-001',
          name: 'IND Application - XYZ-123',
          type: 'IND',
          status: 'Draft',
          createdAt: '2025-04-10T09:00:00Z',
          updatedAt: '2025-04-20T14:30:00Z',
          owner: 'John Smith',
          size: '4.2 MB',
          path: '/documents/ind/xyz-123.pdf'
        },
        {
          id: 'doc-002',
          name: 'Clinical Study Report - ABC-456',
          type: 'CSR',
          status: 'Final',
          createdAt: '2025-03-15T11:30:00Z',
          updatedAt: '2025-03-28T16:45:00Z',
          owner: 'Jane Doe',
          size: '8.7 MB',
          path: '/documents/csr/abc-456.pdf'
        },
        {
          id: 'doc-003',
          name: 'Statistical Analysis Plan - DEF-789',
          type: 'SAP',
          status: 'In Review',
          createdAt: '2025-04-05T13:15:00Z',
          updatedAt: '2025-04-18T10:00:00Z',
          owner: 'Robert Chen',
          size: '2.1 MB',
          path: '/documents/sap/def-789.pdf'
        }
      ];
      
      this.isInitialized = true;
      console.log('DocuShare Service initialized');
      return true;
    } catch (error) {
      console.error('Error initializing DocuShare Service:', error);
      throw error;
    }
  }
  
  getAllDocuments() {
    if (!this.isInitialized) {
      throw new Error('DocuShare Service not initialized');
    }
    
    return this.documents;
  }
  
  getDocument(documentId) {
    if (!this.isInitialized) {
      throw new Error('DocuShare Service not initialized');
    }
    
    return this.documents.find(doc => doc.id === documentId);
  }
  
  addDocument(document) {
    if (!this.isInitialized) {
      throw new Error('DocuShare Service not initialized');
    }
    
    this.documents.push(document);
    return document;
  }
  
  updateDocument(documentId, updates) {
    if (!this.isInitialized) {
      throw new Error('DocuShare Service not initialized');
    }
    
    const index = this.documents.findIndex(doc => doc.id === documentId);
    
    if (index === -1) {
      throw new Error(`Document not found: ${documentId}`);
    }
    
    this.documents[index] = { ...this.documents[index], ...updates };
    return this.documents[index];
  }
  
  deleteDocument(documentId) {
    if (!this.isInitialized) {
      throw new Error('DocuShare Service not initialized');
    }
    
    const index = this.documents.findIndex(doc => doc.id === documentId);
    
    if (index === -1) {
      throw new Error(`Document not found: ${documentId}`);
    }
    
    this.documents.splice(index, 1);
    return true;
  }
  
  cleanup() {
    this.isInitialized = false;
    this.documents = [];
    console.log('DocuShare Service cleaned up');
  }
}

// Create context
const IntegrationContext = createContext(null);

/**
 * Integration Provider Component
 * 
 * This component provides access to all centralized services for the TrialSage platform.
 */
export const IntegrationProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Initializing services...');
  const [error, setError] = useState(null);
  
  // Service instances
  const [services] = useState({
    regulatoryIntelligenceCore: new RegulatoryIntelligenceCore(),
    securityService: new SecurityService(),
    workflowService: new WorkflowService(),
    docuShareService: new DocuShareService(),
    blockchainService: null // Will be initialized later
  });
  
  // Initialize all services on mount
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize security service
        setLoadingMessage('Initializing security services...');
        await services.securityService.initialize();
        
        // Initialize regulatory intelligence core
        setLoadingMessage('Initializing regulatory intelligence...');
        await services.regulatoryIntelligenceCore.initialize();
        
        // Initialize workflow service
        setLoadingMessage('Initializing workflow services...');
        await services.workflowService.initialize();
        
        // Initialize document service
        setLoadingMessage('Initializing document services...');
        await services.docuShareService.initialize();
        
        // Initialize blockchain service
        setLoadingMessage('Initializing blockchain verification...');
        services.blockchainService = await blockchainService.initBlockchainService();
        
        // All services initialized
        setInitialized(true);
        setLoadingMessage(null);
      } catch (error) {
        console.error('Error initializing services:', error);
        setError(error.message);
      }
    };
    
    initializeServices();
    
    // Cleanup services on unmount
    return () => {
      services.regulatoryIntelligenceCore.cleanup();
      services.securityService.cleanup();
      services.workflowService.cleanup();
      services.docuShareService.cleanup();
    };
  }, [services]);
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    return services.securityService.isAuthenticated();
  };
  
  // Get current user
  const getCurrentUser = () => {
    return services.securityService.currentUser;
  };
  
  // Login
  const login = async (credentials) => {
    return await services.securityService.login(credentials);
  };
  
  // Logout
  const logout = async () => {
    return await services.securityService.logout();
  };
  
  // Helper to query scientific guidance
  const getScientificGuidance = async (query) => {
    return await services.regulatoryIntelligenceCore.getScientificGuidance(query);
  };
  
  // Value object with all services and utilities
  const value = {
    // Service objects
    ...services,
    
    // Status
    initialized,
    loadingMessage,
    error,
    
    // Authentication utilities
    isAuthenticated,
    getCurrentUser,
    login,
    logout,
    
    // Helper utilities
    getScientificGuidance
  };
  
  // If not initialized, show loading screen
  if (!initialized && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">{loadingMessage}</p>
      </div>
    );
  }
  
  // If there was an error initializing services
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="rounded-full bg-red-100 p-4 text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="mt-4 text-xl font-bold text-gray-900">Service Initialization Error</h1>
        <p className="mt-2 text-gray-600">{error}</p>
        <button 
          className="mt-6 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Render children with services provided
  return (
    <IntegrationContext.Provider value={value}>
      {children}
    </IntegrationContext.Provider>
  );
};

/**
 * useIntegration Hook
 * 
 * Custom hook to access the integration layer and all services.
 */
export const useIntegration = () => {
  const context = useContext(IntegrationContext);
  
  if (!context) {
    throw new Error('useIntegration must be used within an IntegrationProvider');
  }
  
  return context;
};