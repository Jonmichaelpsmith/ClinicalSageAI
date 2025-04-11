import { Express, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { protocolAnalyzerService } from '../protocol-analyzer-service';

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

export default function registerProtocolRoutes(app: Express): void {
  // Ensure temp directory exists
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  /**
   * Full protocol analysis endpoint - handles both file uploads and text input
   */
  app.post('/api/protocol/full-analyze', upload.single('file'), async (req: Request, res: Response) => {
    try {
      // Check if we have a file or text in the request
      const file = req.file;
      const text = req.body.text;
      const protocolId = req.body.protocol_id || `TS-${Math.floor(Math.random() * 10000)}`;
      
      if (!file && !text) {
        return res.status(400).json({
          success: false,
          message: 'No file or text provided'
        });
      }
      
      // Create a temporary file path for saving the protocol
      const tempFilePath = path.join(tempDir, `protocol_${uuidv4()}`);
      
      // If we have a file, save it to the temp directory
      if (file) {
        fs.writeFileSync(tempFilePath + path.extname(file.originalname), file.buffer);
      } else if (text) {
        // If we have text, save it to a text file
        fs.writeFileSync(tempFilePath + '.txt', text);
      }
      
      // Run the Python script to extract and analyze protocol data
      const pythonScript = spawn('python', [
        'scripts/extract_protocol_data.py',
        file ? tempFilePath + path.extname(file.originalname) : tempFilePath + '.txt',
        tempFilePath + '_output.json'
      ]);
      
      let errorOutput = '';
      
      pythonScript.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`Protocol extraction error: ${data}`);
      });
      
      pythonScript.on('close', async (code) => {
        // Clean up the temporary input file
        try {
          if (file) {
            fs.unlinkSync(tempFilePath + path.extname(file.originalname));
          } else {
            fs.unlinkSync(tempFilePath + '.txt');
          }
        } catch (err) {
          console.error('Failed to clean up temp file:', err);
        }
        
        if (code !== 0) {
          console.error(`Python extraction script exited with code ${code}`);
          return res.status(500).json({
            success: false,
            message: 'Failed to extract protocol data',
            error: errorOutput
          });
        }
        
        try {
          // Read the extracted data from the output file
          const extractedData = JSON.parse(fs.readFileSync(tempFilePath + '_output.json', 'utf8'));
          
          // Clean up the output file
          fs.unlinkSync(tempFilePath + '_output.json');
          
          // Store protocol in database (optional step, can be enabled if needed)
          // const protocolDbId = await protocolAnalyzerService.storeProtocol(
          //   file ? file.originalname : 'Pasted Protocol',
          //   file ? tempFilePath + path.extname(file.originalname) : tempFilePath + '.txt',
          //   file ? file.size : text.length,
          //   extractedData
          // );
          
          // Run protocol analysis
          // Using analyze_protocol.py script directly without using storeProtocol first
          const analysisOutputPath = path.join(tempDir, `analysis_${protocolId}_${Date.now()}.json`);
          const extractedDataPath = path.join(tempDir, `extracted_data_${protocolId}.json`);
          
          // Write extracted data to temp file for analysis script
          fs.writeFileSync(extractedDataPath, JSON.stringify(extractedData));
          
          // Run Python script for analysis
          const analysisProcess = spawn('python', [
            'scripts/analyze_protocol.py',
            extractedDataPath,
            analysisOutputPath,
            protocolId
          ]);
          
          let analysisErrorOutput = '';
          
          analysisProcess.stderr.on('data', (data) => {
            analysisErrorOutput += data.toString();
            console.error(`Protocol analysis error: ${data}`);
          });
          
          analysisProcess.on('close', async (analysisCode) => {
            // Clean up temp file
            try {
              fs.unlinkSync(extractedDataPath);
            } catch (err) {
              console.error('Failed to clean up temp file:', err);
            }
            
            if (analysisCode !== 0) {
              return res.status(500).json({
                success: false,
                message: 'Failed to analyze protocol',
                error: analysisErrorOutput
              });
            }
            
            try {
              // Read analysis results
              const analysisResult = JSON.parse(fs.readFileSync(analysisOutputPath, 'utf8'));
              
              // Clean up analysis output file
              fs.unlinkSync(analysisOutputPath);
              
              // Return the analysis results
              res.json({
                success: true,
                ...analysisResult
              });
            } catch (err: any) {
              console.error('Error parsing analysis results:', err);
              return res.status(500).json({
                success: false,
                message: 'Failed to parse analysis results',
                error: err.message
              });
            }
          });
        } catch (err: any) {
          console.error('Error processing extracted data:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to process extracted data',
            error: err.message
          });
        }
      });
    } catch (err: any) {
      console.error('Error in protocol analysis endpoint:', err);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
      });
    }
  });

  /**
   * Upload protocol document
   */
  app.post('/api/protocol/upload', upload.single('protocol'), async (req: Request, res: Response) => {
    try {
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No protocol file uploaded'
        });
      }
      
      // Save the file
      const filePath = await protocolAnalyzerService.saveProtocolFile(file);
      
      // Extract data from the protocol
      const extractedData = await protocolAnalyzerService.extractProtocolData(filePath);
      
      // Store protocol in database
      const protocolId = await protocolAnalyzerService.storeProtocol(
        file.originalname,
        filePath,
        file.size,
        extractedData
      );
      
      // Return the protocol ID and basic data
      res.json({
        success: true,
        message: 'Protocol uploaded successfully',
        protocolId,
        filename: file.originalname,
        indication: extractedData.indication,
        phase: extractedData.phase
      });
    } catch (err: any) {
      console.error('Error uploading protocol:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to upload protocol',
        error: err.message
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
      
      // Get protocol from database
      const extractedData = await protocolAnalyzerService.getProtocolData(protocolId);
      
      if (!extractedData) {
        return res.status(404).json({
          success: false,
          message: 'Protocol not found'
        });
      }
      
      // Analyze protocol
      const analysisResult = await protocolAnalyzerService.analyzeProtocol(protocolId, extractedData);
      
      // Return the analysis results
      res.json({
        success: true,
        analysisResult
      });
    } catch (err: any) {
      console.error('Error analyzing protocol:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze protocol',
        error: err.message
      });
    }
  });

  /**
   * Get protocol analysis by ID
   */
  app.get('/api/protocol/analysis/:id', async (req: Request, res: Response) => {
    try {
      const protocolId = parseInt(req.params.id);
      
      if (isNaN(protocolId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid protocol ID'
        });
      }
      
      // Get analysis from database
      const analysis = await protocolAnalyzerService.getProtocolAnalysis(protocolId);
      
      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: 'Protocol analysis not found'
        });
      }
      
      // Return the analysis results
      res.json({
        success: true,
        analysis
      });
    } catch (err: any) {
      console.error('Error getting protocol analysis:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to get protocol analysis',
        error: err.message
      });
    }
  });
}