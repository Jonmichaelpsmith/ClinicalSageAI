import { eq, and, sql, desc, like, or } from 'drizzle-orm';
import { db } from '../db';
import { csrReports, csrDetails } from '@shared/schema';
import { huggingFaceService } from '../huggingface-service';

/**
 * EndpointRecommenderService
 * 
 * Service for recommending clinical trial endpoints based on 
 * indication, phase, and other trial characteristics.
 * Uses database analysis and Hugging Face models for recommendations.
 */
export class EndpointRecommenderService {
  private hfService: typeof huggingFaceService;

  constructor(hfService: typeof huggingFaceService) {
    this.hfService = hfService;
  }

  /**
   * Get endpoint recommendations based on indication and phase
   */
  async getEndpointRecommendations(
    indication: string,
    phase: string = '',
    count: number = 5
  ): Promise<string[]> {
    try {
      // First try to find common endpoints directly from the database
      const dbRecommendations = await this.getCommonEndpointsFromDatabase(indication, phase);
      
      if (dbRecommendations.length >= count) {
        return dbRecommendations.slice(0, count);
      }
      
      // If not enough recommendations from DB, use Hugging Face to generate more
      const aiRecommendations = await this.getAIGeneratedEndpoints(
        indication, 
        phase,
        count - dbRecommendations.length
      );
      
      // Combine DB and AI recommendations, avoiding duplicates
      const allRecommendations = [
        ...dbRecommendations,
        ...aiRecommendations.filter(rec => !dbRecommendations.includes(rec))
      ];
      
      return allRecommendations.slice(0, count);
    } catch (error) {
      console.error('Error getting endpoint recommendations:', error);
      return [];
    }
  }

  /**
   * Get common endpoints directly from the database
   */
  private async getCommonEndpointsFromDatabase(
    indication: string,
    phase: string = ''
  ): Promise<string[]> {
    try {
      // Create query conditions
      const conditions = [];
      
      // Add indication filter (with fuzzy matching)
      conditions.push(like(csrReports.indication, `%${indication}%`));
      
      // Add phase filter if provided
      if (phase && phase !== 'any') {
        conditions.push(like(csrReports.phase, `%${phase}%`));
      }
      
      // Build full query condition
      const whereCondition = conditions.length > 0 
        ? and(...conditions) 
        : undefined;
      
      // Query for reports matching criteria
      const matchingReports = await db
        .select({
          id: csrReports.id,
        })
        .from(csrReports)
        .where(whereCondition)
        .limit(100);
      
      if (matchingReports.length === 0) {
        return [];
      }
      
      // Get report IDs
      const reportIds = matchingReports.map(report => report.id);
      
      // Extract unique primary endpoints from matching reports
      const detailsResults = await db
        .select({
          primaryEndpoint: csrDetails.primaryEndpoint,
        })
        .from(csrDetails)
        .where(sql`${csrDetails.reportId} IN (${reportIds.join(',')})`)
        .orderBy(desc(sql`COUNT(*)`))
        .groupBy(csrDetails.primaryEndpoint);
      
      // Extract endpoints and filter out null/empty values
      const endpoints = detailsResults
        .map(result => result.primaryEndpoint)
        .filter(Boolean) as string[];
      
      return endpoints;
    } catch (error) {
      console.error('Error getting endpoints from database:', error);
      return [];
    }
  }

  /**
   * Generate endpoint recommendations using Hugging Face
   */
  private async getAIGeneratedEndpoints(
    indication: string,
    phase: string = '',
    count: number = 5
  ): Promise<string[]> {
    try {
      const prompt = `
Generate ${count} evidence-based primary endpoints appropriate for a ${phase || 'clinical'} trial 
targeting ${indication}. Format the response as a JSON array of strings containing only the endpoints.

For example:
["Reduction in tumor size measured by CT scan at 6 months", "Progression-free survival at 12 months"]

Guidelines:
- Each endpoint should be specific and measurable
- Include timeframes where applicable 
- Focus on clinically relevant outcomes
- Follow standard endpoint structures for ${indication}
- Provide clear metrics (e.g., percentage reduction, absolute change)
`;

      // Query Hugging Face API
      const response = await this.hfService.queryHuggingFace(prompt);
      
      // Parse response to extract JSON array
      try {
        // Find JSON array in the response
        const jsonMatch = response.match(/\[.*\]/s);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          const endpoints = JSON.parse(jsonStr);
          
          if (Array.isArray(endpoints)) {
            return endpoints
              .slice(0, count)
              .map(endpoint => endpoint.trim())
              .filter(Boolean);
          }
        }
        
        // Fallback: Parse line by line if JSON parsing fails
        return response
          .split('\n')
          .map(line => line.replace(/^["'\d\s-]+/, '').trim())
          .filter(Boolean)
          .slice(0, count);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        
        // Last resort fallback: Split by quotes or line breaks
        return response
          .split(/["'\n]/)
          .map(line => line.trim())
          .filter(line => line.length > 10 && !line.includes('{') && !line.includes('}'))
          .slice(0, count);
      }
    } catch (error) {
      console.error('Error generating AI endpoints:', error);
      return [];
    }
  }

  /**
   * Evaluate an endpoint's quality and applicability
   */
  async evaluateEndpoint(
    endpoint: string,
    indication: string,
    phase: string = ''
  ): Promise<{ 
    score: number; 
    feedback: string;
    similarEndpoints: string[];
  }> {
    try {
      const prompt = `
Evaluate this clinical trial endpoint for a ${phase || 'clinical'} trial in ${indication}:
"${endpoint}"

Consider:
1. Specificity and measurability
2. Clinical relevance
3. Appropriateness for ${phase || 'clinical'} trials
4. Standard practices for ${indication}
5. Statistical considerations

Provide a JSON response with:
- score: A number from 0-100 representing quality
- feedback: Constructive feedback explaining the score
- suggestedImprovement: How to improve this endpoint (if score < 90)
`;

      // Query Hugging Face API
      const response = await this.hfService.queryHuggingFace(prompt);
      
      // Parse response
      try {
        // Try to extract JSON
        const jsonMatch = response.match(/{.*}/s);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          const evaluation = JSON.parse(jsonStr);
          
          // Get similar endpoints from the database
          const similarEndpoints = await this.getSimilarEndpoints(endpoint, indication, 3);
          
          return {
            score: evaluation.score || 75,
            feedback: evaluation.feedback || 'No specific feedback available',
            similarEndpoints,
          };
        }
        
        // Fallback if JSON parsing fails
        return {
          score: 70,
          feedback: 'Unable to parse structured feedback. Please review the endpoint for clarity and measurability.',
          similarEndpoints: await this.getSimilarEndpoints(endpoint, indication, 3),
        };
      } catch (parseError) {
        console.error('Error parsing endpoint evaluation:', parseError);
        return {
          score: 65,
          feedback: 'Endpoint evaluation failed. Please ensure the endpoint is clear, specific, and measurable.',
          similarEndpoints: [],
        };
      }
    } catch (error) {
      console.error('Error evaluating endpoint:', error);
      return {
        score: 60,
        feedback: 'An error occurred during evaluation. Please try again.',
        similarEndpoints: [],
      };
    }
  }

  /**
   * Find similar endpoints from the database
   */
  private async getSimilarEndpoints(
    endpoint: string,
    indication: string,
    limit: number = 3
  ): Promise<string[]> {
    try {
      // Get keywords from endpoint
      const keywords = endpoint
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3);
      
      if (keywords.length === 0) {
        return [];
      }
      
      // Build OR conditions for keyword matching
      const keywordConditions = keywords.map(keyword => 
        like(csrDetails.primaryEndpoint, `%${keyword}%`)
      );
      
      // Query for similar endpoints
      const results = await db
        .select({
          endpoint: csrDetails.primaryEndpoint,
        })
        .from(csrDetails)
        .innerJoin(csrReports, eq(csrDetails.reportId, csrReports.id))
        .where(
          and(
            like(csrReports.indication, `%${indication}%`),
            or(...keywordConditions)
          )
        )
        .limit(limit);
      
      return results
        .map(result => result.endpoint)
        .filter(Boolean) as string[];
    } catch (error) {
      console.error('Error finding similar endpoints:', error);
      return [];
    }
  }
}

// Singleton instance to be used by routes
let endpointRecommenderService: EndpointRecommenderService | null = null;

export function getEndpointRecommenderService(): EndpointRecommenderService {
  if (!endpointRecommenderService) {
    endpointRecommenderService = new EndpointRecommenderService(huggingFaceService);
  }
  return endpointRecommenderService;
}