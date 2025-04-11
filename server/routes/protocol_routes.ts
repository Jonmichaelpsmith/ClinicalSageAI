import type { Express, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { spawn } from 'child_process';
import { protocolAnalyzerService } from "../protocol-analyzer-service";
import { strategicIntelligenceService } from "../strategic-intelligence-service";
import { notificationService } from "../notification-service";

// Set up multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF, docx, and txt files
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Only PDF, DOCX, and TXT files are allowed'));
    }
    cb(null, true);
  }
});

export default function registerProtocolRoutes(app: Express): void {
  /**
   * Full protocol analysis endpoint - handles both file uploads and text input
   */
  app.post('/api/protocol/full-analyze', upload.single('file'), async (req: Request, res: Response) => {
    try {
      let protocolText = '';
      let fileInfo = null;
      
      // Handle file upload if provided
      if (req.file) {
        // Save uploaded file temporarily
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const timestamp = Date.now();
        const fileExt = path.extname(req.file.originalname);
        const fileName = `protocol_${timestamp}${fileExt}`;
        const filePath = path.join(uploadDir, fileName);
        
        fs.writeFileSync(filePath, req.file.buffer);
        
        fileInfo = {
          originalName: req.file.originalname,
          fileName: fileName,
          filePath: filePath,
          mimeType: req.file.mimetype,
          size: req.file.size
        };
        
        // Extract text from file based on type
        if (fileInfo.mimeType === 'application/pdf') {
          protocolText = await protocolAnalyzerService.extractTextFromPdf(filePath);
        } else if (fileInfo.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // Use Python script to extract text from docx
          protocolText = await extractTextFromDocx(filePath);
        } else if (fileInfo.mimeType === 'text/plain') {
          protocolText = fs.readFileSync(filePath, 'utf8');
        }
      } 
      // Or use text input if provided
      else if (req.body.text) {
        protocolText = req.body.text;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Either a file or text content must be provided'
        });
      }
      
      // Extract protocol data
      const protocolData = await protocolAnalyzerService.extractProtocolData(protocolText);
      
      // Analyze protocol data
      const analysisResults = await protocolAnalyzerService.analyzeProtocol(protocolData);
      
      // Clean up temporary file if it exists
      if (fileInfo && fileInfo.filePath && fs.existsSync(fileInfo.filePath)) {
        fs.unlinkSync(fileInfo.filePath);
      }
      
      // Log the analysis activity
      notificationService.addNotification({
        type: 'protocol_analysis',
        message: `Protocol analysis for ${protocolData.title || 'untitled protocol'}`,
        timestamp: new Date().toISOString(),
        details: {
          indication: protocolData.indication || 'Not specified',
          phase: protocolData.phase || 'Not specified'
        }
      });
      
      // Return analysis results
      res.json({
        success: true,
        protocol: protocolData,
        analysis: analysisResults
      });
    } catch (error) {
      console.error('Error in protocol analysis:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred during protocol analysis'
      });
    }
  });

  /**
   * Upload protocol document
   */
  app.post('/api/protocol/upload', upload.single('protocol'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No protocol file uploaded'
        });
      }
      
      // Save uploaded file
      const uploadDir = path.join(process.cwd(), 'uploads/protocols');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const timestamp = Date.now();
      const fileExt = path.extname(req.file.originalname);
      const fileName = `protocol_${timestamp}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      
      fs.writeFileSync(filePath, req.file.buffer);
      
      // Create protocol record
      const protocolId = await protocolAnalyzerService.saveProtocol({
        title: req.body.title || `Protocol ${timestamp}`,
        fileName: fileName,
        originalName: req.file.originalname,
        filePath: filePath,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadDate: new Date(),
        status: 'uploaded',
        userId: req.body.userId || null
      });
      
      res.json({
        success: true,
        protocolId,
        fileName,
        message: 'Protocol uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading protocol:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred during protocol upload'
      });
    }
  });

  /**
   * Analyze uploaded protocol
   */
  app.post('/api/protocol/analyze/:id', async (req: Request, res: Response) => {
    try {
      const protocolId = parseInt(req.params.id);
      
      if (isNaN(protocolId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid protocol ID'
        });
      }
      
      // Get protocol data
      const protocol = await protocolAnalyzerService.getProtocol(protocolId);
      
      if (!protocol) {
        return res.status(404).json({
          success: false,
          message: 'Protocol not found'
        });
      }
      
      // Extract text from protocol file
      let protocolText = '';
      
      if (protocol.mimeType === 'application/pdf') {
        protocolText = await protocolAnalyzerService.extractTextFromPdf(protocol.filePath);
      } else if (protocol.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        protocolText = await extractTextFromDocx(protocol.filePath);
      } else if (protocol.mimeType === 'text/plain') {
        protocolText = fs.readFileSync(protocol.filePath, 'utf8');
      } else {
        return res.status(400).json({
          success: false,
          message: 'Unsupported file format'
        });
      }
      
      // Extract protocol data
      const protocolData = await protocolAnalyzerService.extractProtocolData(protocolText);
      
      // Update protocol record with extracted data
      await protocolAnalyzerService.updateProtocol(protocolId, {
        indication: protocolData.indication,
        phase: protocolData.phase,
        primaryEndpoints: protocolData.primaryEndpoints,
        secondaryEndpoints: protocolData.secondaryEndpoints,
        sampleSize: protocolData.sampleSize,
        durationWeeks: protocolData.durationWeeks,
        population: protocolData.population,
        status: 'analyzed'
      });
      
      // Analyze protocol against CSR database
      const analysisResults = await protocolAnalyzerService.analyzeProtocol(protocolData);
      
      // Save analysis results
      const analysisId = await protocolAnalyzerService.saveAnalysis({
        protocolId,
        analysisDate: new Date(),
        results: analysisResults,
        status: 'completed'
      });
      
      // Log the analysis activity
      notificationService.addNotification({
        type: 'protocol_analysis',
        message: `Protocol analysis for ${protocol.title}`,
        timestamp: new Date().toISOString(),
        details: {
          protocolId,
          indication: protocolData.indication || 'Not specified',
          phase: protocolData.phase || 'Not specified'
        }
      });
      
      res.json({
        success: true,
        protocolId,
        analysisId,
        protocol: {
          ...protocol,
          ...protocolData
        },
        analysis: analysisResults
      });
    } catch (error) {
      console.error('Error analyzing protocol:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred during protocol analysis'
      });
    }
  });

  /**
   * Get protocol analysis by ID
   */
  app.get('/api/protocol/analysis/:id', async (req: Request, res: Response) => {
    try {
      const analysisId = parseInt(req.params.id);
      
      if (isNaN(analysisId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid analysis ID'
        });
      }
      
      // Get analysis data
      const analysis = await protocolAnalyzerService.getAnalysis(analysisId);
      
      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: 'Analysis not found'
        });
      }
      
      // Get protocol data
      const protocol = await protocolAnalyzerService.getProtocol(analysis.protocolId);
      
      res.json({
        success: true,
        analysis,
        protocol
      });
    } catch (error) {
      console.error('Error retrieving protocol analysis:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred retrieving protocol analysis'
      });
    }
  });
}

/**
 * Helper function to extract text from DOCX files using Python
 */
async function extractTextFromDocx(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [
      'scripts/extract_protocol_data.py',
      '--docx',
      filePath
    ]);
    
    let resultData = '';
    let errorData = '';
    
    pythonProcess.stdout.on('data', (data) => {
      resultData += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
      console.error(`DOCX extraction error: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`DOCX extraction failed: ${errorData}`));
      } else {
        resolve(resultData.trim());
      }
    });
  });
}