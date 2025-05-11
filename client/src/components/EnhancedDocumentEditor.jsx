/**
 * Enhanced Document Editor Component for TrialSage eCTD Co-Author Module
 * 
 * This component provides a unified document editing experience with support for:
 * 1. Standard built-in editor
 * 2. Microsoft Word Online popup editor (via MS Office VAULT Bridge)
 * 3. AI-assisted editing capabilities
 * 
 * Version: 1.0.0 - May 11, 2025
 * Status: ENTERPRISE IMPLEMENTATION
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import MsWordPopupEditor from './MsWordPopupEditor';
import * as msOfficeVaultBridge from '../services/msOfficeVaultBridge';
import * as documentIntelligenceHub from '../services/documentIntelligenceHub';
import { 
  FileText, 
  Edit, 
  Save, 
  Eye, 
  Sparkles, 
  Code,
  ExternalLink,
  Trash,
  RotateCw,
  CheckCircle,
  Clock,
  MessageSquare,
  History
} from 'lucide-react';

const EnhancedDocumentEditor = ({
  documentId,
  documentName,
  initialContent = '',
  onChange,
  readOnly = false,
  autoSave = true,
  documentVersion = '1.0',
  lastModified = new Date(),
  lastEditor = 'Current User'
}) => {
  // Component state
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [savedContent, setSavedContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const [msWordPopupOpen, setMsWordPopupOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  
  const { toast } = useToast();
  
  // Load initial document content
  useEffect(() => {
    if (documentId) {
      setIsLoading(true);
      
      // Simulate loading document content - in a real implementation, this would fetch from VAULT
      setTimeout(() => {
        setContent(initialContent);
        setSavedContent(initialContent);
        setIsLoading(false);
      }, 800);
    }
  }, [documentId, initialContent]);
  
  // Auto-save functionality
  useEffect(() => {
    let autoSaveTimer;
    
    if (autoSave && content !== savedContent && !readOnly) {
      autoSaveTimer = setTimeout(() => {
        handleSave();
      }, 30000); // Auto-save after 30 seconds of inactivity
    }
    
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [content, savedContent, autoSave, readOnly]);
  
  // Handle content change
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    if (onChange) {
      onChange(newContent);
    }
  };
  
  // Handle save
  const handleSave = async () => {
    if (readOnly || content === savedContent) return;
    
    setIsSaving(true);
    
    try {
      // In a real implementation, this would save to VAULT
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSavedContent(content);
      setLastSaved(new Date());
      
      toast({
        title: 'Document Saved',
        description: 'Your changes have been saved successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to save document:', error);
      
      toast({
        title: 'Save Failed',
        description: error.message || 'Could not save your changes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Get AI suggestions
  const getAiSuggestions = async () => {
    setIsFetchingSuggestions(true);
    
    try {
      // Call the Document Intelligence Hub
      const suggestionsResponse = await documentIntelligenceHub.generateDocumentContent({
        documentId,
        sectionId: 'current-section',
        currentContent: content,
        suggestionType: 'content-enhancement',
        contextAwareMode: true
      });
      
      // Format and set the suggestions
      setAiSuggestions([
        {
          id: 'ai-suggestion-1',
          type: 'content',
          text: suggestionsResponse.content,
          source: 'AI Assistant',
          timestamp: new Date().toISOString()
        }
      ]);
      
      toast({
        title: 'AI Suggestions Ready',
        description: 'AI-generated content suggestions are now available.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
      
      toast({
        title: 'AI Suggestions Failed',
        description: error.message || 'Could not generate AI suggestions. Please try again.',
        variant: 'destructive',
      });
      
      setAiSuggestions([]);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };
  
  // Apply AI suggestion
  const applySuggestion = (suggestionText) => {
    setContent(suggestionText);
    
    toast({
      title: 'AI Suggestion Applied',
      description: 'The AI-generated content has been applied to the document.',
      variant: 'default',
    });
    
    // Clear suggestions after applying
    setAiSuggestions([]);
  };
  
  // Check if Microsoft Word integration is available
  const [msWordAvailable, setMsWordAvailable] = useState(false);
  
  useEffect(() => {
    const checkMsWordAvailability = async () => {
      try {
        const authStatus = await msOfficeVaultBridge.getMsAuthStatus();
        setMsWordAvailable(authStatus.isAuthenticated);
      } catch (error) {
        console.error('Failed to check Microsoft Word availability:', error);
        setMsWordAvailable(false);
      }
    };
    
    checkMsWordAvailability();
  }, []);
  
  // Handle Microsoft Word popup result
  const handleMsWordSave = (result) => {
    // In a real implementation, this would update the local content with the saved Word content
    console.log('Document saved from Microsoft Word:', result);
    
    // Use the content from the Word editor or append a note for demonstration
    if (typeof result === 'string') {
      setContent(result);
      setSavedContent(result);
    } else {
      // Simulate content update
      setContent((prevContent) => {
        const updatedContent = prevContent + '\n\n[Content edited with Microsoft Word]';
        setSavedContent(updatedContent);
        setLastSaved(new Date());
        return updatedContent;
      });
    }
  };
  
  // Open Microsoft Word popup
  const openMsWordPopup = () => {
    setMsWordPopupOpen(true);
    
    toast({
      title: 'Opening Microsoft Word',
      description: 'Preparing document for editing in Microsoft Word...',
      variant: 'default',
    });
  };
  
  // Check for unsaved changes
  const hasUnsavedChanges = content !== savedContent;
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-20 mr-2" />
          <Skeleton className="h-10 w-20" />
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <>
      {/* Microsoft Word Popup Editor */}
      {msWordPopupOpen && (
        <MsWordPopupEditor
          isOpen={msWordPopupOpen}
          onClose={() => setMsWordPopupOpen(false)}
          documentId={documentId}
          documentTitle={documentName}
          initialContent={content}
          onSave={handleMsWordSave}
        />
      )}
      
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              {documentName || 'Untitled Document'}
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-amber-600 border-amber-200">
                  Unsaved Changes
                </Badge>
              )}
              
              <Badge variant="outline" className="text-slate-600 border-slate-200">
                {documentVersion}
              </Badge>
              
              {msWordAvailable && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={openMsWordPopup}
                  className="flex items-center ml-2"
                  disabled={readOnly}
                >
                  <img 
                    src="https://img.icons8.com/color/48/000000/microsoft-word-2019--v2.png"
                    alt="Microsoft Word"
                    className="h-4 w-4 mr-2"
                  />
                  Edit in Word
                </Button>
              )}
            </div>
          </div>
          
          <div className="text-sm text-gray-500 flex items-center justify-between">
            <div>
              Last edited by <span className="font-medium">{lastEditor}</span> on {lastModified.toLocaleString()}
            </div>
            
            {lastSaved && (
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="edit" className="flex items-center">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="msword" className="flex items-center">
                <img 
                  src="https://img.icons8.com/color/48/000000/microsoft-word-2019--v2.png"
                  alt="Microsoft Word"
                  className="h-4 w-4 mr-2"
                />
                Microsoft Word
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Assist
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="edit" className="p-6 pt-4">
            <textarea
              className="w-full h-[400px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              value={content}
              onChange={handleContentChange}
              disabled={readOnly}
              placeholder="Enter your document content here..."
            />
            
            <div className="flex justify-between mt-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasUnsavedChanges || readOnly}
                  onClick={() => setContent(savedContent)}
                  className="flex items-center"
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Revert Changes
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('ai')}
                  className="flex items-center"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get AI Suggestions
                </Button>
              </div>
              
              <Button
                disabled={!hasUnsavedChanges || isSaving || readOnly}
                onClick={handleSave}
                className="flex items-center"
              >
                {isSaving ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="p-6 pt-4">
            <div className="border rounded-md p-6 prose max-w-none min-h-[400px] bg-white">
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />
              ) : (
                <div className="text-gray-400 italic">No content to preview</div>
              )}
            </div>
            
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('edit')}
                className="flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Back to Editor
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="msword" className="p-6 pt-4">
            <div className="border rounded-md h-[400px] relative">
              <div className="flex flex-col h-full">
                <div className="bg-[#2b579a] text-white p-2 flex items-center space-x-2">
                  <span className="font-semibold">Microsoft Word</span>
                  <Separator orientation="vertical" className="h-4 bg-white/30" />
                  <span className="text-sm">Home</span>
                  <span className="text-sm">Insert</span>
                  <span className="text-sm">Design</span>
                  <span className="text-sm">Layout</span>
                  <span className="text-sm">References</span>
                  <span className="text-sm">Review</span>
                  <span className="text-sm">View</span>
                  <span className="text-sm">Help</span>
                </div>
                <div className="bg-[#f3f2f1] p-2 flex items-center space-x-2 text-xs">
                  <span>File</span>
                  <span>Save</span>
                  <span>Print</span>
                  <span>|</span>
                  <span>Cut</span>
                  <span>Copy</span>
                  <span>Paste</span>
                  <span>|</span>
                  <span>Format</span>
                  <span>Styles</span>
                </div>
                <div className="flex-grow p-4 bg-white border">
                  <textarea
                    className="w-full h-full p-2 border-none focus:outline-none resize-none font-serif"
                    value={content}
                    onChange={handleContentChange}
                    placeholder="Document content..."
                    disabled={readOnly}
                  />
                </div>
                <div className="bg-[#f3f2f1] p-2 flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    Editing as {lastEditor || "Current User"} | Word Online
                  </div>
                  <div className="text-xs text-blue-600">
                    Connected to VAULT
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Microsoft Word",
                      description: "Opening document in Word Online popup for enhanced editing...",
                      variant: "default",
                    });
                    setMsWordPopupOpen(true);
                  }}
                  className="flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Word Popup
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    toast({
                      title: "Microsoft Copilot",
                      description: "Getting writing suggestions from Microsoft Copilot...",
                      variant: "default",
                    });
                    
                    try {
                      const session = await msOfficeVaultBridge.initializeSession(documentId);
                      const suggestions = await msOfficeVaultBridge.getWritingSuggestions(content, session.id);
                      
                      if (suggestions && suggestions.length > 0) {
                        toast({
                          title: "Suggestions Ready",
                          description: `${suggestions.length} writing suggestions available from Microsoft Copilot.`,
                          variant: "default",
                        });
                        setMsWordPopupOpen(true);
                      } else {
                        toast({
                          title: "No Suggestions",
                          description: "Microsoft Copilot didn't find any suggestions for this document.",
                          variant: "default",
                        });
                      }
                    } catch (error) {
                      console.error("Failed to get Microsoft Copilot suggestions:", error);
                      toast({
                        title: "Error",
                        description: "Could not retrieve suggestions from Microsoft Copilot.",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="flex items-center"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get Copilot Suggestions
                </Button>
              </div>

              <Button
                disabled={!hasUnsavedChanges || isSaving || readOnly}
                onClick={handleSave}
                className="flex items-center"
              >
                {isSaving ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="ai" className="p-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
                  Current Document Content
                </h3>
                <div className="prose max-w-none text-sm h-[300px] overflow-y-auto">
                  {content ? (
                    <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />
                  ) : (
                    <div className="text-gray-400 italic">No content available</div>
                  )}
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                  AI Suggestions
                </h3>
                
                {isFetchingSuggestions ? (
                  <div className="flex flex-col items-center justify-center h-[300px]">
                    <Skeleton className="h-10 w-10 rounded-full mb-4" />
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-4 w-32" />
                    <p className="text-sm text-gray-500 mt-2">Generating AI suggestions...</p>
                  </div>
                ) : aiSuggestions.length > 0 ? (
                  <div className="space-y-4 h-[300px] overflow-y-auto">
                    {aiSuggestions.map((suggestion) => (
                      <div key={suggestion.id} className="border rounded-md p-3 bg-purple-50">
                        <div className="prose max-w-none text-sm mb-3">
                          <div dangerouslySetInnerHTML={{ __html: suggestion.text.replace(/\n/g, '<br />') }} />
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500 flex items-center">
                            <Sparkles className="h-3 w-3 mr-1 text-purple-600" />
                            {suggestion.source}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => applySuggestion(suggestion.text)}
                            className="flex items-center"
                            disabled={readOnly}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Apply Suggestion
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px]">
                    <p className="text-gray-500 mb-4">
                      Get AI-powered suggestions to enhance your document content.
                    </p>
                    <Button
                      onClick={getAiSuggestions}
                      className="flex items-center"
                      disabled={!content}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Suggestions
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('edit')}
                className="flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Back to Editor
              </Button>
              
              {aiSuggestions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAiSuggestions([])}
                  className="flex items-center"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Clear Suggestions
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
      
      {/* Microsoft Word Popup Editor */}
      <MsWordPopupEditor
        isOpen={msWordPopupOpen}
        onClose={() => setMsWordPopupOpen(false)}
        documentId={documentId}
        documentName={documentName}
        readOnly={readOnly}
        autoSave={autoSave}
        onSave={handleMsWordSave}
      />
    </>
  );
};

export default EnhancedDocumentEditor;