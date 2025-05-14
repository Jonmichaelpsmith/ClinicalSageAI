/**
 * Module Integration Routes
 * 
 * This file contains API routes for integrating different modules
 * with the unified document workflow system.
 */

import express from 'express';
import { ModuleIntegrationService } from '../services/ModuleIntegrationService';
import { WorkflowService } from '../services/WorkflowService';
import { authenticate } from '../middleware/authAdapter';
import { z } from 'zod';

const router = express.Router();
const moduleIntegrationService = new ModuleIntegrationService();
const workflowService = new WorkflowService();

/**
 * @route POST /api/integration/modules/:moduleType/documents
 * @description Register a document from a module in the unified system
 * @access Protected
 */
router.post('/modules/:moduleType/documents', authenticate, async (req, res) => {
  try {
    const { moduleType } = req.params;
    const { documentId, title, documentType, content, metadata, folderId, initiateWorkflow, workflowTemplateId } = req.body;
    
    // Ensure moduleType is valid
    if (!['cmc_wizard', 'ectd_coauthor', 'med_device', 'study_architect'].includes(moduleType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid module type: ${moduleType}`
      });
    }
    
    // Get organization ID from authenticated user
    const organizationId = req.user.organizationId;
    const clientWorkspaceId = req.user.clientWorkspaceId;
    
    const result = await moduleIntegrationService.registerModuleDocument({
      documentId,
      moduleType,
      title,
      organizationId,
      clientWorkspaceId,
      documentType,
      content,
      metadata,
      folderId,
      initiateWorkflow,
      workflowTemplateId
    }, req.user.id);
    
    res.status(201).json({
      success: true,
      documentId: result.documentId,
      workflowId: result.workflowId
    });
  } catch (error) {
    console.error(`Error registering module document: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/integration/modules/:moduleType/documents/:documentId
 * @description Get a unified document by its module document ID
 * @access Protected
 */
router.get('/modules/:moduleType/documents/:documentId', authenticate, async (req, res) => {
  try {
    const { moduleType, documentId } = req.params;
    
    const document = await moduleIntegrationService.getDocumentByModuleId(moduleType, documentId);
    
    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error(`Error retrieving document by module ID: ${error.message}`);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route PATCH /api/integration/modules/:moduleType/documents/:documentId
 * @description Update a document's content or metadata from its source module
 * @access Protected
 */
router.patch('/modules/:moduleType/documents/:documentId', authenticate, async (req, res) => {
  try {
    const { moduleType, documentId } = req.params;
    const { content, metadata, status } = req.body;
    
    const unifiedDocId = await moduleIntegrationService.updateDocumentFromModule(
      moduleType,
      documentId,
      { content, metadata, status },
      req.user.id
    );
    
    res.json({
      success: true,
      documentId: unifiedDocId
    });
  } catch (error) {
    console.error(`Error updating document from module: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/integration/modules/:moduleType/documents/:documentId/workflow
 * @description Get workflow status for a module document
 * @access Protected
 */
router.get('/modules/:moduleType/documents/:documentId/workflow', authenticate, async (req, res) => {
  try {
    const { moduleType, documentId } = req.params;
    
    // Find the unified document ID
    const document = await moduleIntegrationService.getDocumentByModuleId(moduleType, documentId);
    
    // Get active workflow
    const workflowDetails = await workflowService.getDocumentWorkflow(document.id);
    
    if (!workflowDetails) {
      return res.json({
        success: true,
        hasWorkflow: false
      });
    }
    
    res.json({
      success: true,
      hasWorkflow: true,
      workflowDetails
    });
  } catch (error) {
    console.error(`Error getting workflow status: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route POST /api/integration/modules/:moduleType/documents/:documentId/workflow
 * @description Initiate a workflow for a module document
 * @access Protected
 */
router.post('/modules/:moduleType/documents/:documentId/workflow', authenticate, async (req, res) => {
  try {
    const { moduleType, documentId } = req.params;
    const { workflowTemplateId, initialData } = req.body;
    
    // Find the unified document ID
    const document = await moduleIntegrationService.getDocumentByModuleId(moduleType, documentId);
    
    // Initiate workflow
    const workflowId = await workflowService.initiateWorkflow({
      documentId: document.id,
      workflowTemplateId,
      initiatedBy: req.user.id,
      initialData
    });
    
    res.status(201).json({
      success: true,
      workflowId
    });
  } catch (error) {
    console.error(`Error initiating workflow: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route POST /api/integration/workflows/:workflowId/approve
 * @description Submit approval for a workflow step
 * @access Protected
 */
router.post('/workflows/:workflowId/approve', authenticate, async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { stepIndex, approved, comments, signatureData } = req.body;
    
    const validatedStepIndex = z.number().int().nonnegative().parse(stepIndex);
    
    // Process approval
    const result = await workflowService.processApproval({
      workflowId,
      stepIndex: validatedStepIndex,
      userId: req.user.id,
      approved,
      comments,
      signatureData
    });
    
    res.json({
      success: true,
      status: result.status,
      isComplete: result.isComplete,
      nextStep: result.nextStep
    });
  } catch (error) {
    console.error(`Error processing approval: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/integration/workflows/:workflowId
 * @description Get workflow details including approval steps
 * @access Protected
 */
router.get('/workflows/:workflowId', authenticate, async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    const workflowDetails = await workflowService.getWorkflowDetails(workflowId);
    
    res.json({
      success: true,
      workflow: workflowDetails
    });
  } catch (error) {
    console.error(`Error getting workflow details: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/integration/modules/:moduleType/templates
 * @description Get workflow templates for a specific module type
 * @access Protected
 */
router.get('/modules/:moduleType/templates', authenticate, async (req, res) => {
  try {
    const { moduleType } = req.params;
    
    // Get templates for this module type
    const templates = await db.select()
      .from(workflowTemplates)
      .where(
        and(
          eq(workflowTemplates.moduleType, moduleType),
          eq(workflowTemplates.isActive, true)
        )
      )
      .orderBy(desc(workflowTemplates.updatedAt));
    
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error(`Error getting workflow templates: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;