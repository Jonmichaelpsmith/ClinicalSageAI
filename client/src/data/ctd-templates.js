/**
 * CTD Templates Data
 * 
 * This file contains the structured data for all Common Technical Document (CTD)
 * templates following ICH specifications.
 * 
 * Each template includes:
 * - Basic metadata (ID, title, module section, etc.)
 * - Structure following ICH CTD organization requirements
 * - Required sections with standard headers
 * - Guidance notes based on ICH requirements
 */

// Helper function to generate a template ID
const generateTemplateId = (moduleSection) => {
  return `ctd-${moduleSection.toLowerCase().replace(/\./g, '-')}`;
};

// Template base structure for consistency
const createTemplateBase = (moduleId, moduleSection, title, description, documentType) => {
  return {
    id: generateTemplateId(moduleSection),
    title,
    moduleId,
    moduleSection,
    description,
    documentType,
    version: '1.0',
    lastUpdated: '2025-04-24',
    usageCount: Math.floor(Math.random() * 100),
    popularity: Math.floor(Math.random() * 10),
    sections: [], // Will be populated based on specific template
    structure: {} // Will be populated based on specific template
  };
};

// CTD Module 1: Administrative Information and Prescribing Information Templates
const module1Templates = [
  {
    ...createTemplateBase(
      'module1',
      '1.1',
      'Comprehensive Table of Contents',
      'Complete table of contents for all modules of the submission including Module 1',
      'Administrative'
    ),
    sections: [
      { id: '1.1.1', title: 'Table of Contents', required: true },
      { id: '1.1.2', title: 'List of Documents', required: true }
    ],
    fields: [
      { name: 'DrugName', label: 'Drug Name', type: 'text' },
      { name: 'CompanyName', label: 'Company Name', type: 'text' }
    ],
    structure: {
      sections: [
        { title: 'TABLE OF CONTENTS', content: 'Table of contents for the entire submission' },
        { title: 'LIST OF DOCUMENTS', content: 'Sequential listing of all documents included in the submission' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module1',
      '1.2',
      'Cover Letter',
      'Introductory cover letter for regulatory submissions',
      'Administrative'
    ),
    sections: [
      { id: '1.2.1', title: 'Cover Letter', required: true },
      { id: '1.2.2', title: 'Application Form', required: false }
    ],
    fields: [
      { name: 'DrugName', label: 'Drug Name', type: 'text' },
      { name: 'CompanyName', label: 'Company Name', type: 'text' },
      { name: 'SignerName', label: 'Signer Name', type: 'text' }
    ],
    structure: {
      sections: [
        {
          title: 'COVER LETTER',
          content: 'Cover letter on company letterhead\n\n' +
                  '[Date]\n\n' +
                  '[Regulatory Authority Name and Address]\n\n' +
                  'Subject: [Product Name], [Application Type/Number]\n\n' +
                  'Dear Sir/Madam:\n\n' +
                  '[Introduction paragraph with purpose of submission]\n\n' +
                  '[Overview of contents]\n\n' +
                  '[Statement of compliance with applicable regulations]\n\n' +
                  'Sincerely,\n\n' +
                  '[Authorized Signatory Name]\n' +
                  '[Title]\n' +
                  '[Contact Information]'
        }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module1',
      '1.3',
      'Product Information',
      'Summary of product characteristics and labeling',
      'Administrative'
    ),
    sections: [
      { id: '1.3.1', title: 'Summary of Product Characteristics', required: true },
      { id: '1.3.2', title: 'Labeling', required: true },
      { id: '1.3.3', title: 'Package Leaflet', required: true }
    ],
    fields: [
      { name: 'DrugName', label: 'Drug Name', type: 'text' }
    ],
    structure: {
      sections: [
        { title: 'SUMMARY OF PRODUCT CHARACTERISTICS' },
        { title: 'LABELING' },
        { title: 'PACKAGE LEAFLET' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module1',
      '1.4',
      'Information on Experts',
      'Expert statements for each discipline',
      'Administrative'
    ),
    sections: [
      { id: '1.4.1', title: 'Quality Expert Statement', required: true },
      { id: '1.4.2', title: 'Non-Clinical Expert Statement', required: true },
      { id: '1.4.3', title: 'Clinical Expert Statement', required: true }
    ],
    fields: [
      { name: 'ExpertNames', label: 'Expert Names', type: 'textarea' }
    ],
    structure: {
      sections: [
        { title: 'EXPERT STATEMENTS' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module1',
      '1.5',
      'Application Type Information',
      'Specific requirements for different application types',
      'Administrative'
    ),
    sections: [
      { id: '1.5.1', title: 'Bibliographic Applications', required: false },
      { id: '1.5.2', title: 'Generic or Hybrid Applications', required: false }
    ],
    fields: [
      { name: 'ApplicationType', label: 'Application Type', type: 'text' }
    ],
    structure: {
      sections: [
        { title: 'APPLICATION TYPE DETAILS' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module1',
      '1.6',
      'Environmental Risk Assessment',
      'Assessment of potential environmental risks',
      'Administrative'
    ),
    sections: [
      { id: '1.6.1', title: 'Non-GMO Environmental Risk Assessment', required: true },
      { id: '1.6.2', title: 'GMO Environmental Risk Assessment', required: false }
    ],
    fields: [
      { name: 'RiskSummary', label: 'Risk Summary', type: 'textarea' }
    ],
    structure: {
      sections: [
        { title: 'ENVIRONMENTAL RISK ASSESSMENT' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module1',
      '1.7',
      'Orphan Market Exclusivity',
      'Information relating to orphan market exclusivity',
      'Administrative'
    ),
    sections: [
      { id: '1.7.1', title: 'Designation Evidence', required: true },
      { id: '1.7.2', title: 'Market Exclusivity Considerations', required: true }
    ],
    fields: [
      { name: 'OrphanDesignation', label: 'Orphan Designation', type: 'text' }
    ],
    structure: {
      sections: [
        { title: 'ORPHAN MARKET EXCLUSIVITY' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module1',
      '1.8',
      'Pharmacovigilance System',
      'Information relating to pharmacovigilance',
      'Administrative'
    ),
    sections: [
      { id: '1.8.1', title: 'Pharmacovigilance System', required: true },
      { id: '1.8.2', title: 'Risk Management System', required: true }
    ],
    fields: [
      { name: 'PVSummary', label: 'PV Summary', type: 'textarea' }
    ],
    structure: {
      sections: [
        { title: 'PHARMACOVIGILANCE SYSTEM' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module1',
      '1.9',
      'Information about Clinical Trials',
      'Statement on clinical trials conducted outside the region',
      'Administrative'
    ),
    sections: [
      { id: '1.9.1', title: 'Clinical Trial Compliance Statement', required: true },
      { id: '1.9.2', title: 'Ethical Considerations', required: true }
    ],
    fields: [
      { name: 'TrialStatement', label: 'Trial Statement', type: 'textarea' }
    ],
    structure: {
      sections: [
        { title: 'CLINICAL TRIAL INFORMATION' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module1',
      '1.10',
      'Pediatric Development',
      'Information on pediatric investigation plans',
      'Administrative'
    ),
    sections: [
      { id: '1.10.1', title: 'Pediatric Investigation Plan', required: true },
      { id: '1.10.2', title: 'Waivers and Deferrals', required: false }
    ],
    fields: [
      { name: 'PIPSummary', label: 'PIP Summary', type: 'textarea' }
    ],
    structure: {
      sections: [
        { title: 'PEDIATRIC DEVELOPMENT PLAN' }
      ]
    }
  }
];

// CTD Module 2: Common Technical Document Summaries Templates
const module2Templates = [
  {
    ...createTemplateBase(
      'module2',
      '2.3',
      'Quality Overall Summary',
      'Comprehensive summary of all quality-related information in Module 3',
      'Summary'
    ),
    sections: [
      { id: '2.3.S', title: 'Drug Substance', required: true },
      { id: '2.3.P', title: 'Drug Product', required: true },
      { id: '2.3.A', title: 'Appendices', required: false },
      { id: '2.3.R', title: 'Regional Information', required: false }
    ],
    fields: [
      { name: 'ProductName', label: 'Product Name', type: 'text' },
      { name: 'QualitySummary', label: 'Quality Summary', type: 'textarea' }
    ],
    structure: {
      sections: [
        {
          title: 'QUALITY OVERALL SUMMARY',
          subsections: [
            {
              title: '2.3.S DRUG SUBSTANCE',
              subsections: [
                { title: '2.3.S.1 General Information' },
                { title: '2.3.S.2 Manufacture' },
                { title: '2.3.S.3 Characterization' },
                { title: '2.3.S.4 Control of Drug Substance' },
                { title: '2.3.S.5 Reference Standards or Materials' },
                { title: '2.3.S.6 Container Closure System' },
                { title: '2.3.S.7 Stability' }
              ]
            },
            {
              title: '2.3.P DRUG PRODUCT',
              subsections: [
                { title: '2.3.P.1 Description and Composition' },
                { title: '2.3.P.2 Pharmaceutical Development' },
                { title: '2.3.P.3 Manufacture' },
                { title: '2.3.P.4 Control of Excipients' },
                { title: '2.3.P.5 Control of Drug Product' },
                { title: '2.3.P.6 Reference Standards or Materials' },
                { title: '2.3.P.7 Container Closure System' },
                { title: '2.3.P.8 Stability' }
              ]
            },
            { title: '2.3.A APPENDICES' },
            { title: '2.3.R REGIONAL INFORMATION' }
          ]
        }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module2',
      '2.4',
      'Nonclinical Overview',
      'Integrated assessment of the nonclinical evaluation of the pharmaceutical',
      'Overview'
    ),
    sections: [
      { id: '2.4.1', title: 'Overview of Nonclinical Testing Strategy', required: true },
      { id: '2.4.2', title: 'Pharmacology', required: true },
      { id: '2.4.3', title: 'Pharmacokinetics', required: true },
      { id: '2.4.4', title: 'Toxicology', required: true },
      { id: '2.4.5', title: 'Integrated Overview and Conclusions', required: true },
      { id: '2.4.6', title: 'List of Literature References', required: true }
    ],
    fields: [
      { name: 'NonclinicalSummary', label: 'Nonclinical Summary', type: 'textarea' }
    ],
    structure: {
      sections: [
        { title: 'NONCLINICAL OVERVIEW',
          subsections: [
            { title: '2.4.1 Overview of Nonclinical Testing Strategy' },
            { title: '2.4.2 Pharmacology' },
            { title: '2.4.3 Pharmacokinetics' },
            { title: '2.4.4 Toxicology' },
            { title: '2.4.5 Integrated Overview and Conclusions' },
            { title: '2.4.6 List of Literature References' }
          ]
        }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module2',
      '2.5',
      'Clinical Overview',
      'Clinical assessment of risks and benefits of the pharmaceutical product',
      'Overview'
    ),
    sections: [
      { id: '2.5.1', title: 'Product Development Rationale', required: true },
      { id: '2.5.2', title: 'Overview of Biopharmaceutics', required: true },
      { id: '2.5.3', title: 'Overview of Clinical Pharmacology', required: true },
      { id: '2.5.4', title: 'Overview of Efficacy', required: true },
      { id: '2.5.5', title: 'Overview of Safety', required: true },
      { id: '2.5.6', title: 'Benefits and Risks Conclusions', required: true },
      { id: '2.5.7', title: 'Literature References', required: true }
    ],
    fields: [
      { name: 'ClinicalSummary', label: 'Clinical Summary', type: 'textarea' }
    ],
    structure: {
      sections: [
        { title: 'CLINICAL OVERVIEW',
          subsections: [
            { title: '2.5.1 Product Development Rationale' },
            { title: '2.5.2 Overview of Biopharmaceutics' },
            { title: '2.5.3 Overview of Clinical Pharmacology' },
            { title: '2.5.4 Overview of Efficacy' },
            { title: '2.5.5 Overview of Safety' },
            { title: '2.5.6 Benefits and Risks Conclusions' },
            { title: '2.5.7 Literature References' }
          ]
        }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module2',
      '2.1',
      'CTD Table of Contents',
      'Table of contents for modules 2-5',
      'Summary'
    ),
    sections: [
      { id: '2.1.1', title: 'Module 2 Contents', required: true },
      { id: '2.1.2', title: 'Module 3 Contents', required: true },
      { id: '2.1.3', title: 'Module 4 Contents', required: true },
      { id: '2.1.4', title: 'Module 5 Contents', required: true }
    ],
    fields: [
      { name: 'ProductName', label: 'Product Name', type: 'text' }
    ],
    structure: {
      sections: [
        { title: 'MODULE 2 CONTENTS' },
        { title: 'MODULE 3 CONTENTS' },
        { title: 'MODULE 4 CONTENTS' },
        { title: 'MODULE 5 CONTENTS' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module2',
      '2.2',
      'CTD Introduction',
      'Brief introduction to the pharmaceutical product',
      'Summary'
    ),
    sections: [
      { id: '2.2.1', title: 'Product Overview', required: true },
      { id: '2.2.2', title: 'Submission Context', required: true }
    ],
    fields: [
      { name: 'IntroText', label: 'Introduction', type: 'textarea' }
    ],
    structure: {
      sections: [
        { title: 'CTD INTRODUCTION' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module2',
      '2.6',
      'Nonclinical Written and Tabulated Summaries',
      'Detailed nonclinical summaries',
      'Summary'
    ),
    sections: [
      { id: '2.6.1', title: 'Introduction', required: true },
      { id: '2.6.2', title: 'Pharmacology Written Summary', required: true },
      { id: '2.6.3', title: 'Pharmacology Tabulated Summary', required: true },
      { id: '2.6.4', title: 'Pharmacokinetics Written Summary', required: true },
      { id: '2.6.5', title: 'Pharmacokinetics Tabulated Summary', required: true },
      { id: '2.6.6', title: 'Toxicology Written Summary', required: true },
      { id: '2.6.7', title: 'Toxicology Tabulated Summary', required: true }
    ],
    fields: [
      { name: 'NonclinicalSummary', label: 'Nonclinical Summary', type: 'textarea' }
    ],
    structure: {
      sections: [
        { title: 'NONCLINICAL WRITTEN AND TABULATED SUMMARIES' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module2',
      '2.7',
      'Clinical Summary',
      'Detailed clinical summaries',
      'Summary'
    ),
    sections: [
      { id: '2.7.1', title: 'Summary of Biopharmaceutic Studies and Analytical Methods', required: true },
      { id: '2.7.2', title: 'Summary of Clinical Pharmacology Studies', required: true },
      { id: '2.7.3', title: 'Summary of Clinical Efficacy', required: true },
      { id: '2.7.4', title: 'Summary of Clinical Safety', required: true },
      { id: '2.7.5', title: 'Literature References', required: true },
      { id: '2.7.6', title: 'Synopsis of Individual Studies', required: true }
    ],
    fields: [
      { name: 'ClinicalSummary', label: 'Clinical Summary', type: 'textarea' }
    ],
    structure: {
      sections: [
        { title: 'CLINICAL SUMMARY' }
      ]
    }
  }
];

// CTD Module 3: Quality Templates
const module3Templates = [
  {
    ...createTemplateBase(
      'module3',
      '3.2.S',
      'Drug Substance',
      'Comprehensive information on the drug substance including manufacturing, characterization and controls',
      'Quality'
    ),
    sections: [
      { id: '3.2.S.1', title: 'General Information', required: true },
      { id: '3.2.S.2', title: 'Manufacture', required: true },
      { id: '3.2.S.3', title: 'Characterisation', required: true },
      { id: '3.2.S.4', title: 'Control of Drug Substance', required: true },
      { id: '3.2.S.5', title: 'Reference Standards or Materials', required: true },
      { id: '3.2.S.6', title: 'Container Closure System', required: true },
      { id: '3.2.S.7', title: 'Stability', required: true }
    ],
    fields: [
      { name: 'ManufacturingProcess', label: 'Manufacturing Process', type: 'textarea' },
      { name: 'StabilitySummary', label: 'Stability Summary', type: 'textarea' }
    ],
    structure: {
      sections: [
        {
          title: 'DRUG SUBSTANCE', 
          subsections: [
            { 
              title: '3.2.S.1 General Information',
              subsections: [
                { title: '3.2.S.1.1 Nomenclature' },
                { title: '3.2.S.1.2 Structure' },
                { title: '3.2.S.1.3 General Properties' }
              ]
            },
            { 
              title: '3.2.S.2 Manufacture',
              subsections: [
                { title: '3.2.S.2.1 Manufacturer(s)' },
                { title: '3.2.S.2.2 Description of Manufacturing Process and Process Controls' },
                { title: '3.2.S.2.3 Control of Materials' },
                { title: '3.2.S.2.4 Controls of Critical Steps and Intermediates' },
                { title: '3.2.S.2.5 Process Validation and/or Evaluation' },
                { title: '3.2.S.2.6 Manufacturing Process Development' }
              ]
            },
            { 
              title: '3.2.S.3 Characterisation',
              subsections: [
                { title: '3.2.S.3.1 Elucidation of Structure and other Characteristics' },
                { title: '3.2.S.3.2 Impurities' }
              ]
            },
            { 
              title: '3.2.S.4 Control of Drug Substance',
              subsections: [
                { title: '3.2.S.4.1 Specification' },
                { title: '3.2.S.4.2 Analytical Procedures' },
                { title: '3.2.S.4.3 Validation of Analytical Procedures' },
                { title: '3.2.S.4.4 Batch Analyses' },
                { title: '3.2.S.4.5 Justification of Specification' }
              ]
            },
            { title: '3.2.S.5 Reference Standards or Materials' },
            { title: '3.2.S.6 Container Closure System' },
            { 
              title: '3.2.S.7 Stability',
              subsections: [
                { title: '3.2.S.7.1 Stability Summary and Conclusions' },
                { title: '3.2.S.7.2 Post-approval Stability Protocol and Stability Commitment' },
                { title: '3.2.S.7.3 Stability Data' }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module3',
      '3.2.P',
      'Drug Product',
      'Comprehensive information on the drug product including formulation, manufacturing, and controls',
      'Quality'
    ),
    sections: [
      { id: '3.2.P.1', title: 'Description and Composition', required: true },
      { id: '3.2.P.2', title: 'Pharmaceutical Development', required: true },
      { id: '3.2.P.3', title: 'Manufacture', required: true },
      { id: '3.2.P.4', title: 'Control of Excipients', required: true },
      { id: '3.2.P.5', title: 'Control of Drug Product', required: true },
      { id: '3.2.P.6', title: 'Reference Standards or Materials', required: true },
      { id: '3.2.P.7', title: 'Container Closure System', required: true },
      { id: '3.2.P.8', title: 'Stability', required: true }
    ],
    fields: [
      { name: 'Formulation', label: 'Formulation Details', type: 'textarea' },
      { name: 'Packaging', label: 'Packaging', type: 'text' }
    ],
    structure: {
      sections: [
        {
          title: 'DRUG PRODUCT', 
          subsections: [
            { title: '3.2.P.1 Description and Composition of the Drug Product' },
            { 
              title: '3.2.P.2 Pharmaceutical Development',
              subsections: [
                { title: '3.2.P.2.1 Components of the Drug Product' },
                { title: '3.2.P.2.2 Drug Product' },
                { title: '3.2.P.2.3 Manufacturing Process Development' },
                { title: '3.2.P.2.4 Container Closure System' },
                { title: '3.2.P.2.5 Microbiological Attributes' },
                { title: '3.2.P.2.6 Compatibility' }
              ]
            },
            { 
              title: '3.2.P.3 Manufacture',
              subsections: [
                { title: '3.2.P.3.1 Manufacturer(s)' },
                { title: '3.2.P.3.2 Batch Formula' },
                { title: '3.2.P.3.3 Description of Manufacturing Process and Process Controls' },
                { title: '3.2.P.3.4 Controls of Critical Steps and Intermediates' },
                { title: '3.2.P.3.5 Process Validation and/or Evaluation' }
              ]
            },
            { 
              title: '3.2.P.4 Control of Excipients',
              subsections: [
                { title: '3.2.P.4.1 Specifications' },
                { title: '3.2.P.4.2 Analytical Procedures' },
                { title: '3.2.P.4.3 Validation of Analytical Procedures' },
                { title: '3.2.P.4.4 Justification of Specifications' },
                { title: '3.2.P.4.5 Excipients of Human or Animal Origin' },
                { title: '3.2.P.4.6 Novel Excipients' }
              ]
            },
            { 
              title: '3.2.P.5 Control of Drug Product',
              subsections: [
                { title: '3.2.P.5.1 Specification(s)' },
                { title: '3.2.P.5.2 Analytical Procedures' },
                { title: '3.2.P.5.3 Validation of Analytical Procedures' },
                { title: '3.2.P.5.4 Batch Analyses' },
                { title: '3.2.P.5.5 Characterisation of Impurities' },
                { title: '3.2.P.5.6 Justification of Specification(s)' }
              ]
            },
            { title: '3.2.P.6 Reference Standards or Materials' },
            { title: '3.2.P.7 Container Closure System' },
            { 
              title: '3.2.P.8 Stability',
              subsections: [
                { title: '3.2.P.8.1 Stability Summary and Conclusion' },
                { title: '3.2.P.8.2 Post-approval Stability Protocol and Stability Commitment' },
                { title: '3.2.P.8.3 Stability Data' }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module3',
      '3.1',
      'Module 3 Table of Contents',
      'Detailed table of contents for the quality module',
      'Quality'
    ),
    sections: [
      { id: '3.1.1', title: 'Comprehensive Table of Contents', required: true }
    ],
    fields: [
      { name: 'ProductName', label: 'Product Name', type: 'text' }
    ],
    structure: {
      sections: [
        { title: 'MODULE 3 CONTENTS' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module3',
      '3.2.A',
      'Appendices',
      'Additional quality information',
      'Quality'
    ),
    sections: [
      { id: '3.2.A.1', title: 'Facilities and Equipment', required: false },
      { id: '3.2.A.2', title: 'Adventitious Agents Safety Evaluation', required: false },
      { id: '3.2.A.3', title: 'Novel Excipients', required: false }
    ],
    fields: [
      { name: 'AppendixNotes', label: 'Appendix Notes', type: 'textarea' }
    ],
    structure: {
      sections: [
        { title: 'APPENDICES' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module3',
      '3.2.R',
      'Regional Information',
      'Region-specific quality information',
      'Quality'
    ),
    sections: [
      { id: '3.2.R.1', title: 'Production Documentation', required: false },
      { id: '3.2.R.2', title: 'Medical Device Information', required: false },
      { id: '3.2.R.3', title: 'Regional Specific Validation', required: false }
    ],
    fields: [
      { name: 'Region', label: 'Region', type: 'text' }
    ],
    structure: {
      sections: [
        { title: 'REGIONAL INFORMATION' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module3',
      '3.3',
      'Literature References',
      'Published literature relevant to quality information',
      'Quality'
    ),
    sections: [
      { id: '3.3.1', title: 'Manufacturing Process Literature', required: false },
      { id: '3.3.2', title: 'Analytical Methods Literature', required: false },
      { id: '3.3.3', title: 'Stability Studies Literature', required: false }
    ],
    fields: [
      { name: 'References', label: 'References', type: 'textarea' }
    ],
    structure: {
      sections: [
        { title: 'LITERATURE REFERENCES' }
      ]
    }
  }
];

// CTD Module 4: Nonclinical Study Reports Templates
const module4Templates = [
  {
    ...createTemplateBase(
      'module4',
      '4.2.1',
      'Pharmacology Study Reports',
      'Reports of all primary pharmacodynamics, secondary pharmacodynamics, and safety pharmacology studies',
      'Nonclinical'
    ),
    sections: [
      { id: '4.2.1.1', title: 'Primary Pharmacodynamics', required: true },
      { id: '4.2.1.2', title: 'Secondary Pharmacodynamics', required: true },
      { id: '4.2.1.3', title: 'Safety Pharmacology', required: true },
      { id: '4.2.1.4', title: 'Pharmacodynamic Drug Interactions', required: false }
    ],
    fields: [
      { name: 'StudyName', label: 'Study Name', type: 'text' },
      { name: 'ResultsSummary', label: 'Results Summary', type: 'textarea' }
    ],
    structure: {
      sections: [
        {
          title: 'PHARMACOLOGY STUDY REPORTS',
          subsections: [
            { title: '4.2.1.1 Primary Pharmacodynamics' },
            { title: '4.2.1.2 Secondary Pharmacodynamics' },
            { title: '4.2.1.3 Safety Pharmacology' },
            { title: '4.2.1.4 Pharmacodynamic Drug Interactions' }
          ]
        }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module4',
      '4.2.3.2',
      'Repeat-Dose Toxicity',
      'Reports of repeat-dose toxicity studies',
      'Nonclinical'
    ),
    sections: [
      { id: '4.2.3.2.1', title: 'Study Report 1', required: true },
      { id: '4.2.3.2.2', title: 'Study Report 2', required: false },
      { id: '4.2.3.2.3', title: 'Study Report 3', required: false }
    ],
    fields: [
      { name: 'StudyName', label: 'Study Name', type: 'text' },
      { name: 'ResultsSummary', label: 'Results Summary', type: 'textarea' }
    ],
    structure: {
      sections: [
        {
          title: 'REPEAT-DOSE TOXICITY',
          subsections: [
            {
              title: 'STUDY REPORT FORMAT',
              subsections: [
                { title: '1. Title Page' },
                { title: '2. Study Summary' },
                { title: '3. Table of Contents' },
                { title: '4. Introduction and Objectives' },
                { title: '5. Materials and Methods' },
                { title: '6. Results' },
                { title: '7. Discussion and Conclusions' },
                { title: '8. References' },
                { title: '9. Appendices' }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module4',
      '4.1',
      'Module 4 Table of Contents',
      'Detailed table of contents for nonclinical studies',
      'Nonclinical'
    ),
    sections: [
      { id: '4.1.1', title: 'Comprehensive Table of Contents', required: true }
    ],
    fields: [
      { name: 'ProductName', label: 'Product Name', type: 'text' }
    ],
    structure: {
      sections: [
        { title: 'MODULE 4 CONTENTS' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module4',
      '4.2.2',
      'Pharmacokinetics Study Reports',
      'Reports of pharmacokinetic studies',
      'Nonclinical'
    ),
    sections: [
      { id: '4.2.2.1', title: 'Analytical Methods and Validation', required: true },
      { id: '4.2.2.2', title: 'Absorption', required: true },
      { id: '4.2.2.3', title: 'Distribution', required: true },
      { id: '4.2.2.4', title: 'Metabolism', required: true },
      { id: '4.2.2.5', title: 'Excretion', required: true }
    ],
    fields: [
      { name: 'StudyName', label: 'Study Name', type: 'text' }
    ],
    structure: {
      sections: [
        { title: 'PHARMACOKINETICS STUDY REPORTS' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module4',
      '4.2.3',
      'Toxicology Study Reports',
      'Reports of toxicology studies',
      'Nonclinical'
    ),
    sections: [
      { id: '4.2.3.1', title: 'Single-Dose Toxicity', required: true },
      { id: '4.2.3.2', title: 'Repeat-Dose Toxicity', required: true },
      { id: '4.2.3.3', title: 'Genotoxicity', required: true }
    ],
    fields: [
      { name: 'StudyName', label: 'Study Name', type: 'text' }
    ],
    structure: {
      sections: [
        { title: 'TOXICOLOGY STUDY REPORTS' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module4',
      '4.3',
      'Nonclinical Literature References',
      'Published literature related to nonclinical information',
      'Nonclinical'
    ),
    sections: [
      { id: '4.3.1', title: 'Pharmacology Literature', required: false },
      { id: '4.3.2', title: 'Pharmacokinetics Literature', required: false },
      { id: '4.3.3', title: 'Toxicology Literature', required: false }
    ],
    fields: [
      { name: 'References', label: 'References', type: 'textarea' }
    ],
    structure: {
      sections: [
        { title: 'LITERATURE REFERENCES' }
      ]
    }
  }
];

// CTD Module 5: Clinical Study Reports Templates
const module5Templates = [
  {
    ...createTemplateBase(
      'module5',
      '5.3.5.1',
      'Controlled Clinical Study Report',
      'Reports of controlled clinical studies pertinent to the claimed indication',
      'Clinical'
    ),
    sections: [
      { id: '5.3.5.1.1', title: 'Protocol', required: true },
      { id: '5.3.5.1.2', title: 'Statistical Analysis Plan', required: true },
      { id: '5.3.5.1.3', title: 'Study Report', required: true },
      { id: '5.3.5.1.4', title: 'Case Report Forms', required: false }
    ],
    fields: [
      { name: 'TrialTitle', label: 'Trial Title', type: 'text' },
      { name: 'EfficacySummary', label: 'Efficacy Summary', type: 'textarea' }
    ],
    structure: {
      sections: [
        {
          title: 'CONTROLLED CLINICAL STUDY REPORT',
          subsections: [
            { title: '1. Title Page' },
            { title: '2. Synopsis' },
            { title: '3. Table of Contents' },
            { title: '4. List of Abbreviations and Definitions' },
            { title: '5. Ethics' },
            { title: '6. Investigators and Study Administrative Structure' },
            { title: '7. Introduction' },
            { title: '8. Study Objectives' },
            { title: '9. Investigational Plan' },
            { title: '10. Study Patients' },
            { title: '11. Efficacy Evaluation' },
            { title: '12. Safety Evaluation' },
            { title: '13. Discussion and Overall Conclusions' },
            { title: '14. Tables, Figures and Graphs' },
            { title: '15. References' },
            { title: '16. Appendices' }
          ]
        }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module5',
      '5.3.1.1',
      'Bioavailability (BA) Study Report',
      'Reports of comparative BA and bioequivalence studies',
      'Clinical'
    ),
    sections: [
      { id: '5.3.1.1.1', title: 'Protocol', required: true },
      { id: '5.3.1.1.2', title: 'Statistical Analysis Plan', required: true },
      { id: '5.3.1.1.3', title: 'Study Report', required: true },
      { id: '5.3.1.1.4', title: 'Bioanalytical Method Validation', required: true }
    ],
    fields: [
      { name: 'TrialTitle', label: 'Trial Title', type: 'text' },
      { name: 'ResultsSummary', label: 'Results Summary', type: 'textarea' }
    ],
    structure: {
      sections: [
        {
          title: 'BIOAVAILABILITY STUDY REPORT',
          subsections: [
            { title: '1. Title Page' },
            { title: '2. Synopsis' },
            { title: '3. Table of Contents' },
            { title: '4. Introduction' },
            { title: '5. Study Objectives' },
            { title: '6. Study Design' },
            { title: '7. Materials and Methods' },
            { title: '8. Results' },
            { title: '9. Discussion and Conclusions' },
            { title: '10. Appendices' }
          ]
        }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module5',
      '5.2',
      'Tabular Listing of All Clinical Studies',
      'Tabular listing of all clinical studies included in the application',
      'Clinical'
    ),
    sections: [
      { id: '5.2.1', title: 'Tabular Listing', required: true }
    ],
    fields: [
      { name: 'TrialList', label: 'Trial List', type: 'textarea' }
    ],
    structure: {
      sections: [
        {
          title: 'TABULAR LISTING OF ALL CLINICAL STUDIES',
          subsections: [
            {
              title: 'Table Format',
              content: `Study ID | Study Title | Study Design | Study Population | Treatment Groups | Dosage Regimen | Study Duration | Primary Endpoints | Study Status
-----------------|------------|--------------|-----------------|------------------|-----------------|----------------|------------------|-------------
[Study ID]       | [Title]    | [Design]     | [Population]    | [Groups]         | [Regimen]       | [Duration]     | [Endpoints]      | [Status]`
            }
          ]
        }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module5',
      '5.1',
      'Module 5 Table of Contents',
      'Detailed table of contents for clinical study reports',
      'Clinical'
    ),
    sections: [
      { id: '5.1.1', title: 'Comprehensive Table of Contents', required: true }
    ],
    fields: [
      { name: 'ProductName', label: 'Product Name', type: 'text' }
    ],
    structure: {
      sections: [
        { title: 'MODULE 5 CONTENTS' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module5',
      '5.3.2',
      'Studies Pertinent to Pharmacokinetics',
      'Reports of pharmacokinetic studies using human biomaterials',
      'Clinical'
    ),
    sections: [
      { id: '5.3.2.1', title: 'Plasma Protein Binding Study Reports', required: false },
      { id: '5.3.2.2', title: 'Hepatic Metabolism Study Reports', required: false },
      { id: '5.3.2.3', title: 'Studies Using Other Human Biomaterials', required: false }
    ],
    fields: [
      { name: 'StudyName', label: 'Study Name', type: 'text' }
    ],
    structure: {
      sections: [
        { title: 'PHARMACOKINETIC STUDY REPORTS' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module5',
      '5.3.3',
      'Human Pharmacokinetic Studies',
      'Reports of PK studies in humans',
      'Clinical'
    ),
    sections: [
      { id: '5.3.3.1', title: 'Healthy Subject PK Studies', required: true },
      { id: '5.3.3.2', title: 'Patient PK Studies', required: false }
    ],
    fields: [
      { name: 'StudyName', label: 'Study Name', type: 'text' }
    ],
    structure: {
      sections: [
        { title: 'HUMAN PK STUDY REPORTS' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module5',
      '5.3.4',
      'Human Pharmacodynamic Studies',
      'Reports of pharmacodynamic studies',
      'Clinical'
    ),
    sections: [
      { id: '5.3.4.1', title: 'Healthy Subject PD Studies', required: false },
      { id: '5.3.4.2', title: 'Patient PD Studies', required: false }
    ],
    fields: [
      { name: 'StudyName', label: 'Study Name', type: 'text' }
    ],
    structure: {
      sections: [
        { title: 'HUMAN PD STUDY REPORTS' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module5',
      '5.3.5',
      'Efficacy and Safety Studies',
      'Reports of efficacy and safety clinical studies',
      'Clinical'
    ),
    sections: [
      { id: '5.3.5.1', title: 'Controlled Clinical Studies', required: true },
      { id: '5.3.5.2', title: 'Uncontrolled Clinical Studies', required: false }
    ],
    fields: [
      { name: 'StudyName', label: 'Study Name', type: 'text' }
    ],
    structure: {
      sections: [
        { title: 'EFFICACY AND SAFETY STUDIES' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module5',
      '5.3.6',
      'Post-Marketing Experience',
      'Reports of post-marketing experience',
      'Clinical'
    ),
    sections: [
      { id: '5.3.6.1', title: 'Post-Marketing Safety Reports', required: false },
      { id: '5.3.6.2', title: 'Post-Marketing Efficacy Reports', required: false }
    ],
    fields: [
      { name: 'Region', label: 'Region', type: 'text' }
    ],
    structure: {
      sections: [
        { title: 'POST-MARKETING EXPERIENCE' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module5',
      '5.3.7',
      'Case Report Forms and Listings',
      'Case report forms and patient listings',
      'Clinical'
    ),
    sections: [
      { id: '5.3.7.1', title: 'Case Report Forms', required: false },
      { id: '5.3.7.2', title: 'Individual Patient Listings', required: false }
    ],
    fields: [
      { name: 'Notes', label: 'Notes', type: 'textarea' }
    ],
    structure: {
      sections: [
        { title: 'CASE REPORT FORMS AND LISTINGS' }
      ]
    }
  },
  {
    ...createTemplateBase(
      'module5',
      '5.4',
      'Clinical Literature References',
      'Published clinical literature references',
      'Clinical'
    ),
    sections: [
      { id: '5.4.1', title: 'Efficacy Literature', required: false },
      { id: '5.4.2', title: 'Safety Literature', required: false }
    ],
    fields: [
      { name: 'References', label: 'References', type: 'textarea' }
    ],
    structure: {
      sections: [
        { title: 'CLINICAL LITERATURE REFERENCES' }
      ]
    }
  }
];

// Combine all templates
export const ctdTemplates = [
  ...module1Templates,
  ...module2Templates,
  ...module3Templates,
  ...module4Templates,
  ...module5Templates
];

export default ctdTemplates;