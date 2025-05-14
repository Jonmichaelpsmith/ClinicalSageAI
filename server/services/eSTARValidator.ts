/**
 * eSTAR Validator Service
 * 
 * This service provides comprehensive validation for eSTAR packages to ensure they comply
 * with FDA submission requirements. It validates document structure, content completeness,
 * file attachments, and other compliance criteria.
 */

import { db } from '../db';
import { fda510kSections, fda510kProjects } from '../../shared/schema';
import { eq, asc } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';

// Define interfaces for validation
export interface ValidationIssue {
  severity: 'error' | 'warning';
  section?: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  score?: number;
}

// Initialize Ajv schema validator
const ajv = new Ajv();
let manifestSchema: any;

try {
  manifestSchema = require('../config/schemas/estarManifest.json');
} catch (error) {
  console.error('Error loading eSTAR manifest schema:', error);
  manifestSchema = {};
}

/**
 * eSTAR Validator Service
 */
export class eSTARValidator {
  /**
   * Validate an eSTAR package for FDA compliance
   * 
   * @param projectId ID of the 510(k) project to validate
   * @param strictMode Whether to enforce strict validation rules
   * @returns Validation result with issues and compliance score
   */
  static async validatePackage(projectId: string, strictMode: boolean = false): Promise<ValidationResult> {
    console.log(`Validating eSTAR package for project ${projectId} with strictMode=${strictMode}`);
    
    // Initialize validation result
    const result: ValidationResult = {
      valid: true,
      issues: [],
      score: 100 // Start with perfect score
    };
    
    try {
      // Step 1: Get all sections for the project
      const sections = await db?.query.fda510kSections.findMany({
        where: eq(fda510kSections.projectId, projectId),
        orderBy: [asc(fda510kSections.orderIndex)]
      });
      
      if (!sections || sections.length === 0) {
        result.valid = false;
        result.issues.push({
          severity: 'error',
          message: 'No sections found for this project'
        });
        result.score = 0;
        return result;
      }
      
      // Step 2: Validate document structure (required sections)
      const structureIssues = await this.validateDocumentStructure(sections);
      if (structureIssues.length > 0) {
        result.valid = false;
        result.issues.push(...structureIssues);
        result.score -= structureIssues.length * (structureIssues.some(i => i.severity === 'error') ? 20 : 5);
      }
      
      // Step 3: Validate content completeness
      const completenessIssues = await this.validateContentCompleteness(sections, strictMode);
      if (completenessIssues.length > 0) {
        // Only set valid to false if we have error-level issues in strict mode
        if (strictMode || completenessIssues.some(issue => issue.severity === 'error')) {
          result.valid = false;
        }
        result.issues.push(...completenessIssues);
        result.score -= completenessIssues.length * (completenessIssues.some(i => i.severity === 'error') ? 10 : 2);
      }
      
      // Step 4: Validate against FDA eSTAR schema
      const schemaIssues = await this.validateAgainstFDASchema(projectId, sections);
      if (schemaIssues.length > 0) {
        result.valid = false;
        result.issues.push(...schemaIssues);
        result.score -= schemaIssues.length * 15;
      }
      
      // Step 5: Validate file attachments
      const attachmentIssues = await this.validateAttachments(projectId, sections);
      if (attachmentIssues.length > 0) {
        // Warning-level attachment issues don't invalidate the package
        if (attachmentIssues.some(issue => issue.severity === 'error')) {
          result.valid = false;
        }
        result.issues.push(...attachmentIssues);
        result.score -= attachmentIssues.length * (attachmentIssues.some(i => i.severity === 'error') ? 10 : 3);
      }
      
      // Ensure score is between 0 and 100
      if (result.score) {
        result.score = Math.max(0, Math.min(100, result.score));
      }
      
      return result;
    } catch (error) {
      console.error('Error validating eSTAR package:', error);
      return {
        valid: false,
        issues: [
          {
            severity: 'error',
            message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ],
        score: 0
      };
    }
  }
  
  /**
   * Validate that all required sections are present
   * 
   * @private
   * @param sections Array of 510(k) sections
   * @returns Array of validation issues
   */
  private static async validateDocumentStructure(sections: any[]): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    
    // Define required sections according to FDA eSTAR guidance
    const requiredSections = [
      { id: 'A', name: 'Administrative' },
      { id: 'B', name: 'Device Description and Classification' },
      { id: 'C', name: 'Indications for Use' },
      { id: 'D', name: 'Device Marketing History' },
      { id: 'E', name: 'Substantial Equivalence Discussion' },
      { id: 'F', name: 'Proposed Labeling' },
      { id: 'G', name: 'Sterilization and Shelf Life' },
      { id: 'H', name: 'Biocompatibility' },
      { id: 'I', name: 'Software' },
      { id: 'J', name: 'Electromagnetic Compatibility and Electrical Safety' },
      { id: 'K', name: 'Performance Testing - Bench' },
      { id: 'L', name: 'Performance Testing - Animal' },
      { id: 'M', name: 'Performance Testing - Clinical' }
    ];
    
    // Get all section names from the provided sections
    const sectionNames = sections.map(s => s.name);
    
    // Check for required sections
    for (const required of requiredSections) {
      const sectionExists = sectionNames.some(name => 
        name.startsWith(required.id) || name.includes(required.name)
      );
      
      if (!sectionExists) {
        issues.push({
          severity: 'error',
          message: `Required section "${required.id}: ${required.name}" is missing from the submission`
        });
      }
    }
    
    // Check for section ordering
    const orderedSections = [...sections].sort((a, b) => {
      // Sort by FDA section ID (A, B, C, etc.)
      const aId = a.name.charAt(0);
      const bId = b.name.charAt(0);
      
      if (aId < bId) return -1;
      if (aId > bId) return 1;
      return 0;
    });
    
    if (JSON.stringify(orderedSections.map(s => s.id)) !== JSON.stringify(sections.map(s => s.id))) {
      issues.push({
        severity: 'warning',
        message: 'Sections appear to be out of order based on FDA guidelines'
      });
    }
    
    return issues;
  }
  
  /**
   * Validate that all sections have complete content
   * 
   * @private
   * @param sections Array of 510(k) sections
   * @param strictMode Whether to enforce strict validation 
   * @returns Array of validation issues
   */
  private static async validateContentCompleteness(sections: any[], strictMode: boolean = false): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    
    // Section-specific validation rules
    const sectionRules: Record<string, {
      required: boolean;
      minWords?: number;
      requiredKeywords?: string[];
      prohibitedPatterns?: RegExp[];
    }> = {
      'A': { // Administrative
        required: true,
        minWords: 100,
        requiredKeywords: ['contact', 'applicant', 'address', 'phone', 'email'],
        prohibitedPatterns: [/\[.*?\]/, /TBD/, /to be determined/i]
      },
      'B': { // Device Description
        required: true,
        minWords: 200,
        requiredKeywords: ['description', 'classification', 'specification', 'component'],
        prohibitedPatterns: [/\[.*?\]/, /TBD/, /to be determined/i]
      },
      'C': { // Indications for Use
        required: true,
        minWords: 50,
        requiredKeywords: ['indicated', 'use', 'purpose'],
        prohibitedPatterns: [/\[.*?\]/, /TBD/, /to be determined/i]
      },
      'E': { // Substantial Equivalence
        required: true,
        minWords: 300,
        requiredKeywords: ['equivalent', 'predicate', 'comparison', 'similar'],
        prohibitedPatterns: [/\[.*?\]/, /TBD/, /to be determined/i]
      }
    };
    
    // Check each section for content completeness
    for (const section of sections) {
      // Get the section ID (first character of the name)
      const sectionId = section.name.charAt(0);
      const rules = sectionRules[sectionId];
      
      // If we don't have specific rules for this section, apply general checks
      if (!rules) {
        if (!section.content || (typeof section.content === 'string' && section.content.trim() === '')) {
          issues.push({
            severity: strictMode ? 'error' : 'warning',
            section: section.name,
            message: `Section "${section.name}" has no content`
          });
        } else if (typeof section.content === 'string' && 
                  (section.content.includes('[') && section.content.includes(']'))) {
          // Look for placeholder text that indicates incomplete content
          issues.push({
            severity: strictMode ? 'error' : 'warning',
            section: section.name,
            message: `Section "${section.name}" contains placeholder text that needs to be replaced`
          });
        }
        continue;
      }
      
      // Apply section-specific rules
      if (rules.required && (!section.content || section.content.trim() === '')) {
        issues.push({
          severity: 'error',
          section: section.name,
          message: `Section "${section.name}" is required but has no content`
        });
        continue;
      }
      
      // Check for content length if we have a content string
      if (typeof section.content === 'string') {
        if (rules.minWords && section.content.split(/\s+/).length < rules.minWords) {
          issues.push({
            severity: strictMode ? 'error' : 'warning',
            section: section.name,
            message: `Section "${section.name}" content is too brief (minimum ${rules.minWords} words required)`
          });
        }
        
        // Check for required keywords
        if (rules.requiredKeywords) {
          const missingKeywords = rules.requiredKeywords.filter(
            keyword => !section.content.toLowerCase().includes(keyword.toLowerCase())
          );
          
          if (missingKeywords.length > 0) {
            issues.push({
              severity: strictMode ? 'error' : 'warning',
              section: section.name,
              message: `Section "${section.name}" is missing key content related to: ${missingKeywords.join(', ')}`
            });
          }
        }
        
        // Check for prohibited patterns (placeholders, TBDs, etc.)
        if (rules.prohibitedPatterns) {
          const foundPatterns = rules.prohibitedPatterns.filter(
            pattern => pattern.test(section.content)
          );
          
          if (foundPatterns.length > 0) {
            issues.push({
              severity: strictMode ? 'error' : 'warning',
              section: section.name,
              message: `Section "${section.name}" contains placeholder text or incomplete information`
            });
          }
        }
      }
    }
    
    return issues;
  }
  
  /**
   * Validate eSTAR package against FDA schema
   * 
   * @private
   * @param projectId ID of the project
   * @param sections Array of sections
   * @returns Array of validation issues
   */
  private static async validateAgainstFDASchema(projectId: string, sections: any[]): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    
    try {
      // Get project metadata
      const project = await db?.query.fda510kProjects.findFirst({
        where: eq(fda510kProjects.id, projectId)
      });
      
      if (!project) {
        issues.push({
          severity: 'error',
          message: 'Project metadata not found'
        });
        return issues;
      }
      
      // Build a mock package object to validate against schema
      const packageObj = {
        packageInfo: {
          submissionType: project.submissionType || 'Traditional',
          deviceName: project.deviceName || '',
          applicant: project.applicant || '',
          contactPerson: {
            name: project.contactName || '',
            title: project.contactTitle || '',
            email: project.contactEmail || '',
            phone: project.contactPhone || ''
          },
          submissionDate: project.submissionDate || new Date().toISOString().split('T')[0],
          predicateDevice: {
            name: project.predicateDeviceName || '',
            manufacturer: project.predicateManufacturer || '',
            kNumber: project.predicateKNumber || ''
          }
        },
        sections: sections.map(s => ({
          id: s.id,
          title: s.name,
          status: s.status || 'inProgress',
          content: s.content || {}
        })),
        documents: []  // Would include attached documents in a real implementation
      };
      
      // Validate against schema
      const ajvValidator = new Ajv();
      const validate = ajvValidator.compile(manifestSchema);
      const valid = validate(packageObj);
      
      if (!valid && validate.errors) {
        for (const error of validate.errors) {
          const dataPath = error.dataPath || '';
          const message = error.message || 'Unknown error';
          
          let section: string | undefined = undefined;
          if (dataPath.includes('sections')) {
            const match = dataPath.match(/sections\/(\d+)/);
            if (match && match[1]) {
              const sectionIndex = parseInt(match[1]);
              section = sections[sectionIndex]?.name;
            }
          }
          
          issues.push({
            severity: 'error',
            section,
            message: `Schema error at ${dataPath}: ${message}`
          });
        }
      }
      
      return issues;
    } catch (error) {
      console.error('Error validating against FDA schema:', error);
      issues.push({
        severity: 'error',
        message: `Schema validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      return issues;
    }
  }
  
  /**
   * Validate file attachments in the eSTAR package
   * 
   * @private
   * @param projectId ID of the project
   * @param sections Array of sections
   * @returns Array of validation issues
   */
  private static async validateAttachments(projectId: string, sections: any[]): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    
    try {
      // Get required attachments for FDA submissions
      const requiredAttachments = [
        { name: 'Declaration of Conformity', section: 'G' },
        { name: 'Test Results', section: 'K' },
        { name: 'Device Labeling', section: 'F' }
      ];
      
      // Check if each section that should have attachments has them
      for (const attachment of requiredAttachments) {
        const relevantSections = sections.filter(s => s.name.startsWith(attachment.section));
        
        if (relevantSections.length > 0) {
          // For each relevant section, check if it has the required attachment
          for (const section of relevantSections) {
            // In a real implementation, we would query the database for attachments
            // For now, just check if the content mentions attachments
            const hasAttachmentMention = section.content && 
                                        typeof section.content === 'string' && 
                                        (section.content.includes('attach') || 
                                         section.content.includes('file') || 
                                         section.content.includes('document'));
            
            if (!hasAttachmentMention) {
              issues.push({
                severity: 'warning',
                section: section.name,
                message: `Section "${section.name}" should include "${attachment.name}" as an attachment`
              });
            }
          }
        }
      }
      
      return issues;
    } catch (error) {
      console.error('Error validating attachments:', error);
      issues.push({
        severity: 'error',
        message: `Attachment validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      return issues;
    }
  }
}