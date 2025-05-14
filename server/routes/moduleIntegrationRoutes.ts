import express from 'express';
import { ModuleIntegrationService } from '../services/ModuleIntegrationService';
import { WorkflowService } from '../services/WorkflowService';

const router = express.Router();
const moduleIntegrationService = new ModuleIntegrationService();
const workflowService = new WorkflowService();

/**
 * Register a document from a module in the unified system
 */
router.post('/register-document', async (req, res) => {
  try {
    const documentData = req.body;
    const result = await moduleIntegrationService.registerModuleDocument(documentData);
    res.json(result);
  } catch (error) {
    console.error('Error registering document:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get a document by its module-specific ID
 */
router.get('/document/:moduleType/:originalId', async (req, res) => {
  try {
    const { moduleType, originalId } = req.params;
    const organizationId = Number(req.query.organizationId);
    
    if (!moduleType || !originalId || isNaN(organizationId)) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const document = await moduleIntegrationService.getDocumentByModuleId(
      moduleType, 
      originalId, 
      organizationId
    );
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get documents for a module
 */
router.get('/documents/:moduleType', async (req, res) => {
  try {
    const { moduleType } = req.params;
    const organizationId = Number(req.query.organizationId);
    
    if (!moduleType || isNaN(organizationId)) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const documents = await moduleIntegrationService.getModuleDocuments(moduleType, organizationId);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get document counts by type
 */
router.get('/document-counts', async (req, res) => {
  try {
    const organizationId = Number(req.query.organizationId);
    
    if (isNaN(organizationId)) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const counts = await moduleIntegrationService.getDocumentCountByType(organizationId);
    res.json(counts);
  } catch (error) {
    console.error('Error fetching document counts:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get documents in review
 */
router.get('/documents-in-review', async (req, res) => {
  try {
    const organizationId = Number(req.query.organizationId);
    
    if (isNaN(organizationId)) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const documents = await moduleIntegrationService.getDocumentsInReview(organizationId);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents in review:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Compare document versions
 */
router.get('/compare-versions', async (req, res) => {
  try {
    const currentVersionId = Number(req.query.currentVersionId);
    const previousVersionId = Number(req.query.previousVersionId);
    
    if (isNaN(currentVersionId) || isNaN(previousVersionId)) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const comparison = await moduleIntegrationService.compareDocumentVersions(
      currentVersionId, 
      previousVersionId
    );
    
    res.json(comparison);
  } catch (error) {
    console.error('Error comparing versions:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get workflow templates for a module
 */
router.get('/templates/:moduleType', async (req, res) => {
  try {
    const { moduleType } = req.params;
    const organizationId = Number(req.query.organizationId);
    
    if (!moduleType || isNaN(organizationId)) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const templates = await workflowService.getTemplates(moduleType, organizationId);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create default templates for a module
 */
router.post('/create-default-templates', async (req, res) => {
  try {
    const { moduleType, organizationId, createdBy } = req.body;
    
    if (!moduleType || !organizationId || !createdBy) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const templates = await workflowService.createDefaultTemplates(
      moduleType, 
      Number(organizationId), 
      Number(createdBy)
    );
    
    res.json(templates);
  } catch (error) {
    console.error('Error creating default templates:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create a workflow template
 */
router.post('/templates', async (req, res) => {
  try {
    const templateData = req.body;
    const template = await workflowService.createTemplate(templateData);
    res.json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get document workflows
 */
router.get('/document-workflows/:documentId', async (req, res) => {
  try {
    const documentId = Number(req.params.documentId);
    
    if (isNaN(documentId)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }
    
    const workflows = await workflowService.getDocumentWorkflows(documentId);
    res.json(workflows);
  } catch (error) {
    console.error('Error fetching document workflows:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create a workflow for a document
 */
router.post('/workflows', async (req, res) => {
  try {
    const { documentId, templateId, startedBy, metadata } = req.body;
    
    if (!documentId || !templateId || !startedBy) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const workflow = await workflowService.createWorkflow(
      Number(documentId),
      Number(templateId),
      Number(startedBy),
      metadata || {}
    );
    
    res.json(workflow);
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Approve a workflow step
 */
router.post('/approve-step', async (req, res) => {
  try {
    const { approvalId, userId, comments } = req.body;
    
    if (!approvalId || !userId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const result = await workflowService.approveStep(
      Number(approvalId),
      Number(userId),
      comments || ''
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error approving step:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Reject a workflow step
 */
router.post('/reject-step', async (req, res) => {
  try {
    const { approvalId, userId, comments } = req.body;
    
    if (!approvalId || !userId || !comments) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const result = await workflowService.rejectStep(
      Number(approvalId),
      Number(userId),
      comments
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error rejecting step:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;