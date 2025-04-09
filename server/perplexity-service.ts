/**
 * Perplexity AI API service for natural language processing and question answering
 */

import { CsrReport, CsrDetails } from '@shared/schema';

// Configuration for the Perplexity API
const API_URL = 'https://api.perplexity.ai/chat/completions';

interface PerplexityRequestMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityRequest {
  model: string;
  messages: PerplexityRequestMessage[];
  max_tokens?: number;
  temperature: number;
  top_p?: number;
  top_k?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
}

interface PerplexityResponseChoice {
  index: number;
  finish_reason: string;
  message: {
    role: string;
    content: string;
  };
}

interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  choices: PerplexityResponseChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  citations?: string[];
}

/**
 * PerplexityAI Service for natural language processing and question answering
 */
export class PerplexityService {
  private apiKey: string | null;
  private defaultModel = 'llama-3.1-sonar-small-128k-online';

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || null;
  }

  /**
   * Check if the API key is available
   * @returns True if API key is available, false otherwise
   */
  isApiKeyAvailable(): boolean {
    return this.apiKey !== null && this.apiKey !== '';
  }

  /**
   * Make a request to the Perplexity API
   * @param messages Array of messages to send to the API
   * @param temperature Temperature setting for the model (0.0 to 1.0)
   * @param model The model to use (default: llama-3.1-sonar-small-128k-online)
   * @returns The response from the API
   */
  async makeRequest(
    messages: PerplexityRequestMessage[],
    temperature = 0.2,
    model = this.defaultModel
  ): Promise<PerplexityResponse> {
    if (!this.isApiKeyAvailable()) {
      throw new Error('Perplexity API key not found. Please set the PERPLEXITY_API_KEY environment variable.');
    }

    const requestData: PerplexityRequest = {
      model,
      messages,
      temperature,
      top_p: 0.9,
      stream: false,
      presence_penalty: 0,
      frequency_penalty: 1,
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
      }

      return await response.json() as PerplexityResponse;
    } catch (error) {
      console.error('Error calling Perplexity API:', error);
      throw error;
    }
  }

  /**
   * Generate a summary of a clinical study report
   * @param reportText The text content of the report
   * @returns A concise summary of the report
   */
  async generateSummary(reportText: string): Promise<string> {
    const messages: PerplexityRequestMessage[] = [
      {
        role: 'system',
        content: `You are an expert at summarizing clinical study reports (CSRs). 
        Create a clear, structured, and concise summary that highlights the key aspects of the study.
        Focus on study design, objectives, endpoints, patient population, and important results.`
      },
      {
        role: 'user',
        content: `Summarize the following clinical study report text:
        
        ${reportText.slice(0, 12000)}` // Truncate to avoid token limits
      }
    ];

    const response = await this.makeRequest(messages, 0.2);
    return response.choices[0].message.content;
  }

  /**
   * Extract key information from a clinical study report
   * @param reportText The text content of the report
   * @returns Structured data extracted from the report
   */
  async extractCSRData(reportText: string): Promise<Partial<CsrDetails>> {
    const messages: PerplexityRequestMessage[] = [
      {
        role: 'system',
        content: `You are an expert at analyzing clinical study reports (CSRs).
        Extract structured information from the CSR text in JSON format with the following fields:
        - studyDesign: the overall design of the study (e.g., randomized, double-blind, etc.)
        - primaryObjective: the main goal of the study
        - inclusionCriteria: key criteria for patient inclusion
        - exclusionCriteria: key criteria for patient exclusion
        - treatmentArms: array of treatment groups with descriptions
        - studyDuration: how long the study ran
        - endpoints: object with primary and secondary endpoints
        - safety: object with key safety findings
        - sampleSize: total number of participants
        - ageRange: range of participant ages
        - statisticalMethods: array of statistical methods used
        
        Return valid JSON only, with no additional text.`
      },
      {
        role: 'user',
        content: `Extract key information from the following clinical study report:
        
        ${reportText.slice(0, 12000)}` // Truncate to avoid token limits
      }
    ];

    try {
      const response = await this.makeRequest(messages, 0.1);
      
      // Parse the response as JSON
      const extractedData = JSON.parse(response.choices[0].message.content);
      
      return {
        studyDesign: extractedData.studyDesign,
        primaryObjective: extractedData.primaryObjective,
        inclusionCriteria: extractedData.inclusionCriteria,
        exclusionCriteria: extractedData.exclusionCriteria,
        treatmentArms: extractedData.treatmentArms,
        studyDuration: extractedData.studyDuration,
        endpoints: extractedData.endpoints,
        safety: extractedData.safety,
        sampleSize: extractedData.sampleSize ? parseInt(extractedData.sampleSize, 10) : undefined,
        ageRange: extractedData.ageRange,
        statisticalMethods: extractedData.statisticalMethods
      };
    } catch (error) {
      console.error('Error extracting CSR data:', error);
      throw new Error('Failed to extract structured data from the report');
    }
  }

  /**
   * Generate a protocol based on historical trial data
   * @param indication The medical indication/condition
   * @param phase Trial phase
   * @param additionalContext Additional context for protocol generation
   * @returns Generated protocol outline
   */
  async generateProtocolOutline(
    indication: string,
    phase: string,
    additionalContext: string = ''
  ): Promise<string> {
    const messages: PerplexityRequestMessage[] = [
      {
        role: 'system',
        content: `You are an expert clinical trial protocol designer.
        Create a detailed protocol outline for the requested indication and phase.
        Include sections on study design, objectives, endpoints, eligibility criteria,
        treatments, assessments, statistical considerations, and ethical considerations.
        The protocol should follow ICH-GCP guidelines and regulatory requirements.`
      },
      {
        role: 'user',
        content: `Generate a clinical trial protocol outline for a ${phase} study in ${indication}.
        ${additionalContext ? `Additional context: ${additionalContext}` : ''}`
      }
    ];

    const response = await this.makeRequest(messages, 0.3);
    return response.choices[0].message.content;
  }

  /**
   * Compare two clinical trial reports and identify key differences
   * @param report1 First clinical trial report
   * @param report2 Second clinical trial report
   * @returns Detailed comparison with key similarities and differences
   */
  async compareTrialReports(
    report1: { title: string; content: string },
    report2: { title: string; content: string }
  ): Promise<string> {
    const messages: PerplexityRequestMessage[] = [
      {
        role: 'system',
        content: `You are an expert at analyzing and comparing clinical trials.
        Compare the two clinical trial reports provided and highlight key similarities and differences.
        Focus on study design, endpoints, patient populations, efficacy results, and safety profiles.
        Provide insights on implications of the differences and which study design might be more robust.`
      },
      {
        role: 'user',
        content: `Compare the following two clinical trial reports:

        TRIAL 1: ${report1.title}
        ${report1.content.slice(0, 6000)}

        TRIAL 2: ${report2.title}
        ${report2.content.slice(0, 6000)}`
      }
    ];

    const response = await this.makeRequest(messages, 0.2);
    return response.choices[0].message.content;
  }
}

// Export a singleton instance
export const perplexityService = new PerplexityService();