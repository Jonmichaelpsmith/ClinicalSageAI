import { db } from './db';
import fs from 'fs';
import path from 'path';
import { protocols } from '@shared/schema';
import { sql, eq } from 'drizzle-orm';

// Temporary interface definition for protocol analyses
interface ProtocolAnalysis {
  id: number;
  protocolId: number;
  analysisDate: Date;
  riskFlags: string;
  riskScores: string;
  csrMatches: string;
  strategicInsights: string;
  recommendationSummary: string;
}

// Define the protocolAnalyses table reference until it's added to the schema
const protocolAnalyses = {
  id: { name: 'id' },
  protocolId: { name: 'protocol_id' },
  analysisDate: { name: 'analysis_date' }
};
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

// Interface for extracted protocol data
export interface ExtractedProtocolData {
  title: string;
  phase: string;
  indication: string;
  sample_size: number;
  duration_weeks: number;
  dropout_rate: number;
  primary_endpoints: string[];
  secondary_endpoints: string[];
  study_design: string;
  arms: string[];
  blinding: string;
  inclusion_criteria: string[];
  exclusion_criteria: string[];
  statistical_plan: string;
  comparator: string | null;
  control_type: string | null;
}

// Interface for protocol analysis results
export interface ProtocolAnalysisResult {
  protocol_id: number;
  extracted_data: ExtractedProtocolData;
  risk_flags: {
    underpowered: boolean;
    endpoint_risk: boolean;
    duration_mismatch: boolean;
    high_dropout: boolean;
    design_issues: boolean;
    innovative_approach: boolean;
  };
  csr_matches: {
    match_id: string;
    title: string;
    sponsor: string;
    indication: string;
    phase: string;
    outcome: string;
    similarity_score: number;
  }[];
  risk_scores: {
    success_probability: number;
    dropout_risk: number;
    regulatory_alignment: number;
    innovation_index: number;
    competitive_edge: number;
  };
  strategic_insights: string[];
  recommendation_summary: string;
}

export class ProtocolAnalyzerService {
  private uploadsDir: string;
  private tempDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads', 'protocols');
    this.tempDir = path.join(process.cwd(), 'temp');
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  private ensureDirectories() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Save the uploaded protocol file
   */
  async saveProtocolFile(file: Express.Multer.File): Promise<string> {
    const uniqueId = uuidv4();
    const fileExt = path.extname(file.originalname);
    const fileName = `protocol_${uniqueId}${fileExt}`;
    const filePath = path.join(this.uploadsDir, fileName);
    
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, file.buffer, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(filePath);
        }
      });
    });
  }

  /**
   * Extract text from PDF files
   */
  async extractTextFromPdf(filePath: string): Promise<string> {
    try {
      return new Promise((resolve, reject) => {
        // Run Python script to extract text from PDF
        const extractorProcess = spawn('python', [
          'scripts/extract_pdf_text.py',
          filePath
        ]);
        
        let resultData = '';
        let errorOutput = '';
        
        extractorProcess.stdout.on('data', (data) => {
          resultData += data.toString();
        });
        
        extractorProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
          console.error(`PDF extraction error: ${data}`);
        });
        
        extractorProcess.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(`PDF extraction failed: ${errorOutput}`));
          } else {
            resolve(resultData.trim());
          }
        });
      });
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Extract data from protocol document using HuggingFace models
   */
  async extractProtocolData(textContent: string): Promise<ExtractedProtocolData> {
    // Create a temporary output file for the extraction results
    const outputPath = path.join(this.tempDir, `extraction_${Date.now()}.json`);
    const inputPath = path.join(this.tempDir, `input_${Date.now()}.txt`);
    
    // Write the text content to a temporary file
    fs.writeFileSync(inputPath, textContent);
    
    return new Promise((resolve, reject) => {
      // Run the Python script to extract protocol data
      const extractorProcess = spawn('python', [
        'scripts/extract_protocol_data.py',
        inputPath,
        outputPath
      ]);
      
      let errorOutput = '';
      
      extractorProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      extractorProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Protocol extraction failed: ${errorOutput}`));
          return;
        }
        
        try {
          const extractionResult = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
          fs.unlinkSync(outputPath); // Clean up temp file
          resolve(extractionResult);
        } catch (err) {
          reject(new Error(`Failed to parse extraction results: ${err.message}`));
        }
      });
    });
  }

  /**
   * Store protocol information in database
   */
  async storeProtocol(
    fileName: string,
    filePath: string,
    fileSize: number,
    extractedData: ExtractedProtocolData
  ): Promise<number> {
    // Use direct SQL to insert protocol into database
    const insertQuery = `
      INSERT INTO protocols (
        title, file_name, file_path, file_size, upload_date, phase, 
        indication, status, sponsor, summary
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
      RETURNING id
    `;
    
    const result = await db.execute(insertQuery, [
      extractedData.title || 'Untitled Protocol',
      fileName,
      filePath,
      fileSize,
      new Date(),
      extractedData.phase,
      extractedData.indication,
      'Uploaded',
      'Unknown', // This could be extracted or provided by user
      JSON.stringify(extractedData)
    ]);
    
    if (result.length === 0) {
      throw new Error('Failed to insert protocol into database');
    }
    
    return result[0].id;
  }

  /**
   * Analyze protocol against CSR database
   */
  async analyzeProtocol(protocolId: number, extractedData: ExtractedProtocolData): Promise<ProtocolAnalysisResult> {
    // Run analysis against CSR database using ML model
    const analysisOutputPath = path.join(this.tempDir, `analysis_${protocolId}_${Date.now()}.json`);
    
    return new Promise((resolve, reject) => {
      // Write extracted data to temp file for analysis script
      const extractedDataPath = path.join(this.tempDir, `protocol_data_${protocolId}.json`);
      fs.writeFileSync(extractedDataPath, JSON.stringify(extractedData));
      
      // Run Python script for CSR matching and risk analysis
      const analysisProcess = spawn('python', [
        'scripts/analyze_protocol.py',
        extractedDataPath,
        analysisOutputPath,
        protocolId.toString()
      ]);
      
      let errorOutput = '';
      
      analysisProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      analysisProcess.on('close', async (code) => {
        // Clean up temp file
        try {
          fs.unlinkSync(extractedDataPath);
        } catch (err) {
          console.error('Failed to clean up temp file:', err);
        }
        
        if (code !== 0) {
          reject(new Error(`Protocol analysis failed: ${errorOutput}`));
          return;
        }
        
        try {
          const analysisResult = JSON.parse(fs.readFileSync(analysisOutputPath, 'utf8'));
          fs.unlinkSync(analysisOutputPath); // Clean up temp file
          
          // Store analysis results in database
          await this.storeAnalysisResults(protocolId, analysisResult);
          
          resolve(analysisResult);
        } catch (err) {
          reject(new Error(`Failed to parse analysis results: ${err.message}`));
        }
      });
    });
  }

  /**
   * Store analysis results in database
   */
  private async storeAnalysisResults(protocolId: number, analysisResult: ProtocolAnalysisResult): Promise<void> {
    // Create SQL query to insert analysis results directly
    const insertQuery = `
      INSERT INTO protocol_analyses (
        protocol_id, analysis_date, risk_flags, risk_scores, 
        csr_matches, strategic_insights, recommendation_summary
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )
    `;
    
    // Execute the SQL query with parameter values
    await db.execute(insertQuery, [
      protocolId,
      new Date(),
      JSON.stringify(analysisResult.risk_flags),
      JSON.stringify(analysisResult.risk_scores),
      JSON.stringify(analysisResult.csr_matches),
      JSON.stringify(analysisResult.strategic_insights),
      analysisResult.recommendation_summary
    ]);
    
    // Update protocol status
    await db
      .update(protocols)
      .set({ status: 'Analyzed', updatedAt: new Date() })
      .where(eq(protocols.id, protocolId));
  }

  /**
   * Get protocol analysis by ID
   */
  async getProtocolAnalysis(protocolId: number): Promise<ProtocolAnalysisResult | null> {
    // Use direct SQL query to get analysis data
    const analysisQuery = `
      SELECT * FROM protocol_analyses
      WHERE protocol_id = $1
      ORDER BY analysis_date DESC
      LIMIT 1
    `;
    
    const analysisResult = await db.execute(analysisQuery, [protocolId]);
    const analysis = analysisResult.length > 0 ? analysisResult[0] : null;
    
    if (!analysis) {
      return null;
    }
    
    // Get protocol details
    const [protocol] = await db
      .select()
      .from(protocols)
      .where(eq(protocols.id, protocolId));
    
    if (!protocol) {
      return null;
    }
    
    let extractedData: ExtractedProtocolData;
    try {
      extractedData = JSON.parse(protocol.summary as string);
    } catch (error) {
      // Fallback data in case parsing fails
      extractedData = {
        title: protocol.title,
        phase: protocol.phase,
        indication: protocol.indication,
        sample_size: 0,
        duration_weeks: 0,
        dropout_rate: 0,
        primary_endpoints: [],
        secondary_endpoints: [],
        study_design: '',
        arms: [],
        blinding: '',
        inclusion_criteria: [],
        exclusion_criteria: [],
        statistical_plan: '',
        comparator: null,
        control_type: null
      };
    }
    
    return {
      protocol_id: protocolId,
      extracted_data: extractedData,
      risk_flags: JSON.parse(analysis.risk_flags),
      csr_matches: JSON.parse(analysis.csr_matches),
      risk_scores: JSON.parse(analysis.risk_scores),
      strategic_insights: JSON.parse(analysis.strategic_insights),
      recommendation_summary: analysis.recommendation_summary
    };
  }

  /**
   * Generate a full report for a protocol
   */
  async generateProtocolReport(protocolId: number): Promise<string> {
    const analysis = await this.getProtocolAnalysis(protocolId);
    
    if (!analysis) {
      throw new Error('Protocol analysis not found');
    }
    
    const reportOutputPath = path.join(this.tempDir, `report_${protocolId}_${Date.now()}.pdf`);
    const analysisDataPath = path.join(this.tempDir, `analysis_data_${protocolId}.json`);
    
    // Write analysis data to temp file for report generation script
    fs.writeFileSync(analysisDataPath, JSON.stringify(analysis));
    
    return new Promise((resolve, reject) => {
      // Run Python script to generate PDF report
      const reportProcess = spawn('python', [
        'scripts/generate_protocol_report.py',
        analysisDataPath,
        reportOutputPath
      ]);
      
      let errorOutput = '';
      
      reportProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      reportProcess.on('close', (code) => {
        // Clean up temp file
        try {
          fs.unlinkSync(analysisDataPath);
        } catch (err) {
          console.error('Failed to clean up temp file:', err);
        }
        
        if (code !== 0) {
          reject(new Error(`Report generation failed: ${errorOutput}`));
          return;
        }
        
        // Create a directory for reports if it doesn't exist
        const reportsDir = path.join(process.cwd(), 'data', 'reports');
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true });
        }
        
        // Move the report to a permanent location
        const reportFileName = `Protocol_Analysis_${protocolId}_${Date.now()}.pdf`;
        const reportPath = path.join(reportsDir, reportFileName);
        
        fs.rename(reportOutputPath, reportPath, (err) => {
          if (err) {
            reject(new Error(`Failed to save report: ${err.message}`));
            return;
          }
          
          resolve(reportPath);
        });
      });
    });
  }
  
  /**
   * Get benchmark data for protocol metrics
   */
  async getBenchmarkData(indication: string, phase: string): Promise<any> {
    // This would query the CSR database for benchmarks based on indication and phase
    // For now, we'll return a mock response with the structure needed by the UI
    
    return new Promise((resolve, reject) => {
      // Run Python script to get benchmark data from CSR database
      const benchmarkProcess = spawn('python', [
        'scripts/get_csr_benchmarks.py',
        indication,
        phase
      ]);
      
      let dataOutput = '';
      let errorOutput = '';
      
      benchmarkProcess.stdout.on('data', (data) => {
        dataOutput += data.toString();
      });
      
      benchmarkProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      benchmarkProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Failed to get benchmark data: ${errorOutput}`));
          return;
        }
        
        try {
          const benchmarkData = JSON.parse(dataOutput);
          resolve(benchmarkData);
        } catch (err) {
          reject(new Error(`Failed to parse benchmark data: ${err.message}`));
        }
      });
    });
  }
}

export const protocolAnalyzerService = new ProtocolAnalyzerService();