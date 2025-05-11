import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

/**
 * Simple Google Docs Embed Component
 * 
 * This component provides a basic Google Docs viewing experience through iframe embedding.
 * It doesn't require complex API integration and works as a fallback for the Microsoft Word integration.
 */
const GoogleDocsEmbed = ({ documentId, documentName = "Document" }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simple URL for Google Docs viewer - no authentication required
  const googleViewerUrl = documentId.startsWith('http') 
    ? documentId // If it's already a URL, use it directly
    : `https://docs.google.com/document/d/${documentId}/preview`;

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError("Failed to load Google Docs viewer. Please check your document ID or internet connection.");
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="bg-gray-50 p-3 border-b flex items-center justify-between">
        <div className="flex items-center">
          <img src="https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico" alt="Google Docs" className="w-5 h-5 mr-2" />
          <h3 className="font-medium">{documentName}</h3>
        </div>
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open(googleViewerUrl, '_blank')}
          >
            Open in Google Docs
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center p-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading document...</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex-1 w-full relative">
        <iframe 
          src={googleViewerUrl}
          className={`w-full h-full min-h-[600px] border-0 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title="Google Docs Viewer"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default GoogleDocsEmbed;