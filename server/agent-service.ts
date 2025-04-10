import { queryHuggingFace, HFModel } from './huggingface-service';
import * as fs from 'fs';
import * as path from 'path';

// Use environment variables for API keys
const HF_API_KEY = process.env.HF_API_KEY;

/**
 * Study Design Agent service that leverages Hugging Face's Mixtral model
 * to provide study design advice and protocol optimization suggestions
 */
export class StudyDesignAgentService {
  private readonly processedCsrDir = path.join(process.cwd(), 'data/processed_csrs');
  private readonly logFile = path.join(process.cwd(), 'data/agent_logs.jsonl');
  
  constructor() {
    // Ensure log directory exists
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }
  
  /**
   * Generate a response from the Study Design Agent
   * 
   * @param message - User message/question
   * @param csrIds - Optional array of CSR IDs to use as context
   * @returns AI response object
   */
  async getAgentResponse(message: string, csrIds: string[] = []): Promise<{ response: string }> {
    if (!HF_API_KEY) {
      throw new Error('Missing HF_API_KEY environment variable');
    }

    try {
      // Get context from CSRs if IDs are provided
      const csrContext = await this.getCsrContext(csrIds);
      
      // Construct prompt with system instruction, optional context, and user message
      const promptText = this.constructPrompt(message, csrContext);
      
      // Call Hugging Face API via our service
      const responseText = await queryHuggingFace(
        promptText,
        HFModel.TEXT,  // Using Mixtral model defined in huggingface-service.ts
        0.4,           // Temperature
        500            // Max tokens
      );
      
      // Log the interaction
      this.logInteraction(message, csrIds, responseText, csrContext);
      
      return { response: responseText };
    } catch (error: any) {
      console.error('Study Design Agent error:', error);
      throw new Error(`Failed to get response from AI: ${error.message}`);
    }
  }
  
  /**
   * Log the agent interaction for future analysis and training
   */
  private logInteraction(
    message: string, 
    csrIds: string[], 
    response: string,
    context?: string
  ): void {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        message,
        csrIds,
        response,
        hasContext: !!context
      };
      
      // Append to JSONL file
      fs.appendFileSync(
        this.logFile, 
        JSON.stringify(logEntry) + '\n',
        'utf8'
      );
    } catch (error) {
      // Log but don't break on logging errors
      console.warn('Failed to log agent interaction:', error);
    }
  }

  /**
   * Get context information from CSR files
   * 
   * @param csrIds Array of CSR IDs to load
   * @returns Formatted context text
   */
  private async getCsrContext(csrIds: string[]): Promise<string> {
    if (csrIds.length === 0) {
      return '';
    }
    
    const contextBlocks: string[] = [];
    
    for (const csrId of csrIds) {
      try {
        const filePath = path.join(this.processedCsrDir, `${csrId}.json`);
        
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const csr = JSON.parse(fileContent);
          
          // Extract key information from the CSR
          const summary = csr.vector_summary || '';
          
          if (summary) {
            contextBlocks.push(`[${csrId}] ${summary}`);
          }
        }
      } catch (error) {
        console.warn(`Error loading CSR ${csrId}:`, error);
        // Continue with other CSRs
      }
    }
    
    return contextBlocks.length > 0 ? contextBlocks.join('\n\n') : '';
  }

  /**
   * Construct the prompt for the Study Design Agent
   */
  private constructPrompt(message: string, csrContext: string): string {
    // Base system prompt with instructions for the agent
    const systemPrompt = `You are TrialSage, an expert AI assistant trained on 5,000+ clinical study reports (CSRs). 
Your job is to help clinical teams design better trials by:
- Recommending endpoints based on successful trials in similar indications
- Suggesting study arms or dose ranges based on precedent
- Highlighting precedent examples from relevant CSRs
- Warning of common regulatory pitfalls
- Advising on inclusion/exclusion criteria
- Providing statistical power considerations

Answer questions clearly and concisely in a professional tone. Base your answers on established clinical trial practices and regulatory expectations.`;

    // Construct the full prompt
    let fullPrompt = systemPrompt + '\n\n';
    
    // Add CSR context if provided
    if (csrContext) {
      fullPrompt += `RELEVANT CSR CONTEXT:\n${csrContext}\n\n`;
    }
    
    // Add user message
    fullPrompt += `User: ${message}\n\nTrialSage:`;
    
    return fullPrompt;
  }
}

// Create and export a singleton instance
export const studyDesignAgentService = new StudyDesignAgentService();