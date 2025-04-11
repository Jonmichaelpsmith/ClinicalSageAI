import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { db } from './db';
import { strategicReports, type InsertStrategicReport } from '@shared/schema';
import { statisticsService } from './statistics-service';

const execPromise = promisify(exec);

/**
 * Strategic Report Generator leverages the ML models and statistical analysis
 * to create comprehensive strategic intelligence reports
 */
export class StrategicReportGenerator {
  private modelDir = path.join(process.cwd(), 'models');
  private dataDir = path.join(process.cwd(), 'data');
  
  /**
   * Generate a complete strategic report based on protocol data
   */
  async generateReport(
    protocolId: number,
    indication: string,
    phase: string,
    primaryEndpoints: string[],
    sampleSize: number,
    duration: number,
    controlType: string,
    blinding: string
  ): Promise<number> {
    console.log(`Generating strategic report for protocol ${protocolId} (${indication}, Phase ${phase})`);
    
    try {
      // 1. Gather historical benchmarking data
      const benchmarkData = await this.getHistoricalBenchmarks(indication, phase);
      
      // 2. Analyze endpoints compared to similar trials
      const endpointAnalysis = await this.analyzeEndpoints(indication, phase, primaryEndpoints);
      
      // 3. Predict success probability
      const successPrediction = await this.predictSuccessProbability({
        indication,
        phase,
        sampleSize,
        duration,
        controlType,
        blinding,
        primaryEndpoint: primaryEndpoints[0]
      });
      
      // 4. Analyze potential failure risks
      const failureRisks = await this.assessFailureRisks({
        indication,
        phase,
        sampleSize,
        duration,
        controlType,
        blinding,
        primaryEndpoint: primaryEndpoints[0]
      });
      
      // 5. Generate competitive landscape analysis
      const competitiveAnalysis = await this.analyzeCompetitiveLandscape(indication, phase);
      
      // 6. Generate strategic recommendations
      const strategicRecommendations = await this.generateStrategicRecommendations({
        successPrediction,
        failureRisks,
        benchmarkData,
        endpointAnalysis,
        competitiveAnalysis,
        protocolParams: {
          indication,
          phase,
          sampleSize,
          duration,
          primaryEndpoints,
          controlType,
          blinding
        }
      });
      
      // 7. Create report structure
      const reportData = this.structureStrategicReport({
        protocolId,
        indication,
        phase, 
        benchmarkData,
        endpointAnalysis,
        successPrediction,
        failureRisks,
        competitiveAnalysis,
        strategicRecommendations
      });
      
      // 8. Save to database
      const [report] = await db.insert(strategicReports).values(reportData).returning();
      
      console.log(`Strategic report generated successfully with ID ${report.id}`);
      return report.id;
      
    } catch (error) {
      console.error('Error generating strategic report:', error);
      throw new Error(`Failed to generate strategic report: ${error.message}`);
    }
  }
  
  /**
   * Get historical benchmarking data for similar trials
   */
  private async getHistoricalBenchmarks(indication: string, phase: string): Promise<any> {
    try {
      // Use statistics service to get benchmark data
      const trialStats = await statisticsService.getIndication(indication);
      const phaseStats = await statisticsService.getPhaseStatistics(phase);
      const combinedStats = await statisticsService.getCombinedStatistics({
        indication,
        phase
      });
      
      return {
        sampleSizeStats: {
          mean: combinedStats.sampleSizeMean || 0,
          median: combinedStats.sampleSizeMedian || 0,
          range: combinedStats.sampleSizeRange || [0, 0]
        },
        durationStats: {
          mean: combinedStats.durationMean || 0,
          median: combinedStats.durationMedian || 0,
          range: combinedStats.durationRange || [0, 0]
        },
        dropoutRateStats: {
          mean: combinedStats.dropoutRateMean || 0,
          median: combinedStats.dropoutRateMedian || 0,
          range: combinedStats.dropoutRateRange || [0, 0]
        },
        successRate: combinedStats.successRate || 0,
        commonDesigns: combinedStats.commonDesigns || [],
        totalTrials: combinedStats.totalTrials || 0
      };
    } catch (error) {
      console.error('Error getting historical benchmarks:', error);
      return {
        sampleSizeStats: { mean: 0, median: 0, range: [0, 0] },
        durationStats: { mean: 0, median: 0, range: [0, 0] },
        dropoutRateStats: { mean: 0, median: 0, range: [0, 0] },
        successRate: 0,
        commonDesigns: [],
        totalTrials: 0
      };
    }
  }
  
  /**
   * Analyze endpoints compared to similar trials
   */
  private async analyzeEndpoints(indication: string, phase: string, primaryEndpoints: string[]): Promise<any> {
    try {
      // Get endpoint statistics
      const endpointStats = await statisticsService.getEndpointStatistics({
        indication,
        phase
      });
      
      // Analyze the submitted endpoints against historical data
      const endpointAnalysis = primaryEndpoints.map(endpoint => {
        const matchingEndpoints = endpointStats.commonEndpoints.filter(e => 
          e.name.toLowerCase().includes(endpoint.toLowerCase()) ||
          endpoint.toLowerCase().includes(e.name.toLowerCase())
        );
        
        return {
          endpoint,
          commonality: matchingEndpoints.length > 0 
            ? (matchingEndpoints[0].frequency / endpointStats.totalTrials) 
            : 0,
          isStandard: matchingEndpoints.length > 0,
          similarEndpoints: matchingEndpoints.map(e => e.name),
          historicalSuccess: matchingEndpoints.length > 0 
            ? matchingEndpoints[0].successRate 
            : null
        };
      });
      
      return {
        endpointAnalysis,
        mostCommonEndpoints: endpointStats.commonEndpoints.slice(0, 5),
        endpointSuccessFactors: endpointStats.endpointSuccessFactors || []
      };
    } catch (error) {
      console.error('Error analyzing endpoints:', error);
      return {
        endpointAnalysis: primaryEndpoints.map(endpoint => ({
          endpoint,
          commonality: 0,
          isStandard: false,
          similarEndpoints: [],
          historicalSuccess: null
        })),
        mostCommonEndpoints: [],
        endpointSuccessFactors: []
      };
    }
  }
  
  /**
   * Predict success probability using ML model
   */
  private async predictSuccessProbability(params: {
    indication: string;
    phase: string;
    sampleSize: number;
    duration: number;
    controlType: string;
    blinding: string;
    primaryEndpoint: string;
  }): Promise<any> {
    try {
      // Create temporary JSON file with trial data
      const tempDataPath = path.join(this.dataDir, `temp_predict_${Date.now()}.json`);
      fs.writeFileSync(tempDataPath, JSON.stringify(params));
      
      // Run Python prediction script
      const scriptPath = path.join(process.cwd(), 'server/scripts/predict_success.py');
      const { stdout, stderr } = await execPromise(
        `python ${scriptPath} --input ${tempDataPath}`
      );
      
      // Parse results
      fs.unlinkSync(tempDataPath); // Clean up temp file
      const result = JSON.parse(stdout);
      
      // Add feature importance data
      return {
        successProbability: result.probability,
        confidence: result.confidence,
        keyFactors: [
          { name: 'Sample Size', impact: result.feature_importance.sample_size || 0 },
          { name: 'Duration', impact: result.feature_importance.duration_weeks || 0 },
          { name: 'Dropout Rate', impact: result.feature_importance.dropout_rate || 0 },
          { name: 'Phase', impact: result.feature_importance.phase || 0 },
          { name: 'Blinding', impact: result.feature_importance.blinding || 0 }
        ].sort((a, b) => b.impact - a.impact)
      };
    } catch (error) {
      console.error('Error predicting success probability:', error);
      // Fall back to statistical prediction if ML model fails
      return this.statisticalSuccessPrediction(params);
    }
  }
  
  /**
   * Statistical success prediction as fallback
   */
  private async statisticalSuccessPrediction(params: {
    indication: string;
    phase: string;
    sampleSize: number;
    duration: number;
    controlType: string;
    blinding: string;
    primaryEndpoint: string;
  }): Promise<any> {
    try {
      // Get statistics for similar trials
      const stats = await statisticsService.getCombinedStatistics({
        indication: params.indication,
        phase: params.phase
      });
      
      // Base probability on historical success rate
      let probability = stats.successRate || 0.3;
      
      // Adjust based on sample size
      if (params.sampleSize > stats.sampleSizeMean) {
        probability += 0.05;
      } else if (params.sampleSize < stats.sampleSizeMean * 0.8) {
        probability -= 0.05;
      }
      
      // Adjust based on duration
      if (params.duration > stats.durationMean * 1.2) {
        probability -= 0.03;
      }
      
      // Adjust based on blinding
      if (params.blinding === 'double-blind') {
        probability += 0.03;
      } else if (params.blinding === 'open-label') {
        probability -= 0.02;
      }
      
      return {
        successProbability: Math.max(0.1, Math.min(0.9, probability)),
        confidence: 0.7,
        keyFactors: [
          { name: 'Sample Size', impact: 0.15 },
          { name: 'Duration', impact: 0.12 },
          { name: 'Dropout Rate', impact: 0.13 },
          { name: 'Phase', impact: 0.18 },
          { name: 'Blinding', impact: 0.11 }
        ]
      };
    } catch (error) {
      console.error('Error in statistical success prediction:', error);
      return {
        successProbability: 0.5,
        confidence: 0.5,
        keyFactors: [
          { name: 'Sample Size', impact: 0.15 },
          { name: 'Duration', impact: 0.12 },
          { name: 'Dropout Rate', impact: 0.13 },
          { name: 'Phase', impact: 0.18 },
          { name: 'Blinding', impact: 0.11 }
        ]
      };
    }
  }
  
  /**
   * Assess failure risks using the failure reason classifier
   */
  private async assessFailureRisks(params: {
    indication: string;
    phase: string;
    sampleSize: number;
    duration: number;
    controlType: string;
    blinding: string;
    primaryEndpoint: string;
  }): Promise<any> {
    try {
      // Create temporary JSON file with trial data
      const tempDataPath = path.join(this.dataDir, `temp_risks_${Date.now()}.json`);
      fs.writeFileSync(tempDataPath, JSON.stringify(params));
      
      // Run Python failure analysis script
      const scriptPath = path.join(process.cwd(), 'server/scripts/predict_failure_reasons.py');
      const { stdout, stderr } = await execPromise(
        `python ${scriptPath} --input ${tempDataPath}`
      );
      
      // Parse results
      fs.unlinkSync(tempDataPath); // Clean up temp file
      const result = JSON.parse(stdout);
      
      return {
        primaryRisks: result.primary_risks,
        riskBreakdown: result.risk_breakdown,
        mitigationStrategies: result.mitigation_strategies
      };
    } catch (error) {
      console.error('Error assessing failure risks:', error);
      // Fall back to statistical risk assessment
      return this.statisticalRiskAssessment(params);
    }
  }
  
  /**
   * Statistical risk assessment as fallback
   */
  private async statisticalRiskAssessment(params: {
    indication: string;
    phase: string;
    sampleSize: number;
    duration: number;
    controlType: string;
    blinding: string;
    primaryEndpoint: string;
  }): Promise<any> {
    // Get common risks for the indication/phase
    try {
      const stats = await statisticsService.getCombinedStatistics({
        indication: params.indication,
        phase: params.phase
      });
      
      // Create a risk profile based on trial parameters
      const risks = [];
      
      // Sample size risk
      if (params.sampleSize < stats.sampleSizeMean * 0.8) {
        risks.push({
          category: 'statistical',
          description: 'Underpowered study',
          probability: 0.7,
          impact: 'High',
          mitigation: 'Consider increasing sample size or refining endpoints to reduce variability'
        });
      }
      
      // Duration risk
      if (params.duration < stats.durationMean * 0.7) {
        risks.push({
          category: 'efficacy',
          description: 'Insufficient time to observe effect',
          probability: 0.6,
          impact: 'Medium',
          mitigation: 'Extend study duration or include interim analyses'
        });
      }
      
      // Blinding risk
      if (params.blinding === 'open-label') {
        risks.push({
          category: 'design',
          description: 'Bias due to open-label design',
          probability: 0.5,
          impact: 'Medium',
          mitigation: 'Implement objective endpoints and independent outcome assessment'
        });
      }
      
      // Add some indication-specific risks
      const indicationRisks = {
        'COPD': {
          category: 'safety',
          description: 'Exacerbation of respiratory symptoms',
          probability: 0.4,
          impact: 'High',
          mitigation: 'Careful patient selection and monitoring of respiratory function'
        },
        'Oncology': {
          category: 'efficacy',
          description: 'Heterogeneous patient population affecting response',
          probability: 0.6,
          impact: 'High',
          mitigation: 'Consider biomarker-based stratification'
        },
        'Diabetes': {
          category: 'safety',
          description: 'Hypoglycemia risk',
          probability: 0.5,
          impact: 'Medium',
          mitigation: 'Careful dose selection and safety monitoring'
        }
      };
      
      const generalRisks = [
        {
          category: 'enrollment',
          description: 'Slow recruitment affecting timeline',
          probability: 0.5,
          impact: 'Medium',
          mitigation: 'Broaden inclusion criteria or add more sites'
        },
        {
          category: 'regulatory',
          description: 'Evolving regulatory landscape',
          probability: 0.3,
          impact: 'Medium',
          mitigation: 'Early regulatory engagement and protocol review'
        }
      ];
      
      // Add indication-specific risk if available
      Object.keys(indicationRisks).forEach(ind => {
        if (params.indication.toLowerCase().includes(ind.toLowerCase())) {
          risks.push(indicationRisks[ind]);
        }
      });
      
      // Add general risks
      risks.push(...generalRisks);
      
      // Calculate risk breakdown by category
      const categories = risks.map(r => r.category);
      const uniqueCategories = [...new Set(categories)];
      const riskBreakdown = uniqueCategories.map(category => {
        const count = categories.filter(c => c === category).length;
        return {
          category,
          percentage: (count / risks.length) * 100
        };
      });
      
      return {
        primaryRisks: risks,
        riskBreakdown,
        mitigationStrategies: risks.map(r => r.mitigation)
      };
    } catch (error) {
      console.error('Error in statistical risk assessment:', error);
      return {
        primaryRisks: [
          {
            category: 'statistical',
            description: 'Potential underpowering',
            probability: 0.5,
            impact: 'Medium',
            mitigation: 'Review sample size calculations'
          },
          {
            category: 'enrollment',
            description: 'Recruitment challenges',
            probability: 0.5,
            impact: 'Medium',
            mitigation: 'Optimize site selection and enrollment criteria'
          }
        ],
        riskBreakdown: [
          { category: 'statistical', percentage: 50 },
          { category: 'enrollment', percentage: 50 }
        ],
        mitigationStrategies: [
          'Review sample size calculations',
          'Optimize site selection and enrollment criteria'
        ]
      };
    }
  }
  
  /**
   * Analyze competitive landscape
   */
  private async analyzeCompetitiveLandscape(indication: string, phase: string): Promise<any> {
    try {
      // Get competitive analysis from statistics service
      const competitiveAnalysis = await statisticsService.getCompetitiveAnalysis({
        indication,
        phase
      });
      
      return {
        topSponsors: competitiveAnalysis.topSponsors || [],
        recentTrials: competitiveAnalysis.recentTrials || [],
        trendingEndpoints: competitiveAnalysis.trendingEndpoints || [],
        emergingDesigns: competitiveAnalysis.emergingDesigns || [],
        marketInsights: competitiveAnalysis.marketInsights || []
      };
    } catch (error) {
      console.error('Error analyzing competitive landscape:', error);
      return {
        topSponsors: [],
        recentTrials: [],
        trendingEndpoints: [],
        emergingDesigns: [],
        marketInsights: []
      };
    }
  }
  
  /**
   * Generate strategic recommendations based on all analyses
   */
  private async generateStrategicRecommendations(params: {
    successPrediction: any;
    failureRisks: any;
    benchmarkData: any;
    endpointAnalysis: any;
    competitiveAnalysis: any;
    protocolParams: {
      indication: string;
      phase: string;
      sampleSize: number;
      duration: number;
      primaryEndpoints: string[];
      controlType: string;
      blinding: string;
    };
  }): Promise<any> {
    try {
      // Generate design optimization recommendations
      const designRecommendations = this.generateDesignRecommendations(params);
      
      // Generate endpoint recommendations
      const endpointRecommendations = this.generateEndpointRecommendations(params);
      
      // Generate risk mitigation recommendations
      const riskRecommendations = params.failureRisks.primaryRisks.map(risk => risk.mitigation);
      
      // Generate competitive advantage recommendations
      const competitiveRecommendations = this.generateCompetitiveRecommendations(params);
      
      return {
        designRecommendations,
        endpointRecommendations,
        riskRecommendations,
        competitiveRecommendations,
        summary: this.generateRecommendationSummary({
          designRecommendations,
          endpointRecommendations,
          riskRecommendations,
          competitiveRecommendations,
          successProbability: params.successPrediction.successProbability
        })
      };
    } catch (error) {
      console.error('Error generating strategic recommendations:', error);
      return {
        designRecommendations: [],
        endpointRecommendations: [],
        riskRecommendations: [],
        competitiveRecommendations: [],
        summary: 'Unable to generate recommendations due to an error.'
      };
    }
  }
  
  /**
   * Generate design optimization recommendations
   */
  private generateDesignRecommendations(params: any): string[] {
    const recommendations = [];
    const { protocolParams, benchmarkData } = params;
    
    // Sample size recommendations
    if (protocolParams.sampleSize < benchmarkData.sampleSizeStats.mean * 0.8) {
      recommendations.push(
        `Consider increasing sample size from ${protocolParams.sampleSize} to at least ${Math.round(benchmarkData.sampleSizeStats.mean * 0.8)} to improve statistical power.`
      );
    }
    
    // Duration recommendations
    if (protocolParams.duration < benchmarkData.durationStats.mean * 0.7) {
      recommendations.push(
        `The planned duration of ${protocolParams.duration} weeks may be insufficient based on historical data. Consider extending to at least ${Math.round(benchmarkData.durationStats.mean * 0.8)} weeks.`
      );
    }
    
    // Blinding recommendations
    if (protocolParams.blinding === 'open-label' && benchmarkData.successRate < 0.4) {
      recommendations.push(
        'Consider using a blinded design to reduce bias and strengthen evidence, as open-label designs show lower success rates in this indication.'
      );
    }
    
    // Control type recommendations
    if (protocolParams.controlType === 'none') {
      recommendations.push(
        'Adding a control arm would strengthen the study design and improve the ability to interpret results.'
      );
    }
    
    // Add general recommendations if needed
    if (recommendations.length < 2) {
      recommendations.push(
        'Consider adaptive design elements to allow for sample size re-estimation based on interim results.'
      );
    }
    
    return recommendations;
  }
  
  /**
   * Generate endpoint recommendations
   */
  private generateEndpointRecommendations(params: any): string[] {
    const recommendations = [];
    const { endpointAnalysis, protocolParams } = params;
    
    // Check endpoint commonality and success rates
    protocolParams.primaryEndpoints.forEach((endpoint, index) => {
      const analysis = endpointAnalysis.endpointAnalysis[index];
      
      if (analysis.commonality < 0.2) {
        recommendations.push(
          `The endpoint "${endpoint}" is uncommon in ${protocolParams.indication} trials. Consider using more established endpoints like: ${endpointAnalysis.mostCommonEndpoints.slice(0, 3).map(e => e.name).join(', ')}.`
        );
      }
      
      if (analysis.historicalSuccess !== null && analysis.historicalSuccess < 0.3) {
        recommendations.push(
          `The endpoint "${endpoint}" has historically shown low success rates (${Math.round(analysis.historicalSuccess * 100)}%). Consider using alternative endpoints or increasing sample size to account for this.`
        );
      }
    });
    
    // Recommend more objective endpoints if needed
    if (protocolParams.blinding === 'open-label') {
      recommendations.push(
        'Consider using more objective endpoints to minimize bias in your open-label design.'
      );
    }
    
    return recommendations;
  }
  
  /**
   * Generate competitive advantage recommendations
   */
  private generateCompetitiveRecommendations(params: any): string[] {
    const recommendations = [];
    const { competitiveAnalysis } = params;
    
    // Identify gaps or opportunities in the competitive landscape
    if (competitiveAnalysis.emergingDesigns.length > 0) {
      recommendations.push(
        `Consider incorporating emerging design trends: ${competitiveAnalysis.emergingDesigns.slice(0, 2).join(', ')}.`
      );
    }
    
    if (competitiveAnalysis.trendingEndpoints.length > 0) {
      recommendations.push(
        `Consider adding trending endpoints as secondary measures: ${competitiveAnalysis.trendingEndpoints.slice(0, 2).join(', ')}.`
      );
    }
    
    // Add general competitive recommendations
    recommendations.push(
      'Consider differentiating your study by adding biomarker analyses or patient-reported outcomes that are underrepresented in the current landscape.'
    );
    
    return recommendations;
  }
  
  /**
   * Generate a summary of all recommendations
   */
  private generateRecommendationSummary(params: {
    designRecommendations: string[];
    endpointRecommendations: string[];
    riskRecommendations: string[];
    competitiveRecommendations: string[];
    successProbability: number;
  }): string {
    // Count total recommendations
    const totalRecommendations = 
      params.designRecommendations.length +
      params.endpointRecommendations.length +
      params.riskRecommendations.length +
      params.competitiveRecommendations.length;
    
    // Generate overall assessment based on success probability
    let assessment = '';
    if (params.successProbability >= 0.7) {
      assessment = 'The protocol shows strong potential for success, with only minor optimizations recommended.';
    } else if (params.successProbability >= 0.5) {
      assessment = 'The protocol shows moderate potential for success, with several opportunities for optimization.';
    } else {
      assessment = 'The protocol shows significant risks to success, with multiple critical areas requiring attention.';
    }
    
    // Generate priority recommendations
    const allRecommendations = [
      ...params.designRecommendations.map(r => ({ type: 'design', text: r })),
      ...params.endpointRecommendations.map(r => ({ type: 'endpoint', text: r })),
      ...params.riskRecommendations.map(r => ({ type: 'risk', text: r })),
      ...params.competitiveRecommendations.map(r => ({ type: 'competitive', text: r }))
    ];
    
    // Sort by priority (simplified version - would be more complex in reality)
    const priorityRecs = allRecommendations.slice(0, 3);
    
    // Create summary
    return `${assessment} Analysis identified ${totalRecommendations} potential optimizations across design (${params.designRecommendations.length}), endpoints (${params.endpointRecommendations.length}), risk mitigation (${params.riskRecommendations.length}), and competitive factors (${params.competitiveRecommendations.length}). Key priorities: ${priorityRecs.map(r => r.text).join(' ')}`;
  }
  
  /**
   * Structure the final strategic report
   */
  private structureStrategicReport(params: {
    protocolId: number;
    indication: string;
    phase: string;
    benchmarkData: any;
    endpointAnalysis: any;
    successPrediction: any;
    failureRisks: any;
    competitiveAnalysis: any;
    strategicRecommendations: any;
  }): InsertStrategicReport {
    const title = `Strategic Intelligence Report: ${params.indication} Phase ${params.phase} Protocol`;
    const date = new Date().toISOString();
    
    // Create executive summary
    const executiveSummary = {
      title: title,
      overview: `This strategic intelligence report analyzes a Phase ${params.phase} protocol for ${params.indication}, evaluating historical benchmarks, endpoints, success factors, and competitive landscape to provide strategic recommendations.`,
      successProbability: params.successPrediction.successProbability,
      keyRisks: params.failureRisks.primaryRisks.slice(0, 3).map(r => r.description),
      topRecommendations: params.strategicRecommendations.summary
    };
    
    // Create report content
    const content = {
      historicalBenchmarking: params.benchmarkData,
      endpointAnalysis: params.endpointAnalysis,
      successPrediction: params.successPrediction,
      failureRisks: params.failureRisks,
      competitiveAnalysis: params.competitiveAnalysis,
      strategicRecommendations: params.strategicRecommendations
    };
    
    // Return formatted report data for database insertion
    return {
      title,
      protocolId: params.protocolId,
      generatedDate: date,
      content: content,
      executiveSummary: executiveSummary,
      indication: params.indication,
      phase: params.phase
    };
  }
}

export const strategicReportGenerator = new StrategicReportGenerator();