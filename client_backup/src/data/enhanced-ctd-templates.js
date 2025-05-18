/**
 * Enhanced CTD Template Library
 * 
 * Provides comprehensive coverage of CTD modules 1-5 with structured templates
 * for regulatory document generation.
 */

// Base template factory function
const createTemplateBase = (
  module,
  sectionId,
  title,
  description,
  guidance = '',
  required = false,
  templateStatus = 'active'
) => ({
  id: `${module}-${sectionId}`,
  module,
  sectionId,
  title,
  description,
  guidance,
  required,
  status: templateStatus,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Module 1: Administrative Information
const module1Templates = [
  {
    ...createTemplateBase(
      'module1',
      '1.1',
      'Comprehensive Table of Contents',
      'Complete table of contents including all sections and appendices',
      'Include hyperlinks to all documents and clearly indicate section numbers.'
    ),
    sections: [
      { id: '1.1.1', title: 'Table of Contents', required: true },
      { id: '1.1.2', title: 'Hyperlink Structure', required: false },
    ],
  },
  {
    ...createTemplateBase(
      'module1',
      '1.2',
      'Application Form',
      'Completed application forms for regulatory submission',
      'Ensure all fields are completed according to regional requirements.'
    ),
    sections: [
      { id: '1.2.1', title: 'Application Form', required: true },
      { id: '1.2.2', title: 'Annexes', required: false },
    ],
  },
  {
    ...createTemplateBase(
      'module1',
      '1.3',
      'Product Information',
      'Summary of product characteristics, labeling, and package leaflet',
      'Follow regional guidelines for format and content requirements.'
    ),
    sections: [
      { id: '1.3.1', title: 'Summary of Product Characteristics', required: true },
      { id: '1.3.2', title: 'Labeling', required: true },
      { id: '1.3.3', title: 'Package Leaflet', required: true },
      { id: '1.3.4', title: 'Consultation with Target Patient Groups', required: false },
      { id: '1.3.5', title: 'Product Information from Other Countries', required: false },
    ],
  },
  {
    ...createTemplateBase(
      'module1',
      '1.4',
      'Information on Experts',
      'Details of experts who have prepared the quality, non-clinical, and clinical overviews',
      'Include signed statements from each expert.'
    ),
    sections: [
      { id: '1.4.1', title: 'Quality Expert Statement', required: true },
      { id: '1.4.2', title: 'Non-Clinical Expert Statement', required: true },
      { id: '1.4.3', title: 'Clinical Expert Statement', required: true },
    ],
  },
  {
    ...createTemplateBase(
      'module1',
      '1.5',
      'Specific Requirements for Different Types of Applications',
      'Information related to specific application types',
      'Include relevant documentation based on application type.'
    ),
    sections: [
      { id: '1.5.1', title: 'Bibliographic Applications', required: false },
      { id: '1.5.2', title: 'Generic, Hybrid, or Bio-similar Applications', required: false },
      { id: '1.5.3', title: 'Applications for Orphan Medicinal Products', required: false },
      { id: '1.5.4', title: 'Applications for Traditional Herbal Medicinal Products', required: false },
    ],
  },
  {
    ...createTemplateBase(
      'module1',
      '1.6',
      'Environmental Risk Assessment',
      'Assessment of potential environmental risks',
      'Follow ICH guidelines on environmental risk assessment.'
    ),
    sections: [
      { id: '1.6.1', title: 'Non-GMO Environmental Risk Assessment', required: true },
      { id: '1.6.2', title: 'GMO Environmental Risk Assessment', required: false },
    ],
  },
  {
    ...createTemplateBase(
      'module1',
      '1.7',
      'Information Relating to Orphan Market Exclusivity',
      'Documentation for orphan drug designation and market exclusivity',
      'Include evidence of orphan status and market considerations.'
    ),
    sections: [
      { id: '1.7.1', title: 'Designation Evidence', required: true },
      { id: '1.7.2', title: 'Market Exclusivity Considerations', required: true },
    ],
  },
  {
    ...createTemplateBase(
      'module1',
      '1.8',
      'Information Relating to Pharmacovigilance',
      'Pharmacovigilance system and risk management plan',
      'Provide detailed description of monitoring systems.'
    ),
    sections: [
      { id: '1.8.1', title: 'Pharmacovigilance System', required: true },
      { id: '1.8.2', title: 'Risk Management System', required: true },
    ],
  },
  {
    ...createTemplateBase(
      'module1',
      '1.9',
      'Information about Clinical Trials',
      'Statement on clinical trials conducted outside the region',
      'Address ethical considerations for trials in all regions.'
    ),
    sections: [
      { id: '1.9.1', title: 'Clinical Trial Compliance Statement', required: true },
      { id: '1.9.2', title: 'Ethical Considerations', required: true },
    ],
  },
  {
    ...createTemplateBase(
      'module1',
      '1.10',
      'Information on Pediatric Development',
      'Details of pediatric investigation plan and waivers',
      'Include comprehensive pediatric development strategy.'
    ),
    sections: [
      { id: '1.10.1', title: 'Pediatric Investigation Plan', required: true },
      { id: '1.10.2', title: 'Waivers and Deferrals', required: false },
    ],
  },
];

// Module 2: CTD Summaries
const module2Templates = [
  {
    ...createTemplateBase(
      'module2',
      '2.1',
      'CTD Table of Contents',
      'Table of contents for modules 2-5',
      'Include detailed pagination and document references.'
    ),
    sections: [
      { id: '2.1.1', title: 'Module 2 Contents', required: true },
      { id: '2.1.2', title: 'Module 3 Contents', required: true },
      { id: '2.1.3', title: 'Module 4 Contents', required: true },
      { id: '2.1.4', title: 'Module 5 Contents', required: true },
    ],
  },
  {
    ...createTemplateBase(
      'module2',
      '2.2',
      'CTD Introduction',
      'Brief introduction to the pharmaceutical product',
      'Provide overview of drug substance and product characteristics.'
    ),
    sections: [
      { id: '2.2.1', title: 'Product Overview', required: true },
      { id: '2.2.2', title: 'Submission Context', required: true },
    ],
  },
  {
    ...createTemplateBase(
      'module2',
      '2.3',
      'Quality Overall Summary',
      'Summary of quality information for drug substance and product',
      'Follow ICH Q8, Q9, and Q10 guidelines for content organization.'
    ),
    sections: [
      { id: '2.3.S', title: 'Drug Substance', required: true },
      { id: '2.3.P', title: 'Drug Product', required: true },
      { id: '2.3.A', title: 'Appendices', required: false },
      { id: '2.3.R', title: 'Regional Information', required: false },
    ],
  },
  {
    ...createTemplateBase(
      'module2',
      '2.4',
      'Nonclinical Overview',
      'Integrated assessment of nonclinical evaluation',
      'Include pharmacology, pharmacokinetics, and toxicology evaluations.'
    ),
    sections: [
      { id: '2.4.1', title: 'Overview of Nonclinical Testing Strategy', required: true },
      { id: '2.4.2', title: 'Pharmacology', required: true },
      { id: '2.4.3', title: 'Pharmacokinetics', required: true },
      { id: '2.4.4', title: 'Toxicology', required: true },
      { id: '2.4.5', title: 'Integrated Overview and Conclusions', required: true },
      { id: '2.4.6', title: 'List of Literature References', required: true },
    ],
  },
  {
    ...createTemplateBase(
      'module2',
      '2.5',
      'Clinical Overview',
      'Critical assessment of clinical data in application',
      'Provide benefit-risk evaluation and conclusions.'
    ),
    sections: [
      { id: '2.5.1', title: 'Product Development Rationale', required: true },
      { id: '2.5.2', title: 'Overview of Biopharmaceutics', required: true },
      { id: '2.5.3', title: 'Overview of Clinical Pharmacology', required: true },
      { id: '2.5.4', title: 'Overview of Efficacy', required: true },
      { id: '2.5.5', title: 'Overview of Safety', required: true },
      { id: '2.5.6', title: 'Benefits and Risks Conclusions', required: true },
      { id: '2.5.7', title: 'Literature References', required: true },
    ],
  },
  {
    ...createTemplateBase(
      'module2',
      '2.6',
      'Nonclinical Written and Tabulated Summaries',
      'Detailed summaries of nonclinical information',
      'Organize according to ICH M4S guidelines.'
    ),
    sections: [
      { id: '2.6.1', title: 'Introduction', required: true },
      { id: '2.6.2', title: 'Pharmacology Written Summary', required: true },
      { id: '2.6.3', title: 'Pharmacology Tabulated Summary', required: true },
      { id: '2.6.4', title: 'Pharmacokinetics Written Summary', required: true },
      { id: '2.6.5', title: 'Pharmacokinetics Tabulated Summary', required: true },
      { id: '2.6.6', title: 'Toxicology Written Summary', required: true },
      { id: '2.6.7', title: 'Toxicology Tabulated Summary', required: true },
    ],
  },
  {
    ...createTemplateBase(
      'module2',
      '2.7',
      'Clinical Summary',
      'Detailed summaries of clinical information',
      'Follow ICH guidelines for clinical data presentation.'
    ),
    sections: [
      { id: '2.7.1', title: 'Summary of Biopharmaceutic Studies and Analytical Methods', required: true },
      { id: '2.7.2', title: 'Summary of Clinical Pharmacology Studies', required: true },
      { id: '2.7.3', title: 'Summary of Clinical Efficacy', required: true },
      { id: '2.7.4', title: 'Summary of Clinical Safety', required: true },
      { id: '2.7.5', title: 'Literature References', required: true },
      { id: '2.7.6', title: 'Synopsis of Individual Studies', required: true },
    ],
  },
];

// Module 3: Quality
const module3Templates = [
  {
    ...createTemplateBase(
      'module3',
      '3.1',
      'Table of Contents for Module 3',
      'Detailed table of contents for quality module',
      'Include references to all quality documents.'
    ),
    sections: [
      { id: '3.1.1', title: 'Comprehensive Table of Contents', required: true },
    ],
  },
  {
    ...createTemplateBase(
      'module3',
      '3.2.S',
      'Drug Substance',
      'Information on drug substance quality and manufacturing',
      'Include details for each drug substance if multiple are present.'
    ),
    sections: [
      { id: '3.2.S.1', title: 'General Information', required: true },
      { id: '3.2.S.2', title: 'Manufacture', required: true },
      { id: '3.2.S.3', title: 'Characterization', required: true },
      { id: '3.2.S.4', title: 'Control of Drug Substance', required: true },
      { id: '3.2.S.5', title: 'Reference Standards or Materials', required: true },
      { id: '3.2.S.6', title: 'Container Closure System', required: true },
      { id: '3.2.S.7', title: 'Stability', required: true },
    ],
  },
  {
    ...createTemplateBase(
      'module3',
      '3.2.P',
      'Drug Product',
      'Information on drug product quality and manufacturing',
      'Follow ICH Q8, Q9, and Q10 guidelines for content.'
    ),
    sections: [
      { id: '3.2.P.1', title: 'Description and Composition', required: true },
      { id: '3.2.P.2', title: 'Pharmaceutical Development', required: true },
      { id: '3.2.P.3', title: 'Manufacture', required: true },
      { id: '3.2.P.4', title: 'Control of Excipients', required: true },
      { id: '3.2.P.5', title: 'Control of Drug Product', required: true },
      { id: '3.2.P.6', title: 'Reference Standards or Materials', required: true },
      { id: '3.2.P.7', title: 'Container Closure System', required: true },
      { id: '3.2.P.8', title: 'Stability', required: true },
    ],
  },
  {
    ...createTemplateBase(
      'module3',
      '3.2.A',
      'Appendices',
      'Additional information related to facilities and equipment',
      'Include details on all manufacturing facilities.'
    ),
    sections: [
      { id: '3.2.A.1', title: 'Facilities and Equipment', required: false },
      { id: '3.2.A.2', title: 'Adventitious Agents Safety Evaluation', required: false },
      { id: '3.2.A.3', title: 'Novel Excipients', required: false },
    ],
  },
  {
    ...createTemplateBase(
      'module3',
      '3.2.R',
      'Regional Information',
      'Information specific to each regulatory region',
      'Address specific requirements for each targeted region.'
    ),
    sections: [
      { id: '3.2.R.1', title: 'Production Documentation', required: false },
      { id: '3.2.R.2', title: 'Medical Device Information', required: false },
      { id: '3.2.R.3', title: 'Regional Specific Validation', required: false },
    ],
  },
  {
    ...createTemplateBase(
      'module3',
      '3.3',
      'Literature References',
      'Published literature relevant to quality information',
      'Include full text of all references cited in Module 3.'
    ),
    sections: [
      { id: '3.3.1', title: 'Manufacturing Process Literature', required: false },
      { id: '3.3.2', title: 'Analytical Methods Literature', required: false },
      { id: '3.3.3', title: 'Stability Studies Literature', required: false },
    ],
  },
];

// Module 4: Nonclinical Study Reports
const module4Templates = [
  {
    ...createTemplateBase(
      'module4',
      '4.1',
      'Table of Contents for Module 4',
      'Detailed table of contents for nonclinical module',
      'Include references to all study reports.'
    ),
    sections: [
      { id: '4.1.1', title: 'Comprehensive Table of Contents', required: true },
    ],
  },
  {
    ...createTemplateBase(
      'module4',
      '4.2.1',
      'Pharmacology',
      'Reports of pharmacology studies',
      'Include primary and secondary pharmacodynamics studies.'
    ),
    sections: [
      { id: '4.2.1.1', title: 'Primary Pharmacodynamics', required: true },
      { id: '4.2.1.2', title: 'Secondary Pharmacodynamics', required: false },
      { id: '4.2.1.3', title: 'Safety Pharmacology', required: true },
      { id: '4.2.1.4', title: 'Pharmacodynamic Drug Interactions', required: false },
    ],
  },
  {
    ...createTemplateBase(
      'module4',
      '4.2.2',
      'Pharmacokinetics',
      'Reports of pharmacokinetic studies',
      'Include absorption, distribution, metabolism, and excretion studies.'
    ),
    sections: [
      { id: '4.2.2.1', title: 'Analytical Methods and Validation Reports', required: true },
      { id: '4.2.2.2', title: 'Absorption', required: true },
      { id: '4.2.2.3', title: 'Distribution', required: true },
      { id: '4.2.2.4', title: 'Metabolism', required: true },
      { id: '4.2.2.5', title: 'Excretion', required: true },
      { id: '4.2.2.6', title: 'Pharmacokinetic Drug Interactions', required: false },
      { id: '4.2.2.7', title: 'Other Pharmacokinetic Studies', required: false },
    ],
  },
  {
    ...createTemplateBase(
      'module4',
      '4.2.3',
      'Toxicology',
      'Reports of toxicology studies',
      'Include single and repeat dose toxicity studies.'
    ),
    sections: [
      { id: '4.2.3.1', title: 'Single-Dose Toxicity', required: true },
      { id: '4.2.3.2', title: 'Repeat-Dose Toxicity', required: true },
      { id: '4.2.3.3', title: 'Genotoxicity', required: true },
      { id: '4.2.3.4', title: 'Carcinogenicity', required: false },
      { id: '4.2.3.5', title: 'Reproductive and Developmental Toxicity', required: true },
      { id: '4.2.3.6', title: 'Local Tolerance', required: false },
      { id: '4.2.3.7', title: 'Other Toxicity Studies', required: false },
    ],
  },
  {
    ...createTemplateBase(
      'module4',
      '4.3',
      'Literature References',
      'Published literature relevant to nonclinical information',
      'Include full text of all references cited in Module 4.'
    ),
    sections: [
      { id: '4.3.1', title: 'Pharmacology Literature', required: false },
      { id: '4.3.2', title: 'Pharmacokinetics Literature', required: false },
      { id: '4.3.3', title: 'Toxicology Literature', required: false },
    ],
  },
];

// Module 5: Clinical Study Reports
const module5Templates = [
  {
    ...createTemplateBase(
      'module5',
      '5.1',
      'Table of Contents for Module 5',
      'Detailed table of contents for clinical module',
      'Include references to all clinical study reports and literature.'
    ),
    sections: [
      { id: '5.1.1', title: 'Comprehensive Table of Contents', required: true },
    ],
  },
  {
    ...createTemplateBase(
      'module5',
      '5.2',
      'Tabular Listing of All Clinical Studies',
      'Tabular summary of all clinical studies',
      'Provide consistent format for all study listings.'
    ),
    sections: [
      { id: '5.2.1', title: 'Study Design Overview', required: true },
      { id: '5.2.2', title: 'Protocol Reference', required: true },
      { id: '5.2.3', title: 'Study Status', required: true },
    ],
  },
  {
    ...createTemplateBase(
      'module5',
      '5.3.1',
      'Reports of Biopharmaceutic Studies',
      'Reports of bioavailability, comparative BA, and bioequivalence studies',
      'Include in-vitro and in-vivo correlation studies.'
    ),
    sections: [
      { id: '5.3.1.1', title: 'Bioavailability Study Reports', required: false },
      { id: '5.3.1.2', title: 'Comparative BA and Bioequivalence Study Reports', required: false },
      { id: '5.3.1.3', title: 'In Vitro-In Vivo Correlation Study Reports', required: false },
      { id: '5.3.1.4', title: 'Bioanalytical and Analytical Methods for Human Studies', required: true },
    ],
  },
  {
    ...createTemplateBase(
      'module5',
      '5.3.2',
      'Reports of Studies Pertinent to Pharmacokinetics',
      'Reports of PK studies using human biomaterials',
      'Include plasma protein binding and hepatic metabolism studies.'
    ),
    sections: [
      { id: '5.3.2.1', title: 'Plasma Protein Binding Study Reports', required: false },
      { id: '5.3.2.2', title: 'Hepatic Metabolism and Interaction Study Reports', required: false },
      { id: '5.3.2.3', title: 'Studies Using Other Human Biomaterials', required: false },
    ],
  },
  {
    ...createTemplateBase(
      'module5',
      '5.3.3',
      'Reports of Human Pharmacokinetic Studies',
      'Reports of PK studies in healthy subjects and patients',
      'Include studies evaluating effects of intrinsic and extrinsic factors.'
    ),
    sections: [
      { id: '5.3.3.1', title: 'Healthy Subject PK and Initial Tolerability Study Reports', required: true },
      { id: '5.3.3.2', title: 'Patient PK and Initial Tolerability Study Reports', required: false },
      { id: '5.3.3.3', title: 'Intrinsic Factor PK Study Reports', required: false },
      { id: '5.3.3.4', title: 'Extrinsic Factor PK Study Reports', required: false },
      { id: '5.3.3.5', title: 'Population PK Study Reports', required: false },
    ],
  },
  {
    ...createTemplateBase(
      'module5',
      '5.3.4',
      'Reports of Human Pharmacodynamic Studies',
      'Reports of pharmacodynamic studies in healthy subjects and patients',
      'Include studies that relate PD to efficacy or safety.'
    ),
    sections: [
      { id: '5.3.4.1', title: 'Healthy Subject PD and PK/PD Study Reports', required: false },
      { id: '5.3.4.2', title: 'Patient PD and PK/PD Study Reports', required: false },
    ],
  },
  {
    ...createTemplateBase(
      'module5',
      '5.3.5',
      'Reports of Efficacy and Safety Studies',
      'Reports of controlled and uncontrolled clinical studies',
      'Include study reports for claimed indications and ongoing studies.'
    ),
    sections: [
      { id: '5.3.5.1', title: 'Study Reports of Controlled Clinical Studies Pertinent to the Claimed Indication', required: true },
      { id: '5.3.5.2', title: 'Study Reports of Uncontrolled Clinical Studies', required: false },
      { id: '5.3.5.3', title: 'Reports of Analyses of Data from More than One Study', required: false },
      { id: '5.3.5.4', title: 'Other Clinical Study Reports', required: false },
    ],
  },
  {
    ...createTemplateBase(
      'module5',
      '5.3.6',
      'Reports of Post-Marketing Experience',
      'Reports based on post-marketing experience',
      'Include reports from regions where product is already approved.'
    ),
    sections: [
      { id: '5.3.6.1', title: 'Post-Marketing Safety Reports', required: false },
      { id: '5.3.6.2', title: 'Post-Marketing Efficacy Reports', required: false },
    ],
  },
  {
    ...createTemplateBase(
      'module5',
      '5.3.7',
      'Case Report Forms and Individual Patient Listings',
      'Case report forms and patient data listings',
      'Include for deaths, serious adverse events, and withdrawals.'
    ),
    sections: [
      { id: '5.3.7.1', title: 'Case Report Forms', required: false },
      { id: '5.3.7.2', title: 'Individual Patient Data Listings', required: false },
    ],
  },
  {
    ...createTemplateBase(
      'module5',
      '5.4',
      'Literature References',
      'Published literature relevant to clinical information',
      'Include full text of all references cited in Module 5.'
    ),
    sections: [
      { id: '5.4.1', title: 'Efficacy Literature', required: false },
      { id: '5.4.2', title: 'Safety Literature', required: false },
      { id: '5.4.3', title: 'PK/PD Literature', required: false },
    ],
  },
];

// Combine all modules
const allTemplates = [
  ...module1Templates,
  ...module2Templates,
  ...module3Templates,
  ...module4Templates,
  ...module5Templates,
];

// Export all templates
export { 
  allTemplates,
  module1Templates,
  module2Templates, 
  module3Templates,
  module4Templates,
  module5Templates,
  createTemplateBase 
};