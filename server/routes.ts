import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { validatePdfFile, savePdfFile, getPdfMetadata, processPdfFile } from "./pdf-processor";
import { analyzeCsrContent, generateCsrSummary } from "./openai-service";
import { 
  generateAnalyticsSummary, 
  generatePredictiveAnalysis, 
  compareTrialsAnalysis, 
  analyzeCompetitorsForSponsor 
} from "./analytics-service";
import { translationService, supportedLanguages } from "./translation-service";
import { generateProtocol, type ProtocolGenerationParams } from "./protocol-service";
import path from "path";
import fs from "fs";
import { insertCsrReportSchema } from "@shared/schema";
import { ZodError, z } from "zod";
import { fromZodError } from "zod-validation-error";

// Set up multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

function errorHandler(err: Error, res: Response): Response {
  console.error(err);
  if (err instanceof ZodError) {
    const validationError = fromZodError(err);
    return res.status(400).json({ 
      success: false, 
      message: validationError.message 
    });
  }
  return res.status(500).json({ 
    success: false, 
    message: err.message || 'An unexpected error occurred' 
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // API routes
  app.get('/api/reports', async (req: Request, res: Response) => {
    try {
      const reports = await storage.getAllCsrReports();
      res.json(reports);
    } catch (err) {
      errorHandler(err as Error, res);
    }
  });

  app.get('/api/reports/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid report ID' });
      }
      
      const report = await storage.getCsrReport(id);
      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }
      
      res.json(report);
    } catch (err) {
      errorHandler(err as Error, res);
    }
  });

  app.get('/api/reports/:id/details', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid report ID' });
      }
      
      const details = await storage.getCsrDetails(id);
      if (!details) {
        return res.status(404).json({ success: false, message: 'Report details not found' });
      }
      
      res.json(details);
    } catch (err) {
      errorHandler(err as Error, res);
    }
  });

  app.post('/api/reports', upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      
      // Validate the PDF file
      const isValidPdf = await validatePdfFile(req.file.buffer);
      if (!isValidPdf) {
        return res.status(400).json({ success: false, message: 'Invalid PDF file' });
      }
      
      // Get metadata
      const { fileSize } = await getPdfMetadata(req.file.buffer);
      
      // Parse form data
      const reportData = insertCsrReportSchema.parse({
        title: req.body.title,
        sponsor: req.body.sponsor,
        indication: req.body.indication,
        phase: req.body.phase,
        fileName: req.file.originalname,
        fileSize: fileSize
      });
      
      // Create report record
      const report = await storage.createCsrReport(reportData);
      
      // Save the file
      const filePath = await savePdfFile(req.file.buffer, `${report.id}_${req.file.originalname}`);
      
      // Start processing in the background
      // In a real production system, this would likely be handled by a queue
      setTimeout(async () => {
        try {
          // Process PDF to extract text (placeholder)
          const extractedText = "This is a placeholder for extracted text from the PDF file";
          
          // Generate summary
          const summary = await generateCsrSummary(extractedText);
          
          // Update report with summary and status
          await storage.updateCsrReport(report.id, { 
            summary, 
            status: "Processed" 
          });
          
          // Analyze content and create details
          const analysisResult = await analyzeCsrContent(extractedText);
          await storage.createCsrDetails({
            reportId: report.id,
            ...analysisResult,
          });
          
        } catch (error) {
          console.error(`Failed to process report ${report.id}:`, error);
          await storage.updateCsrReport(report.id, { 
            status: "Failed", 
            summary: "Failed to process this CSR report." 
          });
        }
      }, 5000); // Simulate processing delay of 5 seconds
      
      res.status(201).json({ 
        success: true, 
        message: 'Report uploaded and processing started', 
        report 
      });
      
    } catch (err) {
      errorHandler(err as Error, res);
    }
  });

  app.get('/api/stats', async (req: Request, res: Response) => {
    try {
      const reports = await storage.getAllCsrReports();
      
      const totalReports = reports.length;
      const processedReports = reports.filter(r => r.status === 'Processed').length;
      
      // More complex stats could be calculated here in a real app
      
      res.json({
        totalReports,
        processedReports,
        dataPointsExtracted: processedReports * 150, // Just a placeholder calculation
        processingTimeSaved: processedReports * 10 // Assuming 10 hours saved per report
      });
    } catch (err) {
      errorHandler(err as Error, res);
    }
  });
  
  // Advanced Analytics API Endpoints
  
  // Get comprehensive analytics summary
  app.get('/api/analytics/summary', async (req: Request, res: Response) => {
    try {
      const summary = await generateAnalyticsSummary();
      res.json(summary);
    } catch (err) {
      errorHandler(err as Error, res);
    }
  });
  
  // Get predictive analysis
  app.get('/api/analytics/predictive', async (req: Request, res: Response) => {
    try {
      const indication = req.query.indication as string;
      const analysis = await generatePredictiveAnalysis(indication);
      res.json(analysis);
    } catch (err) {
      errorHandler(err as Error, res);
    }
  });
  
  // Compare two trials
  app.get('/api/analytics/compare', async (req: Request, res: Response) => {
    try {
      const trial1Id = parseInt(req.query.trial1 as string);
      const trial2Id = parseInt(req.query.trial2 as string);
      
      if (isNaN(trial1Id) || isNaN(trial2Id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid trial IDs provided'
        });
      }
      
      const comparison = await compareTrialsAnalysis(trial1Id, trial2Id);
      
      if (!comparison) {
        return res.status(404).json({
          success: false,
          message: 'Unable to compare the specified trials'
        });
      }
      
      res.json(comparison);
    } catch (err) {
      errorHandler(err as Error, res);
    }
  });
  
  // Analyze competitors for a specific sponsor
  app.get('/api/analytics/competitors/:sponsor', async (req: Request, res: Response) => {
    try {
      const sponsor = req.params.sponsor;
      if (!sponsor) {
        return res.status(400).json({
          success: false,
          message: 'Sponsor name is required'
        });
      }
      
      const competitors = await analyzeCompetitorsForSponsor(sponsor);
      res.json(competitors);
    } catch (err) {
      errorHandler(err as Error, res);
    }
  });
  
  // Study Design Agent API endpoint
  app.post('/api/study-design-agent/chat', async (req: Request, res: Response) => {
    try {
      const { query, indication, phase } = req.body;
      
      if (!query) {
        return res.status(400).json({ success: false, message: 'Query is required' });
      }
      
      // In a real implementation, this would use the OpenAI service to generate a response
      // based on the query, indication, and phase
      // For now, we'll just return a mock response
      
      const response = {
        content: `Based on my analysis of similar trials in ${indication || "this therapeutic area"} for Phase ${phase || "studies"}, here are my recommendations regarding "${query}"...`,
        sources: [
          { id: 1, title: "Example CSR 1", relevance: 0.92 },
          { id: 2, title: "Example CSR 2", relevance: 0.85 },
        ],
        confidence: 0.89
      };
      
      res.json({ 
        success: true,
        response
      });
    } catch (err) {
      errorHandler(err as Error, res);
    }
  });
  
  // Export functionality
  app.get('/api/reports/:id/export', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid report ID' });
      }
      
      const report = await storage.getCsrReport(id);
      const details = await storage.getCsrDetails(id);
      
      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }
      
      const format = req.query.format as string || 'json';
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="report_${id}.csv"`);
        
        // Simple CSV export - in a real app, this would be more comprehensive
        let csv = 'Category,Value\n';
        csv += `Title,${report.title}\n`;
        csv += `Sponsor,${report.sponsor}\n`;
        csv += `Indication,${report.indication}\n`;
        csv += `Phase,${report.phase}\n`;
        csv += `Status,${report.status}\n`;
        csv += `Date,${report.date}\n`;
        
        if (details) {
          csv += `Study Design,${details.studyDesign}\n`;
          csv += `Primary Objective,${details.primaryObjective}\n`;
          // Add more fields as needed
        }
        
        res.send(csv);
      } else {
        // Default to JSON
        res.json({ report, details });
      }
    } catch (err) {
      errorHandler(err as Error, res);
    }
  });

  // Translation API Endpoints
  
  // Get supported languages
  app.get('/api/translation/languages', (req: Request, res: Response) => {
    try {
      res.json({ 
        success: true, 
        languages: supportedLanguages 
      });
    } catch (err) {
      errorHandler(err as Error, res);
    }
  });

  // Translate text
  app.post('/api/translation/text', async (req: Request, res: Response) => {
    try {
      const textTranslationSchema = z.object({
        text: z.string().min(1, "Text is required"),
        sourceLanguage: z.string().min(2, "Source language code is required"),
        targetLanguage: z.string().min(2, "Target language code is required")
      });
      
      const { text, sourceLanguage, targetLanguage } = textTranslationSchema.parse(req.body);
      
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({
          success: false,
          message: 'Translation service is not available (API key not configured)'
        });
      }
      
      const translatedText = await translationService.translateText(
        text, 
        sourceLanguage, 
        targetLanguage
      );
      
      res.json({
        success: true,
        originalText: text,
        translatedText,
        sourceLanguage,
        targetLanguage
      });
    } catch (err) {
      errorHandler(err as Error, res);
    }
  });

  // Translate CSR report details
  app.get('/api/reports/:id/translate', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid report ID' 
        });
      }
      
      const targetLanguage = req.query.targetLanguage as string;
      if (!targetLanguage) {
        return res.status(400).json({ 
          success: false, 
          message: 'Target language is required' 
        });
      }
      
      // Check if language is supported
      const isSupported = supportedLanguages.some(lang => lang.code === targetLanguage);
      if (!isSupported) {
        return res.status(400).json({ 
          success: false, 
          message: 'Unsupported target language' 
        });
      }
      
      // Get report and details
      const report = await storage.getCsrReport(id);
      const details = await storage.getCsrDetails(id);
      
      if (!report) {
        return res.status(404).json({ 
          success: false, 
          message: 'Report not found' 
        });
      }
      
      if (!details) {
        return res.status(404).json({ 
          success: false, 
          message: 'Report details not found' 
        });
      }
      
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({
          success: false,
          message: 'Translation service is not available (API key not configured)'
        });
      }
      
      // Default source language is English
      const sourceLanguage = "en";
      
      // Translate report details
      const translatedDetails = await translationService.translateCsrDetails(
        details, 
        sourceLanguage, 
        targetLanguage
      );
      
      res.json({
        success: true,
        report,
        details: translatedDetails,
        translationInfo: {
          sourceLanguage,
          targetLanguage,
          targetLanguageName: supportedLanguages.find(l => l.code === targetLanguage)?.name
        }
      });
    } catch (err) {
      errorHandler(err as Error, res);
    }
  });

  // Translate regulatory guidance
  app.post('/api/translation/regulatory', async (req: Request, res: Response) => {
    try {
      const regulatoryTranslationSchema = z.object({
        guidance: z.string().min(1, "Regulatory guidance text is required"),
        targetLanguage: z.string().min(2, "Target language code is required")
      });
      
      const { guidance, targetLanguage } = regulatoryTranslationSchema.parse(req.body);
      
      // Check if language is supported
      const isSupported = supportedLanguages.some(lang => lang.code === targetLanguage);
      if (!isSupported) {
        return res.status(400).json({ 
          success: false, 
          message: 'Unsupported target language' 
        });
      }
      
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({
          success: false,
          message: 'Translation service is not available (API key not configured)'
        });
      }
      
      const translatedGuidance = await translationService.translateRegulatoryGuidance(
        guidance, 
        targetLanguage
      );
      
      res.json({
        success: true,
        originalGuidance: guidance,
        translatedGuidance,
        targetLanguage,
        targetLanguageName: supportedLanguages.find(l => l.code === targetLanguage)?.name
      });
    } catch (err) {
      errorHandler(err as Error, res);
    }
  });
  
  // Generate clinical trial protocol
  app.post('/api/protocol-generator', async (req: Request, res: Response) => {
    try {
      const protocolParamsSchema = z.object({
        indication: z.string().min(1, "Indication is required"),
        phase: z.string().min(1, "Study phase is required"),
        primaryEndpoint: z.string().optional(),
        populationSize: z.number().optional(),
        additionalContext: z.string().optional(),
      });
      
      const params = protocolParamsSchema.parse(req.body);
      
      // Generate protocol using our service
      const protocol = await generateProtocol(params);
      
      res.json({
        success: true,
        protocol
      });
    } catch (err) {
      errorHandler(err as Error, res);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
