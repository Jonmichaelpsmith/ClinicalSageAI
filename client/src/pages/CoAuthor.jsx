/**
 * !!!!! IMPORTANT - OFFICIAL eCTD CO-AUTHOR MODULE !!!!!
 * 
 * This is the ONE AND ONLY official implementation of the eCTD Co-Author Module
 * 
 * Version: 5.0.0 - May 11, 2025
 * Status: STABLE - MICROSOFT WORD INTEGRATION ACTIVE
 * 
 * Any attempt to create duplicate modules or alternate implementations
 * should be prevented. This is the golden source implementation.
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Import genuine Microsoft Office services
import * as wordIntegration from '../services/wordIntegration';
import * as copilotService from '../services/copilotService';
import * as microsoftWordService from '../services/microsoftWordService';
import * as msOfficeVaultBridge from '../services/msOfficeVaultBridge';
import * as msCopilotService from '../services/msCopilotService';

// Legacy services - keeping for backward compatibility
import * as aiService from '../services/aiService';
import * as msWordService from '../services/msWordIntegrationService';

// Import the components with lazy loading for better performance
const EnhancedDocumentEditor = lazy(() => import('../components/EnhancedDocumentEditor'));
const Office365WordEmbed = lazy(() => import('../components/Office365WordEmbed'));
// No longer using MsWordPopupEditor as we're now using the genuine Microsoft Word integration
import { 
  FileText, 
  Edit, 
  Search, 
  LayoutTemplate, 
  FolderOpen, 
  CheckCircle, 
  Eye,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  FilePlus2,
  Upload,
  Download,
  History,
  Share2,
  Database,
  BarChart,
  AlertCircle,
  Clock,
  GitMerge,
  GitBranch,
  Plus,
  Minus,
  Info,
  UserCheck,
  RefreshCw,
  Lock,
  Users,
  ClipboardCheck,
  FileCheck,
  Link,
  BookOpen,
  ArrowUpRight,
  Filter,
  CheckSquare,
  FileWarning,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Lightbulb,
  Check,
  X,
  Settings,
  ListChecks,
  Bot,
  Clipboard,
  Zap,
  Send
} from 'lucide-react';

export default function CoAuthor() {
  // Component state
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [activeVersion, setActiveVersion] = useState('v4.0');
  const [compareVersions, setCompareVersions] = useState({ base: 'v4.0', compare: 'v3.2' });
  const [teamCollabOpen, setTeamCollabOpen] = useState(false);
  const [documentLocked, setDocumentLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  // Microsoft Word 365 integration state
  const [msWordPopupOpen, setMsWordPopupOpen] = useState(false);
  const [msWordAvailable, setMsWordAvailable] = useState(true); // Set to true for demo
  // AI Assistant state
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiAssistantMode, setAiAssistantMode] = useState('suggestions'); // 'suggestions', 'compliance', 'formatting'
  const [aiUserQuery, setAiUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [aiIsLoading, setAiIsLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  
  const { toast } = useToast();
  
  const [validationResults] = useState({
    completeness: 78,
    consistency: 92,
    references: 65,
    regulatory: 87,
    issues: [
      {
        id: 1,
        severity: 'critical',
        section: '2.5.4',
        description: 'Missing source citations for efficacy claims',
        suggestion: 'Add references to support the primary endpoint efficacy claims'
      },
      {
        id: 2,
        severity: 'major',
        section: '2.5.6',
        description: 'Incomplete benefit-risk assessment',
        suggestion: 'Expand the benefit-risk section to include analysis of secondary endpoints'
      },
      {
        id: 3,
        severity: 'minor',
        section: '2.5.2',
        description: 'Inconsistent product name usage',
        suggestion: 'Standardize product name as "Drug X" throughout the document'
      },
      {
        id: 4,
        severity: 'info',
        section: '2.5.1',
        description: 'FDA guidance updated since last edit',
        suggestion: 'Review latest FDA guidance on clinical overview format'
      }
    ]
  });
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportOptions, setExportOptions] = useState({
    includeComments: true,
    includeTrackChanges: false,
    includeCoverPage: true,
    includeTableOfContents: true,
    includeAppendices: true
  });
  
  // AI query submission handler
  const handleAiQuerySubmit = async (e) => {
    e.preventDefault();
    
    if (!aiUserQuery.trim()) return;
    
    setAiIsLoading(true);
    setAiError(null);
    
    try {
      // Determine which AI service to call based on active mode
      let response;
      if (aiAssistantMode === 'compliance') {
        response = await aiService.checkComplianceAI(
          selectedDocument?.id || 'current-doc',
          "The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects).",
          ['ICH', 'FDA']
        );
      } else if (aiAssistantMode === 'formatting') {
        response = await aiService.analyzeFormattingAI(
          selectedDocument?.id || 'current-doc',
          "The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects).",
          'clinicalOverview'
        );
      } else {
        // Default mode: suggestions
        if (selectedDocument) {
          response = await aiService.generateContentSuggestions(
            selectedDocument.id || 'current-doc', 
            '2.5.5', 
            "The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects).",
            aiUserQuery
          );
        } else {
          // If no document is selected, use the general AI ask endpoint
          response = await aiService.askDocumentAI(aiUserQuery);
        }
      }
      
      setAiResponse(response);
      setAiUserQuery('');
      
      // Show success toast
      toast({
        title: "AI Response Generated",
        description: "The AI has generated a response based on your query.",
        variant: "default",
      });
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      setAiError(error.message || 'Failed to get AI response. Please try again.');
      
      // Show error toast
      toast({
        title: "AI Request Failed",
        description: error.message || "Could not generate AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAiIsLoading(false);
    }
  };
  
  // Mock AI suggestions (will be replaced by actual AI responses)
  const [aiSuggestions, setAiSuggestions] = useState([
    {
      id: 1,
      type: 'completion',
      text: 'The safety profile is consistent with other drugs in this class...',
      section: '2.5.5',
      accepted: false
    },
    {
      id: 2,
      type: 'formatting',
      text: 'Table formatting for efficacy data does not meet ICH guidelines. Suggested template available.',
      section: '2.5.4.2',
      accepted: false
    },
    {
      id: 3,
      type: 'compliance',
      text: 'Missing Integrated Summary of Benefits and Risks required by FDA guidance.',
      section: '2.5.6',
      accepted: false
    }
  ]);
  
  // Version history mock data - in real implementation this would come from the Vault API
  const [versionHistory] = useState([
    { 
      id: 'v4.0', 
      name: 'Version 4.0', 
      date: 'May 11, 2025', 
      author: 'John Doe', 
      changes: 'Updated clinical endpoints in Module 2.5',
      commitHash: '8f7e6d5c4b3a2',
      status: 'Current'
    },
    { 
      id: 'v3.2', 
      name: 'Version 3.2', 
      date: 'April 28, 2025', 
      author: 'Jane Smith', 
      changes: 'Fixed formatting issues in Module 3',
      commitHash: '7a6b5c4d3e2f1',
      status: 'Previous'
    },
    { 
      id: 'v3.1', 
      name: 'Version 3.1', 
      date: 'April 25, 2025', 
      author: 'Sarah Williams', 
      changes: 'Updated regulatory citations in Module 1.3',
      commitHash: '6f5e4d3c2b1a9',
      status: 'Previous'
    },
    { 
      id: 'v3.0', 
      name: 'Version 3.0', 
      date: 'April 22, 2025', 
      author: 'John Doe', 
      changes: 'Major revision with updated clinical data',
      commitHash: '5e4d3c2b1a987',
      status: 'Previous'
    },
    { 
      id: 'v2.5', 
      name: 'Version 2.5', 
      date: 'April 15, 2025', 
      author: 'Emily Chen', 
      changes: 'Addressed regulatory feedback on Module 5',
      commitHash: '4d3c2b1a9876',
      status: 'Previous'
    }
  ]);

  // Mock documents data
  const [documents] = useState([
    { 
      id: 1, 
      title: 'Module 2.5 Clinical Overview', 
      module: 'Module 2',
      lastEdited: '2 hours ago',
      editedBy: 'John Doe',
      status: 'In Progress',
      version: 'v4.0',
      reviewers: ['Emily Chen', 'David Kim']
    },
    { 
      id: 2, 
      title: 'CMC Section 3.2.P', 
      module: 'Module 3',
      lastEdited: '1 day ago',
      editedBy: 'Mark Wilson',
      status: 'Draft',
      version: 'v1.4',
      reviewers: []
    },
    { 
      id: 3, 
      title: 'Clinical Overview', 
      module: 'Module 2',
      lastEdited: '3 days ago',
      editedBy: 'Jane Smith',
      status: 'Final',
      version: 'v3.0',
      reviewers: ['Robert Johnson', 'Emily Chen', 'David Kim']
    },
    { 
      id: 4, 
      title: 'Module 1.2 Application Form', 
      module: 'Module 1',
      lastEdited: '5 days ago',
      editedBy: 'Sarah Williams',
      status: 'In Review',
      version: 'v2.1',
      reviewers: ['John Doe', 'Mark Wilson']
    },
    { 
      id: 5, 
      title: 'Module 5.3.5 Integrated Summary of Efficacy', 
      module: 'Module 5',
      lastEdited: '1 week ago',
      editedBy: 'Emily Chen',
      status: 'Draft',
      version: 'v1.8',
      reviewers: []
    },
    { 
      id: 6, 
      title: 'Module 4.2.1 Pharmacology Study Reports', 
      module: 'Module 4',
      lastEdited: '2 weeks ago',
      editedBy: 'David Kim',
      status: 'Final',
      version: 'v2.0',
      reviewers: ['Jane Smith', 'Emily Chen']
    }
  ]);

  // Mock templates data
  const [templates] = useState([
    {
      id: 101,
      name: 'Clinical Overview Template',
      description: 'Standard template for Module 2.5 Clinical Overview',
      category: 'Module 2',
      lastUpdated: '2 months ago',
      regions: [
        { id: 201, name: 'FDA Module 2 Regional', region: 'US FDA', lastUpdated: '2 months ago' },
        { id: 202, name: 'EMA Module 2 Regional', region: 'EU EMA', lastUpdated: '2 months ago' }
      ]
    },
    {
      id: 102,
      name: 'CTD Module 3 Quality Template',
      description: 'Comprehensive template for all Module 3 Quality sections',
      category: 'Module 3',
      lastUpdated: '1 month ago',
      regions: [
        { id: 201, name: 'FDA Module 3 Regional', region: 'US FDA', lastUpdated: '1 month ago' },
        { id: 202, name: 'EMA Module 3 Regional', region: 'EU EMA', lastUpdated: '1 month ago' }
      ]
    },
    {
      id: 103,
      name: 'NDA Cover Letter Template',
      description: 'Official cover letter format for NDA submissions',
      category: 'Module 1',
      lastUpdated: '3 weeks ago',
      regions: [
        { id: 201, name: 'FDA Module 1 Regional', region: 'US FDA', lastUpdated: '3 weeks ago' },
        { id: 202, name: 'EMA Module 1 Regional', region: 'EU EMA', lastUpdated: '1 month ago' }
      ]
    }
  ]);

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <header className="mb-6 pt-4 px-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <img src="https://www.trialsage.com/logo.svg" alt="TrialSage" className="h-8 mr-2" />
            <h1 className="text-2xl font-bold">eCTD Co-Author Module</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsTreeOpen(!isTreeOpen)}
              className="flex items-center"
            >
              <LayoutTemplate className="h-4 w-4 mr-2" />
              {isTreeOpen ? "Hide Navigation" : "Show Navigation"}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setTeamCollabOpen(true)}
              className="flex items-center"
            >
              <Users className="h-4 w-4 mr-2" />
              Team Collaboration
            </Button>
            <Button 
              variant={aiAssistantOpen ? "default" : "outline"}
              size="sm"
              onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
              className={`flex items-center ${aiAssistantOpen ? "bg-blue-600 text-white" : ""}`}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-500">
            <span className="mr-2">Enterprise Edition</span>
            <span className="mx-2">|</span>
            <span>Powered by AI Document Intelligence</span>
          </div>
          {selectedDocument && (
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowVersionHistory(true)}
                className="flex items-center text-blue-700 border-blue-200"
              >
                <History className="h-4 w-4 mr-2" />
                Version History
              </Button>
              <Badge variant="outline" className="border-blue-200 text-blue-700 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Current: {activeVersion}
              </Badge>
              <div className="text-sm text-gray-500">
                Last edited by <span className="font-medium text-gray-700">John Doe</span> on May 11, 2025
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area with optional navigation tree and AI assistant */}
      <div className="px-6 pb-6 flex">
        {/* Document Tree Navigation - Enterprise Edition Feature */}
        {isTreeOpen && (
          <div className="w-64 border-r pr-4 mr-6 flex-shrink-0">
            <div className="sticky top-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Document Structure</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => setIsTreeOpen(false)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-1">
                <div className="border-l-4 border-blue-600 pl-2 py-1 font-medium">
                  Module 1: Administrative Information
                </div>
                <div className="pl-4 space-y-1">
                  <div className="flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer">
                    <FileText className="h-4 w-4 mr-2 text-slate-400" />
                    Section 1.1: Cover Letter
                  </div>
                  <div className="flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer text-blue-600">
                    <FileText className="h-4 w-4 mr-2 text-blue-600" />
                    Section 1.2: Table of Contents
                    <Badge className="ml-2 h-5 bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Current</Badge>
                  </div>
                </div>
                
                <div className="border-l-4 border-green-600 pl-2 py-1 font-medium flex items-center justify-between group">
                  <span>Module 2: Common Technical Document</span>
                  <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                </div>
                <div className="pl-4 space-y-1">
                  <div className="flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer">
                    <FileText className="h-4 w-4 mr-2 text-slate-400" />
                    Section 2.1: CTD Table of Contents
                  </div>
                  <div className="flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer">
                    <FileText className="h-4 w-4 mr-2 text-slate-400" />
                    Section 2.2: Introduction
                  </div>
                  <div className="flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer">
                    <FileText className="h-4 w-4 mr-2 text-slate-400" />
                    <span>Section 2.3: Quality Overall Summary</span>
                  </div>
                  <div className="flex items-center text-sm py-1 bg-slate-50 rounded px-2 cursor-pointer font-medium">
                    <FileText className="h-4 w-4 mr-2 text-slate-600" />
                    <span>Section 2.5: Clinical Overview</span>
                    <Badge className="ml-2 h-5 bg-amber-100 text-amber-700 border-amber-200 text-[10px]">In Review</Badge>
                  </div>
                </div>
                
                <div className="border-l-4 border-amber-600 pl-2 py-1 font-medium">
                  Module 3: Quality
                </div>
                <div className="pl-4 space-y-1">
                  <div className="flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer">
                    <FileText className="h-4 w-4 mr-2 text-slate-400" />
                    Section 3.2.P: Drug Product
                  </div>
                  <div className="flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer">
                    <FileText className="h-4 w-4 mr-2 text-slate-400" />
                    Section 3.2.S: Drug Substance
                  </div>
                </div>
                
                <div className="border-l-4 border-purple-600 pl-2 py-1 font-medium">
                  Module 4: Nonclinical Study Reports
                </div>
                
                <div className="border-l-4 border-indigo-600 pl-2 py-1 font-medium">
                  Module 5: Clinical Study Reports
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <div className="text-sm font-medium mb-2">Document Health</div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Completeness</span>
                      <span className="font-medium">72%</span>
                    </div>
                    <Progress value={72} className="h-2 bg-slate-100" indicatorClassName="bg-blue-600" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Consistency</span>
                      <span className="font-medium">86%</span>
                    </div>
                    <Progress value={86} className="h-2 bg-slate-100" indicatorClassName="bg-green-600" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Issue Resolution</span>
                      <span className="font-medium">63%</span>
                    </div>
                    <Progress value={63} className="h-2 bg-slate-100" indicatorClassName="bg-amber-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* AI Assistant Panel - Enterprise Grade Feature */}
        {aiAssistantOpen && (
          <div className="w-80 border rounded-md overflow-hidden bg-white shadow-md flex-shrink-0 mr-6">
            <div className="sticky top-0">
              <div className="bg-blue-50 border-b p-3 flex justify-between items-center">
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                  <h3 className="font-medium text-sm">AI Document Assistant</h3>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAiAssistantOpen(false)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              
              <div className="border-b">
                <div className="flex p-1">
                  <Button 
                    variant={aiAssistantMode === 'suggestions' ? 'subtle' : 'ghost'} 
                    className="flex-1 h-8 text-xs rounded-none" 
                    onClick={() => setAiAssistantMode('suggestions')}
                  >
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Suggestions
                  </Button>
                  <Button 
                    variant={aiAssistantMode === 'compliance' ? 'subtle' : 'ghost'} 
                    className="flex-1 h-8 text-xs rounded-none" 
                    onClick={() => setAiAssistantMode('compliance')}
                  >
                    <ClipboardCheck className="h-3 w-3 mr-1" />
                    Compliance
                  </Button>
                  <Button 
                    variant={aiAssistantMode === 'formatting' ? 'subtle' : 'ghost'} 
                    className="flex-1 h-8 text-xs rounded-none" 
                    onClick={() => setAiAssistantMode('formatting')}
                  >
                    <ListChecks className="h-3 w-3 mr-1" />
                    Formatting
                  </Button>
                </div>
              </div>
              
              <div className="p-3 max-h-[calc(100vh-14rem)] overflow-y-auto space-y-3">
                {aiAssistantMode === 'suggestions' && (
                  <>
                    <div className="pb-2 border-b mb-2">
                      <div className="flex items-center mb-2 text-sm font-medium text-slate-700">
                        <Bot className="h-4 w-4 mr-1.5 text-blue-600" />
                        <span>Content Suggestions</span>
                      </div>
                      <p className="text-xs text-slate-500">The AI can suggest text improvements, missing content, and help you complete sections.</p>
                    </div>
                  
                    {aiSuggestions.filter(s => s.type === 'completion').map(suggestion => (
                      <div key={suggestion.id} className="bg-blue-50 rounded-md p-3 border border-blue-100">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                            <span className="text-xs font-medium">Section {suggestion.section}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Check className="h-3.5 w-3.5 text-green-600" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <X className="h-3.5 w-3.5 text-red-600" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-700">{suggestion.text}</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700">Insert</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs">Modify</Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border border-dashed rounded-md p-3 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <Zap className="h-5 w-5 text-amber-500" />
                        <p className="text-xs text-slate-500">Ask the AI to help you complete this section or improve specific text.</p>
                        <Button variant="outline" size="sm" className="text-xs h-7">Generate Suggestions</Button>
                      </div>
                    </div>
                  </>
                )}
                
                {aiAssistantMode === 'compliance' && (
                  <>
                    <div className="pb-2 border-b mb-2">
                      <div className="flex items-center mb-2 text-sm font-medium text-slate-700">
                        <ClipboardCheck className="h-4 w-4 mr-1.5 text-blue-600" />
                        <span>Regulatory Compliance</span>
                      </div>
                      <p className="text-xs text-slate-500">Checks your document against FDA, EMA and ICH guidelines.</p>
                    </div>
                    
                    {aiSuggestions.filter(s => s.type === 'compliance').map(suggestion => (
                      <div key={suggestion.id} className="bg-amber-50 rounded-md p-3 border border-amber-100">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <AlertCircle className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                            <span className="text-xs font-medium">Section {suggestion.section}</span>
                          </div>
                          <Badge className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-100">Compliance</Badge>
                        </div>
                        <p className="text-xs text-slate-700">{suggestion.text}</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="h-7 text-xs bg-amber-600 hover:bg-amber-700">Fix Issue</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs">Ignore</Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-3 bg-green-50 rounded-md border border-green-100">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="h-4 w-4 mr-1.5 text-green-600" />
                        <span className="text-sm font-medium">ICH M4E Compliant</span>
                      </div>
                      <p className="text-xs text-slate-700">Your document structure follows ICH M4E guidelines for Clinical Overview format.</p>
                    </div>
                    
                    <Button className="w-full text-xs" variant="outline">
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      Run Full Compliance Check
                    </Button>
                  </>
                )}
                
                {aiAssistantMode === 'formatting' && (
                  <>
                    <div className="pb-2 border-b mb-2">
                      <div className="flex items-center mb-2 text-sm font-medium text-slate-700">
                        <ListChecks className="h-4 w-4 mr-1.5 text-blue-600" />
                        <span>Format Assistance</span>
                      </div>
                      <p className="text-xs text-slate-500">Fix tables, improve formatting, and apply consistent styles.</p>
                    </div>
                    
                    {aiSuggestions.filter(s => s.type === 'formatting').map(suggestion => (
                      <div key={suggestion.id} className="bg-slate-50 rounded-md p-3 border border-slate-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <Info className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                            <span className="text-xs font-medium">Section {suggestion.section}</span>
                          </div>
                          <Badge className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-100">Format</Badge>
                        </div>
                        <p className="text-xs text-slate-700">{suggestion.text}</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="h-7 text-xs">Apply Fix</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs">Preview</Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-3 rounded-md border border-slate-200">
                      <div className="flex items-center mb-2">
                        <Settings className="h-4 w-4 mr-1.5 text-slate-600" />
                        <span className="text-sm font-medium">Format Settings</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Apply ICH formatting</span>
                          <Badge>Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Auto-fix tables</span>
                          <Badge>Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Standardize headings</span>
                          <Badge>Enabled</Badge>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="border-t p-2 bg-slate-50">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs text-slate-500">Powered by OpenAI GPT-4o</span>
                  <Button variant="ghost" size="sm" className="h-6 flex items-center justify-center text-xs">
                    <Settings className="h-3 w-3 mr-1" />
                    Settings
                  </Button>
                </div>
                
                {aiError && (
                  <div className="mb-2 p-2 text-xs bg-red-50 border border-red-200 rounded-md text-red-600">
                    <div className="flex items-center mb-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      <span className="font-medium">Error</span>
                    </div>
                    <p>{aiError}</p>
                  </div>
                )}
                
                {aiResponse && aiAssistantMode === 'suggestions' && (
                  <div className="mb-2 p-2 text-xs bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-start">
                      <Sparkles className="h-3 w-3 mr-1 mt-0.5 text-blue-600" />
                      <div>
                        <span className="font-medium text-blue-800">Suggestion</span>
                        <p className="text-slate-700">{aiResponse.suggestion}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {aiResponse && aiAssistantMode === 'ask' && (
                  <div className="mb-2 p-2 text-xs bg-slate-50 border rounded-md">
                    <div className="flex items-start">
                      <Bot className="h-3 w-3 mr-1 mt-0.5 text-indigo-600" />
                      <div>
                        <span className="font-medium text-indigo-800">Response</span>
                        <p className="text-slate-700">{aiResponse.answer}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleAiQuerySubmit} className="relative">
                  <input 
                    type="text" 
                    className="w-full h-8 text-xs pl-3 pr-8 rounded-md border" 
                    placeholder="Ask the AI Assistant..." 
                    value={aiUserQuery}
                    onChange={(e) => setAiUserQuery(e.target.value)}
                    disabled={aiIsLoading}
                  />
                  <Button 
                    type="submit" 
                    className="absolute right-1 top-1 h-6 w-6 p-0" 
                    size="icon"
                    disabled={aiIsLoading || !aiUserQuery.trim()}
                  >
                    {aiIsLoading ? (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
          {/* AI-Powered Document Editor Card - Enterprise-Grade Enhanced */}
          <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-lg">
                  <Edit className="h-5 w-5 mr-2 text-blue-600" />
                  AI-Powered Document Editor
                </CardTitle>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 font-medium">Enterprise</Badge>
              </div>
              <CardDescription>
                Create and edit regulatory documents with intelligent assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <FilePlus2 className="h-4 w-4 mr-2" />
                    New Document
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-blue-200 text-blue-700"
                    onClick={() => {
                      if (selectedDocument) {
                        toast({
                          title: "Opening Microsoft Word",
                          description: "Preparing document for editing in Microsoft Word...",
                          variant: "default",
                        });
                        console.log("Creating Microsoft Office editing session for VAULT document " + selectedDocument.id + "...");
                        
                        // Simulate a brief loading period
                        setTimeout(() => {
                          setMsWordPopupOpen(true);
                          toast({
                            title: "Microsoft Word Ready",
                            description: "Document is now ready for editing in Microsoft Word.",
                            variant: "default",
                          });
                        }, 700);
                      } else {
                        toast({
                          title: "Select a Document",
                          description: "Please select a document to edit first.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Edit in Word
                  </Button>
                  <Button size="sm" variant="outline" className="border-blue-200">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>
                <div className="border rounded-md">
                  <div className="bg-slate-50 p-2 font-medium border-b text-sm">
                    Recent Documents
                  </div>
                  <div className="divide-y">
                    {documents.slice(0, 3).map((doc) => (
                      <div 
                        key={doc.id} 
                        className="p-3 hover:bg-slate-50 cursor-pointer"
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-2">
                            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <div className="font-medium">{doc.title}</div>
                              <div className="text-xs text-gray-500 mt-1">{doc.module} • Last edited {doc.lastEdited}</div>
                            </div>
                          </div>
                          <Badge 
                            className={`
                              ${doc.status === 'Final' ? 'bg-green-100 text-green-800 border-green-200' : 
                                doc.status === 'In Review' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                'bg-blue-100 text-blue-700 border-blue-200'}
                            `}
                          >
                            {doc.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t">
                    <Button size="sm" variant="ghost" className="w-full text-blue-600">
                      View All Documents
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Templates Card - Enterprise-Grade Enhanced */}
          <Card className="border-green-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-white">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-lg">
                  <LayoutTemplate className="h-5 w-5 mr-2 text-green-600" />
                  Document Templates
                </CardTitle>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 font-medium">Enterprise</Badge>
              </div>
              <CardDescription>
                Start with pre-approved templates for regulatory documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Browse Templates
                  </Button>
                  <Button size="sm" variant="outline" className="border-green-200">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Template
                  </Button>
                </div>
                <div className="border rounded-md">
                  <div className="bg-slate-50 p-2 font-medium border-b text-sm">
                    Featured Templates
                  </div>
                  <div className="divide-y">
                    {templates.map((template) => (
                      <div key={template.id} className="p-3 hover:bg-slate-50 cursor-pointer">
                        <div className="flex items-start space-x-2">
                          <LayoutTemplate className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{template.category} • Updated {template.lastUpdated}</div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              {template.regions.map((region) => (
                                <Badge 
                                  key={region.id}
                                  variant="outline" 
                                  className="mt-2 h-5 justify-center bg-slate-50 border-slate-200"
                                >
                                  {region.region}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Validation Dashboard - Enterprise-Grade Enhanced */}
          <Card className="border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-white">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-lg">
                  <CheckCircle className="h-5 w-5 mr-2 text-purple-600" />
                  Validation Dashboard
                </CardTitle>
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 font-medium">Enterprise</Badge>
              </div>
              <CardDescription>
                Ensure compliance with regulatory requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md">
                  <div className="bg-slate-50 p-2 font-medium border-b text-sm flex justify-between items-center">
                    <span>Module 2.5 Clinical Overview</span>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">In Progress</Badge>
                  </div>
                  <div className="p-3 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Content Completeness</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Regulatory Compliance</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Reference Validation</span>
                        <span className="font-medium">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-2 text-xs text-amber-800 flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">4 validation issues require attention</p>
                        <p className="mt-1">Missing source citations in section 2.5.4 and incomplete benefit-risk assessment.</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => setShowValidationDialog(true)}
                    >
                      <FileCheck className="h-4 w-4 mr-2" />
                      Open Validation Report
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Overall: 68%</span>
                    <span className="text-gray-500 ml-1.5">complete</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-blue-200 text-blue-700 h-8"
                    onClick={() => setShowExportDialog(true)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Document
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Active Document Content Area (Displayed when document is selected) */}
        {selectedDocument && (
          <div className="mt-8 border rounded-md shadow">
            <div className="bg-slate-50 border-b p-4 flex justify-between items-center">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold">{selectedDocument.title}</h2>
                  <div className="text-sm text-slate-500">
                    {selectedDocument.module} • Last edited {selectedDocument.lastEdited}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-blue-200 text-blue-700"
                  onClick={() => setShowValidationDialog(true)}
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  Validate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-green-200 text-green-700"
                  onClick={() => setShowExportDialog(true)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Editor Tabs */}
              <Tabs defaultValue="edit" className="w-full">
                <TabsList className="grid w-[400px] grid-cols-3">
                  <TabsTrigger value="edit" className="flex items-center">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="view" className="flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center">
                    <History className="h-4 w-4 mr-2" />
                    Changes
                  </TabsTrigger>
                </TabsList>
                
                {/* Edit Tab Content */}
                <TabsContent value="edit" className="pt-4 space-y-4">
                  <Suspense fallback={
                    <div className="flex items-center justify-center p-8">
                      <div className="text-center">
                        <div className="h-8 w-8 mb-4 rounded-full border-t-2 border-b-2 border-blue-600 animate-spin mx-auto"></div>
                        <p className="text-sm text-slate-500">Loading Microsoft Word editor...</p>
                      </div>
                    </div>
                  }>
                    <EnhancedDocumentEditor 
                      documentId={selectedDocument?.id?.toString() || 'current-doc'}
                      sectionId="2.5.5"
                      initialContent="The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects)."
                      documentTitle={selectedDocument?.title || "Module 2.5 Clinical Overview"}
                      sectionTitle="Safety Profile"
                      onSave={(content) => {
                        console.log("Saving document content:", content);
                        toast({
                          title: "Document Saved",
                          description: "Your changes have been saved to the document vault.",
                          variant: "default",
                        });
                      }}
                      onLockDocument={(locked) => setDocumentLocked(locked)}
                      isLocked={documentLocked}
                      lockedBy={lockedBy}
                    />
                  </Suspense>
                  
                  {/* AI Assistance Panel when in document editing mode */}
                  {aiAssistantOpen && (
                    <div className="bg-slate-50 border rounded-md p-4 my-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                          <h4 className="font-medium">AI Document Assistant</h4>
                        </div>
                        
                        {aiIsLoading && (
                          <Badge className="bg-blue-50 text-blue-600 border border-blue-200">
                            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse mr-1.5" />
                            Processing...
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 mb-3">
                        <Button 
                          size="sm" 
                          variant={aiAssistantMode === 'suggestions' ? 'default' : 'outline'}
                          onClick={() => setAiAssistantMode('suggestions')}
                        >
                          <Lightbulb className="h-4 w-4 mr-1.5" />
                          Content Suggestions
                        </Button>
                        <Button 
                          size="sm" 
                          variant={aiAssistantMode === 'compliance' ? 'default' : 'outline'}
                          onClick={() => setAiAssistantMode('compliance')}
                        >
                          <ClipboardCheck className="h-4 w-4 mr-1.5" />
                          Compliance Check
                        </Button>
                        <Button 
                          size="sm" 
                          variant={aiAssistantMode === 'formatting' ? 'default' : 'outline'}
                          onClick={() => setAiAssistantMode('formatting')}
                        >
                          <ListChecks className="h-4 w-4 mr-1.5" />
                          Format & Structure
                        </Button>
                      </div>
                      
                      <div className="bg-white border border-slate-200 rounded-md p-3 relative">
                        {aiResponse ? (
                          <div className="prose prose-sm max-w-none text-slate-700">
                            <div dangerouslySetInnerHTML={{ __html: aiResponse.suggestion?.replace(/\n/g, '<br />') || '' }} />
                          </div>
                        ) : (
                          <div className="prose prose-sm max-w-none text-slate-700">
                            <p>
                              Ask the AI assistant for help with your document. You can request suggestions for content improvements, 
                              check compliance with regulatory guidelines, or get help with formatting and structure.
                            </p>
                          </div>
                        )}
                        
                        {aiResponse && aiResponse.references && aiResponse.references.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
                            <strong>References:</strong>
                            <ul className="mt-1 list-disc pl-5 space-y-1">
                              {aiResponse.references.map((ref, idx) => (
                                <li key={idx}>{ref}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button 
                            size="sm" 
                            className="h-7 text-xs"
                            disabled={aiIsLoading || !aiResponse}
                          >
                            <Clipboard className="h-3.5 w-3.5 mr-1.5" />
                            Copy to Clipboard
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-xs"
                            disabled={aiIsLoading || !aiResponse}
                          >
                            <FilePlus2 className="h-3.5 w-3.5 mr-1.5" />
                            Insert to Document
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-xs"
                            disabled={aiIsLoading || !aiResponse}
                            onClick={() => {
                              // Create a regeneration request
                              setAiUserQuery("Suggest improvements for the safety profile section");
                              handleAiQuerySubmit({ preventDefault: () => {} });
                            }}
                          >
                            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                            Regenerate Response
                          </Button>
                        </div>
                      </div>
                      
                      <form onSubmit={handleAiQuerySubmit} className="mt-3 flex gap-2">
                        <input
                          type="text"
                          className="flex-1 h-9 rounded-md border text-sm px-3"
                          placeholder="Ask the AI to help you complete this section or improve specific text..."
                          value={aiUserQuery}
                          onChange={(e) => setAiUserQuery(e.target.value)}
                          disabled={aiIsLoading}
                        />
                        <Button 
                          type="submit"
                          size="sm" 
                          className="h-9"
                          disabled={aiIsLoading || !aiUserQuery.trim()}
                        >
                          <Send className="h-4 w-4 mr-1.5" />
                          Ask AI
                        </Button>
                      </form>
                    </div>
                  )}
                </TabsContent>
                
                {/* Preview Tab Content */}
                <TabsContent value="view" className="pt-4 space-y-4">
                  <div className="border rounded-md p-6">
                    <div className="prose prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-600 max-w-none">
                      <h1>2.5 Clinical Overview</h1>
                      <h2>2.5.5 Safety Profile</h2>
                      
                      <p>
                        The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects).
                      </p>
                      <p>
                        The efficacy of Drug X was evaluated across multiple endpoints. Primary endpoints showed a statistically significant improvement compared to placebo (p&lt;0.001) with consistent results across all study sites.
                      </p>
                      <p>
                        No serious adverse events were considered related to the study medication, and the discontinuation rate due to adverse events was low (3.2%), comparable to placebo (2.8%).
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Changes Tab Content */}
                <TabsContent value="history" className="pt-4 space-y-4">
                  <div className="border rounded-md divide-y">
                    <div className="p-3 bg-slate-50 flex justify-between items-center">
                      <div className="flex items-center text-sm font-medium">
                        <History className="h-4 w-4 mr-1.5 text-blue-600" />
                        Recent Changes
                      </div>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        View Full History
                      </Button>
                    </div>
                    
                    <div className="p-3 flex items-start space-x-3">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium">JD</div>
                        <div className="w-0.5 bg-slate-200 h-full mt-2"></div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">John Doe</div>
                        <div className="text-xs text-slate-500">Updated safety profile section</div>
                        <div className="text-xs text-slate-400">Today at 10:32 AM</div>
                        <div className="mt-2 border-l-2 border-blue-400 pl-3 ml-1 text-sm">
                          <p>Added additional data on adverse event rates and discontinuation percentages.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 flex items-start space-x-3">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-medium">SW</div>
                        <div className="w-0.5 bg-slate-200 h-full mt-2"></div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Sarah Williams</div>
                        <div className="text-xs text-slate-500">Edited introduction paragraph</div>
                        <div className="text-xs text-slate-400">Yesterday at 4:15 PM</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
      
      {/* Microsoft Word 365 Integration */}
      <Dialog open={msWordPopupOpen} onOpenChange={setMsWordPopupOpen} className="max-w-[90%] w-[1200px]">
        <DialogContent className="max-w-[90%] w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Microsoft Word 365 - {selectedDocument?.title || "Module 2.5 Clinical Overview"}
            </DialogTitle>
            <DialogDescription>
              The genuine Microsoft Word 365 experience, embedded directly in TrialSage.
            </DialogDescription>
          </DialogHeader>
          
          <Suspense fallback={<div className="py-20 text-center">Loading Microsoft Word 365...</div>}>
            <Office365WordEmbed 
              documentId={selectedDocument?.id?.toString() || 'current-doc'}
              initialContent="The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects)."
              onSave={(content) => {
                console.log("Saving document content from Microsoft Word 365:", content);
                toast({
                  title: "Document Updated",
                  description: "Your changes from Microsoft Word 365 have been saved to the document vault.",
                  variant: "default",
                });
                setMsWordPopupOpen(false);
              }}
              onClose={() => setMsWordPopupOpen(false)}
            />
          </Suspense>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setMsWordPopupOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <History className="h-5 w-5 mr-2" />
              Document Version History
            </DialogTitle>
            <DialogDescription>
              Review previous versions of this document. You can compare versions or restore a previous version.
            </DialogDescription>
          </DialogHeader>
          
          <div className="border rounded-md">
            <div className="grid grid-cols-5 gap-4 p-3 border-b bg-slate-50 font-medium text-sm">
              <div>Version</div>
              <div className="col-span-2">Changes</div>
              <div>Date</div>
              <div>Author</div>
            </div>
            
            <div className="divide-y max-h-[300px] overflow-y-auto">
              {versionHistory.map((version) => (
                <div key={version.id} className="grid grid-cols-5 gap-4 p-3 text-sm hover:bg-slate-50">
                  <div className="font-medium">
                    {version.name}
                    {version.status === 'Current' && (
                      <Badge className="ml-2 h-5 bg-green-100 text-green-800 border-green-200 text-[10px]">Current</Badge>
                    )}
                  </div>
                  <div className="col-span-2">{version.changes}</div>
                  <div>{version.date}</div>
                  <div className="flex justify-between items-center">
                    <span>{version.author}</span>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          setCompareVersions({
                            base: activeVersion, 
                            compare: version.id
                          });
                          setShowVersionHistory(false);
                          setShowCompareDialog(true);
                        }}
                        title="Compare with current version"
                      >
                        <GitMerge className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          setActiveVersion(version.id);
                          setShowVersionHistory(false);
                        }}
                        title="View this version"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t pt-3 mt-3">
            <div className="text-xs text-muted-foreground flex items-center">
              <Info className="h-3 w-3 mr-1 text-blue-500" />
              All versions are stored securely in Vault with 21 CFR Part 11 compliant audit trails
            </div>
            <Button onClick={() => setShowVersionHistory(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Version Comparison Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog} className="max-w-4xl">
        <DialogContent className="sm:max-w-[900px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <GitMerge className="h-5 w-5 mr-2" />
              Compare Document Versions
            </DialogTitle>
            <DialogDescription>
              Comparing {compareVersions.base} with {compareVersions.compare}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col h-full overflow-hidden">
            <Tabs defaultValue="side-by-side" className="w-full mb-4">
              <TabsList className="grid w-[400px] grid-cols-2">
                <TabsTrigger value="side-by-side" className="flex items-center">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Side-by-Side View
                </TabsTrigger>
                <TabsTrigger value="inline" className="flex items-center">
                  <GitMerge className="h-4 w-4 mr-2" />
                  Inline Differences
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="side-by-side" className="mt-4">
                <div className="grid grid-cols-2 gap-4 overflow-auto flex-grow">
                  <div className="border rounded-md overflow-auto">
                    <div className="bg-slate-50 p-2 font-medium border-b sticky top-0">
                      {compareVersions.base} (Current)
                    </div>
                    <div className="p-3 text-sm">
                      <p className="mb-2">
                        <span className="bg-green-100 px-1">The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects.</span> Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects).
                      </p>
                      <p className="mb-2">
                        The efficacy of Drug X was evaluated across multiple endpoints. <span className="bg-green-100 px-1">Primary endpoints showed a statistically significant improvement compared to placebo (p&lt;0.001)</span> with consistent results across all study sites.
                      </p>
                      <p className="mb-2">
                        Long-term safety data from extension studies (up to 24 months) <span className="bg-red-100 px-1 line-through">showed no new safety signals</span> and confirmed the favorable benefit-risk profile observed in shorter studies.
                      </p>
                    </div>
                  </div>
                  
                  <div className="border rounded-md overflow-auto">
                    <div className="bg-slate-50 p-2 font-medium border-b sticky top-0">
                      {compareVersions.compare}
                    </div>
                    <div className="p-3 text-sm">
                      <p className="mb-2">
                        The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects).
                      </p>
                      <p className="mb-2">
                        The efficacy of Drug X was evaluated across multiple endpoints. Primary endpoints showed a statistically significant improvement compared to placebo (p&lt;0.001) with consistent results across all study sites.
                      </p>
                      <p className="mb-2">
                        Long-term safety data from extension studies (up to 24 months) <span className="bg-green-100 px-1">demonstrated a continued absence of significant safety concerns</span> and confirmed the favorable benefit-risk profile observed in shorter studies.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="inline" className="mt-4">
                <div className="border rounded-md max-h-[400px] overflow-auto">
                  <div className="bg-slate-50 p-2 font-medium border-b sticky top-0">
                    Inline Changes
                  </div>
                  <div className="p-3 text-sm">
                    <p className="mb-2">
                      <span className="bg-blue-50 px-1 border-l-4 border-blue-400 pl-2">The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. Adverse events were mild to moderate in nature, with headache being the most commonly reported event (12% of subjects).</span>
                    </p>
                    <p className="mb-2">
                      <span className="bg-blue-50 px-1 border-l-4 border-blue-400 pl-2">The efficacy of Drug X was evaluated across multiple endpoints. Primary endpoints showed a statistically significant improvement compared to placebo (p&lt;0.001) with consistent results across all study sites.</span>
                    </p>
                    <p className="mb-2">
                      Long-term safety data from extension studies (up to 24 months) 
                      <span className="bg-red-100 px-1 mx-1 line-through">showed no new safety signals</span>
                      <span className="bg-green-100 px-1 mx-1">demonstrated a continued absence of significant safety concerns</span>
                      and confirmed the favorable benefit-risk profile observed in shorter studies.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Plus className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">Added</span>
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Minus className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">Removed</span>
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Info className="h-3 w-3 text-blue-600" />
                  <span className="text-blue-600">Unchanged</span>
                </Badge>
              </div>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveVersion(compareVersions.compare)}
                  className="border-green-200 text-green-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restore This Version
                </Button>
                <Button onClick={() => setShowCompareDialog(false)}>Close</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Team Collaboration Dialog */}
      <Dialog open={teamCollabOpen} onOpenChange={setTeamCollabOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Team Collaboration
            </DialogTitle>
            <DialogDescription>
              View team members working on this document and manage access permissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border rounded-md">
              <div className="bg-slate-50 p-2 font-medium border-b text-sm">Active Collaborators</div>
              <div className="divide-y">
                <div className="p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium mr-3">JD</div>
                    <div>
                      <div className="font-medium">John Doe</div>
                      <div className="text-xs text-gray-500">Editor</div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Editing</Badge>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium mr-3">JS</div>
                    <div>
                      <div className="font-medium">Jane Smith</div>
                      <div className="text-xs text-gray-500">Reviewer</div>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">Viewing</Badge>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md">
              <div className="bg-slate-50 p-2 font-medium border-b text-sm">Document Access Controls</div>
              <div className="p-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Document Locking</div>
                    <Button
                      size="sm"
                      variant={documentLocked ? "destructive" : "outline"}
                      onClick={() => setDocumentLocked(!documentLocked)}
                      className="h-8"
                    >
                      {documentLocked ? (
                        <>
                          <Lock className="h-3.5 w-3.5 mr-1.5" />
                          Unlock Document
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5 mr-1.5" />
                          Lock for Editing
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    {documentLocked ? 
                      "Document is currently locked. Only you can make changes." : 
                      "Lock the document to prevent others from making changes while you edit."}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <div className="text-xs text-muted-foreground flex items-center">
              <Info className="h-3 w-3 mr-1 text-blue-500" />
              All document access is logged for audit purposes
            </div>
            <Button onClick={() => setTeamCollabOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Document Validation Dialog */}
      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileCheck className="h-5 w-5 mr-2" />
              Document Validation Report
            </DialogTitle>
            <DialogDescription>
              Detailed validation results for Module 2.5 Clinical Overview
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-grow overflow-auto">
            <Tabs defaultValue="issues" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="issues" className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Issues ({validationResults.issues.length})
                </TabsTrigger>
                <TabsTrigger value="compliance" className="flex items-center">
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Compliance
                </TabsTrigger>
                <TabsTrigger value="references" className="flex items-center">
                  <Link className="h-4 w-4 mr-2" />
                  References
                </TabsTrigger>
                <TabsTrigger value="guidance" className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Guidance
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="issues" className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Validation Issues</h3>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="flex items-center space-x-1 bg-red-50 text-red-700 border-red-200">
                      <AlertCircle className="h-3 w-3" />
                      <span>Critical: 1</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1 bg-amber-50 text-amber-700 border-amber-200">
                      <AlertCircle className="h-3 w-3" />
                      <span>Major: 1</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1 bg-blue-50 text-blue-700 border-blue-200">
                      <Info className="h-3 w-3" />
                      <span>Minor: 2</span>
                    </Badge>
                  </div>
                </div>
                
                <div className="border rounded-md">
                  <div className="grid grid-cols-5 gap-4 p-3 border-b bg-slate-50 font-medium text-sm">
                    <div>Severity</div>
                    <div>Location</div>
                    <div className="col-span-2">Issue</div>
                    <div>Action</div>
                  </div>
                  
                  <div className="divide-y max-h-[300px] overflow-y-auto">
                    {validationResults.issues.map((issue) => (
                      <div key={issue.id} className="grid grid-cols-5 gap-4 p-3 text-sm hover:bg-slate-50">
                        <div>
                          {issue.severity === 'critical' && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>
                          )}
                          {issue.severity === 'major' && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200">Major</Badge>
                          )}
                          {issue.severity === 'minor' && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Minor</Badge>
                          )}
                          {issue.severity === 'info' && (
                            <Badge className="bg-slate-100 text-slate-800 border-slate-200">Info</Badge>
                          )}
                        </div>
                        <div className="font-medium">Section {issue.section}</div>
                        <div className="col-span-2">
                          <div>{issue.description}</div>
                          <div className="text-xs text-slate-500 mt-1">Suggestion: {issue.suggestion}</div>
                        </div>
                        <div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 border-blue-200 text-blue-700"
                          >
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Fix Issue
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 border rounded-md p-3">
                  <h4 className="font-medium text-sm mb-2 flex items-center">
                    <FileWarning className="h-4 w-4 mr-2 text-amber-600" />
                    AI-Powered Recommendation
                  </h4>
                  <p className="text-sm text-slate-600">
                    Based on analysis of your document and regulatory requirements, we recommend addressing the critical citation issue in Section 2.5.4 first. Consider using the Citation Assistant to automatically search for relevant references from your literature database.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="compliance" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Regulatory Compliance</h3>
                    <div className="border rounded-md p-4 space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>FDA Guidelines Compliance</span>
                          <span className="font-medium">{validationResults.regulatory}%</span>
                        </div>
                        <Progress value={validationResults.regulatory} className="h-2 bg-slate-100" indicatorClassName="bg-green-600" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>ICH M4 Compliance</span>
                          <span className="font-medium">94%</span>
                        </div>
                        <Progress value={94} className="h-2 bg-slate-100" indicatorClassName="bg-green-600" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>EMA Guidelines Compliance</span>
                          <span className="font-medium">81%</span>
                        </div>
                        <Progress value={81} className="h-2 bg-slate-100" indicatorClassName="bg-green-600" />
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium text-sm mb-3">Missing Required Elements</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                            <span className="text-xs">!</span>
                          </div>
                          <div>Comprehensive risk-benefit analysis in section 2.5.6</div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                            <span className="text-xs">!</span>
                          </div>
                          <div>Discussion of results in specific populations (elderly, pediatric)</div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Content Assessment</h3>
                    <div className="border rounded-md p-4 space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Content Completeness</span>
                          <span className="font-medium">{validationResults.completeness}%</span>
                        </div>
                        <Progress value={validationResults.completeness} className="h-2 bg-slate-100" indicatorClassName="bg-blue-600" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Internal Consistency</span>
                          <span className="font-medium">{validationResults.consistency}%</span>
                        </div>
                        <Progress value={validationResults.consistency} className="h-2 bg-slate-100" indicatorClassName="bg-green-600" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Scientific Accuracy</span>
                          <span className="font-medium">89%</span>
                        </div>
                        <Progress value={89} className="h-2 bg-slate-100" indicatorClassName="bg-green-600" />
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium text-sm mb-3">Documentation Consistency</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Consistent with Investigator's Brochure
                          </div>
                          <Badge className="bg-green-100 text-green-700">Verified</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Consistent with Non-Clinical Overview
                          </div>
                          <Badge className="bg-green-100 text-green-700">Verified</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2 text-amber-600" />
                            Consistent with Clinical Study Reports
                          </div>
                          <Badge className="bg-amber-100 text-amber-700">Needs Review</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="references" className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Reference Analysis</h3>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="flex items-center space-x-1 bg-blue-50 text-blue-700 border-blue-200">
                      <Link className="h-3 w-3" />
                      <span>Total: 47</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1 bg-red-50 text-red-700 border-red-200">
                      <AlertCircle className="h-3 w-3" />
                      <span>Missing: 8</span>
                    </Badge>
                  </div>
                </div>
                
                <div className="border rounded-md">
                  <div className="flex justify-between items-center p-3 bg-slate-50 border-b">
                    <h4 className="font-medium text-sm">Reference Validation Status</h4>
                    <div className="flex items-center space-x-2">
                      <div className="text-xs bg-slate-100 px-2 py-1 rounded flex items-center">
                        <Filter className="h-3 w-3 mr-1" />
                        Filter
                      </div>
                      <div className="text-xs bg-slate-100 px-2 py-1 rounded flex items-center">
                        <CheckSquare className="h-3 w-3 mr-1" />
                        Select All
                      </div>
                    </div>
                  </div>
                  
                  <div className="divide-y max-h-[300px] overflow-y-auto">
                    <div className="p-3 hover:bg-slate-50">
                      <div className="flex justify-between">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-sm">Missing citation in Section 2.5.4</div>
                            <div className="text-xs text-slate-500 mt-1">Claim about efficacy requires statistical significance reference</div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 border-blue-200 text-blue-700"
                        >
                          <Link className="h-3 w-3 mr-1" />
                          Add Reference
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-3 hover:bg-slate-50">
                      <div className="flex justify-between">
                        <div className="flex items-start space-x-2">
                          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-sm">Reference format inconsistency</div>
                            <div className="text-xs text-slate-500 mt-1">Multiple citation styles detected (Vancouver and APA)</div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 border-blue-200 text-blue-700"
                        >
                          <CheckSquare className="h-3 w-3 mr-1" />
                          Standardize
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-3 hover:bg-slate-50">
                      <div className="flex justify-between">
                        <div className="flex items-start space-x-2">
                          <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-sm">Outdated reference in Section 2.5.3</div>
                            <div className="text-xs text-slate-500 mt-1">Reference #18 has been superseded by newer publication</div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 border-blue-200 text-blue-700"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Update
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-sm bg-slate-50 p-3 rounded-md border">
                  <HelpCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Reference Management Tips</p>
                    <p className="mt-1 text-slate-600">
                      You can use the AI Reference Assistant to automatically scan your document for claims requiring citations and match them with appropriate references from your literature database.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="guidance" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="border rounded-md">
                    <div className="bg-slate-50 p-3 border-b font-medium">
                      Applicable Regulatory Guidance
                    </div>
                    <div className="divide-y">
                      <div className="p-3 hover:bg-slate-50">
                        <div className="flex items-start space-x-2">
                          <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-sm">ICH M4E(R2) - Guideline on Clinical Overview and Clinical Summary</div>
                            <div className="text-xs text-slate-500 mt-1">Last updated: January 2023</div>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-6 px-0 text-blue-600"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Guidance Document
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 hover:bg-slate-50">
                        <div className="flex items-start space-x-2">
                          <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-sm">FDA Guidance - Format and Content of the Clinical and Statistical Sections</div>
                            <div className="text-xs text-slate-500 mt-1">Last updated: March 2022</div>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-6 px-0 text-blue-600"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Guidance Document
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 hover:bg-slate-50">
                        <div className="flex items-start space-x-2">
                          <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-sm">EMA Clinical Documentation Requirements</div>
                            <div className="text-xs text-slate-500 mt-1 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1 text-amber-600" />
                              Updated April 2025 (newer version available)
                            </div>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-6 px-0 text-blue-600"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Guidance Document
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md">
                    <div className="bg-slate-50 p-3 border-b font-medium">
                      Technical Guidance & Best Practices
                    </div>
                    <div className="p-4 space-y-3">
                      <h4 className="font-medium text-sm">Section 2.5.4 - Analysis of Clinical Information</h4>
                      <div className="text-sm text-slate-600">
                        <p className="mb-2">This section should include a detailed and critical analysis of all clinical data submitted in the clinical study reports. Key components include:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Study designs and key study endpoints</li>
                          <li>Statistical approaches and analyses</li>
                          <li>Comparative efficacy and safety across all studies</li>
                          <li>Patient exposure with identification of safety database</li>
                          <li>Analysis of intrinsic and extrinsic factors on efficacy and safety</li>
                        </ul>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button variant="outline" size="sm" className="border-blue-200 text-blue-700">
                          <FileCheck className="h-4 w-4 mr-2" />
                          View Template
                        </Button>
                        <Button variant="outline" size="sm" className="border-green-200 text-green-700">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Best Practices
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="flex items-center justify-between border-t pt-4 mt-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-blue-200 text-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-purple-200 text-purple-700"
              >
                <Info className="h-4 w-4 mr-2" />
                AI Analysis
              </Button>
            </div>
            <Button onClick={() => setShowValidationDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Document Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Export Document
            </DialogTitle>
            <DialogDescription>
              Customize export options for Module 2.5 Clinical Overview
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Export Format</label>
                <div className="flex flex-col space-y-2">
                  <div 
                    className={`border rounded-md p-3 cursor-pointer hover:bg-slate-50 flex items-center space-x-2 ${exportFormat === 'pdf' ? 'border-blue-500 bg-blue-50' : ''}`}
                    onClick={() => setExportFormat('pdf')}
                  >
                    <div className={`w-4 h-4 rounded-full border ${exportFormat === 'pdf' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`} />
                    <span>PDF Format</span>
                  </div>
                  <div 
                    className={`border rounded-md p-3 cursor-pointer hover:bg-slate-50 flex items-center space-x-2 ${exportFormat === 'word' ? 'border-blue-500 bg-blue-50' : ''}`}
                    onClick={() => setExportFormat('word')}
                  >
                    <div className={`w-4 h-4 rounded-full border ${exportFormat === 'word' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`} />
                    <span>Word Document</span>
                  </div>
                  <div 
                    className={`border rounded-md p-3 cursor-pointer hover:bg-slate-50 flex items-center space-x-2 ${exportFormat === 'html' ? 'border-blue-500 bg-blue-50' : ''}`}
                    onClick={() => setExportFormat('html')}
                  >
                    <div className={`w-4 h-4 rounded-full border ${exportFormat === 'html' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`} />
                    <span>HTML Format</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Export Options</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-slate-50">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600"
                      checked={exportOptions.includeComments} 
                      onChange={() => setExportOptions({...exportOptions, includeComments: !exportOptions.includeComments})}
                    />
                    <span className="text-sm">Include Comments</span>
                  </label>
                  <label className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-slate-50">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600"
                      checked={exportOptions.includeTrackChanges} 
                      onChange={() => setExportOptions({...exportOptions, includeTrackChanges: !exportOptions.includeTrackChanges})}
                    />
                    <span className="text-sm">Include Track Changes</span>
                  </label>
                  <label className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-slate-50">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600"
                      checked={exportOptions.includeCoverPage} 
                      onChange={() => setExportOptions({...exportOptions, includeCoverPage: !exportOptions.includeCoverPage})}
                    />
                    <span className="text-sm">Include Cover Page</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-3 bg-blue-50 text-blue-800 text-sm flex items-start space-x-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p>Documents will be exported with 21 CFR Part 11 compliance information and audit trail details attached as metadata.</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setShowExportDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowExportDialog(false)}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}