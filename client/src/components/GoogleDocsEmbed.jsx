/**
 * Google Docs Embed Component
 * 
 * This component renders an embedded Google Doc within an iframe.
 * It supports viewing and editing documents directly within the application.
 */

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * GoogleDocsEmbed Component
 * 
 * @param {Object} props
 * @param {string} props.documentId - Google Docs document ID
 * @param {string} props.documentName - Display name for the document
 * @param {boolean} props.readOnly - Whether the document should be viewable only (not editable)
 * @param {number} props.height - Height of the iframe in pixels
 */
const GoogleDocsEmbed = ({ 
  documentId, 
  documentName = "Document", 
  readOnly = false,
  height = 600
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Build the Google Docs URL with appropriate parameters
  const embedUrl = `https://docs.google.com/document/d/${documentId}/${readOnly ? 'preview' : 'edit'}?embedded=true`;
  
  // Log loading status for debugging
  useEffect(() => {
    console.log(`Loading Google Doc: ${documentName} (${documentId})`);
    
    // Simulate verifying document access
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [documentId, documentName]);
  
  // Handle iframe load events
  const handleIframeLoad = () => {
    setLoading(false);
  };
  
  // Handle iframe error events
  const handleIframeError = (e) => {
    console.error("Error loading Google Doc:", e);
    setError("Failed to load Google Doc. Please check the document ID and your permissions.");
    setLoading(false);
  };
  
  return (
    <div className="w-full flex flex-col">
      {/* Document Header - can be enhanced with additional controls */}
      <div className="mb-2 text-sm text-gray-500">
        {documentName} {readOnly && <span className="text-amber-600">(Read Only)</span>}
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading document...</span>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          <p className="font-semibold">Error Loading Document</p>
          <p>{error}</p>
          <p className="mt-2 text-sm">
            Please verify that the document exists and you have permission to access it.
          </p>
        </div>
      )}
      
      {/* Google Docs iframe */}
      <iframe
        title={`Google Doc: ${documentName}`}
        src={embedUrl}
        className={`w-full border-0 rounded-md transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        style={{ height: `${height}px` }}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
};

export default GoogleDocsEmbed;