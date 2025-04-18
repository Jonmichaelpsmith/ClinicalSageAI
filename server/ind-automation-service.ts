/**
 * IND Automation Service
 * 
 * This service acts as a proxy between the main application and the Python FastAPI microservice
 * that handles IND document generation.
 */

import axios from 'axios';
import { Request, Response } from 'express';

// URL for the Python FastAPI service
const IND_SERVICE_URL = process.env.IND_SERVICE_URL || 'http://localhost:8000';

/**
 * Generate Module 3 (CMC) document for a project
 * 
 * @param projectId - The ID of the project to generate the document for
 * @returns Buffer containing the generated DOCX file
 */
export async function generateModule3(projectId: string): Promise<Buffer> {
  try {
    const response = await axios.get(`${IND_SERVICE_URL}/api/ind/${projectId}/module3`, {
      responseType: 'arraybuffer'
    });
    
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error generating Module 3 document:', error);
    throw error;
  }
}

/**
 * Express handler for Module 3 document generation
 */
export async function handleGenerateModule3(req: Request, res: Response): Promise<void> {
  const { projectId } = req.params;
  
  try {
    const docxBuffer = await generateModule3(projectId);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=Module3_CMC_${projectId}.docx`);
    
    // Send the document
    res.send(docxBuffer);
  } catch (error: any) {
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.detail || 'Failed to generate Module 3 document';
    
    res.status(statusCode).json({
      error: 'IND Generation Error',
      message: errorMessage
    });
  }
}

/**
 * Express handler to check the status of the IND service
 */
export async function checkINDServiceStatus(req: Request, res: Response): Promise<void> {
  try {
    const response = await axios.get(`${IND_SERVICE_URL}/`);
    res.json({
      status: 'connected',
      message: response.data.message
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'disconnected',
      message: 'IND Automation service is not available'
    });
  }
}

export default {
  generateModule3,
  handleGenerateModule3,
  checkINDServiceStatus
};