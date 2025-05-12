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