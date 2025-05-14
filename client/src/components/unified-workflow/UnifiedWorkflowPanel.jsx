/**
 * Unified Workflow Panel
 * 
 * This component provides a UI for managing document workflows
 * across different modules in a unified way.
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  UserCircle, 
  CalendarClock,
  FileText,
  Plus
} from 'lucide-react';

import { getWorkflowTemplates, getDefaultTemplateForDocumentType } from './WorkflowTemplateService';
import { 
  getDocumentWorkflow, 
  initiateDocumentWorkflow, 
  submitWorkflowApproval 
} from './registerModuleDocument';

// Status badge components and colors
const WorkflowStatusBadge = ({ status }) => {
  const getStatusProps = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return { className: 'bg-green-500 hover:bg-green-600', icon: <CheckCircle className="h-3 w-3 mr-1" /> };
      case 'rejected':
        return { className: 'bg-red-500 hover:bg-red-600', icon: <XCircle className="h-3 w-3 mr-1" /> };
      case 'pending':
        return { className: 'bg-yellow-500 hover:bg-yellow-600', icon: <Clock className="h-3 w-3 mr-1" /> };
      case 'in_progress':
        return { className: 'bg-blue-500 hover:bg-blue-600', icon: <ChevronRight className="h-3 w-3 mr-1" /> };
      case 'review_needed':
        return { className: 'bg-purple-500 hover:bg-purple-600', icon: <AlertCircle className="h-3 w-3 mr-1" /> };
      default:
        return { className: 'bg-gray-500 hover:bg-gray-600', icon: <FileText className="h-3 w-3 mr-1" /> };
    }
  };

  const { className, icon } = getStatusProps(status);

  return (
    <Badge variant="outline" className={className}>
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
    </Badge>
  );
};

/**
 * Main component for the Unified Workflow Panel
 */
const UnifiedWorkflowPanel = ({
  documentId,
  moduleType,
  documentType,
  organizationId,
  userId,
  userName,
  onWorkflowChange,
  className = '',
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('current');
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState('approved');
  const [approvalComment, setApprovalComment] = useState('');
  const [initiateDialogOpen, setInitiateDialogOpen] = useState(false);
  
  // Fetch workflow templates
  const { data: templates = [] } = useQuery({
    queryKey: [`/api/module-integration/workflow-templates/${moduleType}`, organizationId],
    queryFn: () => getWorkflowTemplates(moduleType, organizationId),
    enabled: !!moduleType && !!organizationId,
  });
  
  // Fetch current workflow
  const { 
    data: workflow, 
    isLoading: isLoadingWorkflow,
    refetch: refetchWorkflow
  } = useQuery({
    queryKey: [`/api/module-integration/document/${documentId}/workflow`],
    queryFn: () => getDocumentWorkflow(documentId),
    enabled: !!documentId,
  });
  
  // Get default template for document type when templates load
  useEffect(() => {
    if (templates.length > 0 && documentType && !selectedTemplateId) {
      const getDefault = async () => {
        const defaultTemplate = await getDefaultTemplateForDocumentType(moduleType, organizationId, documentType);
        if (defaultTemplate) {
          setSelectedTemplateId(defaultTemplate.id);
        } else if (templates.length > 0) {
          setSelectedTemplateId(templates[0].id);
        }
      };
      
      getDefault();
    }
  }, [templates, documentType, moduleType, organizationId, selectedTemplateId]);
  
  // Mutation to initiate workflow
  const initiateMutation = useMutation({
    mutationFn: (data) => initiateDocumentWorkflow(data),
    onSuccess: (data) => {
      toast({
        title: 'Workflow Initiated',
        description: 'The document workflow has been started successfully.',
      });
      queryClient.invalidateQueries([`/api/module-integration/document/${documentId}/workflow`]);
      setInitiateDialogOpen(false);
      
      if (onWorkflowChange) {
        onWorkflowChange(data);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to initiate workflow: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Mutation to submit approval
  const approvalMutation = useMutation({
    mutationFn: (data) => submitWorkflowApproval(data),
    onSuccess: (data) => {
      toast({
        title: 'Approval Submitted',
        description: `You have ${approvalStatus} the workflow step.`,
      });
      queryClient.invalidateQueries([`/api/module-integration/document/${documentId}/workflow`]);
      setApprovalDialogOpen(false);
      setApprovalComment('');
      
      if (onWorkflowChange) {
        onWorkflowChange(data);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to submit approval: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Handle initiating a new workflow
  const handleInitiateWorkflow = async () => {
    if (!selectedTemplateId) {
      toast({
        title: 'Error',
        description: 'Please select a workflow template.',
        variant: 'destructive',
      });
      return;
    }
    
    initiateMutation.mutate({
      documentId,
      templateId: selectedTemplateId,
      userId,
      metadata: {
        initiatedBy: userName || 'Unknown user',
        documentType,
      }
    });
  };
  
  // Handle opening approval dialog
  const handleApprovalClick = (approval) => {
    setSelectedApproval(approval);
    setApprovalStatus('approved');
    setApprovalComment('');
    setApprovalDialogOpen(true);
  };
  
  // Handle submitting an approval
  const handleSubmitApproval = () => {
    if (!selectedApproval) return;
    
    approvalMutation.mutate({
      workflowId: selectedApproval.workflowId,
      stepIndex: selectedApproval.stepIndex,
      userId,
      status: approvalStatus,
      comments: approvalComment
    });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Get pending approvals that the current user is assigned to
  const getUserPendingApprovals = () => {
    if (!workflow?.approvals) return [];
    
    return workflow.approvals.filter(approval => 
      approval.status === 'pending' && 
      (approval.assignedTo === userId || !approval.assignedTo)
    );
  };
  
  return (
    <Card className={`shadow-md ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">Document Workflow</CardTitle>
          
          {(!workflow || workflow.status === 'rejected') && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInitiateDialogOpen(true)}
              disabled={initiateMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-1" />
              Initiate Workflow
            </Button>
          )}
        </div>
        <CardDescription>
          Track and manage document approvals across modules
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoadingWorkflow ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : workflow ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{workflow.templateName}</h3>
                <p className="text-sm text-gray-500">
                  Started: {formatDate(workflow.startedAt)}
                </p>
              </div>
              <WorkflowStatusBadge status={workflow.status} />
            </div>
            
            <Separator />
            
            <div className="space-y-4 mt-4">
              <h4 className="font-medium">Approval Steps</h4>
              
              {workflow.approvals?.map((approval, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-md border ${
                    approval.status === 'approved' 
                      ? 'border-green-200 bg-green-50' 
                      : approval.status === 'rejected'
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium">{approval.stepName || `Step ${index + 1}`}</h5>
                      <p className="text-sm text-gray-500">{approval.description || 'No description'}</p>
                    </div>
                    <WorkflowStatusBadge status={approval.status} />
                  </div>
                  
                  {approval.status === 'pending' && (userId === approval.assignedTo || !approval.assignedTo) && (
                    <div className="mt-2 flex justify-end">
                      <Button 
                        size="sm" 
                        onClick={() => handleApprovalClick(approval)}
                      >
                        Review
                      </Button>
                    </div>
                  )}
                  
                  {approval.approvedBy && (
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <UserCircle className="h-4 w-4 mr-1" />
                      <span>
                        {approval.approvedBy === userId ? 'You' : `User ID: ${approval.approvedBy}`}
                        {approval.approvedAt && ` • ${formatDate(approval.approvedAt)}`}
                      </span>
                    </div>
                  )}
                  
                  {approval.comments && (
                    <div className="mt-2 text-sm italic">
                      "{approval.comments}"
                    </div>
                  )}
                </div>
              ))}
              
              {workflow.approvals?.length === 0 && (
                <p className="text-sm text-gray-500">No approval steps found.</p>
              )}
            </div>
            
            {workflow.auditLog?.length > 0 && (
              <>
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <h4 className="font-medium">Recent Activity</h4>
                  
                  <div className="space-y-2">
                    {workflow.auditLog.slice(0, 3).map((log, index) => (
                      <div key={index} className="text-sm flex items-start">
                        <CalendarClock className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                        <div>
                          <span className="text-gray-700">
                            {log.action.replace(/_/g, ' ')}
                          </span>
                          <span className="text-gray-500 ml-1">
                            {formatDate(log.timestamp)}
                          </span>
                          {log.details && (
                            <p className="text-xs text-gray-500 mt-0.5">{log.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <FileText className="h-10 w-10 mx-auto text-gray-400 mb-2" />
            <h3 className="font-medium text-gray-700">No Active Workflow</h3>
            <p className="text-sm text-gray-500 mb-4">
              This document hasn't been added to a workflow yet.
            </p>
            <Button 
              onClick={() => setInitiateDialogOpen(true)}
              disabled={initiateMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-1" />
              Initiate Workflow
            </Button>
          </div>
        )}
      </CardContent>
      
      {/* Initiate Workflow Dialog */}
      <Dialog open={initiateDialogOpen} onOpenChange={setInitiateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Initiate Document Workflow</DialogTitle>
            <DialogDescription>
              Select a workflow template to start the approval process.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="workflow-template">Workflow Template</Label>
              <Select 
                value={selectedTemplateId?.toString()} 
                onValueChange={(value) => setSelectedTemplateId(parseInt(value, 10))}
              >
                <SelectTrigger id="workflow-template">
                  <SelectValue placeholder="Select a workflow template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedTemplateId && templates.find(t => t.id === selectedTemplateId)?.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {templates.find(t => t.id === selectedTemplateId)?.description}
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setInitiateDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleInitiateWorkflow}
              disabled={!selectedTemplateId || initiateMutation.isPending}
            >
              {initiateMutation.isPending && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              Initiate Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Approval Step</DialogTitle>
            <DialogDescription>
              {selectedApproval?.stepName || 'Approval Step'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="approval-status">Decision</Label>
              <Select 
                value={approvalStatus} 
                onValueChange={setApprovalStatus}
              >
                <SelectTrigger id="approval-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approve</SelectItem>
                  <SelectItem value="rejected">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="approval-comment">Comments</Label>
              <Textarea
                id="approval-comment"
                placeholder="Add comments about your decision..."
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmitApproval}
              disabled={approvalMutation.isPending}
              variant={approvalStatus === 'rejected' ? 'destructive' : 'default'}
            >
              {approvalMutation.isPending && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              Submit {approvalStatus === 'approved' ? 'Approval' : 'Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UnifiedWorkflowPanel;