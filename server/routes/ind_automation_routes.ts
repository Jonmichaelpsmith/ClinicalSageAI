import express from 'express';
import { indAutomationService, Module3Data } from '../ind-automation-service';
import { logger } from '../utils/logger';
import axios from 'axios';
import http from 'http';
import https from 'https';

const router = express.Router();

// Create HTTP clients with longer timeout
const httpClient = axios.create({
  httpAgent: new http.Agent({ timeout: 60000 }),
  httpsAgent: new https.Agent({ timeout: 60000 }),
  timeout: 60000 // 60 seconds timeout
});

/**
 * GET /api/ind-automation/status
 * Check if the IND Automation service is running
 */
router.get('/status', async (req, res) => {
  try {
    const isRunning = await indAutomationService.isServiceRunning();
    if (isRunning) {
      res.json({ status: 'operational', message: 'IND Automation service is running' });
    } else {
      // Try to start the service
      const started = await indAutomationService.startService();
      if (started) {
        res.json({ status: 'starting', message: 'IND Automation service has been started' });
      } else {
        res.status(503).json({ status: 'error', message: 'Failed to start IND Automation service' });
      }
    }
  } catch (error) {
    logger.error(`Error checking IND Automation service status: ${error.message}`);
    res.status(500).json({ status: 'error', message: 'Failed to check service status' });
  }
});

/**
 * GET /api/ind-automation/info
 * Get information about the IND Automation service
 */
router.get('/info', async (req, res) => {
  try {
    const info = await indAutomationService.getServiceInfo();
    res.json(info);
  } catch (error) {
    logger.error(`Error getting IND Automation service info: ${error.message}`);
    res.status(500).json({ status: 'error', message: 'Failed to get service information' });
  }
});

/**
 * GET /api/ind-automation/projects
 * List available projects from Benchling
 */
router.get('/projects', async (req, res) => {
  try {
    const projects = await indAutomationService.listProjects();
    res.json({ projects });
  } catch (error) {
    logger.error(`Error listing projects: ${error.message}`);
    res.status(500).json({ status: 'error', message: 'Failed to list projects' });
  }
});

/**
 * GET /api/ind-automation/:projectId/module3
 * Generate and download a Module 3 document for a project
 */
router.get('/:projectId/module3', async (req, res) => {
  try {
    const { projectId } = req.params;
    logger.info(`Generating Module 3 document for project ${projectId}`);
    
    // Get the document URL from the service
    const documentUrl = await indAutomationService.generateModule3Document(projectId);
    
    // Proxy the request to the Python service
    try {
      const response = await httpClient.get(documentUrl, {
        responseType: 'stream'
      });
      
      // Forward the headers and stream the response
      res.set(response.headers);
      response.data.pipe(res);
    } catch (error) {
      if (error.response) {
        // The service returned an error response
        const status = error.response.status;
        const message = error.response.data ? error.response.data.message : error.message;
        res.status(status).json({ status: 'error', message });
      } else {
        // Network error or other issue
        logger.error(`Error downloading Module 3 document: ${error.message}`);
        res.status(500).json({ status: 'error', message: 'Failed to download document' });
      }
    }
  } catch (error) {
    logger.error(`Error generating Module 3 document: ${error.message}`);
    res.status(500).json({ status: 'error', message: `Failed to generate document: ${error.message}` });
  }
});

/**
 * POST /api/ind-automation/generate/module3
 * Generate a Module 3 document from provided data
 */
router.post('/generate/module3', async (req, res) => {
  try {
    const data = req.body as Module3Data;
    
    if (!data.drug_name || !data.manufacturing_site || !data.batch_number || 
        !data.specifications || !data.stability_data) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields. Please provide drug_name, manufacturing_site, batch_number, specifications, and stability_data.'
      });
    }
    
    logger.info(`Generating Module 3 document for drug ${data.drug_name}`);
    
    // Generate the document
    const documentBytes = await indAutomationService.generateModule3FromData(data);
    
    // Set headers and send response
    const filename = data.drug_name.replace(/\s+/g, '_');
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="Module3_CMC_${filename}.docx"`,
      'Content-Length': documentBytes.length
    });
    
    res.send(documentBytes);
  } catch (error) {
    logger.error(`Error generating Module 3 document from data: ${error.message}`);
    res.status(500).json({ status: 'error', message: `Failed to generate document: ${error.message}` });
  }
});

/**
 * POST /api/ind-automation/batch/module3
 * Generate multiple Module 3 documents in batch mode
 */
router.post('/batch/module3', async (req, res) => {
  try {
    const { projectIds } = req.body;
    
    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide an array of project IDs'
      });
    }
    
    logger.info(`Processing batch request for ${projectIds.length} documents`);
    
    // Process the batch
    const results = await indAutomationService.batchGenerateModule3(projectIds);
    
    res.json(results);
  } catch (error) {
    logger.error(`Error processing batch request: ${error.message}`);
    res.status(500).json({ status: 'error', message: `Failed to process batch: ${error.message}` });
  }
});

export default router;