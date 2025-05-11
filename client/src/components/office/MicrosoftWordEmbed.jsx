import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, FileText, Link2, ExternalLink, PanelRight, Mail } from 'lucide-react';
import DocumentUploader from './DocumentUploader';

/**
 * Microsoft Word Embed Component
 * 
 * Embeds Microsoft Word within the application using Office Online integration.
 * Supports viewing, editing, and saving Word documents while keeping users 
 * within the platform's ecosystem to maintain workflow control.
 * 
 * This component handles:
 * - Loading Office Online iframe
 * - Authentication with Microsoft services
 * - Document creation, loading, and saving
 * - Integration with the tenant system for permissions
 * - Communication with the Word instance through postMessage
 */
const MicrosoftWordEmbed = ({
  documentId = null,
  mode = 'edit', // edit, view, or co-edit
  height = '800px',
  width = '100%',
  initialContent = '',
  authToken = null,
  tenantId = null,
  onSave = () => {},
  onError = () => {}
}) => {
  // State for component
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const [editorReady, setEditorReady] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  
  // Refs
  const iframeRef = useRef(null);
  const { toast } = useToast();
  
  // Get embed URL for a document
  const getDocumentEmbedUrl = async (id) => {
    try {
      if (!authToken) {
        setError("Authentication token is required");
        return null;
      }
      
      const response = await fetch(`/api/office/documents/${id}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get document: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDocumentData(data);
      return data.embedUrl;
      
    } catch (err) {
      console.error("Error getting document embed URL:", err);
      setError(`Failed to load document: ${err.message}`);
      onError(err);
      return null;
    }
  };
  
  // Create a new document if none exists
  const createNewDocument = async () => {
    try {
      if (!authToken) {
        setError("Authentication token is required");
        return null;
      }
      
      const response = await fetch('/api/office/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: 'New Document.docx',
          content: initialContent || ''
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create document: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDocumentData(data);
      return data.embedUrl;
      
    } catch (err) {
      console.error("Error creating document:", err);
      setError(`Failed to create document: ${err.message}`);
      onError(err);
      return null;
    }
  };
  
  // Handle messages from the iframe
  const handleMessage = (event) => {
    // In a real implementation, you would verify the origin
    // and handle different message types from the Office Online frame
    
    try {
      const message = event.data;
      
      if (message.type === 'ready') {
        setEditorReady(true);
        setLoading(false);
      }
      
      if (message.type === 'save') {
        // Handle save event
        toast({
          title: "Document Saved",
          description: "Your document has been saved successfully.",
        });
        
        if (onSave && documentData) {
          onSave(documentData);
        }
      }
      
      if (message.type === 'error') {
        setError(message.message || "An error occurred");
        onError(new Error(message.message));
      }
      
    } catch (err) {
      console.error("Error handling iframe message:", err);
    }
  };
  
  // Save document
  const saveDocument = async () => {
    try {
      if (!documentData || !documentData.id) {
        throw new Error("No document to save");
      }
      
      // In a real implementation, you would extract content from the iframe
      // and use the Office JavaScript API or postMessage to get content
      
      // For demo purposes, we'll simulate content extraction and saving
      
      toast({
        title: "Saving Document",
        description: "Please wait while your document is saved...",
      });
      
      // Call postMessage to the iframe to trigger document save
      if (iframeRef.current) {
        iframeRef.current.contentWindow.postMessage({
          type: 'command',
          action: 'save'
        }, '*');
      }
      
    } catch (err) {
      console.error("Error saving document:", err);
      setError(`Failed to save document: ${err.message}`);
      onError(err);
      
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: err.message || "Failed to save document",
      });
    }
  };
  
  // Handle file upload completion
  const handleUploadComplete = async (response) => {
    try {
      if (response && response.id) {
        setShowUploader(false);
        setLoading(true);
        
        // Get the embed URL for the uploaded document
        const embedUrl = await getDocumentEmbedUrl(response.id);
        
        if (embedUrl) {
          setDocumentData(response);
          setLoading(false);
          
          toast({
            title: "Document Uploaded",
            description: "Your document has been uploaded and is ready for editing.",
          });
        }
      }
    } catch (err) {
      console.error("Error handling upload completion:", err);
      setError(`Failed to load uploaded document: ${err.message}`);
      onError(err);
    }
  };
  
  // Load document when component mounts
  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let embedUrl;
        
        if (documentId) {
          // Load existing document
          embedUrl = await getDocumentEmbedUrl(documentId);
        } else {
          // Create new document
          embedUrl = await createNewDocument();
        }
        
        if (!embedUrl) {
          throw new Error("Failed to get document URL");
        }
        
        setLoading(false);
        
      } catch (err) {
        console.error("Error loading document:", err);
        setError(`Failed to load document: ${err.message}`);
        setLoading(false);
        onError(err);
      }
    };
    
    loadDocument();
    
    // Add message listener for iframe communication
    window.addEventListener('message', handleMessage);
    
    return () => {
      // Clean up
      window.removeEventListener('message', handleMessage);
    };
    
  }, [documentId, authToken]);
  
  // Mock embed URL for development
  const mockEmbedUrl = () => {
    // In a real implementation, this would be the actual Office Online URL
    // For now, we'll return a placeholder that will show a message
    return 'about:blank';
  };
  
  // Render loading state
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <Spinner size="lg" className="mb-4" />
            <p>Loading Microsoft Word document...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            <Button variant="outline" onClick={() => setShowUploader(true)}>
              <FileText className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
          
          {showUploader && (
            <div className="mt-6">
              <DocumentUploader 
                onUploadComplete={handleUploadComplete}
                tenantId={tenantId}
                acceptedFileTypes={['.docx', '.doc']}
                allowMultiple={false}
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Document uploader
  if (showUploader) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <DocumentUploader 
            onUploadComplete={handleUploadComplete}
            tenantId={tenantId}
            acceptedFileTypes={['.docx', '.doc']}
            allowMultiple={false}
          />
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => setShowUploader(false)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render Word iframe or message if no document is loaded yet
  return (
    <Card className="w-full">
      <div className="border-b p-3 flex justify-between items-center">
        <div className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-blue-600" />
          <span className="font-medium">
            {documentData?.name || "Document"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={saveDocument}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowUploader(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Upload
          </Button>
          {documentData?.webUrl && (
            <Button size="sm" variant="outline" asChild>
              <a 
                href={documentData.webUrl} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Office
              </a>
            </Button>
          )}
        </div>
      </div>
      
      <CardContent className="p-0">
        {documentData?.embedUrl ? (
          <iframe
            ref={iframeRef}
            src={documentData.embedUrl || mockEmbedUrl()}
            width={width}
            height={height}
            frameBorder="0"
            title="Microsoft Word Document"
            allowFullScreen
            className="w-full"
          />
        ) : (
          <div 
            className="flex items-center justify-center bg-gray-50" 
            style={{ height, width }}
          >
            <div className="text-center p-6">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No document loaded
              </h3>
              <p className="text-gray-500 mb-4">
                Upload a document or create a new one to get started
              </p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => setShowUploader(true)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
                <Button variant="outline" onClick={() => createNewDocument()}>
                  <FileText className="mr-2 h-4 w-4" />
                  New Document
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MicrosoftWordEmbed;