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
  Clock,
  Check,
  GitBranch,
  Shield,
  FileCheck,
  Link,
  User,
  FileLock,
  GitMerge,
  SlidersHorizontal,
  Info,
  Plus,
  MoreHorizontal,
  PanelLeft,
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
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">GPT-4o Enhanced</Badge>
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
                  <svg
                    className="h-5 w-5 text-blue-600 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
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
                        <div className="text-xs text-gray-500">
                          2 collaborators · Last edit 5 min ago
                        </div>
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
              <Button
                size="sm"
                variant="outline"
                className="w-full border-yellow-200 text-yellow-700"
              >
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
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                      In Review
                    </Badge>
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
            <CardDescription>Quick access to your most recently edited documents</CardDescription>
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

        {/* eCTD Document Tree Card - Advanced Enterprise Version 
         * Gradient background created using the CSS Gradient Generator Replit extension
         * The gradient provides a subtle green fade that matches the eCTD structure theming
         * This improves visual hierarchy and user experience per design specifications
         */}
        <Card className="border-green-200 shadow-md">
          <CardHeader className="pb-2" style={{ background: "linear-gradient(to right, #e8f5e9 0%, #ffffff 100%)" }}>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center text-lg">
                <FolderOpen className="h-5 w-5 mr-2 text-green-600" />
                eCTD Structure Navigator
              </CardTitle>
              <div className="flex space-x-2">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  ICH eCTD v4.0
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  Enterprise
                </Badge>
              </div>
            </div>
            <CardDescription>
              Interactive Common Technical Document (CTD) structure with regulatory compliance and
              real-time validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Enhanced toolbar with more enterprise controls */}
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center">
                  <Badge
                    variant="outline"
                    className="bg-green-50 border-green-200 text-green-700 flex items-center h-6"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    <span>FDA Compliant</span>
                  </Badge>
                </div>
                <div className="flex items-center">
                  <Badge
                    variant="outline"
                    className="bg-green-50 border-green-200 text-green-700 flex items-center h-6"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    <span>XML Backbone</span>
                  </Badge>
                </div>

                <div className="ml-auto flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-gray-200 text-gray-700"
                  >
                    <SlidersHorizontal className="h-3 w-3 mr-1" />
                    <span>Filter</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-green-200 text-green-700"
                    onClick={() => setIsTreeOpen(!isTreeOpen)}
                  >
                    <span>{isTreeOpen ? 'Collapse All' : 'Expand All'}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Search and drag & drop area */}
            <div className="mb-4 flex items-center">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search across all modules..."
                  className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-green-500 focus:outline-none"
                />
              </div>
              <Button size="sm" className="ml-2 bg-green-600 hover:bg-green-700 h-9">
                <Plus className="h-4 w-4 mr-1" />
                <span>Add Document</span>
              </Button>
            </div>

            <div className="bg-green-50 p-2 rounded-md border border-green-100 text-xs text-green-800 mb-4 flex items-center">
              <Info className="h-3.5 w-3.5 mr-1.5 text-green-600" />
              <span>
                Drag documents to reposition within regulatory structure or drop files to import
              </span>
            </div>

            <div className="mt-2 space-y-1 max-h-[400px] overflow-y-auto pr-1 border border-green-100 rounded-md bg-white shadow-sm">
              {/* Module 1 - always visible with regional specifics */}
              <div className="border-l-4 border-green-400 pl-3 py-2 hover:bg-green-50 transition-colors group">
                <div className="flex items-center text-sm font-medium justify-between">
                  <div className="flex items-center">
                    <ChevronDown className="h-4 w-4 text-green-600 mr-1 cursor-pointer" />
                    <span className="font-semibold text-green-800">
                      Module 1: Administrative Information
                    </span>
                    <Badge className="ml-2 text-xs bg-blue-100 text-blue-800 border-blue-200">
                      Region-specific
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="text-xs bg-green-100 text-green-700">25 Files</Badge>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <FilePlus2 className="h-3.5 w-3.5 text-green-600" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3.5 w-3.5 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {isTreeOpen && (
                <div className="space-y-1 ml-5 mb-2">
                  <div className="border-l-2 border-green-100 pl-3 py-1 hover:bg-green-50 rounded-r-md transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-700">
                        <FileText className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                        <span>1.1 Forms</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge className="text-[10px] px-1 h-4 bg-green-100 text-green-700">
                          Signed
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                          <MoreHorizontal className="h-3 w-3 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-2 border-green-100 pl-3 py-1 hover:bg-green-50 rounded-r-md transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-700">
                        <FileText className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
                        <span>1.2 Cover Letters</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge className="text-[10px] px-1 h-4 bg-amber-100 text-amber-700">
                          Draft
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                          <MoreHorizontal className="h-3 w-3 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-2 border-green-100 pl-3 py-1 hover:bg-green-50 rounded-r-md transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-700">
                        <FileText className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                        <span>1.3 Administrative Information</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge className="text-[10px] px-1 h-4 bg-green-100 text-green-700">
                          Complete
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                          <MoreHorizontal className="h-3 w-3 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-2 border-green-100 pl-3 py-1 hover:bg-green-50 rounded-r-md transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-700">
                        <FileText className="h-3.5 w-3.5 text-red-500 mr-1.5" />
                        <span>1.4 References</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge className="text-[10px] px-1 h-4 bg-red-100 text-red-700">
                          Missing
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                          <MoreHorizontal className="h-3 w-3 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Module 2 */}
              <div className="border-l-2 border-green-200 pl-3 py-1 hover:bg-green-50 rounded-r-md transition-colors">
                <div className="flex items-center text-sm font-medium justify-between">
                  <div className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-green-600 mr-1 cursor-pointer" />
                    <span>Module 2: CTD Summaries</span>
                  </div>
                  <div className="flex items-center">
                    <Badge className="text-xs bg-amber-100 text-amber-700">In Progress</Badge>
                  </div>
                </div>
              </div>

              {isTreeOpen && (
                <div className="space-y-1 ml-5 mb-2">
                  <div className="border-l-2 border-green-100 pl-3 py-1 hover:bg-green-50 rounded-r-md transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-700">
                        <FileText className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                        <span>2.2 Introduction</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge className="text-[10px] px-1 h-4 bg-green-100 text-green-700">
                          Approved
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                          <MoreHorizontal className="h-3 w-3 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-2 border-green-100 pl-3 py-1 hover:bg-green-50 rounded-r-md transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-700">
                        <FileText className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
                        <span>2.3 Quality Overall Summary</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge className="text-[10px] px-1 h-4 bg-amber-100 text-amber-700">
                          In Review
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                          <MoreHorizontal className="h-3 w-3 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-2 border-green-100 pl-3 py-1 hover:bg-green-50 rounded-r-md transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-700">
                        <FileText className="h-3.5 w-3.5 text-blue-500 mr-1.5" />
                        <span>2.4 Nonclinical Overview</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge className="text-[10px] px-1 h-4 bg-blue-100 text-blue-700">
                          In Progress
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                          <MoreHorizontal className="h-3 w-3 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-2 border-green-100 pl-3 py-1 hover:bg-green-50 rounded-r-md transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-700">
                        <FileText className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
                        <span>2.5 Clinical Overview</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge className="text-[10px] px-1 h-4 bg-amber-100 text-amber-700">
                          In Progress
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                          <MoreHorizontal className="h-3 w-3 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Module 3-5 collapsed headers */}
              <div className="border-l-2 border-green-200 pl-3 py-1 hover:bg-green-50 rounded-r-md transition-colors">
                <div className="flex items-center text-sm font-medium justify-between">
                  <div className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-green-600 mr-1 cursor-pointer" />
                    <span>Module 3: Quality</span>
                  </div>
                  <div className="flex items-center">
                    <Badge className="text-xs bg-amber-100 text-amber-700">35% Complete</Badge>
                  </div>
                </div>
              </div>

              <div className="border-l-2 border-green-200 pl-3 py-1 hover:bg-green-50 rounded-r-md transition-colors">
                <div className="flex items-center text-sm font-medium justify-between">
                  <div className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-green-600 mr-1 cursor-pointer" />
                    <span>Module 4: Nonclinical Study Reports</span>
                  </div>
                  <div className="flex items-center">
                    <Badge className="text-xs bg-red-100 text-red-700">15% Complete</Badge>
                  </div>
                </div>
              </div>

              <div className="border-l-2 border-green-200 pl-3 py-1 hover:bg-green-50 rounded-r-md transition-colors">
                <div className="flex items-center text-sm font-medium justify-between">
                  <div className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-green-600 mr-1 cursor-pointer" />
                    <span>Module 5: Clinical Study Reports</span>
                  </div>
                  <div className="flex items-center">
                    <Badge className="text-xs bg-amber-100 text-amber-700">42% Complete</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Enterprise actions bar */}
            <div className="flex space-x-2 mt-4 mb-3">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-green-200 text-green-700 flex-grow"
              >
                <FileCheck className="h-3.5 w-3.5 mr-1.5" />
                <span>Validate Structure</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-green-200 text-green-700 flex-grow"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                <span>Export eCTD</span>
              </Button>
              <Button size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700 flex-grow">
                <PanelLeft className="h-3.5 w-3.5 mr-1.5" />
                <span>Full Navigator</span>
              </Button>
            </div>

            {/* Regulatory compliance footer */}
            <div className="mt-4 pt-3 border-t border-green-100 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-3.5 w-3.5 text-green-600 mr-1.5" />
                  <span>FDA eCTD Validation: Passed</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-700">ICH M4 Compliant</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module Progress Card - Advanced Enterprise Version */}
        <Card className="border-blue-200 shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center text-lg">
                <BarChart className="h-5 w-5 mr-2 text-blue-600" />
                Module Progress & Status
              </CardTitle>
              <div className="flex space-x-2">
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">IND-23645</Badge>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">FDA</Badge>
              </div>
            </div>
            <CardDescription>
              Real-time completion and validation status across CTD modules with advanced compliance
              monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Enterprise submission information */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 mb-4">
                <div className="flex flex-wrap gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">Submission Type:</span>
                    <span className="ml-1 font-medium">Original IND</span>
                  </div>
                  <div>
                    <span className="text-gray-500">FDA Due Date:</span>
                    <span className="ml-1 font-medium text-amber-600">Jun 15, 2025 (23 days)</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Submission Status:</span>
                    <span className="ml-1 font-medium text-blue-600">In Preparation</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Project Lead:</span>
                    <span className="ml-1 font-medium">Dr. Jane Smith</span>
                  </div>
                </div>
              </div>

              {/* Module progress tracking with enhanced enterprise features */}
              <div className="border rounded-lg border-blue-100 overflow-hidden">
                <div className="bg-blue-50 px-3 py-2 border-b border-blue-100 flex justify-between items-center">
                  <div className="text-sm font-medium text-blue-800">Module Completion</div>
                  <div className="flex items-center">
                    <Shield className="h-3 w-3 mr-1 text-blue-600" />
                    <span className="text-xs text-blue-600">FDA Submission Ready</span>
                  </div>
                </div>

                <div className="p-3 space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-700 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1.5 text-green-500" />
                        <span>Module 1: Administrative</span>
                      </div>
                      <div className="flex items-center">
                        <div className="text-sm text-gray-500 mr-2">80%</div>
                        <Badge className="bg-green-100 text-green-700 text-xs">Regional</Badge>
                      </div>
                    </div>
                    <Progress value={80} className="h-2 bg-blue-100" />
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>23 of 28 sections complete</span>
                      <div className="flex items-center text-blue-600 cursor-pointer">
                        <Eye className="h-3 w-3 mr-1" />
                        <span>View Details</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-700 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1.5 text-amber-500" />
                        <span>Module 2: Summaries</span>
                      </div>
                      <div className="flex items-center">
                        <div className="text-sm text-gray-500 mr-2">62%</div>
                        <Badge className="bg-amber-100 text-amber-700 text-xs">In Progress</Badge>
                      </div>
                    </div>
                    <Progress value={62} className="h-2 bg-blue-100" />
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>5 of 8 sections complete</span>
                      <div className="flex items-center text-blue-600 cursor-pointer">
                        <Eye className="h-3 w-3 mr-1" />
                        <span>View Details</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-700 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1.5 text-amber-500" />
                        <span>Module 3: Quality</span>
                      </div>
                      <div className="flex items-center">
                        <div className="text-sm text-gray-500 mr-2">35%</div>
                        <Badge className="bg-amber-100 text-amber-700 text-xs">In Progress</Badge>
                      </div>
                    </div>
                    <Progress value={35} className="h-2 bg-blue-100" />
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>12 of 34 sections complete</span>
                      <div className="flex items-center text-blue-600 cursor-pointer">
                        <Eye className="h-3 w-3 mr-1" />
                        <span>View Details</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-700 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1.5 text-red-500" />
                        <span>Module 4: Nonclinical</span>
                      </div>
                      <div className="flex items-center">
                        <div className="text-sm text-gray-500 mr-2">15%</div>
                        <Badge className="bg-red-100 text-red-700 text-xs">Attention</Badge>
                      </div>
                    </div>
                    <Progress value={15} className="h-2 bg-blue-100" />
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>3 of 20 sections complete</span>
                      <div className="flex items-center text-red-600 cursor-pointer">
                        <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
                        <span>Critical Issues</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-700 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1.5 text-amber-500" />
                        <span>Module 5: Clinical</span>
                      </div>
                      <div className="flex items-center">
                        <div className="text-sm text-gray-500 mr-2">42%</div>
                        <Badge className="bg-amber-100 text-amber-700 text-xs">In Progress</Badge>
                      </div>
                    </div>
                    <Progress value={42} className="h-2 bg-blue-100" />
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>8 of 19 sections complete</span>
                      <div className="flex items-center text-blue-600 cursor-pointer">
                        <Eye className="h-3 w-3 mr-1" />
                        <span>View Details</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced validation metrics for enterprise */}
              <div className="border rounded-lg border-blue-100 overflow-hidden">
                <div className="bg-blue-50 px-3 py-2 border-b border-blue-100 flex justify-between items-center">
                  <div className="text-sm font-medium text-blue-800 flex items-center">
                    <FileCheck className="h-4 w-4 mr-1.5 text-blue-600" />
                    <span>Enterprise Validation Status</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    <span>Preliminary Pass</span>
                  </Badge>
                </div>

                <div className="p-3">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white p-2 rounded border border-gray-100">
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        ICH eCTD Compliance
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-green-600">3/3 Specifications</div>
                        <Shield className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-100">
                      <div className="text-xs font-medium text-gray-600 mb-1">21 CFR Part 11</div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-green-600">Compliant</div>
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-100">
                      <div className="text-xs font-medium text-gray-600 mb-1">PDF Technical</div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-amber-600">2 Warnings</div>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-100">
                      <div className="text-xs font-medium text-gray-600 mb-1">XML Backbone</div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-green-600">Valid</div>
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-blue-100 flex justify-between">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-blue-200 text-blue-700"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      <span>Export Report</span>
                    </Button>
                    <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      <span>eCTD Export</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Version Control Card - Enterprise Vault Integration */}
        <Card className="border-red-200 shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-red-50 to-white">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center text-lg">
                <History className="h-5 w-5 mr-2 text-red-600" />
                Vault Document Control
              </CardTitle>
              <Badge className="bg-red-100 text-red-800 border-red-200">21 CFR Part 11</Badge>
            </div>
            <CardDescription>
              Enterprise-grade document versioning and approval workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Active document */}
              <div className="border rounded-lg overflow-hidden border-red-200">
                <div className="bg-red-50 border-b border-red-200 px-3 py-2 flex justify-between items-center">
                  <div className="font-medium flex items-center">
                    <FileLock className="h-4 w-4 mr-2 text-red-600" />
                    <span>Active Documents</span>
                  </div>
                  <div className="text-xs text-red-600 flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    <span>Versioned Repository</span>
                  </div>
                </div>

                <div className="p-3 bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="font-medium">Module 2.5 Clinical Overview</div>
                      <Badge
                        variant="outline"
                        className="ml-2 bg-red-50 border-red-200 text-red-700"
                      >
                        v3.2
                      </Badge>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                      In Review
                    </Badge>
                  </div>

                  <div className="text-sm text-gray-500 flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    <span>Last edited by Jane Smith, 2d ago</span>
                  </div>

                  <div className="grid grid-cols-2 mt-2 mb-3 text-xs text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-red-500" />
                      <span>Modified: May 9, 2025</span>
                    </div>
                    <div className="flex items-center">
                      <FileCheck className="h-3 w-3 mr-1 text-green-500" />
                      <span>Validated: Yes</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-3 w-3 mr-1 text-blue-500" />
                      <span>Format: DOCX</span>
                    </div>
                    <div className="flex items-center">
                      <Link className="h-3 w-3 mr-1 text-purple-500" />
                      <span>Links: 4 cross-references</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="h-7 border-red-200 text-red-700">
                      <History className="h-3 w-3 mr-1" />
                      <span>Version History</span>
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 border-red-200 text-red-700">
                      <GitBranch className="h-3 w-3 mr-1" />
                      <span>Compare Versions</span>
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 border-red-200 text-red-700">
                      <Check className="h-3 w-3 mr-1" />
                      <span>Approval Workflow</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Document audit trail */}
              <div className="border rounded-lg border-red-200 overflow-hidden">
                <div className="bg-red-50 px-3 py-2 border-b border-red-200 flex justify-between items-center">
                  <div className="font-medium text-sm">Document Audit Trail</div>
                  <Button variant="ghost" size="sm" className="h-6 text-xs p-0 px-2 text-red-600">
                    <span>View Full Log</span>
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>

                <div className="p-0 text-sm">
                  <div className="flex items-center p-2 border-b border-gray-100 hover:bg-red-50">
                    <div className="w-6 flex-shrink-0">
                      <Edit className="h-3 w-3 text-amber-500" />
                    </div>
                    <div className="flex-grow">
                      <span className="text-gray-700">Jane Smith edited Module 2.5</span>
                      <span className="text-xs text-gray-500 ml-2">May 9, 2025 14:32</span>
                    </div>
                  </div>
                  <div className="flex items-center p-2 border-b border-gray-100 hover:bg-red-50">
                    <div className="w-6 flex-shrink-0">
                      <Check className="h-3 w-3 text-green-500" />
                    </div>
                    <div className="flex-grow">
                      <span className="text-gray-700">John Doe approved v3.1</span>
                      <span className="text-xs text-gray-500 ml-2">May 8, 2025 09:15</span>
                    </div>
                  </div>
                  <div className="flex items-center p-2 hover:bg-red-50">
                    <div className="w-6 flex-shrink-0">
                      <GitMerge className="h-3 w-3 text-blue-500" />
                    </div>
                    <div className="flex-grow">
                      <span className="text-gray-700">System generated v3.0</span>
                      <span className="text-xs text-gray-500 ml-2">May 7, 2025 16:48</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
