import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Box, Button, Tab, Tabs, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import BatchAnalysisPanel from '../components/cmc/BatchAnalysisPanel';
import FormulationPredictor from '../components/cmc/FormulationPredictor';
import SpecificationAnalyzer from '../components/cmc/SpecificationAnalyzer';
import StabilityDataAnalyzer from '../components/cmc/StabilityDataAnalyzer';
import ICHComplianceChecker from '../components/cmc/ICHComplianceChecker';
import RegulatoryIntelligence from '../components/cmc/RegulatoryIntelligence';
import QualityRiskAssessment from '../components/cmc/QualityRiskAssessment';
import MethodValidationGenerator from '../components/cmc/MethodValidationGenerator';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function CMCModule() {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiSettings, setAiSettings] = useState({
    preferred_guidance: '',
    region_priority: '',
    terminology_overrides: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/cmc/ai-settings');
        if (res.ok) {
          const data = await res.json();
          setAiSettings({
            preferred_guidance: data.preferred_guidance || '',
            region_priority: (data.region_priority || []).join(', '),
            terminology_overrides: JSON.stringify(data.terminology_overrides || {}, null, 2)
          });
        }
      } catch (err) {
        console.error('Failed to load AI settings', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    // Initialize any CMC-specific data or configurations here
    document.title = "TrialSage | CMC Module";
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography component="h1" variant="h4" color="primary" gutterBottom>
          Chemistry, Manufacturing, and Controls (CMC)
        </Typography>
        <Typography variant="body1" paragraph>
          Streamline your CMC documentation, specifications analysis, and regulatory compliance with our comprehensive tools.
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={value} onChange={handleChange} aria-label="CMC tabs">
            <Tab label="Batch Analysis" {...a11yProps(0)} />
            <Tab label="Specifications" {...a11yProps(1)} />
            <Tab label="Stability Data" {...a11yProps(2)} />
            <Tab label="Formulation" {...a11yProps(3)} />
            <Tab label="Method Validation" {...a11yProps(4)} />
            <Tab label="ICH Compliance" {...a11yProps(5)} />
            <Tab label="Regulatory Intelligence" {...a11yProps(6)} />
            <Tab label="Quality Risk Assessment" {...a11yProps(7)} />
            <Tab label="AI Settings" {...a11yProps(8)} />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <BatchAnalysisPanel />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <SpecificationAnalyzer />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <StabilityDataAnalyzer />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <FormulationPredictor />
        </TabPanel>
        <TabPanel value={value} index={4}>
          <MethodValidationGenerator />
        </TabPanel>
        <TabPanel value={value} index={5}>
          <ICHComplianceChecker />
        </TabPanel>
        <TabPanel value={value} index={6}>
          <RegulatoryIntelligence />
        </TabPanel>
        <TabPanel value={value} index={7}>
          <QualityRiskAssessment />
        </TabPanel>
        <TabPanel value={value} index={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Preferred Guidance"
                fullWidth
                value={aiSettings.preferred_guidance}
                onChange={(e) => setAiSettings({ ...aiSettings, preferred_guidance: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Region Priority (comma separated)"
                fullWidth
                value={aiSettings.region_priority}
                onChange={(e) => setAiSettings({ ...aiSettings, region_priority: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Terminology Overrides (JSON)"
                fullWidth
                multiline
                minRows={4}
                value={aiSettings.terminology_overrides}
                onChange={(e) => setAiSettings({ ...aiSettings, terminology_overrides: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={async () => {
                const payload = {
                  preferred_guidance: aiSettings.preferred_guidance || null,
                  region_priority: aiSettings.region_priority.split(',').map(r => r.trim()).filter(Boolean),
                  terminology_overrides: (() => { try { return JSON.parse(aiSettings.terminology_overrides || '{}'); } catch { return {}; } })()
                };
                await fetch('/api/cmc/ai-settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
              }}>
                Save Settings
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
}
