/**
 * Blueprint Routes - Server-side API routes for eCTD Blueprint Generator
 */

import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import logger from '../../../server/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

/**
 * Generate eCTD blueprint
 * 
 * @route POST /api/blueprint/generate
 * @param {Object} req.body - Input data for blueprint generation
 * @returns {Object} - Generated blueprint
 */
router.post('/generate', async (req, res) => {
  try {
    logger.info('Generating eCTD blueprint', { payload: req.body });

    const script = path.join(__dirname, '..', '..', '..', 'ind_automation', 'build_blueprint.py');
    const proc = spawn('python3', [script], { stdio: ['pipe', 'pipe', 'pipe'] });

    proc.stdin.write(JSON.stringify(req.body));
    proc.stdin.end();

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        logger.error('Blueprint generation script failed', { code, stderr });
        return res.status(500).json({ success: false, error: 'Blueprint generation failed' });
      }

      try {
        const result = JSON.parse(stdout);
        res.json({ success: true, zipPath: result.zip_path, validationResults: result.validation });
      } catch (e) {
        logger.error('Failed to parse blueprint script output', { error: e.message, stdout });
        res.status(500).json({ success: false, error: 'Invalid generation output' });
      }
    });
  } catch (error) {
    logger.error('Error generating blueprint', { error: error.message });
    res.status(500).json({ success: false, error: error.message || 'Failed to generate blueprint' });
  }
});

/**
 * Validate eCTD structure
 * 
 * @route POST /api/blueprint/validate
 * @param {Object} req.body - Blueprint data to validate
 * @returns {Object} - Validation results
 */
router.post('/validate', async (req, res) => {
  try {
    console.log('Validating eCTD blueprint:', JSON.stringify(req.body, null, 2));
    
    // Mock validation (replace with actual implementation)
    const validationResults = {
      status: 'valid', // or 'invalid'
      messages: [],
      warnings: [
        {
          module: 'Module 3.2.P',
          message: 'Consider adding stability data for drug product',
          severity: 'low'
        }
      ],
      recommendations: [
        'Add cross-references between Module 2.7 and Module 5',
        'Ensure consistency between Module 2.3 and Module 3'
      ]
    };
    
    // Add some mock validation messages if certain modules are missing
    if (!req.body.structure?.module2?.ctd?.m2_7_summaries?.included && req.body.structure?.module5?.clinicalStudyReports?.included) {
      validationResults.status = 'invalid';
      validationResults.messages.push({
        module: 'Module 2.7',
        message: 'Clinical Summary (Module 2.7) is required when Clinical Study Reports (Module 5) are included',
        severity: 'high'
      });
    }
    
    if (!req.body.structure?.module1?.regional?.coverLetter?.included) {
      validationResults.status = 'invalid';
      validationResults.messages.push({
        module: 'Module 1.1',
        message: 'Cover Letter is required for all submissions',
        severity: 'high'
      });
    }
    
    res.json({
      success: true,
      validationResults
    });
  } catch (error) {
    logger.error('Error validating blueprint', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to validate blueprint'
    });
  }
});

/**
 * Generate table of contents
 * 
 * @route POST /api/blueprint/generate-toc
 * @param {Object} req.body - Blueprint data
 * @returns {Object} - Table of contents
 */
router.post('/generate-toc', async (req, res) => {
  try {
    logger.info('Generating ToC for blueprint', { id: req.body.blueprintId });
    
    // Mock ToC generation (replace with actual implementation)
    const toc = {
      title: `Table of Contents - ${req.body.submissionType || 'Submission'}`,
      sections: [
        {
          title: 'Module 1: Administrative Information and Prescribing Information',
          subsections: [
            { title: '1.1 Cover Letter', page: 1 },
            { title: '1.2 Application Form', page: 3 },
            { title: '1.3 Administrative Information', page: 10 }
          ]
        },
        {
          title: 'Module 2: Common Technical Document Summaries',
          subsections: [
            { title: '2.1 CTD Table of Contents', page: 15 },
            { title: '2.2 Introduction', page: 16 },
            { title: '2.3 Quality Overall Summary', page: 18 },
            { title: '2.4 Nonclinical Overview', page: 45 },
            { title: '2.5 Clinical Overview', page: 60 }
          ]
        },
        {
          title: 'Module 3: Quality',
          subsections: [
            { title: '3.1 Table of Contents of Module 3', page: 100 },
            { title: '3.2 Body of Data', page: 101 },
            { title: '3.3 Literature References', page: 250 }
          ]
        }
      ],
      generatedAt: new Date().toISOString(),
      pageCount: 300,
      format: 'PDF'
    };
    
    res.json({
      success: true,
      toc
    });
  } catch (error) {
    logger.error('Error generating ToC', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate table of contents'
    });
  }
});

/**
 * Export blueprint to package
 * 
 * @route POST /api/blueprint/export
 * @param {Object} req.body - Blueprint data and export options
 * @returns {Object} - Export job details
 */
router.post('/export', async (req, res) => {
  try {
    console.log('Exporting blueprint to package:', JSON.stringify(req.body, null, 2));
    
    // Start export job (this would be a background process in production)
    const jobId = `blueprint-export-${Date.now()}`;
    
    res.json({
      success: true,
      jobId,
      message: 'Export job started successfully',
      estimatedCompletionTime: '5-10 minutes'
    });
  } catch (error) {
    logger.error('Error starting export job', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to start export job'
    });
  }
});

/**
 * Get export job status
 * 
 * @route GET /api/blueprint/export/:jobId
 * @param {string} req.params.jobId - Export job ID
 * @returns {Object} - Export job status
 */
router.get('/export/:jobId', (req, res) => {
  try {
    const { jobId } = req.params;
    console.log(`Checking export job status: ${jobId}`);
    
    // Mock job status (replace with actual implementation)
    const status = {
      jobId,
      status: 'completed', // 'pending', 'processing', 'completed', 'failed'
      progress: 100,
      startedAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      completedAt: new Date().toISOString(),
      downloadUrl: `/api/blueprint/download/${jobId}`,
      packageDetails: {
        size: '25.4 MB',
        files: 42,
        format: 'eCTD',
        validationResults: 'All validation checks passed'
      }
    };
    
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    logger.error('Error checking export job status', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check export job status'
    });
  }
});

export default router;