import OpenAI from "openai";
import { 
  ThreadMessage, 
  Assistant,
  Run,
  Thread
} from "openai/resources";

// Initialize OpenAI client
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not defined in the environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Create a new OpenAI Assistant
 */
export async function createAssistant(
  name: string,
  instructions: string,
  tools: any[] = []
): Promise<Assistant> {
  try {
    const assistant = await openai.beta.assistants.create({
      name,
      instructions,
      tools,
      model: "gpt-4o",
    });
    
    console.log(`Created assistant with ID: ${assistant.id}`);
    return assistant;
  } catch (error) {
    console.error("Error creating assistant:", error);
    throw error;
  }
}

/**
 * Create a new thread for an assistant conversation
 */
export async function createThread(): Promise<Thread> {
  try {
    const thread = await openai.beta.threads.create();
    console.log(`Created thread with ID: ${thread.id}`);
    return thread;
  } catch (error) {
    console.error("Error creating thread:", error);
    throw error;
  }
}

/**
 * Add a message to an existing thread
 */
export async function addMessageToThread(
  threadId: string,
  content: string
): Promise<ThreadMessage> {
  try {
    const message = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content,
    });
    return message;
  } catch (error) {
    console.error("Error adding message to thread:", error);
    throw error;
  }
}

/**
 * Run an assistant on a thread
 */
export async function runAssistant(
  threadId: string, 
  assistantId: string
): Promise<Run> {
  try {
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });
    return run;
  } catch (error) {
    console.error("Error running assistant:", error);
    throw error;
  }
}

/**
 * Get the status of a run
 */
export async function getRunStatus(
  threadId: string,
  runId: string
): Promise<Run> {
  try {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    return run;
  } catch (error) {
    console.error("Error getting run status:", error);
    throw error;
  }
}

/**
 * List messages in a thread
 */
export async function listMessages(threadId: string): Promise<{
  data: ThreadMessage[];
  firstId: string | null;
  lastId: string | null;
  hasMore: boolean;
}> {
  try {
    const messages = await openai.beta.threads.messages.list(threadId);
    return {
      data: messages.data,
      firstId: messages.first_id || null,
      lastId: messages.last_id || null,
      hasMore: messages.has_more,
    };
  } catch (error) {
    console.error("Error listing messages:", error);
    throw error;
  }
}

/**
 * Generate a structured response using the OpenAI Responses API
 * This uses the newer Responses API for more structured outputs
 */
export async function generateStructuredResponse<T>(
  prompt: string,
  systemPrompt: string
): Promise<T> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.responses.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    // Parse the response text as JSON
    try {
      // If the response is not in JSON format, this will throw an error
      return JSON.parse(response.output_text) as T;
    } catch (jsonError) {
      console.error("Error parsing response as JSON:", jsonError);
      throw new Error("The response was not in valid JSON format");
    }
  } catch (error) {
    console.error("Error generating structured response:", error);
    throw error;
  }
}

/**
 * Generate a text completion using the OpenAI Responses API with web search capability
 */
export async function generateWithWebSearch(prompt: string): Promise<string> {
  try {
    const response = await openai.responses.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      tools: [{ type: "web_search_preview" }]
    });

    return response.output_text;
  } catch (error) {
    console.error("Error generating response with web search:", error);
    throw error;
  }
}

/**
 * Generate an image using DALL-E 3
 */
export async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    return response.data[0].url || "";
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

/**
 * Analyze text with OpenAI
 */
export async function analyzeText(text: string, instruction: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: instruction
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error analyzing text:", error);
    throw error;
  }
}

/**
 * Analyze an image with OpenAI Vision
 */
export async function analyzeImage(
  imageBase64: string,
  prompt: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // gpt-4o supports image inputs natively
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ]
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
}