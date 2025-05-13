import { NextFunction, Request, Response } from 'express';

// Since we had issues with AJV, we'll implement a similar validation approach
// that doesn't depend on the AJV package
import deviceProfileSchema from '../../client/src/components/cer/schemas/deviceProfile.json';

function validateSchema(data: any, schema: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  if (schema.required) {
    for (const requiredField of schema.required) {
      if (data[requiredField] === undefined || data[requiredField] === null || data[requiredField] === '') {
        errors.push(`Field '${requiredField}' is required`);
      }
    }
  }
  
  // Validate properties
  if (schema.properties) {
    for (const [field, rules] of Object.entries(schema.properties)) {
      const value = data[field];
      const typedRules = rules as any;
      
      // Skip if field is not present and not required
      if ((value === undefined || value === null) && 
          (!schema.required || !schema.required.includes(field))) {
        continue;
      }
      
      // Type validation
      if (value !== undefined && value !== null) {
        if (typedRules.type === 'string' && typeof value !== 'string') {
          errors.push(`Field '${field}' must be a string`);
        }
        
        // String minimum length
        if (typedRules.type === 'string' && typedRules.minLength && 
            typeof value === 'string' && value.length < typedRules.minLength) {
          errors.push(`Field '${field}' must be at least ${typedRules.minLength} characters long`);
        }
        
        // Enum validation
        if (typedRules.enum && !typedRules.enum.includes(value)) {
          errors.push(`Field '${field}' must be one of: ${typedRules.enum.join(', ')}`);
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateDeviceProfile(req: Request, res: Response, next: NextFunction) {
  const validation = validateSchema(req.body, deviceProfileSchema);
  
  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }
  
  next();
}