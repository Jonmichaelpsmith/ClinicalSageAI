import OpenAI from "openai";
import { InsertCsrDetails } from "@shared/schema";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_development" 
});

// Extract text from PDF buffer
export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    // For demonstration, we'll just handle the extraction via OpenAI directly
    // In a production system, you might want to:
    // 1. Use a PDF parsing library first to extract text
    // 2. Then send chunks to OpenAI if needed
    
    // Mock extraction for now since we can't process the actual PDF
    return "Extracted text from PDF would be processed here";
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

// Analyze CSR content and generate structured data
export async function analyzeCsrContent(pdfText: string): Promise<Partial<InsertCsrDetails>> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `
            You are an AI assistant specialized in analyzing clinical study reports (CSRs).
            Extract key information from the provided CSR text and structure it according to the following categories:
            - Study Design
            - Primary Objective
            - Study Description
            - Inclusion Criteria
            - Exclusion Criteria
            - Treatment Arms (as array with arm, intervention, dosing regimen, participants)
            - Study Duration
            - Endpoints (with primary and secondary array)
            - Results (with primaryResults, secondaryResults, biomarkerResults)
            - Safety (with overallSafety, major concerns, common adverse events)
            
            Format the response as a JSON object with these fields.
          `
        },
        {
          role: "user",
          content: pdfText
        }
      ],
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    
    return {
      studyDesign: analysis.studyDesign,
      primaryObjective: analysis.primaryObjective,
      studyDescription: analysis.studyDescription,
      inclusionCriteria: analysis.inclusionCriteria,
      exclusionCriteria: analysis.exclusionCriteria,
      treatmentArms: analysis.treatmentArms,
      studyDuration: analysis.studyDuration,
      endpoints: analysis.endpoints,
      results: analysis.results,
      safety: analysis.safety,
      processed: true
    };
  } catch (error) {
    console.error("Error analyzing CSR content:", error);
    throw new Error("Failed to analyze CSR content");
  }
}

// Generate a simple summary of the CSR
export async function generateCsrSummary(pdfText: string): Promise<string> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Generate a brief, concise summary (max 150 words) of the following clinical study report text, focusing on the study objective, design, and key findings."
        },
        {
          role: "user",
          content: pdfText
        }
      ]
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating CSR summary:", error);
    throw new Error("Failed to generate CSR summary");
  }
}
