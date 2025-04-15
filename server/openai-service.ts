import OpenAI from 'openai';

// Initialize OpenAI client
// NOTE: the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyzes text using OpenAI's API
 * @param prompt The user prompt to analyze
 * @param systemPrompt Optional system prompt to guide the analysis
 * @param temperature Optional temperature parameter (default: 0.5)
 * @param maxTokens Optional max tokens parameter (default: 3000)
 * @returns The generated content
 */
export async function analyzeText(
  prompt: string,
  systemPrompt: string = "You are a helpful assistant specializing in clinical trial research and regulatory documentation.",
  temperature: number = 0.5,
  maxTokens: number = 3000
): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o", // Latest and most capable model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature,
      max_tokens: maxTokens
    });

    return response.choices[0].message.content || "";
  } catch (error: any) {
    console.error("Error in OpenAI service:", error);
    throw new Error(`OpenAI analysis failed: ${error.message}`);
  }
}

/**
 * Analyzes multiple sections of a protocol using OpenAI's API
 * @param sections Map of section names to their content
 * @param systemPrompt Optional system prompt to guide the analysis
 * @returns Object with responses for each section
 */
export async function analyzeProtocolSections(
  sections: Record<string, string>,
  systemPrompt: string = "You are a clinical protocol analysis expert."
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  
  try {
    // Process each section in parallel
    const sectionPromises = Object.entries(sections).map(async ([sectionName, content]) => {
      if (!content || content.trim() === '') {
        results[sectionName] = '';
        return;
      }
      
      const sectionPrompt = `Analyze the following ${sectionName} section from a clinical trial protocol and provide your expert assessment:\n\n${content}`;
      const result = await analyzeText(sectionPrompt, systemPrompt);
      results[sectionName] = result;
    });
    
    await Promise.all(sectionPromises);
    return results;
  } catch (error: any) {
    console.error("Error in protocol section analysis:", error);
    throw new Error(`Section analysis failed: ${error.message}`);
  }
}

export default {
  analyzeText,
  analyzeProtocolSections
};