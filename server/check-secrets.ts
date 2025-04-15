/**
 * Check Secrets Utility
 * 
 * Utility functions to check if API keys and other secrets are configured
 * in the environment.
 */

/**
 * Check if specific environment secrets are configured
 * 
 * @param secretKeys Array of secret key names to check
 * @returns Object with boolean values indicating presence of each secret
 */
export async function check_secrets(secretKeys: string[]): Promise<Record<string, boolean>> {
  const result: Record<string, boolean> = {};
  
  for (const key of secretKeys) {
    result[key] = !!process.env[key];
  }
  
  return result;
}

/**
 * Checks if the OpenAI API key is configured
 * 
 * @returns True if the OpenAI API key is available, false otherwise
 */
export async function is_openai_key_available(): Promise<boolean> {
  const secrets = await check_secrets(['OPENAI_API_KEY']);
  return secrets.OPENAI_API_KEY;
}

/**
 * Get the required API keys for a specific feature
 * 
 * @param featureName Name of the feature to check requirements for
 * @returns Array of required API key names
 */
export function get_required_keys_for_feature(featureName: string): string[] {
  const featureKeyMap: Record<string, string[]> = {
    'cer-generator': ['OPENAI_API_KEY'],
    'csr-extractor': ['OPENAI_API_KEY'],
    'protocol-optimizer': ['OPENAI_API_KEY'],
    'academic-knowledge': ['HF_API_KEY', 'OPENAI_API_KEY'],
    'translation': ['OPENAI_API_KEY'],
    'endpoint-designer': ['OPENAI_API_KEY']
  };
  
  return featureKeyMap[featureName] || [];
}