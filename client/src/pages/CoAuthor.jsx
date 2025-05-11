import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Users
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
      date: 'April 20, 2025', 
      author: 'Mark Johnson', 
      changes: 'Major revision of safety data in Module 2.5',
      commitHash: '5e4d3c2b1a987',
      status: 'Previous'
    },
    { 
      id: 'v2.5', 
      name: 'Version 2.5', 
      date: 'April 15, 2025', 
      author: 'Emily Chen', 
      changes: 'Enhanced quality data in Module 3',
      commitHash: '4d3c2b1a9876',
      status: 'Previous'
    }
  ]);
  
  // Mock data for modules and documents with enhanced details
  const moduleProgress = [
    { 
      id: 1, 
      name: 'Module 1', 
      description: 'Administrative', 
      percent: 80,
      totalDocs: 12,
      completeDocs: 10,
      inProgressDocs: 2,
      notStartedDocs: 0,
      status: 'On Track'
    },
    { 
      id: 2, 
      name: 'Quality', 
      description: 'Quality', 
      percent: 60,
      totalDocs: 18,
      completeDocs: 10,
      inProgressDocs: 4,
      notStartedDocs: 4,
      status: 'Some Delays'
    },
    { 
      id: 3, 
      name: 'Module 3', 
      description: 'Non-Clinical', 
      percent: 35,
      totalDocs: 22,
      completeDocs: 8,
      inProgressDocs: 5,
      notStartedDocs: 9,
      status: 'Needs Attention'
    },
    { 
      id: 4, 
      name: 'Module 4', 
      description: 'Clinical', 
      percent: 75,
      totalDocs: 30,
      completeDocs: 22,
      inProgressDocs: 6,
      notStartedDocs: 2,
      status: 'On Track'
    },
    { 
      id: 5, 
      name: 'Module 5', 
      description: 'References', 
      percent: 90,
      totalDocs: 8,
      completeDocs: 7,
      inProgressDocs: 1,
      notStartedDocs: 0,
      status: 'On Track'
    }
  ];
  
  const recentDocuments = [
    { 
      id: 1, 
      title: 'Study Protocol v2.3', 
      module: 'Module 5',
      lastEdited: '2 hours ago',
      editedBy: 'Alice Chen',
      status: 'In Review',
      version: 'v2.3',
      reviewers: ['John Doe', 'Sarah Kim']
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
      title: 'CTA Submission Summary', 
      module: 'Module 1',
      lastEdited: '1 week ago',
      editedBy: 'You',
      status: 'Final',
      version: 'v2.0',
      reviewers: ['Regulatory Affairs Team']
    }
  ];
  
  const templateCategories = [
    {
      id: 1,
      name: 'FDA Templates',
      count: 32,
      templates: [
        { id: 101, name: 'IND Protocol Template', region: 'US FDA', lastUpdated: '2 months ago' },
        { id: 102, name: 'FDA NDA CTD Submission', region: 'US FDA', lastUpdated: '1 month ago' },
        { id: 103, name: 'FDA Module 2 Overview', region: 'US FDA', lastUpdated: '2 weeks ago' }
      ]
    },
    {
      id: 2,
      name: 'EMA Templates',
      count: 28,
      templates: [
        { id: 201, name: 'EMA Clinical Trial Protocol', region: 'EU EMA', lastUpdated: '3 months ago' },
        { id: 202, name: 'EMA Module 1 Regional', region: 'EU EMA', lastUpdated: '1 month ago' }
      ]
    }
  ];

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

      {/* Main Content Area with optional navigation tree */}
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
                <Button size="sm" variant="outline" className="border-blue-200 text-blue-700">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Open Existing
                </Button>
              </div>
              
              <div className="bg-blue-50 rounded-md p-3 text-sm">
                <h4 className="font-medium text-blue-800 mb-1 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1.5 text-blue-600" />
                  AI Co-Authoring Features
                </h4>
                <ul className="list-disc list-inside space-y-1 text-blue-700 pl-1">
                  <li>Intelligent content suggestions</li>
                  <li>Regulatory validation checks</li>
                  <li>Structure &amp; formatting automation</li>
                  <li>Cross-reference assistance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Regional Template Library Card - Enhanced */}
        <Card className="border-yellow-200">
          <CardHeader className="pb-2 bg-gradient-to-r from-yellow-50 to-white">
            <CardTitle className="flex items-center text-lg">
              <LayoutTemplate className="h-5 w-5 mr-2 text-yellow-600" />
              Regional Template Library
            </CardTitle>
            <CardDescription>
              Access region-specific templates and document frameworks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {templateCategories.slice(0, 2).map(category => (
                <div key={category.id} className="bg-yellow-50 rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-yellow-800">{category.name}</h4>
                    <Badge variant="outline" className="bg-white text-yellow-700 border-yellow-200">
                      {category.count} templates
                    </Badge>
                  </div>
                  <ul className="space-y-2">
                    {category.templates.slice(0, 2).map(template => (
                      <li key={template.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{template.name}</span>
                        <Badge className="bg-yellow-100 hover:bg-yellow-200 border-transparent text-yellow-800">
                          {template.region}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    size="sm" 
                    variant="link" 
                    className="text-yellow-700 hover:text-yellow-800 p-0 h-auto mt-1 text-sm flex items-center"
                  >
                    View all templates
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              ))}
              
              <Button size="sm" variant="outline" className="w-full border-yellow-200 text-yellow-700">
                Browse All Templates
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Regulatory Search Card - Enhanced */}
        <Card className="border-blue-200">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-white">
            <CardTitle className="flex items-center text-lg">
              <Search className="h-5 w-5 mr-2 text-blue-600" />
              Regulatory Search
            </CardTitle>
            <CardDescription>
              Find and reuse content from approved regulatory documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search regulatory content..."
                  className="w-full rounded-md border border-blue-200 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 mb-1">
                <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 cursor-pointer">
                  Clinical
                </Badge>
                <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 cursor-pointer">
                  CMC
                </Badge>
                <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 cursor-pointer">
                  Nonclinical
                </Badge>
                <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 cursor-pointer">
                  FDA
                </Badge>
                <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 cursor-pointer">
                  EMA
                </Badge>
              </div>
              
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-100">
                <span className="text-xs text-gray-500">Search across 5000+ approved documents</span>
                <Button size="sm" variant="link" className="p-0 h-auto text-sm text-blue-600">
                  Advanced Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vault Document Management Card - Enhanced */}
        <Card className="lg:col-span-2 row-span-2 border-purple-200">
          <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-white">
            <CardTitle className="flex items-center text-lg">
              <Database className="h-5 w-5 mr-2 text-purple-600" />
              Enterprise Vault Document Management
            </CardTitle>
            <CardDescription>
              Secure document repository with version control and compliance features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 mb-3">
                <Button size="sm" variant="outline" className="border-purple-200 text-purple-700">
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Import
                </Button>
                <Button size="sm" variant="outline" className="border-purple-200 text-purple-700">
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Export
                </Button>
                <Button size="sm" variant="outline" className="border-purple-200 text-purple-700">
                  <History className="h-3.5 w-3.5 mr-1.5" />
                  Version History
                </Button>
                <Button size="sm" variant="outline" className="border-purple-200 text-purple-700">
                  <Share2 className="h-3.5 w-3.5 mr-1.5" />
                  Share
                </Button>
                <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                  Supabase Vault
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Documents Card - Enhanced */}
        <Card className="border-blue-200">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-white">
            <CardTitle className="flex items-center text-lg">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Recent Documents
            </CardTitle>
            <CardDescription>
              Quick access to your most recently edited documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDocuments.slice(0, 3).map(doc => (
                <div key={doc.id} className="flex items-start rounded-md border border-gray-100 p-2 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex-shrink-0 rounded-md bg-blue-100 p-2 mr-3">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between">
                      <h4 className="truncate text-sm font-medium text-gray-900">{doc.title}</h4>
                      <Badge 
                        className={`ml-1.5 flex-shrink-0 text-xs ${
                          doc.status === 'Final' ? 'bg-green-100 text-green-800' : 
                          doc.status === 'In Review' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {doc.status}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <span className="truncate">{doc.module}</span>
                      <span className="mx-1.5">•</span>
                      <span>{doc.lastEdited}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-blue-200 text-blue-700"
              >
                View All Documents
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* eCTD Document Tree Card - Enhanced */}
        <Card className="border-green-200 lg:col-span-2">
          <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-white">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center text-lg">
                <FolderOpen className="h-5 w-5 mr-2 text-green-600" />
                Document Tree Visualization
              </CardTitle>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">CTD Format</Badge>
            </div>
            <CardDescription>
              Interactive Common Technical Document (CTD) structure viewer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm">
              <button
                className="flex items-center hover:bg-green-50 p-2 w-full rounded text-left transition-colors"
                onClick={() => setIsTreeOpen(!isTreeOpen)}
              >
                {isTreeOpen ? 
                  <ChevronDown className="h-4 w-4 mr-2 text-green-600" /> : 
                  <ChevronRight className="h-4 w-4 mr-2 text-green-600" />}
                <span className="font-medium">CTD Structure</span>
              </button>
              
              {isTreeOpen && (
                <div className="ml-6 border-l border-green-200 pl-2">
                  {moduleProgress.map(module => (
                    <div key={module.id} className="py-1">
                      <div className="flex items-center">
                        <ChevronRight className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                        <span className="font-medium text-gray-700">{module.name}: {module.description}</span>
                      </div>
                      <div className="flex items-center ml-6 mt-1 mb-2">
                        <div className="w-56 mr-3">
                          <Progress value={module.percent} className="h-2 bg-gray-100" indicatorColor="bg-green-600" />
                        </div>
                        <span className="text-xs text-gray-500">
                          {module.completeDocs}/{module.totalDocs} documents
                        </span>
                        <Badge 
                          className={`ml-2 text-xs ${
                            module.status === 'On Track' ? 'bg-green-100 text-green-800' : 
                            module.status === 'Some Delays' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {module.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="bg-green-50 rounded-md p-3 mt-3 border border-green-100">
                <h4 className="text-sm font-medium text-green-800 mb-1 flex items-center">
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                  Compliance Information
                </h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-white p-2 rounded-md border border-green-100">
                    <div className="text-gray-500 mb-1">Total Documents</div>
                    <div className="text-lg font-medium text-gray-900">82</div>
                  </div>
                  <div className="bg-white p-2 rounded-md border border-green-100">
                    <div className="text-gray-500 mb-1">Completion</div>
                    <div className="text-lg font-medium text-green-600">68%</div>
                  </div>
                  <div className="bg-white p-2 rounded-md border border-green-100">
                    <div className="text-gray-500 mb-1">Compliance</div>
                    <div className="text-lg font-medium text-blue-600">92%</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Module Progress Card - Enhanced */}
        <Card className="border-blue-200">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-white">
            <CardTitle className="flex items-center text-lg">
              <BarChart className="h-5 w-5 mr-2 text-blue-600" />
              Module Progress
            </CardTitle>
            <CardDescription>
              Monitor completion status across all CTD modules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moduleProgress.map(module => (
                <div key={module.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-700">{module.name}</div>
                    <div className="text-sm text-gray-500">{module.percent}%</div>
                  </div>
                  <Progress value={module.percent} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div>
                      <span className="text-green-600">{module.completeDocs} complete</span>
                      {module.inProgressDocs > 0 && (
                        <>, <span className="text-yellow-600">{module.inProgressDocs} in progress</span></>
                      )}
                      {module.notStartedDocs > 0 && (
                        <>, <span className="text-gray-500">{module.notStartedDocs} not started</span></>
                      )}
                    </div>
                    {module.status === 'Needs Attention' && (
                      <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Overall: 68%</span>
                  <span className="text-gray-500 ml-1.5">complete</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-blue-200 text-blue-700 h-8"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate Progress Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
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
    </div>
  );
}