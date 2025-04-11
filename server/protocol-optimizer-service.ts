/**
 * Protocol Optimizer Service
 * 
 * This service analyzes protocol parameters and provides optimization 
 * recommendations based on CSR data and best practices
 */

export interface OptimizationResult {
  recommendations: string[];
  benchmarkData: Record<string, any>;
}

export class ProtocolOptimizerService {
  /**
   * Get optimization recommendations for a protocol based on CSR benchmarks
   * 
   * @param protocolData The parsed protocol data
   * @param benchmarks Optional benchmarking data (will be fetched if not provided)
   * @returns Optimization recommendations
   */
  async getDeepOptimizationRecommendations(
    protocolData: any,
    benchmarks: Record<string, any> = {}
  ): Promise<OptimizationResult> {
    // Generate recommendations based on protocol parameters
    const recommendations: string[] = [];
    
    // Sample Size Optimization
    if (benchmarks.avg_sample_size && protocolData.sample_size < benchmarks.avg_sample_size * 0.6) {
      recommendations.push(
        `Consider increasing sample size from ${protocolData.sample_size} to at least ${Math.ceil(benchmarks.avg_sample_size * 0.7)}. ` +
        `Similar trials in ${protocolData.indication} typically enroll ${benchmarks.avg_sample_size} participants.`
      );
    }
    
    // Duration Optimization
    if (benchmarks.avg_duration_weeks && protocolData.duration_weeks < benchmarks.avg_duration_weeks * 0.7) {
      recommendations.push(
        `Trial duration (${protocolData.duration_weeks} weeks) may be insufficient. ` +
        `Consider extending to at least ${Math.ceil(benchmarks.avg_duration_weeks * 0.8)} weeks based on similar trials.`
      );
    }
    
    // Dropout Rate Optimization
    if (benchmarks.avg_dropout_rate && protocolData.dropout_rate > benchmarks.avg_dropout_rate * 1.5) {
      recommendations.push(
        `Expected dropout rate (${(protocolData.dropout_rate * 100).toFixed(1)}%) is higher than average. ` +
        `Consider strategies to improve retention or increase sample size accordingly.`
      );
    }
    
    // Endpoint Selection Optimization
    if (benchmarks.common_endpoints && benchmarks.common_endpoints.length > 0) {
      const commonEndpoints = benchmarks.common_endpoints.slice(0, 3);
      const endpoint = protocolData.endpoint_primary.toLowerCase();
      
      if (!commonEndpoints.some((e: string) => endpoint.includes(e.toLowerCase()))) {
        recommendations.push(
          `Consider using a more standard primary endpoint. Common options for ${protocolData.indication} include: ` +
          commonEndpoints.map((e: string) => `"${e}"`).join(", ")
        );
      }
    }
    
    // Arms Optimization
    if (protocolData.arms === 1) {
      recommendations.push(
        "Consider adding a control arm to strengthen study design and facilitate regulatory approval."
      );
    }
    
    // Generic Recommendations
    recommendations.push(
      "Include patient-reported outcomes to enhance clinical relevance and support value propositions."
    );
    
    recommendations.push(
      "Consider incorporating biomarker assessment to enable stratified analyses and potential precision medicine approaches."
    );
    
    return {
      recommendations,
      benchmarkData: benchmarks
    };
  }
}

export const protocolOptimizerService = new ProtocolOptimizerService();