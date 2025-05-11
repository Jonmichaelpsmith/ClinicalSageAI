import React, { useState, useEffect, useRef } from 'react';
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';

import { 
  Bold as BoldIcon, 
  Italic as ItalicIcon, 
  Underline as UnderlineIcon, 
  List as ListIcon, 
  FileText as FileTextIcon, 
  CheckCircle as CheckCircleIcon,
  AlignLeft as AlignLeftIcon,
  AlignCenter as AlignCenterIcon,
  AlignRight as AlignRightIcon,
  Table as TableIcon,
  Image as ImageIcon,
  // ParagraphIcon does not exist, remove it
  CheckSquare as CheckSquareIcon,
  AlertTriangle as AlertTriangleIcon,
  Save as SaveIcon,
  RefreshCw as RefreshCwIcon,
  BookOpen as BookOpenIcon,
  FileSearch as FileSearchIcon,
  Upload,
  Download,
  Share,
  Clock
} from 'lucide-react';

// Import Microsoft Office services
import { initializeOfficeJs, isOfficeInitialized } from '../../services/officeJsService';
import * as OfficeService from '../../services/officeJsService';
import * as MsOfficeVaultBridge from '../../services/msOfficeVaultBridge';
import * as MicrosoftAuthService from '../../services/microsoftAuthService';
import * as SharePointService from '../../services/sharePointService';

/**
 * AI-Powered Microsoft Word Editor Component
 * 
 * This component embeds Microsoft Word Online/Office 365 with AI compliance assistance
 * for regulatory document authoring and editing.
 */
const AiPoweredWordEditor = ({ 
  documentId,
  documentUrl,
  documentName = "New Document",
  ectdSection = "",
  readOnly = false,
  onSave = () => {}
}) => {
  // State for Word frame
  const [wordFrameLoaded, setWordFrameLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isWordAvailable, setIsWordAvailable] = useState(false);
  const [checkoutInfo, setCheckoutInfo] = useState(null);
  
  // State for AI assistance
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [complianceStatus, setComplianceStatus] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  
  // UI state
  const [activeTab, setActiveTab] = useState('document');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templates, setTemplates] = useState([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versions, setVersions] = useState([]);
  
  // Refs
  const wordContainerRef = useRef(null);
  const officeSdkLoaded = useRef(false);
  
  // Load Microsoft Office SDK and initialize
  useEffect(() => {
    async function initializeOffice() {
      try {
        if (!officeSdkLoaded.current) {
          // Add Office.js script to the page if not already loaded
          if (!document.getElementById('office-js-script')) {
            const script = document.createElement('script');
            script.id = 'office-js-script';
            script.src = 'https://appsforoffice.microsoft.com/lib/1/hosted/office.js';
            script.async = true;
            script.onload = async () => {
              const isInitialized = await initializeOfficeJs();
              setIsWordAvailable(isInitialized);
              officeSdkLoaded.current = true;
            };
            document.head.appendChild(script);
          } else {
            const isInitialized = await initializeOfficeJs();
            setIsWordAvailable(isInitialized);
            officeSdkLoaded.current = true;
          }
        }
      } catch (error) {
        console.error('Error initializing Office.js:', error);
        toast({
          title: 'Office Integration Error',
          description: 'Failed to initialize Office.js. Using embedded Word Online instead.',
          variant: 'destructive'
        });
        
        // Fall back to embedded Word Online
        loadWordOnline();
      }
    }
    
    initializeOffice();
    
    // Load templates
    fetchTemplates();
    
    // If we have a document ID, load version history
    if (documentId) {
      fetchVersionHistory(documentId);
    }
    
    return () => {
      // Cleanup function
      if (checkoutInfo && checkoutInfo.documentId) {
        // Auto-save document on component unmount if checked out
        handleSaveDocument();
      }
    };
  }, [documentId]);
  
  // Use effect to check if document is already loaded and load it if needed
  useEffect(() => {
    if (documentUrl && wordContainerRef.current && !wordFrameLoaded) {
      loadWordOnline();
    }
    
    // Cleanup function to safely remove the iframe
    return () => {
      if (wordContainerRef.current) {
        // Use a safer approach to clear the container
        wordContainerRef.current.innerHTML = '';
      }
    };
  }, [documentUrl]);
  
  /**
   * Load Word Online in an iframe
   */
  const loadWordOnline = () => {
    if (!documentUrl || !wordContainerRef.current) return;
    
    try {
      // Clear existing content safely
      while (wordContainerRef.current.firstChild) {
        wordContainerRef.current.removeChild(wordContainerRef.current.firstChild);
      }
      
      // Create iframe for Word Online
      const iframe = document.createElement('iframe');
      iframe.src = documentUrl;
      iframe.style.width = '100%';
      iframe.style.height = '600px';
      iframe.style.border = 'none';
      iframe.onload = () => {
        setWordFrameLoaded(true);
        console.log('Word Online frame loaded');
      };
      
      // Add iframe to container
      wordContainerRef.current.appendChild(iframe);
    } catch (error) {
      console.error('Error loading Word Online:', error);
      toast({
        title: 'Error Loading Document',
        description: 'There was a problem loading the document viewer.',
        variant: 'destructive'
      });
    }
  };
  
  /**
   * Checkout document for editing
   */
  const handleCheckoutDocument = async () => {
    try {
      if (!documentId) {
        toast({
          title: 'Document Error',
          description: 'No document ID provided for checkout',
          variant: 'destructive'
        });
        return;
      }
      
      // Checkout document from Vault to Word
      const checkout = await MsOfficeVaultBridge.checkoutDocumentToOffice({
        documentId,
        checkoutLocation: 'word'
      });
      
      setCheckoutInfo(checkout);
      setIsEditing(true);
      
      // Load the document in Word Online
      if (checkout.documentLink) {
        // Update the iframe with the new document URL
        wordContainerRef.current.innerHTML = '';
        
        const iframe = document.createElement('iframe');
        iframe.src = checkout.documentLink;
        iframe.style.width = '100%';
        iframe.style.height = '600px';
        iframe.style.border = 'none';
        iframe.onload = () => {
          setWordFrameLoaded(true);
          console.log('Word Online checkout frame loaded');
        };
        
        // Add iframe to container
        wordContainerRef.current.appendChild(iframe);
        
        toast({
          title: 'Document Checked Out',
          description: 'You can now edit the document in Word',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error checking out document:', error);
      toast({
        title: 'Checkout Error',
        description: error.message || 'Failed to check out document',
        variant: 'destructive'
      });
    }
  };
  
  /**
   * Save document back to Vault
   */
  const handleSaveDocument = async () => {
    try {
      if (!checkoutInfo || !checkoutInfo.documentId || !checkoutInfo.checkoutId) {
        toast({
          title: 'Save Error',
          description: 'Document is not checked out',
          variant: 'destructive'
        });
        return;
      }
      
      // Show saving toast
      const savingToast = toast({
        title: 'Saving Document',
        description: 'Please wait while the document is saved...',
        variant: 'default'
      });
      
      // Check in document from Word to Vault
      const checkin = await MsOfficeVaultBridge.checkinDocumentFromOffice({
        documentId: checkoutInfo.documentId,
        checkoutId: checkoutInfo.checkoutId,
        comment: 'Saved from Word Editor',
        source: 'word'
      });
      
      // Clear checkout info
      setCheckoutInfo(null);
      setIsEditing(false);
      
      // Refresh version history
      fetchVersionHistory(documentId);
      
      // Notify parent component
      onSave(checkin);
      
      // Show success toast
      toast({
        title: 'Document Saved',
        description: `Document saved successfully (Version ${checkin.versionId})`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: 'Save Error',
        description: error.message || 'Failed to save document',
        variant: 'destructive'
      });
    }
  };
  
  /**
   * Run compliance check on the document
   */
  const handleComplianceCheck = async () => {
    try {
      setIsAnalyzing(true);
      
      // Get current document content
      let documentContent;
      
      if (isWordAvailable && window.Word) {
        // Get content directly from Word
        documentContent = await OfficeService.getWordDocumentContent();
      } else {
        // For Word Online, we need to get content from the server
        // This is a placeholder - in a real implementation, you would use the
        // Office 365 API to get the document content
        documentContent = "Document content placeholder";
      }
      
      // Run compliance check
      const complianceResults = await MsOfficeVaultBridge.performComplianceCheck({
        documentId,
        ectdSection,
        content: documentContent
      });
      
      // Update compliance status
      setComplianceStatus(complianceResults);
      
      // Generate AI suggestions based on compliance issues
      if (complianceResults.issues && complianceResults.issues.length > 0) {
        setAiSuggestions(complianceResults.recommendations || []);
      } else {
        setAiSuggestions([
          'Document complies with regulatory requirements',
          'No issues found'
        ]);
      }
      
      // Switch to AI tab
      setActiveTab('ai');
      
      toast({
        title: 'Compliance Check Complete',
        description: `Compliance score: ${complianceResults.score || 'N/A'}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error performing compliance check:', error);
      toast({
        title: 'Compliance Check Error',
        description: error.message || 'Failed to perform compliance check',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  /**
   * Apply AI suggestion to document
   */
  const handleApplySuggestion = async (suggestion) => {
    try {
      if (!isWordAvailable) {
        toast({
          title: 'Word API Unavailable',
          description: 'Cannot apply suggestion in Word Online. Please copy and paste manually.',
          variant: 'destructive'
        });
        return;
      }
      
      // Insert suggestion at current cursor position
      await OfficeService.insertParagraphInWord(suggestion);
      
      toast({
        title: 'Suggestion Applied',
        description: 'AI suggestion has been applied to the document',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error applying suggestion:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to apply suggestion',
        variant: 'destructive'
      });
    }
  };
  
  /**
   * Submit custom AI prompt
   */
  const handleSubmitPrompt = async () => {
    try {
      if (!aiPrompt) return;
      
      setIsAnalyzing(true);
      
      // In a real implementation, this would call your AI service
      // For now, simulate a response
      setTimeout(() => {
        const newSuggestions = [
          `Based on your question: "${aiPrompt}"`,
          "Here is a suggested paragraph for your document...",
          "You should consider adding references to the following regulatory guidelines..."
        ];
        
        setAiSuggestions(newSuggestions);
        setAiPrompt('');
        setIsAnalyzing(false);
      }, 1500);
    } catch (error) {
      console.error('Error processing AI prompt:', error);
      toast({
        title: 'AI Error',
        description: error.message || 'Failed to process AI prompt',
        variant: 'destructive'
      });
      setIsAnalyzing(false);
    }
  };
  
  /**
   * Apply formatting to selected text
   */
  const handleFormatText = async (formatType) => {
    try {
      if (!isWordAvailable) {
        toast({
          title: 'Word API Unavailable',
          description: 'Cannot apply formatting in Word Online. Please use the built-in formatting tools.',
          variant: 'destructive'
        });
        return;
      }
      
      switch (formatType) {
        case 'bold':
          await OfficeService.applyBoldInWord(true);
          break;
        case 'italic':
          await OfficeService.applyItalicInWord(true);
          break;
        case 'underline':
          await OfficeService.applyUnderlineInWord(true);
          break;
        case 'heading1':
          // Get the selected text first
          const selectedText = await OfficeService.getWordSelectionContent();
          await OfficeService.insertHeadingInWord(selectedText, 1);
          break;
        case 'heading2':
          const selectedText2 = await OfficeService.getWordSelectionContent();
          await OfficeService.insertHeadingInWord(selectedText2, 2);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error applying formatting:', error);
      toast({
        title: 'Formatting Error',
        description: error.message || 'Failed to apply formatting',
        variant: 'destructive'
      });
    }
  };
  
  /**
   * Fetch available templates
   */
  const fetchTemplates = async () => {
    try {
      // In a real implementation, this would call your template API
      // For now, use placeholder data
      setTemplates([
        { id: 'template-1', name: 'Clinical Overview (2.5)', ectdSection: 'm2.5' },
        { id: 'template-2', name: 'Clinical Summary (2.7)', ectdSection: 'm2.7' },
        { id: 'template-3', name: 'Nonclinical Overview (2.4)', ectdSection: 'm2.4' },
        { id: 'template-4', name: 'Quality Overall Summary (2.3)', ectdSection: 'm2.3' }
      ]);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };
  
  /**
   * Apply selected template to document
   */
  const handleApplyTemplate = async () => {
    try {
      if (!selectedTemplate) return;
      
      // Close template dialog
      setShowTemplateDialog(false);
      
      // Apply template
      const result = await MsOfficeVaultBridge.applyRegulatoryTemplate({
        templateId: selectedTemplate,
        ectdSection: templates.find(t => t.id === selectedTemplate)?.ectdSection || ''
      });
      
      toast({
        title: 'Template Applied',
        description: `Template "${result.templateName}" has been applied`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error applying template:', error);
      toast({
        title: 'Template Error',
        description: error.message || 'Failed to apply template',
        variant: 'destructive'
      });
    }
  };
  
  /**
   * Fetch version history for a document
   */
  const fetchVersionHistory = async (docId) => {
    try {
      if (!docId) return;
      
      const history = await MsOfficeVaultBridge.getDocumentVersionHistory(docId);
      setVersions(history);
    } catch (error) {
      console.error('Error fetching version history:', error);
    }
  };
  
  /**
   * Compare document versions
   */
  const handleCompareVersions = async (version1, version2) => {
    try {
      if (!documentId || !version1 || !version2) {
        toast({
          title: 'Comparison Error',
          description: 'Please select two versions to compare',
          variant: 'destructive'
        });
        return;
      }
      
      const comparison = await MsOfficeVaultBridge.compareDocumentVersions({
        documentId,
        version1,
        version2
      });
      
      // In a real implementation, this would open a comparison view
      // For now, just show a toast
      toast({
        title: 'Comparison Complete',
        description: `Found ${comparison.differences} differences between versions`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error comparing versions:', error);
      toast({
        title: 'Comparison Error',
        description: error.message || 'Failed to compare versions',
        variant: 'destructive'
      });
    }
  };
  
  // Render document editor UI
  return (
    <div className="flex flex-col w-full h-full">
      {/* Editor toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-card border-b">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCheckoutDocument}
          disabled={isEditing || !documentId}
        >
          <FileTextIcon className="w-4 h-4 mr-2" />
          Edit
        </Button>
        
        <Button 
          variant={isEditing ? "default" : "outline"} 
          size="sm" 
          onClick={handleSaveDocument}
          disabled={!isEditing}
        >
          <SaveIcon className="w-4 h-4 mr-2" />
          Save
        </Button>
        
        <div className="border-r h-6 mx-2"></div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleFormatText('bold')}
                disabled={!isEditing || !isWordAvailable}
              >
                <BoldIcon className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleFormatText('italic')}
                disabled={!isEditing || !isWordAvailable}
              >
                <ItalicIcon className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleFormatText('underline')}
                disabled={!isEditing || !isWordAvailable}
              >
                <UnderlineIcon className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="border-r h-6 mx-2"></div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleFormatText('heading1')}
                disabled={!isEditing || !isWordAvailable}
              >
                <span className="font-bold">H1</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 1</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleFormatText('heading2')}
                disabled={!isEditing || !isWordAvailable}
              >
                <span className="font-bold">H2</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 2</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="border-r h-6 mx-2"></div>
        
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              disabled={!isEditing}
            >
              <BookOpenIcon className="w-4 h-4 mr-2" />
              Templates
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply Regulatory Template</DialogTitle>
              <DialogDescription>
                Choose a template to apply to your document. This will replace the current content.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Label htmlFor="template-select">Template</Label>
              <Select 
                value={selectedTemplate} 
                onValueChange={setSelectedTemplate}
              >
                <SelectTrigger id="template-select">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleApplyTemplate} disabled={!selectedTemplate}>
                Apply Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowVersionHistory(!showVersionHistory)}
          disabled={!documentId}
        >
          <Clock className="w-4 h-4 mr-2" />
          History
        </Button>
        
        <div className="flex-grow"></div>
        
        <Button 
          variant="default" 
          size="sm"
          onClick={handleComplianceCheck}
          disabled={!documentId || isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Check Compliance
            </>
          )}
        </Button>
      </div>
      
      {/* Editor content */}
      <div className="flex flex-grow">
        {/* Main content area */}
        <div className="flex-grow">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="document">Document</TabsTrigger>
              <TabsTrigger value="ai">AI Assistance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="document" className="flex-grow">
              <div className="relative">
                {/* Word container */}
                <div 
                  ref={wordContainerRef} 
                  className="w-full h-[600px] border rounded-md bg-white"
                >
                  {!wordFrameLoaded && !documentUrl && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <FileTextIcon className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No Document Loaded</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Select or upload a document to get started
                      </p>
                    </div>
                  )}
                  
                  {!wordFrameLoaded && documentUrl && (
                    <div className="p-4">
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-[400px] w-full rounded-md" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ai" className="flex-grow flex flex-col">
              <Card className="flex-grow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2 text-primary" />
                    AI Compliance Assistant
                  </CardTitle>
                  <CardDescription>
                    AI-powered recommendations to ensure regulatory compliance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Compliance status */}
                  {complianceStatus && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Compliance Score</h4>
                        <Badge variant={complianceStatus.score > 80 ? "default" : "destructive"}>
                          {complianceStatus.score || 'N/A'}/100
                        </Badge>
                      </div>
                      
                      {complianceStatus.issues && complianceStatus.issues.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Issues Detected</h4>
                          <ul className="space-y-2">
                            {complianceStatus.issues.map((issue, idx) => (
                              <li key={idx} className="flex items-start">
                                <AlertTriangleIcon className="w-4 h-4 mr-2 text-amber-500 mt-0.5" />
                                <div>
                                  <span className="font-medium">{issue.section}: </span>
                                  <span>{issue.description}</span>
                                  <Badge variant="outline" className="ml-2">
                                    {issue.severity}
                                  </Badge>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* AI suggestions */}
                  <div>
                    <h4 className="font-medium mb-2">AI Recommendations</h4>
                    {aiSuggestions.length > 0 ? (
                      <ul className="space-y-2">
                        {aiSuggestions.map((suggestion, idx) => (
                          <li key={idx} className="flex items-start p-2 border rounded-md">
                            <div className="flex-grow">
                              <p>{suggestion}</p>
                            </div>
                            {isEditing && isWordAvailable && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleApplySuggestion(suggestion)}
                              >
                                Apply
                              </Button>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">
                        Run a compliance check to get AI recommendations
                      </p>
                    )}
                  </div>
                  
                  {/* AI prompt input */}
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Ask AI Assistant</h4>
                    <div className="flex space-x-2">
                      <Textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Ask a question about regulatory requirements..."
                        className="flex-grow"
                      />
                      <Button 
                        onClick={handleSubmitPrompt}
                        disabled={!aiPrompt || isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <RefreshCwIcon className="w-4 h-4 animate-spin" />
                        ) : (
                          "Submit"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Version history sidebar (collapsible) */}
        {showVersionHistory && (
          <div className="w-80 border-l p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Version History</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowVersionHistory(false)}
              >
                &times;
              </Button>
            </div>
            
            {versions.length > 0 ? (
              <div className="space-y-2">
                {versions.map((version, idx) => (
                  <div key={idx} className="border rounded-md p-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">v{version.id}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(version.lastModifiedDateTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm mt-1">
                      <span className="font-medium">By: </span>
                      {version.lastModifiedBy?.user?.displayName || 'Unknown'}
                    </div>
                    <div className="flex mt-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          // In a real implementation, this would open the version
                          // For now, just show a toast
                          toast({
                            title: 'Version Selected',
                            description: `Viewing version ${version.id}`,
                            variant: 'default'
                          });
                        }}
                      >
                        View
                      </Button>
                      {idx < versions.length - 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCompareVersions(version.id, versions[idx + 1].id)}
                        >
                          Compare
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No version history available</p>
            )}
          </div>
        )}
      </div>
      
      {/* Status bar */}
      <div className="flex items-center justify-between p-2 bg-muted text-xs">
        <div className="flex items-center space-x-2">
          <span>{documentName || 'Untitled Document'}</span>
          {ectdSection && (
            <Badge variant="outline" className="text-xs">
              {ectdSection}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {isEditing && checkoutInfo && (
            <span className="text-primary">
              Checked out until {new Date(checkoutInfo.expiresAt).toLocaleString()}
            </span>
          )}
          
          <span>
            {isWordAvailable ? 'Word API Available' : 'Using Word Online'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AiPoweredWordEditor;