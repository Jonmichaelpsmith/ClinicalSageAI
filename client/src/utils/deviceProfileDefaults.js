/**
 * Device Profile Defaults and Utilities
 * 
 * This file provides standardized utilities for device profile creation and structure definition,
 * ensuring consistency whenever a device profile is created or updated.
 */

/**
 * Returns the default document structure for a device profile
 * @returns {Object} Default structure object
 */
export const getDefaultDeviceProfileStructure = () => ({
  documentType: '510k',
  sections: ['device-info', 'predicates', 'compliance'], // Define standard sections
  version: '1.0'
});

/**
 * Creates a new device profile with all required fields and structure
 * @param {Object} initialProps Optional initial properties to override defaults
 * @returns {Object} Complete device profile object with proper structure
 */
export const createNewDeviceProfile = (initialProps = {}) => {
  const now = new Date().toISOString();
  return {
    id: initialProps.id || `device-${Date.now()}`,
    deviceName: initialProps.deviceName || 'Sample Medical Device',
    manufacturer: initialProps.manufacturer || 'Sample Manufacturer',
    productCode: initialProps.productCode || 'ABC',
    deviceClass: initialProps.deviceClass || 'II',
    intendedUse: initialProps.intendedUse || 'For diagnostic use in clinical settings',
    description: initialProps.description || 'A medical device designed for diagnostic procedures',
    technicalSpecifications: initialProps.technicalSpecifications || 'Meets ISO 13485 standards',
    regulatoryClass: initialProps.regulatoryClass || 'Class II',
    status: initialProps.status || 'active',
    structure: initialProps.structure || getDefaultDeviceProfileStructure(),
    metadata: {
      createdAt: initialProps.metadata?.createdAt || now,
      lastUpdated: now
    },
    // Spread initialProps last to allow overriding any default, including nested ones if done carefully
    ...initialProps
  };
};

/**
 * Ensures a device profile has all required fields and structure
 * Useful for migrating or validating existing profiles
 * @param {Object} profile Device profile to validate and complete
 * @returns {Object} Validated and completed device profile
 */
export const ensureCompleteDeviceProfile = (profile) => {
  if (!profile) return createNewDeviceProfile();
  
  const now = new Date().toISOString();
  let profileToUse = { ...profile }; // Create a mutable copy

  // Migration & Validation for profile:
  if (!profileToUse.id) {
    profileToUse.id = `device-${Date.now()}`;
  }
  
  if (!profileToUse.structure || typeof profileToUse.structure.documentType === 'undefined') {
    console.log('Migrating device profile: adding/updating structure.');
    profileToUse.structure = { ...getDefaultDeviceProfileStructure(), ...(profileToUse.structure || {}) };
  }
  
  if (!profileToUse.metadata || typeof profileToUse.metadata.createdAt === 'undefined') {
    console.log('Migrating device profile: adding/updating metadata.');
    profileToUse.metadata = { 
      createdAt: now, 
      lastUpdated: now, 
      ...(profileToUse.metadata || {}) 
    };
  }
  
  if (!profileToUse.status) {
    profileToUse.status = 'active';
  }
  
  // Ensure all default fields from createNewDeviceProfile are present if missing
  profileToUse = { ...createNewDeviceProfile(), ...profileToUse };
  
  return profileToUse;
};