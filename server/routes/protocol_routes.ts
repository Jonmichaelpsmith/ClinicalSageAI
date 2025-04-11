import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protocolAnalyzerService } from '../protocol-analyzer-service';
import { protocolOptimizerService } from '../protocol-optimizer-service';
import { huggingFaceService } from '../huggingface-service';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

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
    const protocol = await protocolAnalyzerService.analyzeProtocol(text);

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


router.post('/parse-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const fileBuffer = req.file.buffer;
    const extractedText = await extractTextFromPdf(fileBuffer); // Placeholder function

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(422).json({
        success: false,
        message: 'Could not extract text from the provided file'
      });
    }

    const protocolData = await analyzeProtocolText(extractedText); // Placeholder function

    // Log the activity with more details for debugging
    console.log(`Protocol file parsed successfully: ${req.file.originalname} (${req.file.size} bytes)`);

    res.json({
      success: true,
      data: protocolData
    });
  } catch (error) {
    console.error('Error parsing protocol file:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to parse protocol file',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

router.post('/parse-text', express.json(), async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No text provided or text is empty' 
      });
    }

    const protocolData = await analyzeProtocolText(text); // Placeholder function

    // Log successful text parsing
    console.log(`Protocol text parsed successfully: ${text.substring(0, 50)}...`);

    res.json({
      success: true,
      data: protocolData
    });
  } catch (error) {
    console.error('Error analyzing protocol text:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to analyze protocol text',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

router.post('/deep-analyze', express.json(), async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No text provided or text is empty' 
      });
    }

    // Get basic analysis first
    const basicAnalysis = await analyzeProtocolText(text); // Placeholder function

    // Check if HuggingFace API key is available
    if (!huggingFaceService.isApiKeyAvailable()) {
      console.warn('HuggingFace API key is not available, returning basic analysis only');
      return res.json({
        success: true,
        data: basicAnalysis,
        message: 'Basic analysis only (AI enhancement unavailable)'
      });
    }

    try {
      // Use HuggingFace service to enhance analysis with AI
      const enhancedAnalysis = await huggingFaceService.enhanceProtocolAnalysis(text, basicAnalysis);

      console.log('Deep AI analysis completed successfully');

      res.json({
        success: true,
        data: enhancedAnalysis
      });
    } catch (aiError) {
      console.error('Error in AI enhancement:', aiError);
      // Fall back to basic analysis if AI enhancement fails
      res.json({
        success: true,
        data: basicAnalysis,
        message: 'AI enhancement failed, returning basic analysis',
        aiError: process.env.NODE_ENV === 'development' ? String(aiError) : undefined
      });
    }
  } catch (error) {
    console.error('Error performing deep analysis:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to perform deep analysis',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
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
    const optimizationResult = await protocolOptimizerService.optimizeProtocol(protocolData);

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

// Placeholder functions -  Replace with actual implementations
async function analyzeProtocolText(text) {
  // Simulate analysis
  return { analyzed: text };
}

async function extractTextFromPdf(buffer) {
    //Simulate PDF extraction
    return "This is extracted text"
}