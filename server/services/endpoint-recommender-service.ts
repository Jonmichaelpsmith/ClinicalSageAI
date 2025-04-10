import fs from 'fs';
import path from 'path';

// Types
export interface Endpoint {
  name: string;
  description: string;
  frequency: number;
  successRate?: number;
  phaseDistribution?: Record<string, number>;
  reference?: string;
}

export interface SimilarTrial {
  id: string;
  title: string;
  phase: string;
  endpoints: string[];
  indication?: string;
  year?: number;
}

export interface EndpointRecommendation {
  endpoints: Endpoint[];
  rationale: string;
  similarTrials: SimilarTrial[];
  query: {
    indication: string;
    phase: string;
    therapeuticArea?: string;
  };
  totalTrialsAnalyzed: number;
}

export interface EndpointSearchParams {
  indication: string;
  phase: string;
  therapeuticArea?: string;
}

// Endpoint descriptions
const endpointDescriptions: Record<string, string> = {
  'Overall Survival (OS)': 'Time from randomization until death from any cause. The gold standard efficacy measure in oncology.',
  'Progression-Free Survival (PFS)': 'Time from randomization until objective tumor progression or death from any cause.',
  'Disease-Free Survival (DFS)': 'Time from randomization until recurrence of tumor or death from any cause.',
  'Objective Response Rate (ORR)': 'Proportion of patients with tumor size reduction of a predefined amount and for a minimum time period.',
  'Duration of Response (DOR)': 'Time from documentation of tumor response to disease progression or death.',
  'HbA1c Change from Baseline': 'Change in glycated hemoglobin levels, measuring long-term blood glucose control.',
  'Fasting Plasma Glucose': 'Measurement of blood glucose after an overnight fast, indicating baseline glucose control.',
  'Body Weight Change': 'Change in body weight from baseline, important for therapies that may impact weight.',
  'Hypoglycemic Events': 'Frequency of low blood glucose events, a key safety endpoint in diabetes trials.',
  'MACE': 'Major Adverse Cardiovascular Events, a composite endpoint for cardiovascular outcomes.',
  'Blood Pressure Change': 'Change in systolic and/or diastolic blood pressure from baseline.',
  'Joint Pain Score': 'Patient-reported measure of joint pain severity, often using validated scales.',
  'ACR20/50/70': 'American College of Rheumatology response criteria measuring % improvement in rheumatoid arthritis symptoms.',
  'EDSS Score Change': 'Change in Expanded Disability Status Scale, measuring disability progression in multiple sclerosis.',
  'Relapse Rate': 'Number of confirmed relapses per patient-year.',
  'HAM-D Score': 'Hamilton Depression Rating Scale score, measuring depression severity.',
  'FEV1 Change': 'Change in Forced Expiratory Volume in 1 second, measuring lung function.'
};

// Map indications to likely endpoints
const indicationToEndpoints: Record<string, string[]> = {
  'Non-Small Cell Lung Cancer': [
    'Overall Survival (OS)',
    'Progression-Free Survival (PFS)',
    'Objective Response Rate (ORR)',
    'Duration of Response (DOR)',
    'Disease-Free Survival (DFS)'
  ],
  'Type 2 Diabetes': [
    'HbA1c Change from Baseline',
    'Fasting Plasma Glucose',
    'Body Weight Change',
    'Hypoglycemic Events'
  ],
  'Heart Failure': [
    'MACE',
    'Hospitalization Rate',
    'Blood Pressure Change',
    'Exercise Capacity'
  ],
  'Rheumatoid Arthritis': [
    'ACR20/50/70',
    'Joint Pain Score',
    'Disease Activity Score',
    'Physical Function'
  ],
  'Multiple Sclerosis': [
    'EDSS Score Change',
    'Relapse Rate',
    'New MRI Lesions',
    'Brain Volume Loss'
  ],
  'Major Depressive Disorder': [
    'HAM-D Score',
    'Response Rate',
    'Remission Rate',
    'Relapse Rate'
  ]
};

// Generate recommendations based on indication and phase
export async function getEndpointRecommendations(
  params: EndpointSearchParams
): Promise<EndpointRecommendation> {
  const { indication, phase, therapeuticArea } = params;
  
  // In a real implementation, this would query a database of clinical trials
  // For demo purposes, we'll create synthetic recommendations
  
  // Get relevant endpoints for the indication
  const relevantEndpoints = indicationToEndpoints[indication] || [];
  
  // Generate endpoints with frequency, success rate, and phase distribution
  const endpoints = relevantEndpoints.map((name, index) => {
    // Simulate different frequencies and success rates based on position
    const frequency = 90 - (index * 10);
    const successRate = 80 - (index * 5);
    
    // Phase distribution favors the selected phase
    const phaseDistribution: Record<string, number> = {
      'Phase 1': 15,
      'Phase 2': 25,
      'Phase 3': 40,
      'Phase 4': 20
    };
    
    // Adjust distribution to favor the selected phase
    const phaseIndex = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'].indexOf(phase);
    if (phaseIndex >= 0) {
      // Increase the selected phase by 20% and reduce others proportionally
      const boost = 20;
      const reduction = boost / 3;
      
      phaseDistribution[phase] += boost;
      Object.keys(phaseDistribution).forEach(p => {
        if (p !== phase) {
          phaseDistribution[p] = Math.max(5, phaseDistribution[p] - reduction);
        }
      });
    }
    
    return {
      name,
      description: endpointDescriptions[name] || 'No description available',
      frequency,
      successRate,
      phaseDistribution,
      reference: `NCT${Math.floor(10000000 + Math.random() * 90000000)}`
    };
  });
  
  // Generate similar trials with endpoints
  const similarTrials: SimilarTrial[] = [];
  for (let i = 0; i < 3; i++) {
    const trialEndpoints = relevantEndpoints.slice(0, Math.floor(Math.random() * 3) + 2);
    similarTrials.push({
      id: `NCT${Math.floor(10000000 + Math.random() * 90000000)}`,
      title: `${therapeuticArea || ''} Study for ${indication} - ${Math.random().toString(36).substring(7)}`,
      phase,
      endpoints: trialEndpoints,
      year: 2020 + Math.floor(Math.random() * 5)
    });
  }
  
  // Generate rationale based on indication and phase
  const totalTrials = Math.floor(Math.random() * 50) + 50;
  const rationale = `Based on analysis of ${totalTrials} similar trials for ${indication}, ${endpoints[0]?.name} is the most commonly used primary endpoint (${endpoints[0]?.frequency}%) with high regulatory success rates. For ${phase} studies, ${endpoints[1]?.name} is also frequently used. The most successful trials typically include a combination of ${endpoints[0]?.name} and ${endpoints[1]?.name} endpoints to comprehensively assess efficacy.`;
  
  return {
    endpoints,
    rationale,
    similarTrials,
    query: {
      indication,
      phase,
      therapeuticArea
    },
    totalTrialsAnalyzed: totalTrials
  };
}