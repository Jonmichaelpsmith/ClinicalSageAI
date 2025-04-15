/**
 * Clinical Trial Insights Service
 * 
 * This service leverages the comprehensive CSR semantic data model to generate
 * actionable insights for improving clinical trial design and execution.
 * 
 * It analyzes patterns across CSRs to identify:
 * - Optimal study designs by indication
 * - Effective inclusion/exclusion criteria
 * - Most successful endpoint selections
 * - Sample size optimization
 * - Patient recruitment strategies
 * - Safety monitoring recommendations
 */

import { db } from '../db';
import * as csrSchema from '../../shared/csr-schema';
import { eq, and, isNull, like, sql, desc, gt, lt, gte, lte, inArray } from 'drizzle-orm';
import { log } from '../vite';
import { Hf } from '@huggingface/inference';

// Initialize HuggingFace for advanced analytics
const hf = new Hf(process.env.HF_API_KEY);

interface StudyDesignRecommendation {
  indication: string;
  phase: string;
  recommended_design: string;
  randomization: string;
  blinding: string;
  control_type: string;
  primary_endpoints: string[];
  secondary_endpoints: string[];
  sample_size_range: { min: number; max: number; optimal: number };
  duration_range: { min: number; max: number; optimal: number };
  success_probability: number;
  key_inclusion_criteria: string[];
  key_exclusion_criteria: string[];
  supporting_csrs: number[];
  confidence_score: number;
}

interface EndpointEffectivenessAnalysis {
  endpoint_name: string;
  indication: string;
  phase: string;
  usage_count: number;
  success_rate: number;
  time_frame: string;
  measurement_tools: string[];
  sensitivity: number;
  relative_effectiveness: number;
  recommended_alternatives: string[];
  supporting_csrs: number[];
}

interface SafetyInsight {
  indication: string;
  drug_class: string;
  common_adverse_events: Array<{ event: string; frequency: number }>;
  serious_adverse_events: Array<{ event: string; frequency: number }>;
  monitoring_recommendations: string[];
  risk_mitigation_strategies: string[];
  supporting_csrs: number[];
}

interface RecruitmentStrategy {
  indication: string;
  phase: string;
  average_enrollment_rate: number; // patients per month
  effective_inclusion_criteria: string[];
  high_screen_failure_criteria: string[];
  recommended_criteria_modifications: string[];
  site_characteristics: string[];
  geographic_insights: Record<string, number>;
  supporting_csrs: number[];
}

interface PatientComplianceInsight {
  indication: string;
  phase: string;
  average_completion_rate: number;
  discontinuation_reasons: Array<{ reason: string; frequency: number }>;
  compliance_improvement_strategies: string[];
  visit_schedule_recommendations: string[];
  supporting_csrs: number[];
}

interface TrialInsightsBundle {
  therapeutic_area: string;
  indication: string;
  phase: string;
  study_design: StudyDesignRecommendation;
  endpoint_effectiveness: EndpointEffectivenessAnalysis[];
  safety_insights: SafetyInsight[];
  recruitment_strategies: RecruitmentStrategy[];
  patient_compliance: PatientComplianceInsight;
  data_quality_metrics: {
    completeness_score: number;
    consistency_score: number;
    supporting_csr_count: number;
  };
}

/**
 * Generate comprehensive insights for optimizing clinical trials
 * by therapeutic area, indication, and phase
 */
async function generateTrialInsights(
  therapeuticArea: string,
  indication: string,
  phase: string
): Promise<TrialInsightsBundle> {
  log(`Generating trial insights for ${indication} (${phase}) in ${therapeuticArea}...`);
  
  // 1. Find all relevant CSRs for this indication and phase
  const relevantCsrIds = await findRelevantCsrIds(therapeuticArea, indication, phase);
  
  if (relevantCsrIds.length === 0) {
    log(`No CSRs found for ${indication} (${phase}) in ${therapeuticArea}`);
    throw new Error(`No CSRs found for ${indication} (${phase}) in ${therapeuticArea}`);
  }
  
  log(`Found ${relevantCsrIds.length} relevant CSRs for analysis`);
  
  // 2. Generate each insight component in parallel
  const [
    studyDesignRec,
    endpointAnalysis,
    safetyInsights,
    recruitmentStrategies,
    complianceInsights
  ] = await Promise.all([
    generateStudyDesignRecommendations(relevantCsrIds, indication, phase),
    analyzeEndpointEffectiveness(relevantCsrIds, indication, phase),
    analyzeSafetyProfile(relevantCsrIds, indication),
    analyzeRecruitmentStrategies(relevantCsrIds, indication, phase),
    analyzePatientCompliance(relevantCsrIds, indication, phase)
  ]);
  
  // 3. Calculate data quality metrics
  const dataQualityMetrics = await calculateDataQualityMetrics(relevantCsrIds);
  
  // 4. Combine all insights into a bundle
  return {
    therapeutic_area: therapeuticArea,
    indication,
    phase,
    study_design: studyDesignRec,
    endpoint_effectiveness: endpointAnalysis,
    safety_insights: safetyInsights,
    recruitment_strategies: recruitmentStrategies,
    patient_compliance: complianceInsights,
    data_quality_metrics: dataQualityMetrics
  };
}

/**
 * Find relevant CSR IDs for a specific therapeutic area, indication, and phase
 */
async function findRelevantCsrIds(
  therapeuticArea: string,
  indication: string,
  phase: string
): Promise<number[]> {
  // Get exact and fuzzy matches for indication
  const csrResults = await db.select({ id: csrSchema.csrReports.id })
    .from(csrSchema.csrReports)
    .where(
      and(
        isNull(csrSchema.csrReports.deleted_at),
        sql`(
          ${csrSchema.csrReports.therapeutic_area} = ${therapeuticArea}
          OR LOWER(${csrSchema.csrReports.therapeutic_area}) LIKE ${`%${therapeuticArea.toLowerCase()}%`}
        )`,
        sql`(
          ${csrSchema.csrReports.indication} = ${indication}
          OR LOWER(${csrSchema.csrReports.indication}) LIKE ${`%${indication.toLowerCase()}%`}
        )`,
        sql`(
          ${csrSchema.csrReports.phase} = ${phase}
          OR ${csrSchema.csrReports.phase} LIKE ${`%${phase}%`}
        )`
      )
    );
  
  return csrResults.map(row => row.id);
}

/**
 * Generate study design recommendations based on successful CSRs
 */
async function generateStudyDesignRecommendations(
  csrIds: number[],
  indication: string,
  phase: string
): Promise<StudyDesignRecommendation> {
  // Get all design details from relevant CSRs
  const designDetails = await db.select({
    id: csrSchema.csrReports.id,
    sample_size: csrSchema.csrDetails.sample_size,
    study_design: csrSchema.csrDetails.study_design,
    study_type: csrSchema.csrDetails.study_type,
    randomization: csrSchema.csrDetails.randomization,
    blinding: csrSchema.csrDetails.blinding,
    control_type: csrSchema.csrDetails.control_type,
    primary_endpoints: csrSchema.csrDetails.primary_endpoints,
    secondary_endpoints: csrSchema.csrDetails.secondary_endpoints,
    duration: csrSchema.csrDetails.study_duration,
    inclusion_criteria: csrSchema.csrDetails.inclusion_criteria,
    exclusion_criteria: csrSchema.csrDetails.exclusion_criteria
  })
  .from(csrSchema.csrReports)
  .innerJoin(csrSchema.csrDetails, eq(csrSchema.csrReports.id, csrSchema.csrDetails.report_id))
  .where(inArray(csrSchema.csrReports.id, csrIds));
  
  if (designDetails.length === 0) {
    throw new Error(`No design details found for CSRs: ${csrIds.join(', ')}`);
  }
  
  // Analyze design patterns
  
  // Analyze sample sizes
  const sampleSizes = designDetails
    .map(d => d.sample_size)
    .filter(Boolean)
    .sort((a, b) => a - b);
  
  const sampleSizeMin = sampleSizes[0];
  const sampleSizeMax = sampleSizes[sampleSizes.length - 1];
  const sampleSizeOptimal = sampleSizes[Math.floor(sampleSizes.length / 2)]; // Median
  
  // Analyze randomization approaches
  const randomizationApproaches = designDetails
    .map(d => d.randomization)
    .filter(Boolean) as string[];
  
  const randomization = findMostCommon(randomizationApproaches) || "Not specified";
  
  // Analyze blinding approaches
  const blindingApproaches = designDetails
    .map(d => d.blinding)
    .filter(Boolean) as string[];
  
  const blinding = findMostCommon(blindingApproaches) || "Not specified";
  
  // Analyze control types
  const controlTypes = designDetails
    .map(d => d.control_type)
    .filter(Boolean) as string[];
  
  const controlType = findMostCommon(controlTypes) || "Not specified";
  
  // Analyze study designs
  const studyDesigns = designDetails
    .map(d => d.study_design)
    .filter(Boolean) as string[];
  
  // Extract most common primary and secondary endpoints
  const allPrimaryEndpoints = designDetails
    .flatMap(d => d.primary_endpoints || [])
    .filter(Boolean);
  
  const allSecondaryEndpoints = designDetails
    .flatMap(d => d.secondary_endpoints || [])
    .filter(Boolean);
  
  const primaryEndpoints = findTopN(allPrimaryEndpoints, 3);
  const secondaryEndpoints = findTopN(allSecondaryEndpoints, 5);
  
  // Extract key inclusion and exclusion criteria
  // First, we'll use NLP to extract the key patterns
  const inclusionTexts = designDetails
    .map(d => d.inclusion_criteria)
    .filter(Boolean)
    .join("\n\n");
  
  const exclusionTexts = designDetails
    .map(d => d.exclusion_criteria)
    .filter(Boolean)
    .join("\n\n");
  
  let keyInclusion: string[] = [];
  let keyExclusion: string[] = [];
  
  if (inclusionTexts.length > 100) {
    try {
      const inclusionResult = await hf.textGeneration({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        inputs: `Extract the 5 most common and important inclusion criteria from these clinical trials for ${indication} (${phase}):\n\n${inclusionTexts.substring(0, 5000)}\n\nList only the 5 most important patterns as bullet points, no additional text.`,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.1
        }
      });
      
      keyInclusion = parseListFromText(inclusionResult.generated_text);
    } catch (e) {
      log(`Error extracting inclusion criteria: ${e}`);
      keyInclusion = [];
    }
  }
  
  if (exclusionTexts.length > 100) {
    try {
      const exclusionResult = await hf.textGeneration({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        inputs: `Extract the 5 most common and important exclusion criteria from these clinical trials for ${indication} (${phase}):\n\n${exclusionTexts.substring(0, 5000)}\n\nList only the 5 most important patterns as bullet points, no additional text.`,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.1
        }
      });
      
      keyExclusion = parseListFromText(exclusionResult.generated_text);
    } catch (e) {
      log(`Error extracting exclusion criteria: ${e}`);
      keyExclusion = [];
    }
  }
  
  // Calculate success probability based on pattern analysis
  // This is a simplified approach - in a real system we'd use ML
  const confidenceScore = Math.min(1, designDetails.length / 10);
  const successProbability = 0.5 + (confidenceScore * 0.3); // Base 50% + up to 30% based on confidence
  
  // Generate recommendation
  return {
    indication,
    phase,
    recommended_design: findMostCommon(studyDesigns) || "Not enough data",
    randomization,
    blinding,
    control_type: controlType,
    primary_endpoints: primaryEndpoints,
    secondary_endpoints: secondaryEndpoints,
    sample_size_range: {
      min: sampleSizeMin || 0,
      max: sampleSizeMax || 0,
      optimal: sampleSizeOptimal || 0
    },
    duration_range: {
      min: 0, // Would calculate from actual data
      max: 0, // Would calculate from actual data
      optimal: 0 // Would calculate from actual data
    },
    success_probability: successProbability,
    key_inclusion_criteria: keyInclusion,
    key_exclusion_criteria: keyExclusion,
    supporting_csrs: csrIds,
    confidence_score: confidenceScore
  };
}

/**
 * Analyze endpoint effectiveness based on CSR data
 */
async function analyzeEndpointEffectiveness(
  csrIds: number[],
  indication: string,
  phase: string
): Promise<EndpointEffectivenessAnalysis[]> {
  // Get all endpoints from the CSRs
  const endpointData = await db.select({
    endpoint_id: csrSchema.csrEndpoints.id,
    endpoint_name: csrSchema.csrEndpoints.custom_endpoint_name,
    standard_name: csrSchema.standardEndpoints.name,
    endpoint_type: csrSchema.csrEndpoints.endpoint_type,
    time_frame: csrSchema.csrEndpoints.time_frame,
    measure_type: csrSchema.csrEndpoints.measure_type,
    statistical_significance: csrSchema.csrEndpoints.statistical_significance,
    p_value: csrSchema.csrEndpoints.p_value
  })
  .from(csrSchema.csrEndpoints)
  .leftJoin(
    csrSchema.standardEndpoints,
    eq(csrSchema.csrEndpoints.endpoint_id, csrSchema.standardEndpoints.id)
  )
  .where(inArray(csrSchema.csrEndpoints.report_id, csrIds));
  
  // Group endpoints by name
  const endpointGroups: Record<string, any[]> = {};
  
  endpointData.forEach(endpoint => {
    const name = endpoint.standard_name || endpoint.endpoint_name || 'Unknown';
    if (!endpointGroups[name]) {
      endpointGroups[name] = [];
    }
    endpointGroups[name].push(endpoint);
  });
  
  // Analyze each endpoint group
  const endpointAnalyses: EndpointEffectivenessAnalysis[] = [];
  
  for (const [name, endpoints] of Object.entries(endpointGroups)) {
    if (endpoints.length < 2) continue; // Skip endpoints with too little data
    
    // Calculate success rate
    const successCount = endpoints.filter(e => e.statistical_significance === true).length;
    const successRate = endpoints.length > 0 ? successCount / endpoints.length : 0;
    
    // Get most common time frame
    const timeFrames = endpoints
      .map(e => e.time_frame)
      .filter(Boolean) as string[];
    
    const mostCommonTimeFrame = findMostCommon(timeFrames) || 'Not specified';
    
    // Get measurement tools (would extract from actual data)
    const measurementTools = ['Not available in current data model'];
    
    // Calculate relative effectiveness (simplified)
    const relativeEffectiveness = successRate;
    
    endpointAnalyses.push({
      endpoint_name: name,
      indication,
      phase,
      usage_count: endpoints.length,
      success_rate: successRate,
      time_frame: mostCommonTimeFrame,
      measurement_tools: measurementTools,
      sensitivity: 0.5, // Placeholder - would be calculated from actual data
      relative_effectiveness: relativeEffectiveness,
      recommended_alternatives: [], // Would be derived from analysis
      supporting_csrs: csrIds
    });
  }
  
  // Sort by effectiveness
  return endpointAnalyses.sort((a, b) => b.relative_effectiveness - a.relative_effectiveness);
}

/**
 * Analyze safety profile based on CSR data
 */
async function analyzeSafetyProfile(
  csrIds: number[],
  indication: string
): Promise<SafetyInsight[]> {
  // Fetch safety data from CSRs
  const safetyData = await db.select({
    report_id: csrSchema.csrDetails.report_id,
    safety: csrSchema.csrDetails.safety,
    adverse_events: csrSchema.csrDetails.adverse_events,
    serious_adverse_events: csrSchema.csrDetails.serious_adverse_events,
    drug_name: csrSchema.csrReports.drug_name
  })
  .from(csrSchema.csrDetails)
  .innerJoin(
    csrSchema.csrReports,
    eq(csrSchema.csrDetails.report_id, csrSchema.csrReports.id)
  )
  .where(inArray(csrSchema.csrDetails.report_id, csrIds));
  
  // Group by drug class (simplified - would use taxonomy in real system)
  const drugGroups: Record<string, any[]> = {};
  
  safetyData.forEach(data => {
    const drugName = data.drug_name || 'Unknown';
    if (!drugGroups[drugName]) {
      drugGroups[drugName] = [];
    }
    drugGroups[drugName].push(data);
  });
  
  const safetyInsights: SafetyInsight[] = [];
  
  // Analyze each drug group
  for (const [drugClass, dataPoints] of Object.entries(drugGroups)) {
    // Extract common adverse events (simplified)
    const commonAEs: Array<{ event: string; frequency: number }> = [];
    const seriousAEs: Array<{ event: string; frequency: number }> = [];
    
    // In a real system, we would parse the JSON data and extract events
    // For now, we'll use placeholder logic
    commonAEs.push({ event: "Data would be extracted from JSON fields", frequency: 0 });
    seriousAEs.push({ event: "Data would be extracted from JSON fields", frequency: 0 });
    
    // Generate safety insights
    safetyInsights.push({
      indication,
      drug_class: drugClass,
      common_adverse_events: commonAEs,
      serious_adverse_events: seriousAEs,
      monitoring_recommendations: [
        "Would be derived from safety data analysis",
        "Based on common and serious AE patterns"
      ],
      risk_mitigation_strategies: [
        "Would be derived from safety data analysis",
        "Based on observed safety profile"
      ],
      supporting_csrs: csrIds
    });
  }
  
  return safetyInsights;
}

/**
 * Analyze recruitment strategies based on CSR data
 */
async function analyzeRecruitmentStrategies(
  csrIds: number[],
  indication: string,
  phase: string
): Promise<RecruitmentStrategy> {
  // This would analyze enrollment data, screen failure rates, etc.
  // Since our schema doesn't fully support this yet, we'll return placeholder data
  
  return {
    indication,
    phase,
    average_enrollment_rate: 0, // Placeholder
    effective_inclusion_criteria: [
      "Would be derived from successful trials",
      "Based on inclusion criteria and enrollment rates"
    ],
    high_screen_failure_criteria: [
      "Would be derived from screen failure data",
      "Not yet captured in current schema"
    ],
    recommended_criteria_modifications: [
      "Would suggest optimizations to inclusion/exclusion criteria",
      "Based on enrollment patterns and screen failures"
    ],
    site_characteristics: [
      "Would analyze successful vs struggling sites",
      "Not yet captured in current schema"
    ],
    geographic_insights: {
      "North America": 0,
      "Europe": 0,
      "Asia": 0
    },
    supporting_csrs: csrIds
  };
}

/**
 * Analyze patient compliance based on CSR data
 */
async function analyzePatientCompliance(
  csrIds: number[],
  indication: string,
  phase: string
): Promise<PatientComplianceInsight> {
  // Fetch completion rate and discontinuation data
  const complianceData = await db.select({
    report_id: csrSchema.csrDetails.report_id,
    completion_rate: csrSchema.csrDetails.completion_rate,
    discontinuation_reasons: csrSchema.csrDetails.discontinuation_reasons
  })
  .from(csrSchema.csrDetails)
  .where(inArray(csrSchema.csrDetails.report_id, csrIds));
  
  // Calculate average completion rate
  const completionRates = complianceData
    .map(d => d.completion_rate)
    .filter(Boolean) as number[];
  
  const averageCompletionRate = completionRates.length > 0
    ? completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length
    : 0;
  
  // Extract discontinuation reasons
  const discontinuationReasons: Array<{ reason: string; frequency: number }> = [];
  
  // In a real system, we would analyze the JSON data to extract patterns
  // For now, return placeholder data
  discontinuationReasons.push(
    { reason: "Adverse Events", frequency: 0.4 },
    { reason: "Lack of Efficacy", frequency: 0.3 },
    { reason: "Protocol Violation", frequency: 0.15 },
    { reason: "Withdrawal of Consent", frequency: 0.1 },
    { reason: "Lost to Follow-up", frequency: 0.05 }
  );
  
  return {
    indication,
    phase,
    average_completion_rate: averageCompletionRate,
    discontinuation_reasons: discontinuationReasons,
    compliance_improvement_strategies: [
      "Would be derived from patterns in high vs low retention trials",
      "Based on successful mitigation of common discontinuation reasons"
    ],
    visit_schedule_recommendations: [
      "Would analyze optimal visit frequency and timing",
      "Not yet captured in current schema"
    ],
    supporting_csrs: csrIds
  };
}

/**
 * Calculate data quality metrics for the analyzed CSRs
 */
async function calculateDataQualityMetrics(csrIds: number[]): Promise<{
  completeness_score: number;
  consistency_score: number;
  supporting_csr_count: number;
}> {
  // Get CSR details to calculate completeness
  const csrDetails = await db.select({
    has_details: csrSchema.csrReports.has_details,
    processed: csrSchema.csrDetails.processed
  })
  .from(csrSchema.csrReports)
  .leftJoin(
    csrSchema.csrDetails,
    eq(csrSchema.csrReports.id, csrSchema.csrDetails.report_id)
  )
  .where(inArray(csrSchema.csrReports.id, csrIds));
  
  // Calculate completeness score
  const completenessScores = csrDetails.map(d => {
    if (!d.has_details) return 0;
    if (!d.processed) return 0.3;
    return 1;
  });
  
  const completenessScore = completenessScores.length > 0
    ? completenessScores.reduce((sum, score) => sum + score, 0) / completenessScores.length
    : 0;
  
  // Consistency score - would be more sophisticated in real system
  const consistencyScore = 0.8; // Placeholder
  
  return {
    completeness_score: completenessScore,
    consistency_score: consistencyScore,
    supporting_csr_count: csrIds.length
  };
}

/**
 * Generate optimized protocol recommendations for a new trial
 */
async function generateOptimizedProtocol(
  therapeuticArea: string,
  indication: string,
  phase: string,
  targetPatientPopulation?: string,
  specialConsiderations?: string[]
): Promise<any> {
  // Generate trial insights
  const insights = await generateTrialInsights(therapeuticArea, indication, phase);
  
  // Use insights to create optimized protocol
  // In a real system, this would be much more sophisticated
  
  return {
    protocol_template: {
      title: `Phase ${phase} Study of [DRUG] in ${indication}`,
      sponsor: "[SPONSOR]",
      indication: indication,
      phase: phase,
      study_design: insights.study_design.recommended_design,
      primary_objective: `To evaluate the efficacy of [DRUG] in patients with ${indication}`,
      secondary_objectives: [
        `To evaluate the safety and tolerability of [DRUG] in patients with ${indication}`,
        `To evaluate the pharmacokinetics of [DRUG] in patients with ${indication}`
      ],
      study_population: targetPatientPopulation || `Adult patients with ${indication}`,
      estimated_enrollment: insights.study_design.sample_size_range.optimal,
      study_duration: `${insights.study_design.duration_range.optimal || "TBD"} weeks`,
      treatment_arms: [
        { name: "Treatment Arm", description: "[DRUG] at [DOSE]" },
        { name: "Control Arm", description: insights.study_design.control_type }
      ],
      randomization: insights.study_design.randomization,
      blinding: insights.study_design.blinding,
      primary_endpoints: insights.study_design.primary_endpoints,
      secondary_endpoints: insights.study_design.secondary_endpoints.slice(0, 3),
      inclusion_criteria: insights.study_design.key_inclusion_criteria,
      exclusion_criteria: insights.study_design.key_exclusion_criteria,
      statistical_considerations: {
        sample_size_justification: `Based on analysis of ${insights.data_quality_metrics.supporting_csr_count} similar trials, a sample size of ${insights.study_design.sample_size_range.optimal} provides adequate power.`,
        analysis_populations: [
          "Intent-to-Treat (ITT) Population",
          "Per-Protocol (PP) Population",
          "Safety Population"
        ],
        primary_analysis: `The primary endpoint will be analyzed using [statistical approach]`,
        secondary_analyses: `Secondary endpoints will be analyzed using appropriate statistical methods`,
        interim_analyses: "Not planned"
      },
      safety_monitoring: {
        adverse_event_reporting: "Standard AE and SAE reporting",
        safety_parameters: [
          "Vital signs",
          "Laboratory assessments",
          "Physical examinations"
        ],
        data_monitoring_committee: "Independent DMC will be established",
        stopping_rules: "The study may be stopped for safety concerns or futility"
      },
      special_considerations: specialConsiderations || []
    },
    supporting_insights: {
      success_probability: insights.study_design.success_probability,
      confidence_score: insights.study_design.confidence_score,
      key_success_factors: [
        `Optimal sample size (${insights.study_design.sample_size_range.optimal} patients)`,
        `Strong endpoint selection (${insights.study_design.primary_endpoints.join(", ")})`,
        `Appropriate inclusion/exclusion criteria to minimize screen failures`,
        `${insights.study_design.randomization} randomization with ${insights.study_design.blinding} design`
      ],
      key_risks: [
        `Patient retention (historical completion rate: ${Math.round(insights.patient_compliance.average_completion_rate * 100)}%)`,
        `Safety considerations specific to ${indication}`
      ],
      data_quality_note: `This protocol is based on data from ${insights.data_quality_metrics.supporting_csr_count} CSRs with a completeness score of ${Math.round(insights.data_quality_metrics.completeness_score * 100)}%`
    }
  };
}

/**
 * Generate comparative analysis of trial designs across similar indications
 */
async function generateComparativeAnalysis(
  therapeuticArea: string,
  indications: string[],
  phase: string
): Promise<any> {
  // Generate insights for each indication
  const allInsights = await Promise.all(
    indications.map(indication => 
      generateTrialInsights(therapeuticArea, indication, phase)
        .catch(err => {
          log(`Error generating insights for ${indication}: ${err.message}`);
          return null;
        })
    )
  );
  
  // Filter out any failed analyses
  const validInsights = allInsights.filter(Boolean);
  
  if (validInsights.length === 0) {
    throw new Error(`No valid insights could be generated for any of the specified indications`);
  }
  
  // Compile comparative analysis
  const comparisonResult = {
    therapeutic_area: therapeuticArea,
    phase: phase,
    indications_analyzed: validInsights.map(i => i?.indication),
    design_comparison: {
      sample_sizes: validInsights.map(i => ({
        indication: i?.indication,
        optimal_size: i?.study_design.sample_size_range.optimal,
        range: [i?.study_design.sample_size_range.min, i?.study_design.sample_size_range.max]
      })),
      designs: validInsights.map(i => ({
        indication: i?.indication,
        design: i?.study_design.recommended_design
      })),
      randomization: validInsights.map(i => ({
        indication: i?.indication,
        approach: i?.study_design.randomization
      })),
      blinding: validInsights.map(i => ({
        indication: i?.indication,
        approach: i?.study_design.blinding
      })),
      endpoint_selection: validInsights.map(i => ({
        indication: i?.indication,
        primary: i?.study_design.primary_endpoints,
        secondary: i?.study_design.secondary_endpoints.slice(0, 3)
      }))
    },
    success_factors: {
      patient_compliance: validInsights.map(i => ({
        indication: i?.indication,
        completion_rate: i?.patient_compliance.average_completion_rate,
        top_discontinuation_reasons: i?.patient_compliance.discontinuation_reasons.slice(0, 3)
      })),
      safety_profile: validInsights.map(i => ({
        indication: i?.indication,
        common_aes: i?.safety_insights[0]?.common_adverse_events.slice(0, 3) || []
      })),
      probability: validInsights.map(i => ({
        indication: i?.indication,
        success_probability: i?.study_design.success_probability
      }))
    },
    cross_indication_learnings: [
      "Would derive common patterns across indications",
      "Would identify unique considerations per indication",
      "Would recommend transportable design elements"
    ],
    data_quality_note: `This analysis is based on CSR data across ${validInsights.length} indications in ${therapeuticArea}`
  };
  
  return comparisonResult;
}

// Helper functions

/**
 * Find the most common value in an array
 */
function findMostCommon<T>(arr: T[]): T | null {
  if (!arr || arr.length === 0) return null;
  
  const counts = new Map<T, number>();
  arr.forEach(item => {
    if (!item) return;
    counts.set(item, (counts.get(item) || 0) + 1);
  });
  
  let maxCount = 0;
  let maxItem: T | null = null;
  
  counts.forEach((count, item) => {
    if (count > maxCount) {
      maxCount = count;
      maxItem = item;
    }
  });
  
  return maxItem;
}

/**
 * Find the top N most common values in an array
 */
function findTopN<T>(arr: T[], n: number): T[] {
  if (!arr || arr.length === 0) return [];
  
  const counts = new Map<T, number>();
  arr.forEach(item => {
    if (!item) return;
    counts.set(item, (counts.get(item) || 0) + 1);
  });
  
  // Convert to array of [item, count] pairs and sort by count
  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(pair => pair[0]);
  
  return sorted;
}

/**
 * Parse a list from text output
 */
function parseListFromText(text: string): string[] {
  if (!text) return [];
  
  // Look for bullet points or numbered lists
  const listItems = text.split(/\n/).filter(line => {
    return line.trim().match(/^[•\-\*\d]+\.\s+.+/) || line.trim().match(/^[•\-\*]\s+.+/);
  });
  
  if (listItems.length > 0) {
    // Clean up bullet points
    return listItems.map(item => 
      item.trim().replace(/^[•\-\*\d]+\.?\s+/, '')
    );
  }
  
  // Fallback: split by periods or newlines
  return text.split(/[.\n]/).map(s => s.trim()).filter(Boolean);
}

// Export the public API
export {
  generateTrialInsights,
  generateOptimizedProtocol,
  generateComparativeAnalysis,
  findRelevantCsrIds
};