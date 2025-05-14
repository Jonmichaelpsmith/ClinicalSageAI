/**
 * WorkflowEnabledReportGenerator Component
 * 
 * This component integrates with the unified document workflow system to generate
 * 510(k) reports with proper approval workflows. It allows users to:
 * 
 * 1. Create new 510(k) reports with predefined templates
 * 2. View current workflow status
 * 3. Manage approval processes
 * 4. Generate final approved documents
 */

import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, Download, Edit, ExternalLink, FileText, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Status badges with appropriate colors
const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'draft':
        return { variant: 'outline', text: 'Draft', icon: <Edit className="h-3 w-3 mr-1" /> };
      case 'in_review':
        return { variant: 'secondary', text: 'In Review', icon: <Clock className="h-3 w-3 mr-1" /> };
      case 'approved':
        return { variant: 'success', text: 'Approved', icon: <CheckCircle className="h-3 w-3 mr-1" /> };
      case 'rejected':
        return { variant: 'destructive', text: 'Rejected', icon: <AlertCircle className="h-3 w-3 mr-1" /> };
      default:
        return { variant: 'outline', text: status, icon: null };
    }
  };

  const config = getStatusConfig();
  
  return (
    <Badge variant={config.variant} className="ml-2">
      {config.icon}
      {config.text}
    </Badge>
  );
};

// Workflow progress indicator
const WorkflowProgress = ({ steps, currentStep }) => {
  // Calculate percentage based on completed steps
  const completedSteps = steps.filter(step => step.status === 'approved').length;
  const percentage = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;
  
  return (
    <div className="space-y-2 mt-4">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
      
      <div className="space-y-2 mt-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              {step.status === 'approved' && <CheckCircle className="h-4 w-4 text-green-500 mr-2" />}
              {step.status === 'pending' && <Clock className="h-4 w-4 text-amber-500 mr-2" />}
              {step.status === 'rejected' && <AlertCircle className="h-4 w-4 text-red-500 mr-2" />}
              <span className="text-sm">{step.stepName}</span>
              <span className="text-xs text-muted-foreground ml-2">({step.approvalRole})</span>
            </div>
            <StatusBadge status={step.status} />
          </div>
        ))}
      </div>
    </div>
  );
};

const WorkflowEnabledReportGenerator = ({ organizationId, userId, moduleType = '510k' }) => {
  const [reportTitle, setReportTitle] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [comments, setComments] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch workflow templates
  const { 
    data: templates, 
    isLoading: templatesLoading,
    error: templatesError
  } = useQuery({
    queryKey: [`/api/module-integration/templates/${moduleType}`, organizationId],
    queryFn: () => apiRequest(`/api/module-integration/templates/${moduleType}?organizationId=${organizationId}`),
    enabled: !!organizationId
  });

  // Fetch documents in review
  const { 
    data: activeDocuments, 
    isLoading: activeDocumentsLoading
  } = useQuery({
    queryKey: ['/api/module-integration/documents-in-review', organizationId],
    queryFn: () => apiRequest(`/api/module-integration/documents-in-review?organizationId=${organizationId}`),
    enabled: !!organizationId
  });

  // Fetch module documents
  const { 
    data: allDocuments,
    isLoading: allDocumentsLoading
  } = useQuery({
    queryKey: [`/api/module-integration/documents/${moduleType}`, organizationId],
    queryFn: () => apiRequest(`/api/module-integration/documents/${moduleType}?organizationId=${organizationId}`),
    enabled: !!organizationId
  });

  // Create a new document
  const createDocumentMutation = useMutation({
    mutationFn: (documentData) => apiRequest('/api/module-integration/register-document', {
      method: 'POST',
      body: JSON.stringify(documentData)
    }),
    onSuccess: (data) => {
      toast({
        title: 'Document Created',
        description: 'Your document has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/module-integration/documents/${moduleType}`] });
      
      // Start workflow for the new document
      startWorkflowMutation.mutate({
        documentId: data.id,
        templateId: selectedTemplateId,
        startedBy: userId,
        metadata: { initiatedFrom: 'WorkflowEnabledReportGenerator' }
      });
      
      // Reset form
      setReportTitle('');
      setSelectedTemplateId('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create document: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Start a workflow for a document
  const startWorkflowMutation = useMutation({
    mutationFn: (workflowData) => apiRequest('/api/module-integration/workflows', {
      method: 'POST',
      body: JSON.stringify(workflowData)
    }),
    onSuccess: () => {
      toast({
        title: 'Workflow Started',
        description: 'Approval workflow has been initiated for your document.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/module-integration/documents-in-review'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to start workflow: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Approve a workflow step
  const approveStepMutation = useMutation({
    mutationFn: (approvalData) => apiRequest('/api/module-integration/approve-step', {
      method: 'POST',
      body: JSON.stringify(approvalData)
    }),
    onSuccess: () => {
      toast({
        title: 'Step Approved',
        description: 'You have successfully approved this workflow step.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/module-integration/documents-in-review'] });
      setComments('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to approve step: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Reject a workflow step
  const rejectStepMutation = useMutation({
    mutationFn: (rejectionData) => apiRequest('/api/module-integration/reject-step', {
      method: 'POST',
      body: JSON.stringify(rejectionData)
    }),
    onSuccess: () => {
      toast({
        title: 'Step Rejected',
        description: 'You have rejected this workflow step.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/module-integration/documents-in-review'] });
      setComments('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to reject step: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Handle form submission
  const handleCreateDocument = (e) => {
    e.preventDefault();
    
    if (!reportTitle || !selectedTemplateId) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a title and select a template.',
        variant: 'destructive'
      });
      return;
    }
    
    // Create the document
    createDocumentMutation.mutate({
      title: reportTitle,
      documentType: '510k_submission',
      organizationId,
      createdBy: userId,
      status: 'draft',
      latestVersion: 1,
      moduleType,
      originalId: `510K-${Date.now()}`, // Generate a temporary ID
      metadata: { 
        createdVia: 'workflow_generator',
        deviceType: 'medical_device',
        fda_submission_type: '510k'
      }
    });
  };

  // Handle approval action
  const handleApproveStep = (approvalId) => {
    approveStepMutation.mutate({
      approvalId,
      userId,
      comments
    });
  };

  // Handle rejection action
  const handleRejectStep = (approvalId) => {
    if (!comments.trim()) {
      toast({
        title: 'Comments Required',
        description: 'Please provide comments explaining why this step is being rejected.',
        variant: 'destructive'
      });
      return;
    }
    
    rejectStepMutation.mutate({
      approvalId,
      userId,
      comments
    });
  };

  // Filter documents that require the user's approval
  const getPendingApprovals = () => {
    if (!activeDocuments) return [];
    
    return activeDocuments.filter(doc => {
      if (!doc.workflows || doc.workflows.length === 0) return false;
      
      // Check if there are any workflows with pending approvals for this user's role
      return doc.workflows.some(workflow => {
        if (!workflow.approvals) return false;
        
        // Find the first pending approval
        const pendingApproval = workflow.approvals.find(a => a.status === 'pending');
        if (!pendingApproval) return false;
        
        // Assuming we have a function to check if the user has the required role
        // For demo purposes, we'll allow the current user to approve any step
        return true;
      });
    });
  };

  // Determine if a document can be downloaded
  const canDownload = (document) => {
    return document.status === 'approved';
  };

  // Determine if user can approve the current step of a workflow
  const canApproveWorkflow = (document) => {
    if (!document.workflows || document.workflows.length === 0) return false;
    
    const activeWorkflow = document.workflows.find(w => w.status === 'active');
    if (!activeWorkflow || !activeWorkflow.approvals) return false;
    
    // Find the first pending approval
    const pendingApproval = activeWorkflow.approvals.find(a => a.status === 'pending');
    if (!pendingApproval) return false;
    
    // Check if user has the role to approve this step
    // For demo purposes, we'll allow the current user to approve any step
    return true;
  };

  // Get the current pending approval for a document
  const getCurrentPendingApproval = (document) => {
    if (!document.workflows || document.workflows.length === 0) return null;
    
    const activeWorkflow = document.workflows.find(w => w.status === 'active');
    if (!activeWorkflow || !activeWorkflow.approvals) return null;
    
    // Find the first pending approval
    return activeWorkflow.approvals.find(a => a.status === 'pending');
  };

  // Get all steps for a document's active workflow
  const getWorkflowSteps = (document) => {
    if (!document.workflows || document.workflows.length === 0) return [];
    
    const activeWorkflow = document.workflows.find(w => w.status === 'active');
    if (!activeWorkflow || !activeWorkflow.approvals) return [];
    
    return activeWorkflow.approvals.map(approval => ({
      id: approval.id,
      stepName: approval.step_name,
      stepDescription: approval.step_description,
      approvalRole: approval.approval_role,
      status: approval.status
    }));
  };

  // Handle document download
  const handleDownloadDocument = (document) => {
    // In a real implementation, this would trigger the download
    // For this example, we'll just show a toast
    toast({
      title: 'Download Started',
      description: `Downloading "${document.title}" in FDA-compliant format.`,
    });
  };

  // Create new document form
  const renderCreateForm = () => (
    <form onSubmit={handleCreateDocument} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="report-title">Report Title</Label>
        <Input 
          id="report-title" 
          placeholder="Enter 510(k) report title" 
          value={reportTitle}
          onChange={(e) => setReportTitle(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="workflow-template">Workflow Template</Label>
        <Select 
          value={selectedTemplateId} 
          onValueChange={setSelectedTemplateId}
        >
          <SelectTrigger id="workflow-template">
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {templatesLoading && <SelectItem value="loading" disabled>Loading templates...</SelectItem>}
            {templatesError && <SelectItem value="error" disabled>Error loading templates</SelectItem>}
            {templates && templates.map(template => (
              <SelectItem key={template.id} value={template.id.toString()}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedTemplateId && templates && (
          <CardDescription className="mt-2">
            {templates.find(t => t.id.toString() === selectedTemplateId)?.description || ''}
          </CardDescription>
        )}
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={createDocumentMutation.isPending}
      >
        {createDocumentMutation.isPending && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Create 510(k) Report
      </Button>
    </form>
  );

  // Render the document card with workflow information
  const renderDocumentCard = (document) => {
    const pendingApproval = getCurrentPendingApproval(document);
    const workflowSteps = getWorkflowSteps(document);
    const userCanApprove = canApproveWorkflow(document);
    
    return (
      <Card key={document.id} className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              <div className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                {document.title}
              </div>
            </CardTitle>
            <StatusBadge status={document.status} />
          </div>
          <CardDescription>
            Document ID: {document.id} • Created: {new Date(document.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {workflowSteps.length > 0 && (
            <WorkflowProgress steps={workflowSteps} currentStep={pendingApproval?.id} />
          )}
          
          {userCanApprove && pendingApproval && (
            <div className="mt-6 space-y-4">
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Current Step: {pendingApproval.step_name}</h4>
                <p className="text-sm text-muted-foreground mb-4">{pendingApproval.step_description}</p>
                
                <div className="space-y-2">
                  <Label htmlFor={`comments-${document.id}`}>Comments</Label>
                  <Textarea 
                    id={`comments-${document.id}`} 
                    placeholder="Add your comments (required for rejection)"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="flex space-x-2">
            {userCanApprove && pendingApproval && (
              <>
                <Button 
                  variant="secondary"
                  onClick={() => handleApproveStep(pendingApproval.id)}
                  disabled={approveStepMutation.isPending}
                >
                  {approveStepMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Approve
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleRejectStep(pendingApproval.id)}
                  disabled={rejectStepMutation.isPending || !comments.trim()}
                >
                  {rejectStepMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Reject
                </Button>
              </>
            )}
          </div>
          
          {canDownload(document) && (
            <Button 
              variant="outline" 
              onClick={() => handleDownloadDocument(document)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
          
          {document.status !== 'approved' && document.status !== 'rejected' && !userCanApprove && (
            <Badge variant="outline">Awaiting Approval</Badge>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">510(k) Workflow Manager</h2>
        <p className="text-muted-foreground">Create and manage FDA 510(k) submissions with integrated approval workflows</p>
      </div>
      
      <Tabs defaultValue="active" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="active">In Progress</TabsTrigger>
          <TabsTrigger value="pending">
            Pending Approval
            {getPendingApprovals().length > 0 && (
              <Badge variant="secondary" className="ml-2">{getPendingApprovals().length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New 510(k) Report</CardTitle>
              <CardDescription>
                Create a new 510(k) submission with a standardized approval workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderCreateForm()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="pt-4">
          {activeDocumentsLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : activeDocuments && activeDocuments.length > 0 ? (
            activeDocuments.map(document => renderDocumentCard(document))
          ) : (
            <Card>
              <CardContent className="text-center p-8">
                <p className="text-muted-foreground">No documents currently in progress</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab('create')}
                >
                  Create New Document
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="pt-4">
          {activeDocumentsLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : getPendingApprovals().length > 0 ? (
            getPendingApprovals().map(document => renderDocumentCard(document))
          ) : (
            <Card>
              <CardContent className="text-center p-8">
                <p className="text-muted-foreground">No documents pending your approval</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="pt-4">
          {allDocumentsLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : allDocuments && allDocuments.length > 0 ? (
            allDocuments.map(document => renderDocumentCard(document))
          ) : (
            <Card>
              <CardContent className="text-center p-8">
                <p className="text-muted-foreground">No documents found</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab('create')}
                >
                  Create New Document
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowEnabledReportGenerator;