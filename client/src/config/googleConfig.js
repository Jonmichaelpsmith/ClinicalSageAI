/**
 * Google API Configuration
 * 
 * This file contains configuration settings for Google API integration,
 * including OAuth scopes and API endpoints.
 */

// OAuth configuration
export const GOOGLE_CONFIG = {
  // These values would come from your Google Cloud Console project
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'your-client-id',
  API_KEY: process.env.GOOGLE_API_KEY || 'your-api-key',
  DISCOVERY_DOCS: [
    'https://docs.googleapis.com/$discovery/rest?version=v1',
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
  ],
  SCOPES: [
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ]
};

// Sample document IDs for testing
export const SAMPLE_DOCUMENTS = {
  "module_2_5": "1LfAYfIxHWDNTxzzHK9HuZZvDJCZpPGXbDJF-UaXgTf8", // Clinical Overview template 
  "module_2_7": "1lHBM9PlzCDuiJaVeUFvCuqglEELXJRBGTJFHvcfSYw4", // Clinical Summary template
  "default": "1B1AYPsjPO-Fvdovua3vPg9PY14IXLujk4lvkEiH0wNo"
};

// API endpoints
export const API_ENDPOINTS = {
  CREATE_DOC: '/api/google-docs/create',
  EXPORT_DOC: '/api/google-docs/export',
  SAVE_TO_VAULT: '/api/google-docs/save-to-vault'
};

// Templates categorized by module
export const DOCUMENT_TEMPLATES = {
  "module_1": {
    "cover_letter": "template-id-for-cover-letter",
    "form_1571": "template-id-for-form-1571",
    "investigator_brochure": "template-id-for-investigator-brochure"
  },
  "module_2": {
    "clinical_overview": SAMPLE_DOCUMENTS.module_2_5,
    "clinical_summary": SAMPLE_DOCUMENTS.module_2_7,
    "quality_overall_summary": "template-id-for-quality-overall-summary"
  },
  "module_3": {
    "quality_manufacturing": "template-id-for-quality-manufacturing",
    "batch_analysis": "template-id-for-batch-analysis"
  },
  "module_4": {
    "toxicology_summary": "template-id-for-toxicology-summary"
  },
  "module_5": {
    "clinical_study_report": "template-id-for-clinical-study-report",
    "protocol": "template-id-for-protocol"
  }
};