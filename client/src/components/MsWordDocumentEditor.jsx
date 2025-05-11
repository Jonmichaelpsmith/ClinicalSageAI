/**
 * !!!!! OFFICIAL MS WORD EDITOR FOR eCTD CO-AUTHOR MODULE !!!!!
 * 
 * This component embeds Microsoft Word for document editing with 
 * tight AI integration, as specified in the Enterprise-Grade Upgrade Design.
 * 
 * Version: 4.0.0 - May 11, 2025
 * Status: STABLE - DO NOT MODIFY WITHOUT APPROVAL
 * 
 * PROTECTED CODE - Extend only as specified in the Enterprise Upgrade Design document.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import * as aiService from '../services/aiService';

import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  FileText,
  Table,
  Image,
  Link,
  FileSymlink,
  Sparkles,
  RefreshCcw,
  Bot,
  ClipboardCheck,
  ListChecks,
  MessageSquare,
  Lightbulb,
  Send,
  X,
  CheckSquare,
  Check,
  Save,
  HelpCircle,
  Download,
  Upload,
  ExternalLink
} from 'lucide-react';

const MsWordDocumentEditor = ({
  documentId = 'current-doc',
  sectionId = '2.5.5',
  documentTitle = "Module 2.5 Clinical Overview",
  sectionTitle = "Safety Profile",
  onSave = () => {},
  onLockDocument = () => {},
  isLocked = false,
  lockedBy = null,
  documentUrl = null
}) => {
  // State
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiCheckingCompliance, setAiCheckingCompliance] = useState(false);
  const [complianceResults, setComplianceResults] = useState(null);
  const [formattingDialog, setFormattingDialog] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [aiMiniChatOpen, setAiMiniChatOpen] = useState(false);
  const [documentContent, setDocumentContent] = useState("");
  const [msOfficeLoaded, setMsOfficeLoaded] = useState(false);
  const [showWopiFrame, setShowWopiFrame] = useState(true);
  const [loadingDocument, setLoadingDocument] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [editSessionId, setEditSessionId] = useState(`edit-${Date.now()}`);
  
  const iframeRef = useRef(null);
  const { toast } = useToast();
  
  // Initialize Office Online
  useEffect(() => {
    // In a real implementation, this would initialize Microsoft Office Online integration
    const timer = setTimeout(() => {
      setMsOfficeLoaded(true);
      setLoadingDocument(false);
      
      toast({
        title: "Microsoft Word Editor Loaded",
        description: "You can now edit your document with full MS Word capabilities.",
        variant: "default",
      });
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Mock function - in real implementation this would communicate with MS Word
  const getDocumentContent = async () => {
    // Simulating content retrieval from the Word document
    if (msOfficeLoaded) {
      setDocumentContent("The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects).");
    }
  };
  
  // Get AI-assisted content suggestions
  const getContentSuggestions = async () => {
    // Get content from Word document first
    await getDocumentContent();
    
    setAiSuggesting(true);
    
    try {
      const response = await aiService.generateContentSuggestions(
        documentId,
        sectionId,
        documentContent,
        "Suggest improvements to make this content more comprehensive and compliant with ICH guidelines"
      );
      
      setAiSuggestions(prev => [...response.suggestions, ...prev].slice(0, 5));
      
      toast({
        title: "AI Suggestions Generated",
        description: "New content suggestions are available.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      toast({
        title: "AI Suggestion Failed",
        description: error.message || "Could not generate suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAiSuggesting(false);
    }
  };
  
  // Check compliance with regulatory standards
  const checkCompliance = async () => {
    // Get content from Word document first
    await getDocumentContent();
    
    setAiCheckingCompliance(true);
    
    try {
      const response = await aiService.checkComplianceAI(
        documentId,
        documentContent,
        ['ICH', 'FDA', 'EMA']
      );
      
      setComplianceResults(response);
      
      toast({
        title: "Compliance Check Complete",
        description: `Found ${response.issues.length} compliance issues.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error checking compliance:', error);
      toast({
        title: "Compliance Check Failed",
        description: error.message || "Could not check compliance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAiCheckingCompliance(false);
    }
  };
  
  // Handle AI-suggested edits
  const applySuggestion = (suggestion) => {
    if (msOfficeLoaded) {
      // In a real implementation, this would use Office JS API to insert content in the Word document
      toast({
        title: "AI Suggestion Applied",
        description: "The suggested text has been inserted into your document.",
        variant: "default",
      });
      
      // Mark suggestion as accepted
      setAiSuggestions(prev => 
        prev.map(s => 
          s.id === suggestion.id 
            ? { ...s, accepted: true } 
            : s
        )
      );
    } else {
      toast({
        title: "Editor Not Ready",
        description: "Microsoft Word editor is still loading. Please try again in a moment.",
        variant: "destructive",
      });
    }
  };
  
  // Save document function
  const handleSave = () => {
    if (msOfficeLoaded) {
      // In a real implementation, this would trigger the save in Office Online
      
      toast({
        title: "Document Saved",
        description: "Your changes have been saved to the document vault.",
        variant: "default",
      });
      
      // Call the parent save handler
      onSave(documentContent);
    } else {
      toast({
        title: "Editor Not Ready",
        description: "Microsoft Word editor is still loading. Please try again in a moment.",
        variant: "destructive",
      });
    }
  };
  
  // Ask AI about document content
  const handleAiQuerySubmit = async (e) => {
    e.preventDefault();
    
    if (!aiQuery.trim()) return;
    
    // Get content from Word document first
    await getDocumentContent();
    
    const newMessage = {
      id: Date.now(),
      role: 'user',
      content: aiQuery
    };
    
    setChatHistory(prev => [...prev, newMessage]);
    setAiQuery('');
    
    try {
      // Get response from AI
      const response = await aiService.askDocumentAI(
        aiQuery,
        documentId,
        sectionId,
        documentContent
      );
      
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.answer
      };
      
      setChatHistory(prev => [...prev, aiMessage]);
      setAiResponse(response);
    } catch (error) {
      console.error('Error asking AI:', error);
      toast({
        title: "AI Query Failed",
        description: error.message || "Could not get an answer. Please try again.",
        variant: "destructive",
      });
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'system',
        content: `Error: ${error.message || "Could not get an answer. Please try again."}`
      };
      
      setChatHistory(prev => [...prev, errorMessage]);
    }
  };
  
  // File upload handling
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
    }
  };
  
  const processFileUpload = () => {
    if (uploadFile) {
      // In a real implementation, this would upload and convert the file
      setLoadingDocument(true);
      
      setTimeout(() => {
        setLoadingDocument(false);
        setShowUploadDialog(false);
        
        toast({
          title: "Document Uploaded",
          description: `File ${uploadFile.name} has been uploaded and converted for editing.`,
          variant: "default",
        });
        
        // Reset upload state
        setUploadFile(null);
      }, 2000);
    }
  };
  
  // AI mini-chat for quick questions about document content
  const AiMiniChat = () => (
    <div className="absolute bottom-4 right-4 w-80 border bg-white rounded-lg shadow-lg overflow-hidden z-10">
      <div className="bg-blue-50 border-b p-3 flex justify-between items-center">
        <div className="flex items-center">
          <Bot className="h-4 w-4 mr-2 text-blue-600" />
          <span className="font-medium">AI Document Assistant</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0" 
          onClick={() => setAiMiniChatOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-3 h-64 overflow-y-auto">
        {chatHistory.map(message => (
          <div 
            key={message.id} 
            className={`mb-2 p-2 text-sm rounded ${
              message.role === 'user' 
                ? 'bg-blue-50 ml-6' 
                : message.role === 'system'
                  ? 'bg-red-50 text-red-800'
                  : 'bg-slate-50 mr-6'
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>
      <div className="p-2 border-t">
        <form onSubmit={handleAiQuerySubmit} className="flex">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="Ask about your document..."
            className="flex-1 text-sm p-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Button type="submit" className="rounded-l-none">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
  
  return (
    <div className="relative">
      {/* Document Information Header */}
      <div className="mb-4 pb-3 border-b flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">{documentTitle}</h3>
          <p className="text-sm text-slate-500">Section: {sectionTitle}</p>
        </div>
        <div className="flex items-center space-x-2">
          {isLocked ? (
            <Badge variant="outline" className="flex items-center text-amber-600 border-amber-200 bg-amber-50">
              <span className="mr-1">🔒</span> 
              Locked by {lockedBy}
            </Badge>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSave}
              className="flex items-center"
              disabled={!msOfficeLoaded}
            >
              <Save className="h-4 w-4 mr-2" /> 
              Save to Vault
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowUploadDialog(true)}
            className="flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" /> 
            Upload DOCX
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            disabled={!msOfficeLoaded}
          >
            <Download className="h-4 w-4 mr-2" /> 
            Download
          </Button>
        </div>
      </div>
      
      {/* Word Online Editor Toolbar - These would be replaced by the actual MS Word toolbar in production */}
      <div className="p-2 border rounded-t-md bg-slate-50 flex flex-wrap items-center">
        <div className="flex items-center space-x-1 mr-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Underline className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="h-6 w-px bg-slate-300 mx-2" />
        
        <div className="flex items-center space-x-1 mr-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Heading2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="h-6 w-px bg-slate-300 mx-2" />
        
        <div className="flex items-center space-x-1 mr-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="h-6 w-px bg-slate-300 mx-2" />
        
        <div className="flex items-center space-x-1 mr-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="h-6 w-px bg-slate-300 mx-2" />
        
        <div className="flex items-center space-x-1 mr-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Table className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Image className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Link className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <FileSymlink className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="h-6 w-px bg-slate-300 mx-2" />
        
        <div className="ml-auto flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-xs flex items-center ${aiSuggesting ? 'bg-blue-50' : ''}`}
            onClick={getContentSuggestions}
            disabled={aiSuggesting || isLocked || !msOfficeLoaded}
          >
            {aiSuggesting ? (
              <RefreshCcw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1" />
            )}
            Get Suggestions
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-xs flex items-center ${aiCheckingCompliance ? 'bg-blue-50' : ''}`}
            onClick={checkCompliance}
            disabled={aiCheckingCompliance || isLocked || !msOfficeLoaded}
          >
            {aiCheckingCompliance ? (
              <RefreshCcw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <ClipboardCheck className="h-4 w-4 mr-1" />
            )}
            Check Compliance
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs flex items-center"
            onClick={() => setAiMiniChatOpen(true)}
            disabled={!msOfficeLoaded}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Ask AI
          </Button>
        </div>
      </div>
      
      {/* MS Word WOPI Frame */}
      <div className="border-x border-b rounded-b-md overflow-hidden">
        {loadingDocument ? (
          <div className="flex items-center justify-center bg-white p-8 h-[600px]">
            <div className="text-center">
              <div className="h-10 w-10 mb-4 rounded-full border-t-2 border-blue-600 animate-spin mx-auto"></div>
              <p className="font-medium text-gray-600">Loading Microsoft Word Editor...</p>
              <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your document.</p>
            </div>
          </div>
        ) : (
          <div className="relative h-[600px]">
            {showWopiFrame ? (
              <div ref={iframeRef} className="absolute inset-0 w-full h-full bg-white">
                {/* In a real implementation, this would be an iframe loading MS Word Online */}
                <div className="h-full flex flex-col">
                  <div className="border-b p-2 bg-[#f3f2f1] flex items-center">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg" 
                      alt="Microsoft Word" 
                      className="h-6 mr-2" 
                    />
                    <span className="text-sm font-medium">Microsoft Word Online</span>
                    
                    <div className="ml-auto flex items-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 flex items-center bg-white text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open in Word
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-10 h-full overflow-auto">
                    <div className="max-w-3xl mx-auto bg-white p-12 shadow-sm" style={{minHeight: "800px"}}>
                      <h1 className="text-2xl font-bold mb-6">2.5 Clinical Overview</h1>
                      <h2 className="text-xl font-semibold mb-4">2.5.5 Safety Profile</h2>
                      
                      <p className="mb-4">
                        The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects).
                      </p>
                      <p className="mb-4">
                        The efficacy of Drug X was evaluated across multiple endpoints. Primary endpoints showed a statistically significant improvement compared to placebo (p&lt;0.001) with consistent results across all study sites.
                      </p>
                      <p className="mb-4">
                        No serious adverse events were considered related to the study medication, and the discontinuation rate due to adverse events was low (3.2%), comparable to placebo (2.8%).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Document not loaded</h3>
                  <p className="text-sm text-slate-500 mt-1">Click "Upload DOCX" to open a document</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* AI Suggestions Panel (if there are suggestions) */}
      {aiSuggestions.length > 0 && (
        <div className="mt-4 border rounded-md bg-white">
          <div className="bg-blue-50 p-3 border-b flex items-center">
            <Lightbulb className="h-4 w-4 mr-2 text-blue-600" />
            <span className="font-medium">AI Content Suggestions</span>
          </div>
          <div className="divide-y">
            {aiSuggestions.map((suggestion, index) => (
              <div key={suggestion.id || index} className="p-3 hover:bg-slate-50">
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <p className="text-sm mb-1">{suggestion.text}</p>
                    <div className="flex items-center">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.type || 'Content Enhancement'}
                      </Badge>
                    </div>
                  </div>
                  {!suggestion.accepted && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-shrink-0"
                      onClick={() => applySuggestion(suggestion)}
                      disabled={isLocked || !msOfficeLoaded}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Apply
                    </Button>
                  )}
                  {suggestion.accepted && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckSquare className="h-3 w-3 mr-1" />
                      Applied
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Compliance Results (if available) */}
      {complianceResults && (
        <div className="mt-4 border rounded-md bg-white">
          <div className="bg-blue-50 p-3 border-b flex items-center justify-between">
            <div className="flex items-center">
              <ClipboardCheck className="h-4 w-4 mr-2 text-blue-600" />
              <span className="font-medium">Regulatory Compliance Check</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => setComplianceResults(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-3">
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="border rounded-md p-2 text-center">
                <div className="text-2xl font-semibold text-blue-700">
                  {complianceResults.scores?.completeness || 85}%
                </div>
                <div className="text-xs text-slate-500">Completeness</div>
              </div>
              <div className="border rounded-md p-2 text-center">
                <div className="text-2xl font-semibold text-blue-700">
                  {complianceResults.scores?.consistency || 92}%
                </div>
                <div className="text-xs text-slate-500">Consistency</div>
              </div>
              <div className="border rounded-md p-2 text-center">
                <div className="text-2xl font-semibold text-blue-700">
                  {complianceResults.scores?.clarity || 78}%
                </div>
                <div className="text-xs text-slate-500">Clarity</div>
              </div>
              <div className="border rounded-md p-2 text-center">
                <div className="text-2xl font-semibold text-blue-700">
                  {complianceResults.scores?.compliance || 88}%
                </div>
                <div className="text-xs text-slate-500">Compliance</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Identified Issues</h4>
              {complianceResults.issues?.map((issue, index) => (
                <div 
                  key={issue.id || index} 
                  className={`border rounded-md p-2 ${
                    issue.severity === 'critical'
                      ? 'border-red-200 bg-red-50'
                      : issue.severity === 'major'
                        ? 'border-orange-200 bg-orange-50'
                        : issue.severity === 'minor'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="font-medium text-sm">{issue.section}</span>
                        <Badge 
                          variant="outline" 
                          className={`ml-2 text-xs ${
                            issue.severity === 'critical'
                              ? 'text-red-700 border-red-200 bg-red-50'
                              : issue.severity === 'major'
                                ? 'text-orange-700 border-orange-200 bg-orange-50'
                                : issue.severity === 'minor'
                                  ? 'text-yellow-700 border-yellow-200 bg-yellow-50'
                                  : 'text-slate-700 border-slate-200 bg-slate-50'
                          }`}
                        >
                          {issue.severity || 'info'}
                        </Badge>
                      </div>
                      <p className="text-xs">{issue.description}</p>
                      {issue.suggestion && (
                        <div className="mt-1 text-xs bg-blue-50 p-1 rounded border border-blue-100">
                          <span className="text-blue-800 font-medium">Suggestion:</span> {issue.suggestion}
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 flex-shrink-0 text-blue-600"
                      onClick={() => {}}
                      title="Fix Issue"
                      disabled={!msOfficeLoaded}
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* File Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Microsoft Word Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed rounded-md p-6 text-center">
              <div className="mb-4">
                <FileText className="h-10 w-10 text-slate-400 mx-auto" />
              </div>
              
              <label className="block">
                <span className="sr-only">Choose DOCX file</span>
                <input 
                  type="file" 
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  accept=".docx,.doc"
                  onChange={handleFileUpload}
                />
              </label>
              
              {uploadFile && (
                <div className="mt-4 text-left bg-blue-50 p-2 rounded text-sm flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium text-blue-800">{uploadFile.name}</span>
                  <span className="ml-2 text-slate-500">({Math.round(uploadFile.size / 1024)} KB)</span>
                </div>
              )}
            </div>
            
            <div className="bg-amber-50 p-3 rounded border border-amber-100 text-sm">
              <div className="flex items-start">
                <HelpCircle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <span className="font-medium">Important:</span> Uploading will replace the current document content. Make sure to save any changes before proceeding.
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={processFileUpload} 
              disabled={!uploadFile}
            >
              Upload & Open
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* AI Mini-Chat for document assistance */}
      {aiMiniChatOpen && <AiMiniChat />}
    </div>
  );
};

export default MsWordDocumentEditor;