import { queryHuggingFace, HFModel } from './huggingface-service';

// Use environment variables for API keys
const HF_API_KEY = process.env.HF_API_KEY;

/**
 * Study Design Agent service that leverages Hugging Face's Mixtral model
 * to provide study design advice and protocol optimization suggestions
 */
export class StudyDesignAgentService {
  
  /**
   * Generate a response from the Study Design Agent
   * 
   * @param message - User message/question
   * @param context - Optional CSR context to include
   * @returns AI response object
   */
  async getAgentResponse(message: string, context?: string): Promise<{ response: string }> {
    if (!HF_API_KEY) {
      throw new Error('Missing HF_API_KEY environment variable');
    }

    try {
      // Construct prompt with system instruction, optional context, and user message
      const promptText = this.constructPrompt(message, context);
      
      // Call Hugging Face API
      const response = await hf.textGeneration({
        model: MODEL_ID,
        inputs: promptText,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.4,
          top_p: 0.95,
          return_full_text: false
        }
      });

      // Extract and clean the response text
      const responseText = response.generated_text.trim();
      
      return { response: responseText };
    } catch (error) {
      console.error('Study Design Agent error:', error);
      throw new Error(`Failed to get response from AI: ${error.message}`);
    }
  }

  /**
   * Construct the prompt for the Study Design Agent
   */
  private constructPrompt(message: string, context?: string): string {
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
    
    // Add context if provided
    if (context) {
      fullPrompt += `RELEVANT CSR CONTEXT:\n${context}\n\n`;
    }
    
    // Add user message
    fullPrompt += `User: ${message}\n\nTrialSage:`;
    
    return fullPrompt;
  }
}

// Create and export a singleton instance
export const studyDesignAgentService = new StudyDesignAgentService();