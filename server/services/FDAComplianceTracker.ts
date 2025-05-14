/**
 * FDA Compliance Tracker
 * 
 * This service tracks compliance status for FDA regulatory submissions,
 * providing visibility into validation progress, errors, and completion status.
 */

import { z } from 'zod';
import { db } from '../db';
import { fda510kProjects } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Define the compliance step record schema
export const complianceStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: z.enum(['notStarted', 'inProgress', 'completed', 'error', 'skipped']),
  completedAt: z.date().optional(),
  errorDetails: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
});

export type ComplianceStep = z.infer<typeof complianceStepSchema>;

// Define the compliance tracker schema
export const complianceTrackerSchema = z.object({
  projectId: z.string(),
  submissionType: z.enum(['510k', 'pma', 'de_novo']),
  steps: z.array(complianceStepSchema),
  lastUpdated: z.date(),
  validationScore: z.number().min(0).max(100).optional(),
  complianceScore: z.number().min(0).max(100).optional(),
  issues: z.array(z.object({
    stepId: z.string(),
    severity: z.enum(['error', 'warning', 'info']),
    message: z.string(),
    code: z.string().optional(),
    resolved: z.boolean().default(false),
  })).optional(),
});

export type ComplianceTracker = z.infer<typeof complianceTrackerSchema>;

/**
 * FDA Compliance Tracker Service
 */
export class FDAComplianceTracker {
  /**
   * Initialize a compliance tracker for a project
   * 
   * @param projectId The project ID
   * @param submissionType The type of FDA submission
   * @returns The initialized compliance tracker
   */
  static async initialize(projectId: string, submissionType: '510k' | 'pma' | 'de_novo'): Promise<ComplianceTracker> {
    // Check if project exists
    const project = await db.query.fda510kProjects.findFirst({
      where: eq(fda510kProjects.id, projectId)
    });
    
    if (!project) {
      throw new Error(`Project with ID ${projectId} does not exist`);
    }
    
    // Define the default steps for each submission type
    const steps: ComplianceStep[] = this.getDefaultSteps(submissionType);
    
    // Create the compliance tracker
    const tracker: ComplianceTracker = {
      projectId,
      submissionType,
      steps,
      lastUpdated: new Date(),
      validationScore: 0,
      complianceScore: 0,
      issues: [],
    };
    
    // Store the tracker in the database (placeholder)
    // In a real implementation, this would persist the tracker to a database
    
    return tracker;
  }
  
  /**
   * Get the default steps for a submission type
   * 
   * @param submissionType The type of FDA submission
   * @returns Array of default compliance steps
   */
  private static getDefaultSteps(submissionType: '510k' | 'pma' | 'de_novo'): ComplianceStep[] {
    switch (submissionType) {
      case '510k':
        return [
          {
            id: 'deviceInfo',
            name: 'Device Information',
            description: 'Basic device identification and classification information',
            status: 'notStarted',
            requirements: ['deviceName', 'deviceClass', 'regulationNumber'],
          },
          {
            id: 'predicateDevice',
            name: 'Predicate Device',
            description: 'Identification of predicate device(s) for substantial equivalence',
            status: 'notStarted',
            requirements: ['predicateName', 'predicateKNumber'],
            dependencies: ['deviceInfo'],
          },
          {
            id: 'deviceDescription',
            name: 'Device Description',
            description: 'Comprehensive description of the device',
            status: 'notStarted',
            requirements: ['physicalDescription', 'performanceCharacteristics', 'specifications'],
            dependencies: ['deviceInfo'],
          },
          {
            id: 'substEquivalence',
            name: 'Substantial Equivalence',
            description: 'Comparison to predicate device(s)',
            status: 'notStarted',
            requirements: ['comparisonTable', 'differenceAnalysis'],
            dependencies: ['predicateDevice', 'deviceDescription'],
          },
          {
            id: 'performanceData',
            name: 'Performance Data',
            description: 'Performance testing and validation data',
            status: 'notStarted',
            requirements: ['benchData', 'clinicalData', 'biocompatibility'].filter(Boolean),
            dependencies: ['deviceDescription'],
          },
          {
            id: 'estarPackage',
            name: 'eSTAR Package',
            description: 'Electronic Submission Template And Resource (eSTAR) package',
            status: 'notStarted',
            requirements: ['fullSubmission', 'validationPassed'],
            dependencies: [
              'deviceInfo',
              'predicateDevice',
              'deviceDescription',
              'substEquivalence',
              'performanceData',
            ],
          },
        ];
      
      case 'pma':
        // PMA steps would be defined here
        return [];
        
      case 'de_novo':
        // De Novo steps would be defined here
        return [];
        
      default:
        return [];
    }
  }
  
  /**
   * Update a step in the compliance tracker
   * 
   * @param projectId The project ID
   * @param stepId The step ID to update
   * @param update The update object
   * @returns The updated compliance tracker
   */
  static async updateStep(
    projectId: string,
    stepId: string,
    update: Partial<ComplianceStep>
  ): Promise<ComplianceTracker> {
    // In a real implementation, this would fetch the tracker from a database,
    // update the step, and persist the changes
    
    // For now, we'll return a mock tracker with the updated step
    const tracker = await this.getTracker(projectId);
    
    if (!tracker) {
      throw new Error(`Compliance tracker for project ${projectId} not found`);
    }
    
    const stepIndex = tracker.steps.findIndex(step => step.id === stepId);
    
    if (stepIndex === -1) {
      throw new Error(`Step ${stepId} not found in tracker for project ${projectId}`);
    }
    
    // Update the step
    tracker.steps[stepIndex] = {
      ...tracker.steps[stepIndex],
      ...update,
      // If status is changing to completed, set completedAt
      ...(update.status === 'completed' && !update.completedAt
        ? { completedAt: new Date() }
        : {}),
    };
    
    // Update the tracker
    tracker.lastUpdated = new Date();
    
    // Recalculate scores
    this.recalculateScores(tracker);
    
    // Persist changes (placeholder)
    
    return tracker;
  }
  
  /**
   * Get a compliance tracker for a project
   * 
   * @param projectId The project ID
   * @returns The compliance tracker or null if not found
   */
  static async getTracker(projectId: string): Promise<ComplianceTracker | null> {
    // In a real implementation, this would fetch the tracker from a database
    
    // For now, we'll initialize a new tracker
    try {
      // Check if project exists
      const project = await db.query.fda510kProjects.findFirst({
        where: eq(fda510kProjects.id, projectId)
      });
      
      if (!project) {
        return null;
      }
      
      // Create a mock tracker
      return this.initialize(projectId, '510k');
    } catch (error) {
      console.error(`Error fetching compliance tracker for project ${projectId}:`, error);
      return null;
    }
  }
  
  /**
   * Add an issue to the compliance tracker
   * 
   * @param projectId The project ID
   * @param issue The issue to add
   * @returns The updated compliance tracker
   */
  static async addIssue(
    projectId: string,
    issue: {
      stepId: string;
      severity: 'error' | 'warning' | 'info';
      message: string;
      code?: string;
    }
  ): Promise<ComplianceTracker> {
    const tracker = await this.getTracker(projectId);
    
    if (!tracker) {
      throw new Error(`Compliance tracker for project ${projectId} not found`);
    }
    
    // Add the issue
    tracker.issues = [
      ...(tracker.issues || []),
      {
        ...issue,
        resolved: false,
      },
    ];
    
    // Update the tracker
    tracker.lastUpdated = new Date();
    
    // Recalculate scores
    this.recalculateScores(tracker);
    
    // Persist changes (placeholder)
    
    return tracker;
  }
  
  /**
   * Resolve an issue in the compliance tracker
   * 
   * @param projectId The project ID
   * @param issueIndex The index of the issue to resolve
   * @returns The updated compliance tracker
   */
  static async resolveIssue(
    projectId: string,
    issueIndex: number
  ): Promise<ComplianceTracker> {
    const tracker = await this.getTracker(projectId);
    
    if (!tracker) {
      throw new Error(`Compliance tracker for project ${projectId} not found`);
    }
    
    if (!tracker.issues || issueIndex >= tracker.issues.length) {
      throw new Error(`Issue index ${issueIndex} out of bounds`);
    }
    
    // Mark the issue as resolved
    tracker.issues[issueIndex].resolved = true;
    
    // Update the tracker
    tracker.lastUpdated = new Date();
    
    // Recalculate scores
    this.recalculateScores(tracker);
    
    // Persist changes (placeholder)
    
    return tracker;
  }
  
  /**
   * Recalculate compliance and validation scores
   * 
   * @param tracker The compliance tracker to update
   */
  private static recalculateScores(tracker: ComplianceTracker): void {
    // Calculate validation score
    const totalSteps = tracker.steps.length;
    const completedSteps = tracker.steps.filter(step => step.status === 'completed').length;
    
    tracker.validationScore = Math.round((completedSteps / totalSteps) * 100);
    
    // Calculate compliance score based on issues
    if (!tracker.issues || tracker.issues.length === 0) {
      tracker.complianceScore = 100;
      return;
    }
    
    const unresolvedErrors = tracker.issues.filter(
      issue => !issue.resolved && issue.severity === 'error'
    ).length;
    
    const unresolvedWarnings = tracker.issues.filter(
      issue => !issue.resolved && issue.severity === 'warning'
    ).length;
    
    // Weight errors more heavily than warnings
    const totalPenalty = (unresolvedErrors * 15) + (unresolvedWarnings * 5);
    tracker.complianceScore = Math.max(0, Math.min(100, 100 - totalPenalty));
  }
  
  /**
   * Validate a submission for completeness
   * 
   * @param projectId The project ID
   * @returns The validation result
   */
  static async validateSubmission(projectId: string): Promise<{
    valid: boolean;
    score: number;
    issues: Array<{
      stepId: string;
      severity: 'error' | 'warning' | 'info';
      message: string;
    }>;
  }> {
    const tracker = await this.getTracker(projectId);
    
    if (!tracker) {
      throw new Error(`Compliance tracker for project ${projectId} not found`);
    }
    
    // Check for incomplete required steps
    const incompleteSteps = tracker.steps.filter(
      step => step.status !== 'completed' && step.status !== 'skipped'
    );
    
    const issues = incompleteSteps.map(step => ({
      stepId: step.id,
      severity: 'error' as const,
      message: `Step "${step.name}" is not complete`,
    }));
    
    // Add unresolved tracker issues
    if (tracker.issues) {
      const unresolvedIssues = tracker.issues
        .filter(issue => !issue.resolved)
        .map(issue => ({
          stepId: issue.stepId,
          severity: issue.severity,
          message: issue.message,
        }));
      
      issues.push(...unresolvedIssues);
    }
    
    // Calculate validation score
    const score = tracker.validationScore || 0;
    
    // A submission is valid if score is 100 and no error issues
    const valid = score === 100 && !issues.some(issue => issue.severity === 'error');
    
    return {
      valid,
      score,
      issues,
    };
  }
}