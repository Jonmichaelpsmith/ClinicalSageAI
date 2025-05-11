import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, PenTool, Lightbulb, ChevronRight, BookOpen, CheckCircle, 
  RefreshCcw, HelpCircle, Wand2, FileText, List, BookOpen as BookIcon, AlertTriangle } from 'lucide-react';
import MicrosoftWordEmbed from './MicrosoftWordEmbed';

/**
 * AI-Powered Word Editor Component
 * 
 * This component integrates Microsoft Word with AI assistance specifically for regulatory document authoring.
 * It provides a pop-up Word editor with AI formatting suggestions, content recommendations,
 * and regulatory compliance checking.
 * 
 * Features:
 * - Microsoft Word editor embedded directly in the application
 * - AI-powered formatting suggestions for regulatory documents
 * - Content recommendations based on document type and context
 * - Real-time compliance checking for regulatory guidelines
 * - Template library for common regulatory document types
 */
const AiPoweredWordEditor = ({
  isOpen,
  onOpenChange,
  documentId,
  documentName = "Untitled Document",
  documentType = "ind",
  moduleSection = "",
  readOnly = false
}) => {
  const [activeTab, setActiveTab] = useState("editor");
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [formatSuggestions, setFormatSuggestions] = useState([]);
  const [complianceIssues, setComplianceIssues] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentStatus, setDocumentStatus] = useState('loading');
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  
  const messagesEndRef = useRef(null);
  const { toast } = useToast();
  
  // Scroll to bottom of messages when new suggestions are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiSuggestions]);
  
  // Fetch templates based on document type
  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen, documentType]);
  
  // Mock fetch templates
  const fetchTemplates = async () => {
    // This would be an API call in a real implementation
    const templates = [
      {
        id: 'ind-proto',
        name: 'IND Protocol Template',
        description: 'Standard protocol template for IND submissions',
        type: 'ind',
        section: 'protocol'
      },
      {
        id: 'ind-cmc',
        name: 'Chemistry, Manufacturing, and Controls',
        description: 'Template for CMC section of IND submissions',
        type: 'ind',
        section: 'cmc'
      },
      {
        id: 'ind-safety',
        name: 'Nonclinical Safety Assessment',
        description: 'Template for safety assessment section of IND submissions',
        type: 'ind',
        section: 'safety'
      },
      {
        id: 'ctd-overview',
        name: 'CTD Clinical Overview',
        description: 'Template for Module 2.5 Clinical Overview',
        type: 'ctd',
        section: 'overview'
      }
    ];
    
    // Filter templates based on document type
    const filteredTemplates = templates.filter(
      template => template.type === documentType || template.type === 'general'
    );
    
    setAvailableTemplates(filteredTemplates);
  };
  
  // Handle document status change from Word editor
  const handleDocumentStatusChange = (status) => {
    setDocumentStatus(status);
    
    // Generate AI suggestions based on document status and content
    if (status === 'loaded' || status === 'edited') {
      generateAiSuggestions();
    }
  };
  
  // Handle template selection
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    
    toast({
      title: "Template Selected",
      description: `Applied template: ${template.name}`
    });
    
    // In a real implementation, this would apply the template to the Word document
    // For now, generate formatting suggestions based on the template
    generateFormatSuggestions(template);
  };
  
  // Handle save from Word editor
  const handleSaveDocument = (documentInfo) => {
    toast({
      title: "Document Saved",
      description: `Successfully saved: ${documentName}`
    });
    
    // Check document compliance after save
    checkComplianceAfterSave();
  };
  
  // Check document compliance after save
  const checkComplianceAfterSave = async () => {
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would be an API call to check compliance
      // For demo purposes, generate mock compliance issues
      setTimeout(() => {
        const mockComplianceIssues = [
          {
            id: 1,
            severity: 'warning',
            section: 'Introduction',
            message: 'Missing standard regulatory disclaimer'
          },
          {
            id: 2,
            severity: 'info',
            section: 'Methods',
            message: 'Consider adding cross-reference to related protocols in Module 5'
          },
          {
            id: 3,
            severity: 'error',
            section: 'Safety Data',
            message: 'Reference to unpublished data requires additional documentation'
          }
        ];
        
        setComplianceIssues(mockComplianceIssues);
        setIsProcessing(false);
        
        toast({
          title: "Compliance Check Complete",
          description: `Found ${mockComplianceIssues.length} issues to review`
        });
      }, 2000);
    } catch (err) {
      console.error('Error checking compliance:', err);
      setIsProcessing(false);
      
      toast({
        variant: "destructive",
        title: "Compliance Check Failed",
        description: "An error occurred while checking document compliance"
      });
    }
  };
  
  // Generate AI suggestions
  const generateAiSuggestions = async () => {
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would be an API call to an AI service
      // For demo purposes, generate mock suggestions based on document type
      setTimeout(() => {
        const suggestions = [];
        
        if (documentType === 'ind') {
          suggestions.push({
            id: 'sug1',
            type: 'content',
            text: 'Your protocol introduction should include the rationale for the study design based on preclinical findings.'
          });
          
          suggestions.push({
            id: 'sug2',
            type: 'format',
            text: 'Consider using standard headings for Protocol sections to comply with FDA guidance.'
          });
          
          suggestions.push({
            id: 'sug3',
            type: 'reference',
            text: 'Add reference to the Investigator\'s Brochure in the background section.'
          });
        } else if (documentType === 'ctd') {
          suggestions.push({
            id: 'sug1',
            type: 'content',
            text: 'Include a comprehensive benefit-risk assessment as required by ICH guidelines.'
          });
          
          suggestions.push({
            id: 'sug2',
            type: 'format',
            text: 'Tables should be numbered sequentially with a descriptive caption above each table.'
          });
        }
        
        setAiSuggestions(suggestions);
        setIsProcessing(false);
      }, 1500);
    } catch (err) {
      console.error('Error generating AI suggestions:', err);
      setIsProcessing(false);
    }
  };
  
  // Generate formatting suggestions
  const generateFormatSuggestions = (template) => {
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would be an API call to get formatting guidance
      // For demo purposes, generate mock formatting suggestions
      setTimeout(() => {
        const suggestions = [
          {
            id: 'fmt1',
            type: 'heading',
            text: 'Use Heading 1 for main sections and Heading 2 for subsections'
          },
          {
            id: 'fmt2',
            type: 'style',
            text: 'Apply \'Normal\' style to body text with 12pt font and 1.15 line spacing'
          },
          {
            id: 'fmt3',
            type: 'table',
            text: 'Use the \'Table Grid\' style for data tables with borders'
          },
          {
            id: 'fmt4',
            type: 'page',
            text: 'Add page numbers in the footer centered with the format "Page X of Y"'
          },
          {
            id: 'fmt5',
            type: 'header',
            text: 'Include the document title and confidentiality statement in the header'
          }
        ];
        
        setFormatSuggestions(suggestions);
        setIsProcessing(false);
      }, 1000);
    } catch (err) {
      console.error('Error generating formatting suggestions:', err);
      setIsProcessing(false);
    }
  };
  
  // Handle user prompt submission
  const handlePromptSubmit = (e) => {
    e.preventDefault();
    
    if (!userPrompt.trim()) return;
    
    // Add user question to suggestions
    const newSuggestion = {
      id: `usr-${Date.now()}`,
      type: 'user',
      text: userPrompt
    };
    
    setAiSuggestions(prev => [...prev, newSuggestion]);
    setUserPrompt('');
    
    // Generate AI response
    setIsProcessing(true);
    setTimeout(() => {
      const aiResponse = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        text: `Based on your question about "${userPrompt.substring(0, 30)}...", I recommend enhancing the Methods section with more details about subject eligibility criteria and primary endpoints. This aligns with FDA guidance for IND protocols.`
      };
      
      setAiSuggestions(prev => [...prev, aiResponse]);
      setIsProcessing(false);
    }, 2000);
  };
  
  // Apply formatting to document
  const handleApplyFormatting = (suggestion) => {
    toast({
      title: "Formatting Applied",
      description: suggestion.text
    });
    
    // In a real implementation, this would apply the formatting to the Word document
  };
  
  // Fix compliance issue
  const handleFixComplianceIssue = (issue) => {
    toast({
      title: "Fixing Issue",
      description: `Addressing: ${issue.message}`
    });
    
    // In a real implementation, this would navigate to the issue location in the Word document
    // and provide guidance on how to fix it
    
    // Mark issue as fixed (for demo)
    setComplianceIssues(prev => 
      prev.filter(item => item.id !== issue.id)
    );
  };
  
  // Render suggestion item
  const renderSuggestionItem = (suggestion) => {
    // Determine icon based on suggestion type
    let icon;
    let badgeClass = "bg-blue-100 text-blue-800";
    let badgeText = "Suggestion";
    
    switch (suggestion.type) {
      case 'content':
        icon = <BookOpen className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />;
        break;
      case 'format':
        icon = <PenTool className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />;
        badgeClass = "bg-purple-100 text-purple-800";
        badgeText = "Format";
        break;
      case 'reference':
        icon = <BookIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />;
        badgeClass = "bg-green-100 text-green-800";
        badgeText = "Reference";
        break;
      case 'user':
        icon = <MessageSquare className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />;
        badgeClass = "bg-gray-100 text-gray-800";
        badgeText = "Question";
        break;
      case 'ai':
        icon = <Lightbulb className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />;
        badgeClass = "bg-amber-100 text-amber-800";
        badgeText = "Answer";
        break;
      default:
        icon = <Lightbulb className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />;
    }
    
    return (
      <div key={suggestion.id} className="p-3 border rounded-md mb-3">
        <div className="flex items-start">
          {icon}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <Badge className={badgeClass}>{badgeText}</Badge>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm">{suggestion.text}</p>
          </div>
        </div>
      </div>
    );
  };
  
  // Render format suggestion item
  const renderFormatItem = (format) => {
    return (
      <div key={format.id} className="p-3 border rounded-md mb-3">
        <div className="flex items-start">
          <PenTool className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <Badge className="bg-purple-100 text-purple-800">{format.type}</Badge>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => handleApplyFormatting(format)}
              >
                Apply
              </Button>
            </div>
            <p className="text-sm">{format.text}</p>
          </div>
        </div>
      </div>
    );
  };
  
  // Render compliance issue item
  const renderComplianceItem = (issue) => {
    let severityClass;
    let icon;
    
    switch (issue.severity) {
      case 'error':
        severityClass = "bg-red-100 text-red-800";
        icon = <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />;
        break;
      case 'warning':
        severityClass = "bg-amber-100 text-amber-800";
        icon = <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />;
        break;
      case 'info':
        severityClass = "bg-blue-100 text-blue-800";
        icon = <HelpCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />;
        break;
      default:
        severityClass = "bg-gray-100 text-gray-800";
        icon = <HelpCircle className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />;
    }
    
    return (
      <div key={issue.id} className="p-3 border rounded-md mb-3">
        <div className="flex items-start">
          {icon}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <Badge className={severityClass}>{issue.severity}</Badge>
                <span className="text-xs text-muted-foreground ml-2">{issue.section}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => handleFixComplianceIssue(issue)}
              >
                Fix Issue
              </Button>
            </div>
            <p className="text-sm">{issue.message}</p>
          </div>
        </div>
      </div>
    );
  };
  
  // Render template item
  const renderTemplateItem = (template) => {
    return (
      <Card key={template.id} className="mb-3 cursor-pointer hover:bg-muted/50" onClick={() => handleSelectTemplate(template)}>
        <CardContent className="p-3">
          <div className="flex items-start">
            <FileText className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium">{template.name}</div>
                <Badge className="bg-gray-100 text-gray-800">{template.type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} className="max-w-6xl">
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>AI-Powered Document Editor - {documentName}</DialogTitle>
        </DialogHeader>
        
        <div className="flex h-[calc(90vh-3.5rem)]">
          {/* Word Editor (left side) */}
          <div className="flex-1 border-r">
            <MicrosoftWordEmbed
              documentId={documentId}
              documentName={documentName}
              onStatusChange={handleDocumentStatusChange}
              onSave={handleSaveDocument}
              onClose={() => onOpenChange(false)}
              readOnly={readOnly}
            />
          </div>
          
          {/* AI Assistant Panel (right side) */}
          <div className="w-80 flex flex-col h-full bg-muted/20">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              <TabsList className="flex justify-between px-2 pt-2 bg-transparent h-auto">
                <TabsTrigger value="editor" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Assistant
                </TabsTrigger>
                <TabsTrigger value="format" className="flex-1">
                  <PenTool className="h-4 w-4 mr-1" />
                  Format
                </TabsTrigger>
                <TabsTrigger value="compliance" className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Compliance
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex-1">
                  <List className="h-4 w-4 mr-1" />
                  Templates
                </TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-hidden">
                <TabsContent value="editor" className="h-full flex flex-col p-0 m-0 pt-2">
                  <div className="flex-1 overflow-y-auto px-3">
                    {aiSuggestions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-medium mb-2">AI Assistant</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          I'll help you create regulatory-compliant documents with AI-powered suggestions.
                        </p>
                      </div>
                    ) : (
                      <div>
                        {aiSuggestions.map(suggestion => renderSuggestionItem(suggestion))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                    
                    {isProcessing && (
                      <div className="p-3 border rounded-md mb-3 bg-muted/50">
                        <div className="flex items-center">
                          <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                          <p className="text-sm">Analyzing document...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 border-t">
                    <form onSubmit={handlePromptSubmit} className="flex items-center">
                      <Input
                        placeholder="Ask about this document..."
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        className="flex-1 mr-2"
                      />
                      <Button type="submit" size="sm">
                        <Wand2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </TabsContent>
                
                <TabsContent value="format" className="h-full flex flex-col p-0 m-0 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-3">
                    {formatSuggestions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <PenTool className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-medium mb-2">Formatting Assistant</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Select a template or edit your document to get formatting suggestions.
                        </p>
                        <Button 
                          variant="outline" 
                          onClick={() => setActiveTab("templates")}
                        >
                          Browse Templates
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-medium mb-3">Formatting Suggestions</h3>
                        {formatSuggestions.map(format => renderFormatItem(format))}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="compliance" className="h-full flex flex-col p-0 m-0 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-3">
                    {complianceIssues.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-medium mb-2">Compliance Checker</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Save your document to check for regulatory compliance issues.
                        </p>
                        <Button 
                          variant="outline" 
                          onClick={checkComplianceAfterSave}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                              Checking...
                            </>
                          ) : (
                            <>
                              Check Compliance
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-medium mb-3">Compliance Issues</h3>
                        {complianceIssues.map(issue => renderComplianceItem(issue))}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="templates" className="h-full flex flex-col p-0 m-0 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-3">
                    <h3 className="font-medium mb-3">Available Templates</h3>
                    {availableTemplates.map(template => renderTemplateItem(template))}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Mock AlertTriangle component for compliance issues
const AlertTriangle = ({ className }) => {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>;
};

export default AiPoweredWordEditor;