/**
 * Unified Workflow Panel
 * 
 * This component provides a UI for managing document workflows across modules,
 * supporting document registration, workflow initiation, and approval management.
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

// Import workflow utilities
import * as workflowTemplateService from './WorkflowTemplateService';
import * as moduleDocumentService from './registerModuleDocument';

/**
 * Workflow status badge component
 */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    in_progress: { label: 'In Progress', variant: 'warning', icon: <Clock className="w-3 h-3 mr-1" /> },
    completed: { label: 'Completed', variant: 'success', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
    rejected: { label: 'Rejected', variant: 'destructive', icon: <XCircle className="w-3 h-3 mr-1" /> },
    waiting: { label: 'Waiting', variant: 'secondary', icon: <Clock className="w-3 h-3 mr-1" /> },
    active: { label: 'Active', variant: 'default', icon: <AlertCircle className="w-3 h-3 mr-1" /> },
    approved: { label: 'Approved', variant: 'success', icon: <CheckCircle className="w-3 h-3 mr-1" /> }
  };
  
  const config = statusConfig[status] || statusConfig.in_progress;
  
  return (
    <Badge variant={config.variant} className="flex items-center">
      {config.icon}
      {config.label}
    </Badge>
  );
};

/**
 * Main UnifiedWorkflowPanel component
 */
const UnifiedWorkflowPanel = ({ 
  documentData,
  moduleType,
  organizationId,
  userId,
  onWorkflowUpdated,
  compact = false
}) => {
  const [selectedTab, setSelectedTab] = useState('info');
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [workflowComment, setWorkflowComment] = useState('');
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [approvalAction, setApprovalAction] = useState('approve');
  const [approvalComment, setApprovalComment] = useState('');
  const [workflowMetadata, setWorkflowMetadata] = useState({});
  
  // Get document's unified document reference
  const { data: unifiedDocument, isLoading: isDocumentLoading, refetch: refetchDocument } = 
    useQuery({
      queryKey: [`/api/module-integration/documents/module/${moduleType}/${documentData.id}`],
      queryFn: () => moduleDocumentService.getDocumentByModuleId(
        moduleType, 
        documentData.id.toString(), 
        organizationId
      ),
      enabled: !!documentData?.id && !!moduleType && !!organizationId
    });
  
  // Get workflow templates for this module type
  const { data: workflowTemplates, isLoading: isTemplatesLoading } = 
    useQuery({
      queryKey: [`/api/module-integration/workflow-templates`, moduleType, organizationId],
      queryFn: () => workflowTemplateService.getWorkflowTemplates(moduleType, organizationId),
      enabled: !!moduleType && !!organizationId
    });
  
  // Get document workflows if unified document exists
  const { data: documentWorkflows, isLoading: isWorkflowsLoading, refetch: refetchWorkflows } = 
    useQuery({
      queryKey: [`/api/module-integration/documents/${unifiedDocument?.document?.id}/workflows`],
      queryFn: () => moduleDocumentService.getDocumentWorkflows(unifiedDocument.document.id),
      enabled: !!unifiedDocument?.document?.id
    });
  
  // Get active workflow details if there's at least one workflow
  const activeWorkflowId = documentWorkflows && documentWorkflows.length > 0 
    ? documentWorkflows[0].id 
    : null;
  
  const { data: activeWorkflow, isLoading: isActiveWorkflowLoading, refetch: refetchActiveWorkflow } = 
    useQuery({
      queryKey: [`/api/module-integration/workflows/${activeWorkflowId}`],
      queryFn: () => moduleDocumentService.getWorkflowDetails(activeWorkflowId),
      enabled: !!activeWorkflowId
    });
  
  // Register document mutation
  const registerDocumentMutation = useMutation({
    mutationFn: (data) => moduleDocumentService.registerModuleDocument(data),
    onSuccess: () => {
      toast({
        title: "Document registered",
        description: "Document successfully registered in unified workflow system",
      });
      refetchDocument();
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not register document",
        variant: "destructive"
      });
    }
  });
  
  // Create workflow mutation
  const createWorkflowMutation = useMutation({
    mutationFn: ({ documentId, templateId, startedBy, metadata }) => 
      moduleDocumentService.createDocumentWorkflow(documentId, templateId, startedBy, metadata),
    onSuccess: () => {
      toast({
        title: "Workflow created",
        description: "Document workflow successfully initiated",
      });
      setShowWorkflowDialog(false);
      refetchWorkflows();
      if (onWorkflowUpdated) onWorkflowUpdated();
    },
    onError: (error) => {
      toast({
        title: "Workflow creation failed",
        description: error.message || "Could not create workflow",
        variant: "destructive"
      });
    }
  });
  
  // Approve workflow step mutation
  const approveStepMutation = useMutation({
    mutationFn: ({ approvalId, userId, comments }) => 
      moduleDocumentService.approveWorkflowStep(approvalId, userId, comments),
    onSuccess: () => {
      toast({
        title: "Step approved",
        description: "Workflow step successfully approved",
      });
      setApprovalDialogOpen(false);
      setApprovalComment('');
      refetchActiveWorkflow();
      refetchWorkflows();
      if (onWorkflowUpdated) onWorkflowUpdated();
    },
    onError: (error) => {
      toast({
        title: "Approval failed",
        description: error.message || "Could not approve workflow step",
        variant: "destructive"
      });
    }
  });
  
  // Reject workflow step mutation
  const rejectStepMutation = useMutation({
    mutationFn: ({ approvalId, userId, comments }) => 
      moduleDocumentService.rejectWorkflowStep(approvalId, userId, comments),
    onSuccess: () => {
      toast({
        title: "Step rejected",
        description: "Workflow step was rejected",
      });
      setApprovalDialogOpen(false);
      setApprovalComment('');
      refetchActiveWorkflow();
      refetchWorkflows();
      if (onWorkflowUpdated) onWorkflowUpdated();
    },
    onError: (error) => {
      toast({
        title: "Rejection failed",
        description: error.message || "Could not reject workflow step",
        variant: "destructive"
      });
    }
  });
  
  // Register document if it doesn't exist yet
  const handleRegisterDocument = () => {
    const registrationData = {
      title: documentData.title || `Document ${documentData.id}`,
      documentType: documentData.type || moduleDocumentService.DocumentType.REPORT_510K,
      moduleType,
      originalDocumentId: documentData.id.toString(),
      organizationId,
      createdBy: userId,
      metadata: {
        sourceModule: moduleType,
        sourceId: documentData.id,
        status: documentData.status || 'draft',
        version: documentData.version || '1.0'
      }
    };
    
    registerDocumentMutation.mutate(registrationData);
  };
  
  // Start new workflow
  const handleStartWorkflow = () => {
    if (!selectedTemplateId) {
      toast({
        title: "Template required",
        description: "Please select a workflow template",
        variant: "destructive"
      });
      return;
    }
    
    createWorkflowMutation.mutate({
      documentId: unifiedDocument.document.id,
      templateId: parseInt(selectedTemplateId, 10),
      startedBy: userId,
      metadata: {
        ...workflowMetadata,
        initialComment: workflowComment
      }
    });
  };
  
  // Handle approval action
  const handleApprovalAction = () => {
    if (!selectedApproval) return;
    
    if (approvalAction === 'approve') {
      approveStepMutation.mutate({
        approvalId: selectedApproval.id,
        userId,
        comments: approvalComment
      });
    } else {
      if (!approvalComment.trim()) {
        toast({
          title: "Comment required",
          description: "Please provide a comment when rejecting a workflow step",
          variant: "destructive"
        });
        return;
      }
      
      rejectStepMutation.mutate({
        approvalId: selectedApproval.id,
        userId,
        comments: approvalComment
      });
    }
  };
  
  // Open approval dialog
  const openApprovalDialog = (approval, action) => {
    setSelectedApproval(approval);
    setApprovalAction(action);
    setApprovalComment('');
    setApprovalDialogOpen(true);
  };
  
  // Render loading state
  if (isDocumentLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Workflow Status</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2">Loading document workflow status...</span>
        </CardContent>
      </Card>
    );
  }
  
  // Render document registration option if unified document not found
  if (!unifiedDocument) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Workflow Status</CardTitle>
          <CardDescription>
            This document is not registered in the unified workflow system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Register this document to enable cross-module workflows and approvals
          </p>
          <Button 
            onClick={handleRegisterDocument}
            disabled={registerDocumentMutation.isPending}
          >
            {registerDocumentMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Register Document
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Render compact view
  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span>Workflow Status</span>
            {activeWorkflow && (
              <StatusBadge status={activeWorkflow.workflow.status} />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isWorkflowsLoading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Loading workflows...</span>
            </div>
          ) : documentWorkflows && documentWorkflows.length > 0 ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Current workflow: {activeWorkflow?.workflow?.templateId ? 
                  workflowTemplates?.find(t => t.id === activeWorkflow.workflow.templateId)?.name : 
                  'Unknown template'}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setSelectedTab('workflows')}
              >
                View Details
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-2">No active workflows</p>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => setShowWorkflowDialog(true)}
                disabled={isTemplatesLoading || createWorkflowMutation.isPending}
              >
                {(isTemplatesLoading || createWorkflowMutation.isPending) && (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                )}
                Start Workflow
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Render full view
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Unified Document Workflow</CardTitle>
        <CardDescription>
          Manage document workflows and approvals across modules
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Document Info</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
          </TabsList>
          
          {/* Document Info Tab */}
          <TabsContent value="info" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium">Document ID</h4>
                <p className="text-sm text-muted-foreground">{unifiedDocument.document.id}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Module Type</h4>
                <p className="text-sm text-muted-foreground">{moduleType}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Original ID</h4>
                <p className="text-sm text-muted-foreground">{unifiedDocument.moduleDocument.originalDocumentId}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Document Type</h4>
                <p className="text-sm text-muted-foreground">{unifiedDocument.document.documentType}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Created</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(unifiedDocument.document.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Updated</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(unifiedDocument.document.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-2">Metadata</h4>
              <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
                {JSON.stringify(unifiedDocument.document.metadata, null, 2)}
              </pre>
            </div>
          </TabsContent>
          
          {/* Workflows Tab */}
          <TabsContent value="workflows" className="py-4">
            {isWorkflowsLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2">Loading document workflows...</span>
              </div>
            ) : documentWorkflows && documentWorkflows.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Current Workflows</h3>
                  <Button onClick={() => setShowWorkflowDialog(true)} size="sm">
                    Start New Workflow
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {documentWorkflows.map(workflow => {
                    const template = workflowTemplates?.find(t => t.id === workflow.templateId);
                    return (
                      <Card key={workflow.id} className="overflow-hidden">
                        <CardHeader className="bg-muted/50 py-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base">
                              {template?.name || `Workflow #${workflow.id}`}
                            </CardTitle>
                            <StatusBadge status={workflow.status} />
                          </div>
                          <CardDescription>
                            Started: {new Date(workflow.startedAt).toLocaleString()}
                          </CardDescription>
                        </CardHeader>
                        {isActiveWorkflowLoading && activeWorkflowId === workflow.id ? (
                          <CardContent className="flex justify-center items-center py-6">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            <span className="ml-2">Loading workflow details...</span>
                          </CardContent>
                        ) : activeWorkflow && activeWorkflowId === workflow.id ? (
                          <CardContent className="py-3">
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-sm font-medium mb-1">Workflow Steps</h4>
                                <ul className="space-y-2">
                                  {activeWorkflow.approvals.map((approval) => (
                                    <li key={approval.id} className="flex items-center justify-between text-sm p-2 border rounded-md">
                                      <div>
                                        <span className="font-medium">{approval.stepName}</span>
                                        {approval.description && (
                                          <span className="text-muted-foreground ml-2">
                                            {approval.description}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <StatusBadge status={approval.status} />
                                        {approval.status === 'active' && (
                                          <div className="flex space-x-1">
                                            <Button 
                                              variant="outline" 
                                              size="sm"
                                              onClick={() => openApprovalDialog(approval, 'approve')}
                                            >
                                              Approve
                                            </Button>
                                            <Button 
                                              variant="outline" 
                                              size="sm"
                                              onClick={() => openApprovalDialog(approval, 'reject')}
                                            >
                                              Reject
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium mb-1">Recent Activity</h4>
                                <ScrollArea className="h-40 rounded-md border">
                                  <div className="p-4 space-y-2">
                                    {activeWorkflow.auditLogs.map((log) => (
                                      <div key={log.id} className="text-xs">
                                        <div className="flex justify-between">
                                          <span className="font-medium">
                                            {log.actionType.replace(/_/g, ' ')}
                                          </span>
                                          <span className="text-muted-foreground">
                                            {new Date(log.timestamp).toLocaleString()}
                                          </span>
                                        </div>
                                        <p className="text-muted-foreground">{log.details}</p>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>
                            </div>
                          </CardContent>
                        ) : null}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No workflows found for this document</p>
                <Button onClick={() => setShowWorkflowDialog(true)}>
                  Start New Workflow
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Approvals Tab */}
          <TabsContent value="approvals" className="py-4">
            {isActiveWorkflowLoading || !activeWorkflow ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2">Loading approval information...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Approvals</CardTitle>
                    <CardDescription>
                      Current approval steps requiring action
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activeWorkflow.approvals.filter(a => a.status === 'active').length > 0 ? (
                      <ul className="space-y-2">
                        {activeWorkflow.approvals
                          .filter(a => a.status === 'active')
                          .map((approval) => (
                            <li key={approval.id} className="flex justify-between items-center p-3 border rounded-md">
                              <div>
                                <h4 className="font-medium">{approval.stepName}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {approval.description || 'No description provided'}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline"
                                  onClick={() => openApprovalDialog(approval, 'approve')}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  variant="outline"
                                  onClick={() => openApprovalDialog(approval, 'reject')}
                                >
                                  Reject
                                </Button>
                              </div>
                            </li>
                          ))
                        }
                      </ul>
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">
                        No active approvals waiting for action
                      </p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Approval History</CardTitle>
                    <CardDescription>
                      Completed approval steps
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activeWorkflow.approvals.filter(a => ['approved', 'rejected'].includes(a.status)).length > 0 ? (
                      <ul className="space-y-2">
                        {activeWorkflow.approvals
                          .filter(a => ['approved', 'rejected'].includes(a.status))
                          .map((approval) => (
                            <li key={approval.id} className="p-3 border rounded-md">
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">{approval.stepName}</h4>
                                <StatusBadge status={approval.status} />
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {approval.approvedAt ? new Date(approval.approvedAt).toLocaleString() : 'No date'}
                              </p>
                              {approval.comments && (
                                <div className="mt-2 text-sm">
                                  <span className="font-medium">Comments:</span>
                                  <p className="text-muted-foreground">{approval.comments}</p>
                                </div>
                              )}
                            </li>
                          ))
                        }
                      </ul>
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">
                        No completed approvals yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Start Workflow Dialog */}
      <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Workflow</DialogTitle>
            <DialogDescription>
              Select a workflow template and provide initial comments
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template">Workflow Template</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {isTemplatesLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="ml-2">Loading templates...</span>
                    </div>
                  ) : workflowTemplates && workflowTemplates.length > 0 ? (
                    workflowTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-center text-muted-foreground">
                      No templates available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {selectedTemplateId && workflowTemplates && (
              <div className="space-y-2">
                <Label>Template Steps</Label>
                <div className="text-sm p-3 bg-muted rounded-md">
                  <pre className="whitespace-pre-wrap">
                    {workflowTemplateService.formatWorkflowSteps(
                      workflowTemplates.find(t => t.id.toString() === selectedTemplateId)?.steps || []
                    )}
                  </pre>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="comment">Initial Comment</Label>
              <Textarea
                id="comment"
                placeholder="Add any initial comments or context for reviewers"
                value={workflowComment}
                onChange={(e) => setWorkflowComment(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-base">Additional Options</Label>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="high-priority"
                  checked={workflowMetadata.highPriority}
                  onCheckedChange={(checked) => 
                    setWorkflowMetadata({...workflowMetadata, highPriority: checked})
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="high-priority">High Priority</Label>
                  <p className="text-sm text-muted-foreground">
                    Mark this workflow as high priority for reviewers
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWorkflowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleStartWorkflow}
              disabled={!selectedTemplateId || createWorkflowMutation.isPending}
            >
              {createWorkflowMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Start Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Approval Action Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approve' : 'Reject'} Workflow Step
            </DialogTitle>
            <DialogDescription>
              {selectedApproval?.stepName || 'Workflow step'} - 
              {approvalAction === 'approve' 
                ? ' Provide any optional comments with your approval'
                : ' Please explain the reason for rejection'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approval-comment">
                {approvalAction === 'approve' ? 'Comments (Optional)' : 'Reason for Rejection*'}
              </Label>
              <Textarea
                id="approval-comment"
                placeholder={approvalAction === 'approve' 
                  ? "Add any comments for the workflow history"
                  : "Please explain why this step is being rejected"
                }
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                required={approvalAction === 'reject'}
              />
              {approvalAction === 'reject' && (
                <p className="text-sm text-muted-foreground">
                  A detailed explanation is required when rejecting a workflow step
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApprovalAction}
              disabled={
                approvalAction === 'reject' && !approvalComment.trim() ||
                approveStepMutation.isPending ||
                rejectStepMutation.isPending
              }
              variant={approvalAction === 'approve' ? 'default' : 'destructive'}
            >
              {(approveStepMutation.isPending || rejectStepMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {approvalAction === 'approve' ? 'Approve' : 'Reject'} Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UnifiedWorkflowPanel;