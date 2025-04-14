/**
 * Python FastAPI Bridge
 * 
 * This module provides a bridge to the Python FastAPI services for enhanced
 * CSR context and therapeutic area classification functionality.
 */
import { spawn } from 'child_process';
import express from 'express';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

// Python FastAPI service settings
const PYTHON_PORT = 8000;
const PYTHON_HOST = 'localhost';
const PYTHON_ENDPOINT = `http://${PYTHON_HOST}:${PYTHON_PORT}`;
let pythonProcess: any = null;
let serviceReady = false;

// Start the Python FastAPI service
export async function startPythonService() {
  try {
    // Check if the service is already running
    try {
      const response = await axios.get(`${PYTHON_ENDPOINT}/docs`);
      if (response.status === 200) {
        console.log('Python FastAPI service is already running');
        serviceReady = true;
        return;
      }
    } catch (error) {
      // Service not running, proceed to start it
    }

    console.log('Starting Python FastAPI service...');
    
    // Get the absolute path to the Python script
    const pythonScriptPath = path.join(process.cwd(), 'server', 'assistant_context_api.py');
    
    // Make the script executable
    fs.chmodSync(pythonScriptPath, '755');
    
    // Start the Python process
    pythonProcess = spawn('python3', [pythonScriptPath]);
    
    pythonProcess.stdout.on('data', (data: Buffer) => {
      console.log(`Python FastAPI: ${data.toString().trim()}`);
      
      // Check if service is ready
      if (data.toString().includes('Uvicorn running on')) {
        serviceReady = true;
        console.log('Python FastAPI service is ready');
      }
    });
    
    pythonProcess.stderr.on('data', (data: Buffer) => {
      console.error(`Python FastAPI error: ${data.toString().trim()}`);
    });
    
    pythonProcess.on('close', (code: number) => {
      console.log(`Python FastAPI service exited with code ${code}`);
      serviceReady = false;
    });
    
    // Wait for service to be ready
    let maxWaitMs = 10000; // 10 seconds
    const intervalMs = 100;
    
    return new Promise<void>((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (serviceReady) {
          clearInterval(checkInterval);
          resolve();
        } else {
          maxWaitMs -= intervalMs;
          if (maxWaitMs <= 0) {
            clearInterval(checkInterval);
            reject(new Error('Timeout waiting for Python FastAPI service to start'));
          }
        }
      }, intervalMs);
    });
  } catch (error) {
    console.error('Failed to start Python FastAPI service:', error);
    throw error;
  }
}

// Register the Python service routes with Express
export function registerPythonRoutes(app: express.Express) {
  // Proxy for /api/context/assistant-csr/:csr_id
  app.get('/api/context/assistant-csr/:csr_id', async (req, res) => {
    try {
      if (!serviceReady) {
        return res.status(503).json({
          success: false,
          message: 'Python service not ready'
        });
      }
      
      const { csr_id } = req.params;
      const response = await axios.get(`${PYTHON_ENDPOINT}/api/context/assistant-csr/${csr_id}`);
      res.json(response.data);
    } catch (error) {
      console.error('Error proxying to Python service:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to communicate with Python service'
      });
    }
  });
  
  // Proxy for /api/planner/generate-ind
  app.post('/api/planner/generate-ind', async (req, res) => {
    try {
      if (!serviceReady) {
        return res.status(503).json({
          success: false,
          message: 'Python service not ready'
        });
      }
      
      const response = await axios.post(`${PYTHON_ENDPOINT}/api/planner/generate-ind`, req.body);
      res.json(response.data);
    } catch (error) {
      console.error('Error proxying to Python service:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate IND summary'
      });
    }
  });
  
  // Proxy for /api/planning/init
  app.post('/api/planning/init', async (req, res) => {
    try {
      if (!serviceReady) {
        return res.status(503).json({
          success: false,
          message: 'Python service not ready'
        });
      }
      
      const response = await axios.post(`${PYTHON_ENDPOINT}/api/planning/init`, req.body);
      res.json(response.data);
    } catch (error) {
      console.error('Error proxying to Python service:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to initialize planning session'
      });
    }
  });
  
  // Proxy for /api/export/ind-docx-with-context
  app.post('/api/export/ind-docx-with-context', async (req, res) => {
    try {
      if (!serviceReady) {
        return res.status(503).json({
          success: false,
          message: 'Python service not ready'
        });
      }
      
      // Make the request and get a binary response
      const response = await axios.post(`${PYTHON_ENDPOINT}/api/export/ind-docx-with-context`, req.body, {
        responseType: 'arraybuffer'
      });
      
      // Set the appropriate headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="ind_module_with_context.docx"`);
      
      // Send the binary data
      res.send(Buffer.from(response.data));
    } catch (error) {
      console.error('Error proxying to Python service:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to export IND summary as DOCX'
      });
    }
  });
  
  console.log('Registered Python FastAPI routes');
}

// Stop the Python FastAPI service
export function stopPythonService() {
  if (pythonProcess) {
    console.log('Stopping Python FastAPI service...');
    pythonProcess.kill();
    pythonProcess = null;
    serviceReady = false;
  }
}

// Process exit handler to clean up Python process
process.on('exit', stopPythonService);
process.on('SIGINT', () => {
  stopPythonService();
  process.exit();
});