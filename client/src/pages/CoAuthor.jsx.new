import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import * as aiService from '../services/aiService';
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
      id: 1,
      name: 'Clinical Overview Template - ICH Compliant',
      category: 'Module 2.5',
      lastUpdated: '2 days ago',
      regions: [
        { id: 1, region: 'FDA' },
        { id: 2, region: 'EMA' },
        { id: 3, region: 'PMDA' }
      ]
    },
    {
      id: 2,
      name: 'CMC Section Template - Small Molecule API',
      category: 'Module 3.2.S',
      lastUpdated: '1 week ago',
      regions: [
        { id: 1, region: 'FDA' },
        { id: 2, region: 'EMA' }
      ]
    },
    {
      id: 3,
      name: 'NDA Cover Letter Template',
      category: 'Module 1.1',
      lastUpdated: '2 weeks ago',
      regions: [
        { id: 1, region: 'FDA' }
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
              <Badge variant="outline" className="border-blue-200 text-sm">
                Version: {selectedDocument.version}
              </Badge>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className={`flex-1 flex overflow-hidden`}>
        {/* Document Tree Navigation */}
        {isTreeOpen && (
          <div className="w-64 border-r border-gray-200 overflow-y-auto pb-20 flex-shrink-0 bg-gray-50">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-800">eCTD Structure</h3>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <RefreshCw className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Find document..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-2">
              {/* Module 1 */}
              <div className="mb-1">
                <div className="flex items-center p-2 rounded-md hover:bg-blue-50 cursor-pointer border-l-4 border-blue-500">
                  <ChevronDown className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium text-blue-700">Module 1: Administrative</span>
                </div>
                <div className="ml-5 space-y-0.5">
                  <div className="flex items-center p-1.5 rounded hover:bg-gray-100 cursor-pointer">
                    <div className="w-5 h-5 flex items-center justify-center mr-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                    </div>
                    <span className="text-sm">1.1 Cover Letter</span>
                  </div>
                  <div className="flex items-center p-1.5 rounded hover:bg-gray-100 cursor-pointer">
                    <div className="w-5 h-5 flex items-center justify-center mr-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                    </div>
                    <span className="text-sm">1.2 Application Form</span>
                  </div>
                </div>
              </div>

              {/* Module 2 */}
              <div className="mb-1">
                <div className="flex items-center p-2 rounded-md hover:bg-blue-50 cursor-pointer">
                  <ChevronRight className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium">Module 2: CTD Summaries</span>
                </div>
              </div>

              {/* Module 3 */}
              <div className="mb-1">
                <div className="flex items-center p-2 rounded-md hover:bg-blue-50 cursor-pointer">
                  <ChevronRight className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium">Module 3: Quality</span>
                </div>
              </div>

              {/* Module 4 */}
              <div className="mb-1">
                <div className="flex items-center p-2 rounded-md hover:bg-blue-50 cursor-pointer">
                  <ChevronRight className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium">Module 4: Nonclinical</span>
                </div>
              </div>

              {/* Module 5 */}
              <div className="mb-1">
                <div className="flex items-center p-2 rounded-md hover:bg-blue-50 cursor-pointer">
                  <ChevronRight className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium">Module 5: Clinical</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Document Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Document editing toolbar */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-2 bg-white z-10">
            <div className="flex items-center space-x-3">
              {selectedDocument ? (
                <>
                  <h2 className="font-semibold text-lg">{selectedDocument.title}</h2>
                  <Badge className={
                    selectedDocument.status === 'Final' ? 'bg-green-100 text-green-800' :
                    selectedDocument.status === 'In Review' ? 'bg-blue-100 text-blue-800' :
                    selectedDocument.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {selectedDocument.status}
                  </Badge>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Open Document
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <FilePlus2 className="h-4 w-4 mr-2" />
                    New Document
                  </Button>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowValidationDialog(true)}
                className="flex items-center"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Validate
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowExportDialog(true)}
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              {documentLocked ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center text-red-600 border-red-200"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Locked by {lockedBy}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => { setDocumentLocked(true); setLockedBy('You'); }}
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Document Content */}
          <div className="flex-1 overflow-auto p-6 bg-gray-50">
            {selectedDocument ? (
              <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8 border border-gray-200">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">2.5 Clinical Overview</h1>
                
                <div className="prose max-w-none">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">2.5.5 Overview of Safety</h2>
                  
                  <p className="mb-4">
                    The safety profile of Drug X was assessed in 6 randomized controlled trials involving 1,245 subjects. 
                    Adverse events were mild to moderate in nature, with headache being the most commonly reported event 
                    (12% of subjects).
                  </p>
                  
                  <p className="mb-4">
                    Serious adverse events were reported in 2.3% of treated subjects compared to 2.1% in the placebo group, 
                    indicating no significant increase in serious adverse events with Drug X treatment.
                  </p>
                  
                  <h3 className="text-lg font-semibold mb-3 mt-6 text-gray-700">2.5.5.1 Adverse Events</h3>
                  
                  <p className="mb-4">
                    The most common adverse events (≥5% and greater than placebo) were:
                  </p>
                  
                  <ul className="list-disc pl-8 mb-6">
                    <li>Headache (12%)</li>
                    <li>Nausea (8%)</li>
                    <li>Dizziness (6%)</li>
                    <li>Fatigue (5%)</li>
                  </ul>
                  
                  <p className="mb-4">
                    Most adverse events were mild to moderate in severity and resolved without intervention. 
                    Discontinuation due to adverse events occurred in 3.2% of Drug X-treated subjects compared to 
                    2.8% in the placebo group.
                  </p>
                  
                  <h3 className="text-lg font-semibold mb-3 mt-6 text-gray-700">2.5.5.2 Laboratory Findings</h3>
                  
                  <p className="mb-4">
                    No clinically meaningful changes in laboratory parameters were observed during the clinical development 
                    program. Minor elevations in liver enzymes (ALT/AST) were observed in 2% of treated subjects, 
                    compared to 1.8% in the placebo group, all of which were transient and resolved without intervention.
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto mt-20 text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No Document Selected</h3>
                <p className="text-gray-500 mb-6">Open a document from the navigation tree or create a new one to get started.</p>
                <div className="flex justify-center space-x-3">
                  <Button size="sm" className="flex items-center">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Open Existing
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center">
                    <FilePlus2 className="h-4 w-4 mr-2" />
                    Create New
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        {aiAssistantOpen && (
          <div className="w-80 border-l border-gray-200 flex flex-col bg-blue-50/50 flex-shrink-0">
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center text-blue-700">
                  <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                  AI Document Assistant
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0"
                  onClick={() => setAiAssistantOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <Tabs defaultValue="suggestions" className="w-full">
                <TabsList className="grid grid-cols-3 mb-2">
                  <TabsTrigger value="suggestions" onClick={() => setAiAssistantMode('suggestions')}>Suggest</TabsTrigger>
                  <TabsTrigger value="compliance" onClick={() => setAiAssistantMode('compliance')}>Compliance</TabsTrigger>
                  <TabsTrigger value="formatting" onClick={() => setAiAssistantMode('formatting')}>Format</TabsTrigger>
                </TabsList>
                
                <TabsContent value="suggestions" className="mt-0">
                  <p className="text-xs text-gray-500 mb-2">
                    Get intelligent content suggestions for your document
                  </p>
                </TabsContent>
                <TabsContent value="compliance" className="mt-0">
                  <p className="text-xs text-gray-500 mb-2">
                    Check compliance with regulatory guidelines
                  </p>
                </TabsContent>
                <TabsContent value="formatting" className="mt-0">
                  <p className="text-xs text-gray-500 mb-2">
                    Analyze and improve document formatting
                  </p>
                </TabsContent>
              </Tabs>
              
              <form onSubmit={handleAiQuerySubmit} className="mt-2">
                <div className="relative">
                  <textarea
                    placeholder={aiAssistantMode === 'suggestions' 
                      ? "Ask for content suggestions..." 
                      : aiAssistantMode === 'compliance'
                      ? "Ask about regulatory compliance..."
                      : "Ask about formatting issues..."
                    }
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-blue-500 min-h-[80px] pr-10"
                    value={aiUserQuery}
                    onChange={(e) => setAiUserQuery(e.target.value)}
                  ></textarea>
                  <Button 
                    type="submit"
                    className="absolute bottom-2 right-2 h-7 w-7 p-0 rounded-full bg-blue-600 text-white"
                    disabled={aiIsLoading || !aiUserQuery.trim()}
                  >
                    {aiIsLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </form>
            </div>
            
            <div className="flex-1 overflow-auto p-3 space-y-3">
              {aiError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>{aiError}</span>
                  </div>
                </div>
              )}
              
              {aiResponse && (
                <div className="bg-white rounded-md border border-blue-100 p-3 shadow-sm">
                  <div className="flex items-start mb-2">
                    <Bot className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="font-medium text-sm text-blue-800">AI Assistant</span>
                  </div>
                  <div className="text-sm pl-6">
                    {typeof aiResponse === 'string' ? (
                      <p>{aiResponse}</p>
                    ) : (
                      <>
                        {aiResponse.suggestion && <p className="mb-2">{aiResponse.suggestion}</p>}
                        {aiResponse.issues && aiResponse.issues.length > 0 && (
                          <ul className="list-disc pl-5 space-y-1 mt-2">
                            {aiResponse.issues.map((issue, i) => (
                              <li key={i} className="text-xs text-gray-700">{issue}</li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* AI Suggestions */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">
                  Suggestions for Current Section
                </h4>
                
                {aiSuggestions.map(suggestion => (
                  <div 
                    key={suggestion.id} 
                    className={`rounded-md border p-2 text-sm ${
                      suggestion.accepted 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-sm ${
                        suggestion.type === 'completion' 
                          ? 'bg-blue-100 text-blue-800' 
                          : suggestion.type === 'formatting'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {suggestion.type === 'completion' 
                          ? 'Content' 
                          : suggestion.type === 'formatting'
                          ? 'Format'
                          : 'Compliance'
                        }
                      </span>
                      <span className="text-xs text-gray-500">{suggestion.section}</span>
                    </div>
                    <p className="text-gray-700 text-sm mb-1">{suggestion.text}</p>
                    <div className="flex justify-end space-x-1">
                      {!suggestion.accepted && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-gray-500"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-blue-600"
                            onClick={() => {
                              const updatedSuggestions = aiSuggestions.map(s => 
                                s.id === suggestion.id ? {...s, accepted: true} : s
                              );
                              setAiSuggestions(updatedSuggestions);
                              
                              toast({
                                title: "Suggestion Applied",
                                description: "The AI suggestion has been applied to your document.",
                                variant: "default",
                              });
                            }}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Apply
                          </Button>
                        </>
                      )}
                      {suggestion.accepted && (
                        <span className="text-xs text-green-600 flex items-center">
                          <Check className="h-3 w-3 mr-1" />
                          Applied
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Team Collaboration Dialog */}
      <Dialog open={teamCollabOpen} onOpenChange={setTeamCollabOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Team Collaboration
            </DialogTitle>
            <DialogDescription>
              Manage document access and control for your team
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {selectedDocument ? (
              <>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Current Document</h3>
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{selectedDocument.title}</p>
                      <p className="text-sm text-gray-500">Last edited by {selectedDocument.editedBy} • {selectedDocument.lastEdited}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={`flex items-center ${documentLocked ? 'text-red-600 border-red-200' : ''}`}
                      onClick={() => {
                        setDocumentLocked(!documentLocked);
                        setLockedBy(documentLocked ? null : 'You');
                      }}
                    >
                      {documentLocked ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Unlock
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Lock for Editing
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Reviewers</h3>
                  <div className="space-y-2">
                    {selectedDocument.reviewers.length > 0 ? (
                      selectedDocument.reviewers.map((reviewer, index) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded-md">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <span className="text-blue-700 font-medium">{reviewer.split(' ').map(n => n[0]).join('')}</span>
                            </div>
                            <span>{reviewer}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <X className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-3 border rounded-md text-gray-500 text-sm">
                        No reviewers assigned
                      </div>
                    )}
                    
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Reviewer
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <FileWarning className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">No Document Selected</h3>
                <p className="text-gray-500 text-sm mb-4">Please select a document to manage team collaboration</p>
                <Button size="sm">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Open Document
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeamCollabOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <History className="h-5 w-5 mr-2 text-blue-600" />
              Version History
            </DialogTitle>
            <DialogDescription>
              View and compare document versions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              {versionHistory.map((version) => (
                <div 
                  key={version.id} 
                  className={`flex justify-between items-center p-3 border rounded-md ${
                    version.status === 'Current' ? 'border-blue-200 bg-blue-50' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium">{version.name}</span>
                      {version.status === 'Current' && (
                        <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">Current</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {version.author} • {version.date}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      {version.changes}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setActiveVersion(version.id);
                        setCompareVersions({...compareVersions, base: version.id});
                        setShowVersionHistory(false);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setCompareVersions({...compareVersions, compare: version.id});
                        setShowCompareDialog(true);
                        setShowVersionHistory(false);
                      }}
                    >
                      <GitMerge className="h-3.5 w-3.5 mr-1.5" />
                      Compare
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVersionHistory(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Validation Dialog */}
      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ClipboardCheck className="h-5 w-5 mr-2 text-blue-600" />
              Document Validation
            </DialogTitle>
            <DialogDescription>
              Check your document against regulatory requirements
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">Completeness</h3>
                  <span className={`text-sm font-medium ${
                    validationResults.completeness >= 90 ? 'text-green-600' : 
                    validationResults.completeness >= 70 ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {validationResults.completeness}%
                  </span>
                </div>
                <Progress 
                  value={validationResults.completeness} 
                  className={`h-2 ${
                    validationResults.completeness >= 90 ? 'bg-green-100' : 
                    validationResults.completeness >= 70 ? 'bg-yellow-100' : 
                    'bg-red-100'
                  }`}
                  indicatorClassName={
                    validationResults.completeness >= 90 ? 'bg-green-600' : 
                    validationResults.completeness >= 70 ? 'bg-yellow-600' : 
                    'bg-red-600'
                  }
                />
              </div>
              
              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">Consistency</h3>
                  <span className={`text-sm font-medium ${
                    validationResults.consistency >= 90 ? 'text-green-600' : 
                    validationResults.consistency >= 70 ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {validationResults.consistency}%
                  </span>
                </div>
                <Progress 
                  value={validationResults.consistency} 
                  className={`h-2 ${
                    validationResults.consistency >= 90 ? 'bg-green-100' : 
                    validationResults.consistency >= 70 ? 'bg-yellow-100' : 
                    'bg-red-100'
                  }`}
                  indicatorClassName={
                    validationResults.consistency >= 90 ? 'bg-green-600' : 
                    validationResults.consistency >= 70 ? 'bg-yellow-600' : 
                    'bg-red-600'
                  }
                />
              </div>
              
              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">References</h3>
                  <span className={`text-sm font-medium ${
                    validationResults.references >= 90 ? 'text-green-600' : 
                    validationResults.references >= 70 ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {validationResults.references}%
                  </span>
                </div>
                <Progress 
                  value={validationResults.references} 
                  className={`h-2 ${
                    validationResults.references >= 90 ? 'bg-green-100' : 
                    validationResults.references >= 70 ? 'bg-yellow-100' : 
                    'bg-red-100'
                  }`}
                  indicatorClassName={
                    validationResults.references >= 90 ? 'bg-green-600' : 
                    validationResults.references >= 70 ? 'bg-yellow-600' : 
                    'bg-red-600'
                  }
                />
              </div>
              
              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">Regulatory</h3>
                  <span className={`text-sm font-medium ${
                    validationResults.regulatory >= 90 ? 'text-green-600' : 
                    validationResults.regulatory >= 70 ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {validationResults.regulatory}%
                  </span>
                </div>
                <Progress 
                  value={validationResults.regulatory} 
                  className={`h-2 ${
                    validationResults.regulatory >= 90 ? 'bg-green-100' : 
                    validationResults.regulatory >= 70 ? 'bg-yellow-100' : 
                    'bg-red-100'
                  }`}
                  indicatorClassName={
                    validationResults.regulatory >= 90 ? 'bg-green-600' : 
                    validationResults.regulatory >= 70 ? 'bg-yellow-600' : 
                    'bg-red-600'
                  }
                />
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-sm mb-2">Issues Found</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {validationResults.issues.map(issue => (
                  <div 
                    key={issue.id} 
                    className={`flex p-3 rounded-md border ${
                      issue.severity === 'critical' ? 'border-red-200 bg-red-50' :
                      issue.severity === 'major' ? 'border-orange-200 bg-orange-50' :
                      issue.severity === 'minor' ? 'border-yellow-200 bg-yellow-50' :
                      'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className={`mr-3 mt-0.5 flex-shrink-0 ${
                      issue.severity === 'critical' ? 'text-red-500' :
                      issue.severity === 'major' ? 'text-orange-500' :
                      issue.severity === 'minor' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`}>
                      {issue.severity === 'critical' ? (
                        <AlertCircle className="h-5 w-5" />
                      ) : issue.severity === 'major' ? (
                        <AlertCircle className="h-5 w-5" />
                      ) : issue.severity === 'minor' ? (
                        <AlertCircle className="h-5 w-5" />
                      ) : (
                        <Info className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded uppercase ${
                          issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          issue.severity === 'major' ? 'bg-orange-100 text-orange-800' :
                          issue.severity === 'minor' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {issue.severity}
                        </span>
                        <span className="ml-2 text-sm font-medium">{issue.section}</span>
                      </div>
                      <p className="text-sm mt-1 mb-1">{issue.description}</p>
                      <p className="text-sm text-gray-600 italic">{issue.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={() => {
                const percentages = [
                  validationResults.completeness,
                  validationResults.consistency,
                  validationResults.references,
                  validationResults.regulatory
                ];
                const average = percentages.reduce((a, b) => a + b, 0) / percentages.length;
                
                toast({
                  title: `Validation Score: ${Math.round(average)}%`,
                  description: `${validationResults.issues.length} issues found that need attention.`,
                  variant: average >= 80 ? "default" : "destructive",
                });
                
                setShowValidationDialog(false);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowValidationDialog(false)}
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  toast({
                    title: "AI Fix Requested",
                    description: "AI is analyzing and fixing issues. This may take a moment.",
                    variant: "default",
                  });
                  setShowValidationDialog(false);
                }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Auto-Fix with AI
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2 text-blue-600" />
              Export Document
            </DialogTitle>
            <DialogDescription>
              Choose your export format and options
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div>
              <h3 className="text-sm font-medium mb-2">Format</h3>
              <div className="grid grid-cols-3 gap-2">
                <div 
                  className={`border rounded-md p-3 text-center cursor-pointer transition-colors ${
                    exportFormat === 'pdf' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setExportFormat('pdf')}
                >
                  <FileText className={`h-6 w-6 mx-auto mb-1 ${exportFormat === 'pdf' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${exportFormat === 'pdf' ? 'text-blue-700' : 'text-gray-700'}`}>PDF</span>
                </div>
                <div 
                  className={`border rounded-md p-3 text-center cursor-pointer transition-colors ${
                    exportFormat === 'word' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setExportFormat('word')}
                >
                  <FileText className={`h-6 w-6 mx-auto mb-1 ${exportFormat === 'word' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${exportFormat === 'word' ? 'text-blue-700' : 'text-gray-700'}`}>Word</span>
                </div>
                <div 
                  className={`border rounded-md p-3 text-center cursor-pointer transition-colors ${
                    exportFormat === 'html' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setExportFormat('html')}
                >
                  <FileText className={`h-6 w-6 mx-auto mb-1 ${exportFormat === 'html' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${exportFormat === 'html' ? 'text-blue-700' : 'text-gray-700'}`}>HTML</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Options</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={exportOptions.includeComments}
                      onChange={(e) => setExportOptions({...exportOptions, includeComments: e.target.checked})}
                    />
                    Include comments
                  </label>
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={exportOptions.includeTrackChanges}
                      onChange={(e) => setExportOptions({...exportOptions, includeTrackChanges: e.target.checked})}
                    />
                    Include tracked changes
                  </label>
                  <GitBranch className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={exportOptions.includeCoverPage}
                      onChange={(e) => setExportOptions({...exportOptions, includeCoverPage: e.target.checked})}
                    />
                    Include cover page
                  </label>
                  <BookOpen className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={exportOptions.includeTableOfContents}
                      onChange={(e) => setExportOptions({...exportOptions, includeTableOfContents: e.target.checked})}
                    />
                    Include table of contents
                  </label>
                  <ListChecks className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={exportOptions.includeAppendices}
                      onChange={(e) => setExportOptions({...exportOptions, includeAppendices: e.target.checked})}
                    />
                    Include appendices
                  </label>
                  <Clipboard className="h-4 w-4 text-gray-400" />
                </div>
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
              onClick={() => {
                toast({
                  title: "Document Exported",
                  description: `Successfully exported to ${exportFormat.toUpperCase()} format.`,
                  variant: "default",
                });
                setShowExportDialog(false);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compare Versions Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <GitMerge className="h-5 w-5 mr-2 text-blue-600" />
              Compare Versions
            </DialogTitle>
            <DialogDescription>
              Compare changes between document versions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="flex justify-between space-x-4">
              <div className="flex-1">
                <h3 className="text-sm font-medium mb-2">Base Version</h3>
                <select 
                  className="w-full rounded-md border border-gray-300 p-2"
                  value={compareVersions.base}
                  onChange={(e) => setCompareVersions({...compareVersions, base: e.target.value})}
                >
                  {versionHistory.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.date})</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <GitCompare className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium mb-2">Compare Version</h3>
                <select 
                  className="w-full rounded-md border border-gray-300 p-2"
                  value={compareVersions.compare}
                  onChange={(e) => setCompareVersions({...compareVersions, compare: e.target.value})}
                >
                  {versionHistory.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.date})</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                <h3 className="font-medium">Comparison Results</h3>
                <div className="flex items-center text-sm">
                  <span className="flex items-center mr-3">
                    <span className="h-3 w-3 bg-green-500 rounded-full mr-1.5"></span>
                    Added
                  </span>
                  <span className="flex items-center mr-3">
                    <span className="h-3 w-3 bg-red-500 rounded-full mr-1.5"></span>
                    Removed
                  </span>
                  <span className="flex items-center">
                    <span className="h-3 w-3 bg-yellow-500 rounded-full mr-1.5"></span>
                    Changed
                  </span>
                </div>
              </div>
              <div className="p-4 max-h-[300px] overflow-y-auto">
                <div className="text-sm mb-4">
                  <h4 className="font-medium mb-2">2.5.5 Overview of Safety</h4>
                  <div className="pl-4 border-l-2 border-gray-200">
                    <p className="mb-2 bg-red-100 line-through">
                      The safety profile of Drug X was assessed in <span className="font-bold">5</span> randomized controlled 
                      trials involving <span className="font-bold">998</span> subjects. Adverse events were mild to moderate 
                      in nature, with headache being the most commonly reported event (10% of subjects).
                    </p>
                    <p className="mb-2 bg-green-100">
                      The safety profile of Drug X was assessed in <span className="font-bold">6</span> randomized controlled 
                      trials involving <span className="font-bold">1,245</span> subjects. Adverse events were mild to moderate 
                      in nature, with headache being the most commonly reported event (12% of subjects).
                    </p>
                  </div>
                </div>
                
                <div className="text-sm">
                  <h4 className="font-medium mb-2">2.5.5.1 Adverse Events</h4>
                  <div className="pl-4 border-l-2 border-gray-200">
                    <p className="mb-2 bg-yellow-100">
                      The most common adverse events (≥5% and greater than placebo) were:
                    </p>
                    <ul className="list-disc pl-8 mb-2">
                      <li className="bg-red-100 line-through">Headache (10%)</li>
                      <li className="bg-green-100">Headache (12%)</li>
                      <li>Nausea (8%)</li>
                      <li className="bg-red-100 line-through">Dizziness (5%)</li>
                      <li className="bg-green-100">Dizziness (6%)</li>
                      <li>Fatigue (5%)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="text-sm mt-4">
                  <h4 className="font-medium mb-2">2.5.5.2 Laboratory Findings</h4>
                  <div className="pl-4 border-l-2 border-gray-200 bg-green-100">
                    <p className="mb-2">
                      No clinically meaningful changes in laboratory parameters were observed during the clinical development 
                      program. Minor elevations in liver enzymes (ALT/AST) were observed in 2% of treated subjects, 
                      compared to 1.8% in the placebo group, all of which were transient and resolved without intervention.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCompareDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}