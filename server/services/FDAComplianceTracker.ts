/**
 * FDA Compliance Tracker
 * 
 * This service tracks the progress and implementation status of the FDA-compliant
 * 510(k) submission system, including eSTAR integration, validation, and workflow
 * integration. It provides a structured way to track progress against the
 * implementation plan and maintain a log of validation results.
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { db } from '../db';

// Define implementation phases and steps
export const implementationPhases = {
  'pdf-generation': {
    name: 'FDA-Compliant PDF Generation',
    steps: [
      'Define PDF templates following FDA guidance',
      'Implement PDF generation service with proper formatting',
      'Add section-specific PDF generation',
      'Add complete submission PDF assembly',
      'Validate PDFs against FDA eCopy requirements'
    ]
  },
  'estar-validation': {
    name: 'eSTAR Validation Implementation',
    steps: [
      'Define validation criteria based on FDA guidance',
      'Implement document structure validation',
      'Implement content completeness validation',
      'Implement FDA schema validation',
      'Implement attachment validation'
    ]
  },
  'workflow-integration': {
    name: 'Workflow Integration',
    steps: [
      'Define workflow steps for eSTAR generation',
      'Implement eSTAR workflow integration service',
      'Add validation step to workflow',
      'Add approval/review workflow integration',
      'Implement final submission integration'
    ]
  },
  'testing': {
    name: 'Testing & Validation',
    steps: [
      'Implement test harness for eSTAR validation',
      'Create validation test cases',
      'Perform end-to-end workflow testing',
      'Validate PDF output compliance',
      'Document test results and validation evidence'
    ]
  }
};

// Validation log entry interface
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

// Implementation progress interface
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
  // Directory paths for logs and progress tracking
  private static readonly BASE_DIR = path.join(process.cwd(), 'logs');
  private static readonly VALIDATION_LOG_PATH = path.join(FDAComplianceTracker.BASE_DIR, 'fda_validation_log.json');
  private static readonly PROGRESS_LOG_PATH = path.join(FDAComplianceTracker.BASE_DIR, 'fda_implementation_progress.json');
  
  /**
   * Initialize the compliance tracker
   */
  static async initialize(): Promise<void> {
    try {
      // Ensure log directory exists
      await fs.mkdir(FDAComplianceTracker.BASE_DIR, { recursive: true });
      
      // Initialize validation log file if it doesn't exist
      try {
        await fs.access(FDAComplianceTracker.VALIDATION_LOG_PATH);
      } catch (error) {
        await fs.writeFile(FDAComplianceTracker.VALIDATION_LOG_PATH, JSON.stringify([], null, 2));
      }
      
      // Initialize progress log file if it doesn't exist
      try {
        await fs.access(FDAComplianceTracker.PROGRESS_LOG_PATH);
      } catch (error) {
        // Create initial progress structure
        const initialProgress: ImplementationProgress = {
          phases: {},
          overallProgress: 0,
          lastUpdated: new Date().toISOString()
        };
        
        // Initialize each phase
        for (const [phaseId, phase] of Object.entries(implementationPhases)) {
          initialProgress.phases[phaseId] = {
            name: phase.name,
            progress: 0,
            completedSteps: [],
            remainingSteps: phase.steps
          };
        }
        
        await fs.writeFile(
          FDAComplianceTracker.PROGRESS_LOG_PATH, 
          JSON.stringify(initialProgress, null, 2)
        );
      }
      
      console.log('FDA Compliance Tracker initialized successfully');
    } catch (error) {
      console.error('Error initializing FDA Compliance Tracker:', error);
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
      // Read existing log
      const logData = await fs.readFile(FDAComplianceTracker.VALIDATION_LOG_PATH, 'utf8');
      const log: ValidationLogEntry[] = JSON.parse(logData);
      
      // Calculate issue counts
      const errorCount = validationResult.issues.filter((i: any) => i.severity === 'error').length;
      const warningCount = validationResult.issues.filter((i: any) => i.severity === 'warning').length;
      
      // Create log entry
      const entry: ValidationLogEntry = {
        timestamp: new Date().toISOString(),
        projectId,
        validationResult: {
          valid: validationResult.valid,
          score: validationResult.score || 0,
          issueCount: validationResult.issues.length,
          errorCount,
          warningCount
        },
        buildAttempted,
        buildSuccessful
      };
      
      // Add to log
      log.push(entry);
      
      // Write updated log
      await fs.writeFile(
        FDAComplianceTracker.VALIDATION_LOG_PATH,
        JSON.stringify(log, null, 2)
      );
      
      console.log(`Validation log updated for project ${projectId}`);
    } catch (error) {
      console.error('Error logging validation result:', error);
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
      // Read existing progress
      const progressData = await fs.readFile(FDAComplianceTracker.PROGRESS_LOG_PATH, 'utf8');
      const progress: ImplementationProgress = JSON.parse(progressData);
      
      // Get the phase
      const phase = progress.phases[phaseId];
      if (!phase) {
        throw new Error(`Phase ${phaseId} not found`);
      }
      
      // Check if step is already completed
      if (phase.completedSteps.includes(completedStep)) {
        return;
      }
      
      // Get step index in remaining steps
      const stepIndex = phase.remainingSteps.indexOf(completedStep);
      if (stepIndex === -1) {
        throw new Error(`Step "${completedStep}" not found in remaining steps for phase ${phaseId}`);
      }
      
      // Move step from remaining to completed
      phase.remainingSteps.splice(stepIndex, 1);
      phase.completedSteps.push(completedStep);
      
      // Update progress
      if (setProgress !== undefined) {
        phase.progress = setProgress;
      } else {
        const totalSteps = phase.completedSteps.length + phase.remainingSteps.length;
        phase.progress = Math.round((phase.completedSteps.length / totalSteps) * 100);
      }
      
      // Update overall progress
      let totalProgress = 0;
      let phaseCount = 0;
      
      for (const phase of Object.values(progress.phases)) {
        totalProgress += phase.progress;
        phaseCount++;
      }
      
      progress.overallProgress = Math.round(totalProgress / phaseCount);
      progress.lastUpdated = new Date().toISOString();
      
      // Write updated progress
      await fs.writeFile(
        FDAComplianceTracker.PROGRESS_LOG_PATH,
        JSON.stringify(progress, null, 2)
      );
      
      console.log(`Implementation progress updated for phase ${phaseId}, step "${completedStep}"`);
    } catch (error) {
      console.error('Error updating implementation progress:', error);
    }
  }
  
  /**
   * Get current implementation progress
   * 
   * @returns Promise with implementation progress
   */
  static async getProgress(): Promise<ImplementationProgress> {
    try {
      // Read progress file
      const progressData = await fs.readFile(FDAComplianceTracker.PROGRESS_LOG_PATH, 'utf8');
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
      // Read log file
      const logData = await fs.readFile(FDAComplianceTracker.VALIDATION_LOG_PATH, 'utf8');
      let log: ValidationLogEntry[] = JSON.parse(logData);
      
      // Filter by project ID if provided
      if (projectId) {
        log = log.filter(entry => entry.projectId === projectId);
      }
      
      // Sort by timestamp (newest first)
      log.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Apply limit if provided
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
      // Read existing progress
      const progressData = await fs.readFile(FDAComplianceTracker.PROGRESS_LOG_PATH, 'utf8');
      const progress: ImplementationProgress = JSON.parse(progressData);
      
      // Get the phase
      const phase = progress.phases[phaseId];
      if (!phase) {
        throw new Error(`Phase ${phaseId} not found`);
      }
      
      // Move all remaining steps to completed
      phase.completedSteps.push(...phase.remainingSteps);
      phase.remainingSteps = [];
      phase.progress = 100;
      
      // Update overall progress
      let totalProgress = 0;
      let phaseCount = 0;
      
      for (const phase of Object.values(progress.phases)) {
        totalProgress += phase.progress;
        phaseCount++;
      }
      
      progress.overallProgress = Math.round(totalProgress / phaseCount);
      progress.lastUpdated = new Date().toISOString();
      
      // Write updated progress
      await fs.writeFile(
        FDAComplianceTracker.PROGRESS_LOG_PATH,
        JSON.stringify(progress, null, 2)
      );
      
      console.log(`Phase ${phaseId} marked as complete`);
    } catch (error) {
      console.error('Error completing phase:', error);
    }
  }
}

// Auto-initialize when imported
FDAComplianceTracker.initialize()
  .catch(error => console.error('Failed to initialize FDA Compliance Tracker:', error));