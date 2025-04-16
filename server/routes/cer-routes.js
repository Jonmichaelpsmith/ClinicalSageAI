/**
 * CER Routes for LumenTrialGuide.AI
 * 
 * This module defines the API routes for Clinical Evaluation Report (CER) 
 * generation and management.
 */
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Ensure necessary directories exist
const ensureDirectoriesExist = () => {
  const dirs = [
    'data/exports',
    'data/logs',
    'data/cer_reports'
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
};

// Initialize storage
ensureDirectoriesExist();

// Get all CER reports
router.get('/reports', async (req, res) => {
  try {
    const reportsDir = 'data/cer_reports';
    if (!fs.existsSync(reportsDir)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(reportsDir);
    const reports = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(reportsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const report = JSON.parse(content);
        reports.push(report);
      }
    }
    
    // Sort by creation date, newest first
    reports.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json(reports);
  } catch (error) {
    console.error('Error retrieving CER reports:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific CER report
router.get('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reportPath = path.join('data/cer_reports', `${id}.json`);
    
    if (!fs.existsSync(reportPath)) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const content = fs.readFileSync(reportPath, 'utf8');
    const report = JSON.parse(content);
    
    res.json(report);
  } catch (error) {
    console.error('Error retrieving CER report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate a CER report for an NDC code
router.get('/:ndcCode', async (req, res) => {
  try {
    const { ndcCode } = req.params;
    
    // Spawn a child process to execute the Python script
    const pythonProcess = spawn('python', [
      'cer_narrative.py',
      `--ndc=${ndcCode}`
    ]);
    
    let cerText = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      cerText += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        console.error(errorOutput);
        return res.status(500).json({ error: 'Failed to generate CER report', details: errorOutput });
      }
      
      // Save the generated report
      const reportId = uuidv4();
      const report = {
        id: reportId,
        created_at: new Date().toISOString(),
        ndcCode,
        title: `CER Report for NDC ${ndcCode}`,
        content: cerText,
        metadata: {
          generatedAt: new Date().toISOString()
        }
      };
      
      const reportPath = path.join('data/cer_reports', `${reportId}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      res.json({
        cer_report: cerText,
        report_id: reportId
      });
    });
  } catch (error) {
    console.error('Error generating CER report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Trigger enhanced PDF generation as a background task
router.post('/:ndcCode/enhanced-pdf-task', async (req, res) => {
  try {
    const { ndcCode } = req.params;
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }
    
    const taskId = uuidv4();
    
    // Spawn a process in the background
    const pythonProcess = spawn('python', [
      'cer_tasks_cli.py',
      `--ndc-code=${ndcCode}`,
      `--user-id=${user_id}`,
      `--task-id=${taskId}`
    ], {
      detached: true,
      stdio: 'ignore'
    });
    
    // Allow the process to run independently
    pythonProcess.unref();
    
    res.json({
      task_id: taskId,
      status: 'scheduled',
      message: 'Enhanced PDF generation has been scheduled'
    });
  } catch (error) {
    console.error('Error scheduling PDF generation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check the status of a PDF generation task
router.get('/tasks/:taskId/status', async (req, res) => {
  try {
    const { taskId } = req.params;
    const statusFilePath = path.join('data/logs', `cer_task_${taskId}_status.json`);
    
    if (!fs.existsSync(statusFilePath)) {
      return res.status(404).json({ 
        task_id: taskId,
        status: 'not_found',
        message: 'Task not found or still initializing'
      });
    }
    
    const statusContent = fs.readFileSync(statusFilePath, 'utf8');
    const taskStatus = JSON.parse(statusContent);
    
    res.json(taskStatus);
  } catch (error) {
    console.error('Error checking task status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a list of generated PDFs
router.get('/pdfs', async (req, res) => {
  try {
    const pdfsDir = 'data/exports';
    if (!fs.existsSync(pdfsDir)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(pdfsDir);
    const pdfFiles = files
      .filter(file => file.startsWith('CER_') && file.endsWith('.pdf'))
      .map(file => {
        const filePath = path.join(pdfsDir, file);
        const stats = fs.statSync(filePath);
        
        // Extract NDC code from filename (format: CER_<ndc>_<timestamp>.pdf)
        const parts = file.split('_');
        const ndcCode = parts[1];
        
        return {
          filename: file,
          ndcCode,
          size: stats.size,
          created: stats.birthtime.toISOString(),
          path: `/api/cer/pdfs/${file}`
        };
      });
    
    // Sort by creation date, newest first
    pdfFiles.sort((a, b) => new Date(b.created) - new Date(a.created));
    
    res.json(pdfFiles);
  } catch (error) {
    console.error('Error listing PDFs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download a specific PDF
router.get('/pdfs/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join('data/exports', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'PDF not found' });
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;