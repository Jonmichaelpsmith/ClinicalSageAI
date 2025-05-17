import React, { useState, lazy, Suspense } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  FilePlus,
  FileCheck,
  Users,
  FileSearch,
  Calendar,
  ChevronRight,
  BarChart3,
  RefreshCcw,
  Download,
  PlusCircle,
  FileEdit,
  ExternalLink,
  Cloud,
  Lock,
  Save,
  History,
  Loader2,
  ShieldCheck
} from 'lucide-react';

/**
 * eCTD Co-Author Dashboard
 * 
 * A comprehensive dashboard for managing eCTD submissions with validation status,
 * document templates, and collaborative features.
 */
// Add Microsoft Word integration component for document editing
const MsWordIntegrationPanel = lazy(() => import('./ECTDMsWordIntegration'));

const ECTDCoAuthorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showWordIntegration, setShowWordIntegration] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [msWordAvailable, setMsWordAvailable] = useState(true); // Set to true for demo
  const { toast } = useToast();
  
  // Mock data for demonstration
  const recentSubmissions = [
    {
      id: 'sub-001',
      title: 'NDA 123456 - Initial Submission',
      type: 'NDA',
      status: 'In Progress',
      progress: 68,
      lastUpdated: '2025-05-16',
      dueDate: '2025-06-15',
      assignedTo: 'Sarah Johnson',
      validationStatus: 'warning',
      validationIssues: 3
    },
    {
      id: 'sub-002',
      title: 'IND 987654 - Protocol Amendment',
      type: 'IND',
      status: 'Review',
      progress: 92,
      lastUpdated: '2025-05-15',
      dueDate: '2025-05-20',
      assignedTo: 'Michael Chen',
      validationStatus: 'success',
      validationIssues: 0
    },
    {
      id: 'sub-003',
      title: 'ANDA 456789 - Supplement',
      type: 'ANDA',
      status: 'Submitted',
      progress: 100,
      lastUpdated: '2025-05-10',
      dueDate: '2025-05-10',
      assignedTo: 'Jennifer Lopez',
      validationStatus: 'success',
      validationIssues: 0
    }
  ];
  
  const validationStats = {
    totalSubmissions: 12,
    passedValidation: 9,
    warningValidation: 2,
    failedValidation: 1,
    totalDocuments: 324,
    documentsWithIssues: 8
  };
  
  const recentTemplates = [
    {
      id: 'template-001',
      title: 'Clinical Study Report Template',
      module: 'Module 5',
      section: '5.3.5.1',
      lastUpdated: '2025-05-14',
      status: 'active'
    },
    {
      id: 'template-002',
      title: 'Quality Overall Summary',
      module: 'Module 2',
      section: '2.3',
      lastUpdated: '2025-05-12',
      status: 'active'
    },
    {
      id: 'template-003',
      title: 'Nonclinical Written Summary',
      module: 'Module 2',
      section: '2.6.2',
      lastUpdated: '2025-05-08',
      status: 'draft'
    }
  ];
  
  const recentActivity = [
    {
      id: 'activity-001',
      user: 'Sarah Johnson',
      action: 'Updated Module 3.2.P section',
      submission: 'NDA 123456',
      timestamp: '2025-05-17 09:23 AM'
    },
    {
      id: 'activity-002',
      user: 'Michael Chen',
      action: 'Completed validation review',
      submission: 'IND 987654',
      timestamp: '2025-05-16 04:51 PM'
    },
    {
      id: 'activity-003',
      user: 'Jennifer Lopez',
      action: 'Added new Clinical Study Report',
      submission: 'ANDA 456789',
      timestamp: '2025-05-16 11:17 AM'
    },
    {
      id: 'activity-004',
      user: 'Sarah Johnson',
      action: 'Created new template for Module 4',
      submission: '-',
      timestamp: '2025-05-15 03:42 PM'
    },
    {
      id: 'activity-005',
      user: 'System',
      action: 'Automated validation completed',
      submission: 'IND 987654',
      timestamp: '2025-05-15 01:30 PM'
    }
  ];
  
  const upcomingDeadlines = [
    {
      id: 'deadline-001',
      title: 'IND 987654 Final Review',
      date: '2025-05-20',
      type: 'review',
      daysRemaining: 3
    },
    {
      id: 'deadline-002',
      title: 'NDA 123456 Module 2 Completion',
      date: '2025-05-25',
      type: 'milestone',
      daysRemaining: 8
    },
    {
      id: 'deadline-003',
      title: 'ANDA 456789 Response to FDA',
      date: '2025-06-05',
      type: 'submission',
      daysRemaining: 19
    }
  ];
  
  // Handle refresh data
  const handleRefreshData = () => {
    toast({
      title: 'Dashboard Refreshed',
      description: 'All data has been updated to the latest version.',
    });
  };
  
  // Handle export data
  const handleExportData = () => {
    toast({
      title: 'Export Started',
      description: 'Dashboard data export has been initiated.',
    });
  };
  
  // Handle view submission
  const handleViewSubmission = (submissionId) => {
    // In a real implementation, this would navigate to the submission detail page
    toast({
      title: 'Viewing Submission',
      description: `Navigating to submission ${submissionId}`,
    });
  };
  
  // Render a validation status badge
  const renderValidationStatus = (status) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-600"><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Passed</Badge>;
      case 'warning':
        return <Badge variant="warning"><AlertCircle className="h-3.5 w-3.5 mr-1" />Warning</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3.5 w-3.5 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3.5 w-3.5 mr-1" />Pending</Badge>;
    }
  };
  
  // Handle opening document in Microsoft Word
  const handleOpenInWord = (submissionId) => {
    setSelectedSubmissionId(submissionId);
    setShowWordIntegration(true);
  };
  
  // Handle close Word integration panel
  const handleCloseWordIntegration = () => {
    setShowWordIntegration(false);
    
    toast({
      title: "Document Saved",
      description: "All changes have been synchronized with VAULT.",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">eCTD Co-Author Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage submissions, templates and validation status
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Microsoft Word Integration Dialog */}
      <Dialog open={showWordIntegration} onOpenChange={setShowWordIntegration}>
        <DialogContent className="max-w-5xl h-[85vh]">
          <DialogHeader>
            <DialogTitle>Microsoft Word Integration</DialogTitle>
            <DialogDescription>
              Edit your eCTD document using Microsoft Word with automatic VAULT synchronization
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <Suspense fallback={
              <div className="flex items-center justify-center h-[65vh]">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                  <p>Loading Microsoft Word integration...</p>
                </div>
              </div>
            }>
              <MsWordIntegrationPanel
                documentId={selectedSubmissionId}
                onClose={handleCloseWordIntegration}
              />
            </Suspense>
          </div>
        </DialogContent>
      </Dialog>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="mb-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{validationStats.totalSubmissions}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {validationStats.passedValidation} passed validation
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Validation Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold">{Math.round((validationStats.passedValidation / validationStats.totalSubmissions) * 100)}%</div>
                  <div className="text-sm text-muted-foreground">Pass Rate</div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-medium text-green-600">{validationStats.passedValidation} passed</span>
                  <span className="text-xs font-medium text-amber-600">{validationStats.warningValidation} warnings</span>
                  <span className="text-xs font-medium text-red-600">{validationStats.failedValidation} failed</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Document Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{validationStats.documentsWithIssues}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={100 - ((validationStats.documentsWithIssues / validationStats.totalDocuments) * 100)} className="h-2" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {Math.round(100 - ((validationStats.documentsWithIssues / validationStats.totalDocuments) * 100))}% Clear
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{upcomingDeadlines.length}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Next: {upcomingDeadlines[0].title.substring(0, 15)}...
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Submissions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>
                Overview of your active and recent eCTD submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submission</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Validation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.title}</TableCell>
                      <TableCell>{submission.type}</TableCell>
                      <TableCell>
                        <Badge variant={
                          submission.status === 'Submitted' ? 'default' :
                          submission.status === 'Review' ? 'secondary' :
                          'outline'
                        }>
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={submission.progress} className="h-2 w-16" />
                          <span className="text-xs">{submission.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{submission.dueDate}</TableCell>
                      <TableCell>
                        {renderValidationStatus(submission.validationStatus)}
                        {submission.validationIssues > 0 && (
                          <span className="text-xs text-red-600 ml-2">
                            {submission.validationIssues} issues
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenInWord(submission.id)}
                          >
                            <FileEdit className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewSubmission(submission.id)}
                          >
                            View
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Submissions
              </Button>
            </CardFooter>
          </Card>
          
          {/* Activity and Deadlines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions across all submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        {activity.user === 'System' ? (
                          <FileCheck className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-bold">
                            {activity.user.split(' ').map(name => name[0]).join('')}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {activity.action}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{activity.user}</span>
                          <span>•</span>
                          <span>{activity.submission}</span>
                          <span>•</span>
                          <span>{activity.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full">
                  View Full Activity Log
                </Button>
              </CardFooter>
            </Card>
            
            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>
                  Scheduled milestones and submission dates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingDeadlines.map((deadline) => (
                    <div key={deadline.id} className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        deadline.daysRemaining <= 3 ? 'bg-red-100 text-red-600' :
                        deadline.daysRemaining <= 7 ? 'bg-amber-100 text-amber-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {deadline.type === 'review' ? (
                          <FileSearch className="h-4 w-4" />
                        ) : deadline.type === 'milestone' ? (
                          <Calendar className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {deadline.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{deadline.date}</span>
                          <span>•</span>
                          <span className={deadline.daysRemaining <= 3 ? 'text-red-600 font-medium' : ''}>
                            {deadline.daysRemaining} days remaining
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full">
                  View Calendar
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Templates and Validation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Templates</CardTitle>
                <CardDescription>
                  Recently updated document templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.title}</TableCell>
                        <TableCell>{template.module} ({template.section})</TableCell>
                        <TableCell>{template.lastUpdated}</TableCell>
                        <TableCell>
                          <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                            {template.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <FilePlus className="h-4 w-4 mr-2" />
                  Manage Templates
                </Button>
              </CardFooter>
            </Card>
            
            {/* Validation Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Validation Overview</CardTitle>
                <CardDescription>
                  Current validation status for all submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Validation Pass Rate</span>
                      <span className="font-medium">{Math.round((validationStats.passedValidation / validationStats.totalSubmissions) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full" style={{ width: `${(validationStats.passedValidation / validationStats.totalSubmissions) * 100}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Document Compliance</span>
                      <span className="font-medium">{Math.round(100 - ((validationStats.documentsWithIssues / validationStats.totalDocuments) * 100))}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full" style={{ width: `${100 - ((validationStats.documentsWithIssues / validationStats.totalDocuments) * 100)}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="pt-4 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{validationStats.passedValidation}</div>
                      <div className="text-xs text-muted-foreground mt-1">Passed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">{validationStats.warningValidation}</div>
                      <div className="text-xs text-muted-foreground mt-1">Warnings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{validationStats.failedValidation}</div>
                      <div className="text-xs text-muted-foreground mt-1">Failed</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <FileCheck className="h-4 w-4 mr-2" />
                  Validation Report
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Submissions Tab */}
        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>eCTD Submissions</CardTitle>
              <CardDescription>
                Manage all your eCTD submissions and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Submission Management</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  View and manage all your eCTD submissions, track validation status, and manage document organization.
                </p>
                <Button className="mt-6">
                  View All Submissions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Document Templates</CardTitle>
                  <CardDescription>
                    Manage templates for all CTD modules and sections
                  </CardDescription>
                </div>
                <Button onClick={() => toast({
                  title: "New Template",
                  description: "Creating a new template with Microsoft Word integration",
                })}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentTemplates.map((template) => (
                  <Card key={template.id} className="flex flex-col h-full">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{template.title}</CardTitle>
                          <CardDescription className="text-xs">
                            {template.module} • Section {template.section}
                          </CardDescription>
                        </div>
                        <Badge className={template.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100'}>
                          {template.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="text-sm text-muted-foreground mb-2">
                        Last updated: {template.lastUpdated}
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" />
                        <span>eCTD-compliant template</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>ICH M4 validated</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 border-t flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toast({
                          title: "Template Downloaded",
                          description: `Template ${template.title} has been downloaded.`,
                        })}
                      >
                        <Download className="h-3.5 w-3.5 mr-1" /> 
                        Download
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenInWord(template.id)}
                      >
                        <FileEdit className="h-3.5 w-3.5 mr-1" />
                        Edit in Word
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <Button variant="outline">
                View All Templates
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Microsoft Word Integration</CardTitle>
              <CardDescription>
                Seamlessly edit eCTD documents using familiar Microsoft Office tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col border rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <FileEdit className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-medium">Microsoft Word Online</h3>
                      <p className="text-sm text-muted-foreground">
                        Web-based editing with automatic saving to VAULT
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1 mb-4">
                    Edit documents directly in your browser using Microsoft Word Online. 
                    All changes are automatically synchronized with VAULT document management.
                  </p>
                  <Button className="w-full" onClick={() => setShowWordIntegration(true)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Launch Word Online
                  </Button>
                </div>
                
                <div className="flex flex-col border rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <FileEdit className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-medium">Microsoft 365 Desktop</h3>
                      <p className="text-sm text-muted-foreground">
                        Desktop application with enhanced features
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1 mb-4">
                    Use full-featured Microsoft Word desktop application with document check-out/check-in 
                    functionality for offline editing with version control.
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => toast({
                    title: "Desktop Integration",
                    description: "Opening document in Microsoft Word desktop application",
                  })}>
                    <Download className="h-4 w-4 mr-2" />
                    Open in Desktop App
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Validation Tab */}
        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <CardTitle>eCTD Validation</CardTitle>
              <CardDescription>
                Validate submissions against regulatory requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Validation Dashboard</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  Run validation checks against regulatory requirements, review validation reports, and fix identified issues.
                </p>
                <Button className="mt-6">
                  Go to Validation Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Collaboration Tab */}
        <TabsContent value="collaboration">
          <Card>
            <CardHeader>
              <CardTitle>Team Collaboration</CardTitle>
              <CardDescription>
                Collaborate with your team on eCTD submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Collaboration Hub</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  Work together with your team on eCTD submissions, assign tasks, track progress, and manage approvals.
                </p>
                <Button className="mt-6">
                  Go to Collaboration Hub
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ECTDCoAuthorDashboard;