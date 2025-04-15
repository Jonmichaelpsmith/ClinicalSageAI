// Trial Predictor Service
// This is a simplified version that returns mock data for the direct API

interface TrialParameters {
  sample_size: number;
  duration_weeks: number;
  dropout_rate?: number;
  indication: string;
  phase: string;
  primary_endpoints?: string[];
  secondary_endpoints?: string[];
  control_arm?: string;
  blinding?: string;
}

interface TrialPrediction {
  probability: number;
  confidence: number;
  factors: {
    [key: string]: {
      impact: number;
      direction: 'positive' | 'negative' | 'neutral';
    }
  }
}

interface SampleSizeParams {
  indication: string;
  phase: string;
  duration_weeks: number;
}

interface SampleSizeRecommendation {
  recommendedSampleSize: number;
  minSampleSize: number;
  maxSampleSize: number;
  confidence: number;
}

interface DurationParams {
  indication: string;
  phase: string;
  sample_size: number;
}

interface DurationRecommendation {
  recommendedDuration: number;
  minDuration: number;
  maxDuration: number;
  confidence: number;
}

interface TherapeuticAreaInsights {
  common_endpoints: string[];
  common_inclusion_criteria: string[];
  common_exclusion_criteria: string[];
  typical_challenges: string[];
  success_factors: string[];
}

class TrialPredictorService {
  // Check if model exists
  modelExists(): boolean {
    return true;
  }

  // Predict trial success probability
  async predictTrialSuccess(params: TrialParameters): Promise<TrialPrediction> {
    // Sample size impact (larger is better, but with diminishing returns)
    const sampleSizeImpact = Math.min(0.2, params.sample_size / 1000);
    
    // Duration impact (longer is better for chronic conditions, but with upper limit)
    const durationImpact = Math.min(0.15, params.duration_weeks / 104);
    
    // Phase impact (earlier phases tend to have higher success rates for simple endpoints)
    let phaseImpact = 0;
    switch (params.phase) {
      case "Phase 1":
        phaseImpact = 0.15;
        break;
      case "Phase 1/2":
        phaseImpact = 0.1;
        break;
      case "Phase 2":
        phaseImpact = 0.05;
        break;
      case "Phase 2/3":
        phaseImpact = 0;
        break;
      case "Phase 3":
        phaseImpact = -0.05;
        break;
      case "Phase 4":
        phaseImpact = 0.1;
        break;
      default:
        phaseImpact = 0;
    }
    
    // Therapeutic area impact
    let areaImpact = 0;
    switch (params.indication) {
      case "Oncology":
        areaImpact = -0.1; // Historically lower success rates
        break;
      case "Infectious Disease":
        areaImpact = 0.1; // Historically higher success rates
        break;
      case "Cardiovascular":
      case "Cardiology":
        areaImpact = -0.05;
        break;
      case "CNS":
      case "Neurology":
        areaImpact = -0.15; // Historically lower success rates
        break;
      default:
        areaImpact = 0;
    }
    
    // Blinding impact
    let blindingImpact = 0;
    if (params.blinding === "Double-blind") {
      blindingImpact = 0.1; // More rigorous design
    } else if (params.blinding === "Single-blind") {
      blindingImpact = 0.05;
    } else {
      blindingImpact = -0.05; // Open-label has higher risk of bias
    }
    
    // Calculate final probability
    const baseProbability = 0.5; // 50% base success rate
    let probability = baseProbability + sampleSizeImpact + durationImpact + phaseImpact + areaImpact + blindingImpact;
    
    // Clamp to valid probability range
    probability = Math.max(0.1, Math.min(0.9, probability));
    
    // Calculate confidence based on available information
    const confidence = 0.7 + (params.primary_endpoints ? 0.1 : 0) + (params.sample_size > 200 ? 0.1 : 0);
    
    return {
      probability,
      confidence,
      factors: {
        "sample_size": {
          impact: sampleSizeImpact * 5, // Scale to 0-1 range
          direction: sampleSizeImpact >= 0 ? "positive" : "negative"
        },
        "duration": {
          impact: durationImpact * 5,
          direction: durationImpact >= 0 ? "positive" : "negative"
        },
        "phase": {
          impact: Math.abs(phaseImpact) * 5,
          direction: phaseImpact >= 0 ? "positive" : "negative"
        },
        "therapeutic_area": {
          impact: Math.abs(areaImpact) * 5,
          direction: areaImpact >= 0 ? "positive" : "negative"
        },
        "blinding": {
          impact: Math.abs(blindingImpact) * 5,
          direction: blindingImpact >= 0 ? "positive" : "negative"
        }
      }
    };
  }

  // Recommend optimal sample size
  async recommendSampleSize(params: SampleSizeParams): Promise<SampleSizeRecommendation> {
    let baseSampleSize = 100; // Default base sample size
    
    // Adjust for phase
    switch (params.phase) {
      case "Phase 1":
        baseSampleSize = 50;
        break;
      case "Phase 1/2":
        baseSampleSize = 80;
        break;
      case "Phase 2":
        baseSampleSize = 120;
        break;
      case "Phase 2/3":
        baseSampleSize = 200;
        break;
      case "Phase 3":
        baseSampleSize = 300;
        break;
      case "Phase 4":
        baseSampleSize = 500;
        break;
    }
    
    // Adjust for therapeutic area
    let areaMultiplier = 1.0;
    switch (params.indication) {
      case "Oncology":
        areaMultiplier = 0.8; // Often smaller due to availability
        break;
      case "Infectious Disease":
        areaMultiplier = 1.2; // Often larger for statistical power
        break;
      case "Cardiovascular":
      case "Cardiology":
        areaMultiplier = 1.5; // Large to detect small differences
        break;
      case "CNS":
      case "Neurology":
        areaMultiplier = 1.3; // Large to account for variability
        break;
    }
    
    // Adjust for duration (shorter studies need larger sample sizes)
    const durationMultiplier = Math.max(0.8, Math.min(1.2, 1.4 - (params.duration_weeks / 100)));
    
    // Calculate recommended sample size
    const recommendedSampleSize = Math.round(baseSampleSize * areaMultiplier * durationMultiplier);
    
    return {
      recommendedSampleSize,
      minSampleSize: Math.round(recommendedSampleSize * 0.8),
      maxSampleSize: Math.round(recommendedSampleSize * 1.3),
      confidence: 0.85
    };
  }

  // Recommend optimal duration
  async recommendDuration(params: DurationParams): Promise<DurationRecommendation> {
    let baseDuration = 26; // Default base duration in weeks
    
    // Adjust for phase
    switch (params.phase) {
      case "Phase 1":
        baseDuration = 12;
        break;
      case "Phase 1/2":
        baseDuration = 20;
        break;
      case "Phase 2":
        baseDuration = 32;
        break;
      case "Phase 2/3":
        baseDuration = 48;
        break;
      case "Phase 3":
        baseDuration = 52;
        break;
      case "Phase 4":
        baseDuration = 104;
        break;
    }
    
    // Adjust for therapeutic area
    let areaMultiplier = 1.0;
    switch (params.indication) {
      case "Oncology":
        areaMultiplier = 1.5; // Longer for survival endpoints
        break;
      case "Infectious Disease":
        areaMultiplier = 0.7; // Often shorter
        break;
      case "Cardiovascular":
      case "Cardiology":
        areaMultiplier = 1.3; // Longer for event accumulation
        break;
      case "CNS":
      case "Neurology":
        areaMultiplier = 1.2; // Longer for chronic conditions
        break;
    }
    
    // Adjust for sample size (smaller sample sizes might need longer duration)
    const sampleSizeMultiplier = Math.max(0.9, Math.min(1.2, 1.3 - (params.sample_size / 500)));
    
    // Calculate recommended duration
    const recommendedDuration = Math.round(baseDuration * areaMultiplier * sampleSizeMultiplier);
    
    return {
      recommendedDuration,
      minDuration: Math.round(recommendedDuration * 0.9),
      maxDuration: Math.round(recommendedDuration * 1.2),
      confidence: 0.75
    };
  }

  // Get therapeutic area insights
  async getTherapeuticAreaInsights(therapeuticArea: string): Promise<TherapeuticAreaInsights> {
    // Default insights that apply to most therapeutic areas
    let insights: TherapeuticAreaInsights = {
      common_endpoints: [
        "Safety and tolerability",
        "Adverse events",
        "Treatment discontinuation"
      ],
      common_inclusion_criteria: [
        "Adults aged 18-75 years",
        "Confirmed diagnosis",
        "Ability to provide informed consent"
      ],
      common_exclusion_criteria: [
        "Pregnancy or breastfeeding",
        "Serious comorbidities",
        "Participation in other clinical trials"
      ],
      typical_challenges: [
        "Patient recruitment",
        "Protocol adherence",
        "Treatment compliance"
      ],
      success_factors: [
        "Clear eligibility criteria",
        "Rigorous protocol design",
        "Experienced research team"
      ]
    };
    
    // Customize insights based on therapeutic area
    switch (therapeuticArea) {
      case "Oncology":
        insights = {
          common_endpoints: [
            "Overall survival (OS)",
            "Progression-free survival (PFS)",
            "Objective response rate (ORR)",
            "Disease control rate (DCR)"
          ],
          common_inclusion_criteria: [
            "Histologically confirmed cancer",
            "Measurable disease per RECIST criteria",
            "ECOG performance status 0-2",
            "Adequate organ function"
          ],
          common_exclusion_criteria: [
            "Brain metastases",
            "Prior treatment with study drug class",
            "Active autoimmune disease",
            "Uncontrolled comorbidities"
          ],
          typical_challenges: [
            "Competing trials",
            "Patient deterioration during study",
            "Biomarker identification",
            "Crossover confounding survival data"
          ],
          success_factors: [
            "Biomarker-guided enrollment",
            "Adaptive trial design",
            "Strong scientific rationale",
            "Patient-centric endpoints"
          ]
        };
        break;
      
      case "Cardiology":
      case "Cardiovascular":
        insights = {
          common_endpoints: [
            "Major adverse cardiovascular events (MACE)",
            "Cardiovascular death",
            "Myocardial infarction",
            "Change in blood pressure"
          ],
          common_inclusion_criteria: [
            "Diagnosed cardiovascular disease",
            "Stable medical regimen",
            "Specific risk factors present",
            "ECG documentation"
          ],
          common_exclusion_criteria: [
            "Recent cardiovascular event (<3 months)",
            "Severe renal impairment",
            "Uncontrolled hypertension",
            "QTc prolongation"
          ],
          typical_challenges: [
            "Event rate estimation",
            "Long follow-up periods",
            "Polypharmacy interactions",
            "Background therapy standardization"
          ],
          success_factors: [
            "Composite endpoints",
            "Central adjudication committee",
            "Risk-based enrollment",
            "Large sample size"
          ]
        };
        break;
      
      case "Neurology":
      case "CNS":
        insights = {
          common_endpoints: [
            "Change in disease-specific rating scales",
            "Time to progression",
            "Cognitive function",
            "Quality of life measures"
          ],
          common_inclusion_criteria: [
            "Confirmed neurological diagnosis",
            "Specific symptom severity",
            "Duration of disease",
            "Cognitive status assessment"
          ],
          common_exclusion_criteria: [
            "Other neurological conditions",
            "Psychiatric comorbidities",
            "Substance abuse history",
            "Certain concomitant medications"
          ],
          typical_challenges: [
            "Subjective assessments",
            "Placebo response",
            "Disease heterogeneity",
            "Biomarker development"
          ],
          success_factors: [
            "Standardized assessments",
            "Rater training",
            "Patient stratification",
            "Adaptive designs"
          ]
        };
        break;
      
      case "Immunology":
        insights = {
          common_endpoints: [
            "Disease activity scores",
            "Response rates",
            "Remission rates",
            "Patient-reported outcomes"
          ],
          common_inclusion_criteria: [
            "Active autoimmune disease",
            "Inadequate response to standard therapy",
            "Minimum disease activity score",
            "Biomarker presence"
          ],
          common_exclusion_criteria: [
            "Active infection",
            "Live vaccines (recent)",
            "Multiple autoimmune conditions",
            "Immunocompromised state"
          ],
          typical_challenges: [
            "Disease flare variability",
            "Concomitant medication management",
            "Infection risk assessment",
            "Biomarker validation"
          ],
          success_factors: [
            "Clear disease activity measures",
            "Patient stratification",
            "Treat-to-target approach",
            "Comprehensive safety monitoring"
          ]
        };
        break;
      
      case "Infectious Disease":
        insights = {
          common_endpoints: [
            "Viral/bacterial load reduction",
            "Clinical cure rate",
            "Time to symptom resolution",
            "Relapse rate"
          ],
          common_inclusion_criteria: [
            "Confirmed pathogen infection",
            "Specific symptom presentation",
            "Duration of infection",
            "Treatment-naïve status"
          ],
          common_exclusion_criteria: [
            "Antimicrobial resistance",
            "Polymicrobial infections",
            "Severe immunodeficiency",
            "Organ dysfunction"
          ],
          typical_challenges: [
            "Emerging resistance",
            "Standard of care evolution",
            "Seasonal variation",
            "Diagnostic accuracy"
          ],
          success_factors: [
            "Rapid diagnostic integration",
            "Appropriate comparator selection",
            "Stratification by severity",
            "Clear microbiological endpoints"
          ]
        };
        break;
      
      case "Respiratory":
        insights = {
          common_endpoints: [
            "Forced expiratory volume (FEV1)",
            "Exacerbation rate",
            "Symptom scores",
            "Quality of life measures"
          ],
          common_inclusion_criteria: [
            "Diagnosed respiratory condition",
            "Specific lung function parameters",
            "Symptom frequency/severity",
            "Prior exacerbation history"
          ],
          common_exclusion_criteria: [
            "Recent respiratory infection",
            "Smoking status (condition dependent)",
            "Oxygen dependence",
            "Other pulmonary conditions"
          ],
          typical_challenges: [
            "Seasonal variability",
            "Inhaler technique standardization",
            "Comorbidity management",
            "Adherence assessment"
          ],
          success_factors: [
            "Standardized spirometry",
            "ePRO symptom tracking",
            "Exacerbation definition clarity",
            "Centralized reading"
          ]
        };
        break;
    }
    
    return insights;
  }
}

// Create and export a singleton instance
export const trialPredictorService = new TrialPredictorService();