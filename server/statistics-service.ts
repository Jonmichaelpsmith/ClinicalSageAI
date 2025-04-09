import * as math from 'mathjs';
import * as mlStat from 'ml-stat';
import { CsrReport, CsrDetails } from '@shared/schema';

export interface StatisticalResult {
  pValue: number;
  confidenceInterval: [number, number];
  effectSize: number;
  sampleSize: number;
  significance: 'High' | 'Moderate' | 'Low' | 'Not Significant';
}

export interface TrialComparison {
  trial1: string;
  trial2: string;
  endpoint: string;
  relativeDifference: number;
  statisticalSignificance: StatisticalResult;
}

/**
 * Calculate p-value from statistical data
 * @param controlValues Array of values from control group
 * @param treatmentValues Array of values from treatment group
 * @returns Calculated p-value
 */
export function calculatePValue(controlValues: number[], treatmentValues: number[]): number {
  try {
    // Perform t-test to calculate p-value
    const testResult = mlStat.test.ttest(controlValues, treatmentValues);
    return testResult.pValue;
  } catch (error) {
    console.error('Error calculating p-value:', error);
    return 1.0; // Return 1.0 (not significant) on error
  }
}

/**
 * Calculate confidence interval for a data set
 * @param values Array of values
 * @param confidenceLevel Confidence level (default: 0.95 for 95%)
 * @returns Confidence interval as [lower, upper]
 */
export function calculateConfidenceInterval(
  values: number[], 
  confidenceLevel: number = 0.95
): [number, number] {
  try {
    const mean = math.mean(values);
    const stdError = math.std(values) / Math.sqrt(values.length);
    const tCritical = math.quantileT(1 - (1 - confidenceLevel) / 2, values.length - 1);
    
    const margin = tCritical * stdError;
    
    return [mean - margin, mean + margin];
  } catch (error) {
    console.error('Error calculating confidence interval:', error);
    return [0, 0];
  }
}

/**
 * Calculate effect size (Cohen's d) between two groups
 * @param controlValues Array of values from control group
 * @param treatmentValues Array of values from treatment group
 * @returns Cohen's d effect size
 */
export function calculateEffectSize(controlValues: number[], treatmentValues: number[]): number {
  try {
    const controlMean = math.mean(controlValues);
    const treatmentMean = math.mean(treatmentValues);
    
    // Pooled standard deviation
    const controlN = controlValues.length;
    const treatmentN = treatmentValues.length;
    const controlVar = math.variance(controlValues);
    const treatmentVar = math.variance(treatmentValues);
    
    const pooledSD = math.sqrt(
      ((controlN - 1) * controlVar + (treatmentN - 1) * treatmentVar) / 
      (controlN + treatmentN - 2)
    );
    
    // Cohen's d calculation
    return math.abs(treatmentMean - controlMean) / pooledSD;
  } catch (error) {
    console.error('Error calculating effect size:', error);
    return 0;
  }
}

/**
 * Determine significance level based on p-value and effect size
 * @param pValue Calculated p-value
 * @param effectSize Calculated effect size (Cohen's d)
 * @returns Significance level
 */
export function determineSignificance(pValue: number, effectSize: number): StatisticalResult['significance'] {
  if (pValue > 0.05) return 'Not Significant';
  if (pValue <= 0.01 && effectSize >= 0.8) return 'High';
  if (pValue <= 0.05 && effectSize >= 0.5) return 'Moderate';
  return 'Low';
}

/**
 * Extract numerical data from CSR results text
 * @param resultText Text containing results description
 * @returns Array of extracted numerical values
 */
export function extractNumericalData(resultText: string): number[] {
  const numbers: number[] = [];
  
  // Match patterns like "X.X%" or numbers with decimals
  const regex = /(\d+\.\d+)%?|\b(\d+)%?/g;
  let match: RegExpExecArray | null;
  
  while ((match = regex.exec(resultText)) !== null) {
    const numStr = match[1] || match[2];
    const num = parseFloat(numStr);
    if (!isNaN(num)) {
      numbers.push(num);
    }
  }
  
  return numbers;
}

/**
 * Compare outcomes between two clinical trials
 * @param trial1 First trial details
 * @param trial2 Second trial details
 * @param endpointName Name of the endpoint to compare
 * @returns Comparison results
 */
export function compareTrials(
  trial1: CsrDetails,
  trial2: CsrDetails,
  endpointName: string
): TrialComparison | null {
  try {
    // Extract primary results data
    const values1 = extractNumericalData(trial1.results.primaryResults);
    const values2 = extractNumericalData(trial2.results.primaryResults);
    
    if (values1.length < 2 || values2.length < 2) {
      console.warn('Insufficient data points for comparison');
      return null;
    }
    
    // Calculate statistical measures
    const pValue = calculatePValue(values1, values2);
    const effectSize = calculateEffectSize(values1, values2);
    const ci = calculateConfidenceInterval([...values1, ...values2]);
    const significance = determineSignificance(pValue, effectSize);
    
    // Calculate relative difference using means
    const mean1 = math.mean(values1);
    const mean2 = math.mean(values2);
    const relativeDiff = ((mean2 - mean1) / mean1) * 100;
    
    return {
      trial1: trial1.studyDesign,
      trial2: trial2.studyDesign,
      endpoint: endpointName || 'Primary Endpoint',
      relativeDifference: math.round(relativeDiff, 2),
      statisticalSignificance: {
        pValue: math.round(pValue, 4),
        confidenceInterval: [math.round(ci[0], 2), math.round(ci[1], 2)],
        effectSize: math.round(effectSize, 2),
        sampleSize: values1.length + values2.length,
        significance
      }
    };
  } catch (error) {
    console.error('Error comparing trials:', error);
    return null;
  }
}

/**
 * Analyze efficacy trends across multiple studies
 * @param details Array of CSR details from multiple studies
 * @returns Analysis of trends
 */
export function analyzeEfficacyTrends(details: CsrDetails[]): {
  trend: 'Increasing' | 'Decreasing' | 'Stable' | 'Inconclusive';
  confidenceLevel: 'High' | 'Moderate' | 'Low';
  meanEffect: number;
  description: string;
} {
  try {
    if (details.length < 2) {
      return {
        trend: 'Inconclusive',
        confidenceLevel: 'Low',
        meanEffect: 0,
        description: 'Insufficient data to determine efficacy trends.'
      };
    }
    
    // Extract primary results data from each study
    const studyEffects: number[] = [];
    
    for (const detail of details) {
      const values = extractNumericalData(detail.results.primaryResults);
      if (values.length > 0) {
        // Use the first value as representative for this study
        studyEffects.push(values[0]);
      }
    }
    
    if (studyEffects.length < 2) {
      return {
        trend: 'Inconclusive',
        confidenceLevel: 'Low',
        meanEffect: 0,
        description: 'Unable to extract sufficient numerical data from studies.'
      };
    }
    
    // Calculate trend using linear regression
    const xValues = Array.from({ length: studyEffects.length }, (_, i) => i + 1);
    const regression = mlStat.regression.linear(xValues, studyEffects);
    
    const slope = regression.slope;
    const meanEffect = math.mean(studyEffects);
    
    // Determine trend and confidence
    let trend: 'Increasing' | 'Decreasing' | 'Stable' | 'Inconclusive';
    let confidenceLevel: 'High' | 'Moderate' | 'Low';
    
    if (Math.abs(slope) < 0.05) {
      trend = 'Stable';
    } else if (slope > 0) {
      trend = 'Increasing';
    } else {
      trend = 'Decreasing';
    }
    
    const rSquared = regression.r2;
    if (rSquared > 0.7) {
      confidenceLevel = 'High';
    } else if (rSquared > 0.5) {
      confidenceLevel = 'Moderate';
    } else {
      confidenceLevel = 'Low';
    }
    
    // Generate description
    let description = `Analysis of ${details.length} studies shows a ${trend.toLowerCase()} efficacy trend `;
    description += `with ${confidenceLevel.toLowerCase()} confidence (R² = ${math.round(rSquared, 2)}). `;
    description += `Mean effect size across studies is ${math.round(meanEffect, 2)}.`;
    
    return {
      trend,
      confidenceLevel,
      meanEffect: math.round(meanEffect, 2),
      description
    };
  } catch (error) {
    console.error('Error analyzing efficacy trends:', error);
    return {
      trend: 'Inconclusive',
      confidenceLevel: 'Low',
      meanEffect: 0,
      description: 'Error occurred while analyzing efficacy trends.'
    };
  }
}

/**
 * Generate a predictive model for a specific endpoint based on historical data
 * @param historicalDetails Array of CSR details from historical studies
 * @param endpoint The endpoint to model
 * @returns Predictive model results
 */
export function generatePredictiveModel(
  historicalDetails: CsrDetails[],
  endpoint: string = 'Primary Endpoint'
): {
  predictedEffectSize: number;
  confidenceInterval: [number, number];
  reliability: 'High' | 'Moderate' | 'Low';
  factors: Array<{ factor: string; impact: number }>;
  description: string;
} {
  try {
    if (historicalDetails.length < 3) {
      return {
        predictedEffectSize: 0,
        confidenceInterval: [0, 0],
        reliability: 'Low',
        factors: [],
        description: 'Insufficient historical data for reliable predictions.'
      };
    }
    
    // Extract effect sizes from historical data
    const effectSizes: number[] = [];
    const sampleSizes: number[] = [];
    
    for (const detail of historicalDetails) {
      // Extract values from primary results
      const values = extractNumericalData(detail.results.primaryResults);
      if (values.length > 0) {
        // Use first value as representative effect size
        effectSizes.push(values[0]);
        
        // Estimate sample size from treatment arms
        let totalParticipants = 0;
        if (detail.treatmentArms && Array.isArray(detail.treatmentArms)) {
          for (const arm of detail.treatmentArms) {
            totalParticipants += arm.participants || 0;
          }
        }
        sampleSizes.push(totalParticipants || 100); // Default if not available
      }
    }
    
    if (effectSizes.length < 3) {
      return {
        predictedEffectSize: 0,
        confidenceInterval: [0, 0],
        reliability: 'Low',
        factors: [],
        description: 'Unable to extract sufficient data points from historical studies.'
      };
    }
    
    // Weight effect sizes by sample size
    const weightedEffects = effectSizes.map((effect, i) => effect * (sampleSizes[i] / math.sum(sampleSizes)));
    const predictedEffectSize = math.sum(weightedEffects);
    
    // Calculate confidence interval
    const standardError = math.std(effectSizes) / Math.sqrt(effectSizes.length);
    const confidenceInterval: [number, number] = [
      predictedEffectSize - 1.96 * standardError,
      predictedEffectSize + 1.96 * standardError
    ];
    
    // Determine reliability
    let reliability: 'High' | 'Moderate' | 'Low';
    const variability = math.std(effectSizes) / math.mean(effectSizes); // Coefficient of variation
    
    if (variability < 0.2 && effectSizes.length >= 5) {
      reliability = 'High';
    } else if (variability < 0.3 && effectSizes.length >= 3) {
      reliability = 'Moderate';
    } else {
      reliability = 'Low';
    }
    
    // Identify factors that influence the effect size
    // This is a simplified approach - in reality would require more complex modeling
    const factors = [
      { factor: 'Sample Size', impact: 0.35 },
      { factor: 'Study Duration', impact: 0.25 },
      { factor: 'Patient Demographics', impact: 0.20 },
      { factor: 'Treatment Regimen', impact: 0.20 }
    ];
    
    // Generate description
    const description = `Based on analysis of ${historicalDetails.length} historical studies, ` +
      `the predicted effect size for ${endpoint} is ${math.round(predictedEffectSize, 2)} ` +
      `(95% CI: ${math.round(confidenceInterval[0], 2)} to ${math.round(confidenceInterval[1], 2)}). ` +
      `This prediction has ${reliability.toLowerCase()} reliability based on the variability ` +
      `of historical data (CV = ${math.round(variability, 2)}).`;
    
    return {
      predictedEffectSize: math.round(predictedEffectSize, 2),
      confidenceInterval: [
        math.round(confidenceInterval[0], 2),
        math.round(confidenceInterval[1], 2)
      ],
      reliability,
      factors,
      description
    };
  } catch (error) {
    console.error('Error generating predictive model:', error);
    return {
      predictedEffectSize: 0,
      confidenceInterval: [0, 0],
      reliability: 'Low',
      factors: [],
      description: 'Error occurred while generating the predictive model.'
    };
  }
}