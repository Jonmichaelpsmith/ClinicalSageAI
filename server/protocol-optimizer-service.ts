/**
 * Protocol Optimizer Agent Service
 * 
 * This service optimizes clinical trial protocols based on historical CSR data.
 * It uses Hugging Face's Mixtral model to generate design suggestions, risk insights,
 * endpoint optimization recommendations, and CSR precedent matches.
 */

import fs from 'fs';
import path from 'path';
import { queryHuggingFace, HFModel } from './huggingface-service';
import { db } from './db';
import { csrReports, csrDetails } from '../shared/schema';
import { eq, inArray, ilike, and, isNull, sql } from 'drizzle-orm';

// The directory where processed CSR JSON files are stored
const PROCESSED_CSR_DIR = path.join(process.cwd(), 'data', 'processed_csrs');

// Ensure the directory exists
if (!fs.existsSync(PROCESSED_CSR_DIR)) {
  fs.mkdirSync(PROCESSED_CSR_DIR, { recursive: true });
}

/**
 * Protocol optimization request parameters
 */
export interface ProtocolOptimizationRequest {
  summary: string;           // Summary of the protocol to optimize
  topCsrIds?: string[];      // Optional array of CSR IDs to use as context
  indication?: string;       // Optional indication to use for finding similar CSRs
  phase?: string;            // Optional phase to use for finding similar CSRs
}

/**
 * Protocol optimization response
 */
export interface ProtocolOptimizationResponse {
  recommendation: string;   // The full text recommendation from the LLM
  keySuggestions?: string[];          // Key suggestions extracted from the recommendation
  riskFactors?: string[];             // Risk factors extracted from the recommendation
  matchedCsrInsights?: {             // Insights from matched CSRs
    csrId: string;
    relevance: string;
  }[];
  suggestedEndpoints?: string[];     // Suggested endpoints
  suggestedArms?: string[];          // Suggested trial arms
}

/**
 * Optimize a clinical trial protocol based on historical CSR data
 * 
 * @param request The protocol optimization request
 * @returns Protocol optimization recommendations
 */
export async function optimizeProtocol(
  request: ProtocolOptimizationRequest
): Promise<ProtocolOptimizationResponse> {
  try {
    // Build context blocks from top CSR IDs
    const contextBlocks: string[] = [];

    // If CSR IDs are provided, load their data for context
    if (request.topCsrIds && request.topCsrIds.length > 0) {
      for (const csrId of request.topCsrIds) {
        try {
          const csrFilePath = path.join(PROCESSED_CSR_DIR, `${csrId}.json`);
          if (fs.existsSync(csrFilePath)) {
            const csrData = JSON.parse(fs.readFileSync(csrFilePath, 'utf8'));
            contextBlocks.push(
              `CSR ${csrId}: ${csrData.indication || ''}, Phase: ${csrData.phase || ''}, Outcome: ${csrData.outcome_summary || ''}, Endpoints: ${(csrData.primary_endpoints || []).join(', ')}`
            );
          }
        } catch (error) {
          console.error(`Error loading CSR ${csrId}:`, error);
          // Continue with other CSRs
        }
      }
    }
    
    // If indication/phase are provided but not enough CSR IDs, find more similar trials from the database
    if ((request.indication || request.phase) && contextBlocks.length < 3) {
      try {
        const similarTrialReports = await findSimilarTrialReports(request.indication, request.phase);
        
        if (similarTrialReports.length > 0) {
          // Get the details for these similar trials
          const trialIds = similarTrialReports.map(report => report.id);
          const trialDetails = await db.select()
            .from(csrDetails)
            .where(inArray(csrDetails.reportId, trialIds));
          
          // Create a map for faster lookups
          const detailsMap = new Map();
          trialDetails.forEach(detail => {
            detailsMap.set(detail.reportId, detail);
          });
          
          // Add context from similar trials
          for (const report of similarTrialReports) {
            const detail = detailsMap.get(report.id);
            if (detail) {
              const primaryEndpoint = detail.primaryEndpoint || 'Not specified';
              const outcome = report.summary?.includes('successful') ? 'Successful' : 
                (report.summary?.includes('failed') ? 'Failed' : 'Unknown');
              
              contextBlocks.push(
                `Similar Trial ${report.id}: ${report.indication}, Phase: ${report.phase}, Outcome: ${outcome}, Endpoints: ${primaryEndpoint}`
              );
            }
          }
        }
      } catch (error) {
        console.error('Error finding similar trial reports:', error);
        // Continue with available context
      }
    }

    // Build the prompt with the available context
    const prompt = `
You are a senior clinical trial strategist. Based on the following protocol summary and historical precedent, suggest improvements:

Protocol Summary:
${request.summary}

${contextBlocks.length > 0 ? `Relevant Trial Context:
${contextBlocks.join('\n')}` : ''}

Return a structured response with:
- Key suggestions (numbered list)
- Risk factors (bulleted list)
- Matched CSR insights (which precedent trials support your recommendations)
- Suggested endpoints or arms if applicable

Format your response with clear headings and concise points. Focus on evidence-based recommendations that would increase trial success probability.
`;

    // Generate recommendation using Hugging Face's Mixtral model
    const rawRecommendation = await queryHuggingFace(
      prompt,
      HFModel.TEXT, // Use the default TEXT model (Mixtral-8x7B)
      0.4,  // Lower temperature for more focused output
      600   // Reasonable token limit for a detailed but concise response
    );

    // Process the raw recommendation to extract structured data
    const processedResponse = processRecommendation(rawRecommendation);

    return {
      recommendation: rawRecommendation,
      ...processedResponse
    };
  } catch (error) {
    console.error('Protocol optimization error:', error);
    throw new Error(`Failed to optimize protocol: ${error.message}`);
  }
}

/**
 * Find similar trial reports based on indication and/or phase
 */
async function findSimilarTrialReports(indication?: string, phase?: string): Promise<any[]> {
  try {
    let conditions = [];
    
    // Add condition for non-deleted reports
    conditions.push(isNull(csrReports.deletedAt));
    
    // Add indication condition if provided
    if (indication) {
      conditions.push(ilike(csrReports.indication, `%${indication}%`));
    }
    
    // Add phase condition if provided
    if (phase) {
      conditions.push(eq(csrReports.phase, phase));
    }
    
    // Combine all conditions with AND
    const whereCondition = and(...conditions);
    
    // Execute the query
    const results = await db.select()
      .from(csrReports)
      .where(whereCondition)
      .limit(5);
    
    return results;
  } catch (error) {
    console.error('Error finding similar trial reports:', error);
    return [];
  }
}

/**
 * Process the raw recommendation to extract structured data
 */
function processRecommendation(rawRecommendation: string): Partial<ProtocolOptimizationResponse> {
  const result: Partial<ProtocolOptimizationResponse> = {};
  
  // Extract key suggestions
  const suggestionMatch = rawRecommendation.match(/Key suggestions[:\s]*([\s\S]*?)(?=Risk factors|\n\n|$)/i);
  if (suggestionMatch && suggestionMatch[1]) {
    result.keySuggestions = suggestionMatch[1]
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.match(/^\d+\.|\-/) && line.length > 5)
      .map(line => line.replace(/^\d+\.|\-/, '').trim());
  }
  
  // Extract risk factors
  const riskMatch = rawRecommendation.match(/Risk factors[:\s]*([\s\S]*?)(?=Matched CSR|\n\n|$)/i);
  if (riskMatch && riskMatch[1]) {
    result.riskFactors = riskMatch[1]
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.match(/^•|\*|\-/) && line.length > 5)
      .map(line => line.replace(/^•|\*|\-/, '').trim());
  }
  
  // Extract matched CSR insights
  const insightMatch = rawRecommendation.match(/Matched CSR insights[:\s]*([\s\S]*?)(?=Suggested endpoints|\n\n|$)/i);
  if (insightMatch && insightMatch[1]) {
    const insights = insightMatch[1]
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.match(/CSR|Trial/) && line.length > 5);
      
    result.matchedCsrInsights = insights.map(insight => {
      const csrMatch = insight.match(/CSR\s+([A-Za-z0-9]+)/);
      return {
        csrId: csrMatch ? csrMatch[1] : 'Unknown',
        relevance: insight.replace(/CSR\s+([A-Za-z0-9]+)/, '').trim()
      };
    });
  }
  
  // Extract suggested endpoints
  const endpointMatch = rawRecommendation.match(/Suggested endpoints[:\s]*([\s\S]*?)(?=Suggested arms|\n\n|$)/i);
  if (endpointMatch && endpointMatch[1]) {
    result.suggestedEndpoints = endpointMatch[1]
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.match(/^•|\*|\-|\d+\./) && line.length > 5)
      .map(line => line.replace(/^•|\*|\-|\d+\./, '').trim());
  }
  
  // Extract suggested arms
  const armMatch = rawRecommendation.match(/Suggested arms[:\s]*([\s\S]*?)(?=\n\n|$)/i);
  if (armMatch && armMatch[1]) {
    result.suggestedArms = armMatch[1]
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.match(/^•|\*|\-|\d+\./) && line.length > 5)
      .map(line => line.replace(/^•|\*|\-|\d+\./, '').trim());
  }
  
  return result;
}