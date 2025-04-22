import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import docuShareService from '@/services/DocuShareService';

/**
 * Custom hook for working with DocuShare documents and workflows
 * Provides methods for document management, viewing, and 21 CFR Part 11 compliance
 */
export function useDocuShare() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [documentContent, setDocumentContent] = useState(null);
  const [auditTrail, setAuditTrail] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [error, setError] = useState(null);
  
  const { toast } = useToast();
  
  /**
   * Authenticate with DocuShare
   */
  const authenticate = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await docuShareService.authenticate(username, password);
      setIsAuthenticated(true);
      toast({
        title: "Authentication Successful",
        description: "Connected to DocuShare document management system",
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: "Authentication Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  /**
   * Load documents from a collection
   */
  const loadDocuments = useCallback(async (collectionId, options = {}) => {
    if (!isAuthenticated) {
      setError("Not authenticated with DocuShare");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const docs = await docuShareService.getDocuments(collectionId, options);
      setDocuments(docs);
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error Loading Documents",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, toast]);
  
  /**
   * Load a specific document by ID
   */
  const loadDocument = useCallback(async (documentId) => {
    if (!isAuthenticated) {
      setError("Not authenticated with DocuShare");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const metadata = await docuShareService.getDocumentMetadata(documentId);
      setCurrentDocument(metadata);
      
      // Load audit trail
      const audit = await docuShareService.getDocumentAuditTrail(documentId);
      setAuditTrail(audit);
      
      // Load signatures
      const sigs = await docuShareService.getDocumentSignatures(documentId);
      setSignatures(sigs);
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error Loading Document",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, toast]);
  
  /**
   * Load document content
   */
  const loadDocumentContent = useCallback(async (documentId, format = 'pdf') => {
    if (!isAuthenticated) {
      setError("Not authenticated with DocuShare");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await docuShareService.getDocumentContent(documentId, format);
      setDocumentContent(content);
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error Loading Document Content",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, toast]);
  
  /**
   * Upload a new document
   */
  const uploadDocument = useCallback(async (collectionId, file, metadata = {}) => {
    if (!isAuthenticated) {
      setError("Not authenticated with DocuShare");
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await docuShareService.uploadDocument(collectionId, file, metadata);
      toast({
        title: "Document Uploaded",
        description: `${file.name} was successfully uploaded`,
      });
      return result;
    } catch (err) {
      setError(err.message);
      toast({
        title: "Upload Failed",
        description: err.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, toast]);
  
  /**
   * Update document content
   */
  const updateDocumentContent = useCallback(async (documentId, file) => {
    if (!isAuthenticated) {
      setError("Not authenticated with DocuShare");
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await docuShareService.updateDocumentContent(documentId, file);
      toast({
        title: "Document Updated",
        description: `Document content was successfully updated`,
      });
      return result;
    } catch (err) {
      setError(err.message);
      toast({
        title: "Update Failed",
        description: err.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, toast]);
  
  /**
   * Update document metadata
   */
  const updateDocumentMetadata = useCallback(async (documentId, metadata) => {
    if (!isAuthenticated) {
      setError("Not authenticated with DocuShare");
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await docuShareService.updateDocumentMetadata(documentId, metadata);
      toast({
        title: "Metadata Updated",
        description: `Document metadata was successfully updated`,
      });
      return result;
    } catch (err) {
      setError(err.message);
      toast({
        title: "Metadata Update Failed",
        description: err.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, toast]);
  
  /**
   * Sign a document (21 CFR Part 11 compliant)
   */
  const signDocument = useCallback(async (documentId, signatureData) => {
    if (!isAuthenticated) {
      setError("Not authenticated with DocuShare");
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await docuShareService.signDocument(documentId, signatureData);
      
      // Refresh signatures
      const sigs = await docuShareService.getDocumentSignatures(documentId);
      setSignatures(sigs);
      
      toast({
        title: "Document Signed",
        description: `Electronic signature was successfully applied`,
      });
      
      return result;
    } catch (err) {
      setError(err.message);
      toast({
        title: "Signature Failed",
        description: err.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, toast]);
  
  /**
   * Initiate a regulatory workflow
   */
  const initiateWorkflow = useCallback(async (documentId, workflowType, workflowParams) => {
    if (!isAuthenticated) {
      setError("Not authenticated with DocuShare");
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await docuShareService.initiateWorkflow(
        documentId, 
        workflowType, 
        workflowParams
      );
      
      toast({
        title: "Workflow Initiated",
        description: `${workflowType} workflow was successfully started`,
      });
      
      return result;
    } catch (err) {
      setError(err.message);
      toast({
        title: "Workflow Initiation Failed",
        description: err.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, toast]);
  
  /**
   * Complete a workflow task
   */
  const completeWorkflowTask = useCallback(async (documentId, workflowId, taskId, taskData) => {
    if (!isAuthenticated) {
      setError("Not authenticated with DocuShare");
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await docuShareService.completeWorkflowTask(
        documentId,
        workflowId,
        taskId,
        taskData
      );
      
      toast({
        title: "Task Completed",
        description: `Workflow task was successfully completed`,
      });
      
      return result;
    } catch (err) {
      setError(err.message);
      toast({
        title: "Task Completion Failed",
        description: err.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, toast]);
  
  /**
   * Search for documents with specific criteria
   */
  const searchDocuments = useCallback(async (criteria) => {
    if (!isAuthenticated) {
      setError("Not authenticated with DocuShare");
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await docuShareService.searchDocuments(criteria);
      return results;
    } catch (err) {
      setError(err.message);
      toast({
        title: "Search Failed",
        description: err.message,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, toast]);
  
  return {
    // State
    isAuthenticated,
    isLoading,
    documents,
    currentDocument,
    documentContent,
    auditTrail,
    signatures,
    error,
    
    // Methods
    authenticate,
    loadDocuments,
    loadDocument,
    loadDocumentContent,
    uploadDocument,
    updateDocumentContent,
    updateDocumentMetadata,
    signDocument,
    initiateWorkflow,
    completeWorkflowTask,
    searchDocuments
  };
}