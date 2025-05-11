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
  ExternalLink,
  FilePlus2
} from 'lucide-react';

export default function CoAuthor() {
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
  
  const [isTreeOpen, setIsTreeOpen] = useState(false);

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
              Document Editor
            </CardTitle>
            <CardDescription>
              Create and edit regulatory document with AI assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full mt-2">Launch Editor</Button>
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
              Browse a library of pre-built templates for regulatory submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full mt-2">Browse Templates</Button>
          </CardContent>
        </Card>

        {/* Regulatory Search Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Search className="h-5 w-5 mr-2 text-blue-600" />
              Regulatory Search
            </CardTitle>
            <CardDescription>
              Find regulatory guidelines, standards, and precedents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full mt-2">Start Search</Button>
          </CardContent>
        </Card>

        {/* Vault Document Management Card */}
        <Card className="lg:col-span-2 row-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <FolderOpen className="h-5 w-5 mr-2 text-blue-600" />
              Vault Document Management
            </CardTitle>
            <CardDescription>
              Organize, track versions, and maintain compliance of submission documents
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
                <div className="space-y-4 max-h-96 overflow-y-auto border rounded-md p-3 bg-gray-50">
                  {documentTree.map(module => (
                    <div key={module.id} className="space-y-2">
                      <div className="flex items-center font-medium">
                        <FolderOpen className="h-4 w-4 mr-2 text-blue-500" />
                        <span>{module.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {module.status}
                        </Badge>
                      </div>
                      
                      <div className="pl-6 space-y-2 border-l border-gray-200 ml-2">
                        {module.children.map(child => {
                          if (child.type === 'folder') {
                            return (
                              <div key={child.id} className="space-y-1">
                                <div className="flex items-center">
                                  <FolderOpen className="h-4 w-4 mr-2 text-gray-500" />
                                  <span className="text-sm font-medium">{child.name}</span>
                                </div>
                                
                                <div className="pl-5 space-y-1 border-l border-gray-200 ml-1">
                                  {child.children.map(subChild => (
                                    <div key={subChild.id} className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <FileText className="h-3 w-3 mr-2 text-gray-500" />
                                        <span className="text-xs">{subChild.name}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Badge variant="outline" className="mr-1 text-xs">
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
                              <div key={child.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                  <span className="text-sm">{child.name}</span>
                                </div>
                                <div className="flex items-center">
                                  <Badge variant="outline" className="mr-1 text-xs">
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
                <div className="pl-8 space-y-2 border-l-2 border-gray-200 ml-2">
                  {documentTree[0].children.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">{doc.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-1 text-xs">
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

              <div className="flex justify-end space-x-2 mt-4">
                <Button size="sm" variant="outline" className="flex items-center">
                  <FilePlus2 className="h-4 w-4 mr-1" />
                  New Document
                </Button>
                <Button size="sm" variant="outline" className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Import
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
            <CardTitle className="text-lg">Module Progress</CardTitle>
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
                    <div className="text-sm font-medium">{module.percent}%</div>
                  </div>
                  <Progress value={module.percent} className="h-2" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">80%</div>
                <div className="text-sm text-gray-500">Recent Documents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">60%</div>
                <div className="text-sm text-gray-500">Module Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">20%</div>
                <div className="text-sm text-gray-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}