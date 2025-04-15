/**
 * Therapeutic Area Classifier
 * 
 * A comprehensive, centralized classification utility for accurately identifying 
 * therapeutic areas across all platform services.
 * 
 * Features:
 * - Hierarchical keyword matching with weighted scoring
 * - Extensive dictionary of therapeutic area definitions
 * - Validation and error handling
 * - Detailed logging for audit trail
 * - Confidence scoring for transparency
 */

export interface TherapeuticAreaMatch {
  area: string;
  confidence: number;
  matchedKeywords: string[];
}

interface TherapeuticAreaDefinition {
  name: string;
  primaryKeywords: string[];
  secondaryKeywords: string[];
  inclusionPatterns?: RegExp[];
  exclusionPatterns?: RegExp[];
}

/**
 * Therapeutic area definitions with keywords ordered by specificity
 * Primary keywords are high-precision matches
 * Secondary keywords provide supporting evidence but may be less specific
 */
const therapeuticAreaDefinitions: TherapeuticAreaDefinition[] = [
  {
    name: "Obesity",
    primaryKeywords: [
      "obesity", "overweight", "weight loss", "weight management", 
      "bmi reduction", "body mass index", "bariatric", "anti-obesity"
    ],
    secondaryKeywords: [
      "weight", "bmi", "adipose", "metabolic syndrome", "waist circumference", 
      "body composition", "caloric restriction", "diet-induced"
    ],
    exclusionPatterns: [
      /cancer.{0,30}weight loss/i,
      /weight loss.{0,30}cancer/i
    ]
  },
  {
    name: "Diabetes",
    primaryKeywords: [
      "diabetes", "type 1 diabetes", "type 2 diabetes", "t1d", "t2d", 
      "diabetic", "antidiabetic", "glycemic control", "insulin resistance"
    ],
    secondaryKeywords: [
      "glucose", "insulin", "hba1c", "glycated hemoglobin", "hypoglycemia",
      "hyperglycemia", "islet cells", "sulfonylurea", "dpp-4", "sglt2"
    ]
  },
  {
    name: "Oncology",
    primaryKeywords: [
      "cancer", "oncology", "carcinoma", "tumor", "neoplasm", "malignancy",
      "sarcoma", "lymphoma", "leukemia", "melanoma", "myeloma", "metastatic", 
      "metastasis", "oncogenic"
    ],
    secondaryKeywords: [
      "chemotherapy", "radiation therapy", "immunotherapy", "antineoplastic",
      "solid tumor", "checkpoint inhibitor", "anti-pd1", "anti-pd-l1", "car-t",
      "tyrosine kinase inhibitor", "tki", "biopsy", "resection",
      "antiproliferative", "cytotoxic"
    ]
  },
  {
    name: "Cardiovascular",
    primaryKeywords: [
      "cardiovascular disease", "heart failure", "myocardial infarction",
      "stroke", "hypertension", "coronary artery disease", "arrhythmia",
      "atrial fibrillation", "hyperlipidemia", "atherosclerosis"
    ],
    secondaryKeywords: [
      "blood pressure", "cholesterol", "ldl", "hdl", "triglycerides", "statin",
      "anticoagulant", "antiplatelet", "ace inhibitor", "beta blocker",
      "angiotensin", "vasodilator", "cardiac", "heart", "thrombosis",
      "endothelial", "vascular"
    ]
  },
  {
    name: "Neurology",
    primaryKeywords: [
      "alzheimer's disease", "parkinson's disease", "multiple sclerosis",
      "epilepsy", "amyotrophic lateral sclerosis", "als", "huntington's disease",
      "migraine", "stroke", "neuropathy", "neurological", "neurodegenerative"
    ],
    secondaryKeywords: [
      "cognitive", "dementia", "seizure", "neurotransmitter", "neuropathic",
      "cerebrospinal", "tremor", "motor function", "brain", "neuron", 
      "central nervous system", "cns", "neuritis", "myelin", "neurodegeneration"
    ]
  },
  {
    name: "Psychiatry",
    primaryKeywords: [
      "depression", "anxiety disorder", "bipolar disorder", "schizophrenia",
      "post-traumatic stress disorder", "ptsd", "obsessive-compulsive disorder",
      "ocd", "adhd", "attention deficit", "psychiatric", "mental health"
    ],
    secondaryKeywords: [
      "antidepressant", "antipsychotic", "anxiolytic", "mood disorder",
      "psychosis", "psychotic", "ssri", "snri", "major depressive disorder",
      "mdd", "psychological", "cognitive behavioral therapy", "cbt"
    ]
  },
  {
    name: "Immunology",
    primaryKeywords: [
      "rheumatoid arthritis", "psoriasis", "inflammatory bowel disease",
      "crohn's disease", "ulcerative colitis", "lupus", "sle",
      "multiple sclerosis", "transplant rejection", "autoimmune"
    ],
    secondaryKeywords: [
      "tnf inhibitor", "immunosuppressant", "dmard", "jak inhibitor",
      "interleukin", "il-17", "il-23", "monoclonal antibody", "mab",
      "inflammation", "inflammatory", "immune system", "cytokine"
    ]
  },
  {
    name: "Infectious Disease",
    primaryKeywords: [
      "infection", "bacterial infection", "viral infection", "hiv", "aids",
      "hepatitis", "tuberculosis", "malaria", "antimicrobial", "antibiotic",
      "antiviral", "antifungal", "antiparasitic", "vaccine"
    ],
    secondaryKeywords: [
      "pathogen", "bacteria", "virus", "fungal", "parasite", "microbial",
      "resistance", "antibiotic resistance", "broad-spectrum", "prophylaxis",
      "anti-infective", "immunization", "pandemic", "epidemic"
    ]
  },
  {
    name: "Respiratory",
    primaryKeywords: [
      "asthma", "chronic obstructive pulmonary disease", "copd", "cystic fibrosis",
      "pulmonary fibrosis", "pulmonary hypertension", "respiratory", "pulmonary"
    ],
    secondaryKeywords: [
      "bronchodilator", "inhaled corticosteroid", "ics", "long-acting beta agonist",
      "laba", "lung", "bronchial", "airway", "breathing", "ventilation",
      "spirometry", "fev1", "oxygen saturation"
    ]
  },
  {
    name: "Gastroenterology",
    primaryKeywords: [
      "inflammatory bowel disease", "ibd", "crohn's disease", "ulcerative colitis",
      "irritable bowel syndrome", "ibs", "gastroesophageal reflux disease", "gerd",
      "peptic ulcer", "cirrhosis", "hepatitis", "pancreatitis", "gastrointestinal"
    ],
    secondaryKeywords: [
      "liver", "hepatic", "stomach", "intestinal", "digestive", "bowel",
      "esophageal", "acid reflux", "gastric", "bile", "gallbladder",
      "constipation", "diarrhea", "microbiome", "gut flora"
    ]
  }
];

/**
 * Analyzes text to identify the therapeutic area with highest confidence
 * 
 * @param textContent The text to analyze
 * @param options Optional configuration parameters
 * @returns The most likely therapeutic area match with confidence score
 */
export function classifyTherapeuticArea(
  textContent: string,
  options: { 
    confidenceThreshold?: number,
    enableLogging?: boolean,
    allowUnknown?: boolean 
  } = {}
): TherapeuticAreaMatch {
  if (!textContent || typeof textContent !== 'string') {
    throw new Error('Text content is required for therapeutic area classification');
  }

  const confidenceThreshold = options.confidenceThreshold || 0.5;
  const enableLogging = options.enableLogging || false;
  const allowUnknown = options.allowUnknown !== undefined ? options.allowUnknown : true;

  // Normalize text for consistent matching
  const normalizedText = textContent.toLowerCase();
  
  // Initialize results tracking
  let bestMatch: TherapeuticAreaMatch = {
    area: "Unknown",
    confidence: 0,
    matchedKeywords: []
  };

  // Log classification start if enabled
  if (enableLogging) {
    console.log(`[Therapeutic Area Classifier] Analyzing text (${textContent.length} chars)`);
  }

  // Evaluate each therapeutic area definition
  for (const definition of therapeuticAreaDefinitions) {
    // Check exclusion patterns first
    if (definition.exclusionPatterns) {
      const exclusionMatched = definition.exclusionPatterns.some(pattern => 
        pattern.test(normalizedText)
      );
      
      if (exclusionMatched) {
        if (enableLogging) {
          console.log(`[Therapeutic Area Classifier] Exclusion pattern matched for ${definition.name}, skipping`);
        }
        continue;
      }
    }

    // Enhanced pattern matching - look for keyword boundaries using regex instead of just includes()
    // This improves precision by avoiding partial word matches
    const primaryMatches = definition.primaryKeywords.filter(keyword => {
      const pattern = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i');
      return pattern.test(normalizedText);
    });
    
    // Check for secondary keyword matches (supporting evidence)
    const secondaryMatches = definition.secondaryKeywords.filter(keyword => {
      const pattern = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i');
      return pattern.test(normalizedText);
    });

    // Calculate confidence score with improved weighting
    // Primary keywords are weighted even more heavily to prioritize precise matches
    const totalKeywords = definition.primaryKeywords.length + definition.secondaryKeywords.length;
    const weightedMatches = (primaryMatches.length * 4) + secondaryMatches.length;
    const confidence = weightedMatches / (totalKeywords * 1.5);
    
    // Boost confidence for multiple primary matches (strong signal)
    const primaryMatchBonus = primaryMatches.length >= 2 ? 0.2 : 0;
    
    // Additional pattern-based matching if provided
    let patternBonus = 0;
    if (definition.inclusionPatterns) {
      const patternMatches = definition.inclusionPatterns.filter(pattern => 
        pattern.test(normalizedText)
      );
      patternBonus = patternMatches.length * 0.2; // Each pattern match adds a bonus
    }

    const finalConfidence = Math.min(0.99, confidence + patternBonus + primaryMatchBonus);
    
    // Track all matched keywords for explanation
    const allMatches = [...primaryMatches, ...secondaryMatches];
    
    if (enableLogging) {
      console.log(`[Therapeutic Area Classifier] ${definition.name}: ${finalConfidence.toFixed(2)} confidence (${primaryMatches.length} primary, ${secondaryMatches.length} secondary)`);
    }

    // Update best match if this is more confident
    if (finalConfidence > bestMatch.confidence && allMatches.length > 0) {
      bestMatch = {
        area: definition.name,
        confidence: finalConfidence,
        matchedKeywords: allMatches
      };
    }
  }

  // Only return matches above threshold confidence unless allowUnknown is false
  if (bestMatch.confidence < confidenceThreshold && allowUnknown) {
    bestMatch.area = "Unknown";
    bestMatch.confidence = 0;
    bestMatch.matchedKeywords = [];
  }

  if (enableLogging) {
    console.log(`[Therapeutic Area Classifier] Final classification: ${bestMatch.area} (${bestMatch.confidence.toFixed(2)} confidence)`);
    if (bestMatch.matchedKeywords.length > 0) {
      console.log(`[Therapeutic Area Classifier] Matched keywords: ${bestMatch.matchedKeywords.join(", ")}`);
    }
  }

  return bestMatch;
}

/**
 * Provides a simple interface for getting just the therapeutic area name
 * 
 * @param textContent The text to analyze
 * @returns The most likely therapeutic area name
 */
export function getTherapeuticArea(textContent: string): string {
  try {
    const result = classifyTherapeuticArea(textContent);
    return result.area;
  } catch (error) {
    console.error('[Therapeutic Area Classifier] Error:', error);
    return "Unknown";
  }
}