/**
 * Validation Service
 * 
 * This service provides functions to interact with the validation API endpoints,
 * allowing components to fetch validation profiles and submit validation requests.
 */

/**
 * Get validation profiles for all regions
 */
export async function getValidationProfiles() {
  try {
    const response = await fetch('/api/validation/profiles');
    return await response.json();
  } catch (error) {
    console.error('Error fetching validation profiles:', error);
    return { status: 'error', message: 'Failed to fetch validation profiles' };
  }
}

/**
 * Get validation profile for a specific region
 * 
 * @param region - Region code (FDA, EMA, PMDA)
 */
export async function getRegionValidationProfile(region: string) {
  try {
    const response = await fetch(`/api/validation/profiles/${region}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching validation profile for ${region}:`, error);
    return { status: 'error', message: `Failed to fetch validation profile for ${region}` };
  }
}

/**
 * Get validation rules for a specific region
 * 
 * @param region - Region code (FDA, EMA, PMDA)
 */
export async function getValidationRules(region: string) {
  try {
    const response = await fetch(`/api/validation/rules/${region}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching validation rules for ${region}:`, error);
    return { status: 'error', message: `Failed to fetch validation rules for ${region}` };
  }
}

/**
 * Validate a submission sequence
 * 
 * @param sequencePath - Path to the sequence folder
 * @param region - Region code (FDA, EMA, PMDA)
 */
export async function validateSubmission(sequencePath: string, region: string) {
  try {
    const response = await fetch('/api/validation/validate-submission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sequencePath,
        region,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error validating submission:', error);
    return { status: 'error', message: 'Failed to validate submission' };
  }
}

/**
 * Validate a single document
 * 
 * @param documentPath - Path to the document file
 * @param region - Region code (FDA, EMA, PMDA)
 * @param docType - Optional document type for context-specific validation
 */
export async function validateDocument(documentPath: string, region: string, docType?: string) {
  try {
    const response = await fetch('/api/validation/validate-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentPath,
        region,
        docType,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error validating document:', error);
    return { status: 'error', message: 'Failed to validate document' };
  }
}