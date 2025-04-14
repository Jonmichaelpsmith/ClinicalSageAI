import fs from 'fs';
import path from 'path';
import { sql } from 'drizzle-orm';
import { db } from '../db';
import { huggingFaceService } from '../huggingface-service';
import { eq } from 'drizzle-orm';

// Constants
const PROCESSED_CSR_DIR = path.join(process.cwd(), 'data/processed_csrs');
const CSR_MAPPING_TEMPLATE_PATH = path.join(process.cwd(), 'shared/templates/csr_mapping_template.json');

// Ensure directories exist
if (!fs.existsSync(PROCESSED_CSR_DIR)) {
  fs.mkdirSync(PROCESSED_CSR_DIR, { recursive: true });
}

// Define the core schema interface based on the mapping template
interface CSRMappingTemplate {
  csr_id: string;
  meta: {
    study_id: string;
    sponsor: string;
    phase: string;
    indication: string;
    molecule: string;
    moa: string;
    submission_date: string;
  };
  summary: {
    objectives: string;
    design: string;
    endpoints: string[];
    results: string;
  };
  design: {
    arms: number;
    duration_weeks: number;
    randomization: string;
    blinding: string;
    flow_diagram: string;
  };
  population: {
    total_enrolled: number;
    screen_fail: number;
    discontinued: number;
    inclusion_criteria: string[];
    exclusion_criteria: string[];
  };
  efficacy: {
    primary: string[];
    secondary: string[];
    exploratory: string[];
    analysis_methods: string;
  };
  safety: {
    teae_summary: string;
    sae_summary: string;
    lab_flags: string[];
    discontinuations: string[];
  };
  stats: {
    method: string;
    sample_size_calc: string;
    adjustments: string;
    population_sets: string[];
  };
  results: {
    primary_outcome: string;
    secondary: string;
    subgroups: string;
    charts: string[];
    p_values: Record<string, number>;
  };
  regulatory: {
    findings: string;
    irb_notes: string;
    audit_flags: string[];
  };
  refs: {
    protocol: string;
    sap: string;
    crf: string;
    literature: string[];
  };
  vector_embedding: number[];
  processing_metadata: {
    processed_date: string;
    processing_version: string;
    confidence_scores: {
      overall: number;
      sections: Record<string, number>;
    };
  };
}

/**
 * CSR Extractor Service - Responsible for processing CSRs into structured JSON
 * with consistent mapping and generating embeddings for search
 */
class CSRExtractorService {
  private mappingTemplate: CSRMappingTemplate;

  constructor() {
    try {
      this.mappingTemplate = JSON.parse(fs.readFileSync(CSR_MAPPING_TEMPLATE_PATH, 'utf8'));
      // Add processing metadata fields that aren't in the original template
      if (!this.mappingTemplate.vector_embedding) {
        this.mappingTemplate.vector_embedding = [];
      }
      if (!this.mappingTemplate.processing_metadata) {
        this.mappingTemplate.processing_metadata = {
          processed_date: '',
          processing_version: '',
          confidence_scores: {
            overall: 0,
            sections: {}
          }
        };
      }
      if (!this.mappingTemplate.csr_id) {
        this.mappingTemplate.csr_id = '';
      }
    } catch (error) {
      console.error('Error loading CSR mapping template:', error);
      throw new Error('Failed to initialize CSR mapping template');
    }
  }

  /**
   * Process a CSR file and extract structured data
   * @param reportId The database ID of the CSR report
   * @returns The processed CSR data with proper mapping
   */
  async processCSR(reportId: number): Promise<CSRMappingTemplate> {
    try {
      // Get the CSR report data from the database
      const [report] = await db.execute<{
        id: number;
        title: string;
        nctrial_id?: string;
        sponsor?: string;
        indication?: string;
        phase?: string;
        drugName?: string;
        uploadDate?: Date;
      }>(sql`
        SELECT id, title, nctrial_id, sponsor, indication, phase, drug_name as "drugName", upload_date as "uploadDate" 
        FROM csr_reports 
        WHERE id = ${reportId} 
        LIMIT 1
      `);

      if (!report) {
        throw new Error(`CSR Report with ID ${reportId} not found`);
      }

      // Get the associated details
      const [details] = await db.execute<{
        id: number;
        reportId: number;
        studyDesign?: string;
        primaryObjective?: string;
        studyDescription?: string;
        inclusionCriteria?: string | string[];
        exclusionCriteria?: string | string[];
        endpoints?: string[] | { primary?: string; secondary?: string[] };
        treatmentArms?: string[] | Record<string, string>;
        sample_size?: number;
        results?: {
          summary?: string;
          primary?: string;
          secondary?: string[];
          interpretation?: string;
        };
        safety?: {
          adverse_events?: {
            total?: number;
            subjects?: number;
            percent?: number;
            common?: string[];
          };
          serious_adverse_events?: {
            total?: number;
            subjects?: number;
            percent?: number;
            common?: string[];
          };
          discontinuations?: {
            ae?: number;
            lack_efficacy?: number;
            other?: string[];
          };
        };
        processed?: boolean;
      }>(sql`
        SELECT * FROM csr_details 
        WHERE report_id = ${reportId} 
        LIMIT 1
      `);

      // Create a new mapping object based on the template
      const mappedData: CSRMappingTemplate = JSON.parse(JSON.stringify(this.mappingTemplate));

      // Set CSR ID
      mappedData.csr_id = report.nctrial_id || `CSR-${reportId}`;

      // Fill in metadata
      mappedData.meta.study_id = report.nctrial_id || '';
      mappedData.meta.sponsor = report.sponsor || '';
      mappedData.meta.phase = report.phase || '';
      mappedData.meta.molecule = report.drugName || '';
      mappedData.meta.indication = report.indication || '';
      mappedData.meta.submission_date = report.uploadDate ? new Date(report.uploadDate).toISOString() : '';

      // Process study summary
      if (details) {
        // Study objectives and design
        if (details.primaryObjective) {
          mappedData.summary.objectives = details.primaryObjective;
        }
        
        if (details.studyDesign) {
          mappedData.summary.design = details.studyDesign;
          
          // Try to determine design type from description
          const designLower = details.studyDesign.toLowerCase();
          if (designLower.includes('randomized')) {
            mappedData.design.randomization = 'randomized';
          }
          if (designLower.includes('double-blind')) {
            mappedData.design.blinding = 'double-blind';
          } else if (designLower.includes('single-blind')) {
            mappedData.design.blinding = 'single-blind';
          } else if (designLower.includes('open-label')) {
            mappedData.design.blinding = 'open-label';
          }
        }

        // Population data
        if (details.sample_size) {
          mappedData.population.total_enrolled = details.sample_size;
        }
        
        if (details.inclusionCriteria) {
          try {
            if (typeof details.inclusionCriteria === 'string') {
              // Split by line breaks or bullet points
              mappedData.population.inclusion_criteria = details.inclusionCriteria
                .split(/\n|\r|•|\\bullet/)
                .map(item => item.trim())
                .filter(item => item.length > 0);
            } else if (Array.isArray(details.inclusionCriteria)) {
              mappedData.population.inclusion_criteria = details.inclusionCriteria;
            }
          } catch (err) {
            console.error('Error processing inclusion criteria:', err);
          }
        }
        
        if (details.exclusionCriteria) {
          try {
            if (typeof details.exclusionCriteria === 'string') {
              // Split by line breaks or bullet points
              mappedData.population.exclusion_criteria = details.exclusionCriteria
                .split(/\n|\r|•|\\bullet/)
                .map(item => item.trim())
                .filter(item => item.length > 0);
            } else if (Array.isArray(details.exclusionCriteria)) {
              mappedData.population.exclusion_criteria = details.exclusionCriteria;
            }
          } catch (err) {
            console.error('Error processing exclusion criteria:', err);
          }
        }

        // Results and endpoints
        if (details.endpoints) {
          try {
            if (Array.isArray(details.endpoints)) {
              // Handle array of endpoints
              mappedData.summary.endpoints = details.endpoints;
              
              if (details.endpoints.length > 0) {
                mappedData.efficacy.primary = [details.endpoints[0]];
                
                if (details.endpoints.length > 1) {
                  mappedData.efficacy.secondary = details.endpoints.slice(1);
                }
              }
            } else if (typeof details.endpoints === 'object') {
              // Handle object with primary/secondary keys
              const endpoints = details.endpoints;
              
              if (endpoints.primary) {
                mappedData.summary.endpoints = [endpoints.primary];
                mappedData.efficacy.primary = [endpoints.primary];
              }
              
              if (endpoints.secondary && Array.isArray(endpoints.secondary)) {
                mappedData.summary.endpoints = [
                  ...(mappedData.summary.endpoints || []),
                  ...endpoints.secondary
                ];
                mappedData.efficacy.secondary = endpoints.secondary;
              }
            }
          } catch (err) {
            console.error('Error processing endpoints:', err);
          }
        }

        // Treatment arms
        if (details.treatmentArms) {
          try {
            // Count the number of arms
            if (Array.isArray(details.treatmentArms)) {
              mappedData.design.arms = details.treatmentArms.length;
            } else if (typeof details.treatmentArms === 'object') {
              mappedData.design.arms = Object.keys(details.treatmentArms).length;
            }
          } catch (err) {
            console.error('Error processing treatment arms:', err);
          }
        }

        // Results
        if (details.results) {
          try {
            const results = details.results;
            
            if (results.summary) {
              mappedData.summary.results = results.summary;
            }
            
            if (results.primary) {
              mappedData.results.primary_outcome = results.primary;
            }
            
            if (results.secondary && Array.isArray(results.secondary)) {
              mappedData.results.secondary = results.secondary.join('; ');
            }
          } catch (err) {
            console.error('Error processing results:', err);
          }
        }

        // Safety data
        if (details.safety) {
          try {
            const safety = details.safety;
            
            // TEAE summary
            if (safety.adverse_events) {
              const ae = safety.adverse_events;
              let teaeSummary = '';
              
              if (ae.total) teaeSummary += `Total events: ${ae.total}. `;
              if (ae.subjects) teaeSummary += `Subjects with events: ${ae.subjects}. `;
              if (ae.percent) teaeSummary += `Percent with events: ${ae.percent}%. `;
              if (ae.common && ae.common.length > 0) {
                teaeSummary += `Most frequent: ${ae.common.join(', ')}.`;
              }
              
              mappedData.safety.teae_summary = teaeSummary;
            }
            
            // SAE summary
            if (safety.serious_adverse_events) {
              const sae = safety.serious_adverse_events;
              let saeSummary = '';
              
              if (sae.total) saeSummary += `Total events: ${sae.total}. `;
              if (sae.subjects) saeSummary += `Subjects with events: ${sae.subjects}. `;
              if (sae.percent) saeSummary += `Percent with events: ${sae.percent}%. `;
              if (sae.common && sae.common.length > 0) {
                saeSummary += `Most frequent: ${sae.common.join(', ')}.`;
              }
              
              mappedData.safety.sae_summary = saeSummary;
            }
            
            // Discontinuations
            if (safety.discontinuations) {
              const disc = safety.discontinuations;
              const discontinuations: string[] = [];
              
              if (disc.ae) {
                discontinuations.push(`Due to AE: ${disc.ae}`);
              }
              if (disc.lack_efficacy) {
                discontinuations.push(`Due to lack of efficacy: ${disc.lack_efficacy}`);
              }
              if (disc.other && Array.isArray(disc.other)) {
                discontinuations.push(...disc.other);
              }
              
              mappedData.safety.discontinuations = discontinuations;
            }
          } catch (err) {
            console.error('Error processing safety data:', err);
          }
        }
      }

      // Generate text for embedding
      let combinedText = '';
      
      // Include metadata
      combinedText += `Study ID: ${mappedData.meta.study_id}\n`;
      combinedText += `Indication: ${mappedData.meta.indication}\n`;
      combinedText += `Phase: ${mappedData.meta.phase}\n`;
      combinedText += `Sponsor: ${mappedData.meta.sponsor}\n`;
      
      // Include objectives and design
      combinedText += `Objectives: ${mappedData.summary.objectives}\n`;
      combinedText += `Study Design: ${mappedData.summary.design}\n`;
      
      // Include endpoints
      if (mappedData.summary.endpoints && mappedData.summary.endpoints.length > 0) {
        combinedText += `Endpoints: ${mappedData.summary.endpoints.join('; ')}\n`;
      }
      
      // Include results
      combinedText += `Results: ${mappedData.summary.results}\n`;
      combinedText += `Primary Outcome: ${mappedData.results.primary_outcome}\n`;
      
      // Set processing metadata
      mappedData.processing_metadata.processed_date = new Date().toISOString();
      mappedData.processing_metadata.processing_version = '1.0.0';
      mappedData.processing_metadata.confidence_scores.overall = 0.85; // Default confidence
      mappedData.processing_metadata.confidence_scores.sections = {
        meta: 0.95,
        efficacy: 0.85,
        safety: 0.8,
        design: 0.9
      };

      // Get embeddings if HuggingFace service is available
      try {
        const embedding = await huggingFaceService.getEmbedding(combinedText);
        if (embedding && embedding.length > 0) {
          mappedData.vector_embedding = embedding;
        }
      } catch (error) {
        console.error('Error generating embedding for CSR:', error);
        mappedData.vector_embedding = [];
      }

      // Save to file
      const fileName = `${mappedData.csr_id}.json`;
      const filePath = path.join(PROCESSED_CSR_DIR, fileName);
      fs.writeFileSync(filePath, JSON.stringify(mappedData, null, 2));

      // Update the database to mark this CSR as processed
      await db.execute(sql`
        UPDATE csr_details
        SET processed = true, processing_status = 'completed'
        WHERE report_id = ${reportId}
      `);

      return mappedData;
    } catch (error) {
      console.error(`Error processing CSR with ID ${reportId}:`, error);
      throw error;
    }
  }

  /**
   * Process all unprocessed CSRs in the database
   * @param limit Maximum number of CSRs to process
   * @returns Number of CSRs processed
   */
  async processUnprocessedCSRs(limit: number = 50): Promise<number> {
    try {
      // Find unprocessed CSRs with details
      const unprocessedCSRs = await db.execute<{ report_id: number }>(sql`
        SELECT report_id 
        FROM csr_details 
        WHERE processed = false OR processed IS NULL
        LIMIT ${limit}
      `);

      console.log(`Found ${unprocessedCSRs.length} unprocessed CSRs to process`);

      // Process each CSR
      let processedCount = 0;
      for (const csr of unprocessedCSRs) {
        try {
          await this.processCSR(csr.report_id);
          processedCount++;
        } catch (error) {
          console.error(`Error processing CSR with ID ${csr.report_id}:`, error);
        }
      }

      return processedCount;
    } catch (error) {
      console.error('Error processing unprocessed CSRs:', error);
      throw error;
    }
  }

  /**
   * Get the total number of CSRs in the database vs. processed CSRs
   */
  async getProcessingStats(): Promise<{ total: number; processed: number; unprocessed: number }> {
    try {
      const [totalResult] = await db.execute<{ count: number }>(sql`
        SELECT COUNT(*) as count FROM csr_reports
      `);

      const [processedResult] = await db.execute<{ count: number }>(sql`
        SELECT COUNT(*) as count FROM csr_details
        WHERE processed = true
      `);

      const total = totalResult?.count || 0;
      const processed = processedResult?.count || 0;
      const unprocessed = total - processed;

      return { total, processed, unprocessed };
    } catch (error) {
      console.error('Error getting CSR processing stats:', error);
      throw error;
    }
  }
  
  /**
   * Get a count of processed CSR files on disk
   */
  getProcessedFileCount(): number {
    try {
      const files = fs.readdirSync(PROCESSED_CSR_DIR);
      return files.filter(file => file.endsWith('.json')).length;
    } catch (error) {
      console.error('Error counting processed CSR files:', error);
      return 0;
    }
  }

  /**
   * Create a batch processing job to process CSRs
   * @param batchSize Number of CSRs to process in this batch
   * @returns Job information including start time, count, and completion status
   */
  async createProcessingBatch(batchSize: number = 100): Promise<{
    startTime: string;
    endTime: string;
    processed: number;
    totalTime: number;
    status: string;
  }> {
    const startTime = new Date();
    let status = 'success';
    let processed = 0;

    try {
      processed = await this.processUnprocessedCSRs(batchSize);
    } catch (error) {
      console.error('Error in batch processing:', error);
      status = 'error';
    }

    const endTime = new Date();
    const totalTime = (endTime.getTime() - startTime.getTime()) / 1000; // in seconds

    return {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      processed,
      totalTime,
      status
    };
  }
}

export const csrExtractorService = new CSRExtractorService();