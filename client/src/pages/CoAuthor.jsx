import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Clock
} from 'lucide-react';

export default function CoAuthor() {
  // Component state
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  
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
      completeDocs: 11,
      inProgressDocs: 5,
      notStartedDocs: 2,
      status: 'In Progress'
    },
    { 
      id: 3, 
      name: 'Nonclinical', 
      description: 'Production and General', 
      percent: 35,
      totalDocs: 10,
      completeDocs: 3,
      inProgressDocs: 4,
      notStartedDocs: 3,
      status: 'Needs Attention'
    }
  ];
  
  const recentDocuments = [
    { id: 1, name: 'Module 2.3', description: 'Administrative', lastEdited: '2 days ago' },
    { id: 2, name: 'Module 1.20 Introduction', description: 'and General...', lastEdited: '3 days ago' }
  ];

  // Enhanced document tree structure based on eCTD modules
  const documentTree = [
    {
      id: 1,
      name: 'Module 1',
      type: 'folder',
      status: 'active',
      children: [
        { id: 101, name: 'Form : 1574', type: 'document', format: 'docx', status: 'final' },
        { id: 102, name: 'Cover Letter', type: 'document', format: 'docx', status: 'final' },
        { id: 103, name: 'Investigational drug labeling', type: 'document', format: 'pdf', status: 'draft' }
      ]
    },
    {
      id: 2,
      name: 'Module 2',
      type: 'folder',
      status: 'active',
      children: [
        { id: 201, name: 'Module 2.2 Overview', type: 'document', format: 'docx', status: 'draft' },
        { id: 202, name: 'Module 2.3 Quality Overall Summary', type: 'document', format: 'docx', status: 'draft' },
        { id: 203, name: 'Module 2.4 Nonclinical Overview', type: 'document', format: 'docx', status: 'draft' }
      ]
    },
    {
      id: 3,
      name: 'Module 3',
      type: 'folder',
      status: 'active',
      children: [
        { 
          id: 301, 
          name: 'Module 3.2.S', 
          type: 'folder', 
          status: 'active',
          children: [
            { id: 3011, name: 'General Information', type: 'document', format: 'docx', status: 'draft' },
            { id: 3012, name: 'Manufacturer', type: 'document', format: 'docx', status: 'draft' }
          ]
        },
        { 
          id: 302, 
          name: 'Module 3.2.P', 
          type: 'folder', 
          status: 'active',
          children: [
            { id: 3021, name: 'Description and composition', type: 'document', format: 'docx', status: 'draft' },
            { id: 3022, name: 'Pharmaceutical development', type: 'document', format: 'docx', status: 'draft' }
          ]
        }
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
        <p className="text-muted-foreground text-sm ml-10">
          AI-driven regulatory document authoring module
        </p>
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
            <div className="mb-4 border rounded-lg border-blue-200 overflow-hidden">
              <div className="bg-blue-50 p-2">
                <div className="text-sm font-medium text-blue-800">Recent Documents</div>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between py-1 hover:bg-blue-50 px-2 rounded">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm">Module 2.5 Clinical Overview.docx</span>
                  </div>
                  <div className="text-xs text-blue-600">2h ago</div>
                </div>
                <div className="flex items-center justify-between py-1 hover:bg-blue-50 px-2 rounded">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm">Module 1.3.4 Labeling.docx</span>
                  </div>
                  <div className="text-xs text-blue-600">Yesterday</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mb-4">
              <div className="bg-gradient-to-r from-blue-50 to-transparent p-3 rounded-lg border border-blue-100">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-600 mr-2">
                    <path d="M21 8v13H3V8"></path>
                    <path d="M1 3h22v5H1z"></path>
                    <path d="M10 12h4"></path>
                    <circle cx="12" cy="15" r="1"></circle>
                  </svg>
                  <div className="font-medium text-blue-800">AI Assistant Features</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Real-time compliance checks</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Reference integration</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Template-based formatting</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Cross-module consistency</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-base">
                <Edit className="h-4 w-4 mr-2" />
                Launch Editor
              </Button>
              <div className="flex flex-wrap justify-between items-center mt-2 text-xs">
                <div className="flex items-center text-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 mr-1">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 8v4l3 3"></path>
                  </svg>
                  <span>Auto-saves every 30 seconds</span>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Online
                  </div>
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Library Card - Enhanced with Enterprise UI */}
        <Card className="border-yellow-200 shadow-sm">
          <CardHeader className="pb-2 bg-gradient-to-r from-yellow-50 to-white">
            <CardTitle className="flex items-center text-lg">
              <LayoutTemplate className="h-5 w-5 mr-2 text-yellow-600" />
              Regional Template Library
            </CardTitle>
            <CardDescription>
              Pre-approved document templates for regulatory submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-yellow-200 rounded-md p-3 bg-gradient-to-r from-yellow-50 to-yellow-25 mb-3">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-yellow-600 mr-1.5">
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                  <span className="text-sm font-medium text-yellow-800">Available Regulatory Regions</span>
                </div>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-yellow-700 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                    <path d="M8.5 8.5v.01" />
                    <path d="M16 15.5v.01" />
                    <path d="M12 12v.01" />
                  </svg>
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center bg-white p-2 rounded-md border border-yellow-100 hover:shadow-sm transition-shadow">
                  <Badge variant="outline" className="bg-white mb-1 text-yellow-700">FDA (US)</Badge>
                  <div className="text-xs text-yellow-600 font-medium">24 templates</div>
                </div>
                <div className="flex flex-col items-center bg-white p-2 rounded-md border border-yellow-100 hover:shadow-sm transition-shadow">
                  <Badge variant="outline" className="bg-white mb-1 text-yellow-700">EMA (EU)</Badge>
                  <div className="text-xs text-yellow-600 font-medium">18 templates</div>
                </div>
                <div className="flex flex-col items-center bg-white p-2 rounded-md border border-yellow-100 hover:shadow-sm transition-shadow">
                  <Badge variant="outline" className="bg-white mb-1 text-yellow-700">PMDA (JP)</Badge>
                  <div className="text-xs text-yellow-600 font-medium">15 templates</div>
                </div>
              </div>
            </div>
            
            <div className="mb-3 space-y-2.5">
              <div className="border border-yellow-200 rounded-md p-2.5 hover:bg-yellow-50 cursor-pointer transition-colors group">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 rounded-md h-8 w-8 flex items-center justify-center mr-2.5 text-yellow-700 group-hover:bg-yellow-200 transition-colors">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-medium text-sm text-yellow-900">Module 1 Templates</span>
                      <div className="text-xs text-yellow-600">Standard administrative documents</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 mr-1.5">FDA</Badge>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="border border-yellow-200 rounded-md p-2.5 hover:bg-yellow-50 cursor-pointer transition-colors group">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 rounded-md h-8 w-8 flex items-center justify-center mr-2.5 text-yellow-700 group-hover:bg-yellow-200 transition-colors">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-medium text-sm text-yellow-900">Module 2 Templates</span>
                      <div className="text-xs text-yellow-600">Overview and summary templates</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 mr-1.5">ICH</Badge>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="border border-yellow-200 rounded-md p-2.5 hover:bg-yellow-50 cursor-pointer transition-colors group">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 rounded-md h-8 w-8 flex items-center justify-center mr-2.5 text-yellow-700 group-hover:bg-yellow-200 transition-colors">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-medium text-sm text-yellow-900">Regional Templates</span>
                      <div className="text-xs text-yellow-600">Region-specific templates</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 mr-1.5">EMA</Badge>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
              <LayoutTemplate className="h-4 w-4 mr-2" />
              Browse All Templates
            </Button>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>57 templates available</span>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1 text-yellow-500">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                </svg>
                Updated May 10, 2025
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Regulatory Search Card - Enhanced with Enterprise UI */}
        <Card className="border-green-200 shadow-sm">
          <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-white">
            <CardTitle className="flex items-center text-lg">
              <Search className="h-5 w-5 mr-2 text-green-600" />
              Intelligent Regulatory Search
            </CardTitle>
            <CardDescription>
              Find relevant guidance and precedents for regulatory submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                <input 
                  type="text" 
                  placeholder="Search regulatory guidelines and precedents..." 
                  className="pl-10 h-10 w-full rounded-md border border-green-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-green-400 focus:ring-1 focus:ring-green-400"
                />
                <Button size="sm" className="absolute right-1.5 top-1.5 h-7 bg-green-600 hover:bg-green-700 text-white rounded-md">
                  Search
                </Button>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-25 border border-green-100 p-2.5 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-sm font-medium text-green-800">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1.5 text-green-600">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                    Regulatory Intelligence
                  </div>
                  <Badge variant="outline" className="text-xs bg-white border-green-200 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    GPT-powered
                  </Badge>
                </div>
                <div className="text-xs text-green-700 leading-relaxed">
                  Ask regulatory questions in natural language. The system searches FDA, EMA, PMDA, and ICH guidance to find the most relevant information for your submission.
                </div>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <div className="text-sm font-medium text-green-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1.5 text-green-600">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  Quick Access
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="border border-green-200 rounded-md p-2 bg-white hover:bg-green-50 transition-colors cursor-pointer group">
                    <div className="flex items-center">
                      <div className="bg-green-100 h-7 w-7 rounded-md flex items-center justify-center mr-2 group-hover:bg-green-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-green-700">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="3" y1="9" x2="21" y2="9"></line>
                          <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-green-800">FDA Guidelines</div>
                        <div className="text-xs text-green-600">435 documents</div>
                      </div>
                    </div>
                  </div>
                  <div className="border border-green-200 rounded-md p-2 bg-white hover:bg-green-50 transition-colors cursor-pointer group">
                    <div className="flex items-center">
                      <div className="bg-green-100 h-7 w-7 rounded-md flex items-center justify-center mr-2 group-hover:bg-green-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-green-700">
                          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                          <path d="M7 15h0M2 9.5h20"></path>
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-green-800">ICH Standards</div>
                        <div className="text-xs text-green-600">128 documents</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-green-100 pt-2 mt-2">
                <div className="text-xs font-medium text-green-800 mb-1.5 flex items-center">
                  <History className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                  Recent searches:
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs p-1.5 bg-green-50 rounded-md border border-green-100 text-green-700 cursor-pointer hover:bg-green-100 transition-colors flex justify-between items-center group">
                    <span>Module 2.5 clinical overview requirements</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Search className="h-3 w-3 text-green-600" />
                    </div>
                  </div>
                  <div className="text-xs p-1.5 bg-green-50 rounded-md border border-green-100 text-green-700 cursor-pointer hover:bg-green-100 transition-colors flex justify-between items-center group">
                    <span>FDA guidance investigational drugs</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Search className="h-3 w-3 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-10">
              <Search className="h-4 w-4 mr-2" />
              Advanced Regulatory Search
            </Button>
            <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1 text-green-500">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
              Last updated: May 11, 2025
            </div>
          </CardContent>
        </Card>

        {/* Vault Document Management Card - Enhanced with Enterprise UI */}
        <Card className="lg:col-span-2 row-span-2 border-purple-200 shadow-sm">
          <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-white">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center text-lg">
                <Database className="h-5 w-5 mr-2 text-purple-600" />
                Enterprise Vault Document Management
              </CardTitle>
              <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1 text-purple-500">
                  <path d="M21 2H3v16h5v4l4-4h9V2z"></path>
                  <path d="M10 8h4"></path>
                  <path d="M10 12h4"></path>
                  <path d="M10 16h4"></path>
                </svg>
                Enterprise
              </Badge>
            </div>
            <CardDescription>
              Secure document repository with version control and compliance tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-purple-50 to-purple-25 border border-purple-100 rounded-md p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium text-purple-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1.5 text-purple-600">
                      <path d="M21 9V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"></path>
                      <path d="M3 16v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"></path>
                      <line x1="3" x2="21" y1="12" y2="12"></line>
                    </svg>
                    Document Management Actions
                  </div>
                  <div className="text-xs px-2 py-1 bg-white rounded-md border border-purple-100 text-purple-700">
                    <span className="font-medium">Last sync:</span> 10 minutes ago
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  <Button size="sm" variant="outline" className="border-purple-200 text-purple-700 bg-white hover:bg-purple-50 transition-colors h-9">
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Import
                  </Button>
                  <Button size="sm" variant="outline" className="border-purple-200 text-purple-700 bg-white hover:bg-purple-50 transition-colors h-9">
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Export
                  </Button>
                  <Button size="sm" variant="outline" className="border-purple-200 text-purple-700 bg-white hover:bg-purple-50 transition-colors h-9">
                    <History className="h-3.5 w-3.5 mr-1.5" />
                    History
                  </Button>
                  <Button size="sm" variant="outline" className="border-purple-200 text-purple-700 bg-white hover:bg-purple-50 transition-colors h-9">
                    <Share2 className="h-3.5 w-3.5 mr-1.5" />
                    Share
                  </Button>
                </div>
              </div>
              
              <div className="bg-white rounded-md border border-purple-200 p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="bg-purple-100 rounded-md h-9 w-9 flex items-center justify-center mr-2.5 text-purple-700">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 1 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                        <path d="M12 10v6" />
                        <path d="m15 13-3 3-3-3" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-purple-900">eCTD Document Tree</div>
                      <div className="text-xs text-purple-600 mt-0.5">ICH conformant structure with multi-region validation</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1">
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                        <span>Compliant</span>
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setIsTreeOpen(!isTreeOpen)}
                        className="flex items-center border-purple-200 text-purple-700 h-7"
                      >
                        <span>{isTreeOpen ? "Collapse" : "Expand"}</span>
                        <ChevronDown className={`h-4 w-4 ml-1 ${isTreeOpen ? "transform rotate-180" : ""}`} />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {isTreeOpen && (
                  <div className="space-y-4 max-h-96 overflow-y-auto border border-purple-200 rounded-md p-3 mt-3 bg-white shadow-sm">
                    <div className="flex flex-wrap justify-between items-center gap-3 mb-3 bg-purple-50 p-2 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-medium text-purple-800">Filter:</span>
                        <select className="text-xs rounded border border-purple-200 px-2 py-1 bg-white focus:ring-purple-400 focus:border-purple-400">
                          <option>All Documents</option>
                          <option>Draft Only</option>
                          <option>Final Only</option>
                          <option>Recently Modified</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-medium text-purple-800">Module:</span>
                        <select className="text-xs rounded border border-purple-200 px-2 py-1 bg-white focus:ring-purple-400 focus:border-purple-400">
                          <option>All Modules</option>
                          <option>Module 1</option>
                          <option>Module 2</option>
                          <option>Module 3</option>
                          <option>Module 4</option>
                          <option>Module 5</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-xs text-purple-700 bg-white px-2 py-1 rounded border border-purple-100">
                        <span className="font-medium">43 documents</span> • 18 final
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full text-purple-600">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                
                  {documentTree.map(module => (
                    <div key={module.id} className="space-y-2 bg-white border border-purple-100 rounded-md overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between font-medium bg-gradient-to-r from-purple-100 to-purple-50 p-2 rounded-t-md">
                        <div className="flex items-center">
                          <FolderOpen className="h-4 w-4 mr-2 text-purple-500" />
                          <span className="text-purple-800">{module.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs bg-purple-100 border-purple-200 text-purple-700">
                            {module.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs bg-white text-purple-700 border-purple-200">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1 text-green-500">
                              <path d="m9 11-6 6v3h9l3-3" />
                              <path d="m22 12-4.37 4.37a2.12 2.12 0 0 1-3.83-1.02V3.65a2.12 2.12 0 0 1 3.83-1.02L22 7" />
                            </svg>
                            FDA Required
                          </Badge>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-purple-600">
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="pl-6 space-y-2 border-l border-purple-100 ml-3 pr-3 pb-3">
                        {module.children.map(child => {
                          if (child.type === 'folder') {
                            return (
                              <div key={child.id} className="space-y-1">
                                <div className="flex items-center justify-between bg-purple-50 rounded-md p-1.5">
                                  <div className="flex items-center">
                                    <FolderOpen className="h-4 w-4 mr-2 text-purple-500" />
                                    <span className="text-sm font-medium text-purple-800">{child.name}</span>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Badge variant="outline" className="text-xs bg-white border-purple-100 text-purple-600">
                                      {child.children.length} docs
                                    </Badge>
                                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-purple-600 hover:text-purple-700">
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                      </svg>
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="pl-5 space-y-1 border-l border-purple-100 ml-1">
                                  {child.children.map(subChild => (
                                    <div key={subChild.id} className="flex items-center justify-between hover:bg-purple-50 rounded-md p-1.5 transition-colors group">
                                      <div className="flex items-center">
                                        <FileText className="h-3.5 w-3.5 mr-2 text-purple-500" />
                                        <span className="text-xs text-purple-900 group-hover:text-purple-700">{subChild.name}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Badge 
                                          variant={subChild.status === 'final' ? 'default' : 'outline'} 
                                          className={`text-xs ${subChild.status === 'final' ? 'bg-green-100 hover:bg-green-200 text-green-700 border-green-200' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}
                                        >
                                          {subChild.status}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200">
                                          {subChild.format}
                                        </Badge>
                                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Eye className="h-3 w-3 text-purple-500" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div key={child.id} className="flex items-center justify-between hover:bg-purple-50 rounded-md p-1.5 transition-colors group">
                                <div className="flex items-center">
                                  <div className="relative">
                                    <FileText className="h-4 w-4 mr-2 text-purple-500" />
                                    {child.status === 'final' && (
                                      <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"></div>
                                    )}
                                  </div>
                                  <span className="text-sm text-purple-900 group-hover:text-purple-700">{child.name}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Badge 
                                    variant={child.status === 'final' ? 'default' : 'outline'} 
                                    className={`text-xs ${child.status === 'final' ? 'bg-green-100 hover:bg-green-200 text-green-700 border-green-200' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}
                                  >
                                    {child.status}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200">
                                    {child.format}
                                  </Badge>
                                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-purple-500">
                                        <path d="M12 19l7-7 3 3-7 7-3-3z" />
                                        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                                        <path d="m2 2 7.586 7.586" />
                                        <circle cx="11" cy="11" r="2" />
                                      </svg>
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                                      <Eye className="h-3 w-3 text-purple-500" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center pt-2 text-xs text-purple-700">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 mr-1.5 text-green-500">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <span>FDA and EMA eCTD compliance verification active</span>
                    </div>
                    <Button size="sm" variant="link" className="h-6 text-xs text-purple-700 hover:text-purple-900 flex items-center p-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="9" y1="21" x2="9" y2="9" />
                      </svg>
                      View compliance report
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border border-purple-200 rounded-md p-3 bg-white shadow-sm">
                  <div className="bg-gradient-to-r from-purple-50 to-white p-2 rounded-md border border-purple-100 mb-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2 text-purple-600">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                        <span className="text-sm font-medium text-purple-800">eCTD Module Status</span>
                      </div>
                      <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        FDA Compliant
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="p-1.5 bg-white rounded-md border border-purple-100">
                        <div className="text-xs font-medium text-purple-800 mb-1 flex items-center">
                          <FolderOpen className="h-3.5 w-3.5 text-purple-500 mr-1" />
                          Module 1
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-purple-600">5 docs</span>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Ready</Badge>
                        </div>
                      </div>
                      <div className="p-1.5 bg-white rounded-md border border-purple-100">
                        <div className="text-xs font-medium text-purple-800 mb-1 flex items-center">
                          <FolderOpen className="h-3.5 w-3.5 text-purple-500 mr-1" />
                          Module 2
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-purple-600">8 docs</span>
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>
                        </div>
                      </div>
                      <div className="p-1.5 bg-white rounded-md border border-purple-100">
                        <div className="text-xs font-medium text-purple-800 mb-1 flex items-center">
                          <FolderOpen className="h-3.5 w-3.5 text-purple-500 mr-1" />
                          Module 3
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-purple-600">12 docs</span>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Ready</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1.5 text-purple-600">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 8v4l3 3"></path>
                      </svg>
                      <span className="text-sm font-medium text-purple-800">Recent documents</span>
                    </div>
                    <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                      <span className="font-medium">43 total documents</span> • 18 final
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {documentTree[0].children.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between hover:bg-purple-50 rounded-md p-1.5 transition-colors group">
                        <div className="flex items-center">
                          <div className="relative">
                            <FileText className="h-4 w-4 mr-2 text-purple-500" />
                            {doc.status === 'final' && (
                              <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                          <span className="text-sm text-purple-900 group-hover:text-purple-700">{doc.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Badge 
                            variant={doc.status === 'final' ? 'default' : 'outline'} 
                            className={`text-xs ${doc.status === 'final' ? 'bg-green-100 hover:bg-green-200 text-green-700 border-green-200' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}
                          >
                            {doc.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200">
                            {doc.format}
                          </Badge>
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {doc.status === 'final' ? (
                              <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                                <Eye className="h-3 w-3 text-purple-500" />
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                                <Edit className="h-3 w-3 text-purple-500" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center pt-3">
                    <Button variant="link" className="text-xs text-purple-600 hover:text-purple-800" onClick={() => setIsTreeOpen(true)}>
                      View full eCTD structure
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex items-center border-purple-200 text-purple-700 hover:bg-purple-50">
                  <FilePlus2 className="h-4 w-4 mr-1.5" />
                  New Document
                </Button>
                <Button size="sm" variant="outline" className="flex items-center border-purple-200 text-purple-700 hover:bg-purple-50">
                  <Upload className="h-4 w-4 mr-1.5" />
                  Upload
                </Button>
                <Button size="sm" variant="outline" className="flex items-center border-purple-200 text-purple-700 hover:bg-purple-50">
                  <Download className="h-4 w-4 mr-1.5" />
                  Download
                </Button>
                <Button size="sm" variant="outline" className="flex items-center border-purple-200 text-purple-700 hover:bg-purple-50">
                  <History className="h-4 w-4 mr-1.5" />
                  Version History
                </Button>
                <Button size="sm" variant="outline" className="flex items-center ml-auto bg-purple-50 border-purple-300 text-purple-800 hover:bg-purple-100">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1.5">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                    <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                  </svg>
                  Run Compliance Check
                </Button>
                <Button size="sm" variant="outline" className="flex items-center border-purple-200 text-purple-700 hover:bg-purple-50">
                  <Share2 className="h-4 w-4 mr-1.5" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Documents Card - Enhanced */}
        <Card className="border-blue-200">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-white">
            <CardTitle className="flex items-center text-lg">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Recent Documents
            </CardTitle>
            <CardDescription>
              Recently edited regulatory documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {recentDocuments.map(doc => (
                <div key={doc.id} className="flex justify-between items-start border-b border-blue-100 pb-3 hover:bg-blue-50 p-2 rounded-md transition-colors">
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 mr-3 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm text-blue-800">{doc.name}</div>
                      <div className="text-xs text-blue-600">{doc.description}</div>
                      <div className="text-xs text-blue-400 mt-1 flex items-center">
                        <Clock className="h-3 w-3 mr-1.5" />
                        Edited {doc.lastEdited}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" className="h-7 px-2 border-blue-200 text-blue-700 hover:bg-blue-100">
                      <Eye className="h-3 w-3 mr-1.5" />
                      <span className="text-xs">View</span>
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-blue-600">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="link" size="sm" className="text-xs text-blue-600">
                View all documents
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Module Progress Card - Enhanced */}
        <Card className="lg:col-span-3 border-blue-200">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-white">
            <CardTitle className="flex items-center text-lg">
              <BarChart className="h-5 w-5 mr-2 text-blue-600" />
              Module Progress Tracker
            </CardTitle>
            <CardDescription>
              Track completion status across eCTD modules with real-time metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {moduleProgress.map(module => {
                // Define status colors and icons based on completion
                const getStatusConfig = (percent) => {
                  if (percent >= 75) return { 
                    badge: "bg-green-100 text-green-800 hover:bg-green-200",
                    progressBg: "bg-green-50",
                    icon: <CheckCircle className="h-4 w-4 text-green-600 mr-2" />,
                    label: "On Track"
                  };
                  if (percent >= 40) return { 
                    badge: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
                    progressBg: "bg-yellow-50",
                    icon: <Clock className="h-4 w-4 text-yellow-600 mr-2" />,
                    label: "In Progress"
                  };
                  return { 
                    badge: "bg-red-100 text-red-800 hover:bg-red-200",
                    progressBg: "bg-red-50",
                    icon: <AlertCircle className="h-4 w-4 text-red-600 mr-2" />,
                    label: "Needs Attention"
                  };
                };
                
                const statusConfig = getStatusConfig(module.percent);
                
                return (
                  <div key={module.id} className="space-y-3 p-4 border border-blue-200 rounded-lg bg-white hover:bg-blue-50 transition-colors duration-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-blue-100 text-blue-800 px-2.5 py-1.5 rounded-md font-medium mr-3">M{module.id}</div>
                        <div>
                          <div className="font-medium text-blue-900">{module.name}</div>
                          <div className="text-sm text-blue-600">{module.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Badge className={`mr-3 ${statusConfig.badge}`}>
                          <div className="flex items-center">
                            {statusConfig.icon}
                            {module.status}
                          </div>
                        </Badge>
                        <div className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{module.percent}%</div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-2 rounded-md">
                      <div className="text-xs text-blue-800 mb-1.5 font-medium">Document Status</div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center rounded-md bg-green-50 text-green-700 py-1.5 px-2 border border-green-100">
                          <span className="font-bold text-lg">{module.completeDocs}</span>
                          <span className="text-xs">Complete</span>
                        </div>
                        <div className="flex flex-col items-center rounded-md bg-yellow-50 text-yellow-700 py-1.5 px-2 border border-yellow-100">
                          <span className="font-bold text-lg">{module.inProgressDocs}</span>
                          <span className="text-xs">In Progress</span>
                        </div>
                        <div className="flex flex-col items-center rounded-md bg-gray-50 text-gray-700 py-1.5 px-2 border border-gray-100">
                          <span className="font-bold text-lg">{module.notStartedDocs}</span>
                          <span className="text-xs">Not Started</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-blue-600">Progress</span>
                        <span className="text-blue-800 font-medium">{module.completeDocs}/{module.totalDocs} documents</span>
                      </div>
                      <Progress 
                        value={module.percent} 
                        className={`h-2.5 ${statusConfig.progressBg}`} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculate overall statistics */}
            {(() => {
              const totalDocs = moduleProgress.reduce((acc, module) => acc + module.totalDocs, 0);
              const completeDocs = moduleProgress.reduce((acc, module) => acc + module.completeDocs, 0);
              const inProgressDocs = moduleProgress.reduce((acc, module) => acc + module.inProgressDocs, 0);
              const notStartedDocs = moduleProgress.reduce((acc, module) => acc + module.notStartedDocs, 0);
              const overallProgress = Math.round((completeDocs / totalDocs) * 100);
              
              return (
                <div className="grid grid-cols-3 gap-4 mt-8 border-t pt-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">{overallProgress}%</div>
                    <div className="text-sm text-gray-600 font-medium">Overall Progress</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100 shadow-sm">
                    <div className="text-2xl font-bold text-green-600">{completeDocs}</div>
                    <div className="text-sm text-gray-600 font-medium">Documents Complete</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100 shadow-sm">
                    <div className="text-2xl font-bold text-yellow-600">{inProgressDocs}</div>
                    <div className="text-sm text-gray-600 font-medium">In Progress</div>
                  </div>
                </div>
              );
            })()}
            
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                className="mt-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                onClick={() => alert('Generating progress report...')}
              >
                <Download className="h-4 w-4 mr-2" />
                Generate Progress Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}