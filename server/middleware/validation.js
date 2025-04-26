/**
 * Input Validation Middleware
 * 
 * This middleware uses Zod to validate request bodies against defined schemas
 * to ensure only properly formatted data reaches our handlers.
 */

import { z } from 'zod';

/**
 * Creates a middleware that validates the request body against the provided schema
 * 
 * @param {z.ZodSchema} schema - The Zod schema to validate against
 * @returns {Function} Express middleware
 */
export const validateBody = (schema) => (req, res, next) => {
  try {
    // Parse and validate the request body
    const validated = schema.parse(req.body);
    // Replace req.body with validated data to ensure type safety
    req.body = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Send formatted validation errors
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
    // Handle unexpected errors
    return res.status(500).json({ error: 'Internal server error during validation' });
  }
};

/**
 * Common schemas for reuse across routes
 */
export const schemas = {
  // Document upload schema
  documentUpload: z.object({
    title: z.string().min(1, "Title is required").max(200, "Title cannot exceed 200 characters"),
    content: z.string().min(1, "Content is required"),
    docType: z.string().min(1, "Document type is required"),
    status: z.enum(["Draft", "Review", "Approved", "Effective", "Archived"], {
      errorMap: () => ({ message: "Invalid document status" })
    }).optional().default("Draft"),
    tags: z.array(z.string()).optional().default([])
  }),
  
  // Retention rule schema
  retentionRule: z.object({
    docType: z.string().min(1, "Document type is required"),
    archiveAfterMonths: z.number().int().min(1, "Archive period must be at least 1 month"),
    deleteAfterMonths: z.number().int().min(1, "Delete period must be at least 1 month")
  }),
  
  // Promotional material review schema
  promoReview: z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    type: z.enum(["Print", "Digital", "Video", "Social"], {
      errorMap: () => ({ message: "Invalid promotion type" })
    }),
    claims: z.array(z.string()).optional().default([])
  }),
  
  // Quality event schema
  qualityEvent: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    category: z.enum(["Deviation", "CAPA", "Complaint", "Adverse Event"], {
      errorMap: () => ({ message: "Invalid event category" })
    }),
    severity: z.enum(["Low", "Medium", "High", "Critical"], {
      errorMap: () => ({ message: "Invalid severity level" })
    }),
    status: z.enum(["Open", "In Progress", "Closed"], {
      errorMap: () => ({ message: "Invalid status" })
    }).optional().default("Open")
  })
};