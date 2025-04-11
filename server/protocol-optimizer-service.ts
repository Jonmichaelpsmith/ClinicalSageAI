import { huggingFaceService } from './huggingface-service';
import { trialPredictorService } from './trial-predictor-service';
import { db } from './db';
import { csrReports, csrDetails } from '../shared/schema';
import { eq, like, and, desc, sql } from 'drizzle-orm';
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
      
      const response = await huggingFaceService.queryHuggingFace(prompt);
      
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

  /**
   * Get benchmark data for a given indication and phase
   * 
   * @param indication Trial indication
   * @param phase Trial phase
   * @returns Benchmark data for similar trials
   */
  async getBenchmarkData(
    indication: string,
    phase: string
  ): Promise<BenchmarkData> {
    try {
      // Get similar trials
      const similarTrials = await db.select({
        sample_size: csrReports.sampleSize,
        duration_weeks: csrReports.durationWeeks,
        status: csrReports.status
      })
      .from(csrReports)
      .where(
        and(
          like(csrReports.indication, `%${indication}%`),
          like(csrReports.phase, `%${phase}%`)
        )
      );

      // Calculate averages
      const succeededTrials = similarTrials.filter(trial => 
        trial.status === 'Completed' || trial.status === 'Successful'
      );
      
      const validSampleSizes = succeededTrials
        .map(trial => trial.sample_size)
        .filter(size => size !== null && size > 0) as number[];
      
      const validDurations = succeededTrials
        .map(trial => trial.duration_weeks)
        .filter(duration => duration !== null && duration > 0) as number[];

      const avgSampleSize = validSampleSizes.length > 0 
        ? validSampleSizes.reduce((sum, size) => sum + size, 0) / validSampleSizes.length 
        : 100; // Default if no data
      
      const avgDuration = validDurations.length > 0
        ? validDurations.reduce((sum, duration) => sum + duration, 0) / validDurations.length
        : 24; // Default if no data

      // Calculate standard deviations
      const sampleSizeStdDev = this.calculateStdDev(validSampleSizes, avgSampleSize);
      const durationStdDev = this.calculateStdDev(validDurations, avgDuration);

      // Get additional detail statistics from trial details
      const successRates = await this.getSuccessRates(indication, phase);
      const endpointMetrics = await this.getEndpointMetrics(indication, phase);
      
      return {
        avg_sample_size: avgSampleSize,
        avg_duration_weeks: avgDuration,
        sample_size_stddev: sampleSizeStdDev,
        duration_stddev: durationStdDev,
        total_trials: similarTrials.length,
        successful_trials: succeededTrials.length,
        success_rate: similarTrials.length > 0 
          ? (succeededTrials.length / similarTrials.length) 
          : 0,
        ...successRates,
        ...endpointMetrics
      };
    } catch (error) {
      console.error('Error getting benchmark data:', error);
      return {
        avg_sample_size: 100,
        avg_duration_weeks: 24,
        sample_size_stddev: 0,
        duration_stddev: 0,
        total_trials: 0,
        successful_trials: 0,
        success_rate: 0
      };
    }
  }

  /**
   * Calculate standard deviation for a set of numbers
   */
  private calculateStdDev(values: number[], mean: number): number {
    if (values.length < 2) return 0;
    
    const variance = values.reduce((sum, value) => {
      const diff = value - mean;
      return sum + (diff * diff);
    }, 0) / values.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Get success rates by study design features
   */
  private async getSuccessRates(indication: string, phase: string): Promise<any> {
    try {
      // Get design-specific success rates by joining with details
      const detailsQuery = await db.select({
        blinding: csrDetails.blinding,
        randomization: csrDetails.randomization,
        status: csrReports.status
      })
      .from(csrReports)
      .leftJoin(csrDetails, eq(csrReports.id, csrDetails.reportId))
      .where(
        and(
          like(csrReports.indication, `%${indication}%`),
          like(csrReports.phase, `%${phase}%`)
        )
      );

      // Process data to get success rates by feature
      const blindingStats = this.calculateFeatureSuccessRates(
        detailsQuery, 
        'blinding'
      );
      
      const randomizationStats = this.calculateFeatureSuccessRates(
        detailsQuery, 
        'randomization'
      );

      return {
        blinding_success_rates: blindingStats,
        randomization_success_rates: randomizationStats
      };
    } catch (error) {
      console.error('Error getting success rates:', error);
      return {
        blinding_success_rates: {},
        randomization_success_rates: {}
      };
    }
  }

  /**
   * Calculate success rates for a specific feature
   */
  private calculateFeatureSuccessRates(data: any[], featureKey: string): Record<string, number> {
    const result: Record<string, {total: number, success: number}> = {};
    
    // Group by feature value
    data.forEach(item => {
      const featureValue = item[featureKey] || 'Unknown';
      if (!result[featureValue]) {
        result[featureValue] = {total: 0, success: 0};
      }
      
      result[featureValue].total++;
      if (item.status === 'Completed' || item.status === 'Successful') {
        result[featureValue].success++;
      }
    });
    
    // Calculate rates
    const rates: Record<string, number> = {};
    Object.entries(result).forEach(([key, {total, success}]) => {
      rates[key] = total > 0 ? (success / total) : 0;
    });
    
    return rates;
  }

  /**
   * Get endpoint-related metrics from similar trials
   */
  private async getEndpointMetrics(indication: string, phase: string): Promise<any> {
    try {
      // Get endpoint data from successful trials
      const endpointData = await db.select({
        primary_objective: csrDetails.primaryObjective,
        patient_reported: csrDetails.patientReportedOutcome,
        biomarker_used: csrDetails.biomarkerUsed,
        results: csrDetails.results
      })
      .from(csrReports)
      .leftJoin(csrDetails, eq(csrReports.id, csrDetails.reportId))
      .where(
        and(
          like(csrReports.indication, `%${indication}%`),
          like(csrReports.phase, `%${phase}%`),
          eq(csrReports.status, 'Completed')
        )
      );
      
      // Analyze what percentage of successful trials use patient-reported outcomes
      const totalSuccessful = endpointData.length;
      const patientReportedCount = endpointData.filter(
        data => data.patient_reported === 'Yes'
      ).length;
      
      const biomarkerCount = endpointData.filter(
        data => data.biomarker_used === 'Yes'
      ).length;

      return {
        patient_reported_outcome_rate: totalSuccessful > 0 
          ? patientReportedCount / totalSuccessful 
          : 0,
        biomarker_usage_rate: totalSuccessful > 0 
          ? biomarkerCount / totalSuccessful 
          : 0,
        endpoint_count: totalSuccessful
      };
    } catch (error) {
      console.error('Error getting endpoint metrics:', error);
      return {
        patient_reported_outcome_rate: 0,
        biomarker_usage_rate: 0,
        endpoint_count: 0
      };
    }
  }

  /**
   * Get deep optimization recommendations for a clinical trial protocol
   * 
   * @param protocolData Protocol data
   * @param benchmarks Benchmark data for similar trials
   * @param prediction Current prediction score
   * @returns Detailed optimization recommendations with field-level insights
   */
  async getDeepOptimizationRecommendations(
    protocolData: any,
    benchmarks: BenchmarkData,
    prediction: number
  ): Promise<DeepOptimizationResult> {
    try {
      // Get endpoint field insights
      const endpointInsights = await this.analyzeEndpointQuality(
        protocolData.indication,
        protocolData.phase,
        protocolData.primary_endpoint,
        protocolData.secondary_endpoints || []
      );
      
      // Get design field insights
      const designInsights = await this.analyzeStudyDesign(
        protocolData.indication,
        protocolData.phase,
        protocolData.blinding || 'Not specified',
        protocolData.randomization || 'Not specified',
        protocolData.arms || 2,
        protocolData.control_type || 'Not specified'
      );
      
      // Get population field insights
      const populationInsights = await this.analyzePatientPopulation(
        protocolData.indication,
        protocolData.phase,
        protocolData.sample_size,
        protocolData.population || ''
      );
      
      // Generate field-level insights
      const fieldLevelInsights = {
        endpoint: endpointInsights,
        design: designInsights,
        population: populationInsights,
        duration: this.analyzeDuration(protocolData.duration_weeks, benchmarks)
      };
      
      // Generate optimization recommendations
      const recommendations = await this.generateDeepRecommendations(
        protocolData,
        fieldLevelInsights,
        benchmarks,
        prediction
      );
      
      // Get field weights for explainability
      const modelWeights = await this.getFieldImportance();
      
      // Get statistical analysis plan recommendations
      const sapRecommendations = await this.getSapRecommendations(
        protocolData.indication,
        protocolData.phase,
        protocolData.primary_endpoint,
        protocolData.sample_size
      );
      
      // Generate optimized protocol
      const optimizedProtocol = this.generateOptimizedProtocol(
        protocolData,
        fieldLevelInsights,
        benchmarks
      );
      
      // Calculate improved prediction
      const improvedPrediction = this.estimateImprovedPrediction(
        prediction,
        protocolData,
        optimizedProtocol,
        fieldLevelInsights
      );
      
      return {
        fieldLevelInsights,
        recommendations,
        modelWeights,
        optimizedProtocol,
        improvedPrediction,
        sapRecommendations
      };
    } catch (error) {
      console.error('Error generating deep optimization recommendations:', error);
      return {
        fieldLevelInsights: {
          endpoint: {score: 0, insights: []},
          design: {score: 0, insights: []},
          population: {score: 0, insights: []},
          duration: {score: 0, insights: []}
        },
        recommendations: [
          "Unable to generate detailed optimization recommendations due to an error.",
          "Please check your protocol data and try again with complete information."
        ],
        modelWeights: {
          endpoint: 0.3,
          design: 0.25,
          population: 0.25,
          duration: 0.2
        },
        optimizedProtocol: {...protocolData},
        improvedPrediction: prediction
      };
    }
  }

  /**
   * Analyze the quality of endpoint definitions
   */
  private async analyzeEndpointQuality(
    indication: string,
    phase: string,
    primaryEndpoint: string,
    secondaryEndpoints: string[]
  ): Promise<FieldInsight> {
    let score = 0.5; // Default middle score
    const insights: string[] = [];
    
    // Evaluate primary endpoint appropriateness
    if (!primaryEndpoint) {
      score = 0.3;
      insights.push("Missing primary endpoint definition - this is a critical protocol component.");
    } else {
      // Check for common quality indicators in the endpoint
      const hasObjectiveMeasure = /rate|change|reduction|improvement|level|concentration|score|index|ratio/i.test(primaryEndpoint);
      const hasTimeframe = /week|month|day|hour|minute|year/i.test(primaryEndpoint);
      const hasStatisticalElement = /mean|median|percentage|proportion|frequency|p-value|significance|statistical/i.test(primaryEndpoint);
      
      // Adjust score based on endpoint quality
      if (hasObjectiveMeasure) score += 0.1;
      if (hasTimeframe) score += 0.1;
      if (hasStatisticalElement) score += 0.1;
      
      // Check secondary endpoints
      if (secondaryEndpoints.length === 0) {
        score -= 0.1;
        insights.push("No secondary endpoints defined - consider adding supportive endpoints.");
      } else if (secondaryEndpoints.length >= 3) {
        score += 0.1;
      }
      
      // Generate specific insights
      if (!hasObjectiveMeasure) {
        insights.push("Primary endpoint lacks objective measurement criteria.");
      }
      
      if (!hasTimeframe) {
        insights.push("Primary endpoint should specify timeframe for assessment.");
      }
      
      if (!hasStatisticalElement) {
        insights.push("Consider adding statistical basis for endpoint evaluation.");
      }
    }
    
    // Add indication-specific recommendations using HuggingFace
    try {
      const aiRecommendations = await this.getEndpointRecommendations(
        indication,
        phase,
        primaryEndpoint
      );
      
      insights.push(...aiRecommendations);
    } catch (error) {
      console.error('Error getting AI endpoint recommendations:', error);
    }
    
    // Ensure score is within bounds
    score = Math.max(0, Math.min(1, score));
    
    return {
      score,
      insights: [...new Set(insights)] // Remove duplicates
    };
  }

  /**
   * Analyze study design elements
   */
  private async analyzeStudyDesign(
    indication: string,
    phase: string,
    blinding: string,
    randomization: string,
    arms: number,
    controlType: string
  ): Promise<FieldInsight> {
    let score = 0.5; // Default middle score
    const insights: string[] = [];
    
    // Evaluate blinding
    if (!blinding || blinding === 'Not specified') {
      score -= 0.1;
      insights.push("Blinding approach not specified - recommend defining blinding strategy.");
    } else if (blinding.toLowerCase().includes('double') || blinding.toLowerCase().includes('triple')) {
      score += 0.15;
    } else if (blinding.toLowerCase().includes('single')) {
      score += 0.05;
    } else if (blinding.toLowerCase().includes('open') || blinding.toLowerCase().includes('none')) {
      if (phase.includes('3')) {
        score -= 0.1;
        insights.push("Open-label design may be suboptimal for Phase 3 - consider double-blinding.");
      }
    }
    
    // Evaluate randomization
    if (!randomization || randomization === 'Not specified') {
      score -= 0.1;
      insights.push("Randomization method not specified - recommend defining randomization strategy.");
    } else if (randomization.toLowerCase().includes('stratified')) {
      score += 0.15;
    } else if (randomization.toLowerCase().includes('block')) {
      score += 0.1;
    } else if (randomization.toLowerCase().includes('simple')) {
      score += 0.05;
    }
    
    // Evaluate number of arms
    if (phase.includes('2')) {
      if (arms < 2) {
        score -= 0.05;
        insights.push("Single-arm design for Phase 2 limits comparative analysis.");
      } else if (arms >= 3) {
        score += 0.1;
        insights.push("Multi-arm design in Phase 2 helps optimize dose/regimen selection.");
      }
    } else if (phase.includes('3')) {
      if (arms < 2) {
        score -= 0.2;
        insights.push("Single-arm design is typically insufficient for Phase 3 regulatory approval.");
      }
    }
    
    // Evaluate control type
    if (!controlType || controlType === 'Not specified') {
      score -= 0.05;
      insights.push("Control type not specified - define whether placebo, active, or standard of care.");
    } else if (controlType.toLowerCase().includes('placebo') && phase.includes('3')) {
      // For certain indications, placebo-controlled Phase 3 might be ethically questionable
      if (
        indication.toLowerCase().includes('cancer') || 
        indication.toLowerCase().includes('oncology')
      ) {
        score -= 0.1;
        insights.push("Placebo control in advanced cancer may present ethical concerns - consider active control.");
      }
    } else if (controlType.toLowerCase().includes('active') || controlType.toLowerCase().includes('standard')) {
      score += 0.05;
    }
    
    // Add indication-specific study design insights
    const designPrompt = `
      As a clinical trial design expert, analyze this study design for ${indication} (Phase ${phase}):
      Blinding: ${blinding}
      Randomization: ${randomization}
      Number of arms: ${arms}
      Control type: ${controlType}
      
      Provide 1-2 specific recommendations to optimize this study design. Be concise and specific.
    `;
    
    try {
      const designRecommendation = await huggingFaceService.queryHuggingFace(designPrompt);
      if (designRecommendation) {
        const recommendations = designRecommendation
          .split('\n')
          .filter(line => line.trim().length > 15)
          .slice(0, 2);
          
        insights.push(...recommendations);
      }
    } catch (error) {
      console.error('Error getting design recommendations:', error);
    }
    
    // Ensure score is within bounds
    score = Math.max(0, Math.min(1, score));
    
    return {
      score,
      insights: [...new Set(insights)] // Remove duplicates
    };
  }

  /**
   * Analyze patient population and inclusion/exclusion
   */
  private async analyzePatientPopulation(
    indication: string,
    phase: string,
    sampleSize: number,
    populationDescription: string
  ): Promise<FieldInsight> {
    let score = 0.5; // Default middle score
    const insights: string[] = [];
    
    // Evaluate sample size
    if (sampleSize <= 0) {
      score -= 0.2;
      insights.push("Sample size not specified - this is a critical protocol component.");
    }
    
    // Evaluate population description
    if (!populationDescription) {
      score -= 0.1;
      insights.push("Patient population not adequately described.");
    } else {
      // Check for key population elements
      const hasAgeRange = /age|year/i.test(populationDescription);
      const hasDiseaseStage = /stage|grade|score|severity|mild|moderate|severe/i.test(populationDescription);
      const hasPriorTreatment = /treatment|therapy|naive|experienced|refractory|resistant/i.test(populationDescription);
      
      if (hasAgeRange) score += 0.05;
      if (hasDiseaseStage) score += 0.05;
      if (hasPriorTreatment) score += 0.05;
      
      if (!hasAgeRange) {
        insights.push("Population description should include age range criteria.");
      }
      
      if (!hasDiseaseStage) {
        insights.push("Consider specifying disease stage or severity criteria.");
      }
      
      if (!hasPriorTreatment) {
        insights.push("Define prior treatment status in inclusion/exclusion criteria.");
      }
    }
    
    // Add indication-specific population recommendations
    const populationPrompt = `
      As a clinical trial expert, provide 1-2 concise recommendations for optimizing patient selection
      for a ${phase} clinical trial in ${indication} with sample size of ${sampleSize}.
      Focus on inclusion/exclusion criteria that might increase trial success.
      Be specific and concise.
    `;
    
    try {
      const populationRecommendation = await huggingFaceService.queryHuggingFace(populationPrompt);
      if (populationRecommendation) {
        const recommendations = populationRecommendation
          .split('\n')
          .filter(line => line.trim().length > 15)
          .slice(0, 2);
          
        insights.push(...recommendations);
      }
    } catch (error) {
      console.error('Error getting population recommendations:', error);
    }
    
    // Ensure score is within bounds
    score = Math.max(0, Math.min(1, score));
    
    return {
      score,
      insights: [...new Set(insights)] // Remove duplicates
    };
  }

  /**
   * Analyze trial duration
   */
  private analyzeDuration(
    durationWeeks: number,
    benchmarks: BenchmarkData
  ): FieldInsight {
    let score = 0.5; // Default middle score
    const insights: string[] = [];
    
    if (durationWeeks <= 0) {
      score = 0.3;
      insights.push("Trial duration not specified - this is a critical protocol component.");
      return { score, insights };
    }
    
    const avgDuration = benchmarks.avg_duration_weeks;
    const stdDev = benchmarks.duration_stddev || (avgDuration * 0.2); // Fallback to 20% if no stdDev
    
    // Calculate how far from the mean
    const zScore = (durationWeeks - avgDuration) / stdDev;
    
    if (Math.abs(zScore) <= 1.0) {
      // Within 1 standard deviation - good
      score = 0.8;
      insights.push(`Duration of ${durationWeeks} weeks aligns well with similar successful trials.`);
    } else if (zScore > 1.0) {
      // Longer than average
      score = 0.7 - Math.min(0.3, (zScore - 1) * 0.1); // Reduce score as it gets longer
      insights.push(`Duration of ${durationWeeks} weeks is longer than average (${Math.round(avgDuration)} weeks).`);
      insights.push("Longer trials may increase participant dropout and study costs.");
    } else if (zScore < -1.0) {
      // Shorter than average
      score = 0.7 - Math.min(0.3, (Math.abs(zScore) - 1) * 0.1); // Reduce score as it gets shorter
      insights.push(`Duration of ${durationWeeks} weeks is shorter than average (${Math.round(avgDuration)} weeks).`);
      insights.push("Shorter duration may not capture key efficacy or safety signals.");
    }
    
    // Add specific recommendations
    if (zScore > 1.5) {
      insights.push(`Consider reducing duration to ${Math.round(avgDuration + stdDev)} weeks to improve completion rates.`);
    } else if (zScore < -1.5) {
      insights.push(`Consider extending duration to at least ${Math.round(avgDuration - stdDev)} weeks for adequate endpoint assessment.`);
    }
    
    return {
      score: Math.max(0, Math.min(1, score)),
      insights: [...new Set(insights)] // Remove duplicates
    };
  }

  /**
   * Generate comprehensive recommendations based on field insights
   */
  private async generateDeepRecommendations(
    protocolData: any,
    fieldInsights: any,
    benchmarks: BenchmarkData,
    prediction: number
  ): Promise<string[]> {
    const recommendations: string[] = [];
    
    // Add field-specific recommendations based on lowest scores
    const fieldScores = [
      { field: 'endpoint', score: fieldInsights.endpoint.score, name: 'Endpoint Selection' },
      { field: 'design', score: fieldInsights.design.score, name: 'Study Design' },
      { field: 'population', score: fieldInsights.population.score, name: 'Patient Population' },
      { field: 'duration', score: fieldInsights.duration.score, name: 'Trial Duration' }
    ];
    
    // Sort fields by score (lowest first)
    fieldScores.sort((a, b) => a.score - b.score);
    
    // Add prioritized recommendations for lowest scoring fields
    for (const field of fieldScores) {
      if (field.score < 0.6) {
        recommendations.push(`**${field.name} Optimization Priority**: ${fieldInsights[field.field].insights[0] || 'Review and refine this aspect of the protocol.'}`);
      }
    }
    
    // Add benchmarking recommendations
    if (protocolData.sample_size < benchmarks.avg_sample_size * 0.8) {
      recommendations.push(`**Sample Size Alignment**: Consider increasing sample size from ${protocolData.sample_size} to ${Math.round(benchmarks.avg_sample_size)} participants to match successful trials in ${protocolData.indication}.`);
    }
    
    // Add AI-generated strategic recommendations
    const strategicPrompt = `
      As a clinical trial strategy expert, analyze this Phase ${protocolData.phase} protocol for ${protocolData.indication}:
      
      Primary endpoint: ${protocolData.primary_endpoint}
      Sample size: ${protocolData.sample_size}
      Duration: ${protocolData.duration_weeks} weeks
      ${protocolData.blinding ? `Blinding: ${protocolData.blinding}` : ''}
      ${protocolData.randomization ? `Randomization: ${protocolData.randomization}` : ''}
      
      The protocol's current predicted success probability is ${Math.round(prediction * 100)}%.
      
      Provide 2-3 specific, actionable strategic recommendations to increase the likelihood of trial success.
      Focus on addressing the most critical design limitations. Be specific and concise.
    `;
    
    try {
      const strategicRecommendation = await huggingFaceService.queryHuggingFace(strategicPrompt);
      if (strategicRecommendation) {
        const aiRecs = strategicRecommendation
          .split('\n')
          .filter(line => line.trim().length > 20)
          .slice(0, 3)
          .map(rec => `**Strategic Recommendation**: ${rec.trim()}`);
          
        recommendations.push(...aiRecs);
      }
    } catch (error) {
      console.error('Error getting strategic recommendations:', error);
    }
    
    return recommendations;
  }

  /**
   * Get relative importance of different protocol fields
   */
  private async getFieldImportance(): Promise<Record<string, number>> {
    // Return fixed weights based on literature and expert knowledge
    // In a real model, these would come from feature importance in the ML model
    return {
      endpoint: 0.30,  // Endpoint definition quality
      design: 0.25,    // Study design elements
      population: 0.25, // Patient population definition
      duration: 0.20   // Trial duration
    };
  }

  /**
   * Get statistical analysis plan recommendations
   */
  private async getSapRecommendations(
    indication: string,
    phase: string,
    primaryEndpoint: string,
    sampleSize: number
  ): Promise<string[]> {
    try {
      const sapPrompt = `
        As a clinical biostatistician, provide 3 specific recommendations for the statistical analysis plan 
        for a Phase ${phase} clinical trial in ${indication} with primary endpoint: "${primaryEndpoint}" 
        and sample size of ${sampleSize}.
        
        Format as concise bullet points focusing on:
        1. Analysis population definition
        2. Handling of missing data
        3. Statistical testing approach
        
        Be specific and concise. No introduction or conclusion needed.
      `;
      
      const sapResponse = await huggingFaceService.queryHuggingFace(sapPrompt);
      
      if (!sapResponse) {
        return [
          "Define intention-to-treat (ITT) and per-protocol populations clearly in the SAP.",
          "Specify multiple imputation approach for handling missing data.",
          "Include sensitivity analyses to assess robustness of primary findings."
        ];
      }
      
      // Process the response to extract recommendations
      const recommendations = sapResponse
        .split('\n')
        .filter(line => line.trim().length > 15)
        .map(line => line.replace(/^\d+\.\s+|\*\s+/, '').trim())
        .slice(0, 5);
      
      return recommendations;
    } catch (error) {
      console.error('Error getting SAP recommendations:', error);
      return [
        "Define intention-to-treat (ITT) and per-protocol populations clearly in the SAP.",
        "Specify multiple imputation approach for handling missing data.",
        "Include sensitivity analyses to assess robustness of primary findings."
      ];
    }
  }

  /**
   * Generate optimized protocol based on insights
   */
  private generateOptimizedProtocol(
    originalProtocol: any,
    fieldInsights: any,
    benchmarks: BenchmarkData
  ): any {
    const optimizedProtocol = { ...originalProtocol };
    
    // Optimize sample size if needed
    if (originalProtocol.sample_size < benchmarks.avg_sample_size * 0.8) {
      optimizedProtocol.sample_size = Math.round(benchmarks.avg_sample_size);
    }
    
    // Optimize duration if needed
    const durationInsight = fieldInsights.duration;
    if (durationInsight.score < 0.6) {
      optimizedProtocol.duration_weeks = Math.round(benchmarks.avg_duration_weeks);
    }
    
    // Add blinding if missing
    if (!originalProtocol.blinding || originalProtocol.blinding === 'Not specified') {
      // Default to double-blind for phase 2/3
      if (originalProtocol.phase.includes('2') || originalProtocol.phase.includes('3')) {
        optimizedProtocol.blinding = 'Double-blind';
      } else {
        optimizedProtocol.blinding = 'Single-blind';
      }
    }
    
    // Add randomization if missing
    if (!originalProtocol.randomization || originalProtocol.randomization === 'Not specified') {
      optimizedProtocol.randomization = 'Stratified randomization';
    }
    
    // Enhanced primary endpoint if score is low
    if (fieldInsights.endpoint.score < 0.6 && originalProtocol.primary_endpoint) {
      // Enhance the endpoint definition with timing and measurement
      let enhancedEndpoint = originalProtocol.primary_endpoint;
      
      // Add timeframe if missing
      if (!/week|month|day|hour|year/i.test(enhancedEndpoint)) {
        enhancedEndpoint += ` at ${Math.round(benchmarks.avg_duration_weeks)} weeks`;
      }
      
      // Add statistical basis if missing
      if (!/mean|median|percentage|proportion|statistical/i.test(enhancedEndpoint)) {
        enhancedEndpoint += ` (change from baseline, assessed by ANOVA)`;
      }
      
      optimizedProtocol.primary_endpoint = enhancedEndpoint;
    }
    
    return optimizedProtocol;
  }

  /**
   * Estimate improved prediction score based on optimizations
   */
  private estimateImprovedPrediction(
    currentPrediction: number,
    originalProtocol: any,
    optimizedProtocol: any,
    fieldInsights: any
  ): number {
    let improvementFactor = 0;
    
    // Sample size improvement
    if (optimizedProtocol.sample_size > originalProtocol.sample_size) {
      const percentIncrease = (optimizedProtocol.sample_size - originalProtocol.sample_size) / originalProtocol.sample_size;
      improvementFactor += percentIncrease * 0.1; // Up to 10% improvement for sample size
    }
    
    // Duration optimization
    if (optimizedProtocol.duration_weeks !== originalProtocol.duration_weeks) {
      improvementFactor += 0.05;
    }
    
    // Design improvements (blinding, randomization)
    if (optimizedProtocol.blinding !== originalProtocol.blinding) {
      improvementFactor += 0.07;
    }
    
    if (optimizedProtocol.randomization !== originalProtocol.randomization) {
      improvementFactor += 0.05;
    }
    
    // Endpoint improvement
    if (optimizedProtocol.primary_endpoint !== originalProtocol.primary_endpoint) {
      improvementFactor += 0.08;
    }
    
    // Field insights contribute to overall improvement
    const averageFieldScore = (
      fieldInsights.endpoint.score +
      fieldInsights.design.score +
      fieldInsights.population.score +
      fieldInsights.duration.score
    ) / 4;
    
    // Low scores mean more room for improvement
    if (averageFieldScore < 0.5) {
      improvementFactor += 0.1;
    } else if (averageFieldScore < 0.7) {
      improvementFactor += 0.05;
    }
    
    // Calculate final prediction with diminishing returns for already high predictions
    let improvedPrediction = currentPrediction + (1 - currentPrediction) * improvementFactor;
    
    // Cap at 95% to avoid overpromising
    return Math.min(0.95, improvedPrediction);
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

interface FieldInsight {
  score: number;
  insights: string[];
}

interface DeepOptimizationResult {
  fieldLevelInsights: {
    endpoint: FieldInsight;
    design: FieldInsight;
    population: FieldInsight;
    duration: FieldInsight;
    [key: string]: any;
  };
  recommendations: string[];
  modelWeights: Record<string, number>;
  optimizedProtocol: any;
  improvedPrediction: number;
  sapRecommendations?: string[];
  error?: string;
}

// Create instance of the optimizer service
export const protocolOptimizerService = new ProtocolOptimizerService();