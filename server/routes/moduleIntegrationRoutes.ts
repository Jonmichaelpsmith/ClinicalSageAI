/**
 * Module Integration Routes
 * 
 * This file contains API routes for integrating different modules
 * with the unified document workflow system.
 */

import express from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { ModuleIntegrationService } from '../services/ModuleIntegrationService';
import { WorkflowService } from '../services/WorkflowService';
import { 
  insertUnifiedDocumentSchema,
  moduleTypeEnum,
  workflowTemplates
} from '../../shared/schema/unified_workflow';

const router = express.Router();
const moduleIntegrationService = new ModuleIntegrationService();
const workflowService = new WorkflowService();

// Middleware to validate module type
const validateModuleType = (req, res, next) => {
  const moduleType = req.params.moduleType;
  if (!moduleTypeEnum.enumValues.includes(moduleType)) {
    return res.status(400).json({
      success: false,
      message: `Invalid module type: ${moduleType}. Valid values are: ${moduleTypeEnum.enumValues.join(', ')}`
    });
  }
  next();
};

/**
 * @route POST /api/integration/modules/:moduleType/documents
 * @description Register a document from a module in the unified system
 * @access Protected
 */
router.post('/modules/:moduleType/documents', validateModuleType, async (req, res) => {
  try {
    // Extract user info from auth middleware
    const userId = req.user?.id || 1; // Fallback for development
    const organizationId = req.user?.organizationId || 1; // Fallback for development
    
    // Validate request body
    const moduleType = req.params.moduleType as typeof moduleTypeEnum.enumValues[number];
    const documentData = req.body;
    
    // Basic validation
    if (!documentData.originalDocumentId || !documentData.title || !documentData.documentType) {
      return res.status(400).json({
        success: false,
        message: 'originalDocumentId, title, and documentType are required fields'
      });
    }
    
    // Register document
    const document = await moduleIntegrationService.registerModuleDocument(
      moduleType,
      documentData.originalDocumentId,
      documentData.title,
      documentData.documentType,
      organizationId,
      userId,
      documentData.metadata,
      documentData.content,
      documentData.vaultFolderId
    );
    
    res.status(201).json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Error registering module document:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to register document'
    });
  }
});

/**
 * @route GET /api/integration/modules/:moduleType/documents/:documentId
 * @description Get a unified document by its module document ID
 * @access Protected
 */
router.get('/modules/:moduleType/documents/:documentId', validateModuleType, async (req, res) => {
  try {
    // Extract user info from auth middleware
    const organizationId = req.user?.organizationId || 1; // Fallback for development
    
    // Get document
    const moduleType = req.params.moduleType as typeof moduleTypeEnum.enumValues[number];
    const originalDocumentId = req.params.documentId;
    
    const document = await moduleIntegrationService.getDocumentByModuleId(
      moduleType,
      originalDocumentId,
      organizationId
    );
    
    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Error fetching module document:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Document not found'
    });
  }
});

/**
 * @route PATCH /api/integration/modules/:moduleType/documents/:documentId
 * @description Update a document's content or metadata from its source module
 * @access Protected
 */
router.patch('/modules/:moduleType/documents/:documentId', validateModuleType, async (req, res) => {
  try {
    // Extract user info from auth middleware
    const userId = req.user?.id || 1; // Fallback for development
    const organizationId = req.user?.organizationId || 1; // Fallback for development
    
    // Get document first
    const moduleType = req.params.moduleType as typeof moduleTypeEnum.enumValues[number];
    const originalDocumentId = req.params.documentId;
    
    const document = await moduleIntegrationService.getDocumentByModuleId(
      moduleType,
      originalDocumentId,
      organizationId
    );
    
    // Update document
    const updates = req.body;
    const updatedDocument = await moduleIntegrationService.updateDocument(
      document.id,
      updates,
      userId
    );
    
    res.json({
      success: true,
      document: updatedDocument
    });
  } catch (error) {
    console.error('Error updating module document:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update document'
    });
  }
});

/**
 * @route GET /api/integration/modules/:moduleType/documents/:documentId/workflow
 * @description Get workflow status for a module document
 * @access Protected
 */
router.get('/modules/:moduleType/documents/:documentId/workflow', validateModuleType, async (req, res) => {
  try {
    // Extract user info from auth middleware
    const organizationId = req.user?.organizationId || 1; // Fallback for development
    
    // Get document first
    const moduleType = req.params.moduleType as typeof moduleTypeEnum.enumValues[number];
    const originalDocumentId = req.params.documentId;
    
    const document = await moduleIntegrationService.getDocumentByModuleId(
      moduleType,
      originalDocumentId,
      organizationId
    );
    
    // Get workflow
    const workflow = await moduleIntegrationService.getDocumentWorkflow(document.id);
    
    res.json({
      success: true,
      document,
      workflow
    });
  } catch (error) {
    console.error('Error fetching document workflow:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get workflow'
    });
  }
});

/**
 * @route POST /api/integration/modules/:moduleType/documents/:documentId/workflow
 * @description Initiate a workflow for a module document
 * @access Protected
 */
router.post('/modules/:moduleType/documents/:documentId/workflow', validateModuleType, async (req, res) => {
  try {
    // Extract user info from auth middleware
    const userId = req.user?.id || 1; // Fallback for development
    const organizationId = req.user?.organizationId || 1; // Fallback for development
    
    // Get document first
    const moduleType = req.params.moduleType as typeof moduleTypeEnum.enumValues[number];
    const originalDocumentId = req.params.documentId;
    
    const document = await moduleIntegrationService.getDocumentByModuleId(
      moduleType,
      originalDocumentId,
      organizationId
    );
    
    // Validate template ID is provided
    if (!req.body.templateId) {
      return res.status(400).json({
        success: false,
        message: 'templateId is required'
      });
    }
    
    // Initiate workflow
    const workflow = await moduleIntegrationService.initiateWorkflow(
      document.id,
      req.body.templateId,
      userId,
      req.body.metadata
    );
    
    res.status(201).json({
      success: true,
      workflow
    });
  } catch (error) {
    console.error('Error initiating workflow:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate workflow'
    });
  }
});

/**
 * @route POST /api/integration/workflows/:workflowId/approve
 * @description Submit approval for a workflow step
 * @access Protected
 */
router.post('/workflows/:workflowId/approve', async (req, res) => {
  try {
    // Extract user info from auth middleware
    const userId = req.user?.id || 1; // Fallback for development
    
    // Validate request body
    if (!req.body.stepIndex && req.body.stepIndex !== 0) {
      return res.status(400).json({
        success: false,
        message: 'stepIndex is required'
      });
    }
    
    if (!req.body.status) {
      return res.status(400).json({
        success: false,
        message: 'status is required (approved or rejected)'
      });
    }
    
    // Submit approval
    const workflow = await workflowService.submitApproval(
      parseInt(req.params.workflowId),
      req.body.stepIndex,
      userId,
      req.body.status,
      req.body.comments
    );
    
    res.json({
      success: true,
      workflow
    });
  } catch (error) {
    console.error('Error submitting approval:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit approval'
    });
  }
});

/**
 * @route GET /api/integration/workflows/:workflowId
 * @description Get workflow details including approval steps
 * @access Protected
 */
router.get('/workflows/:workflowId', async (req, res) => {
  try {
    const workflow = await workflowService.getWorkflowWithApprovals(
      parseInt(req.params.workflowId)
    );
    
    res.json({
      success: true,
      workflow
    });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Workflow not found'
    });
  }
});

/**
 * @route GET /api/integration/modules/:moduleType/templates
 * @description Get workflow templates for a specific module type
 * @access Protected
 */
router.get('/modules/:moduleType/templates', validateModuleType, async (req, res) => {
  try {
    // Extract user info from auth middleware
    const organizationId = req.user?.organizationId || 1; // Fallback for development
    
    // Get templates
    const moduleType = req.params.moduleType as typeof moduleTypeEnum.enumValues[number];
    
    const templates = await moduleIntegrationService.getWorkflowTemplatesForModule(
      moduleType,
      organizationId
    );
    
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error fetching workflow templates:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get workflow templates'
    });
  }
});

export default router;