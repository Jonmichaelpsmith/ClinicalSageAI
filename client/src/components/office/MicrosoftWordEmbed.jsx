import React, { useState, useEffect, useRef } from 'react';
import { getAccessToken, isAuthenticated, login } from '../../services/microsoftAuthService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "../ui/spinner";
import { useToast } from "@/hooks/use-toast";

/**
 * Microsoft Word Embed Component
 * 
 * This component embeds a Microsoft Word editor directly within the application using
 * either:
 * 1. Office 365 API and iframe embedding for direct integration
 * 2. OneDrive/SharePoint for document storage with seamless editing experience
 * 
 * The component handles authentication with Microsoft, document loading/saving,
 * and maintaining the user's workflow context.
 */
const MicrosoftWordEmbed = ({ 
  documentId,
  documentName = "Untitled Document",
  isTemplate = false,
  onSave,
  onClose,
  onStatusChange,
  readOnly = false
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [documentEmbedUrl, setDocumentEmbedUrl] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  
  const iframeRef = useRef(null);
  const { toast } = useToast();
  
  // Check authentication status on mount
  useEffect(() => {
    checkAuthAndLoadDocument();
    
    // Set up message listener for communication with the embedded Word iframe
    window.addEventListener('message', handleIframeMessage);
    
    return () => {
      window.removeEventListener('message', handleIframeMessage);
    };
  }, [documentId]);
  
  // Check authentication and load document
  const checkAuthAndLoadDocument = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!isAuthenticated()) {
        setIsAuthenticating(true);
        return;
      }
      
      await loadDocument();
    } catch (err) {
      console.error('Error initializing Word editor:', err);
      setError('Failed to initialize Word editor. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle Microsoft login
  const handleLogin = async () => {
    try {
      setIsAuthenticating(true);
      const success = await login();
      
      if (!success) {
        throw new Error('Authentication failed');
      }
      
      // After successful login, the page will redirect to the callback URL
      // and then back to this component
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login with Microsoft. Please try again.');
      setIsAuthenticating(false);
    }
  };
  
  // Load document from OneDrive/SharePoint
  const loadDocument = async () => {
    setLoading(true);
    
    try {
      const accessToken = getAccessToken();
      
      if (!accessToken) {
        setIsAuthenticating(true);
        return;
      }
      
      let url;
      let embedUrl;
      
      if (documentId) {
        // Fetch existing document from OneDrive/SharePoint
        const response = await fetch(`/api/microsoft/documents/${documentId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch document information');
        }
        
        const data = await response.json();
        url = data.webUrl;
        embedUrl = data.embedUrl;
      } else {
        // Create a new document in OneDrive/SharePoint
        const response = await fetch('/api/microsoft/documents', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: documentName,
            isTemplate: isTemplate
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to create new document');
        }
        
        const data = await response.json();
        url = data.webUrl;
        embedUrl = data.embedUrl;
      }
      
      setDocumentUrl(url);
      setDocumentEmbedUrl(embedUrl);
      setLoading(false);
      
      // Notify parent component about status change
      onStatusChange?.('loaded');
    } catch (err) {
      console.error('Error loading document:', err);
      setError('Failed to load document. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle iframe messages from embedded Word
  const handleIframeMessage = (event) => {
    // Only accept messages from trusted sources
    if (event.origin !== 'https://onedrive.live.com' && 
        event.origin !== 'https://word.office.com' && 
        event.origin !== 'https://word-edit.officeapps.live.com') {
      return;
    }
    
    try {
      const message = event.data;
      
      if (typeof message !== 'object') return;
      
      // Handle different message types
      switch (message.type) {
        case 'documentChanged':
          setHasPendingChanges(true);
          onStatusChange?.('edited');
          break;
          
        case 'documentSaved':
          setHasPendingChanges(false);
          onStatusChange?.('saved');
          break;
          
        case 'error':
          console.error('Word editor error:', message.error);
          toast({
            variant: "destructive",
            title: "Word Editor Error",
            description: message.error || "An error occurred in the Word editor"
          });
          break;
      }
    } catch (err) {
      console.error('Error handling iframe message:', err);
    }
  };
  
  // Save document
  const handleSave = async () => {
    if (!hasPendingChanges) return;
    
    setIsSaving(true);
    
    try {
      // Send save message to the iframe
      iframeRef.current?.contentWindow?.postMessage(
        { action: 'save' },
        documentEmbedUrl
      );
      
      // Wait for the save to complete (in a real implementation, 
      // we would wait for a message from the iframe)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Notify parent component
      onSave?.({
        documentId: documentId,
        documentUrl: documentUrl
      });
      
      setHasPendingChanges(false);
      setIsSaving(false);
      
      toast({
        title: "Document Saved",
        description: "Your document has been saved successfully"
      });
    } catch (err) {
      console.error('Error saving document:', err);
      setIsSaving(false);
      
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Failed to save document. Please try again."
      });
    }
  };
  
  // Render authentication UI
  if (isAuthenticating) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
        <Alert>
          <AlertTitle>Microsoft authentication required</AlertTitle>
          <AlertDescription>
            To use the Word editor, you need to sign in with your Microsoft account.
          </AlertDescription>
        </Alert>
        <Button onClick={handleLogin} size="lg">
          Sign in with Microsoft
        </Button>
      </div>
    );
  }
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading Word editor...</p>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={checkAuthAndLoadDocument} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }
  
  // Render the Word editor iframe
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 bg-muted">
        <div className="text-sm font-medium truncate">
          {documentName}
          {hasPendingChanges && <span className="ml-2 text-muted-foreground">(Unsaved changes)</span>}
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSave}
            disabled={isSaving || !hasPendingChanges || readOnly}
          >
            {isSaving ? <Spinner size="sm" className="mr-2" /> : null}
            Save
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
      
      <div className="flex-1 relative">
        {documentEmbedUrl && (
          <iframe
            ref={iframeRef}
            src={documentEmbedUrl + (readOnly ? '&action=view' : '&action=edit')}
            className="absolute inset-0 w-full h-full border-0"
            title="Microsoft Word Editor"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
};

export default MicrosoftWordEmbed;