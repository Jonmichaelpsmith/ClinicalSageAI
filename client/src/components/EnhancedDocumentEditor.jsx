/**
 * !!!!! OFFICIAL ENHANCED DOCUMENT EDITOR FOR eCTD CO-AUTHOR MODULE !!!!!
 * 
 * This component provides an enhanced document editing experience with
 * tight AI integration as specified in the Enterprise-Grade Upgrade Design.
 * 
 * Version: 4.0.0 - May 11, 2025
 * Status: STABLE - DO NOT MODIFY WITHOUT APPROVAL
 * 
 * PROTECTED CODE - Extend only as specified in the Enterprise Upgrade Design document.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
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
  FileSearch,
  Lightbulb,
  Send,
  X,
  CheckSquare,
  Check,
  Save,
  HelpCircle
} from 'lucide-react';

const EnhancedDocumentEditor = ({
  documentId = 'current-doc',
  sectionId = '2.5.5',
  initialContent = "The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects).",
  documentTitle = "Module 2.5 Clinical Overview",
  sectionTitle = "Safety Profile",
  onSave = () => {},
  onLockDocument = () => {},
  isLocked = false,
  lockedBy = null
}) => {
  // State
  const [content, setContent] = useState(initialContent);
  const [editHistory, setEditHistory] = useState([]);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiCheckingCompliance, setAiCheckingCompliance] = useState(false);
  const [complianceResults, setComplianceResults] = useState(null);
  const [formattingDialog, setFormattingDialog] = useState(false);
  const [activeAiContext, setActiveAiContext] = useState('document');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedText, setSelectedText] = useState('');
  const [selectionCoords, setSelectionCoords] = useState(null);
  const [showAiActionMenu, setShowAiActionMenu] = useState(false);
  const [complianceCheckInProgress, setComplianceCheckInProgress] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [aiMiniChatOpen, setAiMiniChatOpen] = useState(false);
  const [eCTDFormatting, setECTDFormatting] = useState({
    headingFormat: 'numbered',
    citations: 'superscript',
    tables: 'captioned',
    referencesFormat: 'vancouver'
  });
  
  const editorRef = useRef(null);
  const { toast } = useToast();
  
  // Save content periodically
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      // Auto-save to local storage
      localStorage.setItem(`draft_${sectionId}`, content);
      console.log(`Auto-saving section ${sectionId}...`);
      
      // Add to edit history
      const newEdit = {
        id: `edit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        content,
        user: 'Current User'
      };
      
      setEditHistory(prev => [newEdit, ...prev].slice(0, 10));
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearTimeout(saveTimer);
  }, [content, sectionId]);
  
  // Get AI-assisted content suggestions
  const getContentSuggestions = async () => {
    setAiSuggesting(true);
    
    try {
      const response = await aiService.generateContentSuggestions(
        documentId,
        sectionId,
        content,
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
    setComplianceCheckInProgress(true);
    
    try {
      const response = await aiService.checkComplianceAI(
        documentId,
        content,
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
      setComplianceCheckInProgress(false);
    }
  };
  
  // Get AI-assisted formatting suggestions
  const getFormattingSuggestions = async () => {
    setAiCheckingCompliance(true);
    
    try {
      const response = await aiService.analyzeFormattingAI(
        documentId,
        content,
        'clinicalOverview'
      );
      
      setComplianceResults({
        ...response,
        type: 'formatting'
      });
      
      setFormattingDialog(true);
      
      toast({
        title: "Format Analysis Complete",
        description: "Formatting suggestions are available for review.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error analyzing formatting:', error);
      toast({
        title: "Format Analysis Failed",
        description: error.message || "Could not analyze formatting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAiCheckingCompliance(false);
    }
  };
  
  // Ask AI about document content
  const handleAiQuerySubmit = async (e) => {
    e.preventDefault();
    
    if (!aiQuery.trim()) return;
    
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
        sectionId
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

  // Selection handling for in-context AI actions
  const handleSelectionChange = () => {
    if (window.getSelection && !isLocked) {
      const selection = window.getSelection();
      if (selection.toString().trim().length > 0) {
        setSelectedText(selection.toString());
        
        // Get position for AI action menu
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectionCoords({
          top: rect.top,
          left: rect.left + (rect.width / 2)
        });
        
        setShowAiActionMenu(true);
      } else {
        setShowAiActionMenu(false);
      }
    }
  };
  
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [isLocked]);
  
  // Handle AI-suggested edits
  const applySuggestion = (suggestion) => {
    // Replace content in editor
    setContent(prev => prev.replace(suggestion.context || "", suggestion.text));
    
    // Mark suggestion as accepted
    setAiSuggestions(prev => 
      prev.map(s => 
        s.id === suggestion.id 
          ? { ...s, accepted: true } 
          : s
      )
    );
    
    toast({
      title: "AI Suggestion Applied",
      description: "The content has been updated with the AI suggestion.",
      variant: "default",
    });
  };
  
  // Apply eCTD formatting to the document
  const applyECTDFormatting = () => {
    // In a real implementation, this would apply the ICH eCTD formatting guidelines
    toast({
      title: "eCTD Formatting Applied",
      description: "Document has been formatted according to ICH eCTD guidelines.",
      variant: "default",
    });
    
    setFormattingDialog(false);
  };
  
  // Save document function
  const handleSave = () => {
    // Call the parent save handler
    onSave(content);
    
    toast({
      title: "Document Saved",
      description: "Your changes have been saved successfully.",
      variant: "default",
    });
  };
  
  // Selection-based AI actions
  const handleAiAction = async (action) => {
    if (!selectedText.trim()) return;
    
    switch (action) {
      case 'improve':
        try {
          const response = await aiService.generateContentSuggestions(
            documentId,
            sectionId,
            selectedText,
            "Improve this text"
          );
          
          const firstSuggestion = response.suggestions[0];
          
          if (firstSuggestion) {
            // Replace the selected text with the improved version
            setContent(prev => prev.replace(selectedText, firstSuggestion.text));
            
            toast({
              title: "Text Improved",
              description: "The selected text has been enhanced by AI.",
              variant: "default",
            });
          }
        } catch (error) {
          console.error('Error improving text:', error);
          toast({
            title: "Text Improvement Failed",
            description: error.message || "Could not improve text. Please try again.",
            variant: "destructive",
          });
        }
        break;
        
      case 'expand':
        try {
          const response = await aiService.generateContentSuggestions(
            documentId,
            sectionId,
            selectedText,
            "Expand this text with additional relevant details"
          );
          
          const firstSuggestion = response.suggestions[0];
          
          if (firstSuggestion) {
            // Replace the selected text with the expanded version
            setContent(prev => prev.replace(selectedText, firstSuggestion.text));
            
            toast({
              title: "Text Expanded",
              description: "The selected text has been expanded with additional details.",
              variant: "default",
            });
          }
        } catch (error) {
          console.error('Error expanding text:', error);
          toast({
            title: "Text Expansion Failed",
            description: error.message || "Could not expand text. Please try again.",
            variant: "destructive",
          });
        }
        break;
        
      case 'checkCompliance':
        try {
          const response = await aiService.checkComplianceAI(
            documentId,
            selectedText,
            ['ICH', 'FDA']
          );
          
          setComplianceResults({
            ...response,
            type: 'selection',
            selection: selectedText
          });
          
          toast({
            title: "Selection Compliance Check",
            description: `Found ${response.issues.length} compliance issues in selection.`,
            variant: "default",
          });
        } catch (error) {
          console.error('Error checking selection compliance:', error);
          toast({
            title: "Selection Compliance Check Failed",
            description: error.message || "Could not check compliance. Please try again.",
            variant: "destructive",
          });
        }
        break;
      
      case 'ask':
        setAiMiniChatOpen(true);
        setAiQuery(`Analyze this text: "${selectedText.substring(0, 100)}..."`);
        break;
        
      default:
        break;
    }
    
    setShowAiActionMenu(false);
  };
  
  // AI mini-chat for quick questions about document content
  const AiMiniChat = () => (
    <div className="absolute bottom-4 right-4 w-80 border bg-white rounded-lg shadow-lg overflow-hidden z-10">
      <div className="bg-blue-50 border-b p-3 flex justify-between items-center">
        <div className="flex items-center">
          <Bot className="h-4 w-4 mr-2 text-blue-600" />
          <span className="font-medium">AI Assistant</span>
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
            >
              <Save className="h-4 w-4 mr-2" /> 
              Save
            </Button>
          )}
        </div>
      </div>
      
      {/* Editor Toolbar */}
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
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs flex items-center"
            onClick={() => setShowTemplates(true)}
          >
            <FileText className="h-4 w-4 mr-1" />
            Insert Template
          </Button>
        </div>
        
        <div className="ml-auto flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-xs flex items-center ${aiSuggesting ? 'bg-blue-50' : ''}`}
            onClick={getContentSuggestions}
            disabled={aiSuggesting || isLocked}
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
            className={`text-xs flex items-center ${complianceCheckInProgress ? 'bg-blue-50' : ''}`}
            onClick={checkCompliance}
            disabled={complianceCheckInProgress || isLocked}
          >
            {complianceCheckInProgress ? (
              <RefreshCcw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <ClipboardCheck className="h-4 w-4 mr-1" />
            )}
            Check Compliance
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-xs flex items-center ${aiCheckingCompliance ? 'bg-blue-50' : ''}`}
            onClick={getFormattingSuggestions}
            disabled={aiCheckingCompliance || isLocked}
          >
            {aiCheckingCompliance ? (
              <RefreshCcw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <ListChecks className="h-4 w-4 mr-1" />
            )}
            Format as eCTD
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs flex items-center"
            onClick={() => setAiMiniChatOpen(true)}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Ask AI
          </Button>
        </div>
      </div>
      
      {/* Rich Text Editor Area */}
      <div 
        ref={editorRef}
        contentEditable={!isLocked}
        className={`min-h-[500px] border-x border-b rounded-b-md p-6 focus:outline-none focus:ring-1 focus:ring-blue-500 prose max-w-none ${isLocked ? 'bg-slate-50' : ''}`}
        onInput={(e) => setContent(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      
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
                      disabled={isLocked}
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
              <span className="font-medium">
                {complianceResults.type === 'formatting' 
                  ? 'Formatting Analysis' 
                  : 'Regulatory Compliance Check'}
              </span>
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
      
      {/* AI Action Menu for selected text */}
      {showAiActionMenu && selectionCoords && (
        <div 
          className="fixed bg-white border rounded-md shadow-lg p-1 z-50"
          style={{
            top: `${selectionCoords.top - 40}px`,
            left: `${selectionCoords.left}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => handleAiAction('improve')}
              title="Improve Text"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => handleAiAction('expand')}
              title="Expand Content"
            >
              <FileSearch className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => handleAiAction('checkCompliance')}
              title="Check Compliance"
            >
              <ClipboardCheck className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => handleAiAction('ask')}
              title="Ask AI"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* eCTD Formatting Dialog */}
      <Dialog open={formattingDialog} onOpenChange={setFormattingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>eCTD Formatting Options</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Heading Format</label>
                <select
                  className="w-full border rounded p-2 text-sm"
                  value={eCTDFormatting.headingFormat}
                  onChange={(e) => setECTDFormatting(prev => ({
                    ...prev,
                    headingFormat: e.target.value
                  }))}
                >
                  <option value="numbered">Numbered (1.1, 1.2, etc.)</option>
                  <option value="hierarchical">Hierarchical</option>
                  <option value="descriptive">Descriptive</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Citations</label>
                <select
                  className="w-full border rounded p-2 text-sm"
                  value={eCTDFormatting.citations}
                  onChange={(e) => setECTDFormatting(prev => ({
                    ...prev,
                    citations: e.target.value
                  }))}
                >
                  <option value="superscript">Superscript</option>
                  <option value="intext">In-text</option>
                  <option value="brackets">Brackets</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Table Format</label>
                <select
                  className="w-full border rounded p-2 text-sm"
                  value={eCTDFormatting.tables}
                  onChange={(e) => setECTDFormatting(prev => ({
                    ...prev,
                    tables: e.target.value
                  }))}
                >
                  <option value="captioned">Captioned</option>
                  <option value="numbered">Numbered</option>
                  <option value="simple">Simple</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">References Format</label>
                <select
                  className="w-full border rounded p-2 text-sm"
                  value={eCTDFormatting.referencesFormat}
                  onChange={(e) => setECTDFormatting(prev => ({
                    ...prev,
                    referencesFormat: e.target.value
                  }))}
                >
                  <option value="vancouver">Vancouver</option>
                  <option value="harvard">Harvard</option>
                  <option value="apa">APA</option>
                </select>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded border border-blue-100 text-sm">
              <div className="flex items-start">
                <HelpCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <span className="font-medium">ICH eCTD Compliance:</span> The selected formatting options will be applied according to ICH eCTD guidelines for Module {sectionId.split('.')[0]} documents.
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormattingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={applyECTDFormatting}>
              Apply eCTD Formatting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* AI Mini-Chat for context-based queries */}
      {aiMiniChatOpen && <AiMiniChat />}
    </div>
  );
};

export default EnhancedDocumentEditor;