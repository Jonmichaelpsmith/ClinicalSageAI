import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Tabs, Tab, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, CircularProgress, Divider, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, TextField, Chip, Alert } from '@mui/material';
import { 
  getWorkflowTemplates, 
  getDocumentWorkflows, 
  createDocumentWorkflow,
  approveWorkflowStep,
  rejectWorkflowStep
} from './WorkflowTemplateService';

/**
 * Unified Workflow Panel Component
 * 
 * This component provides a user interface for managing document workflows,
 * including starting new workflows, viewing workflow history, and completing
 * approval steps.
 */
const UnifiedWorkflowPanel = ({ 
  documentId, 
  moduleType, 
  organizationId, 
  userId = 1, // Default user ID for demo
  refreshTrigger = 0
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [openApprovalDialog, setOpenApprovalDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [currentApprovalId, setCurrentApprovalId] = useState(null);
  const [comments, setComments] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  
  // Fetch data when component mounts or refreshTrigger changes
  useEffect(() => {
    fetchData();
  }, [documentId, moduleType, organizationId, refreshTrigger]);
  
  // Fetch templates and workflows
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch workflow templates for this module type
      const templateList = await getWorkflowTemplates(moduleType, organizationId);
      setTemplates(templateList);
      
      // Fetch existing workflows for this document
      if (documentId) {
        const workflowList = await getDocumentWorkflows(documentId);
        setWorkflows(workflowList);
      }
    } catch (err) {
      console.error('Error fetching workflow data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Start a new workflow
  const handleStartWorkflow = async (templateId) => {
    setLoading(true);
    setError(null);
    
    try {
      await createDocumentWorkflow(documentId, templateId, userId);
      setOpenTemplateDialog(false);
      await fetchData(); // Refresh data
    } catch (err) {
      console.error('Error creating workflow:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Approve a workflow step
  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await approveWorkflowStep(currentApprovalId, userId, comments);
      setOpenApprovalDialog(false);
      setComments('');
      await fetchData(); // Refresh data
    } catch (err) {
      console.error('Error approving workflow step:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Reject a workflow step
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError('Rejection reason is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await rejectWorkflowStep(currentApprovalId, userId, rejectReason);
      setOpenRejectDialog(false);
      setRejectReason('');
      await fetchData(); // Refresh data
    } catch (err) {
      console.error('Error rejecting workflow step:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Render active workflows
  const renderActiveWorkflows = () => {
    const activeWorkflows = workflows.filter(w => w.status === 'active');
    
    if (activeWorkflows.length === 0) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No active workflows. Start a new workflow to begin the review process.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={() => setOpenTemplateDialog(true)}
          >
            Start New Workflow
          </Button>
        </Box>
      );
    }
    
    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Workflow Name</TableCell>
              <TableCell>Current Step</TableCell>
              <TableCell>Started</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activeWorkflows.map((workflow) => {
              // Find current approval step
              const pendingApproval = workflow.approvals?.find(a => a.status === 'pending');
              
              return (
                <TableRow key={workflow.id}>
                  <TableCell>{workflow.name}</TableCell>
                  <TableCell>
                    {pendingApproval ? (
                      <Box>
                        <Typography variant="body2">
                          {pendingApproval.stepName}
                        </Typography>
                        <Chip 
                          size="small" 
                          label="Awaiting approval" 
                          color="warning" 
                          sx={{ mt: 0.5 }} 
                        />
                      </Box>
                    ) : (
                      <Typography>No pending steps</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(workflow.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {pendingApproval && (
                      <Box>
                        <Button 
                          color="success" 
                          size="small" 
                          variant="outlined"
                          sx={{ mr: 1 }}
                          onClick={() => {
                            setCurrentApprovalId(pendingApproval.id);
                            setOpenApprovalDialog(true);
                          }}
                        >
                          Approve
                        </Button>
                        <Button 
                          color="error" 
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setCurrentApprovalId(pendingApproval.id);
                            setOpenRejectDialog(true);
                          }}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  // Render completed workflows
  const renderCompletedWorkflows = () => {
    const completedWorkflows = workflows.filter(w => w.status === 'completed');
    
    if (completedWorkflows.length === 0) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No completed workflows yet.
          </Typography>
        </Box>
      );
    }
    
    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Workflow Name</TableCell>
              <TableCell>Completed</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Steps</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {completedWorkflows.map((workflow) => {
              // Calculate duration
              const startDate = new Date(workflow.createdAt);
              const endDate = new Date(workflow.updatedAt);
              const durationMs = endDate - startDate;
              const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
              
              return (
                <TableRow key={workflow.id}>
                  <TableCell>{workflow.name}</TableCell>
                  <TableCell>
                    {endDate.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {durationDays} days
                  </TableCell>
                  <TableCell>
                    {workflow.approvals?.length || 0} steps
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  // Render workflow history
  const renderWorkflowHistory = () => {
    if (workflows.length === 0) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No workflow history available.
          </Typography>
        </Box>
      );
    }
    
    // Flatten all approvals from all workflows and sort by date
    const allApprovals = workflows
      .flatMap(workflow => (workflow.approvals || [])
        .map(approval => ({
          ...approval,
          workflowName: workflow.name
        }))
      )
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Workflow</TableCell>
              <TableCell>Step</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Comments</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allApprovals.map((approval) => (
              <TableRow key={approval.id}>
                <TableCell>
                  {new Date(approval.updatedAt).toLocaleString()}
                </TableCell>
                <TableCell>{approval.workflowName}</TableCell>
                <TableCell>{approval.stepName}</TableCell>
                <TableCell>
                  {approval.status === 'approved' && (
                    <Chip size="small" label="Approved" color="success" />
                  )}
                  {approval.status === 'rejected' && (
                    <Chip size="small" label="Rejected" color="error" />
                  )}
                  {approval.status === 'pending' && (
                    <Chip size="small" label="Pending" color="warning" />
                  )}
                </TableCell>
                <TableCell>{approval.comments || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  // Render loading state
  if (loading && workflows.length === 0 && templates.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Active Workflows" />
          <Tab label="Completed" />
          <Tab label="History" />
        </Tabs>
      </Box>
      
      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && renderActiveWorkflows()}
        {activeTab === 1 && renderCompletedWorkflows()}
        {activeTab === 2 && renderWorkflowHistory()}
      </Box>
      
      {/* Template selection dialog */}
      <Dialog open={openTemplateDialog} onClose={() => setOpenTemplateDialog(false)}>
        <DialogTitle>Select Workflow Template</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Choose a workflow template to start the review process.
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            {templates.map((template) => (
              <Box key={template.id} sx={{ mb: 2 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">{template.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {template.description}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {template.steps?.length || 0} approval steps
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={() => handleStartWorkflow(template.id)}
                  >
                    Start Workflow
                  </Button>
                </Paper>
              </Box>
            ))}
            
            {templates.length === 0 && (
              <Typography>No templates available.</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTemplateDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      
      {/* Approval dialog */}
      <Dialog open={openApprovalDialog} onClose={() => setOpenApprovalDialog(false)}>
        <DialogTitle>Approve Step</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Add optional comments for this approval.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="comments"
            label="Comments"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApprovalDialog(false)}>Cancel</Button>
          <Button onClick={handleApprove} color="success" variant="contained">
            Approve
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reject dialog */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)}>
        <DialogTitle>Reject Step</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a reason for rejecting this step.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="rejectReason"
            label="Rejection Reason"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            required
            error={error && !rejectReason.trim()}
            helperText={error && !rejectReason.trim() ? "Rejection reason is required" : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleReject} 
            color="error" 
            variant="contained"
            disabled={!rejectReason.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UnifiedWorkflowPanel;