import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Tabs, Tab, Button, Divider, Grid } from '@mui/material';

import AiPoweredWordEditor from '../components/office/AiPoweredWordEditor';
import DocumentUploader from '../components/office/DocumentUploader';

/**
 * CoAuthor Page 
 * 
 * This page showcases the eCTD Co-Author module with embedded Microsoft Word
 * and AI-powered compliance checking for IND applications.
 */
const CoAuthor = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [documentId, setDocumentId] = useState('doc-123');
  const [templateId, setTemplateId] = useState('template-fda-ind');
  const [showUploader, setShowUploader] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Pre-loaded document data for faster initial rendering
  const preloadedDocuments = [
    {
      id: 'doc-123',
      name: 'IND Application Module 2.5',
      documentType: 'word',
      ectdModule: 'm2-5',
      status: 'draft',
      createdAt: '2025-05-01T10:30:00Z',
      updatedAt: '2025-05-10T15:45:00Z',
      description: 'Clinical overview for IND submission'
    },
    {
      id: 'doc-456',
      name: 'Protocol Synopsis Template',
      documentType: 'word',
      ectdModule: 'm4',
      status: 'approved',
      createdAt: '2025-04-15T09:20:00Z',
      updatedAt: '2025-04-20T14:35:00Z',
      description: 'Standardized protocol synopsis template for clinical trials'
    },
    {
      id: 'doc-789',
      name: 'Adverse Events Reporting Form',
      documentType: 'word',
      ectdModule: 'm5',
      status: 'published',
      createdAt: '2025-03-10T11:10:00Z',
      updatedAt: '2025-04-05T16:25:00Z',
      description: 'Standard form for adverse event documentation'
    }
  ];
  
  useEffect(() => {
    // Initialize with preloaded documents for immediate display
    setDocuments(preloadedDocuments);
    setSelectedDocument(preloadedDocuments.find(doc => doc.id === documentId) || preloadedDocuments[0]);
    
    // Then load any additional documents if needed (for real API implementation)
    loadAdditionalDocuments();
  }, []);

  const loadAdditionalDocuments = () => {
    // This would fetch additional documents from the API
    // For now, we'll just use our preloaded data
    // No additional loading needed since we're using preloaded data
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Hide uploader when switching tabs
    setShowUploader(false);
  };

  const handleNewDocument = () => {
    // Create a new blank document
    const newDocument = {
      id: `doc-${Date.now()}`,
      name: 'Untitled Document',
      description: '',
      documentType: 'word',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ectdModule: 'm2-5'
    };
    
    setDocuments([newDocument, ...documents]);
    setSelectedDocument(newDocument);
    setDocumentId(newDocument.id);
    setShowUploader(false);
  };

  const handleUploadClick = () => {
    setShowUploader(true);
  };

  const handleUploadComplete = (documentInfo) => {
    // Add the uploaded document to the list
    const newDocument = {
      ...documentInfo,
      id: `doc-${Date.now()}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setDocuments([newDocument, ...documents]);
    setSelectedDocument(newDocument);
    setDocumentId(newDocument.id);
    setShowUploader(false);
  };

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
    setDocumentId(document.id);
    setActiveTab(0);
    setShowUploader(false);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
          eCTD Co-Author
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Collaborative authoring of regulatory documents with embedded Microsoft Word and AI assistance
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Document Editor" />
          <Tab label="Template Library" />
          <Tab label="Document History" />
          <Tab label="Settings" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">
                  {selectedDocument ? selectedDocument.name : 'IND Application Module 2.5'}
                </Typography>
                <Box>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ mr: 1 }}
                    onClick={handleNewDocument}
                  >
                    New Document
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={handleUploadClick}
                  >
                    Upload Document
                  </Button>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              {showUploader ? (
                <DocumentUploader onUploadComplete={handleUploadComplete} />
              ) : (
                <AiPoweredWordEditor 
                  documentId={documentId} 
                  documentType={selectedDocument?.documentType || 'word'} 
                  regulationType="fda" 
                />
              )}
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Template Library</Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                >
                  Create Template
                </Button>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                {[
                  { id: 'tpl-1', name: 'ICH E3 Clinical Study Report', type: 'CSR', module: 'm5', description: 'Full CSR template following ICH E3 guidance' },
                  { id: 'tpl-2', name: 'ICH E6 Protocol Template', type: 'Protocol', module: 'm5', description: 'Clinical trial protocol following ICH GCP guidance' },
                  { id: 'tpl-3', name: 'Module 2.5 Clinical Overview', type: 'CTD', module: 'm2-5', description: 'Template for eCTD Module 2.5 (Clinical Overview)' },
                  { id: 'tpl-4', name: 'Investigator Brochure Template', type: 'IB', module: 'm1', description: 'Standard template for Investigator Brochure' },
                  { id: 'tpl-5', name: 'Safety Narrative Template', type: 'Safety', module: 'm5', description: 'Template for patient safety narratives' },
                  { id: 'tpl-6', name: 'FDA Form 1572', type: 'Form', module: 'm1', description: 'Statement of Investigator form for FDA submission' }
                ].map(template => (
                  <Grid item xs={12} md={6} lg={4} key={template.id}>
                    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {template.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        Type: {template.type} | Module: {template.module}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
                        {template.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button size="small" variant="outlined">
                          Use Template
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Document History</Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                >
                  Export History
                </Button>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Your Documents
              </Typography>
              
              {documents.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {documents.map(document => (
                    <Paper 
                      key={document.id} 
                      sx={{ 
                        p: 2, 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        border: selectedDocument?.id === document.id ? '2px solid' : '1px solid',
                        borderColor: selectedDocument?.id === document.id ? 'primary.main' : 'divider'
                      }}
                      onClick={() => handleDocumentSelect(document)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {document.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Module: {document.ectdModule || 'Not specified'} | Status: {document.status}
                          </Typography>
                          {document.description && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {document.description}
                            </Typography>
                          )}
                        </Box>
                        <Box>
                          <Typography variant="caption" display="block" textAlign="right" color="text.secondary">
                            Last updated: {new Date(document.updatedAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                  No documents found. Create a new document or upload one to get started.
                </Box>
              )}
            </Box>
          )}
          
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                Microsoft Office Integration
              </Typography>
              <Typography paragraph>
                Configure Microsoft Office integration settings including authentication, document storage location,
                and synchronization preferences.
              </Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
                Regulatory Compliance Settings
              </Typography>
              <Typography paragraph>
                Configure which regulatory guidelines (FDA, EMA, ICH) to check documents against
                and set compliance thresholds for automated validation.
              </Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
                AI Assistant Configuration
              </Typography>
              <Typography paragraph>
                Adjust AI assistant behavior, including preferred writing style, regulatory focus,
                and content suggestions sensitivity.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          About eCTD Co-Author
        </Typography>
        <Typography paragraph>
          The eCTD Co-Author module provides a seamless integration of Microsoft Word with 
          AI-powered compliance checking for regulatory documents. It enables subject matter 
          experts to create, edit, and collaborate on regulatory documents while ensuring 
          compliance with FDA, EMA, and ICH standards.
        </Typography>
        <Typography paragraph>
          Key features include document templates for various submission types, automated 
          formatting for eCTD submissions, AI-powered compliance checking, and integration 
          with regulatory databases for reference information.
        </Typography>
      </Box>
    </Container>
  );
};

export default CoAuthor;