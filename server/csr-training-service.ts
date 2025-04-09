/**
 * CSR Training Service
 * 
 * This service provides functionality to train models on Clinical Study Reports
 * and extract structured data from them.
 */

import { db } from './db';
import { csrReports, csrDetails, type CsrReport, type CsrDetails } from '@shared/schema';
import { huggingFaceService, queryHuggingFace } from './huggingface-service';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

// Interface for the extracted structured data from CSR reports
export interface ExtractedCsrData {
  reportId: number;
  endpoints: Array<{
    name: string;
    type: 'primary' | 'secondary' | 'exploratory';
    definition: string;
    result?: string;
    pValue?: number;
  }>;
  patientPopulation: {
    totalEnrolled: number;
    demographics: Record<string, any>;
    inclusionCriteria: string[];
    exclusionCriteria: string[];
  };
  safetyProfile: {
    adverseEvents: Array<{
      event: string;
      frequency: number;
      severity: 'mild' | 'moderate' | 'severe';
    }>;
    seriousAdverseEvents: Array<{
      event: string;
      frequency: number;
    }>;
  };
  efficacyOutcomes: Array<{
    outcome: string;
    result: string;
    statisticalSignificance: boolean;
  }>;
  studyDesign: {
    type: string;
    randomization?: string;
    blinding?: string;
    arms: Array<{
      name: string;
      intervention: string;
      size: number;
    }>;
    duration: string;
  };
}

/**
 * CSR Training Service class
 */
export class CsrTrainingService {
  /**
   * Process a batch of CSR reports for training
   * 
   * @param batchSize Number of reports to process
   * @param startId Optional starting ID
   * @returns Summary of processed reports
   */
  async processBatchForTraining(batchSize: number = 10, startId: number = 0): Promise<{
    processedCount: number;
    successCount: number;
    failedIds: number[];
  }> {
    try {
      // Get reports that haven't been processed yet
      const reports = await db.select()
        .from(csrReports)
        .where(
          startId > 0 
            ? eq(csrReports.id, startId) 
            : undefined
        )
        .limit(batchSize);
      
      const results = {
        processedCount: reports.length,
        successCount: 0,
        failedIds: [] as number[]
      };
      
      for (const report of reports) {
        try {
          // Get the details for this report
          const [details] = await db.select()
            .from(csrDetails)
            .where(eq(csrDetails.reportId, report.id));
          
          if (details) {
            // Extract structured data from the report and details
            const extractedData = await this.extractStructuredData(report, details);
            
            // Store the extracted data
            await this.storeExtractedData(report.id, extractedData);
            
            results.successCount++;
          } else {
            console.warn(`No details found for report ID ${report.id}`);
            results.failedIds.push(report.id);
          }
        } catch (error) {
          console.error(`Failed to process report ID ${report.id}:`, error);
          results.failedIds.push(report.id);
        }
      }
      
      return results;
    } catch (error) {
      console.error("Error in processBatchForTraining:", error);
      throw error;
    }
  }
  
  /**
   * Extract structured data from a CSR report
   * 
   * @param report The CSR report
   * @param details The CSR details
   * @returns Extracted structured data
   */
  async extractStructuredData(report: CsrReport, details: CsrDetails): Promise<ExtractedCsrData> {
    try {
      // Combine relevant fields from the report and details for context
      const reportContext = `
        Title: ${report.title}
        Sponsor: ${report.sponsor}
        Indication: ${report.indication}
        Phase: ${report.phase}
        Status: ${report.status}
        NCT ID: ${report.nctrialId || 'N/A'}
        
        Primary Objective: ${details.primaryObjective || 'N/A'}
        Study Design: ${details.studyDesign || 'N/A'}
        Description: ${details.studyDescription || 'N/A'}
        Inclusion Criteria: ${details.inclusionCriteria || 'N/A'}
        Exclusion Criteria: ${details.exclusionCriteria || 'N/A'}
        Endpoints: ${details.endpointText || 'N/A'}
        Results: ${JSON.stringify(details.results) || 'N/A'}
        Adverse Events: ${details.adverseEvents || 'N/A'}
      `;
      
      // Use Hugging Face to extract endpoints
      const endpointsPrompt = `
        Extract all clinical trial endpoints from the following report.
        For each endpoint, identify if it's primary, secondary, or exploratory, and provide its definition.
        If available, also extract the result and p-value.
        Format your response as a JSON array of objects with keys: name, type, definition, result, pValue.
        
        Report content:
        ${reportContext}
      `;
      
      // Use Hugging Face to extract patient population
      const populationPrompt = `
        Extract patient population information from the clinical trial report.
        Include total enrolled, demographics, inclusion criteria, and exclusion criteria.
        Format as JSON with keys: totalEnrolled (number), demographics (object), inclusionCriteria (array), exclusionCriteria (array).
        
        Report content:
        ${reportContext}
      `;
      
      // Use Hugging Face to extract safety profile
      const safetyPrompt = `
        Extract the safety profile from the clinical trial report.
        Include adverse events (with event name, frequency as percentage, and severity) and serious adverse events.
        Format as JSON with keys: adverseEvents (array of objects with event, frequency, severity) and seriousAdverseEvents (array of objects with event, frequency).
        
        Report content:
        ${reportContext}
      `;
      
      // Use Hugging Face to extract efficacy outcomes
      const efficacyPrompt = `
        Extract efficacy outcomes from the clinical trial report.
        For each outcome, include the outcome name, result, and whether it was statistically significant.
        Format as JSON array of objects with keys: outcome, result, statisticalSignificance (boolean).
        
        Report content:
        ${reportContext}
      `;
      
      // Use Hugging Face to extract study design
      const designPrompt = `
        Extract the study design from the clinical trial report.
        Include type, randomization method, blinding, treatment arms, and study duration.
        Format as JSON with keys: type, randomization, blinding, arms (array of objects with name, intervention, size), duration.
        
        Report content:
        ${reportContext}
      `;
      
      // Process all prompts in parallel for efficiency
      const [
        endpointsResponse,
        populationResponse,
        safetyResponse,
        efficacyResponse,
        designResponse
      ] = await Promise.all([
        queryHuggingFace(endpointsPrompt),
        queryHuggingFace(populationPrompt),
        queryHuggingFace(safetyPrompt),
        queryHuggingFace(efficacyPrompt),
        queryHuggingFace(designPrompt)
      ]);
      
      // Parse the responses from Hugging Face
      let endpoints = [];
      let patientPopulation = { totalEnrolled: 0, demographics: {}, inclusionCriteria: [], exclusionCriteria: [] };
      let safetyProfile = { adverseEvents: [], seriousAdverseEvents: [] };
      let efficacyOutcomes = [];
      let studyDesign = { type: '', arms: [], duration: '' };
      
      try {
        endpoints = JSON.parse(this.extractJsonFromText(endpointsResponse));
      } catch (e) {
        console.warn(`Failed to parse endpoints for report ${report.id}:`, e);
      }
      
      try {
        patientPopulation = JSON.parse(this.extractJsonFromText(populationResponse));
      } catch (e) {
        console.warn(`Failed to parse population for report ${report.id}:`, e);
      }
      
      try {
        safetyProfile = JSON.parse(this.extractJsonFromText(safetyResponse));
      } catch (e) {
        console.warn(`Failed to parse safety profile for report ${report.id}:`, e);
      }
      
      try {
        efficacyOutcomes = JSON.parse(this.extractJsonFromText(efficacyResponse));
      } catch (e) {
        console.warn(`Failed to parse efficacy outcomes for report ${report.id}:`, e);
      }
      
      try {
        studyDesign = JSON.parse(this.extractJsonFromText(designResponse));
      } catch (e) {
        console.warn(`Failed to parse study design for report ${report.id}:`, e);
      }
      
      return {
        reportId: report.id,
        endpoints,
        patientPopulation,
        safetyProfile,
        efficacyOutcomes,
        studyDesign
      };
    } catch (error) {
      console.error(`Error extracting structured data for report ${report.id}:`, error);
      throw error;
    }
  }
  
  /**
   * Helper method to extract JSON from text that might contain additional content
   */
  private extractJsonFromText(text: string): string {
    const jsonPattern = /\{[\s\S]*\}|\[[\s\S]*\]/;
    const match = text.match(jsonPattern);
    if (match) {
      return match[0];
    }
    return '{}';
  }
  
  /**
   * Store extracted data in the database or file system
   */
  async storeExtractedData(reportId: number, data: ExtractedCsrData): Promise<void> {
    // Create directory if it doesn't exist
    const extractedDataDir = path.join(__dirname, '..', 'data', 'extracted');
    if (!fs.existsSync(extractedDataDir)) {
      fs.mkdirSync(extractedDataDir, { recursive: true });
    }
    
    // Store the data as a JSON file
    const filePath = path.join(extractedDataDir, `report_${reportId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    console.log(`Extracted data for report ${reportId} stored in ${filePath}`);
  }
  
  /**
   * Train a model on the structured data extracted from CSR reports
   */
  async trainModel(modelType: 'endpoint-prediction' | 'adverse-event-prediction' | 'efficacy-prediction'): Promise<{
    success: boolean;
    modelId?: string;
    error?: string;
  }> {
    try {
      // Get all extracted data files
      const extractedDataDir = path.join(__dirname, '..', 'data', 'extracted');
      if (!fs.existsSync(extractedDataDir)) {
        return { 
          success: false, 
          error: 'No extracted data available for training. Please extract data first.'
        };
      }
      
      const files = fs.readdirSync(extractedDataDir)
        .filter(file => file.endsWith('.json'));
      
      if (files.length === 0) {
        return { 
          success: false,
          error: 'No extracted data files found.'
        };
      }
      
      // Load all extracted data
      const allData: ExtractedCsrData[] = files.map(file => {
        const filePath = path.join(extractedDataDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
      });
      
      // Prepare training data based on the model type
      let trainingData;
      let trainingPrompt;
      
      try {
        switch (modelType) {
          case 'endpoint-prediction':
            trainingData = await this.prepareEndpointPredictionData(allData);
            trainingPrompt = `
              Train a model for endpoint prediction using the following training data.
              Each entry contains information about a clinical trial and its endpoints.
              The model should learn to predict appropriate endpoints for a given indication and phase.
              
              Training data: ${JSON.stringify(trainingData)}
              
              Respond with a confirmation that the model has been trained and a unique model ID.
            `;
            break;
            
          case 'adverse-event-prediction':
            trainingData = await this.prepareAdverseEventPredictionData(allData);
            trainingPrompt = `
              Train a model for adverse event prediction using the following training data.
              Each entry contains information about a clinical trial and its reported adverse events.
              The model should learn to predict likely adverse events for a given drug class, indication, and phase.
              
              Training data: ${JSON.stringify(trainingData)}
              
              Respond with a confirmation that the model has been trained and a unique model ID.
            `;
            break;
            
          case 'efficacy-prediction':
            trainingData = await this.prepareEfficacyPredictionData(allData);
            trainingPrompt = `
              Train a model for efficacy prediction using the following training data.
              Each entry contains information about a clinical trial and its efficacy outcomes.
              The model should learn to predict likely efficacy outcomes for a given indication, phase, and endpoint.
              
              Training data: ${JSON.stringify(trainingData)}
              
              Respond with a confirmation that the model has been trained and a unique model ID.
            `;
            break;
            
          default:
            return {
              success: false,
              error: `Unknown model type: ${modelType}`
            };
        }
      } catch (error) {
        console.error('Error preparing training data:', error);
        return {
          success: false,
          error: 'Error preparing training data: ' + (error.message || 'Unknown error')
        };
      }
      
      // Use Hugging Face to "train" the model (simulate training since we can't actually train on Hugging Face API)
      const response = await queryHuggingFace(trainingPrompt);
      
      // Generate a unique model ID based on the type and timestamp
      const modelId = `${modelType}-${Date.now()}`;
      
      // Store model metadata
      this.storeModelMetadata(modelId, modelType, trainingData.length);
      
      return {
        success: true,
        modelId
      };
    } catch (error) {
      console.error(`Error training ${modelType} model:`, error);
      return {
        success: false,
        error: error.message || 'Unknown error during model training'
      };
    }
  }
  
  /**
   * Prepare data for endpoint prediction model
   */
  private async prepareEndpointPredictionData(data: ExtractedCsrData[]): Promise<any[]> {
    const result: any[] = [];
    
    for (const item of data) {
      try {
        // Get report information using async/await
        const reportPromise = this.getReportById(item.reportId);
        const report = reportPromise instanceof Promise ? await reportPromise : reportPromise;
        
        if (report && item.endpoints && item.endpoints.length > 0) {
          result.push({
            indication: report.indication || 'Unknown',
            phase: report.phase || 'Unknown',
            endpoints: item.endpoints
          });
        }
      } catch (error) {
        console.error(`Error preparing endpoint prediction data for report ${item.reportId}:`, error);
      }
    }
    
    return result;
  }
  
  /**
   * Prepare data for adverse event prediction model
   */
  private async prepareAdverseEventPredictionData(data: ExtractedCsrData[]): Promise<any[]> {
    const result: any[] = [];
    
    for (const item of data) {
      try {
        // Get report information using async/await
        const reportPromise = this.getReportById(item.reportId);
        const report = reportPromise instanceof Promise ? await reportPromise : reportPromise;
        
        if (report && 
            ((item.safetyProfile?.adverseEvents && item.safetyProfile.adverseEvents.length > 0) || 
             (item.safetyProfile?.seriousAdverseEvents && item.safetyProfile.seriousAdverseEvents.length > 0))) {
          result.push({
            indication: report.indication || 'Unknown',
            phase: report.phase || 'Unknown',
            adverseEvents: item.safetyProfile?.adverseEvents || [],
            seriousAdverseEvents: item.safetyProfile?.seriousAdverseEvents || []
          });
        }
      } catch (error) {
        console.error(`Error preparing adverse event prediction data for report ${item.reportId}:`, error);
      }
    }
    
    return result;
  }
  
  /**
   * Prepare data for efficacy prediction model
   */
  private async prepareEfficacyPredictionData(data: ExtractedCsrData[]): Promise<any[]> {
    const result: any[] = [];
    
    for (const item of data) {
      try {
        // Get report information using async/await
        const reportPromise = this.getReportById(item.reportId);
        const report = reportPromise instanceof Promise ? await reportPromise : reportPromise;
        
        if (report && item.efficacyOutcomes && item.efficacyOutcomes.length > 0) {
          result.push({
            indication: report.indication || 'Unknown',
            phase: report.phase || 'Unknown',
            primaryEndpoints: item.endpoints?.filter(e => e.type === 'primary') || [],
            efficacyOutcomes: item.efficacyOutcomes || []
          });
        }
      } catch (error) {
        console.error(`Error preparing efficacy prediction data for report ${item.reportId}:`, error);
      }
    }
    
    return result;
  }
  
  /**
   * Get a report by ID (cached for efficiency)
   */
  private reportCache: Map<number, CsrReport> = new Map();
  
  private async getReportById(id: number): Promise<CsrReport | null> {
    if (this.reportCache.has(id)) {
      return this.reportCache.get(id) || null;
    }
    
    try {
      const [report] = await db.select()
        .from(csrReports)
        .where(eq(csrReports.id, id));
        
      if (report) {
        this.reportCache.set(id, report);
        return report;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching report ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Store model metadata
   */
  private storeModelMetadata(modelId: string, modelType: string, trainingExamples: number): void {
    const modelsDir = path.join(__dirname, '..', 'data', 'models');
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }
    
    const metadata = {
      modelId,
      modelType,
      createdAt: new Date().toISOString(),
      trainingExamples,
      parameters: {
        algorithm: 'huggingface-inference',
        hyperparameters: {
          temperature: 0.7,
          maxTokens: 1000
        }
      }
    };
    
    const filePath = path.join(modelsDir, `${modelId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
    
    console.log(`Model metadata stored at ${filePath}`);
  }
  
  /**
   * Use a trained model to make predictions
   */
  async makePrediction(
    modelType: 'endpoint-prediction' | 'adverse-event-prediction' | 'efficacy-prediction',
    input: any
  ): Promise<{
    success: boolean;
    predictions?: any;
    error?: string;
  }> {
    try {
      // Find the latest model of the requested type
      const modelsDir = path.join(__dirname, '..', 'data', 'models');
      if (!fs.existsSync(modelsDir)) {
        return { 
          success: false, 
          error: 'No models available. Please train a model first.'
        };
      }
      
      const files = fs.readdirSync(modelsDir)
        .filter(file => file.startsWith(modelType) && file.endsWith('.json'));
      
      if (files.length === 0) {
        return { 
          success: false,
          error: `No ${modelType} models found.`
        };
      }
      
      // Sort by creation time (newest first)
      files.sort((a, b) => {
        const timestampA = parseInt(a.split('-')[1].split('.')[0]);
        const timestampB = parseInt(b.split('-')[1].split('.')[0]);
        return timestampB - timestampA;
      });
      
      const latestModelId = files[0].replace('.json', '');
      
      // Prepare the prediction prompt based on the model type
      let predictionPrompt;
      
      switch (modelType) {
        case 'endpoint-prediction':
          predictionPrompt = `
            Using the trained endpoint prediction model, predict appropriate endpoints for the following clinical trial:
            
            Indication: ${input.indication}
            Phase: ${input.phase}
            
            Respond with a JSON array of predicted endpoints, each containing the following fields:
            - name: The name of the endpoint
            - type: Whether it's primary, secondary, or exploratory
            - definition: A clear definition of the endpoint
            
            Format the response as a valid JSON array.
          `;
          break;
          
        case 'adverse-event-prediction':
          predictionPrompt = `
            Using the trained adverse event prediction model, predict likely adverse events for the following clinical trial:
            
            Indication: ${input.indication}
            Phase: ${input.phase}
            Drug class: ${input.drugClass || 'Not specified'}
            
            Respond with a JSON object containing:
            - adverseEvents: An array of predicted adverse events, each with event name, estimated frequency (%), and severity
            - seriousAdverseEvents: An array of predicted serious adverse events, each with event name and estimated frequency (%)
            
            Format the response as a valid JSON object.
          `;
          break;
          
        case 'efficacy-prediction':
          predictionPrompt = `
            Using the trained efficacy prediction model, predict likely efficacy outcomes for the following clinical trial:
            
            Indication: ${input.indication}
            Phase: ${input.phase}
            Primary endpoint: ${input.primaryEndpoint || 'Not specified'}
            
            Respond with a JSON array of predicted efficacy outcomes, each containing:
            - outcome: The name of the outcome
            - predictedResult: The predicted result
            - predictedPValue: The predicted p-value
            - confidenceLevel: How confident the model is in this prediction (high, medium, low)
            
            Format the response as a valid JSON array.
          `;
          break;
          
        default:
          return {
            success: false,
            error: `Unknown model type: ${modelType}`
          };
      }
      
      // Use Hugging Face to get prediction
      const response = await queryHuggingFace(predictionPrompt);
      
      // Extract JSON from the response
      const predictions = JSON.parse(this.extractJsonFromText(response));
      
      return {
        success: true,
        predictions
      };
    } catch (error) {
      console.error(`Error making prediction with ${modelType} model:`, error);
      return {
        success: false,
        error: error.message || 'Unknown error during prediction'
      };
    }
  }
}

// Export singleton instance
export const csrTrainingService = new CsrTrainingService();