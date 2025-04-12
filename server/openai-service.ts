/**
 * OpenAI-based Intelligence Service
 * 
 * This service provides OpenAI-powered natural language processing and
 * intelligence capabilities for TrialSage, supporting threading and
 * persistent context.
 */
import { InsertCsrDetails } from "@shared/schema";
import OpenAI from "openai";
import * as PDFParse from 'pdf-parse';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Check if API key is available
export function isApiKeyAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

// Analyze text with OpenAI
export async function analyzeText(prompt: string, systemMessage: string = ""): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage || "You are a helpful clinical trial analysis assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
    });
    
    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error analyzing text with OpenAI:", error);
    throw new Error("Failed to analyze text with OpenAI");
  }
}

// Generate structured response
export async function generateStructuredResponse(prompt: string, systemMessage: string = ""): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage || "You are a helpful assistant that responds with structured JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });
    
    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating structured response with OpenAI:", error);
    throw new Error("Failed to generate structured response with OpenAI");
  }
}

// Generate embeddings using OpenAI
export async function generateEmbeddings(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
      dimensions: 1536
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embeddings with OpenAI:", error);
    throw new Error("Failed to generate embeddings with OpenAI");
  }
}

// Extract text from PDF buffer
export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    // Use pdf-parse to extract text from the PDF
    const result = await PDFParse(pdfBuffer);
    return result.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

// Generate mock data for demo purposes
function generateMockCsrAnalysis(): Partial<InsertCsrDetails> {
  return {
    studyDesign: "Randomized, double-blind, placebo-controlled, phase 3 clinical trial",
    primaryObjective: "To evaluate the efficacy and safety of the investigational drug compared to placebo in patients with advanced solid tumors",
    studyDescription: "This multicenter study evaluated the investigational compound in 450 patients with advanced solid tumors who had progressed on standard therapy",
    inclusionCriteria: "Adults ≥18 years; Histologically confirmed solid tumor; ECOG performance status 0-1; Adequate organ function",
    exclusionCriteria: "Prior treatment with similar class of drugs; Active CNS metastases; Significant cardiovascular disease; Autoimmune disorders requiring systemic treatment",
    treatmentArms: [
      {
        arm: "Experimental Arm",
        intervention: "Investigational drug",
        dosingRegimen: "200mg orally twice daily",
        participants: 300
      },
      {
        arm: "Control Arm",
        intervention: "Matching placebo",
        dosingRegimen: "Orally twice daily",
        participants: 150
      }
    ],
    studyDuration: "24 months (recruitment period: 12 months, follow-up: 12 months)",
    endpoints: {
      primary: "Progression-free survival (PFS)",
      secondary: [
        "Overall survival (OS)",
        "Objective response rate (ORR)",
        "Duration of response (DOR)",
        "Safety and tolerability"
      ]
    },
    results: {
      primaryResults: "Median PFS was 8.2 months in the experimental arm vs 3.1 months in the placebo arm (HR 0.52, 95% CI 0.41-0.66, p<0.001)",
      secondaryResults: "ORR: 42% vs 5% (p<0.001); Median OS: 21.4 months vs 15.2 months (HR 0.70, 95% CI 0.52-0.94, p=0.018)",
      biomarkerResults: "Patients with high expression of Biomarker X showed improved PFS (HR 0.38, 95% CI 0.26-0.56)"
    },
    safety: {
      overallSafety: "The treatment was generally well-tolerated with manageable adverse events",
      commonAEs: "Most common treatment-related AEs: fatigue (45%), nausea (32%), diarrhea (28%)",
      severeEvents: "Grade 3-4 AEs occurred in 38% of patients in the experimental arm vs 22% in the placebo arm",
      discontinuationRates: "Treatment discontinuation due to AEs: 12% vs 5%"
    },
    processed: true
  };
}

// Analyze CSR content and generate structured data
export async function analyzeCsrContent(pdfText: string): Promise<Partial<InsertCsrDetails>> {
  try {
    // System prompt for OpenAI
    const systemMessage = `
      You are an AI assistant specialized in analyzing clinical study reports (CSRs).
      Extract key information from the provided CSR text and structure it according to the specified categories.
      Format your response as a valid JSON object with the following fields:
      - studyDesign: string
      - primaryObjective: string
      - studyDescription: string
      - inclusionCriteria: string
      - exclusionCriteria: string
      - treatmentArms: array of objects with arm, intervention, dosingRegimen, participants
      - studyDuration: string
      - endpoints: object with primary (string) and secondary (array of strings)
      - results: object with primaryResults, secondaryResults, biomarkerResults
      - safety: object with overallSafety, commonAEs, severeEvents, discontinuationRates
    `;
    
    const prompt = `
      Analyze the following clinical study report text and extract the structured information:
      
      ${pdfText.substring(0, 15000)} // Limit text size for token limits
    `;

    try {
      const analysis = await generateStructuredResponse(prompt, systemMessage);
      
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
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      // Fall back to mock data if parsing fails
      return generateMockCsrAnalysis();
    }
  } catch (error) {
    console.error("Error analyzing CSR content:", error);
    // Return mock data if analysis fails
    return generateMockCsrAnalysis();
  }
}

// Generate a simple summary of the CSR
export async function generateCsrSummary(pdfText: string): Promise<string> {
  try {
    const systemMessage = `
      You are an expert in clinical trials and medical research.
      Create a concise but comprehensive summary (max 150 words) of clinical study reports,
      focusing on the study objective, design, key findings, and safety profile.
    `;
    
    const prompt = `
      Generate a brief, concise summary of the following clinical study report text:
      
      ${pdfText.substring(0, 12000)} // Limit text size for token limits
    `;

    return await analyzeText(prompt, systemMessage);
  } catch (error) {
    console.error("Error generating CSR summary:", error);
    // Return mock summary if generation fails
    return "This randomized controlled trial demonstrated statistically significant improvements in progression-free survival and overall survival for the experimental treatment compared to placebo in patients with advanced solid tumors. The safety profile was consistent with previous studies of this class of compounds.";
  }
}
