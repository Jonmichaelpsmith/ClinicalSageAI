/**
 * Workflow Service
 * 
 * This service handles workflow management for the unified document system,
 * including workflow creation, approval processing, and status tracking.
 */

import { and, eq, sql, desc } from 'drizzle-orm';
import { db, unifiedWorkflowSchema } from '../db/connection';
import { 
  workflowApprovals, workflowAuditLogs, workflows, workflowTemplates 
} from '../../shared/schema/unified_workflow';
import type { 
  Workflow, WorkflowApproval, WorkflowAuditLog, WorkflowTemplate 
} from '../../shared/schema/unified_workflow';

interface ApprovalStepInput {
  stepIndex: number;
  stepName: string;
  description?: string;
  assignedTo?: number;
}

export class WorkflowService {
  /**
   * Create a new workflow for a document
   * 
   * @param documentId - The document ID
   * @param templateId - The workflow template ID
   * @param startedBy - User ID of the workflow initiator
   * @param metadata - Optional workflow metadata
   * @returns The created workflow with its approvals
   */
  async createWorkflow(
    documentId: number, 
    templateId: number, 
    startedBy: number,
    metadata: Record<string, any> = {}
  ): Promise<{ workflow: Workflow; approvals: WorkflowApproval[] }> {
    // Get the workflow template
    const template = await db.query.workflowTemplates.findFirst({
      where: eq(workflowTemplates.id, templateId)
    });
    
    if (!template) {
      throw new Error(`Workflow template with ID ${templateId} not found`);
    }
    
    // Create the workflow with a transaction
    const result = await db.transaction(async (tx) => {
      // Insert the workflow
      const [workflowResult] = await tx
        .insert(workflows)
        .values({
          documentId,
          templateId,
          startedBy,
          startedAt: new Date(),
          status: 'in_progress',
          metadata
        })
        .returning();
      
      if (!workflowResult) {
        throw new Error('Failed to create workflow');
      }
      
      // Create approval steps from template
      const steps = template.steps as { name: string; description?: string; requiredApprovers?: number }[];
      const approvalSteps: typeof workflowApprovals.$inferInsert[] = steps.map((step, index) => ({
        workflowId: workflowResult.id,
        stepIndex: index,
        stepName: step.name,
        description: step.description || '',
        status: index === 0 ? 'active' : 'waiting'
      }));
      
      // Insert approval steps
      const approvalResults = await tx
        .insert(workflowApprovals)
        .values(approvalSteps)
        .returning();
      
      // Create initial audit log
      await tx
        .insert(workflowAuditLogs)
        .values({
          workflowId: workflowResult.id,
          actionType: 'workflow_created',
          actionBy: startedBy,
          details: `Workflow created with ${steps.length} steps`
        });
      
      return { workflow: workflowResult, approvals: approvalResults };
    });
    
    return result;
  }
  
  /**
   * Gets workflow information by ID with its approvals
   * 
   * @param workflowId - The workflow ID
   * @returns The workflow with approvals and audit logs
   */
  async getWorkflow(workflowId: number): Promise<{
    workflow: Workflow;
    approvals: WorkflowApproval[];
    auditLogs: WorkflowAuditLog[];
  }> {
    const workflow = await db.query.workflows.findFirst({
      where: eq(workflows.id, workflowId)
    });
    
    if (!workflow) {
      throw new Error(`Workflow with ID ${workflowId} not found`);
    }
    
    const approvals = await db.query.workflowApprovals.findMany({
      where: eq(workflowApprovals.workflowId, workflowId),
      orderBy: workflowApprovals.stepIndex
    });
    
    const auditLogs = await db.query.workflowAuditLogs.findMany({
      where: eq(workflowAuditLogs.workflowId, workflowId),
      orderBy: desc(workflowAuditLogs.timestamp)
    });
    
    return { workflow, approvals, auditLogs };
  }
  
  /**
   * Approves a specific step in a workflow
   * 
   * @param approvalId - The approval step ID
   * @param userId - User performing the approval
   * @param comments - Optional approval comments
   * @returns The updated approval and workflow status
   */
  async approveStep(
    approvalId: number, 
    userId: number, 
    comments?: string
  ): Promise<{ 
    approval: WorkflowApproval; 
    workflowUpdated: boolean; 
    workflowCompleted: boolean;
  }> {
    // Get the approval to make sure it exists and is active
    const approval = await db.query.workflowApprovals.findFirst({
      where: eq(workflowApprovals.id, approvalId)
    });
    
    if (!approval) {
      throw new Error(`Approval step with ID ${approvalId} not found`);
    }
    
    if (approval.status !== 'active') {
      throw new Error(`Approval step is not currently active (status: ${approval.status})`);
    }
    
    return await db.transaction(async (tx) => {
      // Update the approval
      const [updatedApproval] = await tx
        .update(workflowApprovals)
        .set({
          status: 'approved',
          approvedBy: userId,
          approvedAt: new Date(),
          comments: comments || null
        })
        .where(eq(workflowApprovals.id, approvalId))
        .returning();
      
      // Get all approvals to check overall status
      const allApprovals = await tx
        .select()
        .from(workflowApprovals)
        .where(eq(workflowApprovals.workflowId, approval.workflowId))
        .orderBy(workflowApprovals.stepIndex);
      
      // Find the current index and check if there's a next step
      const currentIndex = allApprovals.findIndex(a => a.id === approvalId);
      const nextApproval = allApprovals[currentIndex + 1];
      
      // Create audit log entry
      await tx
        .insert(workflowAuditLogs)
        .values({
          workflowId: approval.workflowId,
          actionType: 'step_approved',
          actionBy: userId,
          details: `Step "${approval.stepName}" approved` + (comments ? `: ${comments}` : '')
        });
      
      let workflowUpdated = false;
      let workflowCompleted = false;
      
      // If this is the last step, complete the workflow
      if (!nextApproval) {
        await tx
          .update(workflows)
          .set({
            status: 'completed',
            completedAt: new Date(),
            completedBy: userId
          })
          .where(eq(workflows.id, approval.workflowId));
        
        // Create workflow completion audit log
        await tx
          .insert(workflowAuditLogs)
          .values({
            workflowId: approval.workflowId,
            actionType: 'workflow_completed',
            actionBy: userId,
            details: 'All steps approved, workflow completed'
          });
        
        workflowUpdated = true;
        workflowCompleted = true;
      } else {
        // Activate the next step
        await tx
          .update(workflowApprovals)
          .set({ status: 'active' })
          .where(eq(workflowApprovals.id, nextApproval.id));
        
        // Create next step activation audit log
        await tx
          .insert(workflowAuditLogs)
          .values({
            workflowId: approval.workflowId,
            actionType: 'step_activated',
            actionBy: userId,
            details: `Step "${nextApproval.stepName}" activated`
          });
        
        workflowUpdated = true;
      }
      
      return { 
        approval: updatedApproval, 
        workflowUpdated, 
        workflowCompleted 
      };
    });
  }
  
  /**
   * Rejects a specific step in a workflow
   * 
   * @param approvalId - The approval step ID
   * @param userId - User performing the rejection
   * @param comments - Required rejection comments
   * @returns The updated approval
   */
  async rejectStep(
    approvalId: number, 
    userId: number, 
    comments: string
  ): Promise<{ 
    approval: WorkflowApproval; 
    workflowRejected: boolean;
  }> {
    if (!comments) {
      throw new Error('Comments are required when rejecting a workflow step');
    }
    
    // Get the approval to make sure it exists and is active
    const approval = await db.query.workflowApprovals.findFirst({
      where: eq(workflowApprovals.id, approvalId)
    });
    
    if (!approval) {
      throw new Error(`Approval step with ID ${approvalId} not found`);
    }
    
    if (approval.status !== 'active') {
      throw new Error(`Approval step is not currently active (status: ${approval.status})`);
    }
    
    return await db.transaction(async (tx) => {
      // Update the approval
      const [updatedApproval] = await tx
        .update(workflowApprovals)
        .set({
          status: 'rejected',
          approvedBy: userId,
          approvedAt: new Date(),
          comments
        })
        .where(eq(workflowApprovals.id, approvalId))
        .returning();
      
      // Update the workflow status
      await tx
        .update(workflows)
        .set({
          status: 'rejected',
          completedAt: new Date(),
          completedBy: userId
        })
        .where(eq(workflows.id, approval.workflowId));
      
      // Create audit log entry
      await tx
        .insert(workflowAuditLogs)
        .values({
          workflowId: approval.workflowId,
          actionType: 'step_rejected',
          actionBy: userId,
          details: `Step "${approval.stepName}" rejected: ${comments}`
        });
      
      // Create workflow rejection audit log
      await tx
        .insert(workflowAuditLogs)
        .values({
          workflowId: approval.workflowId,
          actionType: 'workflow_rejected',
          actionBy: userId,
          details: `Workflow rejected at step "${approval.stepName}"`
        });
      
      return { 
        approval: updatedApproval, 
        workflowRejected: true
      };
    });
  }
  
  /**
   * Gets all workflows for a document
   * 
   * @param documentId - The document ID
   * @returns List of workflows with their current status
   */
  async getDocumentWorkflows(documentId: number): Promise<Workflow[]> {
    const workflowList = await db.query.workflows.findMany({
      where: eq(workflows.documentId, documentId),
      orderBy: [desc(workflows.createdAt)]
    });
    
    return workflowList;
  }
  
  /**
   * Gets all workflow templates for an organization and module type
   * 
   * @param organizationId - The organization ID
   * @param moduleType - The module type
   * @returns List of available workflow templates
   */
  async getWorkflowTemplates(
    organizationId: number, 
    moduleType: string
  ): Promise<WorkflowTemplate[]> {
    const templates = await db.query.workflowTemplates.findMany({
      where: and(
        eq(workflowTemplates.organizationId, organizationId),
        eq(workflowTemplates.moduleType, moduleType),
        eq(workflowTemplates.isActive, true)
      ),
      orderBy: [desc(workflowTemplates.createdAt)]
    });
    
    return templates;
  }
  
  /**
   * Creates a new workflow template
   * 
   * @param templateData - The template data
   * @returns The created template
   */
  async createWorkflowTemplate(
    templateData: Omit<typeof workflowTemplates.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WorkflowTemplate> {
    const [template] = await db
      .insert(workflowTemplates)
      .values(templateData)
      .returning();
    
    if (!template) {
      throw new Error('Failed to create workflow template');
    }
    
    return template;
  }
  
  /**
   * Find all workflows needing action by a user
   * 
   * @param userId - The user ID
   * @returns Workflows awaiting action from the user
   */
  async findUserPendingApprovals(userId: number): Promise<{
    workflows: Workflow[];
    approvals: WorkflowApproval[];
  }> {
    // Find all active approvals assigned to the user
    const pendingApprovals = await db.query.workflowApprovals.findMany({
      where: and(
        eq(workflowApprovals.assignedTo, userId),
        eq(workflowApprovals.status, 'active')
      )
    });
    
    const workflowIds = [...new Set(pendingApprovals.map(a => a.workflowId))];
    
    // Get the corresponding workflows
    const pendingWorkflows = workflowIds.length > 0 
      ? await db.query.workflows.findMany({
          where: sql`${workflows.id} IN (${sql.join(workflowIds, sql`, `)})`,
          orderBy: [desc(workflows.createdAt)]
        })
      : [];
    
    return {
      workflows: pendingWorkflows,
      approvals: pendingApprovals
    };
  }
}

// Export a singleton instance
export const workflowService = new WorkflowService();