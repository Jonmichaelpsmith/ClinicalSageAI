import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Divider, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';

// Service imports
import { 
  openWordDocument,
  insertRegulatorySection,
  applyEctdFormatting,
  performComplianceCheck
} from '../../services/wordIntegration';

/**
 * AI-Powered Word Editor Component
 * 
 * This component provides a Microsoft Word-like editing experience with AI
 * compliance capabilities specifically tailored for regulatory document authoring.
 */
const AiPoweredWordEditor = ({ documentId, documentType, initialContent, readOnly }) => {
  // Editor state
  const [content, setContent] = useState(initialContent || '');
  const [docTitle, setDocTitle] = useState('Untitled Document');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [editorMode, setEditorMode] = useState('edit'); // 'edit', 'review', 'ai-assist'
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [regulatorySections, setRegulatorySections] = useState([]);
  const [complianceResults, setComplianceResults] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  
  // References
  const editorRef = useRef(null);
  
  // Simulated Microsoft Word interface initialized state
  const [wordInitialized, setWordInitialized] = useState(false);
  
  useEffect(() => {
    // Initialize editor
    const initEditor = async () => {
      try {
        // Simulate Word initialization
        setTimeout(() => {
          setWordInitialized(true);
          setNotification({
            open: true,
            message: 'Word editor initialized successfully',
            severity: 'success'
          });
        }, 1500);
        
        // Load templates
        loadTemplates();
        
        // Load regulatory sections
        loadRegulatorySections();
        
        // If documentId is provided, load the document
        if (documentId) {
          loadDocument(documentId);
        }
      } catch (error) {
        console.error('Failed to initialize editor:', error);
        setNotification({
          open: true,
          message: 'Failed to initialize Microsoft Word editor',
          severity: 'error'
        });
      }
    };
    
    initEditor();
  }, [documentId]);
  
  const loadDocument = async (id) => {
    try {
      // In a real implementation, this would use Office.js to load the document
      // For now, we'll simulate it
      setContent('Loading document content...');
      
      // Simulate API call delay
      setTimeout(() => {
        setContent(
          `# ICH E3 Clinical Study Report
          
## 1. TITLE PAGE
Study Title: Randomized, Double-Blind, Placebo-Controlled Phase 3 Study of Drug ABC in Patients with Condition XYZ
Protocol Number: ABC-3001
Study Phase: Phase 3
Study Period: January 2023 - December 2024
          
## 2. SYNOPSIS
This study evaluated the efficacy and safety of Drug ABC compared to placebo in patients with Condition XYZ.

## 3. TABLE OF CONTENTS
1. Title Page
2. Synopsis
3. Table of Contents
4. Introduction
5. Study Objectives
6. Investigational Plan
7. Efficacy Results
8. Safety Results
9. Discussion and Conclusions
10. References

## 4. INTRODUCTION
Condition XYZ is a chronic disease affecting approximately 5% of the adult population worldwide...`
        );
        setDocTitle('CSR-ABC-3001-Phase3.docx');
      }, 1000);
    } catch (error) {
      console.error('Failed to load document:', error);
      setNotification({
        open: true,
        message: 'Failed to load document',
        severity: 'error'
      });
    }
  };
  
  const loadTemplates = async () => {
    // Simulate loading templates from API
    setTemplates([
      { id: 'ich-e3', name: 'ICH E3 Clinical Study Report', description: 'Full CSR template following ICH E3 guidance' },
      { id: 'ich-e6', name: 'ICH E6 Protocol Template', description: 'Clinical trial protocol following ICH GCP guidance' },
      { id: 'fda-1572', name: 'FDA Form 1572', description: 'Statement of Investigator form for FDA submission' },
      { id: 'informed-consent', name: 'Informed Consent Template', description: 'Standard informed consent document with all required elements' },
      { id: 'safety-narrative', name: 'Safety Narrative Template', description: 'Template for adverse event narratives' }
    ]);
  };
  
  const loadRegulatorySections = async () => {
    // Simulate loading regulatory sections from API
    setRegulatorySections([
      { id: 'gcp-statement', name: 'GCP Compliance Statement', description: 'Standard statement of compliance with Good Clinical Practice' },
      { id: 'adverse-events', name: 'Adverse Events Reporting', description: 'Standard language for adverse events reporting methodology' },
      { id: 'eligibility', name: 'Eligibility Criteria', description: 'Common inclusion/exclusion criteria format' },
      { id: 'consent', name: 'Informed Consent Process', description: 'Standard description of informed consent process' },
      { id: 'privacy', name: 'Privacy & Confidentiality', description: 'Standard privacy and confidentiality protection language' },
    ]);
  };
  
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful save
      setNotification({
        open: true,
        message: 'Document saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to save document:', error);
      setNotification({
        open: true,
        message: 'Failed to save document',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleExport = async () => {
    try {
      setNotification({
        open: true,
        message: 'Exporting document to PDF...',
        severity: 'info'
      });
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setNotification({
        open: true,
        message: 'Document exported successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to export document:', error);
      setNotification({
        open: true,
        message: 'Failed to export document',
        severity: 'error'
      });
    }
  };
  
  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      // Simulate template application
      const template = templates.find(t => t.id === selectedTemplate);
      setNotification({
        open: true,
        message: `Applying template: ${template.name}`,
        severity: 'info'
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update content based on selected template
      if (selectedTemplate === 'ich-e3') {
        setContent(
          `# ICH E3 Clinical Study Report
          
## 1. TITLE PAGE
Study Title: [Enter Study Title]
Protocol Number: [Enter Protocol Number]
Study Phase: [Enter Study Phase]
Study Period: [Enter Study Period]
          
## 2. SYNOPSIS
[Enter Brief Study Synopsis]

## 3. TABLE OF CONTENTS
1. Title Page
2. Synopsis
3. Table of Contents
4. Introduction
5. Study Objectives
6. Investigational Plan
7. Efficacy Results
8. Safety Results
9. Discussion and Conclusions
10. References

## 4. INTRODUCTION
[Enter Introduction Text]

## 5. STUDY OBJECTIVES
[Enter Primary and Secondary Objectives]

## 6. INVESTIGATIONAL PLAN
[Enter Study Design Details]

## 7. EFFICACY RESULTS
[Enter Efficacy Results]

## 8. SAFETY RESULTS
[Enter Safety Results]

## 9. DISCUSSION AND CONCLUSIONS
[Enter Discussion and Conclusions]

## 10. REFERENCES
[Enter References]`
        );
      } else if (selectedTemplate === 'ich-e6') {
        setContent(
          `# Clinical Trial Protocol
          
## 1. GENERAL INFORMATION
Protocol Title: [Enter Protocol Title]
Protocol Number: [Enter Protocol Number]
Phase: [Enter Study Phase]
Version: 1.0
Date: [Enter Date]

## 2. SYNOPSIS
[Enter Brief Protocol Synopsis]

## 3. BACKGROUND AND RATIONALE
[Enter Background Information and Study Rationale]

## 4. STUDY OBJECTIVES
[Enter Primary and Secondary Objectives]

## 5. STUDY DESIGN
[Enter Study Design Details]

## 6. ELIGIBILITY CRITERIA
### 6.1 Inclusion Criteria
1. [Enter Inclusion Criterion 1]
2. [Enter Inclusion Criterion 2]
3. [Enter Inclusion Criterion 3]

### 6.2 Exclusion Criteria
1. [Enter Exclusion Criterion 1]
2. [Enter Exclusion Criterion 2]
3. [Enter Exclusion Criterion 3]

## 7. TREATMENT PLAN
[Enter Treatment Details]

## 8. SAFETY ASSESSMENTS
[Enter Safety Assessment Procedures]

## 9. EFFICACY ASSESSMENTS
[Enter Efficacy Assessment Procedures]

## 10. DATA MANAGEMENT AND STATISTICAL ANALYSIS
[Enter Data Management and Statistical Analysis Plans]`
        );
      } else {
        // For other templates, just notify but don't change content
        setNotification({
          open: true,
          message: 'Template applied successfully',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Failed to apply template:', error);
      setNotification({
        open: true,
        message: 'Failed to apply template',
        severity: 'error'
      });
    } finally {
      setSelectedTemplate('');
    }
  };
  
  const handleInsertSection = async () => {
    if (!selectedSection) return;
    
    try {
      // Simulate section insertion
      const section = regulatorySections.find(s => s.id === selectedSection);
      setNotification({
        open: true,
        message: `Inserting section: ${section.name}`,
        severity: 'info'
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update content by adding the section
      let sectionContent = '';
      
      if (selectedSection === 'gcp-statement') {
        sectionContent = `\n\n## GCP COMPLIANCE STATEMENT
This study was conducted in accordance with the principles of the Declaration of Helsinki and Good Clinical Practice guidelines as defined by the International Conference on Harmonisation.`;
      } else if (selectedSection === 'adverse-events') {
        sectionContent = `\n\n## ADVERSE EVENTS REPORTING
All adverse events were collected and recorded throughout the study period, from the time of informed consent until the end of follow-up. Events were categorized according to severity, causality, and seriousness in accordance with regulatory guidance.`;
      } else if (selectedSection === 'eligibility') {
        sectionContent = `\n\n## ELIGIBILITY CRITERIA
### Inclusion Criteria
1. Adults aged 18 years or older
2. Diagnosis confirmed by [specific criteria]
3. Able to provide informed consent

### Exclusion Criteria
1. Participation in another clinical trial within 30 days
2. Known hypersensitivity to study medication or components
3. Significant medical condition that would interfere with study participation`;
      } else if (selectedSection === 'consent') {
        sectionContent = `\n\n## INFORMED CONSENT
Written informed consent was obtained from all study participants prior to performing any study-related procedures. The consent process included a thorough explanation of the study procedures, potential risks and benefits, alternatives to participation, and the voluntary nature of participation.`;
      } else if (selectedSection === 'privacy') {
        sectionContent = `\n\n## PRIVACY AND CONFIDENTIALITY
All participant information was handled in strict confidence in accordance with applicable data protection laws. Participant data was de-identified using unique identifiers, and all study documents were stored securely with access limited to authorized personnel.`;
      }
      
      setContent(content + sectionContent);
      
      setNotification({
        open: true,
        message: 'Section inserted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to insert section:', error);
      setNotification({
        open: true,
        message: 'Failed to insert section',
        severity: 'error'
      });
    } finally {
      setSelectedSection('');
    }
  };
  
  const handleApplyFormatting = async () => {
    try {
      setNotification({
        open: true,
        message: 'Applying eCTD formatting...',
        severity: 'info'
      });
      
      // Simulate formatting process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, this would use Office.js to apply formatting
      // For now, just show a notification
      setNotification({
        open: true,
        message: 'eCTD formatting applied successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to apply formatting:', error);
      setNotification({
        open: true,
        message: 'Failed to apply formatting',
        severity: 'error'
      });
    }
  };
  
  const handleComplianceCheck = async () => {
    try {
      setChecking(true);
      
      setNotification({
        open: true,
        message: 'Performing regulatory compliance check...',
        severity: 'info'
      });
      
      // Simulate compliance check process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate compliance check results
      const results = {
        score: 85,
        compliant: true,
        issues: [
          {
            id: 'missing-references',
            section: 'References',
            description: 'References section appears to be incomplete',
            recommendation: 'Add all references cited in the document to the References section',
            severity: 'medium'
          },
          {
            id: 'abbreviations',
            section: 'Various Sections',
            description: 'Some abbreviations are used without definition',
            recommendation: 'Define all abbreviations at first use',
            severity: 'low'
          }
        ]
      };
      
      setComplianceResults(results);
      
      setNotification({
        open: true,
        message: `Compliance check complete: Score ${results.score}%`,
        severity: results.compliant ? 'success' : 'warning'
      });
    } catch (error) {
      console.error('Failed to perform compliance check:', error);
      setNotification({
        open: true,
        message: 'Failed to perform compliance check',
        severity: 'error'
      });
    } finally {
      setChecking(false);
    }
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Render loading state while word is initializing
  if (!wordInitialized) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '500px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Initializing Microsoft Word...
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Editor Toolbar */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 1, 
          mb: 2, 
          display: 'flex', 
          flexDirection: 'row',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, md: 0 } }}>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            {docTitle}
          </Typography>
          
          <Button 
            variant="contained" 
            size="small" 
            color="primary" 
            onClick={handleSave} 
            disabled={saving || readOnly}
            sx={{ mr: 1 }}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
          
          <Button 
            variant="outlined" 
            size="small"
            onClick={handleExport}
            sx={{ mr: 1 }}
          >
            Export PDF
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150, mr: 1 }}>
            <InputLabel id="template-select-label">Apply Template</InputLabel>
            <Select
              labelId="template-select-label"
              value={selectedTemplate}
              label="Apply Template"
              onChange={(e) => setSelectedTemplate(e.target.value)}
              disabled={readOnly}
            >
              <MenuItem value=""><em>Select...</em></MenuItem>
              {templates.map((template) => (
                <MenuItem key={template.id} value={template.id}>{template.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleApplyTemplate}
            disabled={!selectedTemplate || readOnly}
            sx={{ mr: 1 }}
          >
            Apply
          </Button>
          
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleComplianceCheck}
            disabled={checking}
            sx={{ mr: 1 }}
          >
            {checking ? 'Checking...' : 'Check Compliance'}
          </Button>
        </Box>
      </Paper>
      
      {/* Regulatory Tools */}
      <Paper elevation={1} sx={{ p: 1, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Regulatory Tools
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 200, mr: 1 }}>
            <InputLabel id="section-select-label">Insert Regulatory Section</InputLabel>
            <Select
              labelId="section-select-label"
              value={selectedSection}
              label="Insert Regulatory Section"
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={readOnly}
            >
              <MenuItem value=""><em>Select...</em></MenuItem>
              {regulatorySections.map((section) => (
                <MenuItem key={section.id} value={section.id}>{section.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleInsertSection}
            disabled={!selectedSection || readOnly}
            sx={{ mr: 1 }}
          >
            Insert
          </Button>
          
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleApplyFormatting}
            disabled={readOnly}
          >
            Apply eCTD Formatting
          </Button>
        </Box>
      </Paper>
      
      {/* Main Editor */}
      <Paper elevation={3} sx={{ p: 2, mb: 2, flexGrow: 1 }}>
        <TextField
          multiline
          fullWidth
          minRows={15}
          maxRows={30}
          value={content}
          onChange={handleContentChange}
          variant="outlined"
          InputProps={{
            readOnly: readOnly,
            sx: { 
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              whiteSpace: 'pre-wrap'
            }
          }}
        />
      </Paper>
      
      {/* Compliance Results */}
      {complianceResults && (
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Compliance Check Results
            </Typography>
            
            <Chip 
              label={`Score: ${complianceResults.score}%`} 
              color={complianceResults.compliant ? "success" : "warning"}
              variant="outlined"
            />
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {complianceResults.issues.length === 0 ? (
            <Alert severity="success">
              No compliance issues found.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {complianceResults.issues.map((issue) => (
                <Grid item xs={12} key={issue.id}>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={"▼"}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Typography sx={{ flexGrow: 1 }}>{issue.section}: {issue.description}</Typography>
                        <Chip 
                          label={issue.severity} 
                          size="small"
                          color={issue.severity === 'high' ? 'error' : issue.severity === 'medium' ? 'warning' : 'info'}
                          sx={{ ml: 2 }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Alert severity="info">
                        <Typography variant="subtitle2">Recommendation:</Typography>
                        <Typography variant="body2">{issue.recommendation}</Typography>
                      </Alert>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}
      
      {/* Notifications */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AiPoweredWordEditor;