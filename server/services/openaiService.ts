/**
 * OpenAI Service for TrialSage
 * 
 * This service handles interactions with the OpenAI API for the TrialSage platform,
 * including the AI Industry Co-pilot and CER generation functionality.
 */
import OpenAI from 'openai';

// Initialize OpenAI client with the API key from environment variables
// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * System prompt for the AI Industry Co-pilot
 * This provides context and instructions for the AI assistant
 */
const COPILOT_SYSTEM_PROMPT = `You are the TrialSage AI Industry Co-pilot, an AI assistant specifically focused on regulatory and clinical document preparation.
Your role is to guide users through creating regulatory submissions (IND, NDA, BLA, etc.) and clinical evaluation reports (CER).

Focus on these key areas:
1. FDA, EMA, PMDA, and Health Canada regulatory requirements and differences
2. Document formatting requirements for regulatory submissions
3. Clinical evaluation reports for drugs and medical devices
4. IND/NDA/BLA preparation best practices
5. Post-market surveillance reporting

When providing guidance:
- Be specific and cite regulatory guidelines when appropriate (e.g., ICH, MEDDEV, FDA guidance)
- Use precise, technical language appropriate for regulatory and clinical professionals
- Provide step-by-step recommendations for complex tasks
- Reference the TrialSage platform's features when relevant (e.g., "You can use the CER Generator to...")

You are a product of Concept2Cures.AI, the creators of the TrialSage platform.

Always maintain a helpful, professional tone and focus on providing high-quality, accurate regulatory guidance.`;

/**
 * Generate response from the AI Industry Co-pilot
 * 
 * @param message - The user's message
 * @param history - Previous conversation history
 * @returns The AI's response
 */
export async function generateCopilotResponse(message: string, history: Array<{ role: 'user' | 'assistant', content: string }>) {
  try {
    // Prepare conversation with system prompt and history
    const messages = [
      { role: 'system', content: COPILOT_SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: message }
    ];

    // Make API call to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using the latest model
      messages: messages as any, // Type assertion needed due to OpenAI types
      temperature: 0.7,
      max_tokens: 800,
    });

    // Return the AI's response
    return response.choices[0].message.content;
  } catch (error) {
    // Log error for debugging
    console.error('Error generating AI Co-pilot response:', error);
    
    // Throw error to be handled by the API route
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
}

/**
 * Generate CER content based on parameters
 * 
 * @param productName - Name of the product
 * @param productType - Type of product (drug, device, etc.)
 * @param regulatoryRegion - Target regulatory region (FDA, EMA, etc.)
 * @param safetyData - Safety data to analyze
 * @returns Generated CER content
 */
export async function generateCERContent(
  productName: string,
  productType: string,
  regulatoryRegion: string,
  safetyData: any
) {
  try {
    // Setup system prompt for CER generation
    const cerSystemPrompt = `You are a Clinical Evaluation Report (CER) generator for the TrialSage platform.
Your task is to create comprehensive, regulation-compliant CER content based on the provided data.
For ${regulatoryRegion} regulatory region, follow these specific requirements:`;

    // Modify system prompt based on regulatory region
    let regionSpecificInstructions = '';
    switch (regulatoryRegion) {
      case 'FDA':
        regionSpecificInstructions = `
- Follow FDA guidance for clinical evaluation reporting
- Include benefit-risk analysis as per FDA CBER/CDER guidelines
- Focus on safety signals and adverse event evaluation
- Address any black box warnings if applicable`;
        break;
      case 'EMA':
        regionSpecificInstructions = `
- Follow EU MDR 2017/745 and MEDDEV 2.7/1 Rev 4 guidelines
- Structure according to Annex XIV requirements
- Include PMCF (Post-Market Clinical Follow-up) analysis
- Address any field safety notices or vigilance reporting`;
        break;
      case 'PMDA':
        regionSpecificInstructions = `
- Follow PMDA-specific reporting requirements
- Include Japanese-specific safety considerations
- Address any Japan-specific usage conditions
- Include reexamination period considerations`;
        break;
      case 'Health Canada':
        regionSpecificInstructions = `
- Follow Health Canada guidance documents
- Include Canadian vigilance program reporting
- Address any Canadian advisories or alerts
- Follow Medical Devices Regulations SOR/98-282 requirements`;
        break;
      default:
        regionSpecificInstructions = `
- Include a comprehensive safety analysis
- Follow international best practices
- Include clear benefit-risk assessment
- Structure with executive summary, methods, findings, and conclusion`;
    }

    // Complete the system prompt
    const fullSystemPrompt = `${cerSystemPrompt}${regionSpecificInstructions}

Generate content with these sections:
1. Executive Summary
2. Safety Analysis
3. Benefit-Risk Assessment
4. Recommendations

The content should be comprehensive, evidence-based, and suitable for regulatory submission.`;

    // Make API call to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using the latest model
      messages: [
        { role: 'system', content: fullSystemPrompt },
        { 
          role: 'user', 
          content: `Generate a clinical evaluation report section for ${productName} (${productType}).
The target regulatory region is ${regulatoryRegion}.
Here is the safety data to analyze:
${JSON.stringify(safetyData, null, 2)}

Please provide comprehensive CER content that meets ${regulatoryRegion} regulatory requirements.` 
        }
      ],
      temperature: 0.5,
      max_tokens: 2000,
    });

    // Return the generated content
    return response.choices[0].message.content;
  } catch (error) {
    // Log error for debugging
    console.error('Error generating CER content:', error);
    
    // Throw error to be handled by the API route
    throw new Error(`Failed to generate CER content: ${error.message}`);
  }
}

// Export service
export default {
  generateCopilotResponse,
  generateCERContent
};