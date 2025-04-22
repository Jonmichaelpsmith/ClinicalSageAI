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
    queryKey: ['/api/docs'],
    queryFn: async () => {
      return fetch('/api/docs').then(r => r.json());
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Upload a document to DocuShare
  const uploadMutation = useMutation({
    mutationFn: async ({ file, moduleContext, sectionContext, metadata }) => {
      // Convert file to base64
      const b64 = await file.arrayBuffer().then(b => Buffer.from(b).toString('base64'));
      
      const response = await fetch('/api/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: b64,
          name: file.name,
          moduleContext: moduleContext || 'general',
          sectionContext: sectionContext || '',
          metadata: metadata || {}
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload document');
      }
      
      return { success: true, filename: file.name };
    },
    onSuccess: () => {
      // Invalidate documents query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/docs'] });
      
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
  
  // No more placeholder documents - we're using real data from the DocuShare API now
  
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