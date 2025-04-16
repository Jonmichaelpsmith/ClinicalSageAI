const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Ensure directories exist
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const PDF_DIR = path.join(UPLOADS_DIR, 'cer_pdfs');
const TASKS_DIR = path.join(UPLOADS_DIR, 'cer_tasks');
const REPORTS_DIR = path.join(UPLOADS_DIR, 'cer_reports');

// Create directories if they don't exist
[UPLOADS_DIR, PDF_DIR, TASKS_DIR, REPORTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Generate a CER report for the specified NDC code
 */
router.get('/:ndcCode', async (req, res) => {
  const { ndcCode } = req.params;
  
  if (!ndcCode || !ndcCode.trim()) {
    return res.status(400).json({ 
      success: false, 
      error: 'NDC code is required' 
    });
  }

  try {
    const reportId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Execute the cer_narrative.py script
    const pythonProcess = spawn('python', [
      path.join(process.cwd(), 'cer_narrative.py'),
      '--ndc', ndcCode
    ]);
    
    let cerReport = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      cerReport += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    // Handle process completion
    pythonProcess.on('close', async (code) => {
      if (code !== 0 || !cerReport) {
        console.error('Error generating CER narrative:', errorOutput || `Process exited with code ${code}`);
        return res.status(500).json({ 
          success: false, 
          error: errorOutput || 'Failed to generate CER report' 
        });
      }
      
      // Save the report
      const reportData = {
        id: reportId,
        ndcCode: ndcCode,
        title: `CER Report for NDC ${ndcCode}`,
        content: cerReport,
        created_at: timestamp,
        metadata: {
          generatedAt: timestamp,
          faersRecordCount: (cerReport.match(/adverse event/gi) || []).length
        }
      };
      
      fs.writeFileSync(
        path.join(REPORTS_DIR, `${reportId}.json`),
        JSON.stringify(reportData, null, 2)
      );
      
      res.json({
        success: true,
        report_id: reportId,
        cer_report: cerReport
      });
    });
    
  } catch (err) {
    console.error('Error processing CER request:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Internal server error' 
    });
  }
});

/**
 * Generate an enhanced PDF for a CER report
 */
router.post('/:ndcCode/enhanced-pdf-task', async (req, res) => {
  const { ndcCode } = req.params;
  const { user_id } = req.body;
  
  if (!ndcCode || !ndcCode.trim()) {
    return res.status(400).json({ 
      success: false, 
      error: 'NDC code is required' 
    });
  }
  
  try {
    const taskId = uuidv4();
    const taskFilePath = path.join(TASKS_DIR, `${taskId}.json`);
    
    // Create task record
    const task = {
      task_id: taskId,
      status: 'scheduled',
      ndcCode: ndcCode,
      user_id: user_id || 'anonymous',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    fs.writeFileSync(taskFilePath, JSON.stringify(task, null, 2));
    
    // Start PDF generation in background
    const pythonProcess = spawn('python', [
      path.join(process.cwd(), 'cer_tasks_cli.py'),
      '--ndc', ndcCode,
      '--task-id', taskId,
      '--user-id', user_id || 'anonymous'
    ]);
    
    // Don't wait for process completion - return task info immediately
    res.json({
      success: true,
      task_id: taskId,
      status: 'scheduled',
      message: 'PDF generation has been scheduled'
    });
    
    // Handle errors
    pythonProcess.stderr.on('data', (data) => {
      console.error(`PDF generation error for task ${taskId}:`, data.toString());
      
      // Update task status to failed
      if (fs.existsSync(taskFilePath)) {
        const taskData = JSON.parse(fs.readFileSync(taskFilePath));
        taskData.status = 'failed';
        taskData.message = data.toString();
        taskData.updated_at = new Date().toISOString();
        fs.writeFileSync(taskFilePath, JSON.stringify(taskData, null, 2));
      }
    });
    
  } catch (err) {
    console.error('Error scheduling PDF generation:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Internal server error' 
    });
  }
});

/**
 * Get the status of a PDF generation task
 */
router.get('/tasks/:taskId/status', (req, res) => {
  const { taskId } = req.params;
  const taskFilePath = path.join(TASKS_DIR, `${taskId}.json`);
  
  if (!fs.existsSync(taskFilePath)) {
    return res.status(404).json({ 
      success: false, 
      error: 'Task not found' 
    });
  }
  
  try {
    const taskData = JSON.parse(fs.readFileSync(taskFilePath));
    res.json(taskData);
  } catch (err) {
    console.error('Error reading task status:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Internal server error' 
    });
  }
});

/**
 * Get list of generated PDFs
 */
router.get('/pdfs', (req, res) => {
  try {
    // Create directory if it doesn't exist yet
    if (!fs.existsSync(PDF_DIR)) {
      fs.mkdirSync(PDF_DIR, { recursive: true });
      return res.json([]);
    }
    
    const files = fs.readdirSync(PDF_DIR)
      .filter(file => file.endsWith('.pdf'))
      .map(filename => {
        const filePath = path.join(PDF_DIR, filename);
        const stats = fs.statSync(filePath);
        
        // Extract NDC code from filename (format: cer_<ndc>_<uuid>.pdf)
        const filenameParts = filename.split('_');
        const ndcCode = filenameParts.length > 1 ? filenameParts[1] : 'unknown';
        
        return {
          filename,
          ndcCode,
          created: stats.mtime,
          size: stats.size
        };
      })
      .sort((a, b) => b.created - a.created); // Sort newest first
    
    res.json(files);
  } catch (err) {
    console.error('Error retrieving PDFs:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Internal server error' 
    });
  }
});

/**
 * Serve a PDF file
 */
router.get('/pdfs/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(PDF_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ 
      success: false, 
      error: 'PDF not found' 
    });
  }
  
  res.sendFile(filePath);
});

/**
 * Get list of recent CER reports
 */
router.get('/reports', (req, res) => {
  try {
    // Create directory if it doesn't exist yet
    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
      return res.json({ reports: [] });
    }
    
    const files = fs.readdirSync(REPORTS_DIR)
      .filter(file => file.endsWith('.json'))
      .map(filename => {
        try {
          const filePath = path.join(REPORTS_DIR, filename);
          const reportData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          // Return only metadata, not the full report content
          return {
            id: reportData.id,
            title: reportData.title,
            ndcCode: reportData.ndcCode,
            created_at: reportData.created_at,
            metadata: reportData.metadata
          };
        } catch (err) {
          console.error(`Error parsing report ${filename}:`, err);
          return null;
        }
      })
      .filter(report => report !== null)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sort newest first
    
    res.json({ reports: files });
  } catch (err) {
    console.error('Error retrieving reports:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Internal server error' 
    });
  }
});

/**
 * Get a specific CER report
 */
router.get('/reports/:reportId', (req, res) => {
  const { reportId } = req.params;
  const filePath = path.join(REPORTS_DIR, `${reportId}.json`);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ 
      success: false, 
      error: 'Report not found' 
    });
  }
  
  try {
    const reportData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(reportData);
  } catch (err) {
    console.error('Error reading report:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Internal server error' 
    });
  }
});

module.exports = router;