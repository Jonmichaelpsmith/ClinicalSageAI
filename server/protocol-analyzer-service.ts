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
    try {
      // Create a temporary output file for the extraction results
      const outputPath = path.join(this.tempDir, `extraction_${Date.now()}.json`);
      const inputPath = path.join(this.tempDir, `input_${Date.now()}.txt`);
      
      // Ensure temp directory exists
      this.ensureDirectories();
      
      try {
        // Write the text content to a temporary file
        fs.writeFileSync(inputPath, textContent);
      } catch (error) {
        console.error('Error writing text content to temporary file:', error);
        throw new Error(`Failed to write content to temporary file: ${error instanceof Error ? error.message : String(error)}`);
      }
      
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
          console.error(`Protocol extraction error: ${data}`);
        });
        
        extractorProcess.on('close', (code) => {
          // Always attempt to clean up the input file regardless of success or failure
          try {
            if (fs.existsSync(inputPath)) {
              fs.unlinkSync(inputPath);
            }
          } catch (cleanupError) {
            console.error('Failed to clean up input file:', cleanupError);
          }
          
          if (code !== 0) {
            reject(new Error(`Protocol extraction failed (exit code ${code}): ${errorOutput}`));
            return;
          }
          
          try {
            if (!fs.existsSync(outputPath)) {
              reject(new Error('Protocol extraction output file was not created'));
              return;
            }
            
            const extractionResult = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
            
            // Clean up output file
            try {
              fs.unlinkSync(outputPath);
            } catch (cleanupError) {
              console.error('Failed to clean up output file:', cleanupError);
            }
            
            resolve(extractionResult);
          } catch (err) {
            // Try to clean up the output file if it exists and we failed to parse it
            try {
              if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
              }
            } catch (cleanupError) {
              console.error('Failed to clean up output file after error:', cleanupError);
            }
            
            reject(new Error(`Failed to parse extraction results: ${err instanceof Error ? err.message : String(err)}`));
          }
        });
        
        // Handle process errors (e.g., if the Python process couldn't be started)
        extractorProcess.on('error', (err) => {
          // Clean up temporary files
          try {
            if (fs.existsSync(inputPath)) {
              fs.unlinkSync(inputPath);
            }
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
            }
          } catch (cleanupError) {
            console.error('Failed to clean up files after process error:', cleanupError);
          }
          
          reject(new Error(`Failed to start protocol extraction process: ${err.message}`));
        });
      });
    } catch (error) {
      console.error('Error in extractProtocolData:', error);
      throw new Error(`Protocol data extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
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
    try {
      // Validate input parameters
      if (!fileName) throw new Error('fileName is required');
      if (!filePath) throw new Error('filePath is required');
      if (fileSize <= 0) throw new Error('fileSize must be greater than 0');
      if (!extractedData) throw new Error('extractedData is required');
      
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
        extractedData.phase || 'Unknown',
        extractedData.indication || 'Unknown',
        'Uploaded',
        'Unknown', // This could be extracted or provided by user
        JSON.stringify(extractedData)
      ]);
      
      if (!result || !Array.isArray(result) || result.length === 0) {
        throw new Error('Failed to insert protocol into database');
      }
      
      if (!result[0] || typeof result[0].id !== 'number') {
        throw new Error('Invalid protocol ID returned from database');
      }
      
      return result[0].id;
    } catch (error) {
      console.error('Error in storeProtocol:', error);
      throw new Error(`Failed to store protocol: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Analyze protocol against CSR database
   */
  async analyzeProtocol(protocolId: number, extractedData: ExtractedProtocolData): Promise<ProtocolAnalysisResult> {
    try {
      // Validate input parameters
      if (!protocolId || typeof protocolId !== 'number') {
        throw new Error('Invalid protocol ID');
      }
      
      if (!extractedData) {
        throw new Error('Extracted data is required for analysis');
      }
      
      // Ensure temp directory exists
      this.ensureDirectories();
      
      // Run analysis against CSR database using ML model
      const analysisOutputPath = path.join(this.tempDir, `analysis_${protocolId}_${Date.now()}.json`);
      
      return new Promise((resolve, reject) => {
        try {
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
            console.error(`Protocol analysis error: ${data}`);
          });
          
          analysisProcess.on('close', async (code) => {
            // Clean up temp file
            try {
              if (fs.existsSync(extractedDataPath)) {
                fs.unlinkSync(extractedDataPath);
              }
            } catch (err) {
              console.error('Failed to clean up temp file:', err);
            }
            
            if (code !== 0) {
              reject(new Error(`Protocol analysis failed (exit code ${code}): ${errorOutput}`));
              return;
            }
            
            try {
              if (!fs.existsSync(analysisOutputPath)) {
                reject(new Error('Protocol analysis output file was not created'));
                return;
              }
              
              const analysisResult = JSON.parse(fs.readFileSync(analysisOutputPath, 'utf8'));
              
              // Clean up analysis output file
              try {
                fs.unlinkSync(analysisOutputPath);
              } catch (cleanupError) {
                console.error('Failed to clean up analysis output file:', cleanupError);
              }
              
              try {
                // Store analysis results in database
                await this.storeAnalysisResults(protocolId, analysisResult);
              } catch (storeError) {
                console.error('Error storing analysis results:', storeError);
                reject(new Error(`Failed to store analysis results: ${storeError instanceof Error ? storeError.message : String(storeError)}`));
                return;
              }
              
              resolve(analysisResult);
            } catch (parseError) {
              // Try to clean up the output file if it exists and we failed to parse it
              try {
                if (fs.existsSync(analysisOutputPath)) {
                  fs.unlinkSync(analysisOutputPath);
                }
              } catch (cleanupError) {
                console.error('Failed to clean up output file after error:', cleanupError);
              }
              
              reject(new Error(`Failed to parse analysis results: ${parseError instanceof Error ? parseError.message : String(parseError)}`));
            }
          });
          
          // Handle process errors (e.g., if the Python process couldn't be started)
          analysisProcess.on('error', (err) => {
            // Clean up temporary files
            try {
              if (fs.existsSync(extractedDataPath)) {
                fs.unlinkSync(extractedDataPath);
              }
              if (fs.existsSync(analysisOutputPath)) {
                fs.unlinkSync(analysisOutputPath);
              }
            } catch (cleanupError) {
              console.error('Failed to clean up files after process error:', cleanupError);
            }
            
            reject(new Error(`Failed to start protocol analysis process: ${err.message}`));
          });
        } catch (promptError) {
          reject(new Error(`Error preparing protocol analysis: ${promptError instanceof Error ? promptError.message : String(promptError)}`));
        }
      });
    } catch (error) {
      console.error('Error in analyzeProtocol:', error);
      throw new Error(`Protocol analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Store analysis results in database
   */
  private async storeAnalysisResults(protocolId: number, analysisResult: ProtocolAnalysisResult): Promise<void> {
    try {
      // Validate input parameters
      if (!protocolId || typeof protocolId !== 'number') {
        throw new Error('Invalid protocol ID');
      }
      
      if (!analysisResult) {
        throw new Error('Analysis result is required');
      }
      
      // Validate required fields in analysis result
      if (!analysisResult.risk_flags) {
        throw new Error('Missing risk flags in analysis result');
      }
      
      if (!analysisResult.risk_scores) {
        throw new Error('Missing risk scores in analysis result');
      }
      
      if (!analysisResult.csr_matches) {
        throw new Error('Missing CSR matches in analysis result');
      }
      
      if (!analysisResult.strategic_insights) {
        throw new Error('Missing strategic insights in analysis result');
      }
      
      if (!analysisResult.recommendation_summary) {
        throw new Error('Missing recommendation summary in analysis result');
      }
      
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
        
      console.log(`Successfully stored analysis results for protocol ${protocolId}`);
    } catch (error) {
      console.error('Error in storeAnalysisResults:', error);
      throw new Error(`Failed to store analysis results: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get protocol analysis by ID
   */
  async getProtocolAnalysis(protocolId: number): Promise<ProtocolAnalysisResult | null> {
    try {
      // Validate input parameters
      if (!protocolId || typeof protocolId !== 'number') {
        throw new Error('Invalid protocol ID');
      }
      
      // Use direct SQL query to get analysis data
      const analysisQuery = `
        SELECT * FROM protocol_analyses
        WHERE protocol_id = $1
        ORDER BY analysis_date DESC
        LIMIT 1
      `;
      
      const analysisResult = await db.execute(analysisQuery, [protocolId]);
      
      // Check if we have a valid result array
      if (!analysisResult || !Array.isArray(analysisResult) || analysisResult.length === 0) {
        console.log(`No analysis found for protocol ID ${protocolId}`);
        return null;
      }
      
      const analysis = analysisResult[0];
      
      if (!analysis) {
        return null;
      }
      
      // Get protocol details
      try {
        const [protocol] = await db
          .select()
          .from(protocols)
          .where(eq(protocols.id, protocolId));
        
        if (!protocol) {
          console.warn(`Protocol with ID ${protocolId} not found, but analysis exists`);
          return null;
        }
        
        let extractedData: ExtractedProtocolData;
        try {
          // Safely parse the summary field
          if (!protocol.summary) {
            throw new Error('Protocol summary is missing');
          }
          
          extractedData = JSON.parse(protocol.summary as string);
          
          // Validate the parsed data has all required fields
          if (!extractedData.title) {
            extractedData.title = protocol.title;
          }
          
          if (!extractedData.phase) {
            extractedData.phase = protocol.phase;
          }
          
          if (!extractedData.indication) {
            extractedData.indication = protocol.indication;
          }
          
          // Ensure all required arrays exist
          extractedData.primary_endpoints = extractedData.primary_endpoints || [];
          extractedData.secondary_endpoints = extractedData.secondary_endpoints || [];
          extractedData.arms = extractedData.arms || [];
          extractedData.inclusion_criteria = extractedData.inclusion_criteria || [];
          extractedData.exclusion_criteria = extractedData.exclusion_criteria || [];
          
        } catch (parseError) {
          console.error(`Error parsing protocol summary for ID ${protocolId}:`, parseError);
          
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
        
        // Safely parse JSON fields from analysis with error handling
        let riskFlags: any;
        let csrMatches: any;
        let riskScores: any;
        let strategicInsights: any;
        
        try {
          riskFlags = JSON.parse(analysis.risk_flags);
        } catch (error) {
          console.error('Error parsing risk_flags:', error);
          riskFlags = { 
            underpowered: false,
            endpoint_risk: false,
            duration_mismatch: false,
            high_dropout: false,
            design_issues: false,
            innovative_approach: false
          };
        }
        
        try {
          csrMatches = JSON.parse(analysis.csr_matches);
        } catch (error) {
          console.error('Error parsing csr_matches:', error);
          csrMatches = [];
        }
        
        try {
          riskScores = JSON.parse(analysis.risk_scores);
        } catch (error) {
          console.error('Error parsing risk_scores:', error);
          riskScores = {
            success_probability: 0.5,
            dropout_risk: 0.5,
            regulatory_alignment: 0.5,
            innovation_index: 0.5,
            competitive_edge: 0.5
          };
        }
        
        try {
          strategicInsights = JSON.parse(analysis.strategic_insights);
        } catch (error) {
          console.error('Error parsing strategic_insights:', error);
          strategicInsights = [];
        }
        
        return {
          protocol_id: protocolId,
          extracted_data: extractedData,
          risk_flags: riskFlags,
          csr_matches: csrMatches,
          risk_scores: riskScores,
          strategic_insights: strategicInsights,
          recommendation_summary: analysis.recommendation_summary || 'No recommendations available'
        };
      } catch (dbError) {
        console.error(`Database error when getting protocol ${protocolId}:`, dbError);
        return null;
      }
    } catch (error) {
      console.error('Error in getProtocolAnalysis:', error);
      // We return null instead of throwing an error to allow graceful handling by the caller
      return null;
    }
  }

  /**
   * Generate a full report for a protocol
   */
  async generateProtocolReport(protocolId: number): Promise<string> {
    try {
      // Validate input parameters
      if (!protocolId || typeof protocolId !== 'number') {
        throw new Error('Invalid protocol ID');
      }
      
      // Ensure directories exist
      this.ensureDirectories();
      
      // Get protocol analysis data
      const analysis = await this.getProtocolAnalysis(protocolId);
      
      if (!analysis) {
        throw new Error(`Protocol analysis not found for ID ${protocolId}`);
      }
      
      // Create temporary file paths
      const reportOutputPath = path.join(this.tempDir, `report_${protocolId}_${Date.now()}.pdf`);
      const analysisDataPath = path.join(this.tempDir, `analysis_data_${protocolId}.json`);
      
      try {
        // Write analysis data to temp file for report generation script
        fs.writeFileSync(analysisDataPath, JSON.stringify(analysis));
      } catch (writeError) {
        console.error('Error writing analysis data to temporary file:', writeError);
        throw new Error(`Failed to prepare report data: ${writeError instanceof Error ? writeError.message : String(writeError)}`);
      }
      
      return new Promise((resolve, reject) => {
        try {
          // Run Python script to generate PDF report
          const reportProcess = spawn('python', [
            'scripts/generate_protocol_report.py',
            analysisDataPath,
            reportOutputPath
          ]);
          
          let errorOutput = '';
          let stdOutput = '';
          
          reportProcess.stdout.on('data', (data) => {
            stdOutput += data.toString();
          });
          
          reportProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.error(`Report generation error: ${data}`);
          });
          
          reportProcess.on('close', (code) => {
            // Clean up temp file
            try {
              if (fs.existsSync(analysisDataPath)) {
                fs.unlinkSync(analysisDataPath);
              }
            } catch (cleanupError) {
              console.error('Failed to clean up temp analysis file:', cleanupError);
              // Continue with report generation even if cleanup fails
            }
            
            if (code !== 0) {
              reject(new Error(`Report generation failed (exit code ${code}): ${errorOutput}`));
              return;
            }
            
            // Check if the report was actually generated
            if (!fs.existsSync(reportOutputPath)) {
              reject(new Error('Report PDF file was not created by the script'));
              return;
            }
            
            try {
              // Create a directory for reports if it doesn't exist
              const reportsDir = path.join(process.cwd(), 'data', 'reports');
              if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir, { recursive: true });
              }
              
              // Move the report to a permanent location
              const reportFileName = `Protocol_Analysis_${protocolId}_${Date.now()}.pdf`;
              const reportPath = path.join(reportsDir, reportFileName);
              
              fs.rename(reportOutputPath, reportPath, (renameError) => {
                if (renameError) {
                  console.error('Failed to save report file:', renameError);
                  
                  // Attempt to copy instead of rename if rename fails
                  try {
                    fs.copyFileSync(reportOutputPath, reportPath);
                    try {
                      // Try to clean up the temp file after successful copy
                      fs.unlinkSync(reportOutputPath);
                    } catch (unlinkError) {
                      console.error('Failed to clean up temp report file after copy:', unlinkError);
                      // Continue even if cleanup fails
                    }
                    
                    resolve(reportPath);
                  } catch (copyError) {
                    reject(new Error(`Failed to save report after rename failure: ${copyError instanceof Error ? copyError.message : String(copyError)}`));
                  }
                  return;
                }
                
                console.log(`Successfully generated report at ${reportPath}`);
                resolve(reportPath);
              });
            } catch (dirError) {
              reject(new Error(`Failed to manage report directory: ${dirError instanceof Error ? dirError.message : String(dirError)}`));
            }
          });
          
          // Handle process errors (e.g., if Python process couldn't be started)
          reportProcess.on('error', (processError) => {
            // Clean up any temporary files
            try {
              if (fs.existsSync(analysisDataPath)) {
                fs.unlinkSync(analysisDataPath);
              }
              if (fs.existsSync(reportOutputPath)) {
                fs.unlinkSync(reportOutputPath);
              }
            } catch (cleanupError) {
              console.error('Failed to clean up files after process error:', cleanupError);
            }
            
            reject(new Error(`Failed to start report generation process: ${processError.message}`));
          });
        } catch (execError) {
          // Clean up if spawn or other setup fails
          try {
            if (fs.existsSync(analysisDataPath)) {
              fs.unlinkSync(analysisDataPath);
            }
          } catch (cleanupError) {
            console.error('Failed to clean up analysis file after execution error:', cleanupError);
          }
          
          reject(new Error(`Error starting report generation: ${execError instanceof Error ? execError.message : String(execError)}`));
        }
      });
    } catch (error) {
      console.error('Error in generateProtocolReport:', error);
      throw new Error(`Failed to generate protocol report: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get benchmark data for protocol metrics
   */
  async getBenchmarkData(indication: string, phase: string): Promise<any> {
    try {
      // Validate input parameters
      if (!indication || typeof indication !== 'string') {
        throw new Error('Invalid indication parameter');
      }
      
      if (!phase || typeof phase !== 'string') {
        throw new Error('Invalid phase parameter');
      }
      
      // Ensure temp directory exists for any temporary files needed
      this.ensureDirectories();
      
      // Create a unique temporary file to store the output if needed
      const tempOutputPath = path.join(this.tempDir, `benchmark_${Date.now()}.json`);
      
      return new Promise<any>((resolve, reject) => {
        try {
          // Run Python script to get benchmark data from CSR database
          const benchmarkProcess = spawn('python', [
            'scripts/get_csr_benchmarks.py',
            indication,
            phase,
            tempOutputPath // Optional output file path
          ]);
          
          let dataOutput = '';
          let errorOutput = '';
          
          benchmarkProcess.stdout.on('data', (data) => {
            dataOutput += data.toString();
          });
          
          benchmarkProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.error(`Benchmark script error: ${data}`);
          });
          
          benchmarkProcess.on('close', (code) => {
            let benchmarkData = null;
            
            // Try to read from output file first if it exists
            if (fs.existsSync(tempOutputPath)) {
              try {
                const fileContent = fs.readFileSync(tempOutputPath, 'utf8');
                benchmarkData = JSON.parse(fileContent);
                // Clean up temp file
                try {
                  fs.unlinkSync(tempOutputPath);
                } catch (cleanupError) {
                  console.error('Error cleaning up benchmark temp file:', cleanupError);
                  // Continue even if cleanup fails
                }
              } catch (fileError) {
                console.error('Error reading benchmark output file:', fileError);
                // Fall back to stdout data
              }
            }
            
            // If we couldn't get data from the file, try to parse stdout
            if (!benchmarkData && dataOutput) {
              try {
                benchmarkData = JSON.parse(dataOutput);
              } catch (parseError) {
                console.error('Error parsing benchmark data from stdout:', parseError);
                if (code !== 0) {
                  reject(new Error(`Failed to get benchmark data (exit code ${code}): ${errorOutput}`));
                  return;
                }
              }
            }
            
            // If we have no data at this point, it's an error
            if (!benchmarkData) {
              reject(new Error('No benchmark data was returned from the script'));
              return;
            }
            
            // Validate the benchmark data structure
            if (!this.isValidBenchmarkData(benchmarkData)) {
              reject(new Error('Invalid benchmark data structure'));
              return;
            }
            
            resolve(benchmarkData);
          });
          
          // Handle process errors (e.g., if Python process couldn't be started)
          benchmarkProcess.on('error', (processError) => {
            console.error('Error starting benchmark process:', processError);
            reject(new Error(`Failed to start benchmark process: ${processError.message}`));
          });
        } catch (execError) {
          console.error('Error spawning benchmark process:', execError);
          reject(new Error(`Error starting benchmark process: ${execError instanceof Error ? execError.message : String(execError)}`));
        }
      });
    } catch (error) {
      console.error('Error in getBenchmarkData:', error);
      throw new Error(`Failed to get benchmark data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Validate the benchmark data structure
   * @private
   */
  private isValidBenchmarkData(data: any): boolean {
    // Check if data is an object
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // Check for required fields
    const requiredKeys = [
      'sample_size',
      'duration',
      'endpoints',
      'success_rate'
    ];
    
    for (const key of requiredKeys) {
      if (!(key in data)) {
        console.error(`Missing required key in benchmark data: ${key}`);
        return false;
      }
    }
    
    return true;
  }
}

export const protocolAnalyzerService = new ProtocolAnalyzerService();