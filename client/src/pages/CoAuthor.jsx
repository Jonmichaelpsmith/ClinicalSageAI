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
        {/* Document Editor Card - Enhanced */}
        <Card className="border-blue-200">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-white">
            <CardTitle className="flex items-center text-lg">
              <Edit className="h-5 w-5 mr-2 text-blue-600" />
              AI-Powered Document Editor
            </CardTitle>
            <CardDescription>
              Create and edit regulatory documents with intelligent assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Start from templates for each eCTD module</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Real-time compliance checks</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-purple-500">
                  <path d="M21 8v13H3V8"></path>
                  <path d="M1 3h22v5H1z"></path>
                  <path d="M10 12h4"></path>
                  <circle cx="12" cy="15" r="1"></circle>
                </svg>
                <span className="text-sm font-medium">OpenAI-powered suggestions</span>
              </div>
            </div>
            <div className="space-y-2">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Edit className="h-4 w-4 mr-2" />
                Launch Editor
              </Button>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>AI-powered with GPT-4o</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">New</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Library Card - Enhanced */}
        <Card className="border-yellow-200">
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
            <div className="border rounded-md p-2 bg-yellow-50 mb-3">
              <div className="flex items-center mb-2">
                <FileText className="h-4 w-4 text-yellow-600 mr-1.5" />
                <span className="text-sm font-semibold text-yellow-800">Available Regions</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <Badge variant="outline" className="bg-white">FDA (US)</Badge>
                <Badge variant="outline" className="bg-white">EMA (EU)</Badge>
                <Badge variant="outline" className="bg-white">PMDA (JP)</Badge>
              </div>
            </div>
            
            <div className="mb-3 space-y-2">
              <div className="border border-yellow-200 rounded-md p-2 hover:bg-yellow-50 cursor-pointer transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-yellow-600" />
                    <span className="font-medium text-sm">Module 1 Templates</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">FDA</Badge>
                </div>
                <p className="text-xs text-yellow-700 mt-1">Standard administrative documents</p>
              </div>
              <div className="border border-yellow-200 rounded-md p-2 hover:bg-yellow-50 cursor-pointer transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-yellow-600" />
                    <span className="font-medium text-sm">Module 2 Templates</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">ICH</Badge>
                </div>
                <p className="text-xs text-yellow-700 mt-1">Overview and summary templates</p>
              </div>
              <div className="border border-yellow-200 rounded-md p-2 hover:bg-yellow-50 cursor-pointer transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-yellow-600" />
                    <span className="font-medium text-sm">Regional Templates</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">EMA</Badge>
                </div>
                <p className="text-xs text-yellow-700 mt-1">Region-specific templates</p>
              </div>
            </div>
            
            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
              <LayoutTemplate className="h-4 w-4 mr-2" />
              Browse All Templates
            </Button>
            <div className="flex justify-center mt-2">
              <span className="text-xs text-gray-500">
                57 templates available across all modules
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Regulatory Search Card - Enhanced */}
        <Card className="border-green-200">
          <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-white">
            <CardTitle className="flex items-center text-lg">
              <Search className="h-5 w-5 mr-2 text-green-600" />
              Intelligent Regulatory Search
            </CardTitle>
            <CardDescription>
              Find relevant guidance and precedents for regulatory documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-green-600" />
                <input 
                  type="text" 
                  placeholder="Search regulatory guidelines..." 
                  className="pl-8 h-9 w-full rounded-md border border-green-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus:border-green-400 focus:ring-1 focus:ring-green-400"
                />
              </div>
              
              <div className="flex items-center text-xs text-green-700 bg-green-50 p-1.5 rounded-md">
                <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                <span>AI-powered search using natural language</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-xs cursor-pointer bg-green-50 text-green-700 border-green-200 hover:bg-green-100">FDA Guidelines</Badge>
                <Badge variant="outline" className="text-xs cursor-pointer bg-green-50 text-green-700 border-green-200 hover:bg-green-100">ICH Standards</Badge>
                <Badge variant="outline" className="text-xs cursor-pointer bg-green-50 text-green-700 border-green-200 hover:bg-green-100">eCTD Requirements</Badge>
                <Badge variant="outline" className="text-xs cursor-pointer bg-green-50 text-green-700 border-green-200 hover:bg-green-100">EMA</Badge>
              </div>
              
              <div className="border-t border-green-100 pt-2 mt-2">
                <div className="text-xs font-medium text-green-700 mb-1 flex items-center">
                  <History className="h-3.5 w-3.5 mr-1" />
                  Recent searches:
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-green-600 cursor-pointer hover:underline">Module 2.5 clinical overview requirements</div>
                  <div className="text-xs text-green-600 cursor-pointer hover:underline">FDA guidance investigational drugs</div>
                </div>
              </div>
              
              <div className="border rounded-md p-2 bg-green-50 mt-2">
                <div className="text-xs font-medium mb-1">Suggested search topics:</div>
                <div className="text-xs text-gray-600">Common Module 1-5 guidelines, ICH M4 structure, FDA/EMA submission requirements</div>
              </div>
            </div>
            
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Search className="h-4 w-4 mr-2" />
              Advanced Regulatory Search
            </Button>
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
            
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  <span className="font-medium">eCTD Document Tree</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setIsTreeOpen(!isTreeOpen)}
                  className="flex items-center border-purple-200 text-purple-700"
                >
                  <span>{isTreeOpen ? "Close full eCTD tree" : "Open full eCTD tree"}</span>
                  <ChevronDown className={`h-4 w-4 ml-1 ${isTreeOpen ? "transform rotate-180" : ""}`} />
                </Button>
              </div>

              {isTreeOpen ? (
                <div className="space-y-4 max-h-96 overflow-y-auto border border-purple-200 rounded-md p-3 bg-white shadow-sm">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium">Filter:</span>
                      <select className="text-xs rounded border border-purple-100 px-2 py-1">
                        <option>All Documents</option>
                        <option>Draft Only</option>
                        <option>Final Only</option>
                        <option>Recently Modified</option>
                      </select>
                    </div>
                    <div className="text-xs text-purple-600">
                      <span className="font-medium">43 documents</span> • 18 final
                    </div>
                  </div>
                
                  {documentTree.map(module => (
                    <div key={module.id} className="space-y-2">
                      <div className="flex items-center justify-between font-medium bg-purple-50 p-1.5 rounded-md">
                        <div className="flex items-center">
                          <FolderOpen className="h-4 w-4 mr-2 text-purple-500" />
                          <span className="text-purple-800">{module.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs bg-purple-100 border-purple-200 text-purple-700">
                            {module.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-purple-600">
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="pl-6 space-y-2 border-l border-gray-200 dark:border-gray-700 ml-2">
                        {module.children.map(child => {
                          if (child.type === 'folder') {
                            return (
                              <div key={child.id} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <FolderOpen className="h-4 w-4 mr-2 text-purple-400" />
                                    <span className="text-sm font-medium">{child.name}</span>
                                  </div>
                                  <div className="flex space-x-1">
                                    <Badge variant="outline" className="text-xs bg-purple-50 border-purple-100 text-purple-600">
                                      {child.children.length} docs
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="pl-5 space-y-1 border-l border-purple-100 ml-1">
                                  {child.children.map(subChild => (
                                    <div key={subChild.id} className="flex items-center justify-between hover:bg-purple-50 rounded p-1">
                                      <div className="flex items-center">
                                        <FileText className="h-3 w-3 mr-2 text-purple-400" />
                                        <span className="text-xs">{subChild.name}</span>
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
                                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
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
                              <div key={child.id} className="flex items-center justify-between hover:bg-purple-50 rounded p-1">
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 mr-2 text-purple-400" />
                                  <span className="text-sm">{child.name}</span>
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
                                  <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                                    <Eye className="h-3 w-3 text-purple-500" />
                                  </Button>
                                </div>
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-purple-200 rounded-md p-3 bg-white shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs text-purple-600">
                      <span className="font-medium">Recent documents</span>
                    </div>
                    <div className="text-xs text-purple-600">
                      <span className="font-medium">43 total documents</span> • 18 final
                    </div>
                  </div>
                  <div className="space-y-1">
                    {documentTree[0].children.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between hover:bg-purple-50 rounded p-1">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-purple-400" />
                          <span className="text-sm">{doc.name}</span>
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
                          <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                            {doc.status === 'final' ? 
                              <Eye className="h-3 w-3 text-purple-500" /> :
                              <Edit className="h-3 w-3 text-purple-500" />
                            }
                          </Button>
                        </div>
                      </div>
                    ))}
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