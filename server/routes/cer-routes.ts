import { Router } from 'express';
import { db } from '../db';
import { desc, eq, like, and, isNull, sql } from 'drizzle-orm';
import { pgTable, serial, text, date, jsonb, timestamp } from "drizzle-orm/pg-core";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { extractTextFromPdf, generateEmbeddings, analyzeCerContent } from '../openai-service';
import { z } from 'zod';

// Define the CER table directly to match our database schema
export const clinicalEvaluationReports = pgTable('clinical_evaluation_reports', {
  id: serial('id').primaryKey(),
  cer_id: text('cer_id'), // Add cer_id field
  title: text('title').notNull(),
  device_name: text('device_name').notNull(),
  manufacturer: text('manufacturer').notNull(),
  report_date: date('report_date'),
  report_version: text('report_version'),
  device_classification: text('device_classification'),
  intended_use: text('intended_use'),
  indication: text('indication'), // Add indication field
  clinical_data: jsonb('clinical_data').$default(() => ({})),
  safety_issues: text('safety_issues').array(),
  complaint_rates: jsonb('complaint_rates').$default(() => ({})),
  risk_assessment: jsonb('risk_assessment').$default(() => ({})),
  post_market_data: jsonb('post_market_data').$default(() => ({})),
  literature_references: jsonb('literature_references').$default(() => []),
  content_text: text('content_text'), // Add content_text field for stored document text
  content_vector: text('content_vector'), // Add content_vector field for embeddings
  conclusion: text('conclusion'),
  associated_protocol_id: serial('associated_protocol_id'),
  status: text('status').default('Draft'),
  uploaded_at: timestamp('uploaded_at').defaultNow(),
  pdf_path: text('pdf_path'), // Add pdf_path field
  metadata: jsonb('metadata').$default(() => ({})), // Add metadata field
  project_id: text('project_id'), // Add project_id field
  session_id: text('session_id'), // Add session_id field
  user_id: text('user_id'),
  deleted_at: timestamp('deleted_at')
});

// Create a Zod validation schema for CER data
export const insertClinicalEvaluationReportSchema = z.object({
  cer_id: z.string().optional(),
  title: z.string(),
  device_name: z.string(),
  manufacturer: z.string(),
  report_date: z.date().optional(),
  report_version: z.string().optional(),
  device_classification: z.string().optional(),
  intended_use: z.string().optional(),
  indication: z.string().optional(),
  clinical_data: z.record(z.any()).optional(),
  safety_issues: z.array(z.string()).optional(),
  complaint_rates: z.record(z.any()).optional(),
  risk_assessment: z.record(z.any()).optional(),
  post_market_data: z.record(z.any()).optional(),
  literature_references: z.array(z.any()).optional(),
  content_text: z.string().optional(),
  content_vector: z.string().optional(),
  conclusion: z.string().optional(),
  status: z.string().optional(),
  pdf_path: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  project_id: z.string().nullable().optional(),
  session_id: z.string().nullable().optional(),
  user_id: z.string().optional(),
});

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'cers');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const fileExt = path.extname(file.originalname);
    cb(null, `${uniqueId}${fileExt}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Upload and process a CER
router.post('/upload', upload.single('cerFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const { projectId, sessionId } = req.body;
    
    // Extract text from PDF
    const extractedText = await extractTextFromPdf(filePath);
    if (!extractedText) {
      return res.status(400).json({ error: 'Failed to extract text from the PDF' });
    }

    // Generate text embeddings for semantic search
    const embeddings = await generateEmbeddings(extractedText);
    
    // Analyze CER content with OpenAI to extract structured data
    const analysisResult = await analyzeCerContent(extractedText);
    
    if (!analysisResult) {
      return res.status(500).json({ error: 'Failed to analyze CER content' });
    }

    // Generate a unique CER ID
    const cerId = `CER-${uuidv4().substring(0, 8)}`;
    
    // Prepare data for insertion
    const cerData = {
      cer_id: cerId,
      title: analysisResult.title || req.body.title || 'Untitled CER',
      device_name: analysisResult.device_name || req.body.deviceName || 'Unknown Device',
      manufacturer: analysisResult.manufacturer || req.body.manufacturer || 'Unknown Manufacturer',
      indication: analysisResult.indication || req.body.indication || 'Unknown Indication',
      report_date: analysisResult.report_date ? new Date(analysisResult.report_date) : new Date(),
      report_period_start: analysisResult.report_period_start ? new Date(analysisResult.report_period_start) : null,
      report_period_end: analysisResult.report_period_end ? new Date(analysisResult.report_period_end) : null,
      version: analysisResult.version || req.body.version || '1.0',
      status: 'Active',
      complaint_summary: analysisResult.complaint_summary || '',
      safety_issues: analysisResult.safety_issues || [],
      complaint_rates: analysisResult.complaint_rates || {},
      adverse_events: analysisResult.adverse_events || {},
      performance_evaluation: analysisResult.performance_evaluation || '',
      clinical_data: analysisResult.clinical_data || {},
      risk_analysis: analysisResult.risk_analysis || '',
      content_text: extractedText,
      content_vector: JSON.stringify(embeddings),
      pdf_path: filePath,
      project_id: projectId || null,
      session_id: sessionId || null,
      metadata: {
        file_name: req.file.originalname,
        file_size: req.file.size,
        upload_date: new Date().toISOString(),
      }
    };

    // Insert data into the database
    const validatedData = insertClinicalEvaluationReportSchema.parse(cerData);
    const [result] = await db.insert(clinicalEvaluationReports).values(validatedData).returning();

    res.status(201).json({
      message: 'CER successfully uploaded and processed',
      cer_id: result.cer_id,
      id: result.id
    });
  } catch (error) {
    console.error('Error uploading CER:', error);
    res.status(500).json({ error: error.message || 'Failed to process CER' });
  }
});

// Get all CERs with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    const { manufacturer, device, indication, status } = req.query;
    
    // Build query conditions
    let conditions = [];
    
    if (manufacturer) {
      conditions.push(like(clinicalEvaluationReports.manufacturer, `%${manufacturer}%`));
    }
    
    if (device) {
      conditions.push(like(clinicalEvaluationReports.device_name, `%${device}%`));
    }
    
    if (indication) {
      conditions.push(like(clinicalEvaluationReports.indication, `%${indication}%`));
    }
    
    if (status) {
      conditions.push(eq(clinicalEvaluationReports.status, status as string));
    }
    
    // Default condition to exclude deleted records
    conditions.push(isNull(clinicalEvaluationReports.deleted_at));
    
    // Execute query with conditions
    const query = conditions.length > 0 
      ? and(...conditions) 
      : undefined;
    
    const cers = await db
      .select()
      .from(clinicalEvaluationReports)
      .where(query)
      .orderBy(desc(clinicalEvaluationReports.report_date))
      .limit(limit)
      .offset(offset);
    
    // Get total count for pagination using raw SQL count
    const countResult = await db.execute(
      `SELECT COUNT(*) FROM clinical_evaluation_reports WHERE deleted_at IS NULL`
    );
    const count = parseInt(countResult.rows[0].count) || 0;
    
    res.json({
      data: cers,
      pagination: {
        total: Number(count),
        page,
        limit,
        totalPages: Math.ceil(Number(count) / limit)
      }
    });
  } catch (error) {
    console.error('Error retrieving CERs:', error);
    res.status(500).json({ error: 'Failed to retrieve CERs' });
  }
});

// Get a specific CER by ID
router.get('/:cerId', async (req, res) => {
  try {
    const { cerId } = req.params;
    
    const [cer] = await db
      .select()
      .from(clinicalEvaluationReports)
      .where(eq(clinicalEvaluationReports.cer_id, cerId));
    
    if (!cer) {
      return res.status(404).json({ error: 'Clinical Evaluation Report not found' });
    }
    
    res.json(cer);
  } catch (error) {
    console.error('Error retrieving CER:', error);
    res.status(500).json({ error: 'Failed to retrieve CER' });
  }
});

// Search CERs (text search)
router.get('/search/text', async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const searchResults = await db
      .select()
      .from(clinicalEvaluationReports)
      .where(
        and(
          isNull(clinicalEvaluationReports.deletedAt),
          like(clinicalEvaluationReports.content_text, `%${query}%`)
        )
      )
      .limit(Number(limit));
    
    res.json(searchResults);
  } catch (error) {
    console.error('Error searching CERs:', error);
    res.status(500).json({ error: 'Failed to search CERs' });
  }
});

// Semantic search endpoint
router.post('/search/semantic', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Generate embeddings for the search query
    const queryEmbeddings = await generateEmbeddings(query);
    
    if (!queryEmbeddings) {
      return res.status(500).json({ error: 'Failed to generate query embeddings' });
    }
    
    // Perform vector similarity search using PostgreSQL
    const searchResults = await db.execute(`
      SELECT *, 
        content_vector <=> '${JSON.stringify(queryEmbeddings)}' as similarity
      FROM clinical_evaluation_reports
      WHERE "deletedAt" IS NULL
      ORDER BY similarity
      LIMIT ${limit}
    `);
    
    res.json(searchResults);
  } catch (error) {
    console.error('Error performing semantic search:', error);
    res.status(500).json({ error: 'Failed to perform semantic search' });
  }
});

// Update a CER
router.put('/:cerId', async (req, res) => {
  try {
    const { cerId } = req.params;
    const updateData = req.body;
    
    // Validate update data
    const validatedData = insertClinicalEvaluationReportSchema.partial().parse(updateData);
    
    // Update the CER
    const [updated] = await db
      .update(clinicalEvaluationReports)
      .set({
        ...validatedData,
        updated_at: new Date()
      })
      .where(eq(clinicalEvaluationReports.cer_id, cerId))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: 'Clinical Evaluation Report not found' });
    }
    
    res.json({
      message: 'CER successfully updated',
      cer: updated
    });
  } catch (error) {
    console.error('Error updating CER:', error);
    res.status(500).json({ error: error.message || 'Failed to update CER' });
  }
});

// Delete a CER (soft delete)
router.delete('/:cerId', async (req, res) => {
  try {
    const { cerId } = req.params;
    
    // Soft delete by setting deletedAt
    const [deleted] = await db
      .update(clinicalEvaluationReports)
      .set({
        deletedAt: new Date(),
        status: 'Deleted'
      })
      .where(eq(clinicalEvaluationReports.cer_id, cerId))
      .returning();
    
    if (!deleted) {
      return res.status(404).json({ error: 'Clinical Evaluation Report not found' });
    }
    
    res.json({
      message: 'CER successfully deleted',
      cer_id: deleted.cer_id
    });
  } catch (error) {
    console.error('Error deleting CER:', error);
    res.status(500).json({ error: 'Failed to delete CER' });
  }
});

// Complaint statistics interfaces
interface ComplaintCategoryStats {
  [category: string]: number;
}

interface ManufacturerComplaintStats {
  [manufacturer: string]: number;
}

interface DeviceComplaintRate {
  device_name: string;
  manufacturer: string;
  complaint_count: number;
  report_date: Date;
}

interface YearlyComplaintTrend {
  year: number;
  complaint_count: number;
}

interface ComplaintStatistics {
  total_cers: number;
  total_complaints: number;
  complaint_categories: ComplaintCategoryStats;
  devices_by_complaint_rate: DeviceComplaintRate[];
  manufacturers_by_complaint_count: ManufacturerComplaintStats;
  trend_over_time: YearlyComplaintTrend[];
}

// Get complaint statistics across all CERs
router.get('/statistics/complaints', async (req, res) => {
  try {
    // Get all active CERs
    const cers = await db
      .select()
      .from(clinicalEvaluationReports)
      .where(
        and(
          isNull(clinicalEvaluationReports.deletedAt),
          eq(clinicalEvaluationReports.status, 'Active')
        )
      );
    
    // Analyze complaint data
    const complaintStats: ComplaintStatistics = {
      total_cers: cers.length,
      total_complaints: 0,
      complaint_categories: {},
      devices_by_complaint_rate: [],
      manufacturers_by_complaint_count: {},
      trend_over_time: []
    };
    
    // Process each CER to extract complaint statistics
    cers.forEach(cer => {
      // Extract complaint rates
      const complaintRates = (cer.complaint_rates as Record<string, any>) || {};
      const totalComplaints = Object.values(complaintRates).reduce((sum: number, rate: any) => sum + (rate.count || 0), 0);
      
      complaintStats.total_complaints += totalComplaints;
      
      // Process complaint categories
      Object.entries(complaintRates).forEach(([category, data]: [string, any]) => {
        if (!complaintStats.complaint_categories[category]) {
          complaintStats.complaint_categories[category] = 0;
        }
        complaintStats.complaint_categories[category] += data.count || 0;
      });
      
      // Track manufacturer data
      if (!complaintStats.manufacturers_by_complaint_count[cer.manufacturer]) {
        complaintStats.manufacturers_by_complaint_count[cer.manufacturer] = 0;
      }
      complaintStats.manufacturers_by_complaint_count[cer.manufacturer] += totalComplaints;
      
      // Device complaint rate data
      complaintStats.devices_by_complaint_rate.push({
        device_name: cer.device_name,
        manufacturer: cer.manufacturer,
        complaint_count: totalComplaints,
        report_date: cer.report_date
      });
      
      // Add to time trend data
      if (cer.report_date) {
        const reportYear = new Date(cer.report_date).getFullYear();
        const existingYearIndex = complaintStats.trend_over_time.findIndex(item => item.year === reportYear);
        
        if (existingYearIndex === -1) {
          complaintStats.trend_over_time.push({
            year: reportYear,
            complaint_count: totalComplaints
          });
        } else {
          complaintStats.trend_over_time[existingYearIndex].complaint_count += totalComplaints;
        }
      }
    });
    
    // Sort trend data by year
    complaintStats.trend_over_time.sort((a, b) => a.year - b.year);
    
    // Sort devices by complaint rate
    complaintStats.devices_by_complaint_rate.sort((a, b) => b.complaint_count - a.complaint_count);
    
    res.json(complaintStats);
  } catch (error) {
    console.error('Error generating complaint statistics:', error);
    res.status(500).json({ error: 'Failed to generate complaint statistics' });
  }
});

// Safety statistics interfaces
interface SafetyIssueFrequency {
  issue: string;
  count: number;
}

interface ManufacturerIssueStats {
  manufacturer: string;
  count: number;
}

interface DeviceSafetyIssues {
  device_name: string;
  manufacturer: string;
  issue_count: number;
  issues: string[];
}

interface SafetyStatistics {
  total_safety_issues: number;
  safety_issues_by_frequency: SafetyIssueFrequency[];
  devices_with_most_issues: DeviceSafetyIssues[];
  manufacturers_with_most_issues: ManufacturerIssueStats[];
}

// Get safety issues across all CERs
router.get('/statistics/safety-issues', async (req, res) => {
  try {
    // Get all active CERs
    const cers = await db
      .select()
      .from(clinicalEvaluationReports)
      .where(
        and(
          isNull(clinicalEvaluationReports.deletedAt),
          eq(clinicalEvaluationReports.status, 'Active')
        )
      );
    
    // Analyze safety issue data
    const issueFrequency: Record<string, number> = {};
    const manufacturerIssues: Record<string, number> = {};
    const deviceIssues: DeviceSafetyIssues[] = [];
    let totalIssueCount = 0;
    
    // Process each CER
    cers.forEach(cer => {
      const safetyIssues = (cer.safety_issues as string[]) || [];
      totalIssueCount += safetyIssues.length;
      
      // Count safety issues by type
      safetyIssues.forEach(issue => {
        if (!issueFrequency[issue]) {
          issueFrequency[issue] = 0;
        }
        issueFrequency[issue]++;
      });
      
      // Track manufacturer data
      if (!manufacturerIssues[cer.manufacturer]) {
        manufacturerIssues[cer.manufacturer] = 0;
      }
      manufacturerIssues[cer.manufacturer] += safetyIssues.length;
      
      // Device safety issues
      deviceIssues.push({
        device_name: cer.device_name,
        manufacturer: cer.manufacturer,
        issue_count: safetyIssues.length,
        issues: safetyIssues
      });
    });
    
    // Convert to sorted arrays
    const safetyIssuesByFrequency = Object.entries(issueFrequency)
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count);
    
    const manufacturersWithMostIssues = Object.entries(manufacturerIssues)
      .map(([manufacturer, count]) => ({ manufacturer, count }))
      .sort((a, b) => b.count - a.count);
    
    // Sort devices by issue count
    deviceIssues.sort((a, b) => b.issue_count - a.issue_count);
    
    const safetyStats: SafetyStatistics = {
      total_safety_issues: totalIssueCount,
      safety_issues_by_frequency: safetyIssuesByFrequency,
      devices_with_most_issues: deviceIssues,
      manufacturers_with_most_issues: manufacturersWithMostIssues
    };
    
    res.json(safetyStats);
  } catch (error) {
    console.error('Error generating safety statistics:', error);
    res.status(500).json({ error: 'Failed to generate safety statistics' });
  }
});

export default router;