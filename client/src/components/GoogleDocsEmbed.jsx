/**
 * Google Docs Embedded Editor Component
 * 
 * This component provides a fully functional embedded Google Docs editor
 * that handles authentication and document interactions.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, RefreshCw, AlertCircle, CheckCircle, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import googleAuthService from '../services/googleAuthService';

const GoogleDocsEmbed = ({ 
  documentId, 
  onLoad, 
  onError, 
  height = '800px',
  showToolbar = true
}) => {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(100);
  
  // Force refresh the iframe
  const refreshIframe = () => {
    if (!documentId) {
      setError('No document ID provided');
      setLoading(false);
      if (onError) onError('No document ID provided');
      return;
    }
    
    setLoading(true);
    setProgress(0);
    setError(null);
    
    // Start progress simulation
    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = Math.floor(Math.random() * 15) + 5;
        const newProgress = Math.min(prev + increment, 95);
        return newProgress;
      });
    }, 300);
    
    // Setup load/error handlers
    const handleLoad = () => {
      console.log('Google Docs iframe loaded successfully');
      clearInterval(interval);
      setProgress(100);
      
      // Short delay to show 100% before removing progress bar
      setTimeout(() => {
        setLoading(false);
        if (onLoad) onLoad();
      }, 300);
    };
    
    const handleError = () => {
      console.error('Error loading Google Docs iframe');
      clearInterval(interval);
      setError('Failed to load document. Please check your authentication and try again.');
      setLoading(false);
      if (onError) onError('Failed to load document');
    };
    
    if (iframeRef.current) {
      iframeRef.current.onload = handleLoad;
      iframeRef.current.onerror = handleError;
      
      // Set the iframe source with the document ID
      const accessToken = googleAuthService.getAccessToken();
      
      if (!accessToken) {
        clearInterval(interval);
        setError('Authentication required. Please sign in with Google to view documents.');
        setLoading(false);
        if (onError) onError('Authentication required');
        return;
      }
      
      // Embed URL for Google Docs
      const embeddedUrl = `https://docs.google.com/document/d/${documentId}/edit?usp=drivesdk&embedded=true`;
      iframeRef.current.src = embeddedUrl;
    } else {
      clearInterval(interval);
      setError('Cannot initialize document viewer');
      setLoading(false);
      if (onError) onError('Initialization error');
    }
    
    // Cleanup function
    return () => {
      clearInterval(interval);
    };
  };
  
  // Initialize on mount or when documentId changes
  useEffect(() => {
    refreshIframe();
    
    // Cleanup when component unmounts
    return () => {
      if (iframeRef.current) {
        iframeRef.current.onload = null;
        iframeRef.current.onerror = null;
      }
    };
  }, [documentId]);
  
  // Handle zoom level changes
  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 150));
  };
  
  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };
  
  return (
    <div className="flex flex-col w-full h-full">
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between border-b pb-2 mb-2">
          <div className="flex items-center">
            {loading ? (
              <span className="text-sm text-muted-foreground">Loading document...</span>
            ) : error ? (
              <span className="text-sm text-destructive">Error: {error}</span>
            ) : (
              <span className="text-sm text-green-600 flex items-center">
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Document loaded
              </span>
            )}
          </div>
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={zoomOut}
              disabled={loading || zoom <= 50}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="mx-2 text-sm">{zoom}%</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={zoomIn}
              disabled={loading || zoom >= 150}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshIframe}
              disabled={loading}
              className="ml-2"
              title="Refresh Document"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Progress bar */}
      {loading && (
        <div className="mb-2">
          <Progress value={progress} className="h-1" />
          <div className="flex items-center justify-center mt-1">
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
            <span className="text-xs text-muted-foreground">
              Loading document ({progress}%)
            </span>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && !loading && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Google Docs iframe */}
      <div 
        className="flex-1 relative"
        style={{
          height: loading || error ? 'auto' : height,
          minHeight: '200px'
        }}
      >
        <iframe
          ref={iframeRef}
          title="Google Docs Editor"
          className="w-full h-full border-0"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center top',
            display: loading ? 'none' : 'block'
          }}
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
        
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Preparing document editor...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleDocsEmbed;