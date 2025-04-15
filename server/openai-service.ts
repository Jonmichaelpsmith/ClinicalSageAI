import OpenAI from 'openai';
import pdfParse from 'pdf-parse';

// Initialize OpenAI client
// NOTE: the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Check if the OpenAI API key is available
 * @returns boolean indicating if the API key is configured
 */
export function isApiKeyAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Generate embeddings for a text using OpenAI
 * @param text Text to generate embeddings for
 * @returns Vector embedding
 */
export async function generateEmbeddings(text: string): Promise<number[]> {
  try {
    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generate a structured response from OpenAI
 * @param prompt The prompt to structure
 * @param systemPrompt Optional system prompt
 * @returns JSON structure
 */
export async function generateStructuredResponse(prompt: string, systemPrompt?: string): Promise<any> {
  try {
    const messages = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      { role: 'user' as const, content: prompt },
    ];
    
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: 'json_object' },
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating structured response:', error);
    throw new Error(`Failed to generate structured response: ${error instanceof Error ? error.message : String(error)}`);
  }
}

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

/**
 * Extract text from a PDF file
 * @param pdfBuffer PDF file buffer
 * @returns Extracted text content
 */
export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Analyze CSR content to extract structured data
 * @param text The CSR text content to analyze
 * @returns Structured analysis results
 */
export async function analyzeCsrContent(
  text: string
): Promise<any> {
  const systemPrompt = `
    You are a clinical study report (CSR) analysis expert. Analyze the provided CSR text and extract
    structured information about the study design, objectives, methods, endpoints, and results.
    Format your response as a structured JSON object.
  `;

  try {
    const response = await analyzeText(
      `Extract structured information from the following CSR text. Include the study design, 
      primary objective, inclusion/exclusion criteria, treatment arms, endpoints, sample size, 
      results, safety information, and any other key elements.
      
      CSR TEXT:
      ${text.substring(0, 8000)}`, // Limit text size to avoid token limits
      systemPrompt,
      0.2,
      4000
    );

    try {
      // Try to parse the response as JSON
      const jsonResponse = JSON.parse(response);
      return {
        studyDesign: jsonResponse.studyDesign || null,
        primaryObjective: jsonResponse.primaryObjective || null,
        inclusionCriteria: jsonResponse.inclusionCriteria || null,
        exclusionCriteria: jsonResponse.exclusionCriteria || null,
        treatmentArms: jsonResponse.treatmentArms || [],
        endpoints: jsonResponse.endpoints || [],
        sampleSize: jsonResponse.sampleSize || null,
        results: jsonResponse.results || {},
        safety: jsonResponse.safety || {},
        studyDuration: jsonResponse.studyDuration || null,
        ageRange: jsonResponse.ageRange || null,
        gender: jsonResponse.gender || {},
        statisticalMethods: jsonResponse.statisticalMethods || [],
        adverseEvents: jsonResponse.adverseEvents || [],
        efficacyResults: jsonResponse.efficacyResults || {},
        saeCount: jsonResponse.saeCount || null,
        teaeCount: jsonResponse.teaeCount || null,
        completionRate: jsonResponse.completionRate || null,
      };
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", parseError);
      // Return an empty result object with default structure
      return {
        studyDesign: null,
        primaryObjective: null,
        inclusionCriteria: null,
        exclusionCriteria: null,
        treatmentArms: [],
        endpoints: [],
        sampleSize: null,
        results: {},
        safety: {},
        studyDuration: null,
        ageRange: null,
        gender: {},
        statisticalMethods: [],
        adverseEvents: [],
        efficacyResults: {},
        saeCount: null,
        teaeCount: null,
        completionRate: null,
      };
    }
  } catch (error) {
    console.error("Error in analyzeCsrContent:", error);
    throw error;
  }
}

/**
 * Generate a concise summary of a CSR document
 * @param text The CSR text content to summarize
 * @returns A summary of the CSR
 */
export async function generateCsrSummary(text: string): Promise<string> {
  const systemPrompt = `
    You are a clinical study report (CSR) summarization expert. Create a concise yet comprehensive 
    summary of the provided CSR text focusing on the key aspects of the study design, 
    objectives, methods, results, and conclusions.
  `;

  try {
    const response = await analyzeText(
      `Generate a concise summary (about 250-500 words) of the following clinical study report. 
      Focus on the study design, objectives, key findings, and conclusions.
      
      CSR TEXT:
      ${text.substring(0, 8000)}`, // Limit text size to avoid token limits
      systemPrompt,
      0.5,
      1000
    );

    return response;
  } catch (error) {
    console.error("Error in generateCsrSummary:", error);
    throw error;
  }
}

export default {
  analyzeText,
  analyzeProtocolSections,
  extractTextFromPdf,
  analyzeCsrContent,
  generateCsrSummary,
  isApiKeyAvailable,
  generateEmbeddings,
  generateStructuredResponse
};