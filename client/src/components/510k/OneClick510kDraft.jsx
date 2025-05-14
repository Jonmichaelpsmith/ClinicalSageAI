import React, { useState } from 'react';
import { Button, Typography, Box, TextField, Card, CardContent, CircularProgress, Snackbar, Alert, Grid } from '@mui/material';
import { register510kDocument } from '../unified-workflow/registerModuleDocument';
import WorkflowEnabledReportGenerator from './WorkflowEnabledReportGenerator';

/**
 * One-Click 510(k) Draft Generator
 * 
 * This component provides a simplified interface for generating 510(k) drafts
 * with integrated workflow capabilities.
 */
const OneClick510kDraft = ({ organizationId = 1, userId = 1 }) => {
  const [deviceName, setDeviceName] = useState('');
  const [predicateDevice, setPredicateDevice] = useState('');
  const [indication, setIndication] = useState('');
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [error, setError] = useState(null);
  const [reportStatus, setReportStatus] = useState('pending');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Generate a 510(k) draft report
  const handleGenerateReport = async () => {
    if (!deviceName || !predicateDevice || !indication) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Generate a unique project ID if none exists
      const newProjectId = projectId || `FDA510K-${Date.now()}`;
      const title = projectTitle || `510(k) for ${deviceName}`;
      
      // Set project information
      setProjectId(newProjectId);
      setProjectTitle(title);
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setReportStatus('completed');
      
      setNotification({
        open: true,
        message: `510(k) draft generated successfully for ${deviceName}`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.message);
      setNotification({
        open: true,
        message: `Error generating report: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle viewing the report
  const handleViewReport = () => {
    // Implement your report viewing logic here
    window.alert('Report viewing functionality would be implemented here');
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            One-Click 510(k) Draft Generator
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Generate a comprehensive 510(k) submission draft with device information,
            predicate device comparison, and intended use details. The document will be 
            registered in the unified workflow system for review and approval.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {!projectId ? (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Device Name"
                  variant="outlined"
                  fullWidth
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Predicate Device"
                  variant="outlined"
                  fullWidth
                  value={predicateDevice}
                  onChange={(e) => setPredicateDevice(e.target.value)}
                  required
                  helperText="Enter the name of a legally marketed device to which you claim equivalence"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Intended Use / Indication"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  value={indication}
                  onChange={(e) => setIndication(e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Project Title"
                  variant="outlined"
                  fullWidth
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder={deviceName ? `510(k) for ${deviceName}` : ''}
                  helperText="Optional - a title will be generated if none is provided"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleGenerateReport}
                  disabled={loading || !deviceName || !predicateDevice || !indication}
                  sx={{ mt: 1 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Generate 510(k) Draft'}
                </Button>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">
                Project: {projectTitle}
              </Typography>
              <Typography variant="body1">
                ID: {projectId}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Status: {reportStatus}
              </Typography>
              
              <Button 
                variant="outlined" 
                onClick={() => {
                  setProjectId(null);
                  setReportStatus('pending');
                }}
                sx={{ mr: 1 }}
              >
                Start New Project
              </Button>
              
              <Button
                variant="contained"
                onClick={handleViewReport}
                disabled={reportStatus !== 'completed'}
              >
                View Report
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
      
      {projectId && (
        <WorkflowEnabledReportGenerator
          projectId={projectId}
          projectTitle={projectTitle}
          organizationId={organizationId}
          userId={userId}
          onGenerateReport={handleGenerateReport}
          onViewReport={handleViewReport}
          reportStatus={reportStatus}
        />
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

export default OneClick510kDraft;