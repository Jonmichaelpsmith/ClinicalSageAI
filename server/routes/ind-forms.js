/**
 * IND Forms API Router
 * 
 * This module handles all API endpoints related to FDA forms generation,
 * data retrieval, and management for the IND Wizard.
 */

import express from 'express';
import { createRouter } from '../router.js';
import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';

// Sample form data for development/demo
const mockFormData = {
  '1571': {
    sponsor_name: 'TrialSage Pharmaceuticals',
    sponsor_address: '123 Innovation Way\nBiotech Center, Suite 400\nResearch Triangle, NC 27709',
    sponsor_phone: '(919) 555-7890',
    ind_number: 'PENDING',
    drug_name: 'Enzymax Forte',
    indication: 'Treatment of Severe Pancreatic Enzyme Deficiency',
    phase: 'Phase 1',
    protocol_number: 'EP-2025-001',
    protocol_title: 'A Phase 1, Randomized, Double-Blind, Placebo-Controlled Study to Evaluate the Safety, Tolerability, Pharmacokinetics, and Pharmacodynamics of Enzymax Forte in Healthy Adult Volunteers',
    principal_investigator: 'Dr. Jane Smith',
    contact_name: 'Robert Johnson',
    contact_phone: '(919) 555-7891',
    contact_email: 'rjohnson@trialsagepharma.com',
    authorized_representative: 'Elizabeth Chen, Ph.D.',
    representative_title: 'Chief Scientific Officer',
    certification_date: '2025-04-15'
  },
  '1572': {
    investigator_name: 'Dr. Jane Smith',
    investigator_address: 'University Medical Center\n456 Clinical Avenue\nResearch Triangle, NC 27710',
    investigator_phone: '(919) 555-8900',
    investigator_email: 'jsmith@umc.edu',
    education: 'M.D., University of North Carolina, 2010\nResidency in Internal Medicine, Duke University Medical Center, 2013',
    facility_name: 'University Medical Center Clinical Research Unit',
    facility_address: '456 Clinical Avenue, Room 205\nResearch Triangle, NC 27710',
    irb_name: 'University Medical Center Institutional Review Board',
    irb_address: '456 Clinical Avenue, West Wing 300\nResearch Triangle, NC 27710',
    phase: 'Phase 1',
    subinvestigators: 'Dr. Michael Chen, M.D.\nDr. Sarah Williams, Pharm.D.',
    certification_date: '2025-04-20'
  },
  '3674': {
    sponsor_name: 'TrialSage Pharmaceuticals',
    submission_type: 'Initial IND',
    certification_option: 'A',
    nct_number: '',
    explanation: 'Initial IND submission. Protocol not yet registered on ClinicalTrials.gov. Will be registered upon IND activation.',
    authorized_representative: 'Elizabeth Chen, Ph.D.',
    representative_title: 'Chief Scientific Officer',
    certification_date: '2025-04-15'
  },
  '3454': {
    sponsor_name: 'TrialSage Pharmaceuticals',
    product_name: 'Enzymax Forte',
    application_number: 'PENDING',
    study_number: 'EP-2025-001',
    certification_option: '1',
    authorized_representative: 'Elizabeth Chen, Ph.D.',
    representative_title: 'Chief Scientific Officer',
    certification_date: '2025-04-15'
  }
};

// Create Express Router instance
const router = createRouter();

/**
 * Get form data for a specific project and form
 * 
 * Route: GET /api/ind/:projectId/forms/:formId/data
 */
router.get('/api/ind/:projectId/forms/:formId/data', (req, res) => {
  const { projectId, formId } = req.params;
  
  try {
    // For development/demo, use mock data
    // In production, this would query the database
    
    if (mockFormData[formId]) {
      return res.json(mockFormData[formId]);
    }
    
    return res.status(404).json({
      error: 'Form data not found',
      message: `No data found for form ${formId} in project ${projectId}`
    });
  } catch (error) {
    console.error(`[Forms API] Error fetching form data: ${error.message}`);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to retrieve form data'
    });
  }
});

/**
 * Save form data for a specific project and form
 * 
 * Route: PUT /api/ind/:projectId/forms/:formId/data
 */
router.put('/api/ind/:projectId/forms/:formId/data', (req, res) => {
  const { projectId, formId } = req.params;
  const formData = req.body;
  
  try {
    // For development/demo, just log and return success
    // In production, this would update the database
    
    console.log(`[Forms API] Saving form data for ${formId} in project ${projectId}:`, formData);
    
    // Update the mock data for this demo
    mockFormData[formId] = {
      ...mockFormData[formId],
      ...formData
    };
    
    return res.json({
      success: true,
      message: `Form ${formId} data saved successfully`
    });
  } catch (error) {
    console.error(`[Forms API] Error saving form data: ${error.message}`);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to save form data'
    });
  }
});

/**
 * Generate a form for a specific project
 * 
 * Route: POST /api/ind/:projectId/forms/:formId/generate
 */
router.post('/api/ind/:projectId/forms/:formId/generate', async (req, res) => {
  const { projectId, formId } = req.params;
  const formData = req.body || mockFormData[formId];
  
  try {
    console.log(`[Forms API] Generating form ${formId} for project ${projectId}`);
    
    // For development/demo, handle with a mock response
    // In production, this would call the form generation service
    
    // Create a record of the generation for history
    const generationRecord = {
      projectId,
      formId,
      timestamp: new Date().toISOString(),
      status: 'completed',
      generatedBy: req.user?.id || 'system',
      downloadUrl: `/api/ind/${projectId}/forms/${formId}/download/${Date.now()}`
    };
    
    console.log(`[Forms API] Form generation record:`, generationRecord);
    
    // Return a successful response with download info
    return res.json({
      success: true,
      message: `Form ${formId} generated successfully`,
      formId,
      projectId,
      timestamp: generationRecord.timestamp,
      downloadUrl: generationRecord.downloadUrl
    });
  } catch (error) {
    console.error(`[Forms API] Error generating form: ${error.message}`);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to generate form'
    });
  }
});

/**
 * Download a generated form
 * 
 * Route: GET /api/ind/:projectId/forms/:formId/download/:timestamp?
 */
router.get('/api/ind/:projectId/forms/:formId/download/:timestamp?', (req, res) => {
  const { projectId, formId, timestamp } = req.params;
  
  try {
    console.log(`[Forms API] Downloading form ${formId} for project ${projectId}`);
    
    // For development/demo, serve a sample PDF
    // In production, this would retrieve the actual generated document
    
    const sampleFormPath = path.join(process.cwd(), 'ind_mock', `form_${formId}_sample.pdf`);
    
    // Check if the sample file exists
    if (fs.existsSync(sampleFormPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Form_FDA_${formId}_${projectId}.pdf"`);
      return res.sendFile(sampleFormPath);
    }
    
    // If no sample file exists, generate a simple PDF response
    res.setHeader('Content-Type', 'application/json');
    return res.json({
      message: `Sample PDF for Form FDA ${formId} is not available in the development environment.`,
      note: `In production, this endpoint would return the actual generated PDF document.`
    });
  } catch (error) {
    console.error(`[Forms API] Error downloading form: ${error.message}`);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to download form'
    });
  }
});

/**
 * Get form guidance for a specific form
 * 
 * Route: GET /api/ind/:projectId/forms/:formId/guidance
 */
router.get('/api/ind/:projectId/forms/:formId/guidance', (req, res) => {
  const { formId } = req.params;
  
  // Map of form guidance data
  const guidanceData = {
    '1571': {
      description: 'Form FDA 1571 (Investigational New Drug Application) is the primary application form that initiates the IND process. It collects essential information about the sponsor, drug, and the proposed clinical investigation.',
      tips: [
        'Ensure all sections are complete and accurate',
        'Verify drug name is consistent with CMC documentation',
        'Include all relevant contact information',
        'Ensure the authorized representative has appropriate authority'
      ],
      common_issues: [
        'Incomplete sponsor or drug information',
        'Missing or inconsistent protocol information',
        'Improper certification statement acknowledgement',
        'Inconsistency with supporting documents'
      ]
    },
    '1572': {
      description: 'Form FDA 1572 (Statement of Investigator) is completed by each principal investigator who will conduct the clinical investigation. It outlines their qualifications and commitments.',
      tips: [
        'Ensure all education and training information is current',
        'List all sub-investigators who will assist',
        'Include all facilities where the investigation will be conducted',
        'Carefully review commitment statements before signing'
      ],
      common_issues: [
        'Outdated credentials or information',
        'Missing sub-investigators',
        'Incomplete facility information',
        'Inconsistency with clinical protocol'
      ]
    },
    '3674': {
      description: 'Form FDA 3674 certifies compliance with the requirements to register applicable clinical trials on ClinicalTrials.gov.',
      tips: [
        'Verify ClinicalTrials.gov registration status before completing',
        'Ensure NCT number is accurate if already registered',
        'Select the appropriate certification statement',
        'Include explanation if certification requirements not applicable'
      ],
      common_issues: [
        'Incorrect certification statement selection',
        'Missing or invalid NCT number',
        'Failure to register trial before submission',
        'Inconsistency with ClinicalTrials.gov record'
      ]
    },
    '3454': {
      description: 'Form FDA 3454 (Certification: Financial Interests and Arrangements of Clinical Investigators) addresses financial conflicts of interest.',
      tips: [
        'Collect financial disclosure information from all investigators',
        'Ensure appropriate certification option is selected',
        'Maintain documentation supporting the certification',
        'Update if financial arrangements change'
      ],
      common_issues: [
        'Incomplete financial disclosure collection',
        'Incorrect certification option selection',
        'Missing supporting documentation',
        'Failure to update when arrangements change'
      ]
    }
  };
  
  try {
    if (guidanceData[formId]) {
      return res.json(guidanceData[formId]);
    }
    
    return res.status(404).json({
      error: 'Guidance not found',
      message: `No guidance available for form ${formId}`
    });
  } catch (error) {
    console.error(`[Forms API] Error fetching form guidance: ${error.message}`);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to retrieve form guidance'
    });
  }
});

/**
 * Get form status for a specific project and form
 * 
 * Route: GET /api/ind/:projectId/forms/:formId/status
 */
router.get('/api/ind/:projectId/forms/:formId/status', (req, res) => {
  const { projectId, formId } = req.params;
  
  try {
    // For development/demo, use simplified status responses
    // In production, this would query the database for actual status
    
    // Map of form statuses for this demo
    const formStatuses = {
      '1571': {
        status: 'in_progress',
        lastUpdated: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        version: 2,
        aiRecommendations: [
          'Double-check consistency between drug name and CMC documentation',
          'Ensure protocol number matches throughout all documentation',
          'Verify contact information is current and accessible'
        ]
      },
      '1572': {
        status: 'not_started',
        lastUpdated: null,
        version: null,
        aiRecommendations: [
          'Begin by confirming investigator credentials and affiliations',
          'Prepare list of all clinical investigation sites',
          'Identify all potential sub-investigators who will assist'
        ]
      },
      '3674': {
        status: 'not_started',
        lastUpdated: null,
        version: null,
        aiRecommendations: [
          'Determine if clinical trial registration is required for your study',
          'If applicable, begin ClinicalTrials.gov registration process early',
          'Prepare explanation if registration is not yet complete'
        ]
      },
      '3454': {
        status: 'completed',
        lastUpdated: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        version: 1,
        aiRecommendations: [
          'Review to ensure all investigators have provided financial disclosure information',
          'Verify certification option selection is appropriate',
          'Confirm supporting documentation is properly maintained'
        ]
      }
    };
    
    if (formStatuses[formId]) {
      return res.json(formStatuses[formId]);
    }
    
    return res.status(404).json({
      error: 'Status not found',
      message: `No status information available for form ${formId} in project ${projectId}`
    });
  } catch (error) {
    console.error(`[Forms API] Error fetching form status: ${error.message}`);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to retrieve form status'
    });
  }
});

export default router;