import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  Download, 
  Upload, 
  FileText, 
  Check, 
  Zap, 
  AlertTriangle, 
  BookOpen, 
  Pencil,
  FileCheck,
  List,
  CheckCircle2,
  Bot
} from 'lucide-react';

import MicrosoftWordEmbed from './MicrosoftWordEmbed';
import DocumentUploader from './DocumentUploader';

/**
 * AiPoweredWordEditor Component
 * 
 * This component combines Microsoft Word embedding with AI capabilities specifically
 * for regulatory document authoring. It enables users to create, edit, and review
 * regulatory documents with AI-powered assistance for compliance checking,
 * content suggestions, and formatting guidance according to FDA/ICH standards.
 * 
 * Features:
 * - Embedded Microsoft Word editor
 * - AI compliance assistant for regulatory guidance
 * - Template selection for common regulatory documents
 * - Document structure analyzer for common issues
 * - Regulatory reference library integration
 * - Multi-tenant aware with organization-specific settings
 */
const AiPoweredWordEditor = ({
  documentId = null,
  tenantId = null,
  module = 'ectd', // ectd, ind, nda, or custom
  mode = 'edit', // edit, review, or collaborate
  initialContent = '',
  onSave = () => {},
  onError = () => {}
}) => {
  // State for component
  const [activeTab, setActiveTab] = useState('editor');
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [documentMetadata, setDocumentMetadata] = useState(null);
  const [complianceIssues, setComplianceIssues] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editorHeight, setEditorHeight] = useState('700px');
  const [authToken, setAuthToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Refs
  const editorRef = useRef(null);
  const aiAssistantRef = useRef(null);
  const { toast } = useToast();
  
  // Available templates for regulatory documents
  const regulatoryTemplates = [
    { id: 'ind-application', name: 'IND Application', category: 'ind' },
    { id: 'clinical-protocol', name: 'Clinical Trial Protocol', category: 'ind' },
    { id: 'investigator-brochure', name: 'Investigator Brochure', category: 'ind' },
    { id: 'cmc-section', name: 'Chemistry Manufacturing Controls', category: 'ectd' },
    { id: 'clinical-overview', name: 'Clinical Overview (Module 2.5)', category: 'ectd' },
    { id: 'nonclinical-overview', name: 'Nonclinical Overview (Module 2.4)', category: 'ectd' },
    { id: 'quality-overall-summary', name: 'Quality Overall Summary (Module 2.3)', category: 'ectd' },
    { id: 'csr', name: 'Clinical Study Report', category: 'csr' },
  ];
  
  // Regulatory reference libraries
  const regulatoryReferences = [
    { id: 'fda-guidance', name: 'FDA Guidance Documents', organization: 'FDA' },
    { id: 'ich-guidelines', name: 'ICH Guidelines', organization: 'ICH' },
    { id: 'ema-guidelines', name: 'EMA Guidelines', organization: 'EMA' },
    { id: 'pmda-guidelines', name: 'PMDA Guidelines', organization: 'PMDA' },
    { id: 'health-canada', name: 'Health Canada Guidance', organization: 'Health Canada' },
  ];
  
  // Mock compliance issues (in a real implementation, these would come from AI analysis)
  const mockComplianceIssues = [
    { 
      id: 'issue-1', 
      severity: 'high', 
      section: 'Introduction', 
      description: 'Missing required regulatory statement on GCP compliance',
      recommendation: 'Add standard GCP compliance statement as per ICH E6(R2) guidelines'
    },
    { 
      id: 'issue-2', 
      severity: 'medium', 
      section: 'Study Design', 
      description: 'Inadequate description of randomization procedures',
      recommendation: 'Expand on randomization methodology according to ICH E9 Statistical Principles'
    },
    { 
      id: 'issue-3', 
      severity: 'low', 
      section: 'Safety Reporting', 
      description: 'Outdated reference to AE reporting timeline',
      recommendation: 'Update to reflect current FDA requirements for expedited reporting of serious adverse events'
    },
  ];
  
  // Simulate authentication on component mount
  useEffect(() => {
    // In a real implementation, this would use an authentication flow
    // For now, we'll simulate a successful auth
    const simulateAuth = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock successful authentication
        setAuthToken('mock-auth-token-microsoft-365');
        
        setIsLoading(false);
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Failed to authenticate with Microsoft 365. Please try again.');
        setIsLoading(false);
        onError(err);
      }
    };
    
    simulateAuth();
    
    // Set up compliance issues (would normally come from an API)
    setComplianceIssues(mockComplianceIssues);
    
  }, []);
  
  // Adjust editor height based on window size
  useEffect(() => {
    const handleResize = () => {
      // Base height calculation on viewport height
      const newHeight = Math.max(500, window.innerHeight - 300) + 'px';
      setEditorHeight(newHeight);
    };
    
    // Initial calculation
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Handle AI assistant prompt submission
  const handleAiPromptSubmit = async () => {
    if (!aiPrompt.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Prompt",
        description: "Please enter a question or request for the AI Assistant.",
      });
      return;
    }
    
    try {
      setIsAiProcessing(true);
      
      // In a real implementation, this would call an OpenAI API
      // For now, we'll simulate a response
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a contextual response based on the prompt
      let response = '';
      
      if (aiPrompt.toLowerCase().includes('regulatory') || aiPrompt.toLowerCase().includes('compliance')) {
        response = `## Regulatory Compliance Guidelines\n\nBased on your document type, here are the key regulatory considerations:\n\n1. **FDA Requirements**:\n   - Ensure all safety data is presented according to MedDRA classification\n   - Include a clear risk-benefit analysis section\n   - Provide comprehensive adverse event reporting methodology\n\n2. **ICH Guidelines**:\n   - Follow ICH E3 for Clinical Study Report structure\n   - Ensure statistical methods comply with ICH E9\n   - Document quality control procedures as per ICH E6(R2)\n\nWould you like me to help you implement any of these specific requirements?`;
      } else if (aiPrompt.toLowerCase().includes('template') || aiPrompt.toLowerCase().includes('format')) {
        response = `## Recommended Document Structure\n\n**For IND Applications**, your document should follow this structure:\n\n1. **Cover Letter**\n2. **Form FDA 1571**\n3. **Table of Contents**\n4. **Introductory Statement**\n5. **General Investigational Plan**\n6. **Investigator's Brochure**\n7. **Clinical Protocol**\n8. **Chemistry, Manufacturing, and Controls Information**\n9. **Pharmacology and Toxicology Information**\n10. **Previous Human Experience**\n\nYou can access templates for each section through the Templates menu. Would you like me to help you with a specific section?`;
      } else if (aiPrompt.toLowerCase().includes('recommend') || aiPrompt.toLowerCase().includes('suggest')) {
        response = `## Recommendations for Improvement\n\nBased on my analysis of your current document draft, I recommend:\n\n1. **Strengthen the Introduction**:\n   - Add clear study objectives aligned with regulatory expectations\n   - Include a brief background on the investigational product\n\n2. **Enhance the Methods Section**:\n   - Provide more detail on inclusion/exclusion criteria rationale\n   - Clarify the statistical approach for primary endpoints\n\n3. **Improve Results Presentation**:\n   - Consider adding a summary table of key findings\n   - Include appropriate data visualizations for complex results\n\nWould you like me to provide specific wording examples for any of these sections?`;
      } else {
        response = `I understand you're working on a regulatory document. To provide the most helpful assistance, could you clarify what specific aspect you need help with?\n\nI can assist with:\n- Regulatory compliance requirements\n- Document structure and formatting\n- Content recommendations\n- Reference citations\n- Technical writing for specific sections\n\nJust let me know what you need, and I'll provide tailored guidance.`;
      }
      
      setAiResponse(response);
      
    } catch (err) {
      console.error('AI processing error:', err);
      toast({
        variant: "destructive",
        title: "AI Assistant Error",
        description: "Failed to get AI response. Please try again.",
      });
    } finally {
      setIsAiProcessing(false);
    }
  };
  
  // Handle template selection
  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    
    // In a real implementation, this would load the template content
    // For now, we'll just close the dialog and show a success message
    setShowTemplateDialog(false);
    
    toast({
      title: "Template Selected",
      description: `${regulatoryTemplates.find(t => t.id === templateId)?.name} template has been applied.`,
    });
  };
  
  // Handle document save
  const handleSaveDocument = () => {
    toast({
      title: "Document Saved",
      description: "Your document has been saved successfully.",
    });
    
    // Call the provided onSave callback
    onSave({
      id: documentId || 'new-document',
      lastSaved: new Date().toISOString(),
      status: 'draft'
    });
  };
  
  // Handle regulatory compliance check
  const handleComplianceCheck = async () => {
    try {
      toast({
        title: "Compliance Check",
        description: "Analyzing document for regulatory compliance...",
      });
      
      // In a real implementation, this would send the document content to an AI service
      // For now, we'll simulate a delay and then show the mock issues
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setComplianceIssues(mockComplianceIssues);
      
      // Switch to the compliance tab
      setActiveTab('compliance');
      
      toast({
        title: "Compliance Check Complete",
        description: `${mockComplianceIssues.length} issues found. See Compliance tab for details.`,
      });
      
    } catch (err) {
      console.error('Compliance check error:', err);
      toast({
        variant: "destructive",
        title: "Compliance Check Failed",
        description: "Unable to complete compliance analysis. Please try again.",
      });
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-10">
          <div className="text-center">
            <Spinner size="lg" className="mb-4" />
            <p>Initializing Microsoft Word and AI services...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="flex flex-col space-y-4">
      {/* Main toolbar */}
      <Card className="w-full">
        <div className="p-3 flex items-center justify-between border-b">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="font-medium">eCTD Co-Author</span>
            <Badge variant="outline" className="ml-2">
              {module.toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Templates
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Regulatory Document Templates</DialogTitle>
                  <DialogDescription>
                    Select a template to start with pre-structured content following regulatory guidelines.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4 space-y-4">
                  <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {regulatoryTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedTemplate && (
                    <div className="p-4 border rounded-md bg-gray-50">
                      <h4 className="font-medium mb-2">
                        {regulatoryTemplates.find(t => t.id === selectedTemplate)?.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        This template provides a structured framework following regulatory guidelines for {regulatoryTemplates.find(t => t.id === selectedTemplate)?.category.toUpperCase()} submissions.
                      </p>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleTemplateSelect(selectedTemplate)}
                    disabled={!selectedTemplate}
                  >
                    Use Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="sm" onClick={handleComplianceCheck}>
              <FileCheck className="mr-2 h-4 w-4" />
              Compliance Check
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => setIsAiAssistantOpen(true)}>
              <Bot className="mr-2 h-4 w-4" />
              AI Assistant
            </Button>
            
            <Button size="sm" onClick={handleSaveDocument}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Main content area with tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">
            <Pencil className="mr-2 h-4 w-4" />
            Document Editor
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Compliance Review
          </TabsTrigger>
          <TabsTrigger value="references">
            <BookOpen className="mr-2 h-4 w-4" />
            Regulatory References
          </TabsTrigger>
        </TabsList>
        
        {/* Editor Tab */}
        <TabsContent value="editor" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-0">
              <MicrosoftWordEmbed
                ref={editorRef}
                documentId={documentId}
                mode={mode}
                height={editorHeight}
                width="100%"
                initialContent={initialContent}
                authToken={authToken}
                tenantId={tenantId}
                onSave={handleSaveDocument}
                onError={(err) => {
                  setError(`Microsoft Word Error: ${err.message}`);
                  onError(err);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Compliance Tab */}
        <TabsContent value="compliance" className="mt-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileCheck className="mr-2 h-5 w-5" />
                Regulatory Compliance Analysis
              </CardTitle>
              <CardDescription>
                AI-powered analysis of your document against FDA, ICH, and other regulatory guidelines
              </CardDescription>
            </CardHeader>
            <CardContent>
              {complianceIssues.length > 0 ? (
                <div className="space-y-4">
                  {complianceIssues.map(issue => (
                    <div key={issue.id} className="border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Badge 
                          variant={
                            issue.severity === 'high' ? 'destructive' : 
                            issue.severity === 'medium' ? 'default' : 
                            'outline'
                          }
                          className="mr-2"
                        >
                          {issue.severity.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium">Section: {issue.section}</span>
                      </div>
                      
                      <p className="text-sm mb-2">{issue.description}</p>
                      
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center text-sm font-medium text-green-600 mb-1">
                          <Check className="mr-1 h-4 w-4" />
                          Recommendation
                        </div>
                        <p className="text-sm">{issue.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <FileCheck className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-1">No compliance issues found</h3>
                  <p className="text-gray-500">
                    Your document appears to meet regulatory standards. You can run another check after making changes.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={handleComplianceCheck}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Re-run Compliance Check
              </Button>
              <Button onClick={() => setActiveTab('editor')}>
                <Pencil className="mr-2 h-4 w-4" />
                Return to Editor
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* References Tab */}
        <TabsContent value="references" className="mt-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Regulatory Reference Library
              </CardTitle>
              <CardDescription>
                Access official regulatory guidelines and reference materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regulatoryReferences.map(reference => (
                  <div key={reference.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{reference.name}</h4>
                        <p className="text-sm text-gray-500">
                          {reference.organization}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Access
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* AI Assistant Dialog */}
      <Dialog open={isAiAssistantOpen} onOpenChange={setIsAiAssistantOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Bot className="mr-2 h-5 w-5" />
              Regulatory AI Assistant
            </DialogTitle>
            <DialogDescription>
              Get AI-powered guidance on regulatory compliance, document structure, and content recommendations
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4" ref={aiAssistantRef}>
            <div className="border rounded-lg p-4 bg-gray-50">
              <Input
                placeholder="Ask for regulatory guidance, content suggestions, or compliance help..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="mb-2"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleAiPromptSubmit}
                  disabled={isAiProcessing || !aiPrompt.trim()}
                >
                  {isAiProcessing ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Get AI Guidance
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {aiResponse && (
              <div className="border rounded-lg p-4">
                <div className="prose prose-sm max-w-none">
                  {/* Display formatted response - in a real implementation, 
                      you would use a markdown renderer like react-markdown */}
                  <div dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/##\s(.*?)$/gm, '<h3>$1</h3>') }} />
                </div>
              </div>
            )}
            
            {/* Quick prompts */}
            {!aiResponse && (
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">Suggested prompts:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="justify-start" onClick={() => setAiPrompt("What regulatory guidelines apply to this document type?")}>
                    What regulatory guidelines apply to this document type?
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start" onClick={() => setAiPrompt("Suggest a structure for this regulatory document")}>
                    Suggest a structure for this regulatory document
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start" onClick={() => setAiPrompt("Recommend improvements for regulatory compliance")}>
                    Recommend improvements for regulatory compliance
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start" onClick={() => setAiPrompt("Help me format this section according to ICH guidelines")}>
                    Help me format this section according to ICH guidelines
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAiAssistantOpen(false)}>
              Close
            </Button>
            {aiResponse && (
              <Button onClick={() => {
                // In a real implementation, this would insert the AI suggestion into the document
                toast({
                  title: "Content Applied",
                  description: "AI suggested content has been applied to your document.",
                });
                setIsAiAssistantOpen(false);
              }}>
                <Check className="mr-2 h-4 w-4" />
                Apply to Document
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AiPoweredWordEditor;