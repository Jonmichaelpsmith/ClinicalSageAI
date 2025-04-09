import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { validatePdfFile, savePdfFile, getPdfMetadata, processPdfFile } from "./pdf-processor";
import { analyzeCsrContent, generateCsrSummary } from "./openai-service";
import path from "path";
import fs from "fs";
import { insertCsrReportSchema } from "@shared/schema";
import { ZodError } from "zod";
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

  const httpServer = createServer(app);
  return httpServer;
}
