/**
 * Microsoft Word Popup Editor Component for TrialSage eCTD Co-Author Module
 * 
 * This component provides a popup Microsoft Word Online experience that
 * integrates with TrialSage's VAULT Document Management system.
 * 
 * Version: 1.0.0 - May 11, 2025
 * Status: ENTERPRISE IMPLEMENTATION
 */

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import * as msOfficeVaultBridge from '../services/msOfficeVaultBridge';
import { 
  AlertCircle,
  CheckCircle,
  FileText,
  Save,
  X,
  Maximize2,
  Minimize2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Clock,
  Link,
  Lock,
  FileWarning
} from 'lucide-react';

const MsWordPopupEditor = ({
  isOpen,
  onClose,
  documentId,
  documentName,
  readOnly = false,
  autoSave = true,
  onSave
}) => {
  // Component state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copilotEnabled, setCopilotEnabled] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const iframeRef = useRef(null);
  
  const { toast } = useToast();
  
  // Initialize the Word editing session
  useEffect(() => {
    if (isOpen && documentId) {
      initializeWordSession();
    }
    
    return () => {
      // Clean up session on unmount if one was created
      if (sessionData?.sessionId) {
        msOfficeVaultBridge.endEditingSession(sessionData.sessionId, documentId)
          .catch(err => console.error('Error ending Word session:', err));
      }
    };
  }, [isOpen, documentId]);
  
  // Initialize Microsoft Word editing session
  const initializeWordSession = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check Microsoft authentication status
      const authStatus = await msOfficeVaultBridge.getMsAuthStatus();
      
      if (!authStatus.isAuthenticated) {
        throw new Error('Microsoft authentication required. Please log in to your Microsoft account.');
      }
      
      // Initialize Office editing session
      const session = await msOfficeVaultBridge.initOfficeEditingSession(documentId, {
        documentName: documentName || 'Document',
        readOnly,
        autoSave
      });
      
      setSessionData(session);
      
      // Check if Copilot is available
      if (authStatus.permissions.copilot) {
        const copilotResult = await msOfficeVaultBridge.enableCopilotFeatures(session.sessionId, {
          contentGeneration: true,
          formatting: true,
          citations: true,
          regulatory: true
        });
        
        setCopilotEnabled(copilotResult.success);
      }
      
      toast({
        title: 'Microsoft Word Ready',
        description: `${documentName || 'Document'} is now ready for editing in Microsoft Word.`,
        variant: 'default',
      });
      
    } catch (err) {
      console.error('Failed to initialize Word session:', err);
      setError(err.message || 'Failed to initialize Microsoft Word. Please try again.');
      
      toast({
        title: 'Word Initialization Failed',
        description: err.message || 'Could not start Microsoft Word editor. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Save changes back to the VAULT document
  const handleSave = async () => {
    if (readOnly || !sessionData?.sessionId) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const result = await msOfficeVaultBridge.saveChangesToVault(
        sessionData.sessionId,
        documentId,
        {
          versionLabel: `v${new Date().toISOString().split('T')[0].replace(/-/g, '')}`,
          summary: 'Edited in Microsoft Word',
          editor: 'Current User' // In a real implementation, this would be the actual user
        }
      );
      
      setLastSaved(new Date());
      setSaveSuccess(true);
      
      toast({
        title: 'Document Saved',
        description: `Changes to ${documentName || 'document'} have been saved successfully.`,
        variant: 'default',
      });
      
      // Notify parent component
      if (onSave) {
        onSave(result);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (err) {
      console.error('Failed to save changes:', err);
      
      toast({
        title: 'Save Failed',
        description: err.message || 'Could not save your changes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle closing the editor
  const handleCloseEditor = async () => {
    // Ask for confirmation if there are unsaved changes and autoSave is disabled
    if (!autoSave && !readOnly && !isSaving) {
      // In a real implementation, we would check for unsaved changes here
      const hasUnsavedChanges = false; // Placeholder
      
      if (hasUnsavedChanges) {
        const confirmSave = window.confirm('You have unsaved changes. Do you want to save before closing?');
        
        if (confirmSave) {
          await handleSave();
        }
      }
    }
    
    // End the session
    if (sessionData?.sessionId) {
      try {
        await msOfficeVaultBridge.endEditingSession(sessionData.sessionId, documentId);
      } catch (err) {
        console.error('Error ending session:', err);
      }
    }
    
    // Close the dialog
    if (onClose) {
      onClose();
    }
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  return (
    <Dialog 
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleCloseEditor();
      }}
      className={isFullscreen ? 'fullscreen-dialog' : ''}
    >
      <DialogContent className={`sm:max-w-[900px] ${isFullscreen ? 'fullscreen-content' : ''}`}>
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-xl">
                <span className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  {documentName || 'Document'} 
                </span>
              </DialogTitle>
              
              {readOnly && (
                <Badge variant="outline" className="ml-2 border-amber-200 text-amber-700 bg-amber-50">
                  <Lock className="h-3 w-3 mr-1" />
                  Read Only
                </Badge>
              )}
              
              {copilotEnabled && (
                <Badge variant="outline" className="ml-2 border-violet-200 text-violet-700 bg-violet-50">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Copilot
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="text-xs text-gray-500 flex items-center mr-3">
                  <Clock className="h-3 w-3 mr-1" />
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleFullscreen}
                className="h-8 w-8 p-0"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={handleCloseEditor}
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <DialogDescription>
            Editing document using Microsoft Word Online.
            {autoSave && !readOnly ? ' Changes are automatically saved.' : ''}
          </DialogDescription>
        </DialogHeader>
        
        <div className={`word-editor-container ${isFullscreen ? 'h-[80vh]' : 'h-[60vh]'}`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Skeleton className="h-12 w-12 rounded-full mb-4" />
              <Skeleton className="h-6 w-64 mb-2" />
              <Skeleton className="h-4 w-40" />
              <p className="text-sm text-slate-500 mt-4">Loading Microsoft Word editor...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <iframe
              ref={iframeRef}
              src={sessionData?.editUrl}
              className="w-full h-full border-none"
              title="Microsoft Word Editor"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
            />
          )}
        </div>
        
        {saveSuccess && (
          <Alert className="bg-green-50 text-green-700 border-green-100 mb-4">
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            <AlertDescription>Document saved successfully!</AlertDescription>
          </Alert>
        )}
        
        <DialogFooter className="flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="sm"
              disabled={loading}
              onClick={initializeWordSession}
              className="flex items-center mr-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              disabled={loading || !sessionData?.editUrl}
              onClick={() => window.open(sessionData?.editUrl, '_blank')}
              className="flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
          
          <div>
            {!readOnly && (
              <Button 
                disabled={loading || isSaving || !sessionData?.sessionId}
                onClick={handleSave}
                className="flex items-center"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
      
      <style jsx="true">{`
        .fullscreen-dialog {
          max-width: 100% !important;
          width: 100% !important;
          height: 100vh !important;
          margin: 0 !important;
          padding: 0 !important;
          border-radius: 0 !important;
        }
        
        .fullscreen-content {
          max-width: 100% !important;
          width: 100% !important;
          height: 100vh !important;
          margin: 0 !important;
          padding: 20px !important;
          border-radius: 0 !important;
        }
      `}</style>
    </Dialog>
  );
};

export default MsWordPopupEditor;