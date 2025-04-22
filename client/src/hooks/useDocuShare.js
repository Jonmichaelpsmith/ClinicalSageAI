import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook for interacting with the DocuShare document management system
 * 
 * Provides functionality for retrieving, uploading, downloading, and managing documents
 * within the 21 CFR Part 11 compliant DocuShare system.
 * 
 * @returns {Object} DocuShare operations and data
 */
export function useDocuShare() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get all documents from the DocuShare system
  const { 
    data: documents = [], 
    isLoading: isLoadingDocuments,
    error: documentsError 
  } = useQuery({
    queryKey: ['/api/docushare/documents'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Upload a document to DocuShare
  const uploadMutation = useMutation({
    mutationFn: async ({ file, moduleContext, sectionContext, metadata }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('moduleContext', moduleContext || 'general');
      formData.append('sectionContext', sectionContext || '');
      
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }
      
      const response = await apiRequest('POST', '/api/docushare/upload', formData, {
        headers: {
          // Don't set Content-Type here; the browser will set it with the boundary for FormData
        },
      });
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate documents query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/docushare/documents'] });
      
      toast({
        title: 'Document uploaded',
        description: 'The document was successfully uploaded to DocuShare.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Upload failed',
        description: error.message || 'There was an error uploading the document.',
        variant: 'destructive',
      });
    },
  });
  
  // Download a document from DocuShare
  const downloadMutation = useMutation({
    mutationFn: async (documentId) => {
      const response = await apiRequest('GET', `/api/docushare/download/${documentId}`, null, {
        responseType: 'blob',
      });
      
      // Get filename from response headers or use a default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'document.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      // Create a download link and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      return { documentId, filename };
    },
    onError: (error) => {
      toast({
        title: 'Download failed',
        description: error.message || 'There was an error downloading the document.',
        variant: 'destructive',
      });
    },
  });
  
  // Get document metadata
  const getDocumentMetadata = useCallback(async (documentId) => {
    try {
      const response = await apiRequest('GET', `/api/docushare/metadata/${documentId}`);
      return response.json();
    } catch (error) {
      toast({
        title: 'Error retrieving metadata',
        description: error.message || 'There was an error retrieving document metadata.',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);
  
  // Upload a document to DocuShare
  const uploadDocument = useCallback(async (file, moduleContext, sectionContext, metadata) => {
    return uploadMutation.mutateAsync({ file, moduleContext, sectionContext, metadata });
  }, [uploadMutation]);
  
  // Download a document from DocuShare
  const downloadDocument = useCallback(async (documentId) => {
    return downloadMutation.mutateAsync(documentId);
  }, [downloadMutation]);
  
  // Check if the document has 21 CFR Part 11 compliance features
  const isCompliant = useCallback((document) => {
    // In a real implementation, this would verify the document's compliance attributes
    // For now, we'll assume all documents in DocuShare are compliant
    return true;
  }, []);
  
  // For development/demo purposes, if there are no documents, generate some placeholder documents
  useEffect(() => {
    if (documents.length === 0 && !isLoadingDocuments) {
      // This is just for demonstration purposes and would be removed in production
      const placeholderDocuments = [
        {
          id: 'doc1',
          name: 'Clinical Protocol v1.2',
          moduleContext: 'ind',
          sectionContext: 'clinical-protocol',
          documentType: 'protocol',
          lastModified: new Date('2025-04-10').toISOString(),
          size: 1245000,
          version: '1.2',
          author: 'Dr. Sarah Johnson',
        },
        {
          id: 'doc2',
          name: 'Investigator Brochure Draft',
          moduleContext: 'ind',
          sectionContext: 'investigator-brochure',
          documentType: 'brochure',
          lastModified: new Date('2025-04-08').toISOString(),
          size: 3450000,
          version: '0.9',
          author: 'Dr. Michael Chen',
        },
        {
          id: 'doc3',
          name: 'CMC Documentation Package',
          moduleContext: 'ind',
          sectionContext: 'cmc',
          documentType: 'submission',
          lastModified: new Date('2025-04-15').toISOString(),
          size: 7890000,
          version: '2.0',
          author: 'Dr. Emily Roberts',
        },
        {
          id: 'doc4',
          name: 'FDA Form 1571',
          moduleContext: 'ind',
          sectionContext: 'fda-forms',
          documentType: 'form',
          lastModified: new Date('2025-04-18').toISOString(),
          size: 450000,
          version: '1.0',
          author: 'James Wilson',
        },
        {
          id: 'doc5',
          name: 'Pre-IND Meeting Minutes',
          moduleContext: 'ind',
          sectionContext: 'pre-planning',
          documentType: 'minutes',
          lastModified: new Date('2025-03-22').toISOString(),
          size: 890000,
          version: '1.0',
          author: 'Dr. Lisa Patel',
        },
      ];
      
      // Set the placeholder documents in the query cache
      queryClient.setQueryData(['/api/docushare/documents'], placeholderDocuments);
    }
  }, [documents, isLoadingDocuments, queryClient]);
  
  return {
    // Data
    documents,
    isLoadingDocuments,
    documentsError,
    
    // Operations
    uploadDocument,
    downloadDocument,
    getDocumentMetadata,
    isCompliant,
    
    // Status
    isUploading: uploadMutation.isPending,
    isDownloading: downloadMutation.isPending,
  };
}