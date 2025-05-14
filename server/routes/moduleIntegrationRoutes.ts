/**
 * Module Integration Routes
 * 
 * This file defines API routes for module integration and unified workflow functionality.
 */

import { Router } from 'express';
import { moduleIntegrationService, registerDocumentSchema } from '../services/ModuleIntegrationService';
import { workflowService } from '../services/WorkflowService';

const router = Router();

// Get document by module ID
router.get('/documents/module/:moduleType/:originalId', async (req, res) => {
  try {
    const { moduleType, originalId } = req.params;
    const organizationId = parseInt(req.query.organizationId as string, 10);
    
    if (!moduleType || !originalId || isNaN(organizationId)) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const result = await moduleIntegrationService.getDocumentByModuleId(
      moduleType,
      originalId,
      organizationId
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error retrieving document by module ID:', error);
    res.status(500).json({ error: 'Failed to retrieve document' });
  }
});

// Register a document from a module
router.post('/documents/register', async (req, res) => {
  try {
    // Validate the request body (will throw if invalid)
    const validatedData = registerDocumentSchema.parse(req.body);
    
    const result = await moduleIntegrationService.registerModuleDocument(validatedData);
    res.status(201).json(result);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    console.error('Error registering document:', error);
    res.status(500).json({ error: 'Failed to register document' });
  }
});

// Update a document
router.patch('/documents/:id', async (req, res) => {
  try {
    const documentId = parseInt(req.params.id, 10);
    
    if (isNaN(documentId)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }
    
    const result = await moduleIntegrationService.updateDocument(documentId, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Get documents for a module
router.get('/documents/module/:moduleType', async (req, res) => {
  try {
    const { moduleType } = req.params;
    const organizationId = parseInt(req.query.organizationId as string, 10);
    
    if (!moduleType || isNaN(organizationId)) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const documents = await moduleIntegrationService.getModuleDocuments(
      moduleType,
      organizationId
    );
    
    res.json(documents);
  } catch (error) {
    console.error('Error retrieving module documents:', error);
    res.status(500).json({ error: 'Failed to retrieve documents' });
  }
});

// Create a workflow for a document
router.post('/documents/:id/workflows', async (req, res) => {
  try {
    const documentId = parseInt(req.params.id, 10);
    const { templateId, startedBy, metadata } = req.body;
    
    if (isNaN(documentId) || !templateId || !startedBy) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const result = await moduleIntegrationService.createDocumentWorkflow(
      documentId,
      templateId,
      startedBy,
      metadata
    );
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

// Get workflows for a document
router.get('/documents/:id/workflows', async (req, res) => {
  try {
    const documentId = parseInt(req.params.id, 10);
    
    if (isNaN(documentId)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }
    
    const workflows = await workflowService.getDocumentWorkflows(documentId);
    res.json(workflows);
  } catch (error) {
    console.error('Error retrieving document workflows:', error);
    res.status(500).json({ error: 'Failed to retrieve workflows' });
  }
});

// Get workflow details
router.get('/workflows/:id', async (req, res) => {
  try {
    const workflowId = parseInt(req.params.id, 10);
    
    if (isNaN(workflowId)) {
      return res.status(400).json({ error: 'Invalid workflow ID' });
    }
    
    const workflow = await workflowService.getWorkflow(workflowId);
    res.json(workflow);
  } catch (error) {
    console.error('Error retrieving workflow:', error);
    res.status(500).json({ error: 'Failed to retrieve workflow' });
  }
});

// Approve a workflow step
router.post('/workflows/approvals/:id/approve', async (req, res) => {
  try {
    const approvalId = parseInt(req.params.id, 10);
    const { userId, comments } = req.body;
    
    if (isNaN(approvalId) || !userId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const result = await workflowService.approveStep(approvalId, userId, comments);
    res.json(result);
  } catch (error) {
    console.error('Error approving workflow step:', error);
    res.status(500).json({ error: 'Failed to approve workflow step' });
  }
});

// Reject a workflow step
router.post('/workflows/approvals/:id/reject', async (req, res) => {
  try {
    const approvalId = parseInt(req.params.id, 10);
    const { userId, comments } = req.body;
    
    if (isNaN(approvalId) || !userId || !comments) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const result = await workflowService.rejectStep(approvalId, userId, comments);
    res.json(result);
  } catch (error) {
    console.error('Error rejecting workflow step:', error);
    res.status(500).json({ error: 'Failed to reject workflow step' });
  }
});

// Get workflow templates for an organization and module
router.get('/workflow-templates', async (req, res) => {
  try {
    const organizationId = parseInt(req.query.organizationId as string, 10);
    const moduleType = req.query.moduleType as string;
    
    if (isNaN(organizationId) || !moduleType) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const templates = await workflowService.getWorkflowTemplates(organizationId, moduleType);
    res.json(templates);
  } catch (error) {
    console.error('Error retrieving workflow templates:', error);
    res.status(500).json({ error: 'Failed to retrieve workflow templates' });
  }
});

// Create workflow template
router.post('/workflow-templates', async (req, res) => {
  try {
    const template = await workflowService.createWorkflowTemplate(req.body);
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating workflow template:', error);
    res.status(500).json({ error: 'Failed to create workflow template' });
  }
});

// Create default workflow templates
router.post('/workflow-templates/defaults', async (req, res) => {
  try {
    const { organizationId, createdBy } = req.body;
    
    if (!organizationId || !createdBy) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const templates = await moduleIntegrationService.createDefaultWorkflowTemplates(
      organizationId,
      createdBy
    );
    
    res.status(201).json(templates);
  } catch (error) {
    console.error('Error creating default workflow templates:', error);
    res.status(500).json({ error: 'Failed to create default workflow templates' });
  }
});

// Get document counts by type
router.get('/documents/counts/by-type', async (req, res) => {
  try {
    const organizationId = parseInt(req.query.organizationId as string, 10);
    
    if (isNaN(organizationId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }
    
    const counts = await moduleIntegrationService.getDocumentCountByType(organizationId);
    res.json(counts);
  } catch (error) {
    console.error('Error retrieving document counts:', error);
    res.status(500).json({ error: 'Failed to retrieve document counts' });
  }
});

// Get recent documents for user
router.get('/documents/recent', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string, 10);
    const organizationId = parseInt(req.query.organizationId as string, 10);
    const limit = parseInt(req.query.limit as string || '10', 10);
    
    if (isNaN(userId) || isNaN(organizationId)) {
      return res.status(400).json({ error: 'Invalid user or organization ID' });
    }
    
    const documents = await moduleIntegrationService.getRecentDocumentsForUser(
      userId,
      organizationId,
      limit
    );
    
    res.json(documents);
  } catch (error) {
    console.error('Error retrieving recent documents:', error);
    res.status(500).json({ error: 'Failed to retrieve recent documents' });
  }
});

// Get documents in review
router.get('/documents/in-review', async (req, res) => {
  try {
    const organizationId = parseInt(req.query.organizationId as string, 10);
    
    if (isNaN(organizationId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }
    
    const documents = await moduleIntegrationService.getDocumentsInReview(organizationId);
    res.json(documents);
  } catch (error) {
    console.error('Error retrieving documents in review:', error);
    res.status(500).json({ error: 'Failed to retrieve documents in review' });
  }
});

// Compare document versions
router.get('/documents/compare', async (req, res) => {
  try {
    const currentVersionId = parseInt(req.query.currentVersionId as string, 10);
    const previousVersionId = parseInt(req.query.previousVersionId as string, 10);
    
    if (isNaN(currentVersionId) || isNaN(previousVersionId)) {
      return res.status(400).json({ error: 'Invalid document version IDs' });
    }
    
    const comparison = await moduleIntegrationService.compareDocumentVersions(
      currentVersionId,
      previousVersionId
    );
    
    res.json(comparison);
  } catch (error) {
    console.error('Error comparing document versions:', error);
    res.status(500).json({ error: 'Failed to compare document versions' });
  }
});

// Get pending approvals for user
router.get('/workflows/pending-approvals', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const pendingApprovals = await workflowService.findUserPendingApprovals(userId);
    res.json(pendingApprovals);
  } catch (error) {
    console.error('Error retrieving pending approvals:', error);
    res.status(500).json({ error: 'Failed to retrieve pending approvals' });
  }
});

export default router;