import { huggingFaceService } from './huggingface-service';
import { trialPredictorService } from './trial-predictor-service';
import { db } from './db';
import { csrReports } from '../shared/schema';
import { eq, like, and, desc } from 'drizzle-orm';
import { ProtocolAnalyzerService } from './protocol-analyzer-service';

/**
 * Protocol Optimizer Service
 * 
 * This service provides recommendations for optimizing clinical trial protocols
 * based on historical data from Clinical Study Reports (CSRs) and machine learning predictions.
 */
class ProtocolOptimizerService {
  private protocolAnalyzerService: ProtocolAnalyzerService;

  constructor() {
    this.protocolAnalyzerService = new ProtocolAnalyzerService();
  }

  /**
   * Get optimization recommendations for a clinical trial protocol
   * 
   * @param protocolData Protocol data including phase, indication, sample size, duration, endpoints
   * @param benchmarks Benchmark data for similar trials
   * @param prediction Current prediction score (0-1)
   * @returns Array of optimization recommendations
   */
  async getOptimizationRecommendations(
    protocolData: ProtocolData,
    benchmarks: BenchmarkData,
    prediction: number
  ): Promise<OptimizationResult> {
    try {
      // Collect relevant successful trials from the same indication and phase
      const similarSuccessfulTrials = await this.getSimilarSuccessfulTrials(
        protocolData.indication, 
        protocolData.phase
      );

      // Generate recommendations based on the data
      return await this.generateRecommendations(
        protocolData,
        benchmarks,
        prediction,
        similarSuccessfulTrials
      );
    } catch (error) {
      console.error('Error generating optimization recommendations:', error);
      return {
        recommendations: [
          "Unable to generate optimization recommendations due to an error.",
          "Please check your protocol data and try again."
        ],
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get similar successful trials from the database
   * 
   * @param indication The indication (therapeutic area)
   * @param phase The trial phase
   * @returns Array of successful trial data
   */
  private async getSimilarSuccessfulTrials(indication: string, phase: string): Promise<any[]> {
    try {
      const trials = await db.select()
        .from(csrReports)
        .where(
          and(
            like(csrReports.indication, `%${indication}%`),
            like(csrReports.phase, `%${phase}%`),
            eq(csrReports.status, 'Completed')
          )
        )
        .orderBy(desc(csrReports.uploadDate))
        .limit(15);
      
      return trials;
    } catch (error) {
      console.error('Error fetching similar successful trials:', error);
      return [];
    }
  }

  /**
   * Generate specific recommendations based on protocol data, benchmarks, and ML prediction
   * 
   * @param protocolData Protocol data
   * @param benchmarks Benchmark data
   * @param prediction Current prediction score
   * @param similarTrials Similar successful trials
   * @returns Optimization recommendations and improved metrics
   */
  private async generateRecommendations(
    protocolData: ProtocolData,
    benchmarks: BenchmarkData,
    prediction: number,
    similarTrials: any[]
  ): Promise<OptimizationResult> {
    const recommendations: string[] = [];
    let improvedPrediction = prediction;
    
    // Sample size optimization
    if (protocolData.sample_size < benchmarks.avg_sample_size * 0.8) {
      const recommendedSampleSize = Math.round(benchmarks.avg_sample_size);
      recommendations.push(
        `Increase sample size from ${protocolData.sample_size} to at least ${recommendedSampleSize} to align with successful trials (avg: ${benchmarks.avg_sample_size}).`
      );
      improvedPrediction += 0.05; // Estimate improvement in prediction
    }
    
    // Trial duration optimization
    const avgDuration = benchmarks.avg_duration_weeks;
    if (protocolData.duration_weeks > avgDuration * 1.5) {
      recommendations.push(
        `Consider reducing trial duration from ${protocolData.duration_weeks} to ${Math.round(avgDuration)} weeks to improve completion rates and reduce dropout.`
      );
      improvedPrediction += 0.03;
    } else if (protocolData.duration_weeks < avgDuration * 0.6) {
      recommendations.push(
        `Consider extending trial duration from ${protocolData.duration_weeks} to at least ${Math.round(avgDuration * 0.7)} weeks to ensure adequate follow-up for ${protocolData.endpoint_primary}.`
      );
      improvedPrediction += 0.02;
    }
    
    // Use HuggingFace for more sophisticated endpoint recommendations
    try {
      const endpointRecommendations = await this.getEndpointRecommendations(
        protocolData.indication, 
        protocolData.phase, 
        protocolData.endpoint_primary
      );
      
      if (endpointRecommendations && endpointRecommendations.length > 0) {
        recommendations.push(...endpointRecommendations);
        improvedPrediction += 0.04;
      }
    } catch (error) {
      console.error('Error getting endpoint recommendations from HuggingFace:', error);
      // Fallback recommendation for endpoints
      recommendations.push(
        `Ensure ${protocolData.endpoint_primary} definition aligns with FDA guidelines for ${protocolData.indication} clinical trials.`
      );
    }
    
    // If prediction is still below threshold, add more specific recommendations
    if (improvedPrediction < 0.8) {
      recommendations.push(
        `Consider adding secondary endpoints that have shown correlation with ${protocolData.endpoint_primary} in recent successful trials.`
      );
      recommendations.push(
        `Implement stratified randomization based on key prognostic factors for ${protocolData.indication}.`
      );
    }

    // Additional optimization for Phase 2/3 trials
    if (protocolData.phase.includes('2') || protocolData.phase.includes('3')) {
      recommendations.push(
        `Consider implementing an adaptive design with sample size re-estimation to optimize resource allocation.`
      );
    }
    
    // Format and clean recommendations
    const uniqueRecommendations = [...new Set(recommendations)].map(rec => 
      rec.trim().replace(/\s+/g, ' ')
    );
    
    return {
      recommendations: uniqueRecommendations,
      improvedPrediction: Math.min(0.95, improvedPrediction), // Cap at 0.95
      optimizedProtocol: {
        sample_size: protocolData.sample_size < benchmarks.avg_sample_size * 0.8 
          ? Math.round(benchmarks.avg_sample_size) 
          : protocolData.sample_size,
        duration_weeks: protocolData.duration_weeks > avgDuration * 1.5
          ? Math.round(avgDuration)
          : protocolData.duration_weeks
      },
      benchmarks
    };
  }
  
  /**
   * Get endpoint-specific recommendations using HuggingFace
   * 
   * @param indication Trial indication
   * @param phase Trial phase
   * @param primaryEndpoint Primary endpoint
   * @returns Array of endpoint-specific recommendations
   */
  private async getEndpointRecommendations(
    indication: string,
    phase: string,
    primaryEndpoint: string
  ): Promise<string[]> {
    try {
      const prompt = `
        As a clinical trial design expert, analyze the following clinical trial primary endpoint and provide specific optimization recommendations:
        
        Indication: ${indication}
        Phase: ${phase}
        Primary Endpoint: ${primaryEndpoint}
        
        Provide 2-3 specific, concise recommendations for optimizing this endpoint definition or measurement to increase trial success probability. Focus on:
        1. Statistical analysis plan recommendations
        2. Endpoint definition refinements
        3. Measurement timing optimization
        
        Format each recommendation as a single, concise sentence. No introduction or conclusion needed.
      `;
      
      const response = await huggingFaceService.getTextGenerationResponse(prompt);
      
      if (!response) {
        return [];
      }
      
      // Process the response to extract specific recommendations
      const lines = response
        .split('\n')
        .filter(line => line.trim().length > 0)
        .filter(line => !line.includes('recommendation') && !line.includes('Recommendation'))
        .map(line => line.replace(/^\d+\.\s+/, '').trim())
        .filter(line => line.length > 20 && line.length < 150);
      
      return lines.slice(0, 3); // Return up to 3 recommendations
    } catch (error) {
      console.error('Error getting endpoint recommendations:', error);
      return [];
    }
  }
}

// Types for the protocol optimizer service
interface ProtocolData {
  phase: string;
  indication: string;
  sample_size: number;
  duration_weeks: number;
  endpoint_primary: string;
  [key: string]: any; // Allow for additional properties
}

interface BenchmarkData {
  avg_sample_size: number;
  avg_duration_weeks: number;
  [key: string]: any; // Allow for additional properties
}

interface OptimizationResult {
  recommendations: string[];
  improvedPrediction?: number;
  optimizedProtocol?: {
    sample_size?: number;
    duration_weeks?: number;
    [key: string]: any;
  };
  benchmarks?: BenchmarkData;
  error?: string;
}

export const protocolOptimizerService = new ProtocolOptimizerService();