import React, { useState, useEffect } from 'react';
import { X, Save, Clipboard, Loader, FileText, Maximize2, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Import services
import * as msWordIntegrationService from '../services/msWordIntegrationService';
import * as msOfficeVaultBridge from '../services/msOfficeVaultBridge';
import * as msCopilotService from '../services/msCopilotService';

/**
 * Microsoft Word Popup Editor Component
 * 
 * This component provides a popup window with embedded Microsoft Word functionality,
 * allowing users to edit documents in Word and save them back to the VAULT system.
 */
const MsWordPopupEditor = ({ 
  isOpen = false, 
  onClose, 
  documentId, 
  documentTitle = "Untitled Document",
  initialContent = "",
  onSave 
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wordSession, setWordSession] = useState(null);
  const [copilotSession, setCopilotSession] = useState(null);
  const [documentContent, setDocumentContent] = useState(initialContent);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState("editor");
  const [suggestions, setSuggestions] = useState([]);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const { toast } = useToast();

  // Initialize the Word editing session when the popup opens
  useEffect(() => {
    if (isOpen && documentId) {
      initializeWordEditing();
    }

    return () => {
      // Clean up the session when the component unmounts
      if (wordSession) {
        cleanupWordSession();
      }
    };
  }, [isOpen, documentId]);

  const initializeWordEditing = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      // Check if Word is available
      const isWordAvailable = await msWordIntegrationService.checkWordAvailability();
      
      if (!isWordAvailable) {
        throw new Error("Microsoft Word integration is not available. Please check your connection or permissions.");
      }

      // Initialize Word session
      const session = await msWordIntegrationService.initializeWordSession(documentId);
      setWordSession(session);

      // Connect to VAULT
      const vaultConnection = await msOfficeVaultBridge.connectOfficeToVault(
        documentId,
        session.sessionId,
        'word'
      );

      // Initialize Copilot
      const copilot = await msCopilotService.initializeCopilot(documentId);
      setCopilotSession(copilot);

      // Get some initial suggestions
      if (initialContent) {
        const initialSuggestions = await msCopilotService.getWritingSuggestions(
          initialContent,
          copilot.sessionId
        );
        setSuggestions(initialSuggestions);
      }

      // Simulate loading delay (in a real implementation, this would be the actual loading time)
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to initialize Microsoft Word editing:", error);
      setErrorMessage(error.message || "Failed to initialize Microsoft Word editing. Please try again.");
      setLoading(false);
    }
  };

  const cleanupWordSession = async () => {
    try {
      if (wordSession?.sessionId) {
        await msWordIntegrationService.endWordSession(wordSession.sessionId);
      }
      
      if (copilotSession?.sessionId) {
        await msCopilotService.endCopilotSession(copilotSession.sessionId);
      }
    } catch (error) {
      console.error("Error cleaning up Word session:", error);
    }
  };

  const handleSaveDocument = async () => {
    try {
      setSaving(true);
      
      // In a real implementation, this would get the actual content from Word
      // For demo purposes, we'll just use the mock content
      
      // Save content to VAULT
      await msOfficeVaultBridge.saveOfficeContentToVault(
        documentId,
        wordSession?.connectionId || 'mock-connection',
        documentContent
      );
      
      // Call the onSave callback with the content
      if (onSave) {
        onSave(documentContent);
      }
      
      toast({
        title: "Document Saved",
        description: "Your document has been saved successfully.",
        variant: "default",
      });
      
      setSaving(false);
    } catch (error) {
      console.error("Failed to save document:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save document. Please try again.",
        variant: "destructive",
      });
      setSaving(false);
    }
  };

  const handleCloseEditor = () => {
    cleanupWordSession();
    onClose();
  };

  const applySuggestion = (suggestion) => {
    // In a real implementation, this would apply the suggestion to the Word document
    // For our demo, actually update the content with the suggestion
    setDocumentContent((prevContent) => {
      // Replace the original text with the suggested text
      // In a real implementation, this would use proper text replacement
      // For this demo, we'll just append the suggestion
      const updatedContent = prevContent.includes(suggestion.original) 
        ? prevContent.replace(suggestion.original, suggestion.suggestion)
        : prevContent + "\n\n" + suggestion.suggestion;
      
      return updatedContent;
    });
    
    toast({
      title: "Suggestion Applied",
      description: "The suggestion has been applied to your document.",
      variant: "default",
    });
  };

  // If the popup is not open, don't render anything
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseEditor} modal={true}>
      <DialogContent className={`sm:max-w-[90vw] ${showFullScreen ? 'h-[90vh]' : 'sm:max-h-[80vh]'}`}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            <DialogTitle className="text-lg font-semibold">
              {documentTitle || "Edit Document in Microsoft Word"}
            </DialogTitle>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFullScreen(!showFullScreen)}
              title={showFullScreen ? "Exit Full Screen" : "Full Screen"}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCloseEditor}
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {errorMessage && (
          <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">
            {errorMessage}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="editor">Microsoft Word Editor</TabsTrigger>
            <TabsTrigger value="copilot">Copilot Suggestions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="w-full">
            <div className={`border rounded-md ${showFullScreen ? 'h-[70vh]' : 'h-[50vh]'} relative`}>
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50">
                  <Loader className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                  <p className="text-lg font-medium">Loading Microsoft Word...</p>
                  <Progress value={65} className="w-64 mt-4" />
                </div>
              ) : (
                <div className="p-4 h-full overflow-auto">
                  {/* This would be the actual Word iframe in a real implementation */}
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
                        value={documentContent}
                        onChange={(e) => setDocumentContent(e.target.value)}
                        placeholder="Document content..."
                      />
                    </div>
                    <div className="bg-[#f3f2f1] p-2 flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        Editing as {wordSession?.user || "John Doe"} | Word Online
                      </div>
                      <div className="text-xs text-blue-600">
                        Saved to VAULT
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="copilot" className={`${showFullScreen ? 'h-[70vh]' : 'h-[50vh]'} overflow-auto`}>
            <div className="border rounded-md p-4 h-full">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 text-white rounded-full p-2 mr-2">
                  <Clipboard className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold">Microsoft Copilot Suggestions</h3>
              </div>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center h-40">
                  <Loader className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                  <p>Analyzing document...</p>
                </div>
              ) : (
                <div>
                  <div className="mb-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      Copilot has analyzed your document and found {suggestions.length} suggestions 
                      to improve clarity, precision, and regulatory compliance.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {suggestions.map((suggestion, index) => (
                      <div key={suggestion.id || index} className="border rounded-md p-3 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {suggestion.type}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => applySuggestion(suggestion)}
                          >
                            Apply
                          </Button>
                        </div>
                        <div className="mb-2">
                          <p className="text-sm text-gray-600 mb-1">Original:</p>
                          <p className="text-sm bg-red-50 p-2 rounded">{suggestion.original}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Suggestion:</p>
                          <p className="text-sm bg-green-50 p-2 rounded">{suggestion.suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-500">
            <ExternalLink className="h-4 w-4 mr-1" />
            <span>Microsoft Word Online</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCloseEditor}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveDocument} 
              disabled={loading || saving}
            >
              {saving ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MsWordPopupEditor;