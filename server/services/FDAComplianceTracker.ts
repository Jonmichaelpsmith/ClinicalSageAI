/**
 * FDA Compliance Tracker
 * 
 * This service tracks the progress and implementation status of the FDA-compliant
 * 510(k) submission system, including eSTAR integration, validation, and workflow
 * integration. It provides a structured way to track progress against the
 * implementation plan and maintain a log of validation results.
 */

import fs from 'fs';
import path from 'path';

export const implementationPhases = {
  VALIDATION: {
    id: 'validation',
    name: 'eSTAR Validation',
    steps: [
      'Define validation criteria based on FDA eSTAR guidelines',
      'Implement schema validation for document structure',
      'Add content validation for required sections',
      'Create validation for file attachments',
      'Implement comprehensive validation reporting'
    ]
  },
  PDF_GENERATION: {
    id: 'pdf_generation',
    name: 'FDA-Compliant PDF Generation',
    steps: [
      'Create PDF templates that comply with FDA requirements',
      'Implement PDF/A compliance for archival standards',
      'Add proper bookmarking and TOC generation',
      'Ensure text searchability for all content',
      'Implement digital signing capabilities'
    ]
  },
  WORKFLOW_INTEGRATION: {
    id: 'workflow_integration',
    name: 'Workflow Integration',
    steps: [
      'Connect eSTAR validation to workflow engine',
      'Add eSTAR generation step to submission workflow',
      'Implement validation-based workflow branching',
      'Create workflow notifications for validation issues',
      'Add audit trail for validation history'
    ]
  },
  TESTING: {
    id: 'testing',
    name: 'Comprehensive Testing',
    steps: [
      'Define test cases for all validation scenarios',
      'Create automated tests for validation engine',
      'Perform end-to-end workflow testing',
      'Validate PDF output against FDA requirements',
      'Load test with realistic submission volumes'
    ]
  }
};

export interface ValidationLogEntry {
  timestamp: string;
  projectId: string;
  validationResult: {
    valid: boolean;
    score: number;
    issueCount: number;
    errorCount: number;
    warningCount: number;
  };
  buildAttempted: boolean;
  buildSuccessful: boolean | null;
}

export interface ImplementationProgress {
  phases: {
    [key: string]: {
      name: string;
      progress: number;
      completedSteps: string[];
      remainingSteps: string[];
    }
  };
  overallProgress: number;
  lastUpdated: string;
}

/**
 * FDA Compliance Tracker
 */
export class FDAComplianceTracker {
  private static readonly BASE_DIR = path.join(process.cwd(), 'logs');
  private static readonly VALIDATION_LOG_PATH = path.join(FDAComplianceTracker.BASE_DIR, 'fda_validation_log.json');
  private static readonly PROGRESS_LOG_PATH = path.join(FDAComplianceTracker.BASE_DIR, 'fda_implementation_progress.json');

  /**
   * Initialize the compliance tracker
   */
  static async initialize(): Promise<void> {
    try {
      // Ensure logs directory exists
      if (!fs.existsSync(this.BASE_DIR)) {
        fs.mkdirSync(this.BASE_DIR, { recursive: true });
      }

      // Initialize validation log if it doesn't exist
      if (!fs.existsSync(this.VALIDATION_LOG_PATH)) {
        fs.writeFileSync(this.VALIDATION_LOG_PATH, JSON.stringify([], null, 2));
      }

      // Initialize progress log if it doesn't exist
      if (!fs.existsSync(this.PROGRESS_LOG_PATH)) {
        const initialProgress: ImplementationProgress = {
          phases: Object.values(implementationPhases).reduce((acc, phase) => {
            acc[phase.id] = {
              name: phase.name,
              progress: 0,
              completedSteps: [],
              remainingSteps: [...phase.steps]
            };
            return acc;
          }, {}),
          overallProgress: 0,
          lastUpdated: new Date().toISOString()
        };

        fs.writeFileSync(this.PROGRESS_LOG_PATH, JSON.stringify(initialProgress, null, 2));
      }
    } catch (error) {
      console.error('Error initializing FDA Compliance Tracker:', error);
      throw error;
    }
  }

  /**
   * Log a validation result
   * 
   * @param projectId The 510(k) project ID
   * @param validationResult The validation result to log
   * @param buildAttempted Whether a build was attempted after validation
   * @param buildSuccessful Whether the build was successful (if attempted)
   */
  static async logValidation(
    projectId: string,
    validationResult: any,
    buildAttempted: boolean = false,
    buildSuccessful: boolean | null = null
  ): Promise<void> {
    try {
      // Ensure initialization
      if (!fs.existsSync(this.VALIDATION_LOG_PATH)) {
        await this.initialize();
      }

      // Calculate derived metrics
      const issues = validationResult.issues || [];
      const errorCount = issues.filter(i => i.severity === 'error').length;
      const warningCount = issues.filter(i => i.severity === 'warning').length;

      // Create log entry
      const entry: ValidationLogEntry = {
        timestamp: new Date().toISOString(),
        projectId,
        validationResult: {
          valid: validationResult.valid,
          score: validationResult.score || 0,
          issueCount: issues.length,
          errorCount,
          warningCount
        },
        buildAttempted,
        buildSuccessful
      };

      // Read existing log
      const logData = fs.readFileSync(this.VALIDATION_LOG_PATH, 'utf8');
      const log = JSON.parse(logData);

      // Add new entry
      log.push(entry);

      // Write updated log
      fs.writeFileSync(this.VALIDATION_LOG_PATH, JSON.stringify(log, null, 2));
    } catch (error) {
      console.error('Error logging validation result:', error);
      throw error;
    }
  }

  /**
   * Update implementation progress
   * 
   * @param phaseId The phase ID to update
   * @param completedStep The step that was completed
   * @param setProgress Override the calculated progress percentage (optional)
   */
  static async updateProgress(
    phaseId: string,
    completedStep: string,
    setProgress?: number
  ): Promise<void> {
    try {
      // Ensure initialization
      if (!fs.existsSync(this.PROGRESS_LOG_PATH)) {
        await this.initialize();
      }

      // Read existing progress
      const progressData = fs.readFileSync(this.PROGRESS_LOG_PATH, 'utf8');
      const progress: ImplementationProgress = JSON.parse(progressData);

      // Validate phase ID
      if (!progress.phases[phaseId]) {
        throw new Error(`Invalid phase ID: ${phaseId}`);
      }

      const phase = progress.phases[phaseId];

      // Remove completed step from remaining and add to completed
      const stepIndex = phase.remainingSteps.findIndex(s => s === completedStep);
      if (stepIndex >= 0) {
        phase.remainingSteps.splice(stepIndex, 1);
        phase.completedSteps.push(completedStep);
      } else if (!phase.completedSteps.includes(completedStep)) {
        // If not in remaining, but also not in completed, just add it to completed
        phase.completedSteps.push(completedStep);
      }

      // Calculate phase progress
      const totalSteps = phase.completedSteps.length + phase.remainingSteps.length;
      phase.progress = setProgress !== undefined ? 
        setProgress : 
        Math.round((phase.completedSteps.length / totalSteps) * 100);

      // Calculate overall progress
      const phaseCount = Object.keys(progress.phases).length;
      const totalProgress = Object.values(progress.phases).reduce((sum, p) => sum + p.progress, 0);
      progress.overallProgress = Math.round(totalProgress / phaseCount);

      // Update timestamp
      progress.lastUpdated = new Date().toISOString();

      // Write updated progress
      fs.writeFileSync(this.PROGRESS_LOG_PATH, JSON.stringify(progress, null, 2));
    } catch (error) {
      console.error('Error updating implementation progress:', error);
      throw error;
    }
  }

  /**
   * Get current implementation progress
   * 
   * @returns Promise with implementation progress
   */
  static async getProgress(): Promise<ImplementationProgress> {
    try {
      // Ensure initialization
      if (!fs.existsSync(this.PROGRESS_LOG_PATH)) {
        await this.initialize();
      }

      // Read existing progress
      const progressData = fs.readFileSync(this.PROGRESS_LOG_PATH, 'utf8');
      return JSON.parse(progressData);
    } catch (error) {
      console.error('Error getting implementation progress:', error);
      throw error;
    }
  }

  /**
   * Get validation log entries, optionally filtered by project
   * 
   * @param projectId Optional project ID to filter by
   * @param limit Optional limit on the number of entries to return
   * @returns Promise with array of validation log entries
   */
  static async getValidationLog(
    projectId?: string,
    limit?: number
  ): Promise<ValidationLogEntry[]> {
    try {
      // Ensure initialization
      if (!fs.existsSync(this.VALIDATION_LOG_PATH)) {
        await this.initialize();
      }

      // Read existing log
      const logData = fs.readFileSync(this.VALIDATION_LOG_PATH, 'utf8');
      let log: ValidationLogEntry[] = JSON.parse(logData);

      // Filter by project if specified
      if (projectId) {
        log = log.filter(entry => entry.projectId === projectId);
      }

      // Sort by timestamp (newest first)
      log.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Apply limit if specified
      if (limit && limit > 0) {
        log = log.slice(0, limit);
      }

      return log;
    } catch (error) {
      console.error('Error getting validation log:', error);
      throw error;
    }
  }

  /**
   * Mark all steps in a phase as completed
   * 
   * @param phaseId The phase ID to mark as complete
   */
  static async completePhase(phaseId: string): Promise<void> {
    try {
      // Ensure initialization
      if (!fs.existsSync(this.PROGRESS_LOG_PATH)) {
        await this.initialize();
      }

      // Read existing progress
      const progressData = fs.readFileSync(this.PROGRESS_LOG_PATH, 'utf8');
      const progress: ImplementationProgress = JSON.parse(progressData);

      // Validate phase ID
      if (!progress.phases[phaseId]) {
        throw new Error(`Invalid phase ID: ${phaseId}`);
      }

      const phase = progress.phases[phaseId];

      // Move all remaining steps to completed
      phase.completedSteps = [...phase.completedSteps, ...phase.remainingSteps];
      phase.remainingSteps = [];
      phase.progress = 100;

      // Calculate overall progress
      const phaseCount = Object.keys(progress.phases).length;
      const totalProgress = Object.values(progress.phases).reduce((sum, p) => sum + p.progress, 0);
      progress.overallProgress = Math.round(totalProgress / phaseCount);

      // Update timestamp
      progress.lastUpdated = new Date().toISOString();

      // Write updated progress
      fs.writeFileSync(this.PROGRESS_LOG_PATH, JSON.stringify(progress, null, 2));
    } catch (error) {
      console.error('Error completing phase:', error);
      throw error;
    }
  }
}