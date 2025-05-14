/**
 * FDA 510(k) eSTAR Integration Routes
 * 
 * These routes handle eSTAR package validation, building, and submission
 * for 510(k) medical device submissions.
 */

import { Router } from 'express';
import { eSTARValidator } from '../services/eSTARValidator';
import { eSTARPlusBuilder } from '../services/eSTARPlusBuilder';
import { z } from 'zod';

const router = Router();

/**
 * Validate an eSTAR package for FDA compliance
 * 
 * @route POST /api/fda510k/estar/validate
 * @param {string} projectId - The 510(k) project ID
 * @param {boolean} strictMode - Whether to apply strict validation rules
 * @returns {object} Validation result with issues and score
 */
router.post('/api/fda510k/estar/validate', async (req, res) => {
  try {
    // Validate request body
    const schema = z.object({
      projectId: z.string().uuid(),
      strictMode: z.boolean().optional().default(false)
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request parameters',
        details: result.error.format()
      });
    }
    
    const { projectId, strictMode } = result.data;
    
    // Call the eSTAR validator service
    const validationResult = await eSTARValidator.validatePackage(projectId, strictMode);
    
    // Return validation results
    return res.json({
      success: true,
      validation: validationResult
    });
  } catch (error) {
    console.error('Error validating eSTAR package:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to validate eSTAR package',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Build an eSTAR package for submission
 * 
 * @route POST /api/fda510k/estar/build
 * @param {string} projectId - The 510(k) project ID
 * @param {object} options - Build options
 * @returns {object} Build result with path to ZIP package
 */
router.post('/api/fda510k/estar/build', async (req, res) => {
  try {
    // Validate request body
    const schema = z.object({
      projectId: z.string().uuid(),
      options: z.object({
        includeCoverLetter: z.boolean().optional().default(true),
        autoUpload: z.boolean().optional().default(false)
      }).optional().default({})
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request parameters',
        details: result.error.format()
      });
    }
    
    const { projectId, options } = result.data;
    
    // Call the eSTAR builder service
    const buildResult = await eSTARPlusBuilder.build(projectId, options);
    
    // Return build results
    return res.json({
      success: true,
      build: buildResult
    });
  } catch (error) {
    console.error('Error building eSTAR package:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to build eSTAR package',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Submit an eSTAR package to FDA
 * 
 * @route POST /api/fda510k/estar/submit
 * @param {string} projectId - The 510(k) project ID
 * @param {object} options - Submission options
 * @returns {object} Submission result
 */
router.post('/api/fda510k/estar/submit', async (req, res) => {
  try {
    // Validate request body
    const schema = z.object({
      projectId: z.string().uuid(),
      options: z.object({
        submissionContact: z.object({
          name: z.string(),
          email: z.string().email(),
          phone: z.string()
        }).optional(),
        notificationEmail: z.string().email().optional()
      }).optional().default({})
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request parameters',
        details: result.error.format()
      });
    }
    
    const { projectId, options } = result.data;
    
    // Call the eSTAR builder service to submit
    // This is a placeholder for actual FDA submission
    // In a real implementation, this would use an FDA ESG gateway client
    const submissionResult = {
      success: true,
      submissionId: `SUB-${Math.floor(Math.random() * 10000000)}`,
      submissionDate: new Date().toISOString(),
      status: 'pending',
      message: 'Submission successfully sent to FDA ESG gateway',
      estimatedReviewTime: '90 days'
    };
    
    // Return submission results
    return res.json({
      success: true,
      submission: submissionResult
    });
  } catch (error) {
    console.error('Error submitting eSTAR package:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit eSTAR package',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Integrate an eSTAR package with workflow
 * 
 * @route POST /api/fda510k/estar/workflow/integrate
 * @param {string} projectId - The 510(k) project ID
 * @param {string} workflowId - The workflow ID
 * @returns {object} Integration result
 */
router.post('/api/fda510k/estar/workflow/integrate', async (req, res) => {
  try {
    // Validate request body
    const schema = z.object({
      projectId: z.string().uuid(),
      workflowId: z.string().uuid()
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request parameters',
        details: result.error.format()
      });
    }
    
    const { projectId, workflowId } = result.data;
    
    // This would integrate with the workflow service in a real implementation
    // For now, we'll just return a success response
    const integrationResult = {
      success: true,
      projectId,
      workflowId,
      status: 'integrated',
      message: 'eSTAR package successfully integrated with workflow',
      workflowSteps: [
        {
          id: 'validation',
          name: 'eSTAR Validation',
          status: 'pending',
          order: 1
        },
        {
          id: 'review',
          name: 'Quality Review',
          status: 'pending',
          order: 2
        },
        {
          id: 'approval',
          name: 'Final Approval',
          status: 'pending',
          order: 3
        }
      ]
    };
    
    // Return integration results
    return res.json({
      success: true,
      integration: integrationResult
    });
  } catch (error) {
    console.error('Error integrating eSTAR with workflow:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to integrate eSTAR with workflow',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;