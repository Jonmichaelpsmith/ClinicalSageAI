/**
 * Regulatory Submissions Hub
 * 
 * This is the unified hub for all regulatory submission activities, integrating the IND Wizard and eCTD modules
 * into a single, cohesive workflow for managing regulatory submissions.
 * 
 * Key features:
 * - Unified dashboard for IND and eCTD projects
 * - Seamless workflow from IND preparation to eCTD assembly
 * - Shared document repository
 * - Integrated validation tools
 * - Progress tracking across the entire submission lifecycle
 */

import React, { useState, useEffect } from 'react';
import { 
  FileInput, 
  FileCheck, 
  ChevronRight,
  Plus,
  Clock,
  Search,
  FileText,
  ClipboardCheck,
  PackageOpen,
  Bookmark,
  FileStack,
  FileCog,
  Layers,
  CheckCircle2,
  Upload,
  Laptop,
  BookOpen
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'wouter';

// Import custom components for tracking stability
import { useNetworkResilience } from '@/hooks/useNetworkResilience';
import { useHealthMonitor } from '@/hooks/useHealthMonitor';

const RegulatorySubmissionHub = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Use network resilience and health monitor hooks
  const { isOnline } = useNetworkResilience();
  const healthMonitor = useHealthMonitor();
  
  // Report status to health monitor
  useEffect(() => {
    if (healthMonitor.isConnected) {
      healthMonitor.sendHeartbeat({
        page: 'regulatory-submissions-hub',
        status: 'active'
      });
    }
  }, [healthMonitor]);
  
  // Sample submission projects (in a real app, would come from API)
  const projects = [
    {
      id: 'prj-001',
      name: 'XYZ-123 Initial IND',
      type: 'ind',
      stage: 'preparation',
      progress: 68,
      createdAt: '2025-03-15T10:00:00Z',
      updatedAt: '2025-04-28T14:30:00Z',
      status: 'in-progress',
      owner: 'John Smith',
      dueDate: '2025-06-15',
      highlightedSections: [
        { name: 'CMC Section', status: 'in-progress', progress: 45 },
        { name: 'Nonclinical Data', status: 'completed', progress: 100 },
        { name: 'Protocol', status: 'in-progress', progress: 75 }
      ]
    },
    {
      id: 'prj-002',
      name: 'ABC-456 eCTD Submission',
      type: 'ectd',
      stage: 'assembly',
      progress: 82,
      createdAt: '2025-02-10T09:15:00Z',
      updatedAt: '2025-04-27T11:45:00Z',
      status: 'in-progress',
      owner: 'Jane Doe',
      dueDate: '2025-05-30',
      highlightedSections: [
        { name: 'Module 1', status: 'completed', progress: 100 },
        { name: 'Module 2', status: 'completed', progress: 100 },
        { name: 'Module 3', status: 'in-progress', progress: 90 }
      ]
    },
    {
      id: 'prj-003',
      name: 'MNO-789 IND Amendment',
      type: 'ind-amendment',
      stage: 'review',
      progress: 95,
      createdAt: '2025-01-05T14:30:00Z',
      updatedAt: '2025-04-20T16:20:00Z',
      status: 'in-progress',
      owner: 'David Johnson',
      dueDate: '2025-05-10',
      highlightedSections: [
        { name: 'Updated Protocol', status: 'completed', progress: 100 },
        { name: 'Safety Update', status: 'completed', progress: 100 },
        { name: 'Form FDA 1571', status: 'completed', progress: 100 }
      ]
    },
    {
      id: 'prj-004',
      name: 'DEF-321 Phase 2 IND',
      type: 'ind',
      stage: 'draft',
      progress: 25,
      createdAt: '2025-04-01T08:45:00Z',
      updatedAt: '2025-04-25T10:15:00Z',
      status: 'in-progress',
      owner: 'Sarah Williams',
      dueDate: '2025-07-20',
      highlightedSections: [
        { name: 'Background and Introduction', status: 'completed', progress: 100 },
        { name: 'CMC Section', status: 'not-started', progress: 0 },
        { name: 'Protocol Synopsis', status: 'in-progress', progress: 60 }
      ]
    }
  ];
  
  // Filter projects based on search query
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render project card
  const renderProjectCard = (project) => {
    const statusColors = {
      'completed': 'bg-green-100 text-green-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'not-started': 'bg-gray-100 text-gray-800',
      'on-hold': 'bg-yellow-100 text-yellow-800'
    };
    
    const typeLabels = {
      'ind': 'IND Application',
      'ectd': 'eCTD Submission',
      'ind-amendment': 'IND Amendment'
    };
    
    const dueDate = new Date(project.dueDate);
    const today = new Date();
    const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    return (
      <Card key={project.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>
                {typeLabels[project.type]} · {project.owner}
              </CardDescription>
            </div>
            <Badge 
              variant="outline" 
              className={statusColors[project.status]}
            >
              {project.status.replace('-', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
            
            <div className="space-y-2">
              {project.highlightedSections.map((section, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span>{section.name}</span>
                  <Badge 
                    variant="outline" 
                    className={statusColors[section.status]}
                  >
                    {section.status.replace('-', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Due Date: {new Date(project.dueDate).toLocaleDateString()}</span>
              <span className={daysRemaining < 10 ? 'text-red-600 font-semibold' : ''}>
                {daysRemaining} days left
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <div className="flex justify-between w-full">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/regulatory-submissions/dashboard/${project.id}`)}
            >
              View Details
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Navigate to the appropriate editor based on project type
                if (project.type === 'ind' || project.type === 'ind-amendment') {
                  navigate(`/ind-wizard/${project.id}`);
                } else if (project.type === 'ectd') {
                  navigate(`/ectd-editor/${project.id}`);
                }
              }}
            >
              Continue Editing <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Regulatory Submissions Hub</h1>
          <p className="text-gray-500 mt-1">
            Unified platform for managing IND and eCTD submissions
          </p>
        </div>
        
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Create New Submission</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/ind-wizard/new')}>
                <FileText className="h-4 w-4 mr-2" />
                New IND Application
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/ind-wizard/new?type=amendment')}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                New IND Amendment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/ectd-editor/new')}>
                <Layers className="h-4 w-4 mr-2" />
                New eCTD Submission
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="default" onClick={() => navigate('/regulatory-submissions/settings')}>
            Settings
          </Button>
        </div>
      </div>
      
      <Tabs 
        defaultValue="dashboard" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileCheck className="h-5 w-5 mr-2 text-green-600" />
                  Active Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{projects.length}</div>
                <p className="text-gray-500 text-sm mt-1">Across all submission types</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-amber-500" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">3</div>
                <p className="text-gray-500 text-sm mt-1">Due in the next 30 days</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileStack className="h-5 w-5 mr-2 text-blue-600" />
                  Document Library
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">124</div>
                <p className="text-gray-500 text-sm mt-1">Available documents</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Submissions</h2>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search submissions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {filteredProjects.map(renderProjectCard)}
          </div>
          
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => setActiveTab('submissions')}>
              View All Submissions
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="submissions">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Submissions</h2>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search submissions..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="ind">IND Applications</TabsTrigger>
                <TabsTrigger value="ectd">eCTD Submissions</TabsTrigger>
                <TabsTrigger value="amendments">Amendments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map(renderProjectCard)}
                </div>
              </TabsContent>
              
              <TabsContent value="ind" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects
                    .filter(p => p.type === 'ind')
                    .map(renderProjectCard)}
                </div>
              </TabsContent>
              
              <TabsContent value="ectd" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects
                    .filter(p => p.type === 'ectd')
                    .map(renderProjectCard)}
                </div>
              </TabsContent>
              
              <TabsContent value="amendments" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects
                    .filter(p => p.type === 'ind-amendment')
                    .map(renderProjectCard)}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
        
        <TabsContent value="documents">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Document Repository</h2>
              <div className="flex space-x-2">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search documents..." className="pl-8" />
                </div>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="all-docs">
              <TabsList>
                <TabsTrigger value="all-docs">All Documents</TabsTrigger>
                <TabsTrigger value="ind-docs">IND Documents</TabsTrigger>
                <TabsTrigger value="ectd-docs">eCTD Documents</TabsTrigger>
                <TabsTrigger value="forms">Forms</TabsTrigger>
                <TabsTrigger value="protocols">Protocols</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all-docs" className="mt-4">
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-4">
                    <p className="text-center text-gray-500">
                      Document repository integration will display all submission-related documents here
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
        
        <TabsContent value="templates">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Document Templates</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    IND Cover Letter
                  </CardTitle>
                  <CardDescription>
                    Standard FDA cover letter template
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">IND</Badge>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-green-600" />
                    Form FDA 1571
                  </CardTitle>
                  <CardDescription>
                    IND application form template
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">IND</Badge>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-purple-600" />
                    eCTD Module 2 Summary
                  </CardTitle>
                  <CardDescription>
                    Template for eCTD Module 2 overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="bg-purple-100 text-purple-800">eCTD</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Submission Analytics</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                  <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Submission Timeline</CardTitle>
                <CardDescription>
                  Average completion time by submission type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center p-6">
                    <Laptop className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium mb-1">Analytics Dashboard</h3>
                    <p className="text-gray-500 mb-4">
                      Integration with Mashable BI coming soon
                    </p>
                    <Button variant="outline" size="sm">
                      Configure Analytics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {!isOnline && (
        <div className="fixed bottom-4 right-4 bg-amber-100 border border-amber-200 text-amber-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="mr-3 text-amber-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">You're currently offline</h3>
              <p className="text-sm">Your changes will be synchronized when you reconnect</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulatorySubmissionHub;