import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * GoogleDocsEmbed Component
 * 
 * Embeds a Google Docs document using iframe for editing directly in the application.
 * Supports both viewing and editing modes.
 * 
 * @param {Object} props
 * @param {string} props.documentId - Google Docs document ID
 * @param {string} props.documentName - Name of the document for display purposes
 * @param {boolean} props.editable - Whether the document should be editable (defaults to true)
 * @param {Function} props.onSave - Callback when document is saved
 */
const GoogleDocsEmbed = ({ 
  documentId, 
  documentName, 
  editable = true,
  onSave = () => {} 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // URLs for view and edit modes
  const viewUrl = `https://docs.google.com/document/d/${documentId}/preview`;
  const editUrl = `https://docs.google.com/document/d/${documentId}/edit?usp=sharing`;
  
  // Determine which URL to use based on editable prop
  const docUrl = editable ? editUrl : viewUrl;

  useEffect(() => {
    // Reset loading state when document changes
    setIsLoading(true);
    setError(null);
  }, [documentId]);

  // Handle load events
  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load document. Please check if the document ID is correct and you have access.');
  };

  // Handle message events from the iframe
  useEffect(() => {
    const handleMessage = (event) => {
      // Only process messages from Google Docs
      if (event.origin.includes('docs.google.com')) {
        // Check if the message indicates a save event
        if (event.data && event.data.type === 'save') {
          onSave();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSave]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Document header with name */}
      <div className="bg-muted p-2 rounded-t-md flex items-center justify-between">
        <div className="font-medium">{documentName || 'Google Document'}</div>
        {editable ? (
          <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Editable</div>
        ) : (
          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">View Only</div>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center p-10 bg-white border border-gray-200">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading document...</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          <p>{error}</p>
          <p className="text-sm mt-2">
            Please verify that the document exists and that you have proper access permissions.
          </p>
        </div>
      )}

      {/* Google Docs iframe */}
      <div className={`w-full flex-grow ${isLoading ? 'opacity-0 h-0' : 'opacity-100 h-[500px]'}`}>
        <iframe
          src={docUrl}
          onLoad={handleLoad}
          onError={handleError}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={`Google Docs - ${documentName}`}
        />
      </div>
    </div>
  );
};

export default GoogleDocsEmbed;