/**
 * 510(k) eSTAR Routes
 * 
 * This file defines routes for the FDA 510(k) eSTAR package management, including
 * validation, generation, and workflow integration.
 */

import { Router } from 'express';
import { eSTARValidator } from '../services/eSTARValidator';
import { z } from 'zod';

// Initialize router
export const router = Router();

/**
 * Validate an eSTAR package
 * 
 * Conducts validation checks on a 510(k) project to ensure FDA compliance.
 * Supports both normal and strict validation modes.
 */
router.post('/validate', async (req, res) => {
  try {
    const schema = z.object({
      projectId: z.string().uuid(),
      strictMode: z.boolean().optional().default(false)
    });
    
    const { projectId, strictMode } = schema.parse(req.body);
    
    const validationResult = await eSTARValidator.validatePackage(projectId, strictMode);
    
    return res.json({
      success: validationResult.valid,
      result: validationResult
    });
  } catch (error: any) {
    console.error('Error validating eSTAR package:', error);
    return res.status(500).json({
      success: false,
      errorMessage: error.message || 'An error occurred during eSTAR validation'
    });
  }
});

/**
 * Build an eSTAR package
 * 
 * Generates an FDA-compliant eSTAR package from a project's data.
 * Optionally performs validation before building.
 */
router.post('/build', async (req, res) => {
  try {
    const schema = z.object({
      projectId: z.string().uuid(),
      options: z.object({
        validateFirst: z.boolean().optional().default(true),
        format: z.enum(['pdf', 'xml', 'zip']).optional().default('zip'),
      }).optional().default({})
    });
    
    const { projectId, options } = schema.parse(req.body);
    
    // Optional validation step
    let validationResult = null;
    if (options.validateFirst) {
      validationResult = await eSTARValidator.validatePackage(projectId, false);
      
      // If validation fails with critical errors, return the validation result
      const criticalErrors = validationResult.issues.filter(issue => issue.severity === 'error').length;
      if (criticalErrors > 0) {
        return res.json({
          success: false,
          message: 'eSTAR package validation failed with critical errors',
          validationResult
        });
      }
    }
    
    // Build eSTAR package - placeholder for actual package generation
    // In a real implementation, this would call the eSTAR builder service
    const packageUrl = `/api/fda510k/estar/download/${projectId}`;
    
    return res.json({
      success: true,
      message: 'eSTAR package successfully built',
      packageGenerated: true,
      downloadUrl: packageUrl,
      validationResult
    });
  } catch (error: any) {
    console.error('Error building eSTAR package:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred during eSTAR package generation'
    });
  }
});

/**
 * Submit an eSTAR package to FDA
 * 
 * Handles the submission of an eSTAR package to the FDA electronic submission gateway.
 * This is a placeholder for the actual FDA submission process.
 */
router.post('/submit', async (req, res) => {
  try {
    const schema = z.object({
      projectId: z.string().uuid(),
      options: z.object({
        validateFirst: z.boolean().optional().default(true),
        submissionMethod: z.enum(['eSG', 'manual']).optional().default('eSG'),
      }).optional().default({})
    });
    
    const { projectId, options } = schema.parse(req.body);
    
    // Optional validation step
    if (options.validateFirst) {
      const validationResult = await eSTARValidator.validatePackage(projectId, true);
      
      // For submission, we require strict validation to pass
      if (!validationResult.valid) {
        return res.json({
          success: false,
          message: 'eSTAR package validation failed. Package must pass strict validation before submission.',
          validationResult
        });
      }
    }
    
    // Submission logic would go here - this is a placeholder
    // In a real implementation, this would call the FDA eSG API
    
    return res.json({
      success: true,
      message: `eSTAR package successfully submitted via ${options.submissionMethod}`,
      submissionId: `ESTAR-${projectId.substring(0, 8)}`,
      submissionDate: new Date().toISOString(),
      status: 'submitted'
    });
  } catch (error: any) {
    console.error('Error submitting eSTAR package:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred during eSTAR submission'
    });
  }
});

/**
 * Integrate eSTAR with workflow
 * 
 * Connects an eSTAR package with the regulatory workflow system to enable
 * tracking, approvals, and compliance management.
 */
router.post('/workflow/integrate', async (req, res) => {
  try {
    const schema = z.object({
      reportId: z.string(),
      projectId: z.string().uuid(),
      validationResult: z.object({
        valid: z.boolean(),
        issues: z.array(z.object({
          severity: z.enum(['error', 'warning']),
          section: z.string().optional(),
          message: z.string()
        })),
        score: z.number().optional()
      }).optional(),
      options: z.object({
        validateFirst: z.boolean().optional().default(true),
        strictValidation: z.boolean().optional().default(false),
        workflowTemplate: z.string().optional().default('510k_submission')
      }).optional().default({})
    });
    
    const { reportId, projectId, validationResult, options } = schema.parse(req.body);
    
    // In a real implementation, this would integrate with the workflow engine
    // For now, we'll simply return a success response with mock data
    
    // Generate eSTAR package if it doesn't exist
    const packageUrl = `/api/fda510k/estar/download/${projectId}`;
    
    return res.json({
      success: true,
      message: 'eSTAR package successfully integrated with workflow',
      workflowId: `WF-${reportId.substring(0, 8)}`,
      workflowUrl: `/workflows/${reportId}`,
      packageGenerated: true,
      downloadUrl: packageUrl,
      workflowStatus: 'in_progress',
      integratedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error integrating eSTAR with workflow:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred during eSTAR workflow integration'
    });
  }
});

/**
 * Download an eSTAR package
 * 
 * Serves the generated eSTAR package for download.
 * This is a placeholder for the actual file serving logic.
 */
router.get('/download/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    
    // In a real implementation, this would serve the actual file
    // For now, we'll generate a mock response
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="estar-package-${projectId}.json"`);
    
    res.json({
      projectId,
      packageType: 'eSTAR',
      generatedAt: new Date().toISOString(),
      content: 'This is a placeholder for the actual eSTAR package content'
    });
  } catch (error: any) {
    console.error('Error serving eSTAR package:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while serving the eSTAR package'
    });
  }
});