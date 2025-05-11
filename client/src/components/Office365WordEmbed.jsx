import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { 
  initializeOfficeJS, 
  openDocument, 
  saveDocumentContent, 
  insertTemplate,
  insertAIContent,
  formatDocumentHeadings,
  exportToPDF
} from '../services/microsoftWordService';
import { 
  askCopilot, 
  getWritingSuggestions, 
  generateRegulatorySection 
} from '../services/msCopilotService';
import { 
  getDocument, 
  saveDocument, 
  createDocumentVersion, 
  getDocumentVersionHistory, 
  registerCollaborationStatus 
} from '../services/msOfficeVaultBridge';
import { isAuthenticated, login, initializeAuth } from '../services/microsoftAuthService';

/**
 * Microsoft Word 365 Embedding Component
 * 
 * This component provides a real Microsoft Word 365 integration using Office JS.
 * It supports document editing with vault integration and AI-powered writing assistance.
 * 
 * @param {Object} props
 * @param {string} props.documentId - ID of the document to open
 * @param {string} props.initialContent - Initial content for the document (optional)
 * @param {function} props.onSave - Callback when document is saved (optional)
 * @param {function} props.onClose - Callback when editor is closed (optional)
 */
const Office365WordEmbed = ({ 
  documentId, 
  initialContent = '', 
  onSave, 
  onClose 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState(null);
  const [document, setDocument] = useState(null);
  const [documentContent, setDocumentContent] = useState(initialContent);
  const [currentTab, setCurrentTab] = useState("editor");
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [writingSuggestions, setWritingSuggestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [versions, setVersions] = useState([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [isOfficeJSReady, setIsOfficeJSReady] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState('');
  
  const containerRef = useRef(null);
  const { toast } = useToast();
  
  // Handle Microsoft login
  const handleLogin = async () => {
    try {
      setIsLoading(true);
      console.log('Starting Microsoft login process...');
      await login(); // This will redirect to Microsoft login
    } catch (err) {
      console.error('Error during login:', err);
      setError('Failed to authenticate with Microsoft: ' + (err.message || 'Unknown error'));
      setIsLoading(false);
    }
  };

  // Initialize Microsoft auth and Office JS API
  useEffect(() => {
    const initializeServices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Initialize Microsoft auth
        console.log('Initializing Microsoft authentication...');
        const authInitialized = await initializeAuth();
        
        // Check if user is authenticated with Microsoft
        if (!authInitialized || !isAuthenticated()) {
          console.log('User not authenticated with Microsoft, prompting login...');
          setIsAuthenticating(true);
          setIsLoading(false);
          return; // Wait for user to authenticate
        }
        
        console.log('User authenticated with Microsoft, initializing Office JS...');
        
        // Initialize Office JS
        const jsInitialized = await initializeOfficeJS();
        console.log('Office JS initialization result:', jsInitialized);
        
        if (!jsInitialized) {
          setError('Failed to initialize Microsoft Office API. Please check your Microsoft 365 license.');
          setIsLoading(false);
          return;
        }
        
        setIsOfficeJSReady(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing Microsoft services:', err);
        setError('Failed to initialize Microsoft Office integration: ' + (err.message || 'Unknown error'));
        setIsLoading(false);
        setIsAuthenticating(false);
      }
    };
    
    initializeServices();
  }, []);
  
  // Register cleanup on unmount
  useEffect(() => {
    return () => {
      // Unregister from document editing
      if (documentId) {
        registerCollaborationStatus(documentId, 'closed', 'current-user');
      }
    };
  }, [documentId]);
  
  // Load document from Vault
  useEffect(() => {
    const loadDocument = async () => {
      if (!documentId || !isOfficeJSReady) return;
      
      try {
        setIsLoading(true);
        setError(null);
        console.log('Loading Microsoft Word document with ID:', documentId);
        
        // Get document from vault or use initial content if available
        let documentContent;
        try {
          const docData = await getDocument(documentId);
          documentContent = docData.content || initialContent;
          console.log('Document retrieved from vault successfully');
        } catch (vaultError) {
          console.warn('Could not retrieve document from vault, using initial content', vaultError);
          documentContent = initialContent;
        }
        
        // Set document content in state
        setDocumentContent(documentContent);
        
        // Open document in Word using Microsoft Office JS API with improved error handling
        console.log('Opening document in Microsoft Word using Office JS API...');
        const wordDocument = await openDocument(documentId, documentContent);
        
        if (!wordDocument) {
          throw new Error('Failed to initialize Microsoft Word document');
        }
        
        console.log('Microsoft Word document opened successfully');
        
        // If the containerRef is available, we'll handle mounting the Word container 
        // in the render function using a ref callback to ensure proper display
        if (!wordDocument.container) {
          console.warn('Word document container not available from Office JS API');
          throw new Error('Microsoft Word container not available');
        }
        
        // Set the document in state to make it available for rendering
        setDocument(wordDocument);
        
        // Register collaboration status
        try {
          await registerCollaborationStatus(documentId, 'editing', 'current-user');
        } catch (collaborationError) {
          console.warn('Failed to register collaboration status', collaborationError);
          // Non-critical, can continue
        }
        
        // Load version history in the background
        loadVersionHistory().catch(versionError => {
          console.warn('Failed to load version history', versionError);
          // Non-critical, can continue
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading document:', err);
        setError(`Failed to load document: ${err.message || 'Unknown error'}`);
        setIsLoading(false);
      }
    };
    
    loadDocument();
  }, [documentId, isOfficeJSReady, initialContent]);
  
  // No duplicate function here, removed in previous edit
  
  // Load version history
  const loadVersionHistory = async () => {
    if (!documentId) return;
    
    try {
      setIsLoadingVersions(true);
      const versionHistory = await getDocumentVersionHistory(documentId);
      setVersions(versionHistory);
      setIsLoadingVersions(false);
    } catch (err) {
      console.error('Error loading version history:', err);
      toast({
        title: 'Error',
        description: 'Failed to load version history',
        variant: 'destructive',
      });
      setIsLoadingVersions(false);
    }
  };
  
  // Save document
  const handleSave = async () => {
    if (!document || !documentId) return;
    
    try {
      setIsSaving(true);
      
      // Get content from Word document
      const content = await saveDocumentContent(document);
      setDocumentContent(content);
      
      // Save to vault
      await saveDocument(documentId, content);
      
      // Call onSave callback if provided
      if (onSave) {
        onSave(content);
      }
      
      toast({
        title: 'Document Saved',
        description: 'Your document has been saved successfully.',
      });
      
      setIsSaving(false);
    } catch (err) {
      console.error('Error saving document:', err);
      toast({
        title: 'Save Error',
        description: 'Failed to save document',
        variant: 'destructive',
      });
      setIsSaving(false);
    }
  };
  
  // Create a new version
  const handleCreateVersion = async () => {
    if (!document || !documentId) return;
    
    try {
      setIsSaving(true);
      
      // Get content from Word document
      const content = await saveDocumentContent(document);
      
      // Prompt for version note
      const versionNote = prompt('Enter a note for this version:');
      if (!versionNote) {
        setIsSaving(false);
        return;
      }
      
      // Create version in vault
      await createDocumentVersion(documentId, content, versionNote);
      
      // Refresh version history
      await loadVersionHistory();
      
      toast({
        title: 'Version Created',
        description: 'A new document version has been created.',
      });
      
      setIsSaving(false);
    } catch (err) {
      console.error('Error creating version:', err);
      toast({
        title: 'Version Error',
        description: 'Failed to create document version',
        variant: 'destructive',
      });
      setIsSaving(false);
    }
  };
  
  // Handle AI prompt submission
  const handleAIPrompt = async () => {
    if (!aiPrompt.trim()) return;
    
    try {
      setIsGenerating(true);
      setAiResponse('');
      
      // Get response from Copilot
      const response = await askCopilot(aiPrompt, {
        documentContext: documentContent,
      });
      
      setAiResponse(response.text);
      setIsGenerating(false);
    } catch (err) {
      console.error('Error getting AI response:', err);
      setAiResponse('Failed to get AI response. Please try again.');
      setIsGenerating(false);
    }
  };
  
  // Insert AI response into document
  const handleInsertAIResponse = async () => {
    if (!document || !aiResponse) return;
    
    try {
      await insertAIContent(document, aiResponse);
      
      toast({
        title: 'Content Inserted',
        description: 'AI-generated content has been inserted into the document.',
      });
      
      // Clear AI response
      setAiResponse('');
      setAiPrompt('');
    } catch (err) {
      console.error('Error inserting AI content:', err);
      toast({
        title: 'Insert Error',
        description: 'Failed to insert AI content',
        variant: 'destructive',
      });
    }
  };
  
  // Generate writing suggestions
  const handleGetSuggestions = async () => {
    if (!documentContent) return;
    
    try {
      setIsGenerating(true);
      
      // Get writing suggestions
      const suggestions = await getWritingSuggestions(documentContent);
      setWritingSuggestions(suggestions);
      
      setIsGenerating(false);
    } catch (err) {
      console.error('Error getting writing suggestions:', err);
      toast({
        title: 'Suggestion Error',
        description: 'Failed to get writing suggestions',
        variant: 'destructive',
      });
      setIsGenerating(false);
    }
  };
  
  // Apply a document template
  const handleApplyTemplate = async () => {
    if (!document || !activeTemplate) return;
    
    try {
      setIsLoading(true);
      
      // Insert template into document
      await insertTemplate(document, activeTemplate);
      
      // Format document headings
      await formatDocumentHeadings(document);
      
      toast({
        title: 'Template Applied',
        description: `The ${activeTemplate} template has been applied to your document.`,
      });
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error applying template:', err);
      toast({
        title: 'Template Error',
        description: 'Failed to apply document template',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  // Generate document section
  const handleGenerateSection = async () => {
    if (!document || !activeTemplate) return;
    
    try {
      setIsGenerating(true);
      
      // Ask for section name
      const sectionName = prompt('Which section would you like to generate?');
      if (!sectionName) {
        setIsGenerating(false);
        return;
      }
      
      // Get additional context
      const additionalContext = prompt('Any specific requirements for this section? (Optional)');
      
      // Generate section content
      const sectionContent = await generateRegulatorySection(sectionName, additionalContext || '');
      
      // Insert content into document
      await insertAIContent(document, sectionContent);
      
      toast({
        title: 'Section Generated',
        description: `The ${sectionName} section has been generated and inserted.`,
      });
      
      setIsGenerating(false);
    } catch (err) {
      console.error('Error generating section:', err);
      toast({
        title: 'Generation Error',
        description: 'Failed to generate document section',
        variant: 'destructive',
      });
      setIsGenerating(false);
    }
  };
  
  // Export to PDF
  const handleExportToPDF = async () => {
    if (!document) return;
    
    try {
      setIsLoading(true);
      
      // Export document to PDF
      const pdfBlob = await exportToPDF(document);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${documentId || 'document'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'PDF Exported',
        description: 'Your document has been exported to PDF.',
      });
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      toast({
        title: 'Export Error',
        description: 'Failed to export document to PDF',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  // Render authentication screen
  if (isAuthenticating) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[400px]">
        <h2 className="text-2xl font-bold">Microsoft Authentication Required</h2>
        <p className="text-gray-600 text-center max-w-md">
          You need to authenticate with Microsoft to use the Word 365 editor.
          This allows you to access the genuine Microsoft Word interface within the application.
        </p>
        <Button onClick={handleLogin} size="lg">
          Sign in with Microsoft
        </Button>
      </div>
    );
  }
  
  // Render loading screen
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-gray-600">Loading Microsoft Word...</p>
      </div>
    );
  }

  // Render error screen
  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border rounded-lg shadow-lg">
      {/* Microsoft Word Embed Component */}
      <div className="flex justify-between items-center p-2 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium">Microsoft Word</h3>
          
          <div className="ml-4">
            <select 
              className="bg-white border rounded p-1 text-sm"
              value={activeTemplate}
              onChange={(e) => setActiveTemplate(e.target.value)}
            >
              <option value="">-- Select Template --</option>
              <option value="clinical-protocol">Clinical Protocol</option>
              <option value="clinical-study-report">Clinical Study Report</option>
              <option value="regulatory-submission">Regulatory Submission</option>
              <option value="clinical-evaluation-report">Clinical Evaluation Report</option>
            </select>
            
            <Button 
              size="sm" 
              onClick={handleApplyTemplate} 
              disabled={!activeTemplate || isLoading}
              className="ml-2"
            >
              Apply Template
            </Button>
            
            <Button 
              size="sm" 
              onClick={handleGenerateSection} 
              disabled={!activeTemplate || isGenerating}
              className="ml-2"
            >
              Generate Section
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={isSaving || !document}
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save
          </Button>
          <Button 
            size="sm" 
            onClick={handleCreateVersion} 
            disabled={isSaving || !document}
            variant="outline"
          >
            Save Version
          </Button>
          <Button 
            size="sm" 
            onClick={handleExportToPDF} 
            disabled={isLoading || !document}
            variant="outline"
          >
            Export to PDF
          </Button>
          {onClose && (
            <Button 
              size="sm" 
              onClick={onClose} 
              variant="ghost"
            >
              Close
            </Button>
          )}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Word Editor */}
        <div className="flex-1 overflow-hidden" ref={containerRef}>
          {isOfficeJSReady && document ? (
            <div id="word-editor-container" className="w-full h-full min-h-[600px] border-0">
              {/* This div will be used to mount the Word iframe */}
              {document.container && (
                <div
                  id="word-iframe-wrapper"
                  className="w-full h-full"
                  ref={node => {
                    if (node && document.container) {
                      // If the container is not already in the DOM, append it
                      if (!node.firstChild) {
                        // Clear anything that might already be in the node
                        while (node.firstChild) {
                          node.removeChild(node.firstChild);
                        }
                        
                        // Show the container if it was hidden
                        document.container.style.display = 'block';
                        
                        // Append Word container
                        node.appendChild(document.container);
                        console.log('Successfully mounted Microsoft Word iframe');
                      }
                    }
                  }}
                />
              )}
            </div>
          ) : (
            <div id="office-container" className="w-full h-full min-h-[600px] bg-white">
              {isOfficeJSReady ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-center text-gray-600 font-medium">
                    Loading Microsoft Word 365...
                  </p>
                  <p className="text-center text-gray-500 text-sm mt-2">
                    Preparing document for editing
                  </p>
                </div>
              ) : (
                <div className="p-8">
                  {isAuthenticating ? (
                    <div className="text-center">
                      <p className="text-center text-amber-600 font-medium mb-4">
                        Microsoft Authentication Required
                      </p>
                      <Button 
                        onClick={handleLogin} 
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Sign in with Microsoft 365
                      </Button>
                      <p className="text-center text-gray-500 text-sm mt-4">
                        You need to authenticate with your Microsoft 365 account to access Word Online.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-center text-red-600 font-medium">
                        Microsoft Word Office JS integration is not ready
                      </p>
                      <p className="text-center text-gray-500 text-sm mt-2">
                        Please check your connection and Microsoft 365 license.
                      </p>
                      <div className="mt-6">
                        <Button 
                          onClick={() => window.location.reload()}
                          variant="outline"
                        >
                          Retry Connection
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Preview document content if available */}
              {documentContent && (
                <div className="mt-4 p-4 border-t">
                  <p className="font-semibold mb-2">Document Content Preview:</p>
                  <p className="whitespace-pre-wrap border p-2 bg-white rounded max-h-[300px] overflow-auto text-sm">
                    {documentContent.substring(0, 500)}
                    {documentContent.length > 500 ? '...' : ''}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="w-96 border-l overflow-hidden flex flex-col">
          <Tabs 
            defaultValue="ai" 
            value={currentTab} 
            onValueChange={setCurrentTab}
            className="flex flex-col h-full"
          >
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="ai">AI Assistant</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
            </TabsList>
            
            {/* AI Assistant Tab */}
            <TabsContent value="ai" className="flex-1 overflow-auto p-4 space-y-4">
              <div>
                <h3 className="font-medium mb-2">Ask Microsoft Copilot</h3>
                <textarea
                  className="w-full border rounded p-2 mb-2 h-24"
                  placeholder="What regulatory content would you like help with?"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                ></textarea>
                <div className="flex justify-between">
                  <Button 
                    onClick={handleAIPrompt} 
                    disabled={isGenerating || !aiPrompt.trim()}
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Get Response
                  </Button>
                </div>
              </div>
              
              {aiResponse && (
                <div className="mt-4 border rounded p-3 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Copilot Response</h4>
                    <Button 
                      size="sm" 
                      onClick={handleInsertAIResponse}
                      disabled={!document}
                    >
                      Insert
                    </Button>
                  </div>
                  <div className="whitespace-pre-wrap">{aiResponse}</div>
                </div>
              )}
            </TabsContent>
            
            {/* Suggestions Tab */}
            <TabsContent value="suggestions" className="flex-1 overflow-auto p-4">
              <div className="flex justify-between mb-4">
                <h3 className="font-medium">Writing Suggestions</h3>
                <Button 
                  size="sm" 
                  onClick={handleGetSuggestions} 
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Analyze Document
                </Button>
              </div>
              
              {writingSuggestions.length > 0 ? (
                <div className="space-y-3">
                  {writingSuggestions.map((suggestion) => (
                    <div 
                      key={suggestion.id} 
                      className={`p-2 border rounded ${
                        suggestion.type === 'error' 
                          ? 'bg-red-50 border-red-200' 
                          : suggestion.type === 'warning'
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <p className="text-sm">{suggestion.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center mt-8">
                  No suggestions available. Click "Analyze Document" to get writing recommendations.
                </p>
              )}
            </TabsContent>
            
            {/* Versions Tab */}
            <TabsContent value="versions" className="flex-1 overflow-auto p-4">
              <div className="flex justify-between mb-4">
                <h3 className="font-medium">Version History</h3>
                <Button 
                  size="sm" 
                  onClick={loadVersionHistory} 
                  disabled={isLoadingVersions}
                >
                  {isLoadingVersions ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Refresh
                </Button>
              </div>
              
              {versions.length > 0 ? (
                <div className="space-y-3">
                  {versions.map((version) => (
                    <div 
                      key={version.id} 
                      className="p-3 border rounded bg-gray-50"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">Version {version.versionNumber}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(version.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{version.note}</p>
                      <p className="text-sm text-gray-500 mt-1">By: {version.createdBy}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center mt-8">
                  No versions available. Save a version to see it here.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Office365WordEmbed;