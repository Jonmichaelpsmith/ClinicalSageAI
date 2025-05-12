/**
 * Feature Flags Configuration for TrialSage
 * 
 * This module provides a centralized way to control feature availability
 * across different environments and for different organizations.
 */

export type FeatureFlag = {
  id: string;
  name: string;
  description: string;
  defaultValue: boolean;
  overrides?: Record<string, boolean>; // Overrides by organization ID
};

const featureFlags: Record<string, FeatureFlag> = {
  // 510(k) Automation Feature Flags
  'fda510k.enabled': {
    id: 'fda510k.enabled',
    name: 'FDA 510(k) Automation',
    description: 'Enable FDA 510(k) automation features in the Medical Device and Diagnostics module',
    defaultValue: true,
  },
  'fda510k.deviceProfile': {
    id: 'fda510k.deviceProfile',
    name: 'Device Profile Management',
    description: 'Enable device profile creation and management for 510(k) submissions',
    defaultValue: true,
  },
  'fda510k.predicateFinder': {
    id: 'fda510k.predicateFinder',
    name: 'Predicate Device Finder',
    description: 'Enable AI-powered predicate device search functionality',
    defaultValue: true,
  },
  'fda510k.literatureSearch': {
    id: 'fda510k.literatureSearch',
    name: 'Literature Search',
    description: 'Enable AI-powered literature search for 510(k) submissions',
    defaultValue: true,
  },
  'fda510k.pathwayAdvisor': {
    id: 'fda510k.pathwayAdvisor',
    name: 'Regulatory Pathway Advisor',
    description: 'Enable AI-powered regulatory pathway analysis',
    defaultValue: true,
  },
  'fda510k.aiDrafting': {
    id: 'fda510k.aiDrafting',
    name: 'AI-Powered Section Drafting',
    description: 'Enable AI-powered drafting of 510(k) submission sections',
    defaultValue: true,
  },
  'fda510k.compliance': {
    id: 'fda510k.compliance',
    name: 'Compliance Rules Integration',
    description: 'Enable compliance checking against FDA rules',
    defaultValue: true,
  },
  'fda510k.predicateAnalysis': {
    id: 'fda510k.predicateAnalysis',
    name: 'Predicate Device Equivalence Analysis',
    description: 'Enable predicate device identification and substantial equivalence analysis',
    defaultValue: true,
  },
  'documentRecommender': {
    id: 'documentRecommender',
    name: 'Intelligent Document Section Recommender',
    description: 'Enable AI-powered document section recommendations and content suggestions',
    defaultValue: true,
  },
  
  // MAUD Integration Feature Flags
  'maud.enabled': {
    id: 'maud.enabled',
    name: 'MAUD Integration',
    description: 'Enable integration with FDA MAUD database',
    defaultValue: true,
  },
  'maud.validation': {
    id: 'maud.validation',
    name: 'MAUD Validation',
    description: 'Enable MAUD validation for device and documentation safety',
    defaultValue: true,
  },
  'maud.reporting': {
    id: 'maud.reporting',
    name: 'MAUD Reporting',
    description: 'Enable detailed reports from MAUD database analysis',
    defaultValue: true,
  },
  
  // General Feature Flags
  'cer.aiEnhancedValidation': {
    id: 'cer.aiEnhancedValidation',
    name: 'AI-Enhanced Document Validation',
    description: 'Enable AI-powered validation of clinical evaluation reports',
    defaultValue: true,
  },
  'unified.search': {
    id: 'unified.search',
    name: 'Unified Search Experience',
    description: 'Enable unified search across all document types',
    defaultValue: true,
  },
  'multiTenant.isolation': {
    id: 'multiTenant.isolation',
    name: 'Multi-Tenant Data Isolation',
    description: 'Ensure strict data isolation between different tenants',
    defaultValue: true,
  }
};

/**
 * Get the value of a feature flag
 * 
 * @param flagId The ID of the feature flag
 * @param organizationId Optional organization ID for overrides
 * @returns Boolean indicating if the feature is enabled
 */
export function isFeatureEnabled(flagId: string, organizationId?: string | null): boolean {
  const flag = featureFlags[flagId];
  
  if (!flag) {
    console.warn(`Feature flag '${flagId}' not found, defaulting to false`);
    return false;
  }
  
  // Check for organization-specific override
  if (organizationId && flag.overrides && flag.overrides[organizationId] !== undefined) {
    return flag.overrides[organizationId];
  }
  
  return flag.defaultValue;
}

/**
 * Get a list of all feature flags
 * 
 * @returns Array of all feature flags
 */
export function getAllFeatureFlags(): FeatureFlag[] {
  return Object.values(featureFlags);
}

/**
 * Set organization-specific overrides for a feature flag
 * 
 * @param flagId The ID of the feature flag
 * @param organizationId The organization ID
 * @param value The override value
 */
export function setFeatureOverride(flagId: string, organizationId: string, value: boolean): void {
  const flag = featureFlags[flagId];
  
  if (!flag) {
    console.warn(`Feature flag '${flagId}' not found, override not set`);
    return;
  }
  
  if (!flag.overrides) {
    flag.overrides = {};
  }
  
  flag.overrides[organizationId] = value;
}

/**
 * Get a set of related feature flags by prefix
 * 
 * @param prefix The prefix to filter flags by (e.g., 'fda510k.')
 * @returns Record of feature flags with the specified prefix
 */
export function getFeatureFlagsByPrefix(prefix: string): Record<string, FeatureFlag> {
  return Object.entries(featureFlags)
    .filter(([key]) => key.startsWith(prefix))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, FeatureFlag>);
}

export default {
  isFeatureEnabled,
  getAllFeatureFlags,
  setFeatureOverride,
  getFeatureFlagsByPrefix
};