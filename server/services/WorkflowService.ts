/**
 * Workflow Service
 * 
 * This service handles the management of document workflows.
 * It provides methods for creating workflows, managing approval steps,
 * tracking workflow progress, and maintaining audit records.
 */

import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/connection';
import {
  workflows,
  workflowTemplates,
  workflowApprovals,
  workflowAuditLogs,
  Workflow,
  WorkflowApproval,
  WorkflowAuditLog,
  WorkflowTemplate,
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
    metadata: Record<string, any> = {}
  ) {
    try {
      // Get the workflow template
      const template = await db.query.workflowTemplates.findFirst({
        where: eq(workflowTemplates.id, templateId),
      });
      
      if (!template) {
        throw new Error('Workflow template not found');
      }
      
      // Begin transaction
      return await db.transaction(async (tx) => {
        // Create the workflow
        const [workflow] = await tx
          .insert(workflows)
          .values({
            documentId,
            templateId,
            status: 'in_progress',
            startedAt: new Date(),
            startedBy: userId,
            metadata,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        
        // Create step approvals based on template steps
        const steps = template.steps || [];
        
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          
          await tx.insert(workflowApprovals).values({
            workflowId: workflow.id,
            stepIndex: i,
            stepName: step.name,
            description: step.description || null,
            status: i === 0 ? 'pending' : 'waiting',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        
        // Add audit log entry
        await this.addAuditRecord(
          workflow.id,
          'workflow_created',
          userId,
          'Workflow initiated',
          tx
        );
        
        // Return the workflow with approvals
        return this.getWorkflowWithApprovals(workflow.id);
      });
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw new Error('Failed to create workflow');
    }
  }

  /**
   * Add an audit record for a workflow
   * 
   * @param workflowId - The workflow ID
   * @param actionType - Type of action taken
   * @param userId - User ID performing the action
   * @param actionDetails - Details about the action
   * @param tx - Optional transaction object
   * @returns The created audit record
   */
  async addAuditRecord(
    workflowId: number,
    actionType: string,
    userId: number,
    actionDetails: string = null,
    tx = db
  ) {
    try {
      const [record] = await tx
        .insert(workflowAuditLogs)
        .values({
          workflowId,
          actionType,
          actionBy: userId,
          timestamp: new Date(),
          details: actionDetails,
        })
        .returning();
      
      return record;
    } catch (error) {
      console.error('Error adding audit record:', error);
      throw new Error('Failed to add audit record');
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
      // Get the workflow
      const workflow = await db.query.workflows.findFirst({
        where: eq(workflows.id, workflowId),
        with: {
          template: true,
          document: true,
        },
      });
      
      if (!workflow) {
        return null;
      }
      
      // Get the approvals
      const approvals = await db.query.workflowApprovals.findMany({
        where: eq(workflowApprovals.workflowId, workflowId),
        orderBy: (approvals) => [approvals.stepIndex],
      });
      
      // Get audit log
      const auditLogs = await db.query.workflowAuditLogs.findMany({
        where: eq(workflowAuditLogs.workflowId, workflowId),
        orderBy: (logs, { desc }) => [desc(logs.timestamp)],
        limit: 10, // Limit to the most recent 10 logs
      });
      
      // Format the response
      const templateName = workflow.template?.name || 'Unknown Template';
      
      return {
        id: workflow.id,
        documentId: workflow.documentId,
        templateId: workflow.templateId,
        templateName,
        status: workflow.status,
        startedAt: workflow.startedAt,
        startedBy: workflow.startedBy,
        completedAt: workflow.completedAt,
        completedBy: workflow.completedBy,
        metadata: workflow.metadata,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
        document: workflow.document,
        approvals,
        auditLog: auditLogs,
      };
    } catch (error) {
      console.error('Error getting workflow with approvals:', error);
      throw new Error('Failed to get workflow with approvals');
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
    status: 'approved' | 'rejected',
    comments: string = ''
  ) {
    try {
      return await db.transaction(async (tx) => {
        // Get the workflow
        const workflow = await tx.query.workflows.findFirst({
          where: eq(workflows.id, workflowId),
        });
        
        if (!workflow) {
          throw new Error('Workflow not found');
        }
        
        // Get the approval
        const [approval] = await tx
          .select()
          .from(workflowApprovals)
          .where(
            and(
              eq(workflowApprovals.workflowId, workflowId),
              eq(workflowApprovals.stepIndex, stepIndex)
            )
          );
        
        if (!approval) {
          throw new Error('Approval step not found');
        }
        
        if (approval.status !== 'pending') {
          throw new Error('This step has already been processed');
        }
        
        // Update the approval
        await tx
          .update(workflowApprovals)
          .set({
            status,
            approvedBy: userId,
            approvedAt: new Date(),
            comments,
            updatedAt: new Date(),
          })
          .where(eq(workflowApprovals.id, approval.id));
        
        // Add audit log
        await this.addAuditRecord(
          workflowId,
          `approval_${status}`,
          userId,
          `Step ${stepIndex + 1} (${approval.stepName || 'Unnamed step'}) ${status}${
            comments ? `: ${comments}` : ''
          }`,
          tx
        );
        
        // If approved, activate the next step if available
        if (status === 'approved') {
          const nextStepIndex = stepIndex + 1;
          const [nextStep] = await tx
            .select()
            .from(workflowApprovals)
            .where(
              and(
                eq(workflowApprovals.workflowId, workflowId),
                eq(workflowApprovals.stepIndex, nextStepIndex)
              )
            );
          
          if (nextStep) {
            // Activate the next step
            await tx
              .update(workflowApprovals)
              .set({
                status: 'pending',
                updatedAt: new Date(),
              })
              .where(eq(workflowApprovals.id, nextStep.id));
            
            await this.addAuditRecord(
              workflowId,
              'next_step_activated',
              userId,
              `Step ${nextStepIndex + 1} (${nextStep.stepName || 'Unnamed step'}) is now active`,
              tx
            );
          } else {
            // No more steps, complete the workflow
            await this.completeWorkflow(workflowId, 'completed', userId, tx);
          }
        } else if (status === 'rejected') {
          // If rejected, mark the whole workflow as rejected
          await this.completeWorkflow(workflowId, 'rejected', userId, tx);
        }
        
        // Return the updated workflow
        return this.getWorkflowWithApprovals(workflowId);
      });
    } catch (error) {
      console.error('Error submitting approval:', error);
      throw new Error('Failed to submit approval');
    }
  }

  /**
   * Complete a workflow with the given status
   * 
   * @param workflowId - The workflow ID
   * @param status - Final workflow status
   * @param userId - User ID completing the workflow
   * @param tx - Optional transaction object
   * @returns Updated workflow
   */
  async completeWorkflow(
    workflowId: number,
    status: 'completed' | 'rejected',
    userId: number,
    tx = db
  ) {
    try {
      // Update the workflow
      await tx
        .update(workflows)
        .set({
          status,
          completedAt: new Date(),
          completedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(workflows.id, workflowId));
      
      // Add audit log
      await this.addAuditRecord(
        workflowId,
        `workflow_${status}`,
        userId,
        `Workflow ${status === 'completed' ? 'completed successfully' : 'rejected'}`,
        tx
      );
      
      return true;
    } catch (error) {
      console.error(`Error completing workflow with status ${status}:`, error);
      throw new Error(`Failed to complete workflow with status ${status}`);
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
      // Get the approval to make sure it exists and get the workflow ID
      const approval = await db.query.workflowApprovals.findFirst({
        where: eq(workflowApprovals.id, approvalId),
      });
      
      if (!approval) {
        throw new Error('Approval not found');
      }
      
      // Update the approval
      const [updated] = await db
        .update(workflowApprovals)
        .set({
          assignedTo: userId,
          updatedAt: new Date(),
        })
        .where(eq(workflowApprovals.id, approvalId))
        .returning();
      
      // Add audit log
      await this.addAuditRecord(
        approval.workflowId,
        'approval_assigned',
        assignedById,
        `Step ${approval.stepIndex + 1} (${approval.stepName || 'Unnamed step'}) assigned to user ID: ${userId}`
      );
      
      return updated;
    } catch (error) {
      console.error('Error assigning user to approval:', error);
      throw new Error('Failed to assign user to approval');
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
      const workflowsList = await db.query.workflows.findMany({
        where: eq(workflows.documentId, documentId),
        orderBy: (workflows, { desc }) => [desc(workflows.createdAt)],
        with: {
          template: {
            columns: {
              name: true,
            },
          },
        },
      });
      
      return workflowsList.map(w => ({
        id: w.id,
        documentId: w.documentId,
        templateId: w.templateId,
        templateName: w.template?.name || 'Unknown Template',
        status: w.status,
        startedAt: w.startedAt,
        startedBy: w.startedBy,
        completedAt: w.completedAt,
        completedBy: w.completedBy,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      }));
    } catch (error) {
      console.error('Error getting workflows for document:', error);
      throw new Error('Failed to get workflows for document');
    }
  }
}