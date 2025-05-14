/**
 * UnifiedWorkflowPanel Component
 * 
 * This component provides the main interface for interacting with the unified document workflow system.
 * It displays all document workflows across different modules and allows users to manage approvals,
 * track document status, and view workflow history.
 */

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle, Clock, Download, Eye, FileText, Filter, Inbox, Loader2, Search, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Module icons mapping
const MODULE_ICONS = {
  '510k': <AlertCircle className="h-4 w-4" />,
  'cmc': <FileText className="h-4 w-4" />,
  'ectd': <FileText className="h-4 w-4" />,
  'study': <FileText className="h-4 w-4" />,
  'cer': <FileText className="h-4 w-4" />
};

// Status badge component
const StatusBadge = ({ status }) => {
  switch (status) {
    case 'approved':
      return <Badge variant="success" className="flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
    case 'rejected':
      return <Badge variant="destructive" className="flex items-center"><AlertCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
    case 'in_review':
      return <Badge variant="secondary" className="flex items-center"><Clock className="h-3 w-3 mr-1" /> In Review</Badge>;
    case 'draft':
      return <Badge variant="outline" className="flex items-center">Draft</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Module badge component
const ModuleBadge = ({ moduleType }) => {
  const icon = MODULE_ICONS[moduleType] || <FileText className="h-4 w-4" />;
  
  return (
    <Badge variant="outline" className="flex items-center">
      {icon}
      <span className="ml-1">{moduleType.toUpperCase()}</span>
    </Badge>
  );
};

const UnifiedWorkflowPanel = ({ organizationId, userId }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [comments, setComments] = useState('');
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch pending approvals
  const pendingApprovalsQuery = useQuery({
    queryKey: ['/api/module-integration/pending-approvals', organizationId, userId],
    queryFn: () => apiRequest(`/api/module-integration/pending-approvals?organizationId=${organizationId}&userId=${userId}`),
    enabled: !!organizationId && !!userId,
    refetchInterval: 30000 // Refresh every 30 seconds
  });
  
  // Fetch active workflows
  const activeWorkflowsQuery = useQuery({
    queryKey: ['/api/module-integration/active-workflows', organizationId],
    queryFn: () => apiRequest(`/api/module-integration/active-workflows?organizationId=${organizationId}`),
    enabled: !!organizationId
  });
  
  // Fetch completed workflows
  const completedWorkflowsQuery = useQuery({
    queryKey: ['/api/module-integration/completed-workflows', organizationId],
    queryFn: () => apiRequest(`/api/module-integration/completed-workflows?organizationId=${organizationId}`),
    enabled: !!organizationId
  });
  
  // Fetch workflow history
  const workflowHistoryQuery = useQuery({
    queryKey: ['/api/module-integration/workflow-history', selectedWorkflow?.id],
    queryFn: () => apiRequest(`/api/module-integration/workflow-history/${selectedWorkflow?.id}`),
    enabled: !!selectedWorkflow?.id && isViewingHistory
  });
  
  // Approve workflow step
  const approveStepMutation = useMutation({
    mutationFn: (approvalData) => apiRequest('/api/module-integration/approve-step', {
      method: 'POST',
      body: JSON.stringify(approvalData)
    }),
    onSuccess: () => {
      toast({
        title: 'Step Approved',
        description: 'You have successfully approved this workflow step.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/module-integration/pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/module-integration/active-workflows'] });
      setSelectedWorkflow(null);
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
  
  // Reject workflow step
  const rejectStepMutation = useMutation({
    mutationFn: (rejectionData) => apiRequest('/api/module-integration/reject-step', {
      method: 'POST',
      body: JSON.stringify(rejectionData)
    }),
    onSuccess: () => {
      toast({
        title: 'Step Rejected',
        description: 'You have rejected this workflow step.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/module-integration/pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/module-integration/active-workflows'] });
      setSelectedWorkflow(null);
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
  
  // View document
  const handleViewDocument = (document) => {
    // In a real implementation, this would open the document viewer
    toast({
      title: 'Opening Document',
      description: `Opening "${document.title}" in the document viewer.`
    });
  };
  
  // Handle approval
  const handleApprove = () => {
    if (!selectedWorkflow) return;
    
    approveStepMutation.mutate({
      approvalId: selectedWorkflow.currentApproval.id,
      userId,
      comments
    });
  };
  
  // Handle rejection
  const handleReject = () => {
    if (!selectedWorkflow || !comments.trim()) {
      toast({
        title: 'Comments Required',
        description: 'Please provide comments explaining the reason for rejection.',
        variant: 'destructive'
      });
      return;
    }
    
    rejectStepMutation.mutate({
      approvalId: selectedWorkflow.currentApproval.id,
      userId,
      comments
    });
  };
  
  // Handle search filtering
  const filterBySearch = (items) => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.document.title.toLowerCase().includes(query) ||
      item.document.id.toString().includes(query) ||
      (item.document.metadata && JSON.stringify(item.document.metadata).toLowerCase().includes(query))
    );
  };
  
  // Handle module filtering
  const filterByModule = (items) => {
    if (filterModule === 'all') return items;
    
    return items.filter(item => item.document.moduleType === filterModule);
  };
  
  // Apply all filters
  const applyFilters = (items) => {
    if (!items) return [];
    
    return filterBySearch(filterByModule(items));
  };
  
  // Get relevant data based on active tab
  const getTabData = () => {
    switch (activeTab) {
      case 'pending':
        return pendingApprovalsQuery.data;
      case 'active':
        return activeWorkflowsQuery.data;
      case 'completed':
        return completedWorkflowsQuery.data;
      default:
        return [];
    }
  };
  
  // Check if the tab is loading
  const isTabLoading = () => {
    switch (activeTab) {
      case 'pending':
        return pendingApprovalsQuery.isLoading;
      case 'active':
        return activeWorkflowsQuery.isLoading;
      case 'completed':
        return completedWorkflowsQuery.isLoading;
      default:
        return false;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  // Render workflow items
  const renderWorkflowItems = () => {
    const data = getTabData();
    
    if (!data || data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No workflows found</h3>
          <p className="text-muted-foreground">
            {activeTab === 'pending' ? 'You have no pending approvals.' : 
             activeTab === 'active' ? 'No active workflows found.' :
             'No completed workflows found.'}
          </p>
        </div>
      );
    }
    
    const filteredData = applyFilters(data);
    
    if (filteredData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No matching results</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Module</TableHead>
            <TableHead>Step</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.document.title}</TableCell>
              <TableCell><ModuleBadge moduleType={item.document.moduleType} /></TableCell>
              <TableCell>
                {activeTab === 'pending' ? item.currentApproval.step_name : item.currentStep}
              </TableCell>
              <TableCell><StatusBadge status={item.status} /></TableCell>
              <TableCell>{formatDate(item.updatedAt || item.createdAt)}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDocument(item.document)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {activeTab === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedWorkflow(item)}
                    >
                      Review
                    </Button>
                  )}
                  
                  {activeTab !== 'pending' && (
                    <Dialog onOpenChange={(open) => { if (open) { setSelectedWorkflow(item); setIsViewingHistory(true); } else { setIsViewingHistory(false); } }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          History
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Workflow History</DialogTitle>
                          <DialogDescription>
                            Complete history of approvals and actions for "{item.document.title}"
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="my-4">
                          {workflowHistoryQuery.isLoading ? (
                            <div className="flex justify-center py-8">
                              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                          ) : (
                            <ScrollArea className="h-[400px]">
                              {workflowHistoryQuery.data && workflowHistoryQuery.data.map((historyItem, index) => (
                                <div key={index} className="mb-4 pb-4 border-b">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <StatusBadge status={historyItem.action} />
                                      <span className="ml-2 font-medium">{historyItem.step}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {formatDate(historyItem.timestamp)}
                                    </div>
                                  </div>
                                  <div className="mt-2 flex items-center text-sm">
                                    <User className="h-4 w-4 mr-1" />
                                    <span>{historyItem.user}</span>
                                  </div>
                                  {historyItem.comments && (
                                    <div className="mt-2 text-sm">
                                      <p className="font-medium">Comments:</p>
                                      <p className="italic">{historyItem.comments}</p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </ScrollArea>
                          )}
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => { setIsViewingHistory(false); setSelectedWorkflow(null); }}>
                            Close
                          </Button>
                          {item.document.status === 'approved' && (
                            <Button>
                              <Download className="h-4 w-4 mr-2" />
                              Download Document
                            </Button>
                          )}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Unified Document Workflows</h2>
        <Badge variant="outline" className="flex items-center">
          <span className="ml-1">{organizationId ? `Organization: ${organizationId}` : 'All Organizations'}</span>
        </Badge>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows and documents..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="border rounded-md px-2 py-1 text-sm"
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
          >
            <option value="all">All Modules</option>
            <option value="510k">510(k)</option>
            <option value="cmc">CMC</option>
            <option value="ectd">eCTD</option>
            <option value="study">Study</option>
            <option value="cer">CER</option>
          </select>
        </div>
      </div>
      
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending Approvals
            {pendingApprovalsQuery.data && pendingApprovalsQuery.data.length > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingApprovalsQuery.data.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="border rounded-md p-4">
          {isTabLoading() ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : renderWorkflowItems()}
        </TabsContent>
        
        <TabsContent value="active" className="border rounded-md p-4">
          {isTabLoading() ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : renderWorkflowItems()}
        </TabsContent>
        
        <TabsContent value="completed" className="border rounded-md p-4">
          {isTabLoading() ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : renderWorkflowItems()}
        </TabsContent>
      </Tabs>
      
      {/* Approval dialog */}
      {selectedWorkflow && (
        <Dialog open={!!selectedWorkflow && !isViewingHistory} onOpenChange={(open) => { if (!open) setSelectedWorkflow(null); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Document Approval</DialogTitle>
              <DialogDescription>
                You are reviewing "{selectedWorkflow.document.title}" for the {selectedWorkflow.currentApproval.step_name} step
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Document ID:</p>
                  <p className="text-sm">{selectedWorkflow.document.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Module:</p>
                  <ModuleBadge moduleType={selectedWorkflow.document.moduleType} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Status:</p>
                  <StatusBadge status={selectedWorkflow.document.status} />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="step-description">Step Description:</Label>
                <p className="text-sm" id="step-description">
                  {selectedWorkflow.currentApproval.step_description}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="comments">Comments:</Label>
                <Textarea
                  id="comments"
                  placeholder="Enter your comments here (required for rejection)"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={5}
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Button 
                  onClick={() => handleViewDocument(selectedWorkflow.document)}
                  variant="outline"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Document
                </Button>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setSelectedWorkflow(null)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={rejectStepMutation.isPending || !comments.trim()}
              >
                {rejectStepMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Reject
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={approveStepMutation.isPending}
              >
                {approveStepMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UnifiedWorkflowPanel;