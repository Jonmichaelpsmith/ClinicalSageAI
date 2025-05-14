/**
 * Unified Workflow Panel
 * 
 * This component provides the main interface for the unified document workflow system,
 * allowing users to view, manage, and interact with cross-module workflows.
 */

import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  PieChart,
  CircleCheck,
  CircleX,
  Clock,
  AlertCircle,
  Users,
  FileText,
  RefreshCw,
  Search,
  Plus,
  Check,
  X,
  FileCheck,
  History,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  getActiveWorkflows,
  getPendingApprovals,
  getWorkflowHistory,
  getWorkflowTemplates,
  approveWorkflowStep,
  rejectWorkflowStep,
  startWorkflow
} from './WorkflowTemplateService';

// Simulate organization and user ID, would come from auth context in a real app
const MOCK_ORGANIZATION_ID = 'org-123';
const MOCK_USER_ID = 'user-456';

const UnifiedWorkflowPanel = ({ moduleType = 'all', showHeader = true }) => {
  const [selectedTab, setSelectedTab] = useState('active');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [viewingHistory, setViewingHistory] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [comments, setComments] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Query for active workflows
  const { 
    data: activeWorkflows = [],
    isLoading: isLoadingActive,
    error: activeError 
  } = useQuery({
    queryKey: ['/api/module-integration/active-workflows', MOCK_ORGANIZATION_ID],
    queryFn: () => getActiveWorkflows(MOCK_ORGANIZATION_ID)
  });
  
  // Query for workflows pending approval for the current user
  const { 
    data: pendingApprovals = [],
    isLoading: isLoadingPending,
    error: pendingError 
  } = useQuery({
    queryKey: ['/api/module-integration/pending-approvals', MOCK_ORGANIZATION_ID, MOCK_USER_ID],
    queryFn: () => getPendingApprovals(MOCK_ORGANIZATION_ID, MOCK_USER_ID)
  });
  
  // Query for workflow history when a workflow is selected
  const { 
    data: workflowHistory = [],
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ['/api/module-integration/workflow-history', selectedWorkflow?.workflow?.id],
    queryFn: () => selectedWorkflow?.workflow?.id ? getWorkflowHistory(selectedWorkflow.workflow.id) : [],
    enabled: !!selectedWorkflow?.workflow?.id && viewingHistory
  });
  
  // Mutation to approve a workflow step
  const approveMutation = useMutation({
    mutationFn: ({ approvalId, userId, comments }) => 
      approveWorkflowStep(approvalId, userId, comments),
    onSuccess: () => {
      toast({
        title: "Step approved",
        description: "The workflow step has been approved successfully.",
      });
      setApprovalModalOpen(false);
      setComments('');
      queryClient.invalidateQueries({ queryKey: ['/api/module-integration/active-workflows'] });
      queryClient.invalidateQueries({ queryKey: ['/api/module-integration/pending-approvals'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to approve workflow step: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Mutation to reject a workflow step
  const rejectMutation = useMutation({
    mutationFn: ({ approvalId, userId, comments }) => 
      rejectWorkflowStep(approvalId, userId, comments),
    onSuccess: () => {
      toast({
        title: "Step rejected",
        description: "The workflow step has been rejected.",
      });
      setRejectionModalOpen(false);
      setComments('');
      queryClient.invalidateQueries({ queryKey: ['/api/module-integration/active-workflows'] });
      queryClient.invalidateQueries({ queryKey: ['/api/module-integration/pending-approvals'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to reject workflow step: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Filter workflows by moduleType if specified
  const filteredActiveWorkflows = activeWorkflows.filter(workflow => 
    moduleType === 'all' || workflow.template?.moduleType === moduleType
  );
  
  const filteredPendingApprovals = pendingApprovals.filter(approval => 
    moduleType === 'all' || approval.template?.moduleType === moduleType
  );
  
  // Filter by search query
  const searchedActiveWorkflows = searchQuery 
    ? filteredActiveWorkflows.filter(workflow => 
        workflow.document?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workflow.template?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredActiveWorkflows;
    
  const searchedPendingApprovals = searchQuery
    ? filteredPendingApprovals.filter(approval => 
        approval.workflow?.document?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        approval.template?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        approval.step?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredPendingApprovals;
    
  // Handle submission of approval
  const handleApprove = () => {
    if (selectedWorkflow) {
      approveMutation.mutate({
        approvalId: selectedWorkflow.approval.id,
        userId: MOCK_USER_ID,
        comments
      });
    }
  };
  
  // Handle submission of rejection
  const handleReject = () => {
    if (selectedWorkflow && comments.trim()) {
      rejectMutation.mutate({
        approvalId: selectedWorkflow.approval.id,
        userId: MOCK_USER_ID,
        comments
      });
    } else {
      toast({
        title: "Comments required",
        description: "Please provide comments explaining the rejection.",
        variant: "destructive",
      });
    }
  };
  
  // Toggle history view
  const toggleHistory = () => {
    setViewingHistory(!viewingHistory);
    if (!viewingHistory && selectedWorkflow?.workflow?.id) {
      refetchHistory();
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  // Get status color for badges
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get icon based on status
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'pending':
        return <Clock size={16} />;
      case 'completed':
      case 'approved':
        return <CircleCheck size={16} />;
      case 'rejected':
        return <CircleX size={16} />;
      case 'cancelled':
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };
  
  // Get module type display name
  const getModuleTypeName = (type) => {
    switch (type) {
      case '510k':
        return '510(k)';
      case 'cer':
        return 'CER';
      case 'cmc':
        return 'CMC';
      case 'ectd':
        return 'eCTD';
      case 'study':
        return 'Clinical Study';
      case 'vault':
        return 'Document Vault';
      default:
        return type?.toUpperCase() || 'Unknown';
    }
  };
  
  // Handle workflow selection
  const handleSelectWorkflow = (workflow) => {
    setSelectedWorkflow(workflow);
    setViewingHistory(false);
  };
  
  return (
    <div className="w-full">
      {showHeader && (
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Document Workflows</h2>
          <p className="text-muted-foreground">
            View and manage document approvals across all regulatory modules
          </p>
        </div>
      )}
      
      <div className="flex items-center mb-4 gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/module-integration/active-workflows'] });
            queryClient.invalidateQueries({ queryKey: ['/api/module-integration/pending-approvals'] });
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="active" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">
                Active Workflows
                {filteredActiveWorkflows.length > 0 && (
                  <Badge className="ml-2" variant="secondary">
                    {filteredActiveWorkflows.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending Approvals
                {filteredPendingApprovals.length > 0 && (
                  <Badge className="ml-2" variant="secondary">
                    {filteredPendingApprovals.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="space-y-4 mt-2">
              {isLoadingActive ? (
                <div className="flex justify-center p-4">
                  <p>Loading active workflows...</p>
                </div>
              ) : activeError ? (
                <div className="flex justify-center p-4 text-red-500">
                  <p>Error loading workflows: {activeError.message}</p>
                </div>
              ) : searchedActiveWorkflows.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No active workflows found</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  {searchedActiveWorkflows.map((workflow) => (
                    <Card key={workflow.id} className={`mb-3 hover:bg-slate-50 cursor-pointer ${selectedWorkflow?.workflow?.id === workflow.id ? 'border-primary' : ''}`} onClick={() => handleSelectWorkflow({ 
                      workflow,
                      approval: workflow.currentApproval,
                      template: workflow.template,
                      step: workflow.template?.steps.find(s => s.order === workflow.currentStep)
                    })}>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-md">{workflow.document?.title}</CardTitle>
                          <Badge className={getStatusColor(workflow.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(workflow.status)}
                              {workflow.status}
                            </span>
                          </Badge>
                        </div>
                        <CardDescription>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline">{getModuleTypeName(workflow.template?.moduleType)}</Badge>
                            <span className="text-xs">Step {workflow.currentStep}/{workflow.template?.steps.length}</span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-2 pb-2">
                        <p className="text-sm">Current step: {workflow.template?.steps.find(s => s.order === workflow.currentStep)?.name}</p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
                        Started: {formatDate(workflow.startedAt)}
                      </CardFooter>
                    </Card>
                  ))}
                </ScrollArea>
              )}
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4 mt-2">
              {isLoadingPending ? (
                <div className="flex justify-center p-4">
                  <p>Loading pending approvals...</p>
                </div>
              ) : pendingError ? (
                <div className="flex justify-center p-4 text-red-500">
                  <p>Error loading pending approvals: {pendingError.message}</p>
                </div>
              ) : searchedPendingApprovals.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <FileCheck className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No pending approvals found</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  {searchedPendingApprovals.map((approvalData) => (
                    <Card 
                      key={approvalData.approval.id} 
                      className={`mb-3 hover:bg-slate-50 cursor-pointer border-l-4 border-l-yellow-400 ${
                        selectedWorkflow?.approval?.id === approvalData.approval.id ? 'border border-primary' : ''
                      }`} 
                      onClick={() => handleSelectWorkflow(approvalData)}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-md">{approvalData.workflow?.document?.title}</CardTitle>
                          <Badge className={getStatusColor(approvalData.approval.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(approvalData.approval.status)}
                              Awaiting your review
                            </span>
                          </Badge>
                        </div>
                        <CardDescription>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline">{getModuleTypeName(approvalData.template?.moduleType)}</Badge>
                            <span className="text-xs">Step {approvalData.step?.order}/{approvalData.template?.steps.length}</span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-2 pb-2">
                        <p className="text-sm font-medium">{approvalData.step?.name}</p>
                        <p className="text-sm text-muted-foreground">{approvalData.step?.description}</p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
                        Required actions: {approvalData.approval.requiredActions?.join(', ')}
                      </CardFooter>
                    </Card>
                  ))}
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="md:col-span-3">
          {selectedWorkflow ? (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{selectedWorkflow.workflow.document?.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="outline">{getModuleTypeName(selectedWorkflow.template?.moduleType)}</Badge>
                        <Badge variant="outline">{selectedWorkflow.workflow.document?.documentType}</Badge>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={toggleHistory}
                    >
                      {viewingHistory ? (
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          View Details
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <History className="h-4 w-4" />
                          History
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {viewingHistory ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Workflow History</h3>
                    {isLoadingHistory ? (
                      <p>Loading history...</p>
                    ) : historyError ? (
                      <p className="text-red-500">Error loading history: {historyError.message}</p>
                    ) : workflowHistory.length === 0 ? (
                      <p>No history records found</p>
                    ) : (
                      <div className="space-y-4">
                        {workflowHistory.map((entry, index) => (
                          <div key={entry.id} className="border-l-2 border-gray-200 pl-4 pb-2 relative">
                            <div className="absolute w-3 h-3 bg-primary rounded-full -left-[6.5px] top-1"></div>
                            <p className="font-semibold">{entry.action.replace(/_/g, ' ')}</p>
                            <p className="text-sm text-muted-foreground">
                              By: {entry.performedBy} • {formatDate(entry.createdAt)}
                            </p>
                            {entry.details?.comments && (
                              <p className="text-sm mt-1 p-2 bg-gray-50 rounded-md">
                                "{entry.details.comments}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Current Step</h3>
                        <div className="p-3 bg-gray-50 rounded-md mt-2">
                          <p className="font-medium">{selectedWorkflow.step?.name} (Step {selectedWorkflow.step?.order} of {selectedWorkflow.template?.steps?.length})</p>
                          <p className="text-sm text-muted-foreground">{selectedWorkflow.step?.description}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge className={getStatusColor(selectedWorkflow.approval?.status)}>
                              {getStatusIcon(selectedWorkflow.approval?.status)}
                              <span className="ml-1">{selectedWorkflow.approval?.status}</span>
                            </Badge>
                            <span className="text-sm">Assigned to: {selectedWorkflow.step?.approverType} {selectedWorkflow.step?.approverIds?.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold">Workflow Details</h3>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="p-3 bg-gray-50 rounded-md">
                            <p className="text-sm font-medium">Template</p>
                            <p>{selectedWorkflow.template?.name}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-md">
                            <p className="text-sm font-medium">Status</p>
                            <p>{selectedWorkflow.workflow?.status}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-md">
                            <p className="text-sm font-medium">Started On</p>
                            <p>{formatDate(selectedWorkflow.workflow?.startedAt)}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-md">
                            <p className="text-sm font-medium">Started By</p>
                            <p>{selectedWorkflow.workflow?.startedBy}</p>
                          </div>
                        </div>
                      </div>
                      
                      {selectedWorkflow.approval?.status === 'pending' && 
                       selectedWorkflow.approval.assignedTo.includes(MOCK_USER_ID) && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold mb-2">Required Actions</h3>
                          <div className="space-y-4">
                            <ul className="list-disc list-inside">
                              {selectedWorkflow.approval.requiredActions?.map((action, index) => (
                                <li key={index} className="capitalize">{action}</li>
                              ))}
                            </ul>
                            <div className="flex gap-2 mt-4">
                              <Button 
                                variant="default" 
                                className="w-1/2"
                                onClick={() => setApprovalModalOpen(true)}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                              <Button 
                                variant="destructive" 
                                className="w-1/2"
                                onClick={() => setRejectionModalOpen(true)}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 border rounded-lg">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Workflow Selected</h3>
              <p className="text-center text-muted-foreground mt-1">
                Select a workflow from the list to view details and take actions
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Approval Dialog */}
      <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Workflow Step</DialogTitle>
            <DialogDescription>
              You are approving the "{selectedWorkflow?.step?.name}" step for document "{selectedWorkflow?.workflow?.document?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Comments (Optional)</p>
                <Textarea
                  placeholder="Add any comments or notes about this approval..."
                  className="min-h-[100px]"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setApprovalModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? 'Approving...' : 'Confirm Approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rejection Dialog */}
      <Dialog open={rejectionModalOpen} onOpenChange={setRejectionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Workflow Step</DialogTitle>
            <DialogDescription>
              You are rejecting the "{selectedWorkflow?.step?.name}" step for document "{selectedWorkflow?.workflow?.document?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Reason for Rejection (Required)</p>
                <Textarea
                  placeholder="Provide a detailed explanation for the rejection..."
                  className="min-h-[100px]"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
                {comments.trim() === '' && (
                  <p className="text-xs text-red-500 mt-1">
                    Comments are required for rejection
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRejectionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending || comments.trim() === ''}
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnifiedWorkflowPanel;