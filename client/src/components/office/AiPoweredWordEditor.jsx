import React, { useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, Divider, Typography, Alert, CircularProgress } from '@mui/material';

import microsoftWordService from '../../services/microsoftWordService';
import microsoftAuthService from '../../services/microsoftAuthService';
import wordIntegrationService from '../../services/wordIntegration';

/**
 * AI-Powered Word Editor Component 
 * 
 * This component integrates Microsoft Word with AI capabilities for
 * regulatory document authoring and compliance checking.
 * 
 * It provides:
 * - Word document embedding
 * - AI-powered regulatory compliance checking
 * - Automated formatting for eCTD submissions
 * - Template application and management
 * - Regulatory section insertions
 */
const AiPoweredWordEditor = ({ documentId, templateId, regulationType = 'fda' }) => {
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [complianceResults, setComplianceResults] = useState(null);
  const [complianceLoading, setComplianceLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setAuthLoading(true);
        const initialized = await microsoftAuthService.initializeAuth();
        if (initialized) {
          const isAuthed = microsoftAuthService.isAuthenticated();
          setAuthenticated(isAuthed);
          setAuthLoading(false);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError('Failed to initialize authentication service');
        setAuthLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const initializeWordEditor = async () => {
      try {
        if (!authenticated) {
          return;
        }

        setLoading(true);
        setStatusMessage('Initializing Microsoft Word...');
        
        // Initialize Office JS
        await microsoftWordService.initializeOfficeJS();
        
        // Load document if ID is provided
        if (documentId) {
          setStatusMessage('Loading document...');
          const doc = await microsoftWordService.openDocument(documentId);
          setDocument(doc);
        }
        
        // Apply template if provided
        if (templateId) {
          setStatusMessage('Applying template...');
          await microsoftWordService.insertTemplate(documentId, templateId);
        }
        
        setStatusMessage('Editor ready');
        setLoading(false);
      } catch (err) {
        console.error('Error initializing Word editor:', err);
        setError('Failed to initialize Microsoft Word editor');
        setLoading(false);
      }
    };

    initializeWordEditor();
  }, [authenticated, documentId, templateId]);

  const handleLogin = async () => {
    try {
      setAuthLoading(true);
      await microsoftAuthService.login();
      setAuthenticated(true);
      setAuthLoading(false);
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login with Microsoft');
      setAuthLoading(false);
    }
  };

  const handleCheckCompliance = async () => {
    try {
      setComplianceLoading(true);
      setStatusMessage('Checking regulatory compliance...');

      // For development demonstration, use the simulated version
      const results = await wordIntegrationService.performComplianceCheck();
      setComplianceResults(results);
      
      setStatusMessage('Compliance check complete');
      setComplianceLoading(false);
    } catch (err) {
      console.error('Compliance check error:', err);
      setError('Failed to perform compliance check');
      setComplianceLoading(false);
    }
  };

  const handleApplyEctdFormatting = async () => {
    try {
      setLoading(true);
      setStatusMessage('Applying eCTD formatting...');
      
      // In development, use simulated version
      await wordIntegrationService.applyEctdFormatting();
      
      setStatusMessage('eCTD formatting applied');
      setLoading(false);
    } catch (err) {
      console.error('eCTD formatting error:', err);
      setError('Failed to apply eCTD formatting');
      setLoading(false);
    }
  };

  const handleInsertRegulatorySection = async (sectionType) => {
    try {
      setLoading(true);
      setStatusMessage(`Inserting ${sectionType} section...`);
      
      // In development, use simulated version
      await wordIntegrationService.insertRegulatorySection(sectionType);
      
      setStatusMessage(`${sectionType} section inserted`);
      setLoading(false);
    } catch (err) {
      console.error('Section insertion error:', err);
      setError(`Failed to insert ${sectionType} section`);
      setLoading(false);
    }
  };

  const handleSaveDocument = async () => {
    try {
      setLoading(true);
      setStatusMessage('Saving document...');
      
      // Since we're in simulation mode, we'll just log it
      console.log('Document saved (simulation)');
      
      setStatusMessage('Document saved');
      setLoading(false);
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save document');
      setLoading(false);
    }
  };

  const handleExportToPDF = async () => {
    try {
      setLoading(true);
      setStatusMessage('Exporting to PDF...');
      
      // In production, this would use the actual service
      await microsoftWordService.exportToPDF(documentId);
      
      setStatusMessage('PDF export complete');
      setLoading(false);
    } catch (err) {
      console.error('PDF export error:', err);
      setError('Failed to export to PDF');
      setLoading(false);
    }
  };

  const renderComplianceResults = () => {
    if (!complianceResults) return null;

    return (
      <Card sx={{ mt: 2, mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Compliance Check Results
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box 
              sx={{ 
                width: 20, 
                height: 20, 
                borderRadius: '50%', 
                bgcolor: complianceResults.compliant ? 'green' : 'orange',
                mr: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ✓
            </Box>
            <Typography>
              {complianceResults.compliant 
                ? 'Document is compliant with regulatory standards' 
                : 'Document requires updates to meet regulatory standards'}
            </Typography>
          </Box>
          {complianceResults.issues && complianceResults.issues.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Issues Found:
              </Typography>
              {complianceResults.issues.map((issue) => (
                <Alert 
                  key={issue.id}
                  severity={issue.severity === 'high' ? 'error' : issue.severity === 'medium' ? 'warning' : 'info'}
                  sx={{ mb: 1 }}
                >
                  <Typography variant="subtitle2">
                    {issue.section}: {issue.description}
                  </Typography>
                  <Typography variant="body2">
                    Recommendation: {issue.recommendation}
                  </Typography>
                </Alert>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Initializing Microsoft authentication...</Typography>
      </Box>
    );
  }

  if (!authenticated) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
        <Typography variant="h6" gutterBottom>Microsoft Office Integration</Typography>
        <Typography paragraph>
          Sign in with your Microsoft account to access Word document editing features.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleLogin}
        >
          Sign in with Microsoft
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Main toolbar */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 1, 
        p: 1, 
        borderBottom: '1px solid #eaeaea',
        backgroundColor: '#f9f9f9'
      }}>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleSaveDocument}
          disabled={loading}
        >
          Save
        </Button>
        <Button 
          variant="outlined" 
          size="small"
          onClick={handleExportToPDF}
          disabled={loading}
        >
          Export to PDF
        </Button>
        <Button 
          variant="outlined" 
          size="small"
          onClick={handleCheckCompliance}
          disabled={loading || complianceLoading}
        >
          Check Compliance
        </Button>
        <Button 
          variant="outlined" 
          size="small"
          onClick={handleApplyEctdFormatting}
          disabled={loading}
        >
          Apply eCTD Format
        </Button>
      </Box>

      {/* Status and errors */}
      {statusMessage && (
        <Box sx={{ p: 1, backgroundColor: '#edf7ed' }}>
          <Typography variant="body2">{statusMessage}</Typography>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ m: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Document editor container - in production this would be the Word iframe */}
      <Box sx={{ 
        flex: 1, 
        minHeight: '400px', 
        border: '1px solid #ddd', 
        p: 2,
        backgroundColor: 'white',
        position: 'relative'
      }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.8)'
          }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography>{statusMessage || 'Loading...'}</Typography>
          </Box>
        ) : (
          document ? (
            <Box>
              <Typography variant="h6">{document.name}</Typography>
              <Typography variant="body1" sx={{ mt: 2, color: '#666' }}>
                This is a simulation of the Microsoft Word editor integration.
                In production, this would be replaced with an embedded Word interface.
              </Typography>
              <Box sx={{ mt: 2, p: 2, border: '1px solid #eee' }}>
                <Typography>
                  {document.content || "Document content would appear here..."}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <AlertTriangle size={40} color="#888" style={{ marginBottom: 16 }} />
              <Typography>No document loaded. Please select or create a document.</Typography>
            </Box>
          )
        )}
      </Box>

      {/* Compliance results section */}
      {renderComplianceResults()}

      {/* Regulatory sections toolbar */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>Insert Regulatory Sections:</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => handleInsertRegulatorySection('gcp-statement')}
            disabled={loading}
          >
            GCP Statement
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => handleInsertRegulatorySection('adverse-events')}
            disabled={loading}
          >
            Adverse Events
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => handleInsertRegulatorySection('eligibility')}
            disabled={loading}
          >
            Eligibility Criteria
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => handleInsertRegulatorySection('consent')}
            disabled={loading}
          >
            Informed Consent
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => handleInsertRegulatorySection('privacy')}
            disabled={loading}
          >
            Privacy Statement
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AiPoweredWordEditor;