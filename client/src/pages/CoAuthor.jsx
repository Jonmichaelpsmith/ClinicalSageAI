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
        <div className="flex items-center mb-1">
          <img src="https://www.trialsage.com/logo.svg" alt="TrialSage" className="h-8 mr-2" />
          <h1 className="text-2xl font-bold">eCTD Co-Author Module</h1>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span className="mr-2">Enterprise Edition</span>
          <span className="mx-2">|</span>
          <span>Powered by AI Document Intelligence</span>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}