/**
 * Protocol Generation and Validation Service
 * 
 * This service provides functionality to generate clinical trial protocols,
 * validate protocol elements against regulatory guidance, and suggest
 * improvements based on historical trial data.
 */

import { db } from './db';
import { csrReports, csrDetails } from '@shared/schema';
import { HuggingFaceService } from './huggingface-service';
import * as math from 'mathjs';

/**
 * Protocol Generation and Validation Service
 */
export class ProtocolService {
  /**
   * Generate a clinical trial protocol based on the specified parameters
   */
  static async generateProtocol(
    indication: string,
    phase: string,
    population: string,
    endpoints: { primary: string[], secondary: string[] }
  ): Promise<Record<string, string>> {
    try {
      // Generate protocol using our HuggingFace AI service
      const prompt = `
Generate a comprehensive clinical trial protocol for a ${phase} trial studying ${indication} in ${population}.
Primary endpoints: ${endpoints.primary.join(', ')}
Secondary endpoints: ${endpoints.secondary.join(', ')}

Format the output as a structured protocol with the following sections:
1. Background and Rationale
2. Objectives
3. Study Design
4. Study Population (inclusion/exclusion criteria)
5. Treatment Plan
6. Efficacy Assessments
7. Safety Assessments
8. Statistical Considerations

Make the protocol scientifically sound and aligned with regulatory expectations.
`;

      const response = await HuggingFaceService.queryModel(prompt, 'mistralai/Mistral-7B-Instruct-v0.2', {
        max_tokens: 2000,
        temperature: 0.3,
        top_p: 0.95
      });
      
      // Parse sections from the response
      const protocolSections: Record<string, string> = {};
      const sectionRegex = /##?\s*([\w\s&]+)\s*\n([\s\S]*?)(?=##?\s*[\w\s&]+\s*\n|$)/g;
      let match;

      while ((match = sectionRegex.exec(response)) !== null) {
        const title = match[1].trim();
        const content = match[2].trim();
        protocolSections[title] = content;
      }

      // If parsing failed, fall back to returning the full text with some basic structure
      if (Object.keys(protocolSections).length === 0) {
        const fallbackSections = [
          'Background and Rationale',
          'Objectives',
          'Study Design',
          'Study Population',
          'Treatment Plan',
          'Efficacy Assessments',
          'Safety Assessments',
          'Statistical Considerations'
        ];
        
        // Split response roughly into sections
        const lines = response.split('\n');
        let currentSection = '';
        let currentContent = '';
        
        for (const line of lines) {
          if (fallbackSections.some(section => line.toLowerCase().includes(section.toLowerCase()))) {
            if (currentSection) {
              protocolSections[currentSection] = currentContent.trim();
            }
            currentSection = line.trim();
            currentContent = '';
          } else if (currentSection) {
            currentContent += line + '\n';
          }
        }
        
        if (currentSection && currentContent) {
          protocolSections[currentSection] = currentContent.trim();
        }
      }

      return protocolSections;
    } catch (error) {
      console.error('Error generating protocol:', error);
      // Return basic structure if generation fails
      return {
        'Background and Rationale': 'Error generating protocol content. Please try again later.',
        'Objectives': 'Error generating protocol content. Please try again later.',
        'Study Design': 'Error generating protocol content. Please try again later.',
        'Study Population': 'Error generating protocol content. Please try again later.',
        'Treatment Plan': 'Error generating protocol content. Please try again later.',
        'Efficacy Assessments': 'Error generating protocol content. Please try again later.',
        'Safety Assessments': 'Error generating protocol content. Please try again later.',
        'Statistical Considerations': 'Error generating protocol content. Please try again later.'
      };
    }
  }

  /**
   * Get regulatory guidance for a specific protocol element
   */
  static async getRegulatoryGuidance(
    region: 'FDA' | 'EMA',
    element: string
  ): Promise<{id: string, title: string, content: string}[]> {
    // Predefined regulatory guidance
    const regulatoryGuidance = {
      FDA: [
        {
          id: 'fda-endpoint-1',
          title: 'Primary Endpoint Selection',
          content: 'According to FDA guidance, primary endpoints should be clinically meaningful, objectively measured, and reflective of the disease state being treated. The endpoint should directly measure how a patient feels, functions, or survives. Surrogate endpoints may be acceptable if they are reasonably likely to predict clinical benefit.'
        },
        {
          id: 'fda-population-1',
          title: 'Study Population Considerations',
          content: 'FDA recommends that the study population should be representative of the intended treatment population. Inclusion and exclusion criteria should be clearly defined and justified. Demographic factors such as age, sex, race, and ethnicity should be considered to ensure the study results are applicable to the entire population for whom the drug is intended.'
        },
        {
          id: 'fda-design-1',
          title: 'Study Design Elements',
          content: 'Randomized, double-blind, controlled trials are generally preferred by FDA when feasible. Placebo control is recommended when ethical and no effective treatments exist. Active-controlled non-inferiority designs require careful justification, including evidence of assay sensitivity.'
        },
        {
          id: 'fda-stat-1',
          title: 'Statistical Analysis Considerations',
          content: 'FDA guidance emphasizes the importance of pre-specified statistical analysis plans. The primary analysis should be based on the Intent-to-Treat (ITT) population. Multiple testing adjustments should be implemented when evaluating multiple endpoints or conducting interim analyses to control Type I error.'
        }
      ],
      EMA: [
        {
          id: 'ema-endpoint-1',
          title: 'Primary Endpoint Selection',
          content: 'EMA guidance states that primary endpoints should be clinically relevant, sensitive to treatment effects, and validated when possible. Patient-reported outcomes are encouraged when appropriate and should be validated for the specific context of use. The endpoint should be aligned with the claimed treatment benefit.'
        },
        {
          id: 'ema-population-1',
          title: 'Study Population Considerations',
          content: 'EMA recommends that the study population should be well-defined and representative of the target population in European clinical practice. Special populations (elderly, pediatric, hepatic/renal impairment) should be considered when relevant. Stratification factors should be limited and clearly justified.'
        },
        {
          id: 'ema-design-1',
          title: 'Study Design Elements',
          content: 'EMA prefers randomized controlled trials with appropriate blinding. Adaptive designs may be acceptable but require detailed justification and discussion with authorities. Non-inferiority designs require careful selection of the non-inferiority margin based on historical data and clinical judgment.'
        },
        {
          id: 'ema-stat-1',
          title: 'Statistical Analysis Considerations',
          content: 'EMA guidance emphasizes robust methods for handling missing data. Sensitivity analyses should be conducted to evaluate the impact of different assumptions. Subgroup analyses should be pre-specified and interpreted with caution. Time-to-event analyses should address competing risks when relevant.'
        }
      ]
    };

    if (element === 'all') {
      return regulatoryGuidance[region];
    } else {
      return regulatoryGuidance[region].filter(item => item.title.toLowerCase().includes(element.toLowerCase()));
    }
  }

  /**
   * Validate a protocol against regulatory standards
   */
  static async validateProtocol(
    protocolSections: Record<string, string>
  ): Promise<any[]> {
    const validationIssues = [];

    // Check for missing sections
    const requiredSections = [
      'Background and Rationale',
      'Objectives',
      'Study Design',
      'Study Population',
      'Treatment Plan',
      'Efficacy Assessments',
      'Safety Assessments',
      'Statistical Considerations'
    ];

    for (const section of requiredSections) {
      if (!protocolSections[section] || protocolSections[section].trim() === '') {
        validationIssues.push({
          element: section,
          severity: 'critical',
          message: `Required section '${section}' is missing or empty.`
        });
      }
    }

    // Check for short sections (potentially incomplete)
    for (const section in protocolSections) {
      if (protocolSections[section] && protocolSections[section].length < 100) {
        validationIssues.push({
          element: section,
          severity: 'warning',
          message: `Section '${section}' is unusually short and may be incomplete.`
        });
      }
    }

    // Check for specific content in sections
    if (protocolSections['Study Population'] && !protocolSections['Study Population'].includes('inclusion')) {
      validationIssues.push({
        element: 'Study Population',
        severity: 'high',
        message: 'No inclusion criteria found in Study Population section.'
      });
    }

    if (protocolSections['Study Population'] && !protocolSections['Study Population'].includes('exclusion')) {
      validationIssues.push({
        element: 'Study Population',
        severity: 'high',
        message: 'No exclusion criteria found in Study Population section.'
      });
    }

    // Check for endpoint specifications
    if (protocolSections['Objectives'] && !protocolSections['Objectives'].includes('primary')) {
      validationIssues.push({
        element: 'Objectives',
        severity: 'high',
        message: 'Primary objective not clearly specified.'
      });
    }

    // Check for statistical analysis plan
    if (protocolSections['Statistical Considerations']) {
      const stats = protocolSections['Statistical Considerations'].toLowerCase();
      if (!stats.includes('sample size') && !stats.includes('power')) {
        validationIssues.push({
          element: 'Statistical Considerations',
          severity: 'high',
          message: 'Sample size calculation or power analysis not found.'
        });
      }
      
      if (!stats.includes('analysis population') && !stats.includes('itt') && !stats.includes('per protocol')) {
        validationIssues.push({
          element: 'Statistical Considerations',
          severity: 'medium',
          message: 'Analysis population not clearly defined.'
        });
      }
    }

    // Sort issues by severity
    return validationIssues.sort((a, b) => {
      const severityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'warning': 3, 'low': 4 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Get historical protocol benchmarks based on similar trials
   */
  static async getProtocolBenchmarks(indication: string, phase: string): Promise<any> {
    try {
      // Get similar trials from the database
      const similarTrials = await db.select().from(csrReports)
        .where(trial => {
          const conditionsMatch = sql`${trial.indication} ILIKE ${`%${indication}%`}`;
          const phaseMatch = sql`${trial.phase} = ${phase}`;
          return sql`${conditionsMatch} AND ${phaseMatch}`;
        });
      
      // Get trial details
      const trialIds = similarTrials.map(trial => trial.id);
      const trialDetails = await db.select().from(csrDetails)
        .where(details => sql`${details.reportId} IN (${trialIds.join(',')})`);
      
      // Analysis based on historical data
      return {
        designRecommendations: this.analyzeDesignPatterns(similarTrials, trialDetails),
        endpointRecommendations: this.analyzeEndpointPatterns(trialDetails),
        inclusionCriteriaRecommendations: this.analyzeInclusionCriteria(trialDetails),
        sampleSizeRecommendations: this.analyzeSampleSizeTrends(trialDetails),
        safetyConsiderations: this.analyzeSafetyPatterns(trialDetails),
        statisticalApproaches: this.analyzeStatisticalApproaches(trialDetails),
      };
    } catch (error) {
      console.error('Error getting protocol benchmarks:', error);
      return {
        designRecommendations: [],
        endpointRecommendations: [],
        inclusionCriteriaRecommendations: [],
        sampleSizeRecommendations: {},
        safetyConsiderations: [],
        statisticalApproaches: []
      };
    }
  }

  /**
   * Analyze common design patterns from historical trials
   */
  private static analyzeDesignPatterns(historicalTrials, trialDetails): any[] {
    const designPatterns = {};
    
    // Count occurrence of different design types
    for (const trial of historicalTrials) {
      // Extract design type from study description or details
      const designType = this.extractDesignType(trial);
      if (designType) {
        designPatterns[designType] = (designPatterns[designType] || 0) + 1;
      }
    }
    
    // Sort by frequency
    const sortedDesigns = Object.entries(designPatterns)
      .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
      .slice(0, 5);
    
    // Format as recommendations
    return sortedDesigns.map(([design, count]) => ({
      design,
      frequency: `${count}/${historicalTrials.length}`,
      recommendation: `Consider a ${design} design, which was used in ${count} similar trials.`
    }));
  }
  
  /**
   * Extract design type from trial data
   */
  private static extractDesignType(trial): string | null {
    const designMap = {
      'randomized': 'Randomized',
      'double-blind': 'Double-Blind',
      'placebo': 'Placebo-Controlled',
      'parallel': 'Parallel-Group',
      'crossover': 'Crossover',
      'non-inferiority': 'Non-Inferiority',
      'superiority': 'Superiority',
      'adaptive': 'Adaptive',
      'open-label': 'Open-Label'
    };
    
    // Search for design keywords in study description
    const studyDescription = trial.studyDesign || trial.summary || '';
    for (const [keyword, designType] of Object.entries(designMap)) {
      if (studyDescription.toLowerCase().includes(keyword)) {
        return designType;
      }
    }
    
    return null;
  }
  
  /**
   * Analyze common endpoint patterns from historical trials
   */
  private static analyzeEndpointPatterns(trialDetails): any[] {
    const endpointPatterns = {};
    const endpointDescriptions = {};
    
    // Extract endpoints from trial details
    for (const detail of trialDetails) {
      const endpoints = this.extractEndpoints(detail);
      for (const endpoint of endpoints) {
        endpointPatterns[endpoint] = (endpointPatterns[endpoint] || 0) + 1;
        
        // Extract descriptions to provide context
        if (detail.endpoints && detail.endpoints[endpoint]) {
          endpointDescriptions[endpoint] = detail.endpoints[endpoint];
        }
      }
    }
    
    // Sort by frequency
    const sortedEndpoints = Object.entries(endpointPatterns)
      .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
      .slice(0, 5);
    
    // Format as recommendations
    return sortedEndpoints.map(([endpoint, count]) => ({
      endpoint,
      frequency: `${count}/${trialDetails.length}`,
      description: endpointDescriptions[endpoint] || 'No description available',
      recommendation: `Consider using ${endpoint} as an endpoint, found in ${count} similar trials.`
    }));
  }
  
  /**
   * Extract endpoints from trial details
   */
  private static extractEndpoints(detail): string[] {
    const endpoints = [];
    
    // Extract from structured endpoints field
    if (detail.endpoints) {
      if (typeof detail.endpoints === 'object') {
        if (detail.endpoints.primary) {
          endpoints.push(...detail.endpoints.primary);
        }
        if (detail.endpoints.secondary) {
          endpoints.push(...detail.endpoints.secondary);
        }
      } else if (typeof detail.endpoints === 'string') {
        // Try to parse endpoints from text
        const commonEndpoints = [
          'Overall Survival', 'Progression-Free Survival', 'Disease-Free Survival',
          'Objective Response Rate', 'Complete Response', 'Partial Response',
          'Quality of Life', 'Safety', 'Tolerability', 'Pharmacokinetics'
        ];
        
        for (const endpoint of commonEndpoints) {
          if (detail.endpoints.includes(endpoint)) {
            endpoints.push(endpoint);
          }
        }
      }
    }
    
    return endpoints;
  }
  
  /**
   * Analyze inclusion criteria patterns from historical trials
   */
  private static analyzeInclusionCriteria(trialDetails): any[] {
    const criteriaPatterns = {};
    
    // Extract common inclusion criteria from trial details
    for (const detail of trialDetails) {
      const criteria = this.extractInclusionCriteria(detail);
      for (const criterion of criteria) {
        criteriaPatterns[criterion] = (criteriaPatterns[criterion] || 0) + 1;
      }
    }
    
    // Sort by frequency
    const sortedCriteria = Object.entries(criteriaPatterns)
      .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
      .slice(0, 8);
    
    // Format as recommendations
    return sortedCriteria.map(([criterion, count]) => ({
      criterion,
      frequency: `${count}/${trialDetails.length}`,
      recommendation: `Include "${criterion}" in your eligibility criteria, found in ${count} similar trials.`
    }));
  }
  
  /**
   * Extract inclusion criteria from trial details
   */
  private static extractInclusionCriteria(detail): string[] {
    const criteria = [];
    
    // Extract from structured inclusionCriteria field
    if (detail.inclusionCriteria) {
      if (Array.isArray(detail.inclusionCriteria)) {
        return detail.inclusionCriteria;
      } else if (typeof detail.inclusionCriteria === 'string') {
        // Try to parse criteria from text by looking for common patterns
        const lines = detail.inclusionCriteria.split(/[\n;.]+/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.length > 10) {
            criteria.push(trimmed);
          }
        }
      }
    }
    
    return criteria;
  }
  
  /**
   * Analyze sample size trends from historical trials
   */
  private static analyzeSampleSizeTrends(trialDetails): any {
    // Extract sample sizes from trial details
    const sampleSizes = [];
    for (const detail of trialDetails) {
      if (detail.sampleSize && !isNaN(Number(detail.sampleSize))) {
        sampleSizes.push(Number(detail.sampleSize));
      }
    }
    
    // Calculate statistics
    if (sampleSizes.length > 0) {
      const mean = math.mean(sampleSizes);
      const median = math.median(sampleSizes);
      const std = math.std(sampleSizes);
      const min = math.min(sampleSizes);
      const max = math.max(sampleSizes);
      const q1 = this.calculateQuantile(sampleSizes, 0.25);
      const q3 = this.calculateQuantile(sampleSizes, 0.75);
      
      return {
        mean: Math.round(mean),
        median: Math.round(median),
        standardDeviation: Math.round(std),
        min,
        max,
        q1: Math.round(q1),
        q3: Math.round(q3),
        recommendation: `Based on ${sampleSizes.length} similar trials, we recommend a sample size of approximately ${Math.round(median)} participants (range: ${min}-${max}).`
      };
    }
    
    return {
      recommendation: "Insufficient data to provide sample size recommendations."
    };
  }
  
  /**
   * Calculate quantile from array of values
   */
  private static calculateQuantile(arr, q) {
    const sorted = [...arr].sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
      return sorted[base];
    }
  }
  
  /**
   * Analyze safety patterns from historical trials
   */
  private static analyzeSafetyPatterns(trialDetails): any[] {
    const commonAEs = {};
    const safetyRecs = [];
    
    // Extract safety data from trial details
    for (const detail of trialDetails) {
      const safetyData = this.extractSafetyData(detail);
      for (const [ae, freq] of Object.entries(safetyData)) {
        if (!commonAEs[ae]) {
          commonAEs[ae] = [];
        }
        commonAEs[ae].push(freq);
      }
    }
    
    // Calculate average frequencies and create recommendations
    for (const [ae, freqs] of Object.entries(commonAEs)) {
      if (freqs.length >= 2) { // Only include AEs reported in multiple trials
        const avgFreq = math.mean(freqs as number[]);
        safetyRecs.push({
          adverseEvent: ae,
          averageFrequency: `${avgFreq.toFixed(1)}%`,
          frequencyRange: `${math.min(freqs as number[])}%-${math.max(freqs as number[])}%`,
          recommendation: `Monitor for ${ae}, reported in ${freqs.length} trials with average frequency of ${avgFreq.toFixed(1)}%.`
        });
      }
    }
    
    // Sort by frequency
    return safetyRecs
      .sort((a, b) => parseFloat(b.averageFrequency) - parseFloat(a.averageFrequency))
      .slice(0, 10);
  }
  
  /**
   * Extract safety data from trial details
   */
  private static extractSafetyData(detail): Record<string, number> {
    const safetyData = {};
    
    // Extract from structured safety field
    if (detail.safety || detail.adverseEvents) {
      const safetyInfo = detail.safety || detail.adverseEvents;
      
      if (typeof safetyInfo === 'object') {
        return safetyInfo;
      } else if (typeof safetyInfo === 'string') {
        // Try to parse safety data from text
        const commonAEs = [
          'Nausea', 'Vomiting', 'Diarrhea', 'Fatigue', 'Headache',
          'Neutropenia', 'Anemia', 'Rash', 'Fever', 'Pain'
        ];
        
        // Look for percentage patterns
        const percentagePattern = /(\w+(?:\s+\w+)*)\s+(?:was|were|occurred|reported)?\s*(?:in|at)?\s*(?:a\s+frequency\s+of)?\s*(\d+(?:\.\d+)?)\s*%/gi;
        let match;
        while ((match = percentagePattern.exec(safetyInfo)) !== null) {
          safetyData[match[1]] = parseFloat(match[2]);
        }
        
        // Look for common AEs
        for (const ae of commonAEs) {
          if (safetyInfo.includes(ae) && !safetyData[ae]) {
            safetyData[ae] = 0; // Frequency unknown
          }
        }
      }
    }
    
    return safetyData;
  }
  
  /**
   * Analyze statistical approaches from historical trials
   */
  private static analyzeStatisticalApproaches(trialDetails): any[] {
    const approaches = [];
    
    // Common statistical approaches to look for
    const statisticalMethods = [
      'Logistic Regression',
      'Cox Proportional Hazards',
      'Kaplan-Meier',
      'Log-rank Test',
      'ANOVA',
      'Chi-square Test',
      'Fisher\'s Exact Test',
      'T-test',
      'Wilcoxon Rank-Sum Test',
      'Mixed Effects Model'
    ];
    
    for (const detail of trialDetails) {
      if (detail.statisticalMethods && typeof detail.statisticalMethods === 'string') {
        for (const method of statisticalMethods) {
          if (detail.statisticalMethods.includes(method) && 
              !approaches.some(a => a.approach === method)) {
            approaches.push({
              approach: method,
              description: this.getStatMethodDescription(method),
              precedents: ['Found in similar trials in your selected indication']
            });
          }
        }
      }
    }
    
    // Add common approaches if not enough were found
    if (approaches.length < 3) {
      for (const method of statisticalMethods) {
        if (!approaches.some(a => a.approach === method)) {
          approaches.push({
            approach: method,
            description: this.getStatMethodDescription(method),
            precedents: ['Commonly used in clinical trials']
          });
          
          if (approaches.length >= 5) break;
        }
      }
    }
    
    return approaches;
  }
  
  /**
   * Get description of statistical method
   */
  private static getStatMethodDescription(method: string): string {
    const descriptions = {
      'Logistic Regression': 'Used for binary outcomes (e.g., response vs. no response).',
      'Cox Proportional Hazards': 'Used for time-to-event analyses, accounting for censoring.',
      'Kaplan-Meier': 'Non-parametric survival analysis method for estimating survival functions.',
      'Log-rank Test': 'Used to compare survival distributions between groups.',
      'ANOVA': 'Analysis of variance used to compare means across multiple groups.',
      'Chi-square Test': 'Used for categorical data to determine if there is a significant association between variables.',
      'Fisher\'s Exact Test': 'Used for categorical data with small sample sizes.',
      'T-test': 'Used to compare means between two groups.',
      'Wilcoxon Rank-Sum Test': 'Non-parametric alternative to t-test when normality cannot be assumed.',
      'Mixed Effects Model': 'Accounts for both fixed and random effects, useful for repeated measures.'
    };
    
    return descriptions[method] || 'Statistical method commonly used in clinical trials.';
  }
  
  /**
   * Get study design advice from AI
   */
  static async getStudyDesignAdvice(indication: string, phase: string, question: string): Promise<string> {
    try {
      const prompt = `
I'm designing a ${phase} clinical trial for ${indication} and need advice on the following aspect: 
${question}

Please provide specific, actionable advice based on historical precedent and regulatory expectations.
Include examples from similar trials if relevant.
`;
      
      return await HuggingFaceService.queryModel(prompt, 'mistralai/Mistral-7B-Instruct-v0.2', {
        max_tokens: 1500,
        temperature: 0.4,
        top_p: 0.95
      });
    } catch (error) {
      console.error('Error getting study design advice:', error);
      return 'Unable to provide study design advice at this time. Please try again later.';
    }
  }
}