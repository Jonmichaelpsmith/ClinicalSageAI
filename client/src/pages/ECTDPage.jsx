import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  FileCheck, 
  FolderTree,
  BookOpen,
  FileText,
  Package,
  LayoutGrid
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
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useTenantContext } from '@/contexts/TenantContext';

// Import existing INDtoECTDConverter for functionality
import INDtoECTDConverter from './INDtoECTDConverter';

/**
 * eCTD Module Page
 * 
 * This page provides a central hub for Electronic Common Technical Document (eCTD)
 * functionality, including:
 * - eCTD structure creation and validation
 * - IND to eCTD conversion
 * - Submission preparation and validation
 * - Regulatory authority submission gateway integration
 */
const ECTDPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [submissions, setSubmissions] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const { organizationId, clientWorkspaceId } = useTenantContext();
  
  useEffect(() => {
    // In a real app, these would be API calls to fetch data
    // based on the tenant context
    
    // Simulated submissions data
    const mockSubmissions = [
      {
        id: 'sub-001',
        name: 'XYZ-123 Initial NDA',
        type: 'nda',
        region: 'us',
        status: 'in-preparation',
        progress: 45,
        dueDate: '2025-06-30',
        lastModified: '2025-05-01'
      },
      {
        id: 'sub-002',
        name: 'XYZ-123 European MAA',
        type: 'maa',
        region: 'eu',
        status: 'in-preparation',
        progress: 32,
        dueDate: '2025-07-15',
        lastModified: '2025-04-28'
      },
      {
        id: 'sub-003',
        name: 'ABC-456 Type II Variation',
        type: 'variation',
        region: 'eu',
        status: 'submitted',
        progress: 100,
        dueDate: '2025-04-15',
        lastModified: '2025-04-10'
      }
    ];
    
    // Simulated recent documents
    const mockDocuments = [
      {
        id: 'doc-001',
        name: 'eCTD Submission Specification - XYZ-123.pdf',
        module: 'm1',
        section: '1.2',
        date: '2025-05-01'
      },
      {
        id: 'doc-002',
        name: 'Quality Overall Summary.pdf',
        module: 'm2',
        section: '2.3',
        date: '2025-04-28'
      },
      {
        id: 'doc-003',
        name: 'Module 3 - Control Strategy Overview.pdf',
        module: 'm3',
        section: '3.2.P',
        date: '2025-04-26'
      }
    ];
    
    setSubmissions(mockSubmissions);
    setRecentDocuments(mockDocuments);
  }, [organizationId, clientWorkspaceId]);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'in-preparation':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'approved':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">eCTD Module</h1>
          <p className="text-gray-500 mt-1">
            Prepare, validate, and manage Electronic Common Technical Document submissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileCheck className="h-4 w-4 mr-2" />
            Validate eCTD
          </Button>
          <Button size="sm">
            <FolderTree className="h-4 w-4 mr-2" />
            New Submission
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="converter">IND to eCTD</TabsTrigger>
          <TabsTrigger value="structure">eCTD Structure</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Submissions</CardTitle>
                <CardDescription>Current eCTD submissions in progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{submissions.filter(s => s.status === 'in-preparation').length}</div>
                <p className="text-sm text-gray-500">In preparation</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="w-full">View all submissions</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Recent document updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{recentDocuments.length}</div>
                <p className="text-sm text-gray-500">Documents updated this week</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="w-full">View all documents</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">eCTD Utilities</CardTitle>
                <CardDescription>Convert, validate, and manage submissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileCheck className="h-4 w-4 mr-2" />
                  Validate eCTD Structure
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  ICH Guidelines Reference
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Submissions</CardTitle>
              <CardDescription>Track progress of current eCTD submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Submission</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="text-right">Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.name}</TableCell>
                        <TableCell className="uppercase">{submission.type}</TableCell>
                        <TableCell className="uppercase">{submission.region}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(submission.status)}>
                            {submission.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={submission.progress} className="h-2 w-20" />
                            <span className="text-xs">{submission.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{submission.dueDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-4 text-gray-500">No active submissions</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submission Management</CardTitle>
              <CardDescription>
                Create, track, and manage your eCTD submissions across different regions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Button variant="outline" className="h-24 flex-col">
                  <Package className="h-8 w-8 mb-2" />
                  <span>Create New Submission</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <FileText className="h-8 w-8 mb-2" />
                  <span>Import Existing Submission</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <LayoutGrid className="h-8 w-8 mb-2" />
                  <span>Submission Templates</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <FolderTree className="h-8 w-8 mb-2" />
                  <span>Regional Requirements</span>
                </Button>
              </div>
              
              <Table>
                <TableCaption>A list of your recent submissions</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.name}</TableCell>
                      <TableCell className="uppercase">{submission.type}</TableCell>
                      <TableCell className="uppercase">{submission.region}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{submission.lastModified}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="converter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IND to eCTD Converter</CardTitle>
              <CardDescription>
                Convert your IND application to eCTD format for regulatory submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <INDtoECTDConverter />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="structure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>eCTD Structure Editor</CardTitle>
              <CardDescription>
                Manage the structure of your eCTD submissions according to ICH standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {['Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5'].map((module, idx) => (
                    <Button key={idx} variant="outline" className="h-16">
                      {module}
                    </Button>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-medium mb-2">Module Structure Overview</h3>
                  <p className="text-gray-500 mb-4">
                    The eCTD is organized into five modules:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Badge className="mr-2 mt-0.5" variant="outline">M1</Badge>
                      <span>Regional Administrative Information - region-specific documents</span>
                    </li>
                    <li className="flex items-start">
                      <Badge className="mr-2 mt-0.5" variant="outline">M2</Badge>
                      <span>Common Technical Document Summaries - overview and summaries</span>
                    </li>
                    <li className="flex items-start">
                      <Badge className="mr-2 mt-0.5" variant="outline">M3</Badge>
                      <span>Quality - chemical, pharmaceutical, and biological documentation</span>
                    </li>
                    <li className="flex items-start">
                      <Badge className="mr-2 mt-0.5" variant="outline">M4</Badge>
                      <span>Nonclinical Study Reports - pharmacology, pharmacokinetics, toxicology</span>
                    </li>
                    <li className="flex items-start">
                      <Badge className="mr-2 mt-0.5" variant="outline">M5</Badge>
                      <span>Clinical Study Reports - clinical trials and data</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ECTDPage;