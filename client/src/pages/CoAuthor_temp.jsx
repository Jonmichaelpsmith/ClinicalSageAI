import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  ShieldCheck,
  PlayCircle,
  UserCheck,
  AlertTriangle,
  CheckSquare,
  Users
} from 'lucide-react';

export default function CoAuthor() {
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  const [isCollaborationOpen, setIsCollaborationOpen] = useState(false);

  return (
    <div className="flex h-full">
      {/* Main content area */}
      <div className="flex flex-col flex-grow">
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

        <div className="flex px-6">
          <Button 
            variant="outline" 
            className="h-9 mr-2"
            onClick={() => setIsTreeOpen(!isTreeOpen)}
          >
            <PanelLeft className="h-4 w-4 mr-2" />
            {isTreeOpen ? "Hide Navigation" : "Show Navigation"}
          </Button>
          
          <Button 
            variant="outline" 
            className="h-9 ml-auto"
            onClick={() => setIsCollaborationOpen(!isCollaborationOpen)}
          >
            <Users className="h-4 w-4 mr-2" />
            {isCollaborationOpen ? "Hide Collaboration" : "Team Collaboration"}
          </Button>
        </div>

        {/* Main content block - basic placeholder */}
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>eCTD Document Workspace</CardTitle>
              <CardDescription>
                Manage and edit your eCTD submission documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 text-center">
                Working on implementation...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Collaboration Panel - conditionally shown */}
      {isCollaborationOpen && (
        <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto h-full">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Team Collaboration
            </h3>
          </div>
          
          <div className="p-4">
            <h4 className="text-sm font-medium mb-2">Active Team Members</h4>
            <div className="space-y-3">
              <div className="flex items-center p-2 rounded bg-white border border-green-100">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white mr-3">
                  <span className="text-xs font-medium">JS</span>
                </div>
                <div>
                  <div className="text-sm font-medium">Jane Smith</div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                    Editing Module 2.5
                  </div>
                </div>
              </div>
              
              <div className="flex items-center p-2 rounded bg-white border border-blue-100">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
                  <span className="text-xs font-medium">JD</span>
                </div>
                <div>
                  <div className="text-sm font-medium">John Doe</div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
                    Reviewing Module 3.2
                  </div>
                </div>
              </div>
              
              <div className="flex items-center p-2 rounded bg-white border border-gray-200">
                <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white mr-3">
                  <span className="text-xs font-medium">RJ</span>
                </div>
                <div>
                  <div className="text-sm font-medium">Robert Johnson</div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-gray-300 mr-1"></span>
                    Idle (5m ago)
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
            <div className="space-y-2">
              <div className="text-xs p-2 rounded bg-white">
                <div className="font-medium">Jane Smith</div>
                <div className="text-gray-500">Updated clinical trial data in Module 2.5</div>
                <div className="text-gray-400 text-[10px] mt-1">5 minutes ago</div>
              </div>
              
              <div className="text-xs p-2 rounded bg-white">
                <div className="font-medium">John Doe</div>
                <div className="text-gray-500">Added chemical structure diagram to Module 3.2</div>
                <div className="text-gray-400 text-[10px] mt-1">25 minutes ago</div>
              </div>
              
              <div className="text-xs p-2 rounded bg-white">
                <div className="font-medium">System</div>
                <div className="text-gray-500">Scheduled validation check completed successfully</div>
                <div className="text-gray-400 text-[10px] mt-1">1 hour ago</div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <h4 className="text-sm font-medium mb-2">Team Chat</h4>
            <div className="bg-white rounded border border-gray-200 h-40 mb-2 p-2 text-xs text-gray-400 flex items-center justify-center">
              Chat functionality will be implemented soon
            </div>
            <div className="flex">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="flex-grow text-sm border border-gray-300 rounded-l px-2 py-1"
                disabled
              />
              <Button className="rounded-l-none h-8" disabled>
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Document Validation Dialog - Enterprise Edition */}
      <Dialog>
        <DialogTrigger asChild>
          <span className="hidden">Open Validation Details</span>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Document Validation Results
            </DialogTitle>
            <DialogDescription>
              The following issues were detected in your document structure and content.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-2">
            <div className="border rounded p-3 bg-amber-50 border-amber-200">
              <div className="flex items-start mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800">Metadata Warning</h4>
                  <p className="text-sm text-amber-700">Missing required field "Study Duration" in section 1.2</p>
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-amber-600">Impact: Medium - May delay review process</span>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <Edit className="h-3 w-3 mr-1" />
                  Fix Issue
                </Button>
              </div>
            </div>
            
            <div className="border rounded p-3 bg-red-50 border-red-200">
              <div className="flex items-start mb-2">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800">Compliance Error</h4>
                  <p className="text-sm text-red-700">Section 2.5 is missing required references to clinical data</p>
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-red-600">Impact: High - Will prevent submission approval</span>
                <Button variant="outline" size="sm" className="h-7 text-xs border-red-300">
                  <Link className="h-3 w-3 mr-1" />
                  Add Reference
                </Button>
              </div>
            </div>
            
            <div className="border rounded p-3 bg-green-50 border-green-200">
              <div className="flex items-start mb-2">
                <CheckSquare className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-800">Structure Validation Passed</h4>
                  <p className="text-sm text-green-700">eCTD folder structure conforms to FDA requirements</p>
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-green-600">All 24 structure checks passed</span>
                <Button variant="outline" size="sm" className="h-7 text-xs border-green-300">
                  <FileCheck className="h-3 w-3 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Last validated: May 11, 2025 at 09:45 AM
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-1" />
                Export Report
              </Button>
              <Button>
                <PlayCircle className="h-4 w-4 mr-1" />
                Run Again
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}