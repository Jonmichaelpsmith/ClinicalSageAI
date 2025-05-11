import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Tabs, Tab, Button, Divider } from '@mui/material';
import { FileText, FilePlus } from 'lucide-react';

import AiPoweredWordEditor from '../components/office/AiPoweredWordEditor';

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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
                <Typography variant="h6">IND Application Module 2.5</Typography>
                <Box>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<FilePlus />} 
                    sx={{ mr: 1 }}
                  >
                    New Document
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<FileText />}
                  >
                    Upload Document
                  </Button>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <AiPoweredWordEditor 
                documentId={documentId} 
                templateId={null} 
                regulationType="fda" 
              />
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Template Library
              </Typography>
              <Typography paragraph>
                Browse and manage regulatory document templates for IND applications,
                NDAs, ANDAs, BLAs, and other submission types.
              </Typography>
              <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                Template library functionality coming in next release
              </Box>
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Document History
              </Typography>
              <Typography paragraph>
                View document revisions, compare versions, and restore previous states.
              </Typography>
              <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                Document history functionality coming in next release
              </Box>
            </Box>
          )}
          
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Settings
              </Typography>
              <Typography paragraph>
                Configure Microsoft Office integration, AI assistance, and other preferences.
              </Typography>
              <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                Settings functionality coming in next release
              </Box>
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