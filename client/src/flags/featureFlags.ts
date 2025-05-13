/**
 * Feature Flags System
 * 
 * This module defines the available feature flags for controlling feature visibility 
 * throughout the application. Feature flags enable us to build features in isolation
 * and control their rollout independently.
 */

// Define feature flag types
export type FeatureFlag = {
  id: string;
  name: string;
  description: string;
  defaultValue: boolean;
  enabled: boolean;
};

// Define all available feature flags
export const featureFlags: Record<string, FeatureFlag> = {
  // 510k module flags
  ENABLE_510K_MODULE: {
    id: 'ENABLE_510K_MODULE',
    name: '510(k) Module',
    description: 'Enables the 510(k) submission module in the application',
    defaultValue: true,
    enabled: true
  },
  ENABLE_PREDICATE_SEARCH: {
    id: 'ENABLE_PREDICATE_SEARCH',
    name: 'Predicate Device Search',
    description: 'Enables the predicate device search functionality in the 510(k) module',
    defaultValue: true,
    enabled: true
  },
  ENABLE_EQUIVALENCE_ANALYSIS: {
    id: 'ENABLE_EQUIVALENCE_ANALYSIS',
    name: 'Equivalence Analysis',
    description: 'Enables the substantial equivalence analysis tools in the 510(k) module',
    defaultValue: true,
    enabled: true
  },
  ENABLE_LITERATURE_DISCOVERY: {
    id: 'ENABLE_LITERATURE_DISCOVERY',
    name: 'Enhanced Literature Discovery',
    description: 'Enables semantic literature search, citation management, and AI-powered summaries',
    defaultValue: true,
    enabled: true
  },
  ENABLE_PATHWAY_ADVISOR: {
    id: 'ENABLE_PATHWAY_ADVISOR',
    name: 'Regulatory Pathway Advisor',
    description: 'Enables AI-powered regulatory pathway recommendations and requirement analysis',
    defaultValue: true,
    enabled: true
  },
  ENABLE_EQUIVALENCE_DRAFTING: {
    id: 'ENABLE_EQUIVALENCE_DRAFTING',
    name: 'Substantial Equivalence Drafting',
    description: 'Enables AI-powered substantial equivalence statement drafting',
    defaultValue: true,
    enabled: true
  },
  ENABLE_COMPLIANCE_CHECKER: {
    id: 'ENABLE_COMPLIANCE_CHECKER',
    name: 'Pre-Submission Compliance Checker',
    description: 'Enables automated pre-submission quality checks to verify compliance with FDA regulations',
    defaultValue: true,
    enabled: true
  },
  ENABLE_PACKAGE_ASSEMBLY: {
    id: 'ENABLE_PACKAGE_ASSEMBLY',
    name: 'eSTAR Package Assembly',
    description: 'Enables AI-powered eSTAR package assembly, validation, and submission capabilities',
    defaultValue: true,
    enabled: true
  },
  ENABLE_SECTION_RECOMMENDER: {
    id: 'ENABLE_SECTION_RECOMMENDER',
    name: 'Document Section Recommender',
    description: 'Enables intelligent section recommendations for regulatory documents',
    defaultValue: true,
    enabled: true
  },
  
  // CER module flags
  ENABLE_CER_MODULE: {
    id: 'ENABLE_CER_MODULE',
    name: 'CER Module',
    description: 'Enables the Clinical Evaluation Report module in the application',
    defaultValue: true,
    enabled: true
  },
  
  // MAUD validation flags
  ENABLE_MAUD_VALIDATION: {
    id: 'ENABLE_MAUD_VALIDATION',
    name: 'MAUD Validation',
    description: 'Enables MAUD validation tools and compliance checks',
    defaultValue: true,
    enabled: true
  },
  
  // Advanced AI features
  ENABLE_AI_GENERATION: {
    id: 'ENABLE_AI_GENERATION',
    name: 'AI Content Generation',
    description: 'Enables AI-powered content generation for regulatory documents',
    defaultValue: true,
    enabled: true
  },
  ENABLE_SEMANTIC_SEARCH: {
    id: 'ENABLE_SEMANTIC_SEARCH',
    name: 'Semantic Search',
    description: 'Enables semantic search capabilities across regulatory documents',
    defaultValue: true,
    enabled: true
  },
  ENABLE_COMPARISONS: {
    id: 'ENABLE_COMPARISONS',
    name: 'Detailed Comparisons',
    description: 'Enables detailed side-by-side comparison between device profiles and predicate devices',
    defaultValue: true,
    enabled: true
  },
  ENABLE_SAVED_REFERENCES: {
    id: 'ENABLE_SAVED_REFERENCES',
    name: 'Saved References',
    description: 'Enables saving and management of literature references',
    defaultValue: true,
    enabled: true
  },
  ENABLE_CITATION_FORMATS: {
    id: 'ENABLE_CITATION_FORMATS',
    name: 'Citation Formats',
    description: 'Enables multiple citation format options for references',
    defaultValue: true,
    enabled: true
  },
  ENABLE_NLP_SUMMARIZATION: {
    id: 'ENABLE_NLP_SUMMARIZATION',
    name: 'NLP Summarization',
    description: 'Enables AI-powered summarization of literature and abstracts',
    defaultValue: true,
    enabled: true
  },
  ENABLE_CUSTOM_RELEVANCE: {
    id: 'ENABLE_CUSTOM_RELEVANCE',
    name: 'Custom Relevance Criteria',
    description: 'Enables customization of relevance criteria for predicate device matching',
    defaultValue: true,
    enabled: true
  },
  
  // Onboarding and assistance
  ENABLE_ONBOARDING_TOUR: {
    id: 'ENABLE_ONBOARDING_TOUR',
    name: 'Guided Tour',
    description: 'Enables guided tour for new users of the 510(k) module',
    defaultValue: true,
    enabled: true
  },
  ENABLE_ONBOARDING_CHATBOT: {
    id: 'ENABLE_ONBOARDING_CHATBOT',
    name: 'Assistant Chatbot',
    description: 'Enables AI-powered regulatory assistant chatbot for in-app guidance',
    defaultValue: true,
    enabled: true
  },
  
  // Device profile management
  ENABLE_DEVICE_PROFILE: {
    id: 'ENABLE_DEVICE_PROFILE',
    name: 'Device Profile Manager',
    description: 'Enables device profile intake and management for 510(k) submissions',
    defaultValue: true,
    enabled: true
  }
};

/**
 * Check if a feature flag is enabled
 * @param flagId The ID of the feature flag to check
 * @returns true if the feature flag is enabled, false otherwise
 */
export function isFeatureEnabled(flagId: string): boolean {
  const flag = featureFlags[flagId];
  
  if (!flag) {
    console.warn(`Feature flag "${flagId}" does not exist`);
    return false;
  }
  
  return flag.enabled;
}

/**
 * Set the enabled state of a feature flag
 * @param flagId The ID of the feature flag to update
 * @param enabled The new enabled state
 */
export function setFeatureEnabled(flagId: string, enabled: boolean): void {
  const flag = featureFlags[flagId];
  
  if (!flag) {
    console.warn(`Feature flag "${flagId}" does not exist`);
    return;
  }
  
  flag.enabled = enabled;
}

/**
 * Reset all feature flags to their default values
 */
export function resetFeatureFlags(): void {
  Object.keys(featureFlags).forEach(flagId => {
    featureFlags[flagId].enabled = featureFlags[flagId].defaultValue;
  });
}

/**
 * Get all feature flags
 * @returns Array of all feature flags
 */
export function getAllFeatureFlags(): FeatureFlag[] {
  return Object.values(featureFlags);
}