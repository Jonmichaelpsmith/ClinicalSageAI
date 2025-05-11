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
  Database
} from 'lucide-react';

export default function CoAuthor() {
  // Component state
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  
  // Mock data for modules and documents
  const moduleProgress = [
    { id: 1, name: 'Module 1', description: 'Administrative', percent: 80 },
    { id: 2, name: 'Quality', description: 'Quality', percent: 60 },
    { id: 3, name: 'Nonclinical', description: 'Production and General', percent: 40 }
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
        {/* Document Editor Card */}
        <Card>
          <CardHeader className="pb-2">
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
            <Button className="w-full">Launch Editor</Button>
          </CardContent>
        </Card>

        {/* Template Library Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <LayoutTemplate className="h-5 w-5 mr-2 text-blue-600" />
              Template Library
            </CardTitle>
            <CardDescription>
              Pre-approved document templates for regulatory submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3 space-y-2">
              <div className="border rounded-md p-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="font-medium text-sm">Module 1 Templates</span>
                  </div>
                  <Badge variant="outline" className="text-xs">FDA</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">Standard administrative documents</p>
              </div>
              <div className="border rounded-md p-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="font-medium text-sm">Module 2 Templates</span>
                  </div>
                  <Badge variant="outline" className="text-xs">ICH</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">Overview and summary templates</p>
              </div>
              <div className="border rounded-md p-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="font-medium text-sm">Regional Templates</span>
                  </div>
                  <Badge variant="outline" className="text-xs">EMA</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">Region-specific templates</p>
              </div>
            </div>
            <Button className="w-full">Browse All Templates</Button>
          </CardContent>
        </Card>

        {/* Regulatory Search Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Search className="h-5 w-5 mr-2 text-blue-600" />
              Intelligent Regulatory Search
            </CardTitle>
            <CardDescription>
              Find relevant guidance and precedents for regulatory documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search regulatory guidelines..." 
                  className="pl-8 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="text-xs cursor-pointer">FDA Guidelines</Badge>
                <Badge variant="secondary" className="text-xs cursor-pointer">ICH Standards</Badge>
                <Badge variant="secondary" className="text-xs cursor-pointer">eCTD Requirements</Badge>
                <Badge variant="secondary" className="text-xs cursor-pointer">EMA</Badge>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="text-xs text-muted-foreground mb-1">Recent searches:</div>
                <div className="space-y-1">
                  <div className="text-xs text-blue-600 cursor-pointer">Module 2.5 clinical overview requirements</div>
                  <div className="text-xs text-blue-600 cursor-pointer">FDA guidance investigational drugs</div>
                </div>
              </div>
            </div>
            <Button className="w-full">Advanced Search</Button>
          </CardContent>
        </Card>

        {/* Vault Document Management Card */}
        <Card className="lg:col-span-2 row-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Database className="h-5 w-5 mr-2 text-blue-600" />
              Enterprise Vault Document Management
            </CardTitle>
            <CardDescription>
              Enterprise-grade document repository with version control
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  <span className="font-medium">eCTD Document Tree</span>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setIsTreeOpen(!isTreeOpen)}
                  className="flex items-center"
                >
                  <span>{isTreeOpen ? "Close full eCTD tree" : "Open full eCTD tree"}</span>
                  <ChevronDown className={`h-4 w-4 ml-1 ${isTreeOpen ? "transform rotate-180" : ""}`} />
                </Button>
              </div>

              {isTreeOpen ? (
                <div className="space-y-4 max-h-96 overflow-y-auto border rounded-md p-3 bg-gray-50 dark:bg-gray-900">
                  {documentTree.map(module => (
                    <div key={module.id} className="space-y-2">
                      <div className="flex items-center font-medium">
                        <FolderOpen className="h-4 w-4 mr-2 text-blue-500" />
                        <span>{module.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {module.status}
                        </Badge>
                      </div>
                      
                      <div className="pl-6 space-y-2 border-l border-gray-200 dark:border-gray-700 ml-2">
                        {module.children.map(child => {
                          if (child.type === 'folder') {
                            return (
                              <div key={child.id} className="space-y-1">
                                <div className="flex items-center">
                                  <FolderOpen className="h-4 w-4 mr-2 text-gray-500" />
                                  <span className="text-sm font-medium">{child.name}</span>
                                </div>
                                
                                <div className="pl-5 space-y-1 border-l border-gray-200 dark:border-gray-700 ml-1">
                                  {child.children.map(subChild => (
                                    <div key={subChild.id} className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-1">
                                      <div className="flex items-center">
                                        <FileText className="h-3 w-3 mr-2 text-gray-500" />
                                        <span className="text-xs">{subChild.name}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Badge variant={subChild.status === 'final' ? 'default' : 'outline'} className="mr-1 text-xs">
                                          {subChild.status}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          {subChild.format}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div key={child.id} className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-1">
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                  <span className="text-sm">{child.name}</span>
                                </div>
                                <div className="flex items-center">
                                  <Badge variant={child.status === 'final' ? 'default' : 'outline'} className="mr-1 text-xs">
                                    {child.status}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {child.format}
                                  </Badge>
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
                <div className="pl-8 space-y-2 border-l-2 border-gray-200 dark:border-gray-700 ml-2">
                  {documentTree[0].children.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-1">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">{doc.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant={doc.status === 'final' ? 'default' : 'outline'} className="mr-1 text-xs">
                          {doc.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {doc.format}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex items-center">
                  <FilePlus2 className="h-4 w-4 mr-1" />
                  New Document
                </Button>
                <Button size="sm" variant="outline" className="flex items-center">
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </Button>
                <Button size="sm" variant="outline" className="flex items-center">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button size="sm" variant="outline" className="flex items-center">
                  <History className="h-4 w-4 mr-1" />
                  Version History
                </Button>
                <Button size="sm" variant="outline" className="flex items-center">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Documents Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {recentDocuments.map(doc => (
                <div key={doc.id} className="flex justify-between items-start border-b pb-2">
                  <div>
                    <div className="font-medium text-sm">{doc.name}</div>
                    <div className="text-xs text-gray-500">{doc.description}</div>
                    <div className="text-xs text-gray-400">Edited {doc.lastEdited}</div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 px-2">
                    <Eye className="h-3 w-3 mr-1" />
                    <span className="text-xs">View</span>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Module Progress Card */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-blue-600">
                <path d="M12 20V10"></path>
                <path d="M18 20V4"></path>
                <path d="M6 20v-4"></path>
              </svg>
              Module Progress Tracker
            </CardTitle>
            <CardDescription>
              Track completion status across eCTD modules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {moduleProgress.map(module => (
                <div key={module.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="font-medium">Module {module.id}</div>
                      <div className="text-sm text-gray-500 ml-2">{module.description}</div>
                    </div>
                    <div className="flex items-center">
                      <Badge 
                        className={`mr-3 ${
                          module.percent > 75 ? "bg-green-100 text-green-800 hover:bg-green-200" : 
                          module.percent > 40 ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" : 
                          "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {module.percent > 75 ? "On Track" : module.percent > 40 ? "In Progress" : "Not Started"}
                      </Badge>
                      <div className="text-sm font-medium">{module.percent}%</div>
                    </div>
                  </div>
                  <Progress 
                    value={module.percent} 
                    className={`h-2 ${
                      module.percent > 75 ? "bg-green-50" : 
                      module.percent > 40 ? "bg-yellow-50" : 
                      "bg-gray-50"
                    }`} 
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8 border-t pt-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">60%</div>
                <div className="text-sm text-gray-600 font-medium">Overall Progress</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-gray-600 font-medium">Documents Complete</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">5</div>
                <div className="text-sm text-gray-600 font-medium">Pending Review</div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Button variant="outline" className="mt-2">
                Generate Progress Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}