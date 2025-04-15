/**
 * Secret Key Checker Utility
 * 
 * This module provides functions to check for the presence of API keys and other secrets
 * in the environment variables.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Check if specified secrets are available in environment variables
 * 
 * @param secretKeys - Array of secret keys to check
 * @returns Object with each key as property and boolean value indicating if it's available
 */
export function checkSecrets(secretKeys: string[]) {
  const result: Record<string, boolean> = {};
  
  for (const key of secretKeys) {
    result[key] = process.env[key] !== undefined && process.env[key] !== '';
  }
  
  return result;
}

/**
 * Express middleware to verify that required secrets are available
 * 
 * @param requiredSecrets - Array of required secret keys
 * @returns Express middleware function
 */
export function requireSecrets(requiredSecrets: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const results = checkSecrets(requiredSecrets);
    const missing = Object.entries(results)
      .filter(([_, isAvailable]) => !isAvailable)
      .map(([key]) => key);
    
    if (missing.length > 0) {
      return res.status(500).json({
        error: `Missing required API keys: ${missing.join(', ')}`,
        missingKeys: missing
      });
    }
    
    next();
  };
}

/**
 * Express middleware to verify that OpenAI API key is available
 * 
 * @returns Express middleware function
 */
export function requireOpenAIKey() {
  return requireSecrets(['OPENAI_API_KEY']);
}