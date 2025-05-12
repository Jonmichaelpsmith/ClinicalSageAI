/**
 * Google Docs integration configuration
 * Contains template definitions and sample document references
 */

export const DOCUMENT_TEMPLATES = [
  {
    id: 'template_1',
    name: 'Module 2.5 - Clinical Overview',
    type: 'clinical',
    description: 'eCTD Module 2.5 template with standard headings',
  },
  {
    id: 'template_2',
    name: 'Module 3.2.P - Quality (Drug Product)',
    type: 'quality',
    description: 'eCTD Module 3.2.P template for drug product information',
  },
  {
    id: 'template_3',
    name: 'Module 4.2.1 - Nonclinical Study Reports',
    type: 'nonclinical',
    description: 'eCTD Module 4.2.1 template for nonclinical study reports',
  },
  {
    id: 'template_4',
    name: 'Module 5.3.5 - Clinical Study Reports',
    type: 'clinical',
    description: 'eCTD Module 5.3.5 template for clinical study reports',
  },
];

export const SAMPLE_DOCUMENTS = [
  {
    id: 'doc_1',
    name: 'Clinical Overview - Compound ABC',
    module: '2.5',
    lastEdited: '2025-05-10T14:30:45Z',
    status: 'Draft',
    reviewStatus: 'Pending Review',
    author: 'Jane Smith',
    collaborators: ['Alex Johnson', 'Maria Garcia'],
    description: 'Clinical overview document for Compound ABC',
  },
  {
    id: 'doc_2',
    name: 'Quality Documentation - Drug Product',
    module: '3.2.P',
    lastEdited: '2025-05-09T10:15:22Z',
    status: 'In Progress',
    reviewStatus: 'Pending Review',
    author: 'Robert Chen',
    collaborators: ['Sarah Williams'],
    description: 'Quality documentation for drug product manufacturing and controls',
  },
  {
    id: 'doc_3',
    name: 'CSR - Phase 2 Study XYZ-001',
    module: '5.3.5',
    lastEdited: '2025-05-11T09:45:30Z',
    status: 'Complete',
    reviewStatus: 'Reviewed',
    author: 'Michael Brown',
    collaborators: ['David Wilson', 'Emily Taylor', 'James Anderson'],
    description: 'Clinical Study Report for Phase 2 Study XYZ-001',
  },
];

export const GOOGLE_API_CONFIG = {
  apiKey: process.env.GOOGLE_API_KEY || '',
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  scopes: [
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ],
  discoveryDocs: [
    'https://docs.googleapis.com/$discovery/rest?version=v1',
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
  ]
};