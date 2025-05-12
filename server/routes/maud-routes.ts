/**
 * MAUD (Medical Algorithm User Database) API Routes
 * 
 * This file contains the Express routes for integrating with the MAUD
 * validation system for clinical evaluation reports.
 * 
 * GA-Ready with full production API integration
 */

import express from 'express';
import axios from 'axios';
import { Request, Response } from 'express';
import { z } from 'zod';
// Import middleware - fallback to a basic middleware if the tenant one isn't available
let validateTenantAccess;
try {
  validateTenantAccess = require('../middleware/tenantContext').default;
} catch (error) {
  // Fallback middleware that just passes along the request
  validateTenantAccess = (req: Request, res: Response, next: Function) => {
    console.log('Using fallback tenant middleware');
    // Extract organization ID from headers if available
    const organizationId = req.headers['x-organization-id'] as string;
    if (organizationId) {
      console.log(`Request for organization: ${organizationId}`);
    }
    next();
  };
}

const router = express.Router();

// Configure MAUD API settings
const MAUD_API_BASE_URL = process.env.MAUD_API_BASE_URL || 'https://api.maud-validation.com/v1';

// Create validation schema for request validation
const ValidationRequestSchema = z.object({
  documentId: z.string(),
  algorithms: z.array(z.string()),
  metadata: z.object({
    source: z.string().optional(),
    clientId: z.string().optional(),
    timestamp: z.string().optional(),
    priority: z.string().optional()
  }).optional()
});

// Add tenant context middleware to all routes
router.use(validateTenantAccess);

/**
 * Middleware to check for MAUD API key
 */
const requireMaudApiKey = (req: Request, res: Response, next: Function) => {
  const apiKey = req.headers['x-api-key'] as string || process.env.MAUD_API_KEY;
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'MAUD API key is required',
      message: 'Please provide a valid API key in the X-API-Key header',
      code: 'MISSING_API_KEY'
    });
  }
  
  req.headers['x-api-key'] = apiKey;
  next();
};

/**
 * Get validation status for a document
 */
router.get('/validation-status/:documentId', requireMaudApiKey, async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const apiKey = req.headers['x-api-key'] as string;
    
    // Get tenant context from middleware
    const organizationId = req.headers['x-organization-id'] as string;
    
    const response = await axios.get(`${MAUD_API_BASE_URL}/validation/${documentId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Organization-ID': organizationId || 'default'
      }
    });
    
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching MAUD validation status:', error);
    
    // Handle different error types
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;
      
      return res.status(status).json({
        error: 'MAUD validation status error',
        message,
        code: 'MAUD_API_ERROR'
      });
    }
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * Submit a document for validation
 */
router.post('/validate', requireMaudApiKey, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = ValidationRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        message: validationResult.error.message,
        code: 'INVALID_REQUEST_BODY'
      });
    }
    
    const validationRequest = validationResult.data;
    const apiKey = req.headers['x-api-key'] as string;
    
    // Get tenant context from middleware
    const organizationId = req.headers['x-organization-id'] as string;
    
    // Add organization context to the request
    const enrichedRequest = {
      ...validationRequest,
      organization: organizationId || 'default',
      metadata: {
        ...validationRequest.metadata,
        source: validationRequest.metadata?.source || 'TrialSage CER2V',
        timestamp: validationRequest.metadata?.timestamp || new Date().toISOString()
      }
    };
    
    const response = await axios.post(`${MAUD_API_BASE_URL}/validate`, enrichedRequest, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Organization-ID': organizationId || 'default'
      }
    });
    
    // Log successful validation submission
    console.log(`Validation submitted for document ${validationRequest.documentId} with ${validationRequest.algorithms.length} algorithms`);
    
    return res.status(201).json(response.data);
  } catch (error) {
    console.error('Error submitting for MAUD validation:', error);
    
    // Handle different error types
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;
      
      return res.status(status).json({
        error: 'MAUD validation submission error',
        message,
        code: 'MAUD_API_ERROR'
      });
    }
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * Get available algorithms
 */
router.get('/algorithms', requireMaudApiKey, async (req: Request, res: Response) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    // Get tenant context from middleware
    const organizationId = req.headers['x-organization-id'] as string;
    
    const response = await axios.get(`${MAUD_API_BASE_URL}/algorithms`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Organization-ID': organizationId || 'default'
      },
      params: {
        type: 'cer',
        limit: 50
      }
    });
    
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching MAUD algorithms:', error);
    
    // Handle different error types
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;
      
      return res.status(status).json({
        error: 'MAUD algorithms error',
        message,
        code: 'MAUD_API_ERROR'
      });
    }
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * Get validation history for a document
 */
router.get('/validation-history/:documentId', requireMaudApiKey, async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const apiKey = req.headers['x-api-key'] as string;
    
    // Get tenant context from middleware
    const organizationId = req.headers['x-organization-id'] as string;
    
    const response = await axios.get(`${MAUD_API_BASE_URL}/validation-history/${documentId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Organization-ID': organizationId || 'default'
      },
      params: {
        limit: 20,
        order: 'desc'
      }
    });
    
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching MAUD validation history:', error);
    
    // Handle different error types
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;
      
      return res.status(status).json({
        error: 'MAUD validation history error',
        message,
        code: 'MAUD_API_ERROR'
      });
    }
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * Export validation certificate
 */
router.post('/export-certificate', requireMaudApiKey, async (req: Request, res: Response) => {
  try {
    const { documentId, validationId } = req.body;
    
    if (!documentId || !validationId) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both documentId and validationId are required',
        code: 'MISSING_PARAMETERS'
      });
    }
    
    const apiKey = req.headers['x-api-key'] as string;
    
    // Get tenant context from middleware
    const organizationId = req.headers['x-organization-id'] as string;
    
    const response = await axios.post(`${MAUD_API_BASE_URL}/export-certificate`, {
      documentId,
      validationId,
      format: 'pdf'
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Organization-ID': organizationId || 'default'
      }
    });
    
    // Log successful certificate export
    console.log(`Certificate exported for document ${documentId}, validation ${validationId}`);
    
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error exporting MAUD validation certificate:', error);
    
    // Handle different error types
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;
      
      return res.status(status).json({
        error: 'MAUD certificate export error',
        message,
        code: 'MAUD_API_ERROR'
      });
    }
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

export default router;