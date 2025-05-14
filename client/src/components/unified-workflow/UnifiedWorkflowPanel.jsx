import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CheckCircle, Clock, AlertCircle, FileText, ArrowRightCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Status badge component
const WorkflowStatusBadge = ({ status }) => {
  const statusConfig = {
    draft: { label: 'Draft', variant: 'outline' },
    in_review: { label: 'In Review', variant: 'secondary' },
    approved: { label: 'Approved', variant: 'success' },
    rejected: { label: 'Rejected', variant: 'destructive' }
  };

  const config = statusConfig[status] || { label: status, variant: 'outline' };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

// Component for initiating workflows
const WorkflowInitiationDialog = ({ documentId, moduleType, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available workflow templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['/api/integration/modules', moduleType, 'templates'],
    enabled: isOpen,
    retry: 1
  });

  // Initiate workflow mutation
  const initiateWorkflowMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(
        `/api/integration/modules/${moduleType}/documents/${documentId}/workflow`,
        {
          method: 'POST',
          body: JSON.stringify({
            workflowTemplateId: selectedTemplate
          })
        }
      );
    },
    onSuccess: (data) => {
      toast({
        title: 'Workflow Initiated',
        description: `Workflow started with ID: ${data.workflowId}`
      });
      setIsOpen(false);
      if (onSuccess) onSuccess(data.workflowId);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['/api/integration/modules', moduleType, 'documents', documentId]
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to initiate workflow: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  const handleInitiateWorkflow = () => {
    if (!selectedTemplate) {
      toast({
        title: 'Error',
        description: 'Please select a workflow template',
        variant: 'destructive'
      });
      return;
    }

    initiateWorkflowMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Initiate Workflow</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Initiate Document Workflow</DialogTitle>
          <DialogDescription>
            Select a workflow template to begin the approval process for this document.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="py-4">
            <Label htmlFor="workflowTemplate">Workflow Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedTemplate && templates && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <h4 className="font-medium">Approval Steps:</h4>
                <ol className="mt-2 ml-5 list-decimal">
                  {templates
                    .find(t => t.id === selectedTemplate)
                    ?.steps.map((step, index) => (
                      <li key={index}>
                        {step.title} <span className="text-sm text-muted-foreground">({step.role})</span>
                      </li>
                    ))}
                </ol>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleInitiateWorkflow}
            disabled={!selectedTemplate || initiateWorkflowMutation.isPending}
          >
            {initiateWorkflowMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Initiate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Component for displaying workflow details
const WorkflowDetails = ({ workflow }) => {
  if (!workflow) return null;
  
  const { workflowDetails } = workflow;
  const { workflow: workflowData, template, approvals } = workflowDetails;
  
  // Sort approvals by step index
  const sortedApprovals = [...approvals].sort((a, b) => a.stepIndex - b.stepIndex);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium">Workflow Status:</h3>
        <WorkflowStatusBadge status={workflowData.status} />
      </div>
      
      <div>
        <h4 className="font-medium">Template: {template?.name}</h4>
        <p className="text-sm text-muted-foreground">{template?.description}</p>
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Approval Steps:</h4>
        <Accordion type="single" collapsible className="w-full">
          {sortedApprovals.map((approval) => {
            const step = template?.steps[approval.stepIndex];
            const isCurrentStep = approval.stepIndex === workflowData.currentStep;
            const isComplete = ['approved', 'rejected'].includes(approval.status);
            
            return (
              <AccordionItem 
                key={approval.id} 
                value={approval.id}
                className={isCurrentStep ? 'border-primary' : ''}
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    {isComplete ? (
                      approval.status === 'approved' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )
                    ) : isCurrentStep ? (
                      <Clock className="h-5 w-5 text-amber-500" />
                    ) : (
                      <ArrowRightCircle className="h-5 w-5 text-gray-300" />
                    )}
                    <span className={isCurrentStep ? 'font-medium' : ''}>
                      {step?.title || `Step ${approval.stepIndex + 1}`}
                    </span>
                    <Badge variant={isComplete ? (approval.status === 'approved' ? 'success' : 'destructive') : 'outline'}>
                      {approval.status}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pl-6">
                    <div><strong>Role:</strong> {approval.assignedRole}</div>
                    {approval.assignedTo && (
                      <div><strong>Assigned to:</strong> User #{approval.assignedTo}</div>
                    )}
                    {isComplete && (
                      <>
                        <div><strong>Completed by:</strong> User #{approval.completedBy}</div>
                        <div><strong>Completed at:</strong> {new Date(approval.completedAt).toLocaleString()}</div>
                        {approval.comments && (
                          <div className="mt-2">
                            <strong>Comments:</strong>
                            <p className="text-sm mt-1 p-2 bg-muted rounded">{approval.comments}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};

// Component for approving/rejecting a workflow step
const WorkflowApprovalDialog = ({ workflowId, stepIndex, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState('');
  const [action, setAction] = useState('approve'); // 'approve' or 'reject'
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Approve/reject mutation
  const approvalMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(
        `/api/integration/workflows/${workflowId}/approve`,
        {
          method: 'POST',
          body: JSON.stringify({
            stepIndex,
            approved: action === 'approve',
            comments
          })
        }
      );
    },
    onSuccess: (data) => {
      toast({
        title: action === 'approve' ? 'Step Approved' : 'Step Rejected',
        description: data.isComplete 
          ? 'Workflow is now complete' 
          : `Moving to step ${data.nextStep + 1}`
      });
      setIsOpen(false);
      if (onSuccess) onSuccess(data);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['/api/integration/workflows', workflowId]
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to process approval: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = () => {
    approvalMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Review Step</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review Workflow Step</DialogTitle>
          <DialogDescription>
            Review and approve or reject this workflow step.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="action">Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approve">Approve</SelectItem>
                <SelectItem value="reject">Reject</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="comments">Comments</Label>
            <Input
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Optional comments"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={approvalMutation.isPending}
            variant={action === 'approve' ? 'default' : 'destructive'}
          >
            {approvalMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main component
const UnifiedWorkflowPanel = ({ documentId, moduleType }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch document with workflow information
  const { 
    data: documentData,
    isLoading: isDocumentLoading,
    error: documentError
  } = useQuery({
    queryKey: ['/api/integration/modules', moduleType, 'documents', documentId, 'workflow'],
    retry: 1
  });

  // Handle workflow actions
  const handleWorkflowAction = (data) => {
    queryClient.invalidateQueries({
      queryKey: ['/api/integration/modules', moduleType, 'documents', documentId, 'workflow']
    });
  };

  if (isDocumentLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Workflow</CardTitle>
          <CardDescription>Loading workflow information...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (documentError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Workflow</CardTitle>
          <CardDescription>Error loading workflow information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/10 p-4 rounded-md text-destructive">
            {documentError.message || 'An error occurred while loading workflow data'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasWorkflow = documentData?.hasWorkflow;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Document Workflow</CardTitle>
            <CardDescription>
              Manage the approval workflow for this document
            </CardDescription>
          </div>
          {hasWorkflow && (
            <WorkflowStatusBadge 
              status={documentData.workflowDetails.workflow.status} 
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasWorkflow ? (
          <div className="text-center p-6 space-y-4">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">No Active Workflow</h3>
              <p className="text-sm text-muted-foreground">
                This document doesn't have an active approval workflow.
              </p>
            </div>
            <WorkflowInitiationDialog
              documentId={documentId}
              moduleType={moduleType}
              onSuccess={handleWorkflowAction}
            />
          </div>
        ) : (
          <WorkflowDetails workflow={documentData} />
        )}
      </CardContent>
      {hasWorkflow && 
       documentData.workflowDetails.workflow.status === 'in_review' && (
        <CardFooter className="flex justify-end">
          <WorkflowApprovalDialog 
            workflowId={documentData.workflowDetails.workflow.id}
            stepIndex={documentData.workflowDetails.workflow.currentStep}
            onSuccess={handleWorkflowAction}
          />
        </CardFooter>
      )}
    </Card>
  );
};

export default UnifiedWorkflowPanel;