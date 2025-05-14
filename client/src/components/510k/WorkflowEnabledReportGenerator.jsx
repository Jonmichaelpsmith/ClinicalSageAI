import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Card, CardContent, CircularProgress, Snackbar, Alert } from '@mui/material';
import UnifiedWorkflowPanel from '../unified-workflow/UnifiedWorkflowPanel';
import { getDocumentByModuleId, register510kDocument } from '../unified-workflow/registerModuleDocument';
import { getWorkflowTemplates, createDefault510kTemplates } from '../unified-workflow/WorkflowTemplateService';

/**
 * Workflow-Enabled Report Generator Component
 * 
 * This component provides a unified interface for generating reports with
 * integrated workflow capabilities for review and approval process.
 */
const WorkflowEnabledReportGenerator = ({ 
  projectId,
  projectTitle,
  organizationId,
  userId = 1, // Default user ID for demo purposes
  onGenerateReport,
  onViewReport,
  reportStatus
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [document, setDocument] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Fetch document and templates on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch document if it exists
        const existingDocument = await getDocumentByModuleId('510k', projectId, organizationId);
        setDocument(existingDocument);
        
        // Fetch workflow templates
        const templateList = await getWorkflowTemplates('510k', organizationId);
        setTemplates(templateList);
        
        // If no templates, create default ones
        if (templateList.length === 0) {
          await createDefault510kTemplates(organizationId, userId);
          // Refetch templates
          const newTemplates = await getWorkflowTemplates('510k', organizationId);
          setTemplates(newTemplates);
        }
      } catch (err) {
        console.error('Error fetching document data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, organizationId, userId, refreshTrigger]);

  // Register document in the unified system
  const handleRegisterDocument = async () => {
    setRegistering(true);
    setError(null);
    
    try {
      const newDocument = await register510kDocument(
        projectId,
        projectTitle || `510(k) Project ${projectId}`,
        '510k_submission',
        organizationId,
        userId,
        {
          status: reportStatus || 'draft',
          registeredAt: new Date().toISOString()
        }
      );
      
      setDocument(newDocument);
      setNotification({
        open: true,
        message: 'Document registered successfully in the unified workflow system',
        severity: 'success'
      });
      
      // Refresh data
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error registering document:', err);
      setError(err.message);
      setNotification({
        open: true,
        message: `Error registering document: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setRegistering(false);
    }
  };

  // Generate report with workflow tracking
  const handleGenerateReport = async () => {
    setGenerating(true);
    setError(null);
    
    try {
      // If document doesn't exist yet, register it first
      if (!document) {
        await handleRegisterDocument();
      }
      
      // Call the actual report generation function
      await onGenerateReport();
      
      setNotification({
        open: true,
        message: 'Report generated successfully',
        severity: 'success'
      });
      
      // Refresh data
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.message);
      setNotification({
        open: true,
        message: `Error generating report: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setGenerating(false);
    }
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            510(k) Report Generator with Approval Workflow
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Generate and manage your 510(k) submission report with integrated approval workflow.
            Track document versions, review status, and approval history in one place.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateReport}
              disabled={generating}
            >
              {generating ? <CircularProgress size={24} /> : 'Generate Report'}
            </Button>
            
            {onViewReport && (
              <Button
                variant="outlined"
                onClick={onViewReport}
                disabled={!document || reportStatus !== 'completed'}
              >
                View Report
              </Button>
            )}
            
            {!document && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleRegisterDocument}
                disabled={registering}
              >
                {registering ? <CircularProgress size={24} /> : 'Register in Workflow System'}
              </Button>
            )}
          </Box>
          
          {document && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                Document Status: <strong>{document.status}</strong>
              </Typography>
              <Typography variant="body2">
                Last Updated: {new Date(document.updatedAt).toLocaleString()}
              </Typography>
              <Typography variant="body2">
                Version: {document.latestVersion}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
      
      {document && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Workflow Management
            </Typography>
            
            <UnifiedWorkflowPanel
              documentId={document.id}
              moduleType="510k"
              organizationId={organizationId}
              refreshTrigger={refreshTrigger}
            />
          </CardContent>
        </Card>
      )}
      
      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WorkflowEnabledReportGenerator;