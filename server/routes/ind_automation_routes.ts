/**
 * IND Automation Routes
 * 
 * These routes expose the IND Automation API to the frontend.
 */

import express from 'express';
import indAutomationService from '../ind-automation-service';

const router = express.Router();

// Check if the IND Automation service is available
router.get('/status', indAutomationService.checkINDServiceStatus);

// Generate Module 3 (CMC) document
router.get('/:projectId/module3', indAutomationService.handleGenerateModule3);

export default router;