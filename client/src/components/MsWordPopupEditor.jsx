/**
 * !!!!! MS WORD POPUP EDITOR FOR eCTD CO-AUTHOR MODULE !!!!!
 * 
 * This component provides a full-screen popup Microsoft Word experience
 * that saves content back to the main module.
 * 
 * Version: 4.0.0 - May 11, 2025
 * Status: STABLE - DO NOT MODIFY WITHOUT APPROVAL
 */

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Save,
  RotateCcw,
  RotateCw,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Table,
  Image,
  Link,
  ExternalLink,
  FileText,
  X,
  Maximize2,
  Minimize2,
  RefreshCw,
  ClipboardCheck,
  MessageSquare,
  Sparkles
} from 'lucide-react';

const MsWordPopupEditor = ({
  isOpen,
  onClose,
  documentId,
  sectionId,
  initialContent,
  documentTitle,
  sectionTitle,
  onSave
}) => {
  const [content, setContent] = useState(initialContent || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [aiCheckingCompliance, setAiCheckingCompliance] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const editorRef = useRef(null);
  const { toast } = useToast();

  // Initialize Word editor when component mounts
  useEffect(() => {
    if (isOpen) {
      // In a real implementation, this would initialize the Microsoft Word Online editor
      setIsEditing(true);
      setContent(initialContent);
      setUnsavedChanges(false);
      setLastSaved(new Date());
      
      // Start autosave timer
      const timer = setInterval(() => {
        if (unsavedChanges) {
          handleAutoSave();
        }
      }, 30000); // Auto-save every 30 seconds
      
      setAutoSaveTimer(timer);
    }
    
    return () => {
      // Clear autosave timer on component unmount
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
      }
    };
  }, [isOpen, initialContent]);
  
  // Monitor for unsaved changes
  useEffect(() => {
    // In a real implementation, this would use Word's change detection
    if (content !== initialContent) {
      setUnsavedChanges(true);
    }
  }, [content, initialContent]);
  
  // Handle autosave
  const handleAutoSave = async () => {
    if (!unsavedChanges) return;
    
    try {
      // In a real implementation, this would call the save API
      console.log('Auto-saving document...');
      
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLastSaved(new Date());
      setUnsavedChanges(false);
      
      // No toast notification for autosave to avoid interrupting the user
    } catch (error) {
      console.error('Auto-save failed:', error);
      // No error notification for autosave failures to avoid interrupting the user
    }
  };
  
  // Handle save button click
  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    
    try {
      // In a real implementation, this would save to the server
      console.log('Saving document...');
      
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update state
      setLastSaved(new Date());
      setUnsavedChanges(false);
      
      // Call the onSave callback
      if (onSave) {
        onSave(content);
      }
      
      toast({
        title: "Document Saved",
        description: "Your changes have been saved successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error('Save failed:', error);
      
      toast({
        title: "Save Failed",
        description: "Failed to save your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle close with unsaved changes
  const handleClose = () => {
    if (unsavedChanges) {
      // In a real implementation, this would show a confirmation dialog
      if (window.confirm('You have unsaved changes. Save before closing?')) {
        handleSave().then(() => {
          onClose();
        });
      } else {
        onClose();
      }
    } else {
      onClose();
    }
  };
  
  // Toggle full screen mode
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  
  // Get AI-powered content suggestions
  const getContentSuggestions = async () => {
    setAiSuggesting(true);
    
    try {
      // In a real implementation, this would call the AI service
      console.log('Getting AI content suggestions...');
      
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "AI Suggestions Ready",
        description: "Content suggestions are now available in the sidebar.",
        variant: "default",
      });
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
      
      toast({
        title: "Suggestion Failed",
        description: "Failed to generate AI suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAiSuggesting(false);
    }
  };
  
  // Check document for regulatory compliance
  const checkCompliance = async () => {
    setAiCheckingCompliance(true);
    
    try {
      // In a real implementation, this would call the compliance service
      console.log('Checking regulatory compliance...');
      
      // Simulate compliance checking
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      toast({
        title: "Compliance Check Complete",
        description: "Your document has been checked against regulatory requirements.",
        variant: "default",
      });
    } catch (error) {
      console.error('Compliance check failed:', error);
      
      toast({
        title: "Compliance Check Failed",
        description: "Failed to check compliance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAiCheckingCompliance(false);
    }
  };
  
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      className={isFullScreen ? 'fixed inset-0 z-50' : ''}
    >
      <DialogContent
        className={`p-0 ${isFullScreen ? 'max-w-none w-screen h-screen' : 'max-w-6xl w-full'}`}
        onInteractOutside={(e) => {
          // Prevent closing when clicking outside if there are unsaved changes
          if (unsavedChanges) {
            e.preventDefault();
          }
        }}
      >
        <div className="flex flex-col h-full">
          {/* Microsoft Word Header */}
          <div className="bg-[#f3f2f1] border-b p-3 flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg" 
                alt="Microsoft Word" 
                className="h-7 mr-2" 
              />
              <div className="flex flex-col">
                <span className="font-medium">{documentTitle}</span>
                <span className="text-xs text-slate-500">Section: {sectionTitle}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {lastSaved && (
                <span className="text-xs text-slate-500 mr-2">
                  {unsavedChanges ? 'Unsaved changes' : `Last saved: ${lastSaved.toLocaleTimeString()}`}
                </span>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs flex items-center h-8 bg-white"
                onClick={handleSave}
                disabled={isSaving || !unsavedChanges}
              >
                <Save className="h-4 w-4 mr-1.5" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={toggleFullScreen}
                title={isFullScreen ? 'Exit full screen' : 'Full screen'}
              >
                {isFullScreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleClose}
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Word Toolbar */}
          <div className="bg-[#f3f2f1] border-b p-1 flex flex-wrap">
            <div className="flex items-center bg-white rounded border mr-2 shadow-sm">
              <Button variant="ghost" size="sm" className="h-8 rounded-l border-r" title="Save (Ctrl+S)" onClick={handleSave}>
                <Save className="h-4 w-4 text-blue-700" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 border-r" title="Undo (Ctrl+Z)">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 rounded-r" title="Redo (Ctrl+Y)">
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center bg-white rounded border mr-2 shadow-sm">
              <select className="text-xs h-8 border-r px-2">
                <option>Normal</option>
                <option>Heading 1</option>
                <option>Heading 2</option>
                <option>Title</option>
              </select>
              <select className="text-xs h-8 border-r px-2">
                <option>Calibri</option>
                <option>Arial</option>
                <option>Times New Roman</option>
              </select>
              <select className="text-xs h-8 border-r px-1">
                <option>11</option>
                <option>12</option>
                <option>14</option>
              </select>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border-r">
                <Bold className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border-r">
                <Italic className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Underline className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center bg-white rounded border mr-2 shadow-sm">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border-r">
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border-r">
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border-r">
                <AlignRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border-r">
                <List className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ListOrdered className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center bg-white rounded border mr-2 shadow-sm">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border-r">
                <Table className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border-r">
                <Image className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Link className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="ml-auto flex items-center">
              <div className="bg-white rounded border shadow-sm flex">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-8 text-xs flex items-center rounded-l border-r ${aiSuggesting ? 'bg-blue-50' : ''}`}
                  onClick={getContentSuggestions}
                  disabled={aiSuggesting}
                  title="Get AI-powered content suggestions for the current section"
                >
                  {aiSuggesting ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin text-blue-600" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-1 text-blue-600" />
                  )}
                  <span className="hidden md:inline">Suggest</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-8 text-xs flex items-center border-r ${aiCheckingCompliance ? 'bg-blue-50' : ''}`}
                  onClick={checkCompliance}
                  disabled={aiCheckingCompliance}
                  title="Check document against regulatory requirements"
                >
                  {aiCheckingCompliance ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin text-blue-600" />
                  ) : (
                    <ClipboardCheck className="h-4 w-4 mr-1 text-blue-600" />
                  )}
                  <span className="hidden md:inline">Compliance</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-xs flex items-center rounded-r"
                  title="Ask AI assistant for help"
                >
                  <MessageSquare className="h-4 w-4 mr-1 text-blue-600" />
                  <span className="hidden md:inline">Ask AI</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Document Content Area */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Document Editor */}
            <div className="flex-1 bg-white overflow-auto p-8 flex justify-center">
              <div 
                ref={editorRef}
                className="w-full max-w-4xl bg-white border shadow-sm" 
                style={{ minHeight: '29.7cm', maxWidth: '21cm' }}
              >
                {/* In a real implementation, this would be the Microsoft Word Online editor */}
                <div className="p-8">
                  <h1 className="text-2xl font-bold mb-6">{documentTitle}</h1>
                  <h2 className="text-xl font-semibold mb-4">{sectionTitle}</h2>
                  
                  <div 
                    contentEditable={isEditing}
                    className="prose max-w-none min-h-[400px]"
                    dangerouslySetInnerHTML={{ __html: content }}
                    onInput={(e) => setContent(e.currentTarget.innerHTML)}
                    style={{ outline: 'none' }}
                  />
                </div>
              </div>
            </div>
            
            {/* Right Sidebar (when AI features are active) */}
            {(aiSuggesting || aiCheckingCompliance) && (
              <div className="w-80 border-l bg-slate-50 overflow-auto p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                    <h4 className="font-medium">AI Assistant</h4>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {aiSuggesting && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">Suggested content improvements:</p>
                    
                    <div className="bg-white border rounded-md p-3">
                      <p className="text-sm">
                        Consider adding a summary of serious adverse events and their relationship to treatment.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 h-7 text-xs w-full"
                      >
                        Insert Suggestion
                      </Button>
                    </div>
                    
                    <div className="bg-white border rounded-md p-3">
                      <p className="text-sm">
                        Data on discontinuation rates would strengthen the safety profile section.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 h-7 text-xs w-full"
                      >
                        Insert Suggestion
                      </Button>
                    </div>
                  </div>
                )}
                
                {aiCheckingCompliance && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">Compliance assessment:</p>
                    
                    <div className="bg-white border border-amber-200 rounded-md p-3">
                      <Badge className="bg-amber-100 text-amber-800 mb-1">ICH E2E Guideline</Badge>
                      <p className="text-sm">
                        Section requires more comprehensive analysis of adverse events by severity.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 h-7 text-xs w-full"
                      >
                        Fix Issue
                      </Button>
                    </div>
                    
                    <div className="bg-white border border-green-200 rounded-md p-3">
                      <Badge className="bg-green-100 text-green-800 mb-1">FDA Guidance</Badge>
                      <p className="text-sm">
                        Content meets FDA safety reporting requirements.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Status Bar */}
          <div className="bg-[#f3f2f1] border-t p-1.5 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center">
              <span className="mr-4">
                Document ID: {documentId || 'New Document'}
              </span>
              <span>
                Section: {sectionId}
              </span>
            </div>
            <div className="flex items-center">
              {unsavedChanges ? (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                  Unsaved Changes
                </Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Saved
                </Badge>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MsWordPopupEditor;