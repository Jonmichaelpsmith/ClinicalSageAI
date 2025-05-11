/**
 * Microsoft Office Integration Routes
 * 
 * This file contains Express routes for handling Microsoft Office integration,
 * particularly for Word document management in the eCTD Co-Author module.
 */

const express = require('express');
const router = express.Router();
const { getPool } = require('../database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const structuredClone = require('structured-clone');
const { getTenantContext } = require('../middleware/tenantContext');

// Configure file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { organizationId } = getTenantContext(req);
    const dir = path.join(__dirname, '../../uploads/office-documents', String(organizationId));
    
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

/**
 * Get all documents for the current user's organization
 */
router.get('/api/ms-office/documents', async (req, res) => {
  try {
    const pool = getPool();
    const { organizationId } = getTenantContext(req);
    
    const result = await pool.query(
      `SELECT id, name, description, document_type, status, created_at, updated_at, 
       created_by_id, file_path, version, ectd_module, regulatory_type
       FROM office_documents 
       WHERE organization_id = $1 
       ORDER BY updated_at DESC`,
      [organizationId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

/**
 * Get document by ID
 */
router.get('/api/ms-office/documents/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { organizationId } = getTenantContext(req);
    const documentId = req.params.id;
    
    const result = await pool.query(
      `SELECT id, name, description, document_type, status, created_at, updated_at, 
       created_by_id, file_path, content, version, ectd_module, regulatory_type
       FROM office_documents 
       WHERE id = $1 AND organization_id = $2`,
      [documentId, organizationId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

/**
 * Create a new document
 */
router.post('/api/ms-office/documents', async (req, res) => {
  try {
    const pool = getPool();
    const { organizationId } = getTenantContext(req);
    const userId = req.user?.id || null;
    const { name, description, documentType, content, ectdModule, regulatoryType } = req.body;
    
    const result = await pool.query(
      `INSERT INTO office_documents 
       (name, description, document_type, content, organization_id, created_by_id, ectd_module, regulatory_type, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft')
       RETURNING id, name, description, document_type, status, created_at, updated_at, version`,
      [name, description, documentType, content, organizationId, userId, ectdModule, regulatoryType]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

/**
 * Update a document
 */
router.put('/api/ms-office/documents/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { organizationId } = getTenantContext(req);
    const documentId = req.params.id;
    const userId = req.user?.id || null;
    const { name, description, content, ectdModule, regulatoryType, status } = req.body;
    
    // First check if document exists and belongs to organization
    const checkResult = await pool.query(
      `SELECT id FROM office_documents WHERE id = $1 AND organization_id = $2`,
      [documentId, organizationId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Update the document
    const updateResult = await pool.query(
      `UPDATE office_documents
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           content = COALESCE($3, content),
           ectd_module = COALESCE($4, ectd_module),
           regulatory_type = COALESCE($5, regulatory_type),
           status = COALESCE($6, status),
           updated_at = NOW(),
           version = version + 1
       WHERE id = $7 AND organization_id = $8
       RETURNING id, name, description, document_type, status, created_at, updated_at, version`,
      [name, description, content, ectdModule, regulatoryType, status, documentId, organizationId]
    );
    
    // Store document version history
    if (content) {
      await pool.query(
        `INSERT INTO office_document_versions
         (document_id, version, content, created_by_id)
         VALUES ($1, (SELECT version FROM office_documents WHERE id = $1), $2, $3)`,
        [documentId, content, userId]
      );
    }
    
    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

/**
 * Upload a document file
 */
router.post('/api/ms-office/documents/upload', upload.single('file'), async (req, res) => {
  try {
    const pool = getPool();
    const { organizationId } = getTenantContext(req);
    const userId = req.user?.id || null;
    const file = req.file;
    const { name, description, documentType, ectdModule, regulatoryType } = req.body;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const result = await pool.query(
      `INSERT INTO office_documents 
       (name, description, document_type, file_path, organization_id, created_by_id, ectd_module, regulatory_type, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft')
       RETURNING id, name, description, document_type, status, created_at, updated_at, file_path`,
      [
        name || file.originalname, 
        description || '', 
        documentType || 'word', 
        file.path, 
        organizationId, 
        userId, 
        ectdModule || null, 
        regulatoryType || null
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

/**
 * Get document versions
 */
router.get('/api/ms-office/documents/:id/versions', async (req, res) => {
  try {
    const pool = getPool();
    const { organizationId } = getTenantContext(req);
    const documentId = req.params.id;
    
    // First check if document exists and belongs to organization
    const checkResult = await pool.query(
      `SELECT id FROM office_documents WHERE id = $1 AND organization_id = $2`,
      [documentId, organizationId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const result = await pool.query(
      `SELECT version, created_at, created_by_id
       FROM office_document_versions
       WHERE document_id = $1
       ORDER BY version DESC`,
      [documentId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching document versions:', error);
    res.status(500).json({ error: 'Failed to fetch document versions' });
  }
});

/**
 * Get document version content
 */
router.get('/api/ms-office/documents/:id/versions/:version', async (req, res) => {
  try {
    const pool = getPool();
    const { organizationId } = getTenantContext(req);
    const documentId = req.params.id;
    const version = req.params.version;
    
    // First check if document exists and belongs to organization
    const checkResult = await pool.query(
      `SELECT id FROM office_documents WHERE id = $1 AND organization_id = $2`,
      [documentId, organizationId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const result = await pool.query(
      `SELECT content, created_at, created_by_id
       FROM office_document_versions
       WHERE document_id = $1 AND version = $2`,
      [documentId, version]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Version not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching document version:', error);
    res.status(500).json({ error: 'Failed to fetch document version' });
  }
});

/**
 * Get document templates
 */
router.get('/api/ms-office/templates', async (req, res) => {
  try {
    const pool = getPool();
    const { organizationId } = getTenantContext(req);
    
    const result = await pool.query(
      `SELECT id, name, description, template_type, regulatory_type, ectd_module
       FROM office_templates
       WHERE organization_id = $1 OR is_global = TRUE
       ORDER BY name ASC`,
      [organizationId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

/**
 * Get document template by ID
 */
router.get('/api/ms-office/templates/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { organizationId } = getTenantContext(req);
    const templateId = req.params.id;
    
    const result = await pool.query(
      `SELECT id, name, description, template_type, content, regulatory_type, ectd_module
       FROM office_templates
       WHERE id = $1 AND (organization_id = $2 OR is_global = TRUE)`,
      [templateId, organizationId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

/**
 * Perform compliance check on document
 */
router.post('/api/ms-office/documents/:id/compliance-check', async (req, res) => {
  try {
    const pool = getPool();
    const { organizationId } = getTenantContext(req);
    const documentId = req.params.id;
    const { regulationType } = req.body;
    
    // First check if document exists and belongs to organization
    const docResult = await pool.query(
      `SELECT id, content 
       FROM office_documents 
       WHERE id = $1 AND organization_id = $2`,
      [documentId, organizationId]
    );
    
    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const documentContent = docResult.rows[0].content;
    
    // For now, simulate a compliance check
    // In production, this would call the AI service to perform analysis
    const simulatedResult = {
      compliant: Math.random() > 0.3, // 70% chance of compliance for demo
      score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
      issues: []
    };
    
    // Add some simulated issues
    if (!simulatedResult.compliant) {
      const potentialIssues = [
        {
          id: 'missing-header',
          section: 'Document Header',
          description: 'Missing required header information for eCTD submission',
          recommendation: 'Add standard header with document ID and version',
          severity: 'high'
        },
        {
          id: 'improper-formatting',
          section: 'Section Formatting',
          description: 'Sections not formatted according to ICH guidelines',
          recommendation: 'Apply standard heading formats for all sections',
          severity: 'medium'
        },
        {
          id: 'missing-references',
          section: 'References',
          description: 'Missing required literature references',
          recommendation: 'Add references section with appropriate citations',
          severity: 'medium'
        },
        {
          id: 'excessive-abbreviations',
          section: 'Terminology',
          description: 'Excessive use of undefined abbreviations',
          recommendation: 'Define all abbreviations at first use',
          severity: 'low'
        }
      ];
      
      // Add 1-3 random issues
      const numIssues = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numIssues; i++) {
        const randomIssue = potentialIssues[Math.floor(Math.random() * potentialIssues.length)];
        // Clone to avoid duplicate references
        simulatedResult.issues.push(structuredClone(randomIssue));
      }
    }
    
    // Store the compliance check result
    await pool.query(
      `INSERT INTO office_document_compliance
       (document_id, regulatory_type, is_compliant, compliance_score, issues, check_date)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [documentId, regulationType, simulatedResult.compliant, simulatedResult.score, JSON.stringify(simulatedResult.issues)]
    );
    
    res.json(simulatedResult);
  } catch (error) {
    console.error('Error performing compliance check:', error);
    res.status(500).json({ error: 'Failed to perform compliance check' });
  }
});

/**
 * Get regulatory section content
 */
router.get('/api/ms-office/regulatory-sections/:sectionType', async (req, res) => {
  try {
    const sectionType = req.params.sectionType;
    const { regulationType } = req.query;
    
    // Map of pre-defined regulatory section templates
    const regulatorySections = {
      'gcp-statement': {
        title: 'Good Clinical Practice Statement',
        content: 'This study was conducted in accordance with the principles of the Declaration of Helsinki and Good Clinical Practice guidelines as defined by the International Conference on Harmonisation.'
      },
      'adverse-events': {
        title: 'Adverse Events Reporting',
        content: 'All adverse events were collected and recorded throughout the study period, from the time of informed consent until the end of follow-up. Events were categorized according to severity, causality, and seriousness in accordance with regulatory guidance.'
      },
      'eligibility': {
        title: 'Eligibility Criteria',
        content: 'Inclusion Criteria:\n1. Adults aged 18 years or older\n2. Diagnosis confirmed by [specific criteria]\n3. Able to provide informed consent\n\nExclusion Criteria:\n1. Participation in another clinical trial within 30 days\n2. Known hypersensitivity to study medication or components\n3. Significant medical condition that would interfere with study participation'
      },
      'consent': {
        title: 'Informed Consent',
        content: 'Written informed consent was obtained from all study participants prior to performing any study-related procedures. The consent process included a thorough explanation of the study procedures, potential risks and benefits, alternatives to participation, and the voluntary nature of participation.'
      },
      'privacy': {
        title: 'Privacy and Confidentiality',
        content: 'All participant information was handled in strict confidence in accordance with applicable data protection laws. Participant data was de-identified using unique identifiers, and all study documents were stored securely with access limited to authorized personnel.'
      }
    };
    
    if (!regulatorySections[sectionType]) {
      return res.status(404).json({ error: 'Regulatory section not found' });
    }
    
    res.json(regulatorySections[sectionType]);
  } catch (error) {
    console.error('Error fetching regulatory section:', error);
    res.status(500).json({ error: 'Failed to fetch regulatory section' });
  }
});

module.exports = router;