import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ProtocolAnalyzerService } from '../protocol-analyzer-service';
import { ProtocolOptimizerService } from '../protocol-optimizer-service';
import { HuggingFaceService } from '../huggingface-service';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Service instances
const protocolAnalyzer = new ProtocolAnalyzerService();
const protocolOptimizer = new ProtocolOptimizerService();
const huggingFaceService = new HuggingFaceService(process.env.HF_API_KEY || '');

// Upload and analyze protocol file
router.post('/analyze-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    // Extract text based on file type
    let text = '';
    
    if (fileExtension === '.txt') {
      text = fs.readFileSync(filePath, 'utf8');
    } else if (fileExtension === '.pdf' || fileExtension === '.docx' || fileExtension === '.doc') {
      // For PDF/DOCX/DOC files, we'd use appropriate extraction libraries
      // This is a simplified placeholder
      text = `Extracted text from ${req.file.originalname}. In a real implementation, 
              we would use proper libraries for extraction from ${fileExtension} files.`;
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Unsupported file type. Please upload a .txt, .pdf, .doc, or .docx file' 
      });
    }

    // Analyze the protocol text
    const protocol = await protocolAnalyzer.analyzeProtocol(text);
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    return res.json({ 
      success: true, 
      protocol 
    });
  } catch (error: any) {
    console.error('Error processing protocol file:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to process protocol file' 
    });
  }
});

// Parse protocol text
router.post('/parse-text', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Text is required' 
      });
    }

    // Basic protocol parsing
    const protocol = await protocolAnalyzer.analyzeProtocol(text);
    
    return res.json({ 
      success: true, 
      protocol 
    });
  } catch (error: any) {
    console.error('Error parsing protocol text:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to parse protocol text' 
    });
  }
});

// Full protocol analysis with AI
router.post('/full-analyze', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Text is required' 
      });
    }

    // Deep protocol analysis with HuggingFace
    const basicAnalysis = await protocolAnalyzer.analyzeProtocol(text);
    
    // Use HuggingFace for deeper analysis
    const enhancedAnalysis = await huggingFaceService.enhanceProtocolAnalysis(text, basicAnalysis);
    
    return res.json({ 
      success: true, 
      protocol: enhancedAnalysis 
    });
  } catch (error: any) {
    console.error('Error during deep protocol analysis:', error);
    const errorMessage = error?.message || 'Failed to perform deep protocol analysis';
    return res.status(500).json({ 
      success: false, 
      message: errorMessage
    });
  }
});

// Optimize protocol
router.post('/optimize', async (req, res) => {
  try {
    const protocolData = req.body;
    
    if (!protocolData || typeof protocolData !== 'object') {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid protocol data is required' 
      });
    }

    // Get optimization recommendations
    const optimizationResult = await protocolOptimizer.optimizeProtocol(protocolData);
    
    return res.json({ 
      success: true, 
      result: optimizationResult 
    });
  } catch (error: any) {
    console.error('Error optimizing protocol:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to optimize protocol' 
    });
  }
});

export { router as protocolRoutes };