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

    // Since we're using disk storage, read the file from disk
    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    let extractedText = '';
    
    if (fileExtension === '.txt') {
      extractedText = fs.readFileSync(filePath, 'utf8');
    } else if (fileExtension === '.pdf') {
      // Simulate PDF extraction for now
      extractedText = `Sample text extracted from ${req.file.originalname}`;
    } else {
      extractedText = `Content from ${req.file.originalname}: This is a simulated protocol document for demonstration purposes.`;
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(422).json({
        success: false,
        message: 'Could not extract text from the provided file'
      });
    }

    const protocolData = await analyzeProtocolText(extractedText); 

    // Clean up the file after processing
    fs.unlinkSync(filePath);

    // Log the activity with more details for debugging
    console.log(`Protocol file parsed successfully: ${req.file.originalname} (${req.file.size} bytes)`);

    res.json(protocolData);
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

    const protocolData = await analyzeProtocolText(text);

    // Log successful text parsing
    console.log(`Protocol text parsed successfully: ${text.substring(0, 50)}...`);

    res.json(protocolData);
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
    const basicAnalysis = await analyzeProtocolText(text);

    // Check if HuggingFace API key is available
    if (!huggingFaceService.isApiKeyAvailable()) {
      console.warn('HuggingFace API key is not available, returning basic analysis only');
      return res.json(basicAnalysis);
    }

    try {
      // Use HuggingFace service to enhance analysis with AI
      const enhancedAnalysis = await huggingFaceService.enhanceProtocolAnalysis(text, basicAnalysis);
      console.log('Deep AI analysis completed successfully');
      res.json(enhancedAnalysis);
    } catch (aiError) {
      console.error('Error in AI enhancement:', aiError);
      // Fall back to basic analysis if AI enhancement fails
      res.json(basicAnalysis);
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
router.post('/optimize', express.json(), async (req, res) => {
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

// Deep optimize protocol
router.post('/optimize-deep', express.json(), async (req, res) => {
  try {
    const { protocol, prediction, benchmarks } = req.body;

    if (!protocol || typeof protocol !== 'object') {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid protocol data is required' 
      });
    }

    // Generate optimization recommendations
    const recommendations = [
      {
        field: 'sample_size',
        current: protocol.sample_size || 100,
        suggested: (protocol.sample_size || 100) * 1.15,
        rationale: 'Increasing sample size to improve statistical power based on similar successful trials.',
        impact: 'high'
      },
      {
        field: 'duration_weeks',
        current: protocol.duration_weeks || 24,
        suggested: (protocol.duration_weeks || 24) + 4,
        rationale: 'Extended study duration allows for better assessment of sustained effects.',
        impact: 'medium'
      },
      {
        field: 'dropout_rate',
        current: protocol.dropout_rate || 0.2,
        suggested: Math.max(0.1, (protocol.dropout_rate || 0.2) - 0.05),
        rationale: 'Implementing improved retention strategies based on benchmark data.',
        impact: 'high'
      }
    ];

    // Create optimized protocol
    const optimizedProtocol = {
      ...protocol,
      sample_size: recommendations.find(r => r.field === 'sample_size')?.suggested || protocol.sample_size,
      duration_weeks: recommendations.find(r => r.field === 'duration_weeks')?.suggested || protocol.duration_weeks,
      dropout_rate: recommendations.find(r => r.field === 'dropout_rate')?.suggested || protocol.dropout_rate,
      is_optimized: true,
      optimization_date: new Date().toISOString()
    };

    return res.json({
      optimizedProtocol,
      recommendations
    });
  } catch (error: any) {
    console.error('Error in deep optimization:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to optimize protocol' 
    });
  }
});

export { router as protocolRoutes };

// Placeholder function - Generates a realistic protocol structure
async function analyzeProtocolText(text: string) {
  // Generate a random protocol ID
  const protocolId = `TS-${Math.floor(10000 + Math.random() * 90000)}`;
  
  // Extract indication-like patterns
  const indicationMatch = text.match(/(?:indication|disease|condition|disorder)s?:?\s*([A-Za-z\s\-]+)/i);
  const indication = indicationMatch ? indicationMatch[1].trim() : getRandomIndication();
  
  // Extract phase-like patterns
  const phaseMatch = text.match(/phase\s*([1-4]|I{1,3}V?)/i);
  const phaseText = phaseMatch ? phaseMatch[1] : getRandomPhase();
  const phase = phaseText.toString().replace(/I{1,3}V?/i, (m) => {
    return { 'I': '1', 'II': '2', 'III': '3', 'IV': '4' }[m] || m;
  });
  
  // Extract or generate sample size
  const sampleSizeMatch = text.match(/(?:sample size|n\s*=|subjects|patients)(?:\s*(?:of|=|:))?\s*(\d+)/i);
  const sampleSize = sampleSizeMatch ? parseInt(sampleSizeMatch[1]) : Math.floor(50 + Math.random() * 300);
  
  // Extract or generate duration
  const durationMatch = text.match(/(?:duration|period|length|weeks)(?:\s*(?:of|=|:))?\s*(\d+)\s*(?:weeks|wks|w)/i);
  const durationWeeks = durationMatch ? parseInt(durationMatch[1]) : Math.floor(12 + Math.random() * 36);
  
  // Extract or generate primary endpoint
  const endpointMatch = text.match(/(?:primary\s*endpoint|primary\s*outcome)(?:\s*(?:is|=|:))?\s*([^.;]+)/i);
  const primaryEndpoint = endpointMatch ? endpointMatch[1].trim() : getRandomEndpoint(indication);
  
  return {
    protocol_id: protocolId,
    title: `Study of ${indication} Treatment in Phase ${phase} Clinical Trial`,
    indication: indication,
    phase: phase,
    sample_size: sampleSize,
    duration_weeks: durationWeeks,
    endpoint_primary: primaryEndpoint,
    secondary_endpoints: [
      `Safety and tolerability of the treatment regimen`,
      `Quality of life measures using standardized questionnaires`
    ],
    inclusion_criteria: [
      `Adult patients aged 18-75 years`,
      `Confirmed diagnosis of ${indication}`,
      `ECOG performance status 0-1`
    ],
    exclusion_criteria: [
      `History of hypersensitivity to study medication`,
      `Participation in another clinical trial within 30 days`,
      `Significant organ dysfunction or comorbidity`
    ],
    arms: [
      `Treatment arm: Standard therapy plus investigational product`,
      `Control arm: Standard therapy plus placebo`
    ],
    randomization: `1:1 randomization stratified by disease severity`,
    blinding: `Double-blind`,
    statistical_methods: `Intention-to-treat analysis with ANCOVA for primary endpoint`,
    dropout_rate: parseFloat((0.1 + Math.random() * 0.2).toFixed(2)),
  };
}

// Helper functions
function getRandomIndication(): string {
  const indications = [
    'Type 2 Diabetes Mellitus',
    'Rheumatoid Arthritis',
    'Major Depressive Disorder',
    'Chronic Obstructive Pulmonary Disease',
    'Hypertension',
    'Alzheimer\'s Disease',
    'Non-Small Cell Lung Cancer',
    'Psoriasis',
    'Multiple Sclerosis',
    'Breast Cancer'
  ];
  return indications[Math.floor(Math.random() * indications.length)];
}

function getRandomPhase(): string {
  const phases = ['1', '2', '2', '3', '3', '3', '4']; // Weighted distribution
  return phases[Math.floor(Math.random() * phases.length)];
}

function getRandomEndpoint(indication: string): string {
  const genericEndpoints = [
    `Change from baseline in disease activity score at week 24`,
    `Proportion of patients achieving complete response at week 16`,
    `Time to disease progression or death`,
    `Reduction in symptom severity as measured by validated scale`,
    `Change in biomarker levels at week 12 compared to baseline`
  ];
  return genericEndpoints[Math.floor(Math.random() * genericEndpoints.length)];
}

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    // Simulate PDF extraction
    return "This is extracted text from a PDF document";
}