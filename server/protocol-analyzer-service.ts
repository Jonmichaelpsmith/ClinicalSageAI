import { db } from './db';
import fs from 'fs';
import path from 'path';
import { protocols, protocolAnalyses } from '@shared/schema';
import { sql, eq } from 'drizzle-orm';
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
   * Extract data from protocol document using HuggingFace models
   */
  async extractProtocolData(filePath: string): Promise<ExtractedProtocolData> {
    // Create a temporary output file for the extraction results
    const outputPath = path.join(this.tempDir, `extraction_${Date.now()}.json`);
    
    return new Promise((resolve, reject) => {
      // Run the Python script to extract protocol data
      const extractorProcess = spawn('python', [
        'scripts/extract_protocol_data.py',
        filePath,
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
    const [protocol] = await db.insert(protocols).values({
      title: extractedData.title || 'Untitled Protocol',
      fileName: fileName,
      filePath: filePath,
      fileSize: fileSize,
      uploadDate: new Date(),
      phase: extractedData.phase,
      indication: extractedData.indication,
      status: 'Uploaded',
      sponsor: 'Unknown', // This could be extracted or provided by user
      summary: JSON.stringify(extractedData),
    }).returning({ id: protocols.id });
    
    return protocol.id;
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
    await db.insert(protocolAnalyses).values({
      protocolId: protocolId,
      analysisDate: new Date(),
      riskFlags: JSON.stringify(analysisResult.risk_flags),
      riskScores: JSON.stringify(analysisResult.risk_scores),
      csrMatches: JSON.stringify(analysisResult.csr_matches),
      strategicInsights: JSON.stringify(analysisResult.strategic_insights),
      recommendationSummary: analysisResult.recommendation_summary,
    });
    
    // Update protocol status
    await db
      .update(protocols)
      .set({ status: 'Analyzed', lastUpdated: new Date() })
      .where(eq(protocols.id, protocolId));
  }

  /**
   * Get protocol analysis by ID
   */
  async getProtocolAnalysis(protocolId: number): Promise<ProtocolAnalysisResult | null> {
    const [analysis] = await db
      .select()
      .from(protocolAnalyses)
      .where(eq(protocolAnalyses.protocolId, protocolId))
      .orderBy(sql`${protocolAnalyses.analysisDate} DESC`)
      .limit(1);
    
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
    } catch (err) {
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
      risk_flags: JSON.parse(analysis.riskFlags as string),
      csr_matches: JSON.parse(analysis.csrMatches as string),
      risk_scores: JSON.parse(analysis.riskScores as string),
      strategic_insights: JSON.parse(analysis.strategicInsights as string),
      recommendation_summary: analysis.recommendationSummary as string
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