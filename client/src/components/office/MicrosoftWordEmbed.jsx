import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

/**
 * Microsoft Word Embed Component - Direct Iframe Approach
 * 
 * This component uses Microsoft's official embedding approach to display
 * genuine Microsoft Word 365 in the application. It uses the Microsoft Graph API
 * and the official embedding protocol.
 * 
 * @param {Object} props Component properties
 * @param {string} props.documentId Document ID in the vault
 * @param {string} props.fileUrl Microsoft Graph file URL (optional - will be fetched if not provided)
 * @param {function} props.onSave Callback on save (optional)
 * @param {function} props.onClose Callback on close (optional)
 */
const MicrosoftWordEmbed = ({ 
  documentId, 
  fileUrl, 
  onSave, 
  onClose 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [embedUrl, setEmbedUrl] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  
  const iframeRef = useRef(null);
  
  // Get access token and document URL
  useEffect(() => {
    const getAuthAndUrl = async () => {
      try {
        setIsLoading(true);
        
        // Get access token for Microsoft Graph
        const token = localStorage.getItem('ms_access_token');
        if (!token) {
          setError('Missing Microsoft authentication. Please sign in first.');
          setIsLoading(false);
          return;
        }
        
        setAuthToken(token);
        
        // If we have a direct file URL, use it
        if (fileUrl) {
          setEmbedUrl(createEmbedUrl(fileUrl, token));
          setIsLoading(false);
          return;
        }
        
        // Otherwise, we need to get it from our backend
        const response = await fetch(`/api/microsoft-office/document/${documentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to get document: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.graphFileUrl) {
          throw new Error('Document not found in Microsoft Graph');
        }
        
        // Create the embed URL with the token
        setEmbedUrl(createEmbedUrl(data.graphFileUrl, token));
        setIsLoading(false);
      } catch (err) {
        console.error('Error getting document URL:', err);
        setError(err.message || 'Failed to load Microsoft Word document');
        setIsLoading(false);
      }
    };
    
    getAuthAndUrl();
  }, [documentId, fileUrl]);
  
  // Create the Microsoft Office embed URL with authentication
  const createEmbedUrl = (fileUrl, token) => {
    // If using OneDrive/SharePoint
    if (fileUrl.includes('sharepoint.com') || fileUrl.includes('onedrive.com')) {
      // Format: https://{domain}/personal/{user}/_layouts/15/embed.aspx?item={itempath}
      return `${fileUrl}&access_token=${encodeURIComponent(token)}`;
    }
    
    // If using Microsoft Graph
    if (fileUrl.includes('graph.microsoft.com')) {
      // Example: Transform graph API URL to web URL
      // From: https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}
      // To: https://office.com/launch/word/item?drive={driveId}&item={itemId}
      
      // Extract drive ID and item ID from Graph URL
      const driveIdMatch = fileUrl.match(/drives\/([^/]+)/);
      const itemIdMatch = fileUrl.match(/items\/([^/]+)/);
      
      if (driveIdMatch && itemIdMatch) {
        const driveId = driveIdMatch[1];
        const itemId = itemIdMatch[1];
        
        return `https://office.com/launch/word/item?drive=${driveId}&item=${itemId}&auth=1&access_token=${encodeURIComponent(token)}`;
      }
    }
    
    // Fallback - direct Office Online URL
    return `https://word-edit.officeapps.live.com/we/wordeditorframe.aspx?ui=en-us&rs=en-us&WOPISrc=${encodeURIComponent(fileUrl)}&access_token=${encodeURIComponent(token)}`;
  };
  
  // Handle message events from the iframe
  useEffect(() => {
    const handleMessage = (event) => {
      // Only process messages from trusted domains
      if (!event.origin.match(/(office\.com|officeapps\.live\.com|sharepoint\.com|onedrive\.com)$/)) {
        return;
      }
      
      try {
        const message = event.data;
        
        // Handle different types of messages from Office Online
        if (message && message.type) {
          switch (message.type) {
            case 'ready':
              console.log('Microsoft Word is ready');
              setIsLoading(false);
              break;
              
            case 'save':
              console.log('Document saved in Microsoft Word');
              if (onSave) onSave();
              break;
              
            case 'close':
              console.log('Microsoft Word editor closed');
              if (onClose) onClose();
              break;
              
            default:
              console.log('Received message from Microsoft Word:', message);
          }
        }
      } catch (err) {
        console.error('Error processing message from Microsoft Word:', err);
      }
    };
    
    // Add message listener
    window.addEventListener('message', handleMessage);
    
    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onSave, onClose]);
  
  // Handle save action (through postMessage)
  const handleSave = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        // Send save command to Office Online
        iframeRef.current.contentWindow.postMessage(
          { type: 'action', action: 'save' },
          '*'
        );
      } catch (err) {
        console.error('Error sending save command to Microsoft Word:', err);
      }
    }
  };
  
  // Handle close action
  const handleClose = () => {
    if (onClose) onClose();
  };
  
  // If we have an error, show it
  if (error) {
    return (
      <div className="p-4 border rounded-lg shadow bg-white">
        <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
        <p className="text-sm text-gray-700 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full border rounded-lg shadow-lg bg-white">
      {/* Toolbar */}
      <div className="flex justify-between items-center p-2 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium">Microsoft Word</h3>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
            Live Editing
          </span>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            onClick={handleSave}
            disabled={isLoading || !embedUrl}
          >
            Save
          </Button>
          {onClose && (
            <Button 
              size="sm" 
              onClick={handleClose}
              variant="outline"
            >
              Close
            </Button>
          )}
        </div>
      </div>
      
      {/* Word Editor */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-sm text-gray-600">Loading Microsoft Word...</p>
            </div>
          </div>
        ) : null}
        
        {embedUrl && (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title="Microsoft Word Online"
            className="w-full h-full border-0"
            allow="autoplay; camera; microphone; fullscreen; clipboard-read; clipboard-write"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-popups-to-escape-sandbox"
            onLoad={() => setIsLoading(false)}
          />
        )}
      </div>
    </div>
  );
};

export default MicrosoftWordEmbed;