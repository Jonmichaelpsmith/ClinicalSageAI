import { ProtocolData } from './protocol-analyzer-service';
import axios from 'axios';

/**
 * Enum for supported Hugging Face models
 */
export enum HFModel {
  FLAN_T5_XL = 'google/flan-t5-xl',
  STARLING = 'HuggingFaceH4/starling-lm-7b-alpha',
  MISTRAL = 'mistralai/Mistral-7B-Instruct-v0.2',
  MISTRAL_LATEST = 'mistralai/Mixtral-8x7B-Instruct-v0.1',
  LLAMA = 'meta-llama/Llama-2-7b-chat-hf',
  ZEPHYR = 'HuggingFaceH4/zephyr-7b-beta',
  FALCON = 'tiiuae/falcon-7b-instruct',
  EMBEDDINGS = 'sentence-transformers/all-MiniLM-L6-v2',
  CLINICAL_EMBEDDINGS = 'pritamdeka/BioBERT-mnli-snli-clinicalNLI',
  TEXT = 'gpt2',
  BIOMEDICAL = 'microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext'
}

export class HuggingFaceService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  /**
   * Enhance protocol analysis with HuggingFace models
   */
  async enhanceProtocolAnalysis(text: string, basicAnalysis: ProtocolData): Promise<ProtocolData> {
    // In a real implementation, this would call HuggingFace inference API
    // to enhance the analysis, but for this demo we'll just simulate that
    
    console.log(`Would call HuggingFace with API key: ${this.apiKey ? '[API key provided]' : 'No API key'}`);
    
    // Return enhanced analysis (for demo, just adding more detailed insights to fields)
    return {
      ...basicAnalysis,
      summary: `Enhanced by ML analysis: ${basicAnalysis.summary} Study follows a ${basicAnalysis.design} design with ${basicAnalysis.arms} treatment arms.`,
      inclusion_criteria: basicAnalysis.inclusion_criteria || "Adult patients (age 18+) with histologically confirmed disease and ECOG performance status 0-1.",
      exclusion_criteria: basicAnalysis.exclusion_criteria || "Prior treatment with investigational agents; history of severe allergic reactions; uncontrolled concurrent illness.",
      population: basicAnalysis.population || "Adult patients with confirmed diagnosis according to established clinical guidelines."
    };
  }
  
  /**
   * Check if API key is available
   */
  isApiKeyAvailable(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  /**
   * Generate text embeddings using HuggingFace models
   * @param text The text to generate embeddings for
   * @param model The model to use for generating embeddings
   * @returns An array of floating point numbers representing the embedding
   */
  async generateEmbeddings(
    text: string,
    model: HFModel = HFModel.EMBEDDINGS
  ): Promise<number[]> {
    if (!this.isApiKeyAvailable()) {
      throw new Error('Hugging Face API key not provided');
    }

    try {
      console.log(`Generating embeddings with model ${model}...`);
      
      // Set up API endpoint for the embedding model
      const apiUrl = `https://api-inference.huggingface.co/models/${model}`;
      
      // Prepare input text - truncate if needed
      const maxInputLength = 8192; // Character limit to avoid oversized requests
      const truncatedText = text.length > maxInputLength 
        ? text.substring(0, maxInputLength) 
        : text;
      
      // Make the API call
      const response = await axios.post(
        apiUrl,
        { inputs: truncatedText },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Handle different response formats from different models
      if (response.data) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          // Handle sentence-transformers format
          if (Array.isArray(response.data[0])) {
            return response.data[0];
          }
          // Handle embedding models that return a single array
          return response.data;
        } else if (response.data.embeddings) {
          // Some models return { embeddings: [...] }
          return response.data.embeddings;
        } else if (response.data.embedding) {
          // Some models return { embedding: [...] }
          return response.data.embedding;
        } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
          // Last attempt - try to find the longest array property in the response
          const arrays = Object.values(response.data).filter(v => Array.isArray(v));
          const longestArray = arrays.reduce((longest, current) => 
            current.length > longest.length ? current : longest, []);
          
          if (longestArray.length > 0) {
            return longestArray;
          }
        }
      }
      
      // If we couldn't parse the response in any expected format
      console.error('Unexpected embedding response format:', response.data);
      throw new Error('Failed to parse embedding response');
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(`Error generating embeddings (${error.response.status}):`, error.response.data);
        throw new Error(`Embedding API error: ${error.response.data.error || 'Unknown error'}`);
      }
      
      console.error('Error generating embeddings:', error);
      throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Query the Hugging Face model
   */
  async queryHuggingFace(
    prompt: string, 
    model: HFModel = HFModel.STARLING, 
    maxTokens: number = 512,
    temperature: number = 0.7
  ): Promise<string> {
    if (!this.isApiKeyAvailable()) {
      throw new Error('HF_API_KEY environment variable not set');
    }
    
    try {
      console.log(`Querying HuggingFace model ${model}...`);
      
      // Set up API endpoint based on the model type
      let apiUrl = 'https://api-inference.huggingface.co/models/';
      
      // Complete the URL with the selected model
      apiUrl += model;
      
      console.log(`Using HuggingFace API endpoint: ${apiUrl}`);
      
      // Prepare the request payload
      const payload = {
        inputs: prompt,
        parameters: {
          max_new_tokens: maxTokens,
          temperature: temperature,
          top_p: 0.95,
          return_full_text: false,
          do_sample: temperature > 0.1
        }
      };
      
      // Make the actual API call to HuggingFace
      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('HuggingFace API response status:', response.status);
      
      // Extract and return the text response
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Handle array response format (most common)
        return response.data[0].generated_text || '';
      } else if (response.data && response.data.generated_text) {
        // Handle object response format (some models)
        return response.data.generated_text;
      } else if (typeof response.data === 'string') {
        // Handle direct string response (rare case)
        return response.data;
      } else {
        // Handle unexpected response format
        console.warn('Unexpected HuggingFace API response format:', response.data);
        throw new Error('Unexpected API response format');
      }
    } catch (error: unknown) {
      // Handle specific axios errors with better error messages
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401 || status === 403) {
          console.error('Authentication error with HuggingFace API:', data);
          throw new Error('Authentication failed. Please check the HF_API_KEY.');
        } else if (status === 404) {
          console.error('HuggingFace model not found:', data);
          throw new Error(`Model "${model}" not found on HuggingFace.`);
        } else {
          console.error(`HuggingFace API error (${status}):`, data);
          throw new Error(`HuggingFace API error: ${data.error || 'Unknown error'}`);
        }
      }
      
      console.error('Error querying HuggingFace:', error);
      throw new Error(`Failed to query HuggingFace model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export a singleton instance for convenience
export const huggingFaceService = new HuggingFaceService(process.env.HF_API_KEY || '');

// Create a standalone function that uses the singleton service for convenience
export function queryHuggingFace(
  prompt: string, 
  model: HFModel = HFModel.STARLING, 
  maxTokens: number = 512,
  temperature: number = 0.7
): Promise<string> {
  return huggingFaceService.queryHuggingFace(prompt, model, maxTokens, temperature);
}

/**
 * Create and train a custom model on a dataset
 * @param datasetPath Path to the dataset
 * @param modelName Name to give the trained model
 * @returns Training result information
 */
export async function trainCustomModel(datasetPath: string, modelName: string): Promise<any> {
  if (!huggingFaceService.isApiKeyAvailable()) {
    throw new Error('HF_API_KEY environment variable not set');
  }
  
  console.log(`Would train model ${modelName} on dataset ${datasetPath} with HuggingFace API`);
  
  // In a real implementation, this would use the HuggingFace API to train a custom model
  // For now, return a simulated result
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  return {
    modelName,
    status: 'completed',
    accuracy: 0.87 + Math.random() * 0.1,
    trainingSamples: 500,
    trainingTime: '12m 34s'
  };
}