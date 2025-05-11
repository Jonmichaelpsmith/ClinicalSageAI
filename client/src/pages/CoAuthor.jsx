import React, { useState, useEffect } from 'react';
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
  Users,
  Minus
} from 'lucide-react';

export default function CoAuthor() {
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  const [isCollaborationOpen, setIsCollaborationOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isCompareVersionsOpen, setIsCompareVersionsOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [compareVersions, setCompareVersions] = useState({ source: null, target: null });
  
  // Sample versions data - in production, this would come from the database
  const [documentVersions] = useState([
    { id: 'v4.2', name: 'Version 4.2', date: 'May 10, 2025', author: 'Jane Smith', changes: 'Updated clinical data references in Module 2.5' },
    { id: 'v4.1', name: 'Version 4.1', date: 'May 8, 2025', author: 'John Doe', changes: 'Added safety summary to Module 2.7' },
    { id: 'v4.0', name: 'Version 4.0', date: 'May 5, 2025', author: 'Robert Johnson', changes: 'Major revision of Module 2 content structure' },
    { id: 'v3.2', name: 'Version 3.2', date: 'April 28, 2025', author: 'Jane Smith', changes: 'Fixed formatting issues in Module 3' },
    { id: 'v3.1', name: 'Version 3.1', date: 'April 25, 2025', author: 'Sarah Williams', changes: 'Updated regulatory citations in Module 1.3' }
  ]);

  return (
    <div className="flex h-full">
      {/* Document Tree Navigator - conditionally shown */}
      {isTreeOpen && (
        <div className="w-72 border-r border-gray-200 bg-gray-50 overflow-y-auto h-full">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 flex items-center">
              <LayoutTemplate className="h-4 w-4 mr-2" />
              Document Navigator
            </h3>
          </div>
          <div className="p-2">
            <div className="text-sm font-medium mb-2 text-gray-500">Module Navigation</div>
            
            {/* Module 1 */}
            <div className="mb-2">
              <div className="flex items-center py-1 px-2 rounded hover:bg-gray-100 cursor-pointer">
                <ChevronRight className="h-4 w-4 mr-1 text-gray-400" />
                <span className="text-sm">Module 1: Administrative</span>
              </div>
            </div>
            
            {/* Module 2 - expanded */}
            <div className="mb-2">
              <div className="flex items-center py-1 px-2 rounded bg-blue-50 hover:bg-blue-100 cursor-pointer">
                <ChevronDown className="h-4 w-4 mr-1 text-blue-500" />
                <span className="text-sm font-medium">Module 2: CTD Summaries</span>
              </div>
              <div className="ml-6 mt-1 space-y-1">
                <div className="flex items-center py-1 px-2 rounded hover:bg-gray-100 cursor-pointer">
                  <FileText className="h-3 w-3 mr-2 text-gray-400" />
                  <span className="text-xs">2.1 TOC</span>
                </div>
                <div className="flex items-center py-1 px-2 rounded hover:bg-gray-100 cursor-pointer">
                  <FileText className="h-3 w-3 mr-2 text-gray-400" />
                  <span className="text-xs">2.2 Introduction</span>
                </div>
                <div className="flex items-center py-1 px-2 rounded hover:bg-gray-100 cursor-pointer">
                  <FileText className="h-3 w-3 mr-2 text-gray-400" />
                  <span className="text-xs">2.3 Quality Summary</span>
                </div>
                <div className="flex items-center py-1 px-2 rounded hover:bg-gray-100 cursor-pointer">
                  <FileText className="h-3 w-3 mr-2 text-gray-400" />
                  <span className="text-xs">2.4 Non-Clinical Summary</span>
                </div>
                <div className="flex items-center py-1 px-2 rounded bg-blue-100 cursor-pointer">
                  <FileText className="h-3 w-3 mr-2 text-blue-500" />
                  <span className="text-xs font-medium">2.5 Clinical Overview</span>
                  <Badge className="ml-1 h-4 bg-green-100 text-green-800 text-[10px]">Active</Badge>
                </div>
                <div className="flex items-center py-1 px-2 rounded hover:bg-gray-100 cursor-pointer">
                  <FileText className="h-3 w-3 mr-2 text-gray-400" />
                  <span className="text-xs">2.6 Non-Clinical Summary</span>
                </div>
                <div className="flex items-center py-1 px-2 rounded hover:bg-gray-100 cursor-pointer">
                  <FileText className="h-3 w-3 mr-2 text-gray-400" />
                  <span className="text-xs">2.7 Clinical Summary</span>
                </div>
              </div>
            </div>
            
            {/* Module 3 */}
            <div className="mb-2">
              <div className="flex items-center py-1 px-2 rounded hover:bg-gray-100 cursor-pointer">
                <ChevronRight className="h-4 w-4 mr-1 text-gray-400" />
                <span className="text-sm">Module 3: Quality</span>
              </div>
            </div>
            
            {/* Module 4 */}
            <div className="mb-2">
              <div className="flex items-center py-1 px-2 rounded hover:bg-gray-100 cursor-pointer">
                <ChevronRight className="h-4 w-4 mr-1 text-gray-400" />
                <span className="text-sm">Module 4: Non-Clinical</span>
              </div>
            </div>
            
            {/* Module 5 */}
            <div className="mb-2">
              <div className="flex items-center py-1 px-2 rounded hover:bg-gray-100 cursor-pointer">
                <ChevronRight className="h-4 w-4 mr-1 text-gray-400" />
                <span className="text-sm">Module 5: Clinical</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <div className="text-sm font-medium mb-1 text-gray-500">Document Status</div>
              <div className="flex items-center justify-between text-xs px-3 py-1 bg-white rounded border">
                <span>Validation Status</span>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Passed</Badge>
              </div>
              <div className="flex items-center justify-between text-xs px-3 py-1 bg-white rounded border">
                <span>Review Status</span>
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">In Review</Badge>
              </div>
              <div className="flex items-center justify-between text-xs px-3 py-1 bg-white rounded border">
                <span>Approval Status</span>
                <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Pending</Badge>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
              <div className="mb-4 flex items-center justify-between border-b pb-4">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                  <div>
                    <div className="font-medium">Module 2.5 - Clinical Overview</div>
                    <div className="text-sm text-gray-500">Last edited: May 10, 2025 by Jane Smith</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsVersionHistoryOpen(true)}
                  >
                    <History className="h-4 w-4 mr-1" />
                    Version History
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setCompareVersions({
                        source: documentVersions[1], // Second version
                        target: documentVersions[0]  // First version
                      });
                      setIsCompareVersionsOpen(true);
                    }}
                  >
                    <GitMerge className="h-4 w-4 mr-1" />
                    Compare Versions
                  </Button>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-4">
                <div className="flex items-start">
                  <ShieldCheck className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-700">Document Version Control System</div>
                    <p className="text-sm text-blue-600">
                      Every change to your document is automatically tracked and versioned for regulatory compliance.
                      Use the version history to track changes, compare versions, or rollback to previous states.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border rounded mb-4">
                <div className="bg-gray-50 px-3 py-2 border-b flex justify-between items-center">
                  <div className="font-medium">Current Version Features</div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">v4.2</Badge>
                </div>
                <div className="p-3 text-sm">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Enhanced regulatory compliance validation</li>
                    <li>Side-by-side version comparison with diff highlighting</li>
                    <li>Automatic version control for all document edits</li>
                    <li>Integrated approval workflow tracking</li>
                    <li>Enhanced document audit trail capabilities</li>
                  </ul>
                </div>
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
      
      {/* Version History Dialog */}
      <Dialog open={isVersionHistoryOpen} onOpenChange={setIsVersionHistoryOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <History className="h-5 w-5 text-blue-500 mr-2" />
              Document Version History
            </DialogTitle>
            <DialogDescription>
              Review previous versions of this document and their changes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-1 my-2">
            <div className="bg-blue-50 p-2 rounded border border-blue-100 text-sm mb-3">
              <div className="flex items-center text-blue-800">
                <Info className="h-4 w-4 mr-2" />
                <span className="font-medium">Current working document: Module 2.5 - Clinical Overview</span>
              </div>
            </div>
            
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Changes</th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documentVersions.map((version, index) => (
                    <tr key={version.id} className={index === 0 ? "bg-blue-50" : ""}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {version.name} {index === 0 && <Badge className="ml-1 bg-blue-100 text-blue-800 hover:bg-blue-100">Current</Badge>}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{version.date}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{version.author}</td>
                      <td className="px-3 py-2 text-sm text-gray-500 max-w-xs truncate">{version.changes}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => {
                              setSelectedVersion(version);
                              setIsVersionHistoryOpen(false);
                              // In a real app, we would load the version content here
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => {
                              setCompareVersions(prev => ({ 
                                ...prev, 
                                target: version 
                              }));
                              // Open compare dialog if we have both versions selected
                              if (compareVersions.source) {
                                setIsVersionHistoryOpen(false);
                                setIsCompareVersionsOpen(true);
                              }
                            }}
                          >
                            <GitMerge className="h-3 w-3 mr-1" />
                            Compare
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              TrialSage Enterprise Version Control System (VCS) tracks all changes automatically
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsVersionHistoryOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                // In a real app, this would create a new version 
                setIsVersionHistoryOpen(false);
              }}>
                <FilePlus2 className="h-4 w-4 mr-1" />
                Create New Version
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version Comparison Dialog */}
      <Dialog open={isCompareVersionsOpen} onOpenChange={setIsCompareVersionsOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <GitMerge className="h-5 w-5 text-indigo-500 mr-2" />
              Compare Document Versions
            </DialogTitle>
            <DialogDescription>
              {compareVersions.source && compareVersions.target ? 
                `Comparing ${compareVersions.source.name} with ${compareVersions.target.name}` : 
                'Select versions to compare'}
            </DialogDescription>
          </DialogHeader>
          
          {compareVersions.source && compareVersions.target ? (
            <div className="space-y-4 my-2">
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded border">
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="text-gray-500">Source:</span> 
                    <Badge className="ml-2 bg-indigo-100 text-indigo-800">{compareVersions.source.name}</Badge>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Target:</span> 
                    <Badge className="ml-2 bg-green-100 text-green-800">{compareVersions.target.name}</Badge>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCompareVersions({ source: compareVersions.target, target: compareVersions.source })}
                >
                  <GitMerge className="h-4 w-4 mr-1" />
                  Swap Versions
                </Button>
              </div>
              
              <div className="border rounded">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 text-sm font-medium">
                  Difference Summary
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3 flex-shrink-0">
                      <Plus className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Additions</div>
                      <div className="text-sm text-gray-500">2 new references added to clinical data section</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3 flex-shrink-0">
                      <Edit className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Modifications</div>
                      <div className="text-sm text-gray-500">Updated study outcome summary in section 2.5.3</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-3 flex-shrink-0">
                      <Minus className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Deletions</div>
                      <div className="text-sm text-gray-500">Removed redundant study description paragraph</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-sm font-medium">Side-by-Side Comparison</span>
                  <Button variant="outline" size="sm" className="h-7">
                    <Download className="h-3 w-3 mr-1" />
                    Export Diff
                  </Button>
                </div>
                <div className="flex border-t">
                  <div className="w-1/2 p-3 border-r">
                    <div className="text-xs text-gray-500 mb-2">Source: {compareVersions.source.name}</div>
                    <div className="bg-indigo-50 p-2 text-sm rounded border border-indigo-100">
                      The clinical study XYZ-123 demonstrated efficacy in the primary endpoint with a p-value of 0.023.
                      <span className="bg-red-100 line-through px-1">Secondary endpoints were not met in this trial.</span>
                    </div>
                  </div>
                  <div className="w-1/2 p-3">
                    <div className="text-xs text-gray-500 mb-2">Target: {compareVersions.target.name}</div>
                    <div className="bg-green-50 p-2 text-sm rounded border border-green-100">
                      The clinical study XYZ-123 demonstrated efficacy in the primary endpoint with a p-value of 0.023.
                      <span className="bg-green-100 px-1">Additional analysis showed promising trends in key secondary endpoints.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <GitBranch className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Select two versions to compare from the version history</p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCompareVersionsOpen(false);
                setCompareVersions({ source: null, target: null });
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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