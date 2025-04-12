import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { academicDocumentProcessor } from "../services/academic-document-processor";
import { regulatoryIntelligenceService } from "../services/regulatory-intelligence-service";

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'academic_resources'));
  },
  filename: function (req, file, cb) {
    // Preserve original filename but make it safe
    const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${safeFilename}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept PDFs only
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

export const academicRegulatoryRouter = Router();

// Route to process academic PDFs
academicRegulatoryRouter.post('/academic/process-pdf', upload.single('pdf'), async (req: Request, res: Response) => {
  try {
    // Ensure file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }
    
    console.log(`Processing academic PDF: ${req.file.originalname}`);
    
    // Call the academic document processor
    const result = await academicDocumentProcessor.processPdfDocument(req.file.path);
    
    // Return the processing result
    res.json(result);
  } catch (error) {
    console.error('Error processing academic PDF:', error);
    res.status(500).json({ error: 'Failed to process academic PDF' });
  }
});

// Route to get regulatory intelligence for a specific phase and indication
academicRegulatoryRouter.get('/regulatory/intelligence', async (req: Request, res: Response) => {
  try {
    const { phase, indication } = req.query as { phase?: string, indication?: string };
    
    if (!phase) {
      return res.status(400).json({ error: 'Phase parameter is required' });
    }
    
    const regulatorySummary = await regulatoryIntelligenceService.getRegulatoryIntelligence(
      phase,
      indication as string | undefined
    );
    
    res.json(regulatorySummary);
  } catch (error) {
    console.error('Error getting regulatory intelligence:', error);
    res.status(500).json({ error: 'Failed to get regulatory intelligence' });
  }
});

// Route to analyze protocol for regulatory compliance
academicRegulatoryRouter.post('/regulatory/analyze-protocol', async (req: Request, res: Response) => {
  try {
    const { protocolText, phase, indication } = req.body;
    
    if (!protocolText || !phase) {
      return res.status(400).json({ error: 'Protocol text and phase are required' });
    }
    
    const analysis = await regulatoryIntelligenceService.analyzeProtocolRegulatory(
      protocolText,
      phase,
      indication
    );
    
    res.json({ analysis });
  } catch (error) {
    console.error('Error analyzing protocol for regulatory compliance:', error);
    res.status(500).json({ error: 'Failed to analyze protocol' });
  }
});

// Route to get stats about academic documents and regulatory intelligence
academicRegulatoryRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const recentDocuments = await academicDocumentProcessor.getRecentlyProcessedDocuments(10);
    const regulatoryStats = regulatoryIntelligenceService.getStats();
    
    res.json({
      recentDocuments,
      regulatoryStats
    });
  } catch (error) {
    console.error('Error getting academic and regulatory stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});