import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Box, Button, Tab, Tabs } from '@mui/material';
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
      </Paper>
    </Container>
  );
}