/**
 * Generate Statistical Analysis Plan (SAP) snippets based on protocol data
 * This utility automatically creates appropriate SAP text for different protocol configurations
 */

interface ProtocolData {
  endpoint_primary?: string;
  sample_size?: number;
  duration_weeks?: number;
  phase?: string;
  indication?: string;
  [key: string]: any;
}

/**
 * Generate a complete Statistical Analysis Plan based on protocol data
 * Handles different endpoint types and study designs
 * 
 * @param protocolData The parsed protocol data
 * @returns A formatted SAP string
 */
export function generateSAP(protocolData: ProtocolData): string {
  const endpoint = protocolData.endpoint_primary?.toLowerCase() || "primary endpoint";
  const sampleSize = protocolData.sample_size || 200;
  const duration = protocolData.duration_weeks || 24;
  const phase = protocolData.phase || "Phase 2";
  const indication = protocolData.indication || "specified indication";
  
  // Determine appropriate test type based on endpoint
  let testType = "Two-sided t-test";
  let analysisApproach = "ANCOVA with baseline as covariate";
  
  if (endpoint.includes("survival") || endpoint.includes("time to") || endpoint.includes("progression")) {
    testType = "Log-rank test";
    analysisApproach = "Cox proportional hazards model";
  } else if (endpoint.includes("response") || endpoint.includes("remission") || endpoint.includes("cure")) {
    testType = "Chi-square test";
    analysisApproach = "Logistic regression";
  }
  
  // Determine sample size rationale
  const powerLevel = phase.includes("3") ? "90%" : "80%";
  
  // Determine population definitions
  const populationDefs = [
    "Intent-to-Treat (ITT): All randomized subjects",
    "Per-Protocol (PP): Subjects who complete the study without major protocol deviations",
    "Safety Population: All subjects who receive at least one dose of study treatment"
  ].join("\n- ");
  
  // Generate appropriate missing data handling approach
  const missingDataApproach = phase.includes("3") ? 
    "Multiple Imputation (MI) using Rubin's rules as primary approach with sensitivity analyses using LOCF and WOCF" :
    "Mixed-effects model for repeated measures (MMRM) with missing at random (MAR) assumption";
  
  // Generate appropriate interim analysis plan
  const interimAnalysis = phase.includes("3") ? 
    `Planned at 50% of target events with O'Brien-Fleming stopping boundary and alpha spending function` :
    `No formal interim analysis planned for efficacy`;
  
  return `Statistical Analysis Plan (Auto-Generated)

Primary Analysis:
- Endpoint: ${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}
- Null Hypothesis: No difference between treatment and control groups on ${endpoint}
- Test Type: ${testType} (alpha = 0.05)
- Primary Analysis Method: ${analysisApproach}
- Sample Size: ${sampleSize} subjects, powered at ${powerLevel} to detect clinically meaningful difference
- Duration: ${duration} weeks

Analysis Populations:
- ${populationDefs}

Missing Data Strategy:
- ${missingDataApproach}

Interim Analysis:
- ${interimAnalysis}

Multiple Testing:
- Hierarchical testing procedure for primary and key secondary endpoints
- Hochberg procedure for other secondary endpoints

Subgroup Analyses:
- Pre-specified analyses by age, gender, and disease severity
- Forest plot visualization of treatment effects across subgroups

Safety Analyses:
- Descriptive statistics for adverse events by severity and causality
- Time-to-event analysis for discontinuations
- Shift tables for laboratory parameters
`;
}

/**
 * Generate a shorter SAP snippet focused on core elements
 * 
 * @param protocolData The parsed protocol data
 * @returns A formatted brief SAP string
 */
export function generateBriefSAP(protocolData: ProtocolData): string {
  const endpoint = protocolData.endpoint_primary?.toLowerCase() || "primary endpoint";
  const sampleSize = protocolData.sample_size || 200;
  const duration = protocolData.duration_weeks || 24;
  
  // Determine appropriate test type based on endpoint
  let testType = "Two-sided t-test";
  
  if (endpoint.includes("survival") || endpoint.includes("time to")) {
    testType = "Log-rank test";
  } else if (endpoint.includes("response") || endpoint.includes("remission")) {
    testType = "Chi-square test";
  }
  
  return `Statistical Analysis Plan (Brief):
- Primary Endpoint: ${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}
- Null Hypothesis: No difference between treatment and control on ${endpoint}
- Test Type: ${testType} (alpha = 0.05)
- Sample Size: ${sampleSize}, powered at 80% for minimal clinically important difference
- Analysis Set: ITT population with per-protocol sensitivity analysis
- Duration: ${duration} weeks
- Missing Data: Multiple imputation approach
`;
}

/**
 * Detect changes in key statistical parameters between protocol versions
 * 
 * @param previousData The previous protocol data
 * @param currentData The current protocol data
 * @returns An array of strings describing statistical implications
 */
export function detectStatisticalImplications(
  previousData: ProtocolData,
  currentData: ProtocolData
): string[] {
  const implications: string[] = [];
  
  // Sample size changes
  if (previousData.sample_size !== currentData.sample_size) {
    const oldSize = previousData.sample_size || 0;
    const newSize = currentData.sample_size || 0;
    
    if (newSize > oldSize) {
      implications.push(`Increased sample size (${oldSize} → ${newSize}) will improve study power and ability to detect smaller effect sizes.`);
    } else {
      implications.push(`Decreased sample size (${oldSize} → ${newSize}) may reduce study power. Consider re-evaluating power calculations.`);
    }
  }
  
  // Duration changes
  if (previousData.duration_weeks !== currentData.duration_weeks) {
    const oldDuration = previousData.duration_weeks || 0;
    const newDuration = currentData.duration_weeks || 0;
    
    if (newDuration > oldDuration) {
      implications.push(`Extended duration (${oldDuration} → ${newDuration} weeks) may improve endpoint capture but increase dropout risk.`);
    } else {
      implications.push(`Shortened duration (${oldDuration} → ${newDuration} weeks) may reduce dropouts but potentially miss delayed treatment effects.`);
    }
  }
  
  // Endpoint changes
  if (previousData.endpoint_primary !== currentData.endpoint_primary) {
    implications.push(`Primary endpoint change requires verification of statistical approach and power calculations.`);
  }
  
  return implications;
}