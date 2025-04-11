import express from 'express';

const router = express.Router();

// Generate Statistical Analysis Plan (SAP)
router.post('/generate', express.json(), async (req, res) => {
  try {
    const protocolData = req.body;

    if (!protocolData || typeof protocolData !== 'object') {
      return res.status(400).send('Valid protocol data is required');
    }

    const sapContent = generateSAP(protocolData);
    return res.send(sapContent);
  } catch (error: any) {
    console.error('Error generating SAP:', error);
    return res.status(500).send(error.message || 'Failed to generate SAP');
  }
});

export { router as sapRoutes };

// Helper function to generate a SAP based on protocol data
function generateSAP(protocol: any): string {
  const {
    title = 'Untitled Study',
    indication = 'Unspecified Indication',
    phase = '2',
    sample_size = 100,
    duration_weeks = 24,
    endpoint_primary = 'Clinical response',
    secondary_endpoints = [],
    arms = ['Treatment', 'Control'],
    randomization = '1:1',
    blinding = 'Double-blind',
    statistical_methods = 'To be determined',
    dropout_rate = 0.2
  } = protocol;

  return `
# STATISTICAL ANALYSIS PLAN

## ${title.toUpperCase()}

### 1. STUDY OVERVIEW
- **Indication:** ${indication}
- **Phase:** ${phase}
- **Design:** ${blinding}, ${randomization} randomized controlled trial
- **Duration:** ${duration_weeks} weeks
- **Sample Size:** ${sample_size} participants

### 2. STATISTICAL METHODS

#### 2.1 Primary Analysis
- **Primary Endpoint:** ${endpoint_primary}
- **Analysis Method:** The primary endpoint will be analyzed using a mixed-effects model for repeated measures (MMRM). The model will include treatment, visit, and treatment-by-visit interaction as fixed effects, with baseline measurement as a covariate.
- **Missing Data Handling:** Primary analysis will use multiple imputation for missing data. Sensitivity analyses will include LOCF and observed cases.
- **Significance Level:** Two-sided alpha of 0.05 will be used to declare statistical significance.

#### 2.2 Secondary Analyses
${secondary_endpoints.map((endpoint: string) => `- **${endpoint}:** Will be analyzed using appropriate statistical methods based on data type and distribution.`).join('\n')}
${secondary_endpoints.length === 0 ? '- Secondary endpoints will be analyzed using methods appropriate for the endpoint type.' : ''}

#### 2.3 Subgroup Analyses
- Age groups: <65 years, ≥65 years
- Gender
- Disease severity at baseline
- Geographic region

### 3. SAMPLE SIZE JUSTIFICATION
Based on an expected difference of 15% between treatment arms, ${sample_size} subjects (${Math.round(sample_size / 2)} per arm) will provide 90% power to detect this difference with a two-sided alpha of 0.05. Accounting for an anticipated dropout rate of ${Math.round(dropout_rate * 100)}%, a total of ${Math.round(sample_size / (1 - dropout_rate))} subjects will be enrolled.

### 4. STUDY POPULATIONS
- **Intent-to-Treat (ITT):** All randomized subjects
- **Modified Intent-to-Treat (mITT):** All randomized subjects who receive at least one dose of study drug
- **Per Protocol (PP):** All mITT subjects without major protocol deviations
- **Safety Population:** All subjects who receive at least one dose of study drug

### 5. INTERIM ANALYSES
An interim analysis for futility is planned after 50% of subjects complete the primary endpoint assessment. The study may be terminated early for futility if the conditional power is less than 20%. O'Brien-Fleming boundaries will be used to control the overall type I error rate.

### 6. MULTIPLICITY ADJUSTMENT
Hochberg's procedure will be used to control the family-wise error rate for the primary and key secondary endpoints.

### 7. SAFETY ANALYSES
- Adverse events will be coded using MedDRA and summarized by treatment group
- Laboratory abnormalities will be graded according to CTCAE v5.0
- Vital signs and ECG findings will be summarized descriptively

This SAP was automatically generated based on the protocol data and should be reviewed by a qualified statistician before implementation.
`;
}