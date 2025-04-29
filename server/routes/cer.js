/**
 * Clinical Evaluation Report (CER) API Routes
 * 
 * Endpoints for generating and managing Clinical Evaluation Reports,
 * including sample generation, full report generation, and feedback.
 */

import express from 'express';
import { 
  getSampleCER, 
  generateFullCER, 
  getPastCERReports,
  submitCERFeedback,
  validateCER
} from '../services/cer.js';

const router = express.Router();

/**
 * Generate a sample CER based on template
 * POST /api/cer/sample
 */
router.post('/sample', async (req, res) => {
  const { template } = req.body;
  
  try {
    const sample = await getSampleCER(template);
    res.json(sample);
  } catch (err) {
    console.error('Sample CER error:', err);
    res.status(500).json({ error: 'Failed to generate sample CER' });
  }
});

/**
 * Generate a full CER based on device information and literature
 * POST /api/cer/generate-full
 */
router.post('/generate-full', async (req, res) => {
  const { deviceInfo, literature, fdaData, templateId } = req.body;
  
  try {
    const report = await generateFullCER(deviceInfo, literature, fdaData, templateId);
    res.json(report);
  } catch (err) {
    console.error('Full CER generation error:', err);
    res.status(500).json({ error: 'Failed to generate full CER report' });
  }
});

/**
 * Get past CER reports with optional filtering
 * GET /api/cer/reports
 */
router.get('/reports', async (req, res) => {
  const { status, template, projectId } = req.query;
  
  try {
    const reports = await getPastCERReports({ status, template, projectId });
    res.json(reports);
  } catch (err) {
    console.error('Error fetching CER reports:', err);
    res.status(500).json({ error: 'Failed to retrieve CER reports' });
  }
});

/**
 * Submit feedback on a CER section for active learning
 * POST /api/cer/feedback
 */
router.post('/feedback', async (req, res) => {
  const { reportId, sectionId, approval, comments } = req.body;
  
  try {
    const result = await submitCERFeedback(reportId, sectionId, approval, comments);
    res.json(result);
  } catch (err) {
    console.error('Error submitting CER feedback:', err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

/**
 * Validate a CER against eCTD schema
 * POST /api/cer/validate
 */
router.post('/validate', async (req, res) => {
  const { reportId } = req.body;
  
  try {
    const validationResult = await validateCER(reportId);
    res.json(validationResult);
  } catch (err) {
    console.error('Error validating CER:', err);
    res.status(500).json({ error: 'Failed to validate CER' });
  }
});

export default router;