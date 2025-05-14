/**
 * Module Integration API Routes
 * 
 * This file provides API endpoints for integrating different modules
 * with the unified document workflow system.
 */

import express from 'express';
import { z } from 'zod';
import { 
  moduleIntegrationService,
  registerDocumentSchema,
  moduleReferenceSchema
} from '../services/ModuleIntegrationService';
import { workflowService } from '../services/WorkflowService';

const router = express.Router();

/**
 * Register a document from a module in the unified document system
 * 
 * POST /api/module-integration/register-document
 */
router.post('/register-document', async (req, res) => {
  try {
    // Validate request body
    const validationResult = registerDocumentSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: validationResult.error.format()
      });
    }
    
    const document = await moduleIntegrationService.registerModuleDocument(validationResult.data);
    
    return res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error registering document:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to register document',
      message: (error as Error).message
    });
  }
});

/**
 * Get a document by its module-specific ID
 * 
 * GET /api/module-integration/document/:moduleType/:originalId
 */
router.get('/document/:moduleType/:originalId', async (req, res) => {
  try {
    const { moduleType, originalId } = req.params;
    const organizationId = parseInt(req.query.organizationId as string, 10);
    
    // Validate parameters
    const validationResult = moduleReferenceSchema.safeParse({
      moduleType,
      originalId,
      organizationId
    });
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request parameters',
        details: validationResult.error.format()
      });
    }
    
    const document = await moduleIntegrationService.getDocumentByModuleId(
      moduleType,
      originalId,
      organizationId
    );
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error getting document:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get document',
      message: (error as Error).message
    });
  }
});

/**
 * Get documents for a module
 * 
 * GET /api/module-integration/documents/:moduleType
 */
router.get('/documents/:moduleType', async (req, res) => {
  try {
    const { moduleType } = req.params;
    const organizationId = parseInt(req.query.organizationId as string, 10);
    
    if (!moduleType || isNaN(organizationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid module type or organization ID'
      });
    }
    
    const documents = await moduleIntegrationService.getModuleDocuments(
      moduleType,
      organizationId
    );
    
    return res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Error getting documents:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get documents',
      message: (error as Error).message
    });
  }
});

/**
 * Get document counts by type for an organization
 * 
 * GET /api/module-integration/document-counts
 */
router.get('/document-counts', async (req, res) => {
  try {
    const organizationId = parseInt(req.query.organizationId as string, 10);
    
    if (isNaN(organizationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid organization ID'
      });
    }
    
    const counts = await moduleIntegrationService.getDocumentCountByType(organizationId);
    
    return res.status(200).json({
      success: true,
      data: counts
    });
  } catch (error) {
    console.error('Error getting document counts:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get document counts',
      message: (error as Error).message
    });
  }
});

/**
 * Get documents in review
 * 
 * GET /api/module-integration/documents-in-review
 */
router.get('/documents-in-review', async (req, res) => {
  try {
    const organizationId = parseInt(req.query.organizationId as string, 10);
    
    if (isNaN(organizationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid organization ID'
      });
    }
    
    const documents = await moduleIntegrationService.getDocumentsInReview(organizationId);
    
    return res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Error getting documents in review:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get documents in review',
      message: (error as Error).message
    });
  }
});

/**
 * Get recent documents for a user
 * 
 * GET /api/module-integration/recent-documents
 */
router.get('/recent-documents', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string, 10);
    const organizationId = parseInt(req.query.organizationId as string, 10);
    const limit = parseInt(req.query.limit as string, 10) || 10;
    
    if (isNaN(userId) || isNaN(organizationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID or organization ID'
      });
    }
    
    const documents = await moduleIntegrationService.getRecentDocumentsForUser(
      userId,
      organizationId,
      limit
    );
    
    return res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Error getting recent documents:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get recent documents',
      message: (error as Error).message
    });
  }
});

/**
 * Create a workflow for a document
 * 
 * POST /api/module-integration/create-workflow
 */
router.post('/create-workflow', async (req, res) => {
  try {
    const { documentId, templateId, startedBy, metadata } = req.body;
    
    if (!documentId || !templateId || !startedBy) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }
    
    const workflow = await moduleIntegrationService.createDocumentWorkflow(
      documentId,
      templateId,
      startedBy,
      metadata || {}
    );
    
    return res.status(200).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create workflow',
      message: (error as Error).message
    });
  }
});

/**
 * Get workflow templates for a module
 * 
 * GET /api/module-integration/workflow-templates/:moduleType
 */
router.get('/workflow-templates/:moduleType', async (req, res) => {
  try {
    const { moduleType } = req.params;
    const organizationId = parseInt(req.query.organizationId as string, 10);
    
    if (!moduleType || isNaN(organizationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid module type or organization ID'
      });
    }
    
    const templates = await workflowService.getWorkflowTemplates(
      organizationId,
      moduleType
    );
    
    return res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error getting workflow templates:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get workflow templates',
      message: (error as Error).message
    });
  }
});

/**
 * Create default workflow templates for an organization
 * 
 * POST /api/module-integration/create-default-templates
 */
router.post('/create-default-templates', async (req, res) => {
  try {
    const { organizationId, createdBy } = req.body;
    
    if (!organizationId || !createdBy) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }
    
    const templates = await moduleIntegrationService.createDefaultWorkflowTemplates(
      organizationId,
      createdBy
    );
    
    return res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error creating default templates:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create default templates',
      message: (error as Error).message
    });
  }
});

/**
 * Compare document versions
 * 
 * GET /api/module-integration/compare-versions
 */
router.get('/compare-versions', async (req, res) => {
  try {
    const currentVersionId = parseInt(req.query.currentVersionId as string, 10);
    const previousVersionId = parseInt(req.query.previousVersionId as string, 10);
    
    if (isNaN(currentVersionId) || isNaN(previousVersionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid version IDs'
      });
    }
    
    const comparison = await moduleIntegrationService.compareDocumentVersions(
      currentVersionId,
      previousVersionId
    );
    
    return res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error comparing versions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to compare versions',
      message: (error as Error).message
    });
  }
});

export default router;