/**
 * Simple JSON Schema validator for device profiles
 * This provides basic validation without external dependencies
 */

/**
 * Validates data against a JSON schema
 * @param {Object} data - The data to validate
 * @param {Object} schema - The JSON schema to validate against
 * @returns {Object} - Validation result with isValid and errors properties
 */
export const validateAgainstSchema = (data, schema) => {
  const errors = [];
  
  // Check required fields
  if (schema.required && Array.isArray(schema.required)) {
    for (const requiredField of schema.required) {
      if (data[requiredField] === undefined || data[requiredField] === null || data[requiredField] === '') {
        errors.push({
          field: requiredField,
          message: `Field '${requiredField}' is required`
        });
      }
    }
  }
  
  // Check property types and constraints
  if (schema.properties) {
    for (const [key, property] of Object.entries(schema.properties)) {
      if (data[key] !== undefined && data[key] !== null) {
        // Check type
        if (property.type === 'string' && typeof data[key] !== 'string') {
          errors.push({
            field: key,
            message: `Field '${key}' must be a string`
          });
        }
        
        if (property.type === 'number' && typeof data[key] !== 'number') {
          errors.push({
            field: key,
            message: `Field '${key}' must be a number`
          });
        }
        
        if (property.type === 'boolean' && typeof data[key] !== 'boolean') {
          errors.push({
            field: key,
            message: `Field '${key}' must be a boolean`
          });
        }
        
        if (property.type === 'array' && !Array.isArray(data[key])) {
          errors.push({
            field: key,
            message: `Field '${key}' must be an array`
          });
        }
        
        // Check enum values
        if (property.enum && !property.enum.includes(data[key])) {
          errors.push({
            field: key,
            message: `Field '${key}' must be one of: ${property.enum.join(', ')}`
          });
        }
        
        // Validate array items if present
        if (property.type === 'array' && Array.isArray(data[key]) && property.items) {
          data[key].forEach((item, index) => {
            if (property.items.type === 'object' && typeof item !== 'object') {
              errors.push({
                field: `${key}[${index}]`,
                message: `Item at index ${index} must be an object`
              });
            }
            
            if (property.items.type === 'string' && typeof item !== 'string') {
              errors.push({
                field: `${key}[${index}]`,
                message: `Item at index ${index} must be a string`
              });
            }
          });
        }
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Load a schema from the schemas directory
 * @param {string} schemaName - The name of the schema file (without .json extension)
 * @returns {Promise<Object>} - The schema object
 */
export const loadSchema = async (schemaName) => {
  try {
    const schema = await import(`../schemas/${schemaName}.json`);
    return schema.default || schema;
  } catch (error) {
    console.error(`Failed to load schema ${schemaName}:`, error);
    throw new Error(`Schema ${schemaName} not found`);
  }
};

/**
 * Validate device profile data against the device profile schema
 * @param {Object} deviceProfileData - The device profile data to validate
 * @returns {Promise<Object>} - Validation result
 */
export const validateDeviceProfile = async (deviceProfileData) => {
  try {
    const schema = await loadSchema('deviceProfile');
    return validateAgainstSchema(deviceProfileData, schema);
  } catch (error) {
    console.error('Error validating device profile:', error);
    return {
      isValid: false,
      errors: [{
        field: 'schema',
        message: `Schema validation error: ${error.message}`
      }]
    };
  }
};