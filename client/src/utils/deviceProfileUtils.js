/**
 * Returns the default structure for a device profile.
 */
export const getDefaultDeviceProfileStructure = () => ({
  documentType: '510k',
  sections: ['device-info', 'predicates', 'compliance'],
  version: '1.0'
});

/**
 * Returns default metadata for a new device profile.
 */
export const getDefaultDeviceProfileMetadata = () => {
  const now = new Date().toISOString();
  return {
    createdAt: now,
    lastUpdated: now,
  };
};

/**
 * Creates a new, complete device profile object.
 * @param {Object} initialProps - Optional initial properties to override defaults.
 * @returns {Object} A new device profile object.
 */
export const createNewDeviceProfile = (initialProps = {}) => {
  const defaultStructure = getDefaultDeviceProfileStructure();
  const defaultMetadata = getDefaultDeviceProfileMetadata();

  const baseProfile = {
    id: `device-${Date.now()}`,
    deviceName: 'Sample Medical Device',
    manufacturer: 'Sample Manufacturer',
    productCode: 'ABC',
    deviceClass: 'II',
    intendedUse: 'For diagnostic use in clinical settings',
    description: 'A medical device designed for diagnostic procedures',
    technicalSpecifications: 'Meets ISO 13485 standards',
    regulatoryClass: 'Class II',
    status: 'active',
    // Ensure deep copies for structure and metadata
    structure: { ...defaultStructure },
    metadata: { ...defaultMetadata },
    ...initialProps, // Apply overrides from initialProps
  };

  // If initialProps includes partial structure or metadata, merge them carefully
  // ensuring not to just overwrite but to merge with defaults.
  if (initialProps.structure) {
    baseProfile.structure = { ...defaultStructure, ...initialProps.structure };
  }
  if (initialProps.metadata) {
    baseProfile.metadata = { ...defaultMetadata, ...initialProps.metadata };
  }
  
  // Ensure ID is correctly handled if passed in initialProps
  if (initialProps.id) {
    baseProfile.id = initialProps.id;
  }

  return baseProfile;
};

/**
 * Ensures an existing profile has the necessary structure and metadata.
 * Useful for migrating profiles loaded from localStorage or other sources.
 * @param {Object} profile - The device profile to check and migrate.
 * @returns {Object} The migrated device profile, or a new profile if input is null/undefined.
 */
export const ensureProfileIntegrity = (profile) => {
  // Enhanced validation - if profile is null, undefined, or not an object, create a new one
  if (!profile || typeof profile !== 'object') {
    console.warn("ensureProfileIntegrity received invalid profile, creating new one.");
    return createNewDeviceProfile();
  }

  let needsUpdate = false;
  const now = new Date().toISOString();
  
  // Create a deep copy to avoid mutating the original object directly
  // This is especially important when working with React state
  const newProfile = JSON.parse(JSON.stringify(profile));

  // Ensure ID with explicit validation
  if (!newProfile.id || typeof newProfile.id !== 'string' || newProfile.id.trim() === '') {
    newProfile.id = `device-${Date.now()}`;
    needsUpdate = true;
    console.log(`Profile Integrity: Added/fixed ID ${newProfile.id}`);
  }

  // Ensure structure with explicit type validation
  const defaultStructure = getDefaultDeviceProfileStructure();
  if (!newProfile.structure || 
      typeof newProfile.structure !== 'object' || 
      !newProfile.structure.documentType || 
      !Array.isArray(newProfile.structure.sections)) {
    
    // Create a clean structure object with required properties
    newProfile.structure = { 
      documentType: defaultStructure.documentType,
      sections: [...defaultStructure.sections], // Use spread to create a new array
      version: defaultStructure.version
    };
    
    needsUpdate = true;
    console.log(`Profile Integrity: Completely rebuilt structure for profile ID ${newProfile.id}`, newProfile.structure);
  } else {
    // Ensure all default keys are present and of correct type in structure
    let structureFixed = false;
    
    // Verify documentType
    if (typeof newProfile.structure.documentType !== 'string' || newProfile.structure.documentType.trim() === '') {
      newProfile.structure.documentType = defaultStructure.documentType;
      structureFixed = true;
    }
    
    // Verify sections array
    if (!Array.isArray(newProfile.structure.sections)) {
      newProfile.structure.sections = [...defaultStructure.sections];
      structureFixed = true;
    } else if (newProfile.structure.sections.length === 0) {
      // If array is empty, populate with defaults
      newProfile.structure.sections = [...defaultStructure.sections];
      structureFixed = true;
    }
    
    // Verify version
    if (typeof newProfile.structure.version !== 'string') {
      newProfile.structure.version = defaultStructure.version;
      structureFixed = true;
    }
    
    if (structureFixed) {
      needsUpdate = true;
      console.log(`Profile Integrity: Fixed structure properties for profile ID ${newProfile.id}`, newProfile.structure);
    }
  }

  // Ensure metadata with explicit validation
  const defaultMetadata = getDefaultDeviceProfileMetadata();
  if (!newProfile.metadata || 
      typeof newProfile.metadata !== 'object' || 
      typeof newProfile.metadata.createdAt !== 'string') {
    
    // Create a fresh metadata object with proper timestamps
    newProfile.metadata = { 
      createdAt: now,
      lastUpdated: now
    };
    
    needsUpdate = true;
    console.log(`Profile Integrity: Completely rebuilt metadata for profile ID ${newProfile.id}`, newProfile.metadata);
  } else {
    // Validate createdAt format
    if (!newProfile.metadata.createdAt || typeof newProfile.metadata.createdAt !== 'string') {
      newProfile.metadata.createdAt = now;
      needsUpdate = true;
    }
    
    // Always update lastUpdated timestamp
    newProfile.metadata.lastUpdated = now;
    needsUpdate = true;
  }

  // Ensure required string fields with strict validation
  const requiredStringFields = [
    'deviceName',
    'manufacturer',
    'productCode',
    'deviceClass',
    'status'
  ];
  
  for (const field of requiredStringFields) {
    if (!newProfile[field] || typeof newProfile[field] !== 'string' || newProfile[field].trim() === '') {
      const defaultValue = {
        deviceName: 'Medical Device',
        manufacturer: 'Manufacturer',
        productCode: 'ABC',
        deviceClass: 'II',
        status: 'active'
      }[field] || 'default';
      
      newProfile[field] = defaultValue;
      needsUpdate = true;
      console.log(`Profile Integrity: Fixed missing/invalid required field '${field}' for profile ID ${newProfile.id}`);
    }
  }

  if (needsUpdate) {
    console.log("Profile was updated for integrity. Final ensured profile:", newProfile);
  }

  return newProfile;
};