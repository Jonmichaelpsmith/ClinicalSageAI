/**
 * FDA 510(k) eSTAR Integration Routes
 * 
 * These routes handle eSTAR package validation, building, and submission
 * for 510(k) medical device submissions.
 */

import { Router } from 'express';
import { z } from 'zod';
import { eSTARValidator } from '../services/eSTARValidator';
import { FDAComplianceTracker } from '../services/FDAComplianceTracker';
import fs from 'fs';
import path from 'path';

const router = Router();

/**
 * Schema for the validation request
 */
const ValidationRequestSchema = z.object({
  projectId: z.string().uuid(),
  strictMode: z.boolean().optional().default(false)
});

/**
 * Schema for the build request
 */
const BuildRequestSchema = z.object({
  projectId: z.string().uuid(),
  options: z.object({
    includeAdditionalFiles: z.boolean().optional().default(true),
    buildSeparateChapters: z.boolean().optional().default(false),
    optimizePdfSize: z.boolean().optional().default(true)
  }).optional()
});

/**
 * Schema for the submission request
 */
const SubmissionRequestSchema = z.object({
  projectId: z.string().uuid(),
  options: z.object({
    submissionType: z.enum(['510k', 'premarket', 'supplement']),
    contactInfo: z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string()
    }),
    acknowledgementRequired: z.boolean().optional().default(true)
  })
});

/**
 * Schema for the workflow integration request
 */
const WorkflowIntegrationRequestSchema = z.object({
  reportId: z.string().uuid(),
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
    autoRemediate: z.boolean().optional().default(false),
    notifyOnCompletion: z.boolean().optional().default(true),
    priority: z.enum(['low', 'medium', 'high']).optional().default('medium')
  }).optional()
});

/**
 * Validate an eSTAR package for FDA compliance
 * 
 * @route POST /api/fda510k/estar/validate
 * @param {string} projectId - The 510(k) project ID
 * @param {boolean} strictMode - Whether to apply strict validation rules
 * @returns {object} Validation result with issues and score
 */
router.post('/validate', async (req, res) => {
  try {
    const { projectId, strictMode } = ValidationRequestSchema.parse(req.body);
    
    console.log(`Received validation request for project ${projectId} with strictMode=${strictMode}`);
    
    const result = await eSTARValidator.validatePackage(projectId, strictMode);
    
    // Calculate a compliance score based on the validation issues
    if (result.issues.length > 0) {
      const errorCount = result.issues.filter(i => i.severity === 'error').length;
      const warningCount = result.issues.filter(i => i.severity === 'warning').length;
      
      // Scoring algorithm: 100 - (errors * 10) - (warnings * 2)
      // This gives more weight to errors than warnings
      const score = Math.max(0, 100 - (errorCount * 10) - (warningCount * 2));
      result.score = score;
    } else {
      result.score = 100; // Perfect score if no issues
    }
    
    // Log the validation result
    await FDAComplianceTracker.logValidation(projectId, result);
    
    return res.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error('Error validating eSTAR package:', error);
    
    return res.status(400).json({
      success: false,
      error: error.message || 'Error validating eSTAR package'
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
router.post('/build', async (req, res) => {
  try {
    const { projectId, options } = BuildRequestSchema.parse(req.body);
    
    console.log(`Received build request for project ${projectId}`);
    
    // First, validate the project to ensure it meets FDA requirements
    const validationResult = await eSTARValidator.validatePackage(projectId, true);
    
    // Only proceed with the build if the validation passes
    if (!validationResult.valid) {
      // Log validation failure
      await FDAComplianceTracker.logValidation(
        projectId, 
        validationResult, 
        true, // Build was attempted
        false // Build was not successful
      );
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed - cannot build eSTAR package with errors',
        validationResult
      });
    }
    
    // In a real implementation, you would invoke the eSTAR builder here
    // For demo purposes, we'll simulate a successful build
    const outputDir = path.join(process.cwd(), 'generated_documents');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `eSTAR_${projectId}_${timestamp}.zip`;
    const filePath = path.join(outputDir, filename);
    
    // Simulate writing a zip file (in a real implementation, this would be the actual eSTAR package)
    fs.writeFileSync(filePath, 'This is a placeholder for the eSTAR package ZIP file');
    
    // Log successful build
    await FDAComplianceTracker.logValidation(
      projectId, 
      validationResult, 
      true, // Build was attempted
      true  // Build was successful
    );
    
    // Update implementation progress
    await FDAComplianceTracker.updateProgress(
      'workflow_integration',
      'Add eSTAR generation step to submission workflow'
    );
    
    return res.json({
      success: true,
      filename,
      filePath,
      message: 'eSTAR package built successfully'
    });
  } catch (error: any) {
    console.error('Error building eSTAR package:', error);
    
    return res.status(400).json({
      success: false,
      error: error.message || 'Error building eSTAR package'
    });
  }
});

/**
 * Download an eSTAR package
 * 
 * @route GET /api/fda510k/estar/download/:filename
 * @param {string} filename - The filename of the eSTAR package to download
 * @returns {file} The eSTAR package ZIP file
 */
router.get('/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    
    // Prevent directory traversal attacks
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename'
      });
    }
    
    const filePath = path.join(process.cwd(), 'generated_documents', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    // Set appropriate headers for file download
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`
    });
    
    // Stream the file to the client
    return fs.createReadStream(filePath).pipe(res);
  } catch (error: any) {
    console.error('Error downloading eSTAR package:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Error downloading eSTAR package'
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
router.post('/submit', async (req, res) => {
  try {
    const { projectId, options } = SubmissionRequestSchema.parse(req.body);
    
    console.log(`Received submission request for project ${projectId}`);
    
    // In a real implementation, this would initiate the submission to the FDA
    // For demo purposes, we'll simulate a successful submission
    
    // Update implementation progress
    await FDAComplianceTracker.updateProgress(
      'workflow_integration',
      'Implement validation-based workflow branching'
    );
    
    return res.json({
      success: true,
      submissionId: `FDA-SUB-${Date.now()}`,
      submissionDate: new Date().toISOString(),
      status: 'submitted',
      estimatedResponseTime: '45-90 days',
      message: 'eSTAR package submitted successfully to FDA'
    });
  } catch (error: any) {
    console.error('Error submitting eSTAR package:', error);
    
    return res.status(400).json({
      success: false,
      error: error.message || 'Error submitting eSTAR package'
    });
  }
});

/**
 * Integrate an eSTAR package with workflow
 * 
 * @route POST /api/fda510k/estar/workflow/integrate
 * @param {string} reportId - The report ID
 * @param {string} projectId - The project ID
 * @param {object} validationResult - Optional validation result (if validation was performed)
 * @param {object} options - Integration options
 * @returns {object} Integration result
 */
router.post('/workflow/integrate', async (req, res) => {
  try {
    const { reportId, projectId, validationResult, options } = WorkflowIntegrationRequestSchema.parse(req.body);
    
    console.log(`Received workflow integration request for report ${reportId} and project ${projectId}`);
    
    // In a real implementation, this would integrate with the workflow engine
    // For demo purposes, we'll simulate a successful integration
    
    // If a validation result was provided, log it
    if (validationResult) {
      await FDAComplianceTracker.logValidation(
        projectId, 
        validationResult,
        false, // Build was not attempted as part of this integration
        null   // Build success is not applicable
      );
    }
    
    // Update implementation progress
    await FDAComplianceTracker.updateProgress(
      'workflow_integration',
      'Connect eSTAR validation to workflow engine'
    );
    
    return res.json({
      success: true,
      workflowId: `WORKFLOW-${Date.now()}`,
      status: 'integrated',
      nextStep: options?.autoRemediate ? 'remediation' : 'review',
      message: 'eSTAR package integrated with workflow successfully'
    });
  } catch (error: any) {
    console.error('Error integrating eSTAR package with workflow:', error);
    
    return res.status(400).json({
      success: false,
      error: error.message || 'Error integrating eSTAR package with workflow'
    });
  }
});

export { router };