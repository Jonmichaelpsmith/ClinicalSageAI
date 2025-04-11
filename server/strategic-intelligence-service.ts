/**
 * Strategic Intelligence Service
 * 
 * This service generates comprehensive strategic intelligence reports
 * based on protocol data, CSR matches, and competitive analysis.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { storage } from './storage';
import { notificationService } from './notification-service';
import { academicKnowledgeService } from './academic-knowledge-service';
import { protocolKnowledgeService } from './protocol-knowledge-service';
import { huggingFaceService, HFModel } from './huggingface-service';

// Ensure exports directory exists
const exportsDir = path.join(process.cwd(), 'data/exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

/**
 * Strategic Intelligence Service class
 * Provides methods for generating and exporting strategic intelligence reports
 */
export class StrategicIntelligenceService {
  
  /**
   * Generate a complete strategic intelligence report based on protocol data
   * 
   * @param protocolData Protocol data to analyze
   * @param options Options for report generation
   * @returns Generated report data
   */
  async generateStrategicReport(protocolData: any, options: any = {}) {
    try {
      const indication = protocolData.indication || '';
      const phase = protocolData.phase || '';
      
      // Get matching CSRs based on indication and phase
      const matchingCSRs = await this.findMatchingCSRs(indication, phase);
      
      // Generate report data structure
      const reportData = this.buildReportStructure(protocolData, matchingCSRs, options);
      
      // Analyze endpoints
      reportData.endpointBenchmarking = await this.analyzeEndpoints(protocolData, matchingCSRs);
      
      // Predict design risks
      reportData.designRiskPrediction = await this.predictDesignRisks(protocolData, matchingCSRs);
      
      // Analyze competitive landscape
      reportData.competitiveLandscape = await this.analyzeCompetitiveLandscape(
        protocolData.sponsor || '', indication, phase
      );
      
      // Generate AI recommendations
      reportData.aiRecommendations = await this.generateAIRecommendations(
        protocolData, reportData
      );
      
      return reportData;
    } catch (error) {
      console.error('Error generating strategic report:', error);
      throw error;
    }
  }
  
  /**
   * Find CSRs that match the indication and phase
   * 
   * @param indication Medical indication
   * @param phase Trial phase
   * @returns Array of matching CSRs
   */
  async findMatchingCSRs(indication: string, phase: string) {
    try {
      // Get all trials from storage
      const allTrials = await storage.getAllCsrReports();
      
      // Filter by indication and phase
      let matches = allTrials.filter(trial => {
        const indicationMatch = trial.indication.toLowerCase().includes(indication.toLowerCase());
        const phaseMatch = trial.phase.toLowerCase() === phase.toLowerCase();
        return indicationMatch && phaseMatch;
      });
      
      // If we have fewer than 3 matches, try only indication
      if (matches.length < 3) {
        matches = allTrials.filter(trial => 
          trial.indication.toLowerCase().includes(indication.toLowerCase())
        );
      }
      
      // Sort by relevance (placeholder - in a real app would use semantic search)
      matches.sort((a, b) => {
        // Prioritize exact matches
        const aExactMatch = a.indication.toLowerCase() === indication.toLowerCase() && 
                           a.phase.toLowerCase() === phase.toLowerCase();
        const bExactMatch = b.indication.toLowerCase() === indication.toLowerCase() && 
                           b.phase.toLowerCase() === phase.toLowerCase();
        
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;
        
        // Then prioritize by date
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      });
      
      // Get details for each match
      const matchesWithDetails = await Promise.all(
        matches.slice(0, 10).map(async (match) => {
          const details = await storage.getCsrDetails(match.id);
          return {
            ...match,
            details: details || {}
          };
        })
      );
      
      return matchesWithDetails;
    } catch (error) {
      console.error('Error finding matching CSRs:', error);
      return [];
    }
  }
  
  /**
   * Build the basic report structure
   * 
   * @param protocolData Protocol data
   * @param matchingCSRs Matching CSRs
   * @param options Report options
   * @returns Basic report structure
   */
  buildReportStructure(protocolData: any, matchingCSRs: any[], options: any) {
    const reportId = options.reportId || `SR-${uuidv4().slice(0, 8)}`;
    const now = new Date();
    
    // Format timestamp
    const formattedDate = now.toISOString().split('T')[0];
    
    // Basic report structure
    const report = {
      metadata: {
        reportId,
        title: `Strategic Intelligence Report: ${protocolData.title || 'Untitled Protocol'}`,
        generatedDate: formattedDate,
        version: '1.0',
        protocolId: protocolData.id || protocolData.protocolId || 'N/A',
        indication: protocolData.indication || 'N/A',
        phase: protocolData.phase || 'N/A',
        sponsor: protocolData.sponsor || 'N/A',
        confidentialityLevel: options.confidentialityLevel || 'Confidential'
      },
      
      executiveSummary: {
        overview: `This strategic intelligence report analyzes the ${protocolData.indication} ${protocolData.phase} protocol based on historical clinical trial data and competitive landscape analysis. The report provides evidence-based recommendations to optimize trial design and increase probability of success.`,
        keyFindings: this.extractKeyFindings(protocolData, matchingCSRs),
        strategicRecommendations: this.extractStrategicRecommendations(protocolData, matchingCSRs),
        decisionMatrix: this.generateDecisionMatrix(protocolData, matchingCSRs)
      },
      
      historicalBenchmarking: {
        matchingCriteria: {
          indication: protocolData.indication,
          phase: protocolData.phase,
          additionalFilters: []
        },
        relevantPrecedents: this.extractRelevantPrecedents(matchingCSRs),
        benchmarkMetrics: this.calculateBenchmarkMetrics(matchingCSRs)
      }
    };
    
    return report;
  }
  
  /**
   * Extract key findings from matching CSRs
   * 
   * @param protocolData Protocol data
   * @param matchingCSRs Matching CSRs
   * @returns Array of key findings
   */
  extractKeyFindings(protocolData: any, matchingCSRs: any[]) {
    const findings = [];
    
    // Sample size findings
    const sampleSizes = matchingCSRs
      .map(csr => csr.details?.sampleSize || 0)
      .filter(size => size > 0);
    
    if (sampleSizes.length > 0) {
      const avgSampleSize = Math.round(
        sampleSizes.reduce((sum, size) => sum + size, 0) / sampleSizes.length
      );
      findings.push(`The average sample size for similar ${protocolData.indication} ${protocolData.phase} trials is ${avgSampleSize} patients.`);
    }
    
    // Success rate findings
    const successfulTrials = matchingCSRs.filter(
      csr => csr.status === 'Successful' || csr.status === 'Completed'
    );
    
    if (matchingCSRs.length > 0) {
      const successRate = Math.round((successfulTrials.length / matchingCSRs.length) * 100);
      findings.push(`Historical success rate for similar trials is approximately ${successRate}%.`);
    }
    
    // Duration findings
    const durations = matchingCSRs
      .map(csr => {
        const details = csr.details;
        if (details && details.duration) {
          // Extract numeric value from duration string (e.g. "24 weeks" -> 24)
          const match = details.duration.match(/(\d+)/);
          return match ? parseInt(match[1]) : 0;
        }
        return 0;
      })
      .filter(duration => duration > 0);
    
    if (durations.length > 0) {
      const avgDuration = Math.round(
        durations.reduce((sum, duration) => sum + duration, 0) / durations.length
      );
      findings.push(`The average trial duration is ${avgDuration} weeks.`);
    }
    
    // Endpoint findings
    const primaryEndpoints: string[] = [];
    matchingCSRs.forEach(csr => {
      if (csr.details && csr.details.primaryObjective) {
        primaryEndpoints.push(csr.details.primaryObjective);
      }
    });
    
    const endpointCounts: {[key: string]: number} = {};
    primaryEndpoints.forEach(endpoint => {
      endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
    });
    
    const sortedEndpoints = Object.entries(endpointCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    
    if (sortedEndpoints.length > 0) {
      findings.push(`The most commonly used primary endpoint is "${sortedEndpoints[0]}".`);
    }
    
    return findings;
  }
  
  /**
   * Extract strategic recommendations based on data analysis
   * 
   * @param protocolData Protocol data
   * @param matchingCSRs Matching CSRs
   * @returns Array of strategic recommendations
   */
  extractStrategicRecommendations(protocolData: any, matchingCSRs: any[]) {
    const recommendations = [];
    
    // Sample size recommendation
    const sampleSizes = matchingCSRs
      .map(csr => csr.details?.sampleSize || 0)
      .filter(size => size > 0);
    
    if (sampleSizes.length > 0) {
      const medianSampleSize = this.calculateMedian(sampleSizes);
      recommendations.push(`Consider a minimum sample size of ${medianSampleSize} patients based on historical precedent.`);
    }
    
    // Endpoint recommendation
    const primaryEndpoints: string[] = [];
    matchingCSRs.forEach(csr => {
      if (csr.details && csr.details.primaryObjective) {
        primaryEndpoints.push(csr.details.primaryObjective);
      }
    });
    
    const endpointCounts: {[key: string]: number} = {};
    primaryEndpoints.forEach(endpoint => {
      endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
    });
    
    const sortedEndpoints = Object.entries(endpointCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    
    if (sortedEndpoints.length > 0) {
      recommendations.push(`Select "${sortedEndpoints[0]}" as primary endpoint for highest alignment with regulatory precedent.`);
    }
    
    // Duration recommendation
    const durations = matchingCSRs
      .map(csr => {
        const details = csr.details;
        if (details && details.duration) {
          const match = details.duration.match(/(\d+)/);
          return match ? parseInt(match[1]) : 0;
        }
        return 0;
      })
      .filter(duration => duration > 0);
    
    if (durations.length > 0) {
      const medianDuration = this.calculateMedian(durations);
      recommendations.push(`Plan for a trial duration of at least ${medianDuration} weeks based on historical trial timelines.`);
    }
    
    // Add general recommendation
    recommendations.push(`Conduct a thorough dropout risk assessment and implement mitigation strategies, as high dropout rates correlate with trial failure in this indication.`);
    
    return recommendations;
  }
  
  /**
   * Generate decision matrix for executive summary
   * 
   * @param protocolData Protocol data
   * @param matchingCSRs Matching CSRs
   * @returns Decision matrix object
   */
  generateDecisionMatrix(protocolData: any, matchingCSRs: any[]) {
    // Calculate success rate
    const successfulTrials = matchingCSRs.filter(
      csr => csr.status === 'Successful' || csr.status === 'Completed'
    );
    const successRate = matchingCSRs.length > 0 
      ? (successfulTrials.length / matchingCSRs.length)
      : 0.5; // Default 50% if no data
      
    // Determine risk assessment
    let riskAssessment = 'Medium';
    if (successRate >= 0.7) {
      riskAssessment = 'Low';
    } else if (successRate <= 0.3) {
      riskAssessment = 'High';
    }
    
    // Time to market estimate based on phase
    let timeToMarket = 'Unknown';
    switch (protocolData.phase) {
      case 'Phase 1':
        timeToMarket = '4-5 years';
        break;
      case 'Phase 2':
        timeToMarket = '3-4 years';
        break;
      case 'Phase 3':
        timeToMarket = '1-2 years';
        break;
      case 'Phase 4':
        timeToMarket = 'Already marketed';
        break;
    }
    
    // Competitive position - would be more sophisticated in real app
    const competitivePosition = successRate >= 0.6 ? 'Strong' : 'Moderate';
    
    // Regulatory outlook based on matches
    const successfulCompletedMatches = matchingCSRs.filter(
      csr => (csr.status === 'Successful' || csr.status === 'Completed') && 
             csr.phase === protocolData.phase
    );
    
    let regulatoryOutlook = 'Uncertain';
    if (successfulCompletedMatches.length >= 3) {
      regulatoryOutlook = 'Favorable';
    } else if (successfulCompletedMatches.length === 0) {
      regulatoryOutlook = 'Challenging';
    }
    
    return {
      riskAssessment,
      timeToMarket,
      competitivePosition,
      regulatoryOutlook
    };
  }
  
  /**
   * Extract relevant precedents from matching CSRs
   * 
   * @param matchingCSRs Matching CSRs
   * @returns Array of relevant precedents
   */
  extractRelevantPrecedents(matchingCSRs: any[]) {
    return matchingCSRs.slice(0, 5).map(csr => {
      const status = csr.status === 'Successful' || csr.status === 'Completed' ? 'Positive' : 'Negative';
      
      return {
        csrId: `CSR-${csr.id}`,
        title: csr.title,
        sponsor: csr.sponsor,
        phase: csr.phase,
        year: new Date(csr.uploadDate).getFullYear() || new Date().getFullYear(),
        sampleSize: csr.details?.sampleSize || 'Unknown',
        duration: csr.details?.duration || 'Unknown',
        status: csr.status || 'Unknown',
        outcome: status,
        regulatoryStatus: status === 'Positive' ? 'Approved' : 'Not Approved'
      };
    });
  }
  
  /**
   * Calculate benchmark metrics from matching CSRs
   * 
   * @param matchingCSRs Matching CSRs
   * @returns Benchmark metrics object
   */
  calculateBenchmarkMetrics(matchingCSRs: any[]) {
    // Calculate sample size metrics
    const sampleSizes = matchingCSRs
      .map(csr => csr.details?.sampleSize || 0)
      .filter(size => size > 0);
      
    const medianSampleSize = this.calculateMedian(sampleSizes);
    const minSampleSize = Math.min(...sampleSizes) || 0;
    const maxSampleSize = Math.max(...sampleSizes) || 0;
    const sampleSizeRange = `${minSampleSize}-${maxSampleSize}`;
    
    // Calculate duration metrics
    const durations = matchingCSRs
      .map(csr => {
        const details = csr.details;
        if (details && details.duration) {
          const match = details.duration.match(/(\d+)/);
          return match ? parseInt(match[1]) : 0;
        }
        return 0;
      })
      .filter(duration => duration > 0);
      
    const medianDuration = this.calculateMedian(durations);
    const minDuration = Math.min(...durations) || 0;
    const maxDuration = Math.max(...durations) || 0;
    const durationRange = `${minDuration}-${maxDuration} weeks`;
    
    // Calculate success rate
    const successfulTrials = matchingCSRs.filter(
      csr => csr.status === 'Successful' || csr.status === 'Completed'
    );
    const successRate = matchingCSRs.length > 0 
      ? Math.round((successfulTrials.length / matchingCSRs.length) * 100)
      : 50; // Default 50% if no data
      
    // Calculate dropout rate (placeholder - would use real data in production)
    const averageDropoutRate = 15; // 15% average dropout rate placeholder
    
    // Common regulatory challenges
    const commonRegulatoryChallenges = [
      'Inconsistent endpoint definitions across sites',
      'Inadequate statistical power due to higher-than-expected dropout rates',
      'Protocol amendments affecting data integrity'
    ];
    
    return {
      medianSampleSize,
      sampleSizeRange,
      medianDuration: `${medianDuration} weeks`,
      durationRange,
      successRate,
      averageDropoutRate,
      commonRegulatoryChallenges
    };
  }
  
  /**
   * Analyze endpoints based on protocol data and matching CSRs
   * 
   * @param protocolData Protocol data
   * @param matchingCSRs Matching CSRs
   * @returns Endpoint benchmarking object
   */
  async analyzeEndpoints(protocolData: any, matchingCSRs: any[]) {
    // Extract primary endpoints from matching CSRs
    const primaryEndpoints: string[] = [];
    matchingCSRs.forEach(csr => {
      if (csr.details && csr.details.primaryObjective) {
        primaryEndpoints.push(csr.details.primaryObjective);
      }
    });
    
    // Count frequency of each endpoint
    const endpointCounts: {[key: string]: number} = {};
    primaryEndpoints.forEach(endpoint => {
      endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
    });
    
    // Calculate success rates for each endpoint
    const endpointSuccessRates: {[key: string]: {count: number, successes: number}} = {};
    matchingCSRs.forEach(csr => {
      if (csr.details && csr.details.primaryObjective) {
        const endpoint = csr.details.primaryObjective;
        if (!endpointSuccessRates[endpoint]) {
          endpointSuccessRates[endpoint] = { count: 0, successes: 0 };
        }
        
        endpointSuccessRates[endpoint].count++;
        if (csr.status === 'Successful' || csr.status === 'Completed') {
          endpointSuccessRates[endpoint].successes++;
        }
      }
    });
    
    // Format primary endpoints data
    const primaryEndpointsData = Object.entries(endpointCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([endpoint, count]) => {
        const frequencyScore = Math.round((count / primaryEndpoints.length) * 100);
        const successRate = endpointSuccessRates[endpoint] 
          ? Math.round((endpointSuccessRates[endpoint].successes / endpointSuccessRates[endpoint].count) * 100)
          : 0;
          
        // Determine acceptance level based on frequency and success
        let regulatoryAcceptance = 'Unknown';
        if (frequencyScore >= 50 && successRate >= 60) {
          regulatoryAcceptance = 'High';
        } else if (frequencyScore >= 30 || successRate >= 50) {
          regulatoryAcceptance = 'Moderate';
        } else {
          regulatoryAcceptance = 'Low';
        }
        
        // Find examples of this endpoint in CSRs
        const examples = matchingCSRs
          .filter(csr => csr.details && csr.details.primaryObjective === endpoint)
          .slice(0, 2)
          .map(csr => {
            return {
              csrId: `CSR-${csr.id}`,
              specificDefinition: csr.details.primaryObjective,
              outcome: csr.status === 'Successful' || csr.status === 'Completed' ? 'Success' : 'Failure'
            };
          });
          
        return {
          name: endpoint,
          frequencyScore,
          successRate,
          timeToResult: this.estimateTimeToResult(endpoint),
          regulatoryAcceptance,
          predecessorUse: examples
        };
      });
      
    // Extract secondary endpoints (would be more sophisticated in real app)
    const secondaryEndpoints = protocolData.secondaryEndpoints || [];
    const secondaryEndpointsData = secondaryEndpoints.map((endpoint: string) => {
      return {
        name: endpoint,
        frequencyScore: 35, // Placeholder
        successRate: 45, // Placeholder
        correlationWithPrimary: 'Moderate',
        regulatoryValue: 'Supportive'
      };
    });
    
    // Generate endpoint recommendations
    const endpointRecommendations = [];
    if (primaryEndpointsData.length > 0) {
      const topEndpoint = primaryEndpointsData[0];
      endpointRecommendations.push({
        recommendation: `Use "${topEndpoint.name}" as primary endpoint`,
        confidence: topEndpoint.frequencyScore >= 70 ? 'High' : 'Medium',
        rationale: `Most frequently used endpoint with ${topEndpoint.successRate}% historical success rate`,
        supportingEvidence: `${endpointCounts[topEndpoint.name]} precedent trials with similar design`
      });
    }
    
    if (primaryEndpointsData.length > 1) {
      endpointRecommendations.push({
        recommendation: `Consider "${primaryEndpointsData[1].name}" as key secondary endpoint`,
        confidence: 'Medium',
        rationale: 'Provides complementary data that supports regulatory submission',
        supportingEvidence: 'Frequently paired with the recommended primary endpoint'
      });
    }
    
    return {
      primaryEndpoints: primaryEndpointsData,
      secondaryEndpoints: secondaryEndpointsData,
      endpointRecommendations
    };
  }
  
  /**
   * Predict design risks based on protocol data and matching CSRs
   * 
   * @param protocolData Protocol data
   * @param matchingCSRs Matching CSRs
   * @returns Design risk prediction object
   */
  async predictDesignRisks(protocolData: any, matchingCSRs: any[]) {
    // Calculate overall risk score based on various factors
    const sampleSizes = matchingCSRs
      .map(csr => csr.details?.sampleSize || 0)
      .filter(size => size > 0);
      
    const medianSampleSize = this.calculateMedian(sampleSizes);
    
    // Check if protocol sample size is defined
    const protocolSampleSize = protocolData.sampleSize || 0;
    const sampleSizeRisk = protocolSampleSize > 0 
      ? (protocolSampleSize < medianSampleSize ? 70 : 30)
      : 50;
      
    // Calculate endpoint risk
    const primaryEndpoints: string[] = [];
    matchingCSRs.forEach(csr => {
      if (csr.details && csr.details.primaryObjective) {
        primaryEndpoints.push(csr.details.primaryObjective);
      }
    });
    
    const endpointCounts: {[key: string]: number} = {};
    primaryEndpoints.forEach(endpoint => {
      endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
    });
    
    const sortedEndpoints = Object.entries(endpointCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
      
    const protocolEndpoint = protocolData.primaryEndpoint || '';
    const endpointRisk = protocolEndpoint 
      ? (sortedEndpoints.includes(protocolEndpoint) ? 30 : 60)
      : 50;
      
    // Overall risk calculation (weighted average)
    const overallRiskScore = Math.round((sampleSizeRisk * 0.4) + (endpointRisk * 0.6));
    
    // Risk categories
    const riskCategories = [
      {
        category: 'Sample Size Risk',
        score: sampleSizeRisk,
        keyFactors: [
          protocolSampleSize < medianSampleSize 
            ? `Proposed sample size (${protocolSampleSize}) is below median historical size (${medianSampleSize})`
            : `Sample size aligned with historical precedent`,
          'Potential impact on statistical power',
          'May affect ability to detect safety signals'
        ],
        mitigationStrategies: [
          `Consider increasing sample size to at least ${medianSampleSize} patients`,
          'Implement adaptive design with interim analysis',
          'Enhance site selection to improve recruitment quality'
        ]
      },
      {
        category: 'Endpoint Selection Risk',
        score: endpointRisk,
        keyFactors: [
          protocolEndpoint && sortedEndpoints.includes(protocolEndpoint)
            ? `Selected endpoint (${protocolEndpoint}) is common in similar trials`
            : `Selected endpoint differs from historical precedent`,
          'Endpoint definition consistency',
          'Measurement standardization across sites'
        ],
        mitigationStrategies: [
          'Standardize endpoint definitions across all sites',
          'Provide detailed measurement guidelines',
          'Conduct investigator training on endpoint assessment'
        ]
      },
      {
        category: 'Operational Risk',
        score: 45,
        keyFactors: [
          'Site activation timelines',
          'Patient recruitment rate',
          'Data quality consistency'
        ],
        mitigationStrategies: [
          'Implement risk-based monitoring',
          'Develop contingency recruitment strategies',
          'Use centralized data review processes'
        ]
      }
    ];
    
    // Sample size sensitivity analysis
    const recommendedSampleSize = Math.max(medianSampleSize, protocolSampleSize || 0);
    const powerAnalysisDetails = {
      effect: 0.3, // Placeholder effect size
      power: 0.8, // Target power
      alpha: 0.05, // Significance level
      adjustments: [
        'Adjusted for expected dropout rate',
        'Based on historical data for this indication and phase'
      ]
    };
    
    const scenarioAnalysis = [
      {
        scenario: 'Base Case',
        sampleSize: recommendedSampleSize,
        power: 0.8,
        recommendation: 'Recommended sample size'
      },
      {
        scenario: 'Reduced Sample Size',
        sampleSize: Math.round(recommendedSampleSize * 0.8),
        power: 0.7,
        recommendation: 'Not recommended - insufficient power'
      },
      {
        scenario: 'Increased Sample Size',
        sampleSize: Math.round(recommendedSampleSize * 1.2),
        power: 0.9,
        recommendation: 'Optional - increases power but also cost'
      }
    ];
    
    // Dropout risk analysis
    const predictedDropoutRate = 18; // Placeholder
    const dropoutFactors = [
      'Treatment duration',
      'Frequency of site visits',
      'Invasiveness of procedures',
      'Patient burden'
    ];
    
    const dropoutRecommendations = [
      'Minimize patient burden by streamlining visits',
      'Implement patient engagement strategies',
      'Consider remote/virtual follow-up where possible',
      'Develop retention incentives within ethical guidelines'
    ];
    
    // Virtual trial simulation
    const simulationSummary = 'Probabilistic simulation based on historical trial data for this indication and phase.';
    const simulationParameters = {
      baselineSampleSize: recommendedSampleSize,
      endpointsModeled: [protocolData.primaryEndpoint || sortedEndpoints[0] || 'Primary endpoint'],
      assumptionsApplied: [
        'Historical dropout rate applied',
        'Effect size distribution based on similar trials',
        'Site performance variability incorporated'
      ]
    };
    
    const simulationOutcomes = [
      {
        scenario: 'Expected Outcome',
        probabilityOfSuccess: 65,
        confidenceInterval: '55-75%',
        keySensitivities: [
          'Dropout rate',
          'Effect size',
          'Data quality'
        ]
      },
      {
        scenario: 'Conservative Scenario',
        probabilityOfSuccess: 45,
        confidenceInterval: '35-55%',
        keySensitivities: [
          'Higher dropout',
          'Smaller effect size',
          'Operational delays'
        ]
      },
      {
        scenario: 'Optimistic Scenario',
        probabilityOfSuccess: 80,
        confidenceInterval: '70-90%',
        keySensitivities: [
          'Lower dropout',
          'Larger effect size',
          'Efficient operations'
        ]
      }
    ];
    
    return {
      overallRiskScore,
      riskCategories,
      sensitivityAnalysis: {
        sampleSizeSensitivity: {
          recommendedSampleSize,
          powerAnalysisDetails,
          scenarioAnalysis
        },
        dropoutRiskAnalysis: {
          predictedDropoutRate,
          factors: dropoutFactors,
          recommendations: dropoutRecommendations
        }
      },
      virtualTrialSimulation: {
        summary: simulationSummary,
        simulationParameters,
        outcomes: simulationOutcomes
      }
    };
  }
  
  /**
   * Analyze competitive landscape based on sponsor, indication, and phase
   * 
   * @param sponsor Sponsor name
   * @param indication Medical indication
   * @param phase Trial phase
   * @returns Competitive landscape object
   */
  async analyzeCompetitiveLandscape(sponsor: string, indication: string, phase: string) {
    // Get all trials from storage
    const allTrials = await storage.getAllCsrReports();
    
    // Find competing sponsors in same indication and phase
    const competingSponsors = new Set<string>();
    allTrials.forEach(trial => {
      if (trial.indication.toLowerCase().includes(indication.toLowerCase()) && 
          trial.phase.toLowerCase() === phase.toLowerCase() &&
          trial.sponsor !== sponsor) {
        competingSponsors.add(trial.sponsor);
      }
    });
    
    // Count trials per competitor
    const competitorTrialCounts: {[key: string]: number} = {};
    competingSponsors.forEach(comp => {
      competitorTrialCounts[comp as string] = 0;
    });
    
    allTrials.forEach(trial => {
      if (competingSponsors.has(trial.sponsor)) {
        competitorTrialCounts[trial.sponsor]++;
      }
    });
    
    // Format competitor data
    const competitors = Array.from(competingSponsors)
      .map(comp => {
        const trialCount = competitorTrialCounts[comp as string] || 0;
        let threatLevel = 'Low';
        if (trialCount >= 5) {
          threatLevel = 'High';
        } else if (trialCount >= 2) {
          threatLevel = 'Medium';
        }
        
        return {
          name: comp,
          phase,
          differentiators: [
            'Proprietary endpoint definition',
            'Different patient population specifics',
            'Unique drug mechanism of action'
          ],
          timeToMarket: this.estimateTimeToMarket(phase),
          threatLevel
        };
      })
      .sort((a, b) => {
        if (a.threatLevel === 'High' && b.threatLevel !== 'High') return -1;
        if (a.threatLevel !== 'High' && b.threatLevel === 'High') return 1;
        if (a.threatLevel === 'Medium' && b.threatLevel === 'Low') return -1;
        if (a.threatLevel === 'Low' && b.threatLevel === 'Medium') return 1;
        return 0;
      })
      .slice(0, 5);
      
    // Generate market overview
    const competitorCount = competingSponsors.size;
    const marketOverview = `The ${indication} ${phase} landscape has ${competitorCount} active competitors with ongoing or completed trials. This represents ${competitorCount > 5 ? 'a highly competitive' : competitorCount > 2 ? 'a moderately competitive' : 'a relatively open'} market with ${competitors.filter(c => c.threatLevel === 'High').length} major players who could potentially impact regulatory and commercial success.`;
    
    // SWOT analysis
    const swotAnalysis = {
      strengthsVsCompetitors: [
        'Innovative trial design approach',
        'More stringent patient selection criteria',
        'Enhanced data quality monitoring processes'
      ],
      weaknessesVsCompetitors: [
        'Less experience in the indication area',
        'Smaller historical dataset to leverage',
        'Potentially longer timeline to completion'
      ],
      opportunitiesVsCompetitors: [
        'Novel endpoint combinations',
        'Patient-reported outcome emphasis',
        'Real-world evidence integration'
      ],
      threatsVsCompetitors: [
        'Competitor trials may complete earlier',
        'Potential shifting regulatory landscape',
        'Patient recruitment competition in key sites'
      ]
    };
    
    // Strategic positioning
    const strategicPositioning = {
      recommendedPositioning: `Position the trial as a next-generation approach that addresses limitations identified in earlier ${indication} studies, with particular emphasis on patient-centric outcomes and real-world applicability.`,
      keyDifferentiators: [
        'Enhanced patient selection precision',
        'More clinically relevant endpoint definitions',
        'Robust statistical analysis plan'
      ],
      strategicAdvantages: [
        'Potential for expedited regulatory pathway',
        'Stronger value proposition for payers',
        'More robust safety monitoring approach'
      ]
    };
    
    return {
      marketOverview,
      keyCompetitors: competitors,
      comparativeAnalysis: swotAnalysis,
      strategicPositioning
    };
  }
  
  /**
   * Generate AI-powered recommendations based on all collected data
   * 
   * @param protocolData Protocol data
   * @param reportData Existing report data
   * @returns AI recommendations object
   */
  async generateAIRecommendations(protocolData: any, reportData: any) {
    // Extract data from report sections for recommendations
    const historicalData = reportData.historicalBenchmarking || {};
    const endpointData = reportData.endpointBenchmarking || {};
    const riskData = reportData.designRiskPrediction || {};
    const competitiveData = reportData.competitiveLandscape || {};
    
    // Design recommendations
    const designRecommendations = [];
    
    // Sample size recommendation
    const benchmarkMetrics = historicalData.benchmarkMetrics || {};
    if (benchmarkMetrics.medianSampleSize) {
      designRecommendations.push({
        area: 'Sample Size',
        recommendation: `Target a minimum sample size of ${benchmarkMetrics.medianSampleSize} patients, with consideration for higher enrollment to account for dropout`,
        confidence: 'High',
        impact: 'Critical for statistical power and successful regulatory submission',
        evidence: `Based on ${historicalData.relevantPrecedents?.length || 0} precedent trials in the same indication and phase`,
        implementationNotes: 'Consider geographical distribution and site selection to ensure rapid enrollment'
      });
    }
    
    // Endpoint recommendation
    const primaryEndpoints = endpointData.primaryEndpoints || [];
    if (primaryEndpoints.length > 0) {
      const topEndpoint = primaryEndpoints[0];
      designRecommendations.push({
        area: 'Endpoint Selection',
        recommendation: `Select "${topEndpoint.name}" as primary endpoint with clearly standardized assessment criteria`,
        confidence: topEndpoint.frequencyScore > 70 ? 'High' : 'Medium',
        impact: 'Direct impact on trial success and regulatory acceptance',
        evidence: `${topEndpoint.successRate}% historical success rate in similar trials`,
        implementationNotes: 'Provide detailed measurement protocol and investigator training'
      });
    }
    
    // Duration recommendation
    if (benchmarkMetrics.medianDuration) {
      designRecommendations.push({
        area: 'Trial Duration',
        recommendation: `Design for a minimum duration of ${benchmarkMetrics.medianDuration}`,
        confidence: 'Medium',
        impact: 'Important for endpoint assessment validity',
        evidence: 'Based on time-to-result analysis of historical trials',
        implementationNotes: 'Balance sufficient follow-up with trial efficiency'
      });
    }
    
    // Operational recommendation
    designRecommendations.push({
      area: 'Operational Execution',
      recommendation: 'Implement risk-based monitoring with centralized data review',
      confidence: 'Medium',
      impact: 'Improved data quality and reduced operational risk',
      evidence: 'Industry best practice for complex trials',
      implementationNotes: 'Focus monitoring resources on critical data points and high-risk sites'
    });
    
    // Statistical recommendation
    const sensitivityAnalysis = riskData.sensitivityAnalysis?.sampleSizeSensitivity;
    if (sensitivityAnalysis) {
      designRecommendations.push({
        area: 'Statistical Approach',
        recommendation: 'Include adaptive design elements with pre-specified interim analysis',
        confidence: 'Medium',
        impact: 'Provides flexibility to adjust sample size based on observed effect',
        evidence: 'Simulation shows potential efficiency gain without compromising validity',
        implementationNotes: 'Clearly define adaptation rules and maintain trial integrity'
      });
    }
    
    // Risk mitigation strategy
    const keyRisks = [
      'Insufficient enrollment rate',
      'Higher than expected dropout',
      'Inconsistent endpoint assessment across sites',
      'Competing trials limiting patient availability',
      'Regulatory landscape changes during trial execution'
    ];
    
    const mitigationPlan = [
      {
        risk: 'Insufficient enrollment rate',
        mitigationStrategy: 'Expand site network and implement enrollment forecasting tools',
        contingencyPlan: 'Activate backup sites and consider protocol amendments to broaden criteria'
      },
      {
        risk: 'Higher than expected dropout',
        mitigationStrategy: 'Enhance patient engagement and minimize visit burden',
        contingencyPlan: 'Increase initial enrollment target and implement robust missing data handling'
      },
      {
        risk: 'Inconsistent endpoint assessment',
        mitigationStrategy: 'Standardized training and central reading/adjudication',
        contingencyPlan: 'Implement additional quality control measures and data monitoring'
      },
      {
        risk: 'Competing trials limiting patient availability',
        mitigationStrategy: 'Target sites with limited competitive trial activity',
        contingencyPlan: 'Expand to additional regions or adjust enrollment strategy'
      },
      {
        risk: 'Regulatory landscape changes',
        mitigationStrategy: 'Regular engagement with regulatory authorities',
        contingencyPlan: 'Design trial with flexibility to address evolving requirements'
      }
    ];
    
    // Regulatory strategy
    const keyRegulatoryChallenges = [
      'Endpoint validation and acceptance',
      'Patient population representativeness',
      'Safety monitoring adequacy',
      'Statistical analysis plan robustness'
    ];
    
    const regulatoryApproach = `Proactive regulatory engagement strategy with early scientific advice meetings to align on endpoint selection, patient population, and statistical approach. Use precedent trials as supporting evidence for the proposed design.`;
    
    const precedentJustifications = historicalData.relevantPrecedents
      ? historicalData.relevantPrecedents
          .filter(p => p.outcome === 'Positive')
          .map(p => `${p.csrId}: ${p.title} (${p.phase})`)
      : [];
      
    return {
      designRecommendations,
      riskMitigationStrategy: {
        keyRisks,
        mitigationPlan
      },
      regulatoryStrategy: {
        keyRegulatoryChallenges,
        recommendedApproach: regulatoryApproach,
        precedentJustifications
      }
    };
  }
  
  /**
   * Generate protocol design summary for the report
   * 
   * @param protocolData Protocol data
   * @param reportData Existing report data
   * @returns Protocol design summary object
   */
  generateProtocolDesignSummary(protocolData: any, reportData: any) {
    const endpointData = reportData.endpointBenchmarking || {};
    const primaryEndpoints = endpointData.primaryEndpoints || [];
    const secondaryEndpoints = endpointData.secondaryEndpoints || [];
    
    // Design structure
    const designStructure = {
      title: protocolData.title || 'Untitled Protocol',
      population: protocolData.population || `Patients with ${protocolData.indication}`,
      objectives: {
        primary: protocolData.primaryObjective || `To evaluate the efficacy and safety of the investigational treatment in patients with ${protocolData.indication}`,
        secondary: protocolData.secondaryObjectives || [
          'To assess quality of life improvements',
          'To evaluate pharmacokinetic parameters',
          'To evaluate long-term safety'
        ]
      },
      endpoints: {
        primary: protocolData.primaryEndpoint || (primaryEndpoints.length > 0 ? primaryEndpoints[0].name : ''),
        secondary: protocolData.secondaryEndpoints || secondaryEndpoints.map(e => e.name)
      },
      studyDesign: protocolData.studyDesign || `Randomized, double-blind, placebo-controlled ${protocolData.phase} study`,
      arms: [
        {
          name: 'Treatment Arm',
          description: 'Investigational treatment at standard dose',
          size: Math.round((protocolData.sampleSize || 200) * 0.5)
        },
        {
          name: 'Control Arm',
          description: 'Matching placebo',
          size: Math.round((protocolData.sampleSize || 200) * 0.5)
        }
      ],
      duration: protocolData.duration || '24 weeks',
      keyProcedures: protocolData.keyProcedures || [
        'Screening and baseline assessments',
        'Randomization',
        'Treatment administration',
        'Safety and efficacy assessments',
        'Follow-up evaluations'
      ]
    };
    
    // Statistical approach
    const statisticalApproach = {
      primaryAnalysis: `Comparison between treatment and control groups using ${
        protocolData.primaryEndpoint ? protocolData.primaryEndpoint.includes('rate') ? 'Chi-square test' : 'ANCOVA'
        : 'appropriate statistical methods'
      }`,
      powerCalculations: `Sample size calculated to provide 90% power to detect a clinically meaningful difference at a two-sided significance level of 0.05`,
      interimAnalyses: 'One planned interim analysis for futility after 50% of patients complete the primary endpoint assessment',
      multiplicityConcerns: 'Hierarchical testing procedure for primary and key secondary endpoints to control overall Type I error rate'
    };
    
    // Operational considerations
    const operationalConsiderations = {
      expectedChallenges: [
        'Patient recruitment competition with similar trials',
        'Potential COVID-19 related disruptions',
        'Endpoint assessment standardization across sites',
        'Data quality consistency'
      ],
      mitigationStrategies: [
        'Expanded site network with performance-based selection',
        'Remote visit capabilities when appropriate',
        'Centralized endpoint adjudication',
        'Risk-based monitoring approach'
      ],
      timelineConsiderations: [
        `Expected enrollment period: ${Math.round((protocolData.sampleSize || 200) / 20)} months`,
        `Total study duration: ${Math.round((protocolData.sampleSize || 200) / 20) + (parseInt(protocolData.duration) || 24) / 4} months`,
        'Potential seasonal variations in enrollment rate',
        'Regulatory review timelines post-completion'
      ],
      budgetImplications: [
        'Per-patient costs aligned with industry standards',
        'Additional costs for specialized assessments',
        'Site management and monitoring expenses',
        'Data management and statistical analysis'
      ]
    };
    
    return {
      designStructure,
      statisticalApproach,
      operationalConsiderations
    };
  }
  
  /**
   * Export the strategic report as PDF
   * 
   * @param reportData Strategic report data
   * @param notifyOptions Notification options (recipients, etc.)
   * @returns Object with success status and file path
   */
  async exportReportAsPDF(reportData: any, notifyOptions: any = {}) {
    try {
      // Create a unique filename
      const filename = `strategic_report_${reportData.metadata.protocolId}_${Date.now()}.pdf`;
      const outputPath = path.join(exportsDir, filename);
      
      // First, save the report data as JSON
      const jsonPath = path.join(exportsDir, `${filename}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2));
      
      // Generate PDF using Python script
      return new Promise<{success: boolean, filePath: string}>((resolve, reject) => {
        const pythonScript = spawn('python3', [
          path.join(process.cwd(), 'server/templates/strategic-report-generator.py'),
          jsonPath,
          outputPath
        ]);
        
        let errorOutput = '';
        
        pythonScript.stdout.on('data', (data) => {
          console.log(`PDF Generator stdout: ${data}`);
        });
        
        pythonScript.stderr.on('data', (data) => {
          console.error(`PDF Generator stderr: ${data}`);
          errorOutput += data;
        });
        
        pythonScript.on('close', async (code) => {
          if (code === 0) {
            console.log(`PDF successfully generated at ${outputPath}`);
            
            // Send notifications if requested
            if (notifyOptions.notify) {
              const downloadUrl = `${notifyOptions.baseUrl || ''}/download/${filename}`;
              
              try {
                await notificationService.sendStrategicReportNotification(
                  reportData.metadata.protocolId,
                  downloadUrl,
                  notifyOptions.email
                );
                
                console.log('Notification sent successfully');
              } catch (notifyError) {
                console.error('Error sending notification:', notifyError);
              }
            }
            
            resolve({
              success: true,
              filePath: outputPath
            });
          } else {
            console.error(`PDF generation failed with code ${code}`);
            console.error(`Error output: ${errorOutput}`);
            reject(new Error(`PDF generation failed: ${errorOutput}`));
          }
        });
      });
    } catch (error) {
      console.error('Error exporting report as PDF:', error);
      throw error;
    }
  }
  
  /**
   * Export the strategic report as Markdown
   * 
   * @param reportData Strategic report data
   * @returns Markdown content
   */
  exportReportAsMarkdown(reportData: any) {
    try {
      // Import the Markdown generator
      const { generateStrategicReportMarkdown } = require('./templates/strategic-report-markdown');
      
      // Generate Markdown
      const markdown = generateStrategicReportMarkdown(reportData);
      
      // Create a unique filename
      const filename = `strategic_report_${reportData.metadata.protocolId}_${Date.now()}.md`;
      const outputPath = path.join(exportsDir, filename);
      
      // Save Markdown to file
      fs.writeFileSync(outputPath, markdown);
      
      return {
        success: true,
        markdown,
        filePath: outputPath
      };
    } catch (error) {
      console.error('Error exporting report as Markdown:', error);
      throw error;
    }
  }
  
  /**
   * Helper method to calculate median value
   * 
   * @param values Array of numbers
   * @returns Median value
   */
  private calculateMedian(values: number[]) {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
    } else {
      return Math.round(sorted[middle]);
    }
  }
  
  /**
   * Helper method to estimate time to market based on phase
   * 
   * @param phase Trial phase
   * @returns Estimated time to market
   */
  private estimateTimeToMarket(phase: string) {
    switch (phase) {
      case 'Phase 1':
        return '4-5 years';
      case 'Phase 2':
        return '3-4 years';
      case 'Phase 3':
        return '1-2 years';
      case 'Phase 4':
        return 'Already marketed';
      default:
        return 'Unknown';
    }
  }
  
  /**
   * Helper method to estimate time to result based on endpoint
   * 
   * @param endpoint Endpoint name
   * @returns Estimated time to result
   */
  private estimateTimeToResult(endpoint: string) {
    const lowerEndpoint = endpoint.toLowerCase();
    
    if (lowerEndpoint.includes('survival') || lowerEndpoint.includes('mortality')) {
      return '12-24 months';
    } else if (lowerEndpoint.includes('response') || lowerEndpoint.includes('remission')) {
      return '3-6 months';
    } else if (lowerEndpoint.includes('biomarker') || lowerEndpoint.includes('laboratory')) {
      return '1-3 months';
    } else {
      return '6-12 months';
    }
  }
}

// Export a singleton instance
export const strategicIntelligenceService = new StrategicIntelligenceService();