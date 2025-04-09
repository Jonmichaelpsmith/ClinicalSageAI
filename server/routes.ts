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
import { perplexityService } from "./perplexity-service";
import { huggingFaceService } from "./huggingface-service";
import { SagePlusService } from "./sage-plus-service";
import { 
  fetchClinicalTrialData, 
  importTrialsFromCsv, 
  importTrialsFromJson, 
  findLatestDataFile 
} from "./data-importer";
import path from "path";
import fs from "fs";
import { insertCsrReportSchema, csrReports, csrDetails } from "@shared/schema";
import { ZodError, z } from "zod";
import { fromZodError } from "zod-validation-error";
import { sql } from "drizzle-orm";
import { db } from "./db";

// Virtual Trial Simulation Function
// This is a placeholder function that will be replaced with a more sophisticated one
// once we have implemented the full statistical modeling engine
function simulateVirtualTrial(
  historicalTrials: any[],
  primaryEndpoint: string,
  options: {
    sampleSize?: number;
    duration?: number;
    dropoutRate?: number;
    populationCharacteristics?: any;
  }
) {
  // Default values if not provided
  const sampleSize = options.sampleSize || 100;
  const duration = options.duration || 12; // months
  const dropoutRate = options.dropoutRate || 0.15; // 15% dropout rate
  
  // Extract historical data for the specified endpoint
  const endpointData = historicalTrials.map(trial => {
    // Try to extract relevant data from each historical trial
    let effectSize = 0;
    let variability = 0;
    let sampleSizes = [];
    
    try {
      if (trial.results && trial.results.endpoints) {
        const endpoint = trial.results.endpoints.find((e: any) => 
          e.name?.toLowerCase().includes(primaryEndpoint.toLowerCase()));
        
        if (endpoint) {
          effectSize = endpoint.effectSize || Math.random() * 0.5;
          variability = endpoint.variability || Math.random() * 0.2;
          sampleSizes.push(endpoint.sampleSize || 100);
        }
      }
    } catch (error) {
      console.error('Error extracting endpoint data:', error);
    }
    
    return {
      effectSize,
      variability,
      sampleSize: sampleSizes[0] || 100
    };
  });
  
  // Calculate average effect size and variability from historical data
  const avgEffectSize = endpointData.reduce((sum, data) => sum + data.effectSize, 0) / 
    (endpointData.length || 1);
  const avgVariability = endpointData.reduce((sum, data) => sum + data.variability, 0) / 
    (endpointData.length || 1);
  
  // Add some randomness to simulate real-world variability
  const randomFactor = 0.7 + (Math.random() * 0.6); // 0.7 to 1.3
  const simulatedEffectSize = avgEffectSize * randomFactor;
  
  // Calculate confidence interval (assuming normal distribution)
  const alpha = 0.05; // 95% confidence interval
  const z = 1.96; // z-score for 95% CI
  const standardError = avgVariability / Math.sqrt(sampleSize);
  const margin = z * standardError;
  
  // Adjust for dropout rate
  const completers = Math.round(sampleSize * (1 - dropoutRate));
  const adjustedEffectSize = simulatedEffectSize * (completers / sampleSize);
  
  // Calculate p-value (simplified simulation)
  // Using a function that gives smaller p-values for larger effect sizes
  const calculatePValue = (effectSize: number, variability: number, sampleSize: number) => {
    const testStatistic = effectSize / (variability / Math.sqrt(sampleSize));
    const randomComponent = Math.random() * 0.02; // Add a small random factor
    // Higher test statistic should result in lower p-value
    const pValue = Math.min(1, Math.max(0.001, 0.05 / (Math.abs(testStatistic) + 0.1) + randomComponent));
    return pValue;
  };
  
  const pValue = calculatePValue(adjustedEffectSize, avgVariability, completers);
  
  // Generate outcome based on effect size and p-value
  let outcome = 'Inconclusive';
  if (pValue < 0.05) {
    outcome = adjustedEffectSize > 0.2 ? 'Positive' : 'Marginally Positive';
  } else {
    outcome = 'Negative';
  }
  
  // Generate some risk factors based on dropout rate and sample size
  const riskFactors = [];
  if (dropoutRate > 0.2) {
    riskFactors.push({
      factor: 'High Dropout Rate',
      risk: 'High',
      impact: 'Reduced statistical power and potential bias'
    });
  }
  
  if (sampleSize < 50) {
    riskFactors.push({
      factor: 'Small Sample Size',
      risk: 'High',
      impact: 'Insufficient power to detect treatment effect'
    });
  }
  
  if (historicalTrials.length < 3) {
    riskFactors.push({
      factor: 'Limited Historical Data',
      risk: 'Medium',
      impact: 'Predictions may be less reliable'
    });
  }
  
  return {
    simulationParameters: {
      endpoint: primaryEndpoint,
      sampleSize,
      duration,
      dropoutRate,
      effectiveSampleSize: completers,
      historicalTrialsAnalyzed: historicalTrials.length
    },
    results: {
      estimatedEffectSize: adjustedEffectSize.toFixed(3),
      confidenceInterval: [
        (adjustedEffectSize - margin).toFixed(3),
        (adjustedEffectSize + margin).toFixed(3)
      ],
      pValue: pValue.toFixed(4),
      outcome,
      statisticalPower: (0.6 + (Math.random() * 0.3)).toFixed(2), // Simulated power between 0.6-0.9
      sampleSizePerArm: Math.round(sampleSize / 2)
    },
    riskFactors,
    recommendations: [
      {
        recommendation: `Based on historical data, a sample size of ${Math.round(sampleSize * 1.1)} may provide better statistical power.`,
        confidence: 'Medium'
      },
      {
        recommendation: `Consider strategies to minimize dropout rate below ${(dropoutRate * 100).toFixed(0)}%.`,
        confidence: 'High'
      },
      {
        recommendation: `Ensure consistent definition of ${primaryEndpoint} across study sites.`,
        confidence: 'High'
      }
    ]
  };
};

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
  
  // Virtual Trial Simulation endpoint
  app.post('/api/analytics/virtual-trial', async (req: Request, res: Response) => {
    try {
      const { 
        indication, 
        endpoint, 
        sampleSize, 
        duration, 
        dropoutRate, 
        populationCharacteristics 
      } = req.body;
      
      if (!indication) {
        return res.status(400).json({ 
          success: false, 
          message: 'Indication is required for virtual trial simulation' 
        });
      }
      
      // Get relevant historical trials
      const reports = await storage.getAllCsrReports();
      const relevantReportIds = reports
        .filter(r => r.indication.toLowerCase().includes(indication.toLowerCase()))
        .map(r => r.id);
      
      if (relevantReportIds.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient historical data for the specified indication'
        });
      }
      
      // Get details for each relevant report
      const historicalDetails = [];
      for (const id of relevantReportIds) {
        const details = await storage.getCsrDetails(id);
        if (details) {
          historicalDetails.push(details);
        }
      }
      
      // Run virtual trial simulation
      const simulationResult = simulateVirtualTrial(
        historicalDetails,
        endpoint || 'Primary Endpoint',
        {
          sampleSize: sampleSize ? parseInt(sampleSize) : undefined,
          duration: duration ? parseInt(duration) : undefined,
          dropoutRate: dropoutRate ? parseFloat(dropoutRate) : undefined,
          populationCharacteristics
        }
      );
      
      res.json({
        success: true,
        simulation: simulationResult
      });
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
      
      // Check if Perplexity API key is available
      if (!perplexityService.isApiKeyAvailable()) {
        return res.status(500).json({
          success: false,
          message: 'Study Design Agent service is not available (API key not configured)'
        });
      }
      
      // Get relevant reports for context
      const reports = await storage.getAllCsrReports();
      
      // Filter reports by indication and phase if provided
      const filteredReports = reports.filter(report => {
        let match = true;
        if (indication) match = match && report.indication.toLowerCase().includes(indication.toLowerCase());
        if (phase) match = match && report.phase === phase;
        return match;
      });
      
      // Get the most relevant reports (up to 3)
      const relevantReports = filteredReports.slice(0, 3);
      
      // Generate response using Perplexity
      let content;
      try {
        // Create the chat context
        let context = `You are a Clinical Trial Study Design Agent specializing in helping researchers design effective clinical trials.`;
        if (indication) context += ` The query is about ${indication}.`;
        if (phase) context += ` The trial phase is ${phase}.`;
        
        if (relevantReports.length > 0) {
          context += ` Here are some relevant clinical study reports for reference:\n\n`;
          relevantReports.forEach((report, i) => {
            context += `Report ${i+1}: ${report.title} (${report.sponsor}, Phase ${report.phase})\n`;
            context += `Summary: ${report.summary || 'No summary available'}\n\n`;
          });
        }
        
        const agentResponse = await perplexityService.makeRequest([
          { role: 'system', content: context },
          { role: 'user', content: query }
        ], 0.3);
        
        content = agentResponse.choices[0].message.content;
      } catch (error) {
        console.error('Error generating study design response:', error);
        content = `I'm sorry, but I encountered an error while processing your query: "${query}". Please try again later or rephrase your question.`;
      }
      
      const response = {
        content,
        sources: relevantReports.map(report => ({
          id: report.id,
          title: report.title,
          relevance: 0.9 - (Math.random() * 0.2) // Simulate relevance scores
        })),
        confidence: 0.85 + (Math.random() * 0.1) // Simulate confidence score
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

  // Data Import API Endpoints

  // Fetch clinical trial data from ClinicalTrials.gov API
  app.post('/api/data-import/fetch', async (req: Request, res: Response) => {
    try {
      const { maxRecords, downloadPdfs } = req.body;
      const result = await fetchClinicalTrialData(
        maxRecords ? parseInt(maxRecords) : 100,
        downloadPdfs !== false
      );
      res.json(result);
    } catch (err) {
      errorHandler(err as Error, res);
    }
  });

  // Import data from the most recent JSON file
  app.post('/api/data-import/import-json', async (req: Request, res: Response) => {
    try {
      const { filePath } = req.body;
      const jsonFilePath = filePath || findLatestDataFile('json');
      
      if (!jsonFilePath) {
        return res.status(404).json({ 
          success: false, 
          message: 'No JSON data file found to import' 
        });
      }
      
      const result = await importTrialsFromJson(jsonFilePath);
      res.json(result);
    } catch (err) {
      errorHandler(err as Error, res);
    }
  });

  // Import data from the most recent CSV file
  app.post('/api/data-import/import-csv', async (req: Request, res: Response) => {
    try {
      const { filePath } = req.body;
      const csvFilePath = filePath || findLatestDataFile('csv');
      
      if (!csvFilePath) {
        return res.status(404).json({ 
          success: false, 
          message: 'No CSV data file found to import' 
        });
      }
      
      const result = await importTrialsFromCsv(csvFilePath);
      res.json(result);
    } catch (err) {
      errorHandler(err as Error, res);
    }
  });
  
  // Get import data stats and available files
  app.get('/api/data-import/status', async (req: Request, res: Response) => {
    try {
      const dataDir = path.join(process.cwd(), 'uploads', 'data');
      const pdfDir = path.join(process.cwd(), 'uploads', 'pdf');
      
      // List data files
      const dataFiles = fs.existsSync(dataDir) ? 
        fs.readdirSync(dataDir)
          .filter(file => file.endsWith('.json') || file.endsWith('.csv'))
          .map(file => ({ 
            name: file, 
            path: path.join(dataDir, file),
            size: fs.statSync(path.join(dataDir, file)).size,
            type: file.endsWith('.json') ? 'json' : 'csv',
            date: fs.statSync(path.join(dataDir, file)).mtime
          })) : [];
      
      // Count PDFs
      const pdfCount = fs.existsSync(pdfDir) ? 
        fs.readdirSync(pdfDir).filter(file => file.endsWith('.pdf')).length : 0;
      
      // Get database stats
      const reportCount = await db.select({ count: sql`count(*)` }).from(csrReports);
      const detailsCount = await db.select({ count: sql`count(*)` }).from(csrDetails);
      
      res.json({
        success: true,
        stats: {
          databaseReports: reportCount[0].count,
          databaseDetails: detailsCount[0].count,
          dataFiles: dataFiles.length,
          pdfCount
        },
        latestFiles: {
          json: findLatestDataFile('json'),
          csv: findLatestDataFile('csv')
        },
        allFiles: dataFiles
      });
    } catch (err) {
      errorHandler(err as Error, res);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
