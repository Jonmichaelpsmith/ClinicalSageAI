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
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  
  return (
    <div className="flex flex-col h-full">
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

      <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* AI-Powered Document Editor Card - Enhanced with GPT-4o */}
        <Card className="border-blue-200 shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center text-lg">
                <Edit className="h-5 w-5 mr-2 text-blue-600" />
                AI-Powered Document Editor
              </CardTitle>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                GPT-4o Enhanced
              </Badge>
            </div>
            <CardDescription>
              Create and edit regulatory documents with intelligent assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Action buttons */}
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
              
              {/* AI capabilities section */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <div className="flex items-center mb-2">
                  <svg className="h-5 w-5 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div className="font-medium text-blue-800">AI Writing Assistance</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1.5" />
                    <span>Regulatory Guidelines Integration</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1.5" />
                    <span>Consistency Checking</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1.5" />
                    <span>Automated References</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1.5" />
                    <span>Technical Writing Review</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1.5" />
                    <span>Content Standardization</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1.5" />
                    <span>Real-time Corrections</span>
                  </div>
                </div>
              </div>
              
              {/* Recent editing sessions */}
              <div className="border rounded-lg border-blue-200 overflow-hidden">
                <div className="bg-blue-50 p-2 flex justify-between items-center">
                  <div className="text-sm font-medium text-blue-800">Active Sessions</div>
                  <div className="text-xs text-blue-600 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Auto-saves every 30s</span>
                  </div>
                </div>
                
                <div className="p-2 hover:bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-blue-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium">Module 2.5 Clinical Overview</div>
                        <div className="text-xs text-gray-500">2 collaborators · Last edit 5 min ago</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional Template Library Card */}
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
              <div className="bg-yellow-50 rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-yellow-800">FDA Templates</h4>
                  <Badge variant="outline" className="bg-white text-yellow-700 border-yellow-200">
                    32 templates
                  </Badge>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full border-yellow-200 text-yellow-700">
                Browse All Templates
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Regulatory Search Card */}
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
            </div>
          </CardContent>
        </Card>

        {/* Vault Document Management Card - Enterprise Enhanced Version */}
        <Card className="lg:col-span-2 row-span-2 border-purple-200 shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-white">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center text-lg">
                <Database className="h-5 w-5 mr-2 text-purple-600" />
                Enterprise Vault Document Management
              </CardTitle>
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                21 CFR Part 11 Compliant
              </Badge>
            </div>
            <CardDescription>
              Secure document repository with version control and regulatory compliance features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 mb-3">
                <Button size="sm" variant="outline" className="border-purple-200 text-purple-700">
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Import Document
                </Button>
                <Button size="sm" variant="outline" className="border-purple-200 text-purple-700">
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Export Package
                </Button>
                <Button size="sm" variant="outline" className="border-purple-200 text-purple-700">
                  <History className="h-3.5 w-3.5 mr-1.5" />
                  Version History
                </Button>
                <Button size="sm" variant="outline" className="border-purple-200 text-purple-700">
                  <Share2 className="h-3.5 w-3.5 mr-1.5" />
                  Share
                </Button>
              </div>

              {/* Document listing with status indicators */}
              <div className="border rounded-lg border-purple-200 overflow-hidden">
                <div className="bg-purple-50 p-2 flex justify-between items-center">
                  <div className="text-sm font-medium text-purple-800">Recent Vault Documents</div>
                  <div className="text-xs text-purple-600">ICH eCTD Formatted</div>
                </div>
                
                <div className="divide-y divide-purple-100">
                  <div className="p-2 hover:bg-purple-50 flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-purple-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium">Module 2.4 Nonclinical Overview</div>
                        <div className="text-xs text-gray-500">v2.3 · Modified 3 hours ago</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
                  </div>
                  
                  <div className="p-2 hover:bg-purple-50 flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-purple-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium">Module 3.2.P.5.1 Specifications</div>
                        <div className="text-xs text-gray-500">v1.2 · Modified yesterday</div>
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">In Review</Badge>
                  </div>
                </div>
              </div>

              {/* Compliance information */}
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 text-sm">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="font-medium text-purple-800">Regulatory Compliance Status</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    <span>ICH eCTD Structure</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    <span>Electronic Signatures</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    <span>Audit Trail Enabled</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    <span>Access Controls</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Documents Card */}
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
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-600" />
                <div>
                  <div className="font-medium">Study Protocol v2.3</div>
                  <div className="text-xs text-gray-500">Last edited 2 hours ago</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* eCTD Document Tree Card - Enhanced Enterprise Version */}
        <Card className="border-green-200 shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-white">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center text-lg">
                <FolderOpen className="h-5 w-5 mr-2 text-green-600" />
                eCTD Structure Navigator
              </CardTitle>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                ICH eCTD v4.0
              </Badge>
            </div>
            <CardDescription>
              Interactive Common Technical Document (CTD) structure with regulatory compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4 justify-between">
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2 bg-green-50 border-green-200 text-green-700 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>Regional Compliant</span>
                </Badge>
                <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>XML Backbone</span>
                </Badge>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 border-green-200 text-green-700"
                onClick={() => setIsTreeOpen(!isTreeOpen)}
              >
                <span>{isTreeOpen ? "Collapse" : "Expand Tree"}</span>
              </Button>
            </div>
            
            <div className="mt-2 space-y-1">
              {/* Module 1 - always visible with regional specifics */}
              <div className="border-l-2 border-green-200 pl-3 py-1">
                <div className="flex items-center text-sm font-medium">
                  <ChevronRight className="h-4 w-4 text-green-600 mr-1" />
                  <span>Module 1: Administrative Information</span>
                  <Badge className="ml-2 text-xs bg-blue-100 text-blue-800 border-blue-200">Region-specific</Badge>
                </div>
              </div>
              
              {isTreeOpen && (
                <div className="space-y-1 ml-5 mb-2">
                  <div className="border-l-2 border-green-100 pl-3 py-1">
                    <div className="flex items-center text-xs text-gray-700">
                      <FileText className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                      <span>1.1 Forms</span>
                    </div>
                  </div>
                  <div className="border-l-2 border-green-100 pl-3 py-1">
                    <div className="flex items-center text-xs text-gray-700">
                      <FileText className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                      <span>1.2 Cover Letters</span>
                    </div>
                  </div>
                  <div className="border-l-2 border-green-100 pl-3 py-1">
                    <div className="flex items-center text-xs text-gray-700">
                      <FileText className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                      <span>1.3 Product Information</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Module 2 */}
              <div className="border-l-2 border-green-200 pl-3 py-1">
                <div className="flex items-center text-sm font-medium">
                  <ChevronRight className="h-4 w-4 text-green-600 mr-1" />
                  <span>Module 2: CTD Summaries</span>
                </div>
              </div>
              
              {isTreeOpen && (
                <div className="space-y-1 ml-5 mb-2">
                  <div className="border-l-2 border-green-100 pl-3 py-1">
                    <div className="flex items-center text-xs text-gray-700">
                      <FileText className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                      <span>2.3 Quality Overall Summary</span>
                    </div>
                  </div>
                  <div className="border-l-2 border-green-100 pl-3 py-1">
                    <div className="flex items-center text-xs text-gray-700">
                      <FileText className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                      <span>2.4 Nonclinical Overview</span>
                    </div>
                  </div>
                  <div className="border-l-2 border-green-100 pl-3 py-1">
                    <div className="flex items-center text-xs text-gray-700">
                      <FileText className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                      <span>2.5 Clinical Overview</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Module 3-5 collapsed headers */}
              <div className="border-l-2 border-green-200 pl-3 py-1">
                <div className="flex items-center text-sm font-medium">
                  <ChevronRight className="h-4 w-4 text-green-600 mr-1" />
                  <span>Module 3: Quality</span>
                </div>
              </div>
              
              <div className="border-l-2 border-green-200 pl-3 py-1">
                <div className="flex items-center text-sm font-medium">
                  <ChevronRight className="h-4 w-4 text-green-600 mr-1" />
                  <span>Module 4: Nonclinical Study Reports</span>
                </div>
              </div>
              
              <div className="border-l-2 border-green-200 pl-3 py-1">
                <div className="flex items-center text-sm font-medium">
                  <ChevronRight className="h-4 w-4 text-green-600 mr-1" />
                  <span>Module 5: Clinical Study Reports</span>
                </div>
              </div>
            </div>
            
            {/* Regulatory compliance footer */}
            <div className="mt-4 pt-3 border-t border-green-100 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-3 w-3 text-green-600 mr-1" />
                  <span>eCTD Validation Status: Passed</span>
                </div>
                <span className="text-green-600">100% ICH Compliant</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Module Progress Card */}
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
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-700">Module 1: Administrative</div>
                  <div className="text-sm text-gray-500">80%</div>
                </div>
                <Progress value={80} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-700">Module 2: Quality</div>
                  <div className="text-sm text-gray-500">60%</div>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-700">Module 3: Non-Clinical</div>
                  <div className="text-sm text-gray-500">35%</div>
                </div>
                <Progress value={35} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
