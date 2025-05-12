/**
 * Feature Flags
 * 
 * This module contains feature flags for gating new functionality.
 * These flags control visibility of new features in the UI.
 */

// Feature flag for 510(k) Automation
export const FEATURE_510K = process.env.REACT_APP_ENABLE_510K === 'true' || true; // Default to true for development

// Feature flag for PubMed integration
export const FEATURE_PUBMED_INTEGRATION = process.env.REACT_APP_ENABLE_PUBMED === 'true' || true; // Default to true for development

// Feature flag for eSTAR Package Builder
export const FEATURE_ESTAR_BUILDER = process.env.REACT_APP_ENABLE_ESTAR === 'true' || true; // Default to true for development

// Feature flag for FDA Submission Tracking
export const FEATURE_FDA_TRACKING = process.env.REACT_APP_ENABLE_FDA_TRACKING === 'true' || false; // Default to false as it requires FDA API key

/**
 * Check if a feature is enabled for a given organization
 * @param featureKey The feature flag key to check
 * @param organizationId Optional organization ID for tenant-specific flags
 * @returns Whether the feature is enabled
 */
export function isFeatureEnabled(featureKey: string, organizationId?: string): boolean {
  // For now just return the global setting, but in the future could implement
  // organization-specific overrides based on entitlements
  return (
    featureKey === 'FEATURE_510K' ? FEATURE_510K :
    featureKey === 'FEATURE_PUBMED_INTEGRATION' ? FEATURE_PUBMED_INTEGRATION :
    featureKey === 'FEATURE_ESTAR_BUILDER' ? FEATURE_ESTAR_BUILDER :
    featureKey === 'FEATURE_FDA_TRACKING' ? FEATURE_FDA_TRACKING :
    false
  );
}