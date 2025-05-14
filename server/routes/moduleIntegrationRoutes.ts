/**
 * Module Integration Routes
 * 
 * This file contains the API routes for the module integration service,
 * enabling cross-module document workflow management.
 */

import express from 'express';
import { ModuleIntegrationService } from '../services/ModuleIntegrationService';
import { z } from 'zod';

// Validation schemas for API requests
const registerDocumentSchema = z.object({
  moduleType: z.string(),
  originalDocumentId: z.string(),
  title: z.string(),
  documentType: z.string(),
  organizationId: z.number(),
  userId: z.number(),
  metadata: z.record(z.any()).optional(),
  content: z.any().optional(),
  vaultFolderId: z.number().optional().nullable()
});

const initiateWorkflowSchema = z.object({
  templateId: z.number(),
  userId: z.number(),
  metadata: z.record(z.any()).optional()
});

const submitApprovalSchema = z.object({
  userId: z.number(),
  status: z.enum(['approved', 'rejected']),
  comments: z.string().optional()
});

const assignUserSchema = z.object({
  userId: z.number(),
  assignedById: z.number()
});

// Create router and service
const router = express.Router();
const moduleIntegrationService = new ModuleIntegrationService();

/**
 * Get module types
 * 
 * Returns the list of available module types
 */
router.get('/module-types', async (req, res) => {
  try {
    const moduleTypes = await moduleIntegrationService.getModuleTypes();
    res.json({ success: true, data: moduleTypes });
  } catch (error) {
    console.error('Error fetching module types:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch module types' });
  }
});

/**
 * Register a document from a module
 * 
 * Registers a document from a specific module in the unified system
 */
router.post('/register-document', async (req, res) => {
  try {
    const validatedData = registerDocumentSchema.parse(req.body);
    
    const document = await moduleIntegrationService.registerDocument(
      validatedData.moduleType,
      validatedData.originalDocumentId,
      validatedData.title,
      validatedData.documentType,
      validatedData.organizationId,
      validatedData.userId,
      validatedData.metadata || {},
      validatedData.content,
      validatedData.vaultFolderId || null
    );
    
    res.json({ success: true, data: document });
  } catch (error) {
    console.error('Error registering document:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ success: false, error: 'Failed to register document' });
  }
});

/**
 * Get a document by its module ID
 * 
 * Retrieves a document based on its module type, original ID, and organization
 */
router.get('/document/:moduleType/:originalId', async (req, res) => {
  try {
    const { moduleType, originalId } = req.params;
    const organizationId = parseInt(req.query.organizationId as string, 10);
    
    if (isNaN(organizationId)) {
      return res.status(400).json({ success: false, error: 'Invalid organization ID' });
    }
    
    const document = await moduleIntegrationService.getDocumentByModuleId(
      moduleType,
      originalId,
      organizationId
    );
    
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    
    res.json({ success: true, data: document });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch document' });
  }
});

/**
 * Get a document by its internal ID
 */
router.get('/document/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid document ID' });
    }
    
    const document = await moduleIntegrationService.getDocumentById(id);
    
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    
    res.json({ success: true, data: document });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch document' });
  }
});

/**
 * Update a document
 * 
 * Updates a document's details
 */
router.patch('/document/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid document ID' });
    }
    
    const document = await moduleIntegrationService.updateDocument(id, req.body);
    
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    
    res.json({ success: true, data: document });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ success: false, error: 'Failed to update document' });
  }
});

/**
 * Get workflow templates for a module
 * 
 * Returns the available workflow templates for a specific module type and organization
 */
router.get('/workflow-templates/:moduleType', async (req, res) => {
  try {
    const { moduleType } = req.params;
    const organizationId = parseInt(req.query.organizationId as string, 10);
    
    if (isNaN(organizationId)) {
      return res.status(400).json({ success: false, error: 'Invalid organization ID' });
    }
    
    const templates = await moduleIntegrationService.getWorkflowTemplates(moduleType, organizationId);
    res.json({ success: true, data: templates });
  } catch (error) {
    console.error('Error fetching workflow templates:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch workflow templates' });
  }
});

/**
 * Get a document's workflow
 * 
 * Returns the active workflow for a document with approvals and audit log
 */
router.get('/document/:id/workflow', async (req, res) => {
  try {
    const documentId = parseInt(req.params.id, 10);
    
    if (isNaN(documentId)) {
      return res.status(400).json({ success: false, error: 'Invalid document ID' });
    }
    
    const workflow = await moduleIntegrationService.getDocumentWorkflow(documentId);
    
    if (!workflow) {
      return res.json({ success: true, data: null });
    }
    
    res.json({ success: true, data: workflow });
  } catch (error) {
    console.error('Error fetching document workflow:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch document workflow' });
  }
});

/**
 * Initiate a workflow for a document
 * 
 * Starts a new workflow for a document using the specified template
 */
router.post('/document/:id/workflow', async (req, res) => {
  try {
    const documentId = parseInt(req.params.id, 10);
    
    if (isNaN(documentId)) {
      return res.status(400).json({ success: false, error: 'Invalid document ID' });
    }
    
    const validatedData = initiateWorkflowSchema.parse(req.body);
    
    const workflow = await moduleIntegrationService.initiateWorkflow(
      documentId,
      validatedData.templateId,
      validatedData.userId,
      validatedData.metadata || {}
    );
    
    res.json({ success: true, data: workflow });
  } catch (error) {
    console.error('Error initiating workflow:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ success: false, error: 'Failed to initiate workflow' });
  }
});

/**
 * Submit an approval for a workflow step
 * 
 * Submits an approval decision for a specific step in a workflow
 */
router.post('/workflow/:workflowId/approval/:stepIndex', async (req, res) => {
  try {
    const workflowId = parseInt(req.params.workflowId, 10);
    const stepIndex = parseInt(req.params.stepIndex, 10);
    
    if (isNaN(workflowId) || isNaN(stepIndex)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid workflow ID or step index' 
      });
    }
    
    const validatedData = submitApprovalSchema.parse(req.body);
    
    const workflow = await moduleIntegrationService.submitApproval(
      workflowId,
      stepIndex,
      validatedData.userId,
      validatedData.status,
      validatedData.comments || ''
    );
    
    res.json({ success: true, data: workflow });
  } catch (error) {
    console.error('Error submitting approval:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ success: false, error: 'Failed to submit approval' });
  }
});

/**
 * Assign a user to an approval step
 * 
 * Assigns a user to be responsible for a specific approval step
 */
router.post('/workflow/:workflowId/approval/:stepIndex/assign', async (req, res) => {
  try {
    const workflowId = parseInt(req.params.workflowId, 10);
    const stepIndex = parseInt(req.params.stepIndex, 10);
    
    if (isNaN(workflowId) || isNaN(stepIndex)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid workflow ID or step index' 
      });
    }
    
    const validatedData = assignUserSchema.parse(req.body);
    
    const workflow = await moduleIntegrationService.assignUserToApproval(
      workflowId,
      stepIndex,
      validatedData.userId,
      validatedData.assignedById
    );
    
    res.json({ success: true, data: workflow });
  } catch (error) {
    console.error('Error assigning user to approval:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ success: false, error: 'Failed to assign user to approval' });
  }
});

/**
 * Get workflows for a document
 * 
 * Returns all workflows (past and present) for a document
 */
router.get('/document/:id/workflows', async (req, res) => {
  try {
    const documentId = parseInt(req.params.id, 10);
    
    if (isNaN(documentId)) {
      return res.status(400).json({ success: false, error: 'Invalid document ID' });
    }
    
    const workflows = await moduleIntegrationService.getDocumentWorkflows(documentId);
    res.json({ success: true, data: workflows });
  } catch (error) {
    console.error('Error fetching document workflows:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch document workflows' });
  }
});

export const moduleIntegrationRouter = router;