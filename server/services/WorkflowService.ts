/**
 * Workflow Service
 * 
 * This service handles the management of document workflows.
 * It provides methods for creating workflows, managing approval steps,
 * tracking workflow progress, and maintaining audit records.
 */

import { eq, and, SQL } from 'drizzle-orm';
import { db } from '../db/connection';
import { 
  documentWorkflows,
  workflowTemplates,
  workflowApprovals,
  workflowAuditTrail,
  unifiedDocuments,
  approvalStatusEnum,
  workflowStatusEnum,
  moduleTypeEnum
} from '../../shared/schema/unified_workflow';

export class WorkflowService {
  /**
   * Create a new workflow for a document
   * 
   * @param documentId - The document ID
   * @param templateId - The workflow template ID
   * @param userId - User ID creating the workflow
   * @param metadata - Optional workflow metadata
   * @returns The created workflow record
   */
  async createWorkflow(
    documentId: number,
    templateId: number,
    userId: number,
    metadata?: Record<string, any>
  ) {
    try {
      // Get template to get steps
      const template = await db.query.workflowTemplates.findFirst({
        where: eq(workflowTemplates.id, templateId)
      });

      if (!template) {
        throw new Error('Workflow template not found');
      }

      // Create workflow
      const workflow = await db
        .insert(documentWorkflows)
        .values({
          documentId,
          templateId,
          status: 'in_review',
          currentStep: 0,
          metadata: metadata || {},
          startedAt: new Date(),
          createdBy: userId,
          updatedBy: userId
        })
        .returning();

      if (!workflow.length) {
        throw new Error('Failed to create workflow');
      }

      const workflowId = workflow[0].id;

      // Create approval steps
      const templateSteps = template.steps as any[];
      
      for (let i = 0; i < templateSteps.length; i++) {
        const step = templateSteps[i];
        await db
          .insert(workflowApprovals)
          .values({
            workflowId,
            stepIndex: i,
            assignedRole: step.role,
            status: i === 0 ? 'in_progress' : 'pending'
          });
      }

      // Create audit record
      await this.addAuditRecord(
        workflowId,
        'workflow_started',
        userId,
        { templateName: template.name }
      );

      return workflow[0];
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw new Error(`Failed to create workflow: ${error.message}`);
    }
  }

  /**
   * Add an audit record for a workflow
   * 
   * @param workflowId - The workflow ID
   * @param actionType - Type of action taken
   * @param userId - User ID performing the action
   * @param actionDetails - Details about the action
   * @returns The created audit record
   */
  async addAuditRecord(
    workflowId: number,
    actionType: string,
    userId: number,
    actionDetails?: Record<string, any>
  ) {
    try {
      const audit = await db
        .insert(workflowAuditTrail)
        .values({
          workflowId,
          actionType,
          actionBy: userId,
          actionDetails: actionDetails || {}
        })
        .returning();

      return audit[0];
    } catch (error) {
      console.error('Error creating audit record:', error);
      throw new Error(`Failed to create audit record: ${error.message}`);
    }
  }

  /**
   * Get a workflow with all its approval steps
   * 
   * @param workflowId - The workflow ID
   * @returns The workflow with approvals and document details
   */
  async getWorkflowWithApprovals(workflowId: number) {
    try {
      // Get workflow
      const workflow = await db.query.documentWorkflows.findFirst({
        where: eq(documentWorkflows.id, workflowId)
      });

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Get template
      const template = await db.query.workflowTemplates.findFirst({
        where: eq(workflowTemplates.id, workflow.templateId)
      });

      // Get document
      const document = await db.query.unifiedDocuments.findFirst({
        where: eq(unifiedDocuments.id, workflow.documentId)
      });

      // Get approvals
      const approvals = await db.query.workflowApprovals.findMany({
        where: eq(workflowApprovals.workflowId, workflowId),
        orderBy: (approvals, { asc }) => [asc(approvals.stepIndex)]
      });

      // Get audit trail
      const auditTrail = await db.query.workflowAuditTrail.findMany({
        where: eq(workflowAuditTrail.workflowId, workflowId),
        orderBy: (audit, { desc }) => [desc(audit.timestamp)]
      });

      return {
        workflow,
        template,
        document,
        approvals,
        auditTrail
      };
    } catch (error) {
      console.error('Error fetching workflow:', error);
      throw new Error(`Failed to fetch workflow: ${error.message}`);
    }
  }

  /**
   * Submit an approval for a workflow step
   * 
   * @param workflowId - The workflow ID
   * @param stepIndex - The step index
   * @param userId - User ID approving the step
   * @param status - Approval status (approved, rejected)
   * @param comments - Optional comments
   * @returns Updated workflow and approval details
   */
  async submitApproval(
    workflowId: number,
    stepIndex: number,
    userId: number,
    status: typeof approvalStatusEnum.enumValues[number],
    comments?: string
  ) {
    try {
      // Get workflow
      const workflow = await db.query.documentWorkflows.findFirst({
        where: eq(documentWorkflows.id, workflowId)
      });

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Get approval step
      const approval = await db.query.workflowApprovals.findFirst({
        where: and(
          eq(workflowApprovals.workflowId, workflowId),
          eq(workflowApprovals.stepIndex, stepIndex)
        )
      });

      if (!approval) {
        throw new Error('Approval step not found');
      }

      if (approval.status !== 'in_progress') {
        throw new Error('Approval step is not in progress');
      }

      // Update approval
      const updatedApproval = await db
        .update(workflowApprovals)
        .set({
          status,
          comments,
          assignedTo: approval.assignedTo || userId,
          completedBy: userId,
          completedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(workflowApprovals.id, approval.id))
        .returning();

      // Create audit record
      await this.addAuditRecord(
        workflowId,
        `step_${status}`,
        userId,
        {
          stepIndex,
          comments,
          previousStatus: approval.status
        }
      );

      // Determine next steps based on approval status
      if (status === 'approved') {
        // Get template for workflow
        const template = await db.query.workflowTemplates.findFirst({
          where: eq(workflowTemplates.id, workflow.templateId)
        });

        const steps = template.steps as any[];
        
        // If this is the last step, complete workflow
        if (stepIndex === steps.length - 1) {
          await this.completeWorkflow(workflowId, 'approved', userId);
        } else {
          // Otherwise, move to next step
          const nextStepIndex = stepIndex + 1;
          
          await db
            .update(documentWorkflows)
            .set({
              currentStep: nextStepIndex,
              updatedBy: userId,
              updatedAt: new Date()
            })
            .where(eq(documentWorkflows.id, workflowId));

          // Activate next step
          await db
            .update(workflowApprovals)
            .set({
              status: 'in_progress',
              updatedAt: new Date()
            })
            .where(and(
              eq(workflowApprovals.workflowId, workflowId),
              eq(workflowApprovals.stepIndex, nextStepIndex)
            ));

          // Create audit record for step advancement
          await this.addAuditRecord(
            workflowId,
            'workflow_advanced',
            userId,
            {
              previousStep: stepIndex,
              newStep: nextStepIndex
            }
          );
        }
      } else if (status === 'rejected') {
        // Rejected workflows are stopped
        await this.completeWorkflow(workflowId, 'rejected', userId);
      }

      return this.getWorkflowWithApprovals(workflowId);
    } catch (error) {
      console.error('Error submitting approval:', error);
      throw new Error(`Failed to submit approval: ${error.message}`);
    }
  }

  /**
   * Complete a workflow with the given status
   * 
   * @param workflowId - The workflow ID
   * @param status - Final workflow status
   * @param userId - User ID completing the workflow
   * @returns Updated workflow
   */
  async completeWorkflow(
    workflowId: number,
    status: typeof workflowStatusEnum.enumValues[number],
    userId: number
  ) {
    try {
      // Get workflow
      const workflow = await db.query.documentWorkflows.findFirst({
        where: eq(documentWorkflows.id, workflowId)
      });

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Update workflow
      const updatedWorkflow = await db
        .update(documentWorkflows)
        .set({
          status,
          completedAt: new Date(),
          updatedBy: userId,
          updatedAt: new Date()
        })
        .where(eq(documentWorkflows.id, workflowId))
        .returning();

      // Update document status
      await db
        .update(unifiedDocuments)
        .set({
          status: status === 'approved' ? 'approved' : 
                 status === 'rejected' ? 'rejected' : 'draft',
          updatedBy: userId,
          updatedAt: new Date()
        })
        .where(eq(unifiedDocuments.id, workflow.documentId));

      // Create audit record
      await this.addAuditRecord(
        workflowId,
        'workflow_completed',
        userId,
        {
          finalStatus: status,
          completedAt: new Date().toISOString()
        }
      );

      return updatedWorkflow[0];
    } catch (error) {
      console.error('Error completing workflow:', error);
      throw new Error(`Failed to complete workflow: ${error.message}`);
    }
  }

  /**
   * Assign a user to an approval step
   * 
   * @param approvalId - The approval ID
   * @param userId - User ID to assign
   * @param assignedById - User ID making the assignment
   * @returns Updated approval
   */
  async assignUserToApproval(
    approvalId: number,
    userId: number,
    assignedById: number
  ) {
    try {
      // Check if approval exists
      const approval = await db.query.workflowApprovals.findFirst({
        where: eq(workflowApprovals.id, approvalId)
      });

      if (!approval) {
        throw new Error('Approval step not found');
      }

      // Update approval
      const updatedApproval = await db
        .update(workflowApprovals)
        .set({
          assignedTo: userId,
          updatedAt: new Date()
        })
        .where(eq(workflowApprovals.id, approvalId))
        .returning();

      // Create audit record
      await this.addAuditRecord(
        approval.workflowId,
        'user_assigned',
        assignedById,
        {
          approvalId,
          assignedUserId: userId,
          stepIndex: approval.stepIndex
        }
      );

      return updatedApproval[0];
    } catch (error) {
      console.error('Error assigning user to approval:', error);
      throw new Error(`Failed to assign user to approval: ${error.message}`);
    }
  }

  /**
   * Get workflows for a document
   * 
   * @param documentId - The document ID
   * @returns Array of workflows with basic details
   */
  async getWorkflowsForDocument(documentId: number) {
    try {
      const workflows = await db.query.documentWorkflows.findMany({
        where: eq(documentWorkflows.documentId, documentId),
        orderBy: (workflows, { desc }) => [desc(workflows.createdAt)]
      });

      return workflows;
    } catch (error) {
      console.error('Error fetching document workflows:', error);
      throw new Error(`Failed to fetch document workflows: ${error.message}`);
    }
  }
}