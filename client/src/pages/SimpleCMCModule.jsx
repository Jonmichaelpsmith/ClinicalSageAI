import React, { useState } from 'react';
import { Container, Paper, Typography, Box, Tab, Tabs } from '@mui/material';
import ICHComplianceChecker from '../components/cmc/ICHComplianceChecker';
import RegulatoryIntelligence from '../components/cmc/RegulatoryIntelligence';
import QualityRiskAssessment from '../components/cmc/QualityRiskAssessment';
import withAuthGuard from '../utils/withAuthGuard';

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

function SimpleCMCModule() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography component="h1" variant="h4" color="primary" gutterBottom>
          CMC Compliance Assistant
        </Typography>
        <Typography variant="body1" paragraph>
          Review and ensure compliance with ICH guidelines and regulatory requirements for Chemistry, Manufacturing, and Controls.
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={value} onChange={handleChange} aria-label="CMC tabs">
            <Tab label="ICH Compliance" {...a11yProps(0)} />
            <Tab label="Regulatory Intelligence" {...a11yProps(1)} />
            <Tab label="Quality Risk Assessment" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <ICHComplianceChecker />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <RegulatoryIntelligence />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <QualityRiskAssessment />
        </TabPanel>
      </Paper>
    </Container>
  );
}

export default withAuthGuard(SimpleCMCModule);