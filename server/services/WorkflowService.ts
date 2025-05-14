/**
 * Workflow Service
 * 
 * This service manages document workflows across different modules.
 * It provides functionality for:
 * - Creating workflow templates
 * - Initiating workflows for documents
 * - Processing approval steps
 * - Tracking workflow status
 */

import { db } from '../db/connection';
import { documents } from '../../shared/schema';
import {
  documentWorkflows,
  workflowTemplates,
  workflowApprovals,
  moduleDocuments
} from '../../shared/schema/unified_workflow';
import { eq, and, or, isNull, asc, desc } from 'drizzle-orm';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

// Internal events for workflow state changes
export const workflowEvents = new EventEmitter();

// Workflow initiation parameters
export const workflowInitiationSchema = z.object({
  documentId: z.number(),
  workflowTemplateId: z.string(),
  initiatedBy: z.number(),
  initialData: z.any().optional(),
});

export type WorkflowInitiation = z.infer<typeof workflowInitiationSchema>;

// Approval action parameters
export const approvalActionSchema = z.object({
  workflowId: z.string(),
  stepIndex: z.number(),
  userId: z.number(),
  approved: z.boolean(),
  comments: z.string().optional(),
  signatureData: z.string().optional(),
});

export type ApprovalAction = z.infer<typeof approvalActionSchema>;

export class WorkflowService {
  /**
   * Create a new workflow template
   */
  async createWorkflowTemplate(
    name: string,
    moduleType: string,
    steps: any[],
    description?: string
  ): Promise<string> {
    try {
      const result = await db.insert(workflowTemplates)
        .values({
          id: uuidv4(),
          name,
          description,
          moduleType,
          steps,
          isActive: true
        })
        .returning();
        
      return result[0].id;
    } catch (error) {
      console.error(`Error creating workflow template: ${error.message}`);
      throw new Error(`Failed to create workflow template: ${error.message}`);
    }
  }
  
  /**
   * Initiate a workflow for a document
   */
  async initiateWorkflow(params: WorkflowInitiation): Promise<string> {
    try {
      // Validate parameters
      const validatedParams = workflowInitiationSchema.parse(params);
      
      // 1. Get workflow template
      const template = await db.select()
        .from(workflowTemplates)
        .where(eq(workflowTemplates.id, validatedParams.workflowTemplateId))
        .limit(1);
        
      if (template.length === 0) {
        throw new Error(`Workflow template not found: ${validatedParams.workflowTemplateId}`);
      }
      
      // 2. Create workflow
      const workflowId = uuidv4();
      
      await db.insert(documentWorkflows)
        .values({
          id: workflowId,
          documentId: validatedParams.documentId,
          workflowTemplateId: validatedParams.workflowTemplateId,
          status: 'in_review',
          currentStep: 0,
          initiatedBy: validatedParams.initiatedBy,
          data: validatedParams.initialData || {}
        });
      
      // 3. Set up initial approval steps
      const steps = template[0].steps as any[];
      
      // Create first approval step if available
      if (steps.length > 0) {
        await db.insert(workflowApprovals)
          .values({
            id: uuidv4(),
            workflowId,
            stepIndex: 0,
            status: 'pending',
            assignedRole: steps[0].role,
            assignedTo: steps[0].assignTo || null
          });
      }
      
      // 4. Update document status
      await db.update(documents)
        .set({ status: 'in_review' })
        .where(eq(documents.id, validatedParams.documentId));
      
      // 5. Emit event
      workflowEvents.emit('workflow_started', {
        workflowId,
        documentId: validatedParams.documentId,
        templateId: validatedParams.workflowTemplateId,
        initiatedBy: validatedParams.initiatedBy
      });
      
      return workflowId;
    } catch (error) {
      console.error(`Error initiating workflow: ${error.message}`);
      throw new Error(`Failed to initiate workflow: ${error.message}`);
    }
  }
  
  /**
   * Process an approval action
   */
  async processApproval(params: ApprovalAction): Promise<{
    status: string;
    nextStep?: number;
    isComplete: boolean;
  }> {
    try {
      // Validate parameters
      const validatedParams = approvalActionSchema.parse(params);
      
      // 1. Get workflow
      const workflow = await db.select()
        .from(documentWorkflows)
        .where(eq(documentWorkflows.id, validatedParams.workflowId))
        .limit(1);
        
      if (workflow.length === 0) {
        throw new Error(`Workflow not found: ${validatedParams.workflowId}`);
      }
      
      // 2. Get the current approval step
      const approvalStep = await db.select()
        .from(workflowApprovals)
        .where(
          and(
            eq(workflowApprovals.workflowId, validatedParams.workflowId),
            eq(workflowApprovals.stepIndex, validatedParams.stepIndex)
          )
        )
        .limit(1);
        
      if (approvalStep.length === 0) {
        throw new Error(`Approval step not found for workflow ${validatedParams.workflowId} at index ${validatedParams.stepIndex}`);
      }
      
      // 3. Check if user is allowed to approve
      if (approvalStep[0].assignedTo && approvalStep[0].assignedTo !== validatedParams.userId) {
        // Check if the user has the required role
        const userHasRole = await this.userHasRole(validatedParams.userId, approvalStep[0].assignedRole);
        
        if (!userHasRole) {
          throw new Error(`User ${validatedParams.userId} is not authorized to approve this step`);
        }
      }
      
      // 4. Update approval step
      await db.update(workflowApprovals)
        .set({
          status: validatedParams.approved ? 'approved' : 'rejected',
          completedBy: validatedParams.userId,
          completedAt: new Date(),
          comments: validatedParams.comments || null,
          signatureData: validatedParams.signatureData || null
        })
        .where(eq(workflowApprovals.id, approvalStep[0].id));
      
      // 5. Get workflow template to determine next steps
      const template = await db.select()
        .from(workflowTemplates)
        .where(eq(workflowTemplates.id, workflow[0].workflowTemplateId))
        .limit(1);
      
      const steps = template[0].steps as any[];
      
      let nextStep = validatedParams.stepIndex + 1;
      let isComplete = false;
      let workflowStatus = workflow[0].status;
      
      // Handle rejection
      if (!validatedParams.approved) {
        workflowStatus = 'rejected';
        isComplete = true;
        
        // Update document status
        await db.update(documents)
          .set({ status: 'rejected' })
          .where(eq(documents.id, workflow[0].documentId));
        
        // Emit event
        workflowEvents.emit('workflow_rejected', {
          workflowId: validatedParams.workflowId,
          documentId: workflow[0].documentId,
          userId: validatedParams.userId,
          step: validatedParams.stepIndex,
          comments: validatedParams.comments
        });
      }
      // Handle approval and determine next step
      else if (nextStep < steps.length) {
        // Create next approval step
        await db.insert(workflowApprovals)
          .values({
            id: uuidv4(),
            workflowId: validatedParams.workflowId,
            stepIndex: nextStep,
            status: 'pending',
            assignedRole: steps[nextStep].role,
            assignedTo: steps[nextStep].assignTo || null
          });
        
        // Update workflow current step
        await db.update(documentWorkflows)
          .set({
            currentStep: nextStep
          })
          .where(eq(documentWorkflows.id, validatedParams.workflowId));
        
        // Emit event
        workflowEvents.emit('workflow_step_approved', {
          workflowId: validatedParams.workflowId,
          documentId: workflow[0].documentId,
          userId: validatedParams.userId,
          step: validatedParams.stepIndex,
          nextStep,
          comments: validatedParams.comments
        });
      }
      // Workflow complete
      else {
        workflowStatus = 'approved';
        isComplete = true;
        
        // Update workflow status
        await db.update(documentWorkflows)
          .set({
            status: 'approved',
            completedAt: new Date()
          })
          .where(eq(documentWorkflows.id, validatedParams.workflowId));
        
        // Update document status
        await db.update(documents)
          .set({ status: 'approved' })
          .where(eq(documents.id, workflow[0].documentId));
        
        // Emit event
        workflowEvents.emit('workflow_completed', {
          workflowId: validatedParams.workflowId,
          documentId: workflow[0].documentId,
          userId: validatedParams.userId
        });
        
        // Handle module-specific post-approval actions
        await this.handlePostApproval(workflow[0]);
      }
      
      // 6. Update workflow status if needed
      if (workflowStatus !== workflow[0].status) {
        await db.update(documentWorkflows)
          .set({ status: workflowStatus })
          .where(eq(documentWorkflows.id, validatedParams.workflowId));
      }
      
      return {
        status: workflowStatus,
        nextStep: isComplete ? undefined : nextStep,
        isComplete
      };
    } catch (error) {
      console.error(`Error processing approval: ${error.message}`);
      throw new Error(`Failed to process approval: ${error.message}`);
    }
  }
  
  /**
   * Get workflow details including approval steps
   */
  async getWorkflowDetails(workflowId: string): Promise<any> {
    try {
      const workflow = await db.select()
        .from(documentWorkflows)
        .where(eq(documentWorkflows.id, workflowId))
        .limit(1);
        
      if (workflow.length === 0) {
        throw new Error(`Workflow not found: ${workflowId}`);
      }
      
      // Get approval steps
      const approvals = await db.select()
        .from(workflowApprovals)
        .where(eq(workflowApprovals.workflowId, workflowId))
        .orderBy(asc(workflowApprovals.stepIndex));
      
      // Get template
      const template = await db.select()
        .from(workflowTemplates)
        .where(eq(workflowTemplates.id, workflow[0].workflowTemplateId))
        .limit(1);
      
      return {
        workflow: workflow[0],
        template: template.length > 0 ? template[0] : null,
        approvals
      };
    } catch (error) {
      console.error(`Error getting workflow details: ${error.message}`);
      throw new Error(`Failed to get workflow details: ${error.message}`);
    }
  }
  
  /**
   * Get active workflow for a document
   */
  async getDocumentWorkflow(documentId: number): Promise<any> {
    try {
      const workflow = await db.select()
        .from(documentWorkflows)
        .where(
          and(
            eq(documentWorkflows.documentId, documentId),
            or(
              eq(documentWorkflows.status, 'in_review'),
              eq(documentWorkflows.status, 'draft')
            )
          )
        )
        .orderBy(desc(documentWorkflows.startedAt))
        .limit(1);
        
      if (workflow.length === 0) {
        return null;
      }
      
      return this.getWorkflowDetails(workflow[0].id);
    } catch (error) {
      console.error(`Error getting document workflow: ${error.message}`);
      throw new Error(`Failed to get document workflow: ${error.message}`);
    }
  }
  
  /**
   * Check if a user has a specific role
   */
  private async userHasRole(userId: number, role: string): Promise<boolean> {
    // TODO: Implement role checking based on the existing system
    // For now, return true to allow development
    return true;
  }
  
  /**
   * Handle module-specific post-approval actions
   */
  private async handlePostApproval(workflow: any): Promise<void> {
    try {
      // Get module type for this document
      const moduleDoc = await db.select()
        .from(moduleDocuments)
        .where(eq(moduleDocuments.documentId, workflow.documentId))
        .limit(1);
      
      if (moduleDoc.length === 0) {
        // Not a module document, nothing to do
        return;
      }
      
      const moduleType = moduleDoc[0].moduleType;
      
      // Perform module-specific actions
      switch (moduleType) {
        case 'ectd_coauthor':
          await this.handleEctdPostApproval(workflow, moduleDoc[0]);
          break;
        case 'med_device':
          await this.handleMedDevicePostApproval(workflow, moduleDoc[0]);
          break;
        case 'cmc_wizard':
          await this.handleCmcPostApproval(workflow, moduleDoc[0]);
          break;
        case 'study_architect':
          await this.handleStudyPostApproval(workflow, moduleDoc[0]);
          break;
      }
    } catch (error) {
      console.error(`Error handling post-approval actions: ${error.message}`);
      // Log error but don't fail the approval process
    }
  }
  
  // Module-specific post-approval handlers
  private async handleEctdPostApproval(workflow: any, moduleDoc: any): Promise<void> {
    // Example: Update eCTD sequence status
    workflowEvents.emit('ectd_document_approved', {
      workflowId: workflow.id,
      documentId: workflow.documentId,
      moduleDocumentId: moduleDoc.moduleDocumentId,
      metadata: moduleDoc.metadata
    });
  }
  
  private async handleMedDevicePostApproval(workflow: any, moduleDoc: any): Promise<void> {
    // Example: Update 510(k) or CER status
    workflowEvents.emit('med_device_document_approved', {
      workflowId: workflow.id,
      documentId: workflow.documentId,
      moduleDocumentId: moduleDoc.moduleDocumentId,
      metadata: moduleDoc.metadata
    });
  }
  
  private async handleCmcPostApproval(workflow: any, moduleDoc: any): Promise<void> {
    // Example: Update CMC document status
    workflowEvents.emit('cmc_document_approved', {
      workflowId: workflow.id,
      documentId: workflow.documentId,
      moduleDocumentId: moduleDoc.moduleDocumentId,
      metadata: moduleDoc.metadata
    });
  }
  
  private async handleStudyPostApproval(workflow: any, moduleDoc: any): Promise<void> {
    // Example: Update study protocol or CSR status
    workflowEvents.emit('study_document_approved', {
      workflowId: workflow.id,
      documentId: workflow.documentId,
      moduleDocumentId: moduleDoc.moduleDocumentId,
      metadata: moduleDoc.metadata
    });
  }
}