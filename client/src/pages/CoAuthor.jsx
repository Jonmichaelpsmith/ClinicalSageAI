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
        {/* AI-Powered Document Editor Card */}
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

        {/* Vault Document Management Card */}
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

        {/* eCTD Document Tree Card */}
        <Card className="border-green-200">
          <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-white">
            <CardTitle className="flex items-center text-lg">
              <FolderOpen className="h-5 w-5 mr-2 text-green-600" />
              Document Tree Visualization
            </CardTitle>
            <CardDescription>
              Interactive Common Technical Document (CTD) structure viewer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <Badge variant="outline" className="mr-2 bg-green-50 border-green-200 text-green-700 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span>ICH Compliant</span>
              </Badge>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 border-green-200 text-green-700"
                onClick={() => setIsTreeOpen(!isTreeOpen)}
              >
                <span>{isTreeOpen ? "Collapse" : "Expand"}</span>
              </Button>
            </div>
            
            <div className="mt-2 space-y-2">
              {isTreeOpen && (
                <div className="border-l-2 border-green-200 pl-3 space-y-2 text-sm">
                  <div className="font-medium">Module 1: Administrative</div>
                  <div className="font-medium">Module 2: Quality</div>
                  <div className="font-medium">Module 3: Non-Clinical</div>
                  <div className="font-medium">Module 4: Clinical</div>
                  <div className="font-medium">Module 5: References</div>
                </div>
              )}
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
