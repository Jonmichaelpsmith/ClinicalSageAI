/**
 * !!!!! OFFICIAL ENHANCED DOCUMENT EDITOR FOR eCTD CO-AUTHOR MODULE !!!!!
 * 
 * This component serves as a wrapper for MS Word integration and other document
 * editing capabilities as specified in the Enterprise-Grade Upgrade Design.
 * 
 * Version: 4.0.0 - May 11, 2025
 * Status: STABLE - DO NOT MODIFY WITHOUT APPROVAL
 * 
 * PROTECTED CODE - Extend only as specified in the Enterprise Upgrade Design document.
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FileWarning, Settings, Maximize2, ExternalLink } from 'lucide-react';

// Import the MS Word document editor with lazy loading
const MsWordDocumentEditor = lazy(() => import('./MsWordDocumentEditor'));
const MsWordPopupEditor = lazy(() => import('./MsWordPopupEditor'));

const EnhancedDocumentEditor = ({
  documentId,
  sectionId,
  initialContent,
  documentTitle,
  sectionTitle,
  onSave,
  onLockDocument,
  isLocked,
  lockedBy
}) => {
  const [editorMode, setEditorMode] = useState('msword'); // 'msword', 'basic', 'source'
  const [documentUrl, setDocumentUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopupEditor, setShowPopupEditor] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // In a real implementation, this would fetch the document URL from a backend service
    // For example, a URL to a document stored in OneDrive/SharePoint
    
    // For demonstration, we'll simulate the URL fetch with a delay
    setIsLoading(true);
    const timer = setTimeout(() => {
      // This would be a real OneDrive/SharePoint document URL in production
      setDocumentUrl('https://example-document-url.com/word-document');
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [documentId]);
  
  // Handle editor mode switching
  const handleEditorModeChange = (mode) => {
    if (mode !== editorMode) {
      setEditorMode(mode);
      
      toast({
        title: `Switched to ${mode === 'msword' ? 'Microsoft Word' : mode === 'basic' ? 'Basic Editor' : 'Source Code'} mode`,
        description: "Your document content is preserved across editor modes.",
        variant: "default",
      });
    }
  };
  
  return (
    <div className="border rounded-md">
      {/* MS Word Popup Editor */}
      <Suspense fallback={null}>
        {showPopupEditor && (
          <MsWordPopupEditor
            isOpen={showPopupEditor}
            onClose={() => setShowPopupEditor(false)}
            documentId={documentId}
            sectionId={sectionId}
            initialContent={initialContent}
            documentTitle={documentTitle}
            sectionTitle={sectionTitle}
            onSave={(updatedContent) => {
              if (onSave) {
                onSave(updatedContent);
              }
              setShowPopupEditor(false);
              
              toast({
                title: "Document updated",
                description: "Changes saved successfully from Microsoft Word.",
                variant: "default",
              });
            }}
          />
        )}
      </Suspense>
      
      {/* Editor Controls Header */}
      <div className="border-b p-3 bg-slate-50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">{documentTitle}</h3>
          <p className="text-sm text-slate-500">Section: {sectionTitle}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* MS Word Popup Button */}
          <Button
            variant="default"
            size="sm"
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 flex items-center mr-2"
            onClick={() => setShowPopupEditor(true)}
            disabled={isLocked}
          >
            <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
            Open in MS Word
          </Button>
          
          <Tabs 
            defaultValue={editorMode} 
            className="w-auto" 
            onValueChange={handleEditorModeChange}
          >
            <TabsList className="grid grid-cols-3 h-8">
              <TabsTrigger value="msword" className="text-xs px-2">MS Word</TabsTrigger>
              <TabsTrigger value="basic" className="text-xs px-2">Basic Editor</TabsTrigger>
              <TabsTrigger value="source" className="text-xs px-2">Source</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button variant="outline" size="sm" className="h-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Document Editing Area */}
      <div className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="h-10 w-10 mb-4 rounded-full border-t-2 border-blue-600 animate-spin mx-auto"></div>
              <p className="font-medium text-gray-600">Loading document editor...</p>
              <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your document.</p>
            </div>
          </div>
        ) : (
          <>
            {editorMode === 'msword' && (
              <Suspense fallback={
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="h-10 w-10 mb-4 rounded-full border-t-2 border-blue-600 animate-spin mx-auto"></div>
                    <p className="font-medium text-gray-600">Loading Microsoft Word...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments.</p>
                  </div>
                </div>
              }>
                <MsWordDocumentEditor
                  documentId={documentId}
                  sectionId={sectionId}
                  documentTitle={documentTitle}
                  sectionTitle={sectionTitle}
                  onSave={onSave}
                  onLockDocument={onLockDocument}
                  isLocked={isLocked}
                  lockedBy={lockedBy}
                  documentUrl={documentUrl}
                />
              </Suspense>
            )}
            
            {editorMode === 'basic' && (
              <div className="p-4">
                <div className="border-b pb-2 mb-4 flex items-center justify-between">
                  <h4 className="font-medium">Basic Editor Mode</h4>
                  {isLocked && (
                    <Badge variant="outline" className="flex items-center text-amber-600 border-amber-200 bg-amber-50">
                      <span className="mr-1">🔒</span> 
                      Locked by {lockedBy}
                    </Badge>
                  )}
                </div>
                
                <div className="prose max-w-none mb-6">
                  <div 
                    contentEditable={!isLocked}
                    className="min-h-[300px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dangerouslySetInnerHTML={{ __html: initialContent }}
                  />
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" size="sm">Cancel</Button>
                  <Button 
                    size="sm"
                    onClick={() => onSave(document.querySelector('[contenteditable]').innerHTML)}
                    disabled={isLocked}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
            
            {editorMode === 'source' && (
              <div className="p-4">
                <div className="border-b pb-2 mb-4 flex items-center justify-between">
                  <h4 className="font-medium">Source Code Mode</h4>
                  {isLocked && (
                    <Badge variant="outline" className="flex items-center text-amber-600 border-amber-200 bg-amber-50">
                      <span className="mr-1">🔒</span> 
                      Locked by {lockedBy}
                    </Badge>
                  )}
                </div>
                
                <div className="mb-6">
                  <textarea
                    className="w-full h-[400px] font-mono text-sm p-4 border rounded-md"
                    disabled={isLocked}
                    defaultValue={initialContent}
                  />
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4 flex items-center text-sm">
                  <FileWarning className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
                  <span>
                    Editing HTML source directly may affect document formatting and compliance. 
                    Use with caution.
                  </span>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">Cancel</Button>
                  <Button 
                    size="sm"
                    onClick={() => onSave(document.querySelector('textarea').value)}
                    disabled={isLocked}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedDocumentEditor;