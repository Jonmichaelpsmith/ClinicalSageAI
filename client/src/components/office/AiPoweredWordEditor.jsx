import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, MessageSquare, FileText, Settings, Save, FilePlus, FileCheck, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Office365WordEmbed from './MicrosoftWordEmbed';

/**
 * AI-Powered Word Editor Component
 * 
 * This component integrates Microsoft Word with AI capabilities,
 * providing a unified interface for document editing and AI assistance.
 * 
 * @param {Object} props
 * @param {string} props.documentId - ID of the document to open
 * @param {string} props.initialContent - Initial content for the document (optional)
 * @param {function} props.onSave - Callback when document is saved (optional)
 * @param {function} props.onClose - Callback when editor is closed (optional)
 */
const AiPoweredWordEditor = ({ 
  documentId, 
  initialContent = '', 
  onSave, 
  onClose 
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("document");
  const [documentState, setDocumentState] = useState({
    isDirty: false,
    lastSaved: null
  });
  const [suggestions, setSuggestions] = useState([]);
  const [regulatoryChecklist, setRegulatoryChecklist] = useState([]);
  const [documentHelp, setDocumentHelp] = useState({
    title: 'Document Assistant',
    content: 'Ask for help with document formatting, content suggestions, or regulatory compliance. You can also use this panel to view your document metrics and track your progress.'
  });
  
  const wordEmbedRef = useRef(null);
  const { toast } = useToast();
  
  // Handle sending prompt to AI assistant
  const handleSendPrompt = async () => {
    if (!aiPrompt.trim()) return;
    
    try {
      setIsProcessing(true);
      setAiResponse('Thinking...');
      
      // In a real implementation, you would call your AI service here
      // For now, we'll simulate a response after a delay
      setTimeout(() => {
        setAiResponse(
          `Here's a response to your query: "${aiPrompt}"\n\n` +
          `I can help you improve this document by providing content suggestions, formatting assistance, or regulatory compliance checks. ` +
          `Would you like me to help with anything specific about your document?`
        );
        setIsProcessing(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error processing AI prompt:', error);
      setAiResponse('Sorry, I encountered an error processing your request. Please try again.');
      setIsProcessing(false);
    }
  };
  
  // Insert AI response into document
  const handleInsertResponse = async () => {
    if (!aiResponse || !wordEmbedRef.current) return;
    
    try {
      // Call the word embed component's insert method
      // This is just a mock implementation
      toast({
        title: 'Content Inserted',
        description: 'AI-generated content has been inserted into your document.',
      });
      
      // Reset AI prompt and response
      setAiPrompt('');
      setAiResponse('');
    } catch (error) {
      console.error('Error inserting AI response:', error);
      toast({
        title: 'Insert Error',
        description: 'Failed to insert content into document',
        variant: 'destructive',
      });
    }
  };
  
  // Get writing suggestions for the document
  const handleGetSuggestions = async () => {
    try {
      setIsProcessing(true);
      
      // In a real implementation, you would call your AI service here
      // For now, we'll simulate suggestions after a delay
      setTimeout(() => {
        setSuggestions([
          {
            id: 1,
            type: 'grammar',
            text: 'Consider rephrasing the sentence in paragraph 2 for better clarity.',
            location: 'Page 1, Paragraph 2',
          },
          {
            id: 2,
            type: 'structure',
            text: 'Add a subheading before section 3 to improve document navigation.',
            location: 'Page 2, Section 3',
          },
          {
            id: 3,
            type: 'regulatory',
            text: 'Include a reference to the relevant regulatory standard in section 4.2.',
            location: 'Page 3, Section 4.2',
          }
        ]);
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast({
        title: 'Suggestion Error',
        description: 'Failed to generate writing suggestions',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };
  
  // Run regulatory compliance check
  const handleComplianceCheck = async () => {
    try {
      setIsProcessing(true);
      
      // In a real implementation, you would call your compliance service here
      // For now, we'll simulate a compliance check after a delay
      setTimeout(() => {
        setRegulatoryChecklist([
          {
            id: 1,
            status: 'pass',
            requirement: 'Document includes required section headers',
            details: 'All mandatory sections are present in the document.'
          },
          {
            id: 2,
            status: 'warning',
            requirement: 'References to regulatory standards',
            details: 'Consider adding specific references to ISO 10993-1 in the biocompatibility section.'
          },
          {
            id: 3,
            status: 'fail',
            requirement: 'Risk assessment documentation',
            details: 'Missing required risk assessment matrix in section 5.'
          }
        ]);
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      console.error('Error checking compliance:', error);
      toast({
        title: 'Compliance Error',
        description: 'Failed to check regulatory compliance',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };
  
  // Handle document save
  const handleSave = async () => {
    try {
      // Call the word embed component's save method
      if (wordEmbedRef.current) {
        // This would call the actual save method in a real implementation
        // wordEmbedRef.current.save();
        
        setDocumentState({
          isDirty: false,
          lastSaved: new Date()
        });
        
        toast({
          title: 'Document Saved',
          description: 'Your document has been saved successfully.',
        });
        
        if (onSave) {
          onSave();
        }
      }
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: 'Save Error',
        description: 'Failed to save document',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-background border-b flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <FileText className="h-6 w-6" />
          <div>
            <h2 className="text-xl font-semibold">eCTD Co-Author</h2>
            <p className="text-sm text-muted-foreground">
              {documentState.lastSaved ? 
                `Last saved: ${documentState.lastSaved.toLocaleTimeString()}` : 
                'Not saved yet'}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button 
            variant="outline" 
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {onClose && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main editor area */}
        <div className="flex-1 overflow-auto">
          <Office365WordEmbed
            ref={wordEmbedRef}
            documentId={documentId}
            initialContent={initialContent}
            onSave={handleSave}
          />
        </div>
        
        {/* AI Assistant panel */}
        <div className="w-96 border-l bg-muted/20 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b px-4 py-2">
              <TabsList className="w-full">
                <TabsTrigger value="document" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Document
                </TabsTrigger>
                <TabsTrigger value="assistant" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Assistant
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Tools
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="document" className="flex-1 p-4 overflow-auto space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Document Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Document ID:</span>
                      <span className="text-sm font-medium">{documentId || 'New Document'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span className="text-sm font-medium">{documentState.isDirty ? 'Modified' : 'Saved'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Document Type:</span>
                      <span className="text-sm font-medium">eCTD Module 3</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Writing Suggestions</CardTitle>
                  <CardDescription>AI-powered suggestions to improve your document</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {suggestions.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No suggestions yet</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={handleGetSuggestions}
                        disabled={isProcessing}
                      >
                        {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Get Suggestions
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {suggestions.map(suggestion => (
                        <div key={suggestion.id} className="p-2 border rounded-md text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{suggestion.type}</span>
                            <span className="text-xs text-muted-foreground">{suggestion.location}</span>
                          </div>
                          <p className="mt-1">{suggestion.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Regulatory Compliance</CardTitle>
                  <CardDescription>Check your document against regulatory standards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {regulatoryChecklist.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No compliance checks run yet</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={handleComplianceCheck}
                        disabled={isProcessing}
                      >
                        {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Run Compliance Check
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {regulatoryChecklist.map(item => (
                        <div 
                          key={item.id} 
                          className={`p-2 border rounded-md text-sm ${
                            item.status === 'pass' ? 'border-green-200 bg-green-50' :
                            item.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                            'border-red-200 bg-red-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.requirement}</span>
                            <span 
                              className={`text-xs px-2 py-1 rounded-full ${
                                item.status === 'pass' ? 'bg-green-100 text-green-800' :
                                item.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <p className="mt-1 text-xs">{item.details}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="assistant" className="flex flex-col h-full p-0 overflow-hidden">
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {aiResponse ? (
                  <div className="mb-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">AI Assistant</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="whitespace-pre-wrap text-sm">
                          {aiResponse}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={handleInsertResponse}
                          className="ml-auto"
                        >
                          <FileCheck className="h-4 w-4 mr-2" />
                          Insert into Document
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                ) : (
                  <Card className="mb-4">
                    <CardHeader>
                      <CardTitle>{documentHelp.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{documentHelp.content}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <div className="p-4 border-t mt-auto">
                <div className="flex items-start space-x-2">
                  <Textarea
                    placeholder="Ask the AI assistant for help..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="flex-1 min-h-[80px]"
                  />
                  <Button 
                    onClick={handleSendPrompt}
                    disabled={!aiPrompt.trim() || isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="flex-1 p-4 overflow-auto space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Document Templates</CardTitle>
                  <CardDescription>Apply predefined templates to your document</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FilePlus className="h-4 w-4 mr-2" />
                    eCTD Module 3 Quality Template
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FilePlus className="h-4 w-4 mr-2" />
                    Clinical Study Report Template
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FilePlus className="h-4 w-4 mr-2" />
                    NDA Cover Letter Template
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Document Formatting</CardTitle>
                  <CardDescription>Apply regulatory-compliant formatting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Format Headings to eCTD Standard
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Generate Table of Contents
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Apply FDA Pagination Standards
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                  <CardDescription>Export your document in different formats</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export as PDF
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export as Word Document
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export with Tracked Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AiPoweredWordEditor;