/**
 * Workflow Service
 * 
 * This service handles workflow management, including templates, workflows,
 * and approval steps.
 */

import { z } from 'zod';
import { db, pgClient } from '../db/connection';
import * as schema from '../../shared/schema/unified_workflow';
import { eq, and, or, inArray, desc, sql } from 'drizzle-orm';
import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// Define validation schemas
export const workflowTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  organizationId: z.number().int().positive(),
  moduleType: z.string().min(1),
  isDefault: z.boolean().optional().default(false),
  createdBy: z.number().int().positive(),
  steps: z.array(z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    order: z.number().int().nonnegative().optional(),
    assigneeType: z.string().optional()
  })).min(1)
});

class WorkflowService {
  /**
   * Get workflow templates for an organization
   * 
   * @param organizationId Organization ID
   * @param moduleType Module type
   * @returns List of workflow templates
   */
  async getWorkflowTemplates(organizationId: number, moduleType: string) {
    // Get templates
    const templates = await db
      .select()
      .from(schema.workflowTemplates)
      .where(
        and(
          eq(schema.workflowTemplates.organizationId, organizationId),
          eq(schema.workflowTemplates.moduleType, moduleType)
        )
      )
      .orderBy(schema.workflowTemplates.name);

    // Get all template IDs
    const templateIds = templates.map(t => t.id);
    
    if (templateIds.length === 0) {
      return [];
    }
    
    // Get steps for all templates
    const steps = await db
      .select()
      .from(schema.workflowTemplateSteps)
      .where(inArray(schema.workflowTemplateSteps.templateId, templateIds))
      .orderBy(schema.workflowTemplateSteps.order);
    
    // Combine templates with their steps
    return templates.map(template => {
      const templateSteps = steps.filter(s => s.templateId === template.id);
      return {
        ...template,
        steps: templateSteps
      };
    });
  }

  /**
   * Create a workflow template
   * 
   * @param templateData Template data
   * @returns The created template
   */
  async createWorkflowTemplate(templateData: z.infer<typeof workflowTemplateSchema>) {
    const client = await pgClient.begin();

    try {
      // Insert the template
      const [template] = await db
        .insert(schema.workflowTemplates)
        .values({
          name: templateData.name,
          description: templateData.description || '',
          organizationId: templateData.organizationId,
          moduleType: templateData.moduleType,
          isDefault: templateData.isDefault || false,
          createdBy: templateData.createdBy,
          createdAt: new Date()
        })
        .returning()
        .execute(client as any);

      // Insert the steps
      const steps = await Promise.all(templateData.steps.map(async (step: any, index: number) => {
        const [createdStep] = await db
          .insert(schema.workflowTemplateSteps)
          .values({
            templateId: template.id,
            name: step.name,
            description: step.description || '',
            order: step.order || index,
            assigneeType: step.assigneeType || 'any',
            createdAt: new Date()
          })
          .returning()
          .execute(client as any);

        return createdStep;
      }));

      await client.commit();

      return {
        ...template,
        steps
      };
    } catch (error) {
      await client.rollback();
      console.error('Error creating workflow template:', error);
      throw error;
    }
  }

  /**
   * Get a workflow template by ID
   * 
   * @param templateId Template ID
   * @returns The workflow template with steps
   */
  async getWorkflowTemplate(templateId: number) {
    const template = await db
      .select()
      .from(schema.workflowTemplates)
      .where(eq(schema.workflowTemplates.id, templateId))
      .limit(1);
    
    if (template.length === 0) {
      return null;
    }
    
    const steps = await db
      .select()
      .from(schema.workflowTemplateSteps)
      .where(eq(schema.workflowTemplateSteps.templateId, templateId))
      .orderBy(schema.workflowTemplateSteps.order);
    
    return {
      ...template[0],
      steps
    };
  }

  /**
   * Create a workflow for a document
   * 
   * @param documentId Document ID
   * @param templateId Template ID
   * @param startedBy User who started the workflow
   * @param metadata Optional metadata
   * @returns The created workflow with approvals
   */
  async createWorkflow(documentId: number, templateId: number, startedBy: number, metadata: Record<string, any> = {}) {
    const client = await pgClient.begin();

    try {
      // Get the template with steps
      const template = await this.getWorkflowTemplate(templateId);
      
      if (!template) {
        throw new Error(`Workflow template ${templateId} not found`);
      }
      
      // Insert the workflow
      const [workflow] = await db
        .insert(schema.documentWorkflows)
        .values({
          documentId,
          templateId,
          status: 'in_progress',
          startedBy,
          startedAt: new Date(),
          metadata: metadata || {},
          updatedAt: new Date()
        })
        .returning()
        .execute(client as any);
      
      // Insert approvals for each step
      const approvals = await Promise.all(template.steps.map(async (step: any, index: number) => {
        const [approval] = await db
          .insert(schema.workflowApprovals)
          .values({
            workflowId: workflow.id,
            stepId: step.id,
            status: index === 0 ? 'pending' : 'not_started',
            order: step.order,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning()
          .execute(client as any);
        
        return approval;
      }));
      
      // Add audit log entry
      await db
        .insert(schema.workflowAuditLogs)
        .values({
          workflowId: workflow.id,
          action: 'workflow_started',
          userId: startedBy,
          details: {
            documentId,
            templateId,
            templateName: template.name
          },
          createdAt: new Date()
        })
        .execute(client as any);
      
      await client.commit();
      
      return {
        ...workflow,
        approvals
      };
    } catch (error) {
      await client.rollback();
      console.error('Error creating workflow:', error);
      throw error;
    }
  }

  /**
   * Get workflows for a document
   * 
   * @param documentId Document ID
   * @returns List of workflows
   */
  async getDocumentWorkflows(documentId: number) {
    // Get workflows
    const workflows = await db
      .select()
      .from(schema.documentWorkflows)
      .where(eq(schema.documentWorkflows.documentId, documentId))
      .orderBy(desc(schema.documentWorkflows.startedAt));
    
    if (workflows.length === 0) {
      return [];
    }
    
    // Get all workflow IDs
    const workflowIds = workflows.map(w => w.id);
    
    // Get approvals for all workflows
    const approvals = await db
      .select()
      .from(schema.workflowApprovals)
      .where(inArray(schema.workflowApprovals.workflowId, workflowIds))
      .orderBy(schema.workflowApprovals.order);
    
    // Get templates
    const templateIds = [...new Set(workflows.map(w => w.templateId))];
    const templates = await db
      .select()
      .from(schema.workflowTemplates)
      .where(inArray(schema.workflowTemplates.id, templateIds));
    
    // Get template steps
    const allStepIds = approvals.map(a => a.stepId);
    const steps = allStepIds.length > 0 
      ? await db
          .select()
          .from(schema.workflowTemplateSteps)
          .where(inArray(schema.workflowTemplateSteps.id, allStepIds))
      : [];
    
    // Organize results
    return workflows.map(workflow => {
      const workflowApprovals = approvals
        .filter(a => a.workflowId === workflow.id)
        .map(approval => {
          const step = steps.find(s => s.id === approval.stepId);
          return {
            ...approval,
            step
          };
        });
      
      const template = templates.find(t => t.id === workflow.templateId);
      
      return {
        ...workflow,
        template,
        approvals: workflowApprovals
      };
    });
  }

  /**
   * Get detailed workflow information
   * 
   * @param workflowId Workflow ID
   * @returns The workflow with approvals and audit logs
   */
  async getWorkflow(workflowId: number) {
    // Get workflow
    const workflows = await db
      .select()
      .from(schema.documentWorkflows)
      .where(eq(schema.documentWorkflows.id, workflowId))
      .limit(1);
    
    if (workflows.length === 0) {
      return null;
    }
    
    const workflow = workflows[0];
    
    // Get template
    const templates = await db
      .select()
      .from(schema.workflowTemplates)
      .where(eq(schema.workflowTemplates.id, workflow.templateId))
      .limit(1);
    
    const template = templates.length > 0 ? templates[0] : null;
    
    // Get approvals
    const approvals = await db
      .select()
      .from(schema.workflowApprovals)
      .where(eq(schema.workflowApprovals.workflowId, workflowId))
      .orderBy(schema.workflowApprovals.order);
    
    // Get steps for approvals
    const stepIds = approvals.map(a => a.stepId);
    const steps = stepIds.length > 0 
      ? await db
          .select()
          .from(schema.workflowTemplateSteps)
          .where(inArray(schema.workflowTemplateSteps.id, stepIds))
      : [];
    
    // Get audit logs
    const auditLogs = await db
      .select()
      .from(schema.workflowAuditLogs)
      .where(eq(schema.workflowAuditLogs.workflowId, workflowId))
      .orderBy(desc(schema.workflowAuditLogs.createdAt));
    
    // Organize results
    const approvalsWithSteps = approvals.map(approval => {
      const step = steps.find(s => s.id === approval.stepId);
      return {
        ...approval,
        step
      };
    });
    
    return {
      ...workflow,
      template,
      approvals: approvalsWithSteps,
      auditLogs
    };
  }

  /**
   * Approve a workflow step
   * 
   * @param approvalId Approval ID
   * @param userId User ID performing the approval
   * @param comments Optional approval comments
   * @returns The approval result
   */
  async approveStep(approvalId: number, userId: number, comments?: string) {
    const client = await pgClient.begin();

    try {
      // Get the approval
      const approvals = await db
        .select()
        .from(schema.workflowApprovals)
        .where(eq(schema.workflowApprovals.id, approvalId))
        .limit(1)
        .execute(client as any);
      
      if (approvals.length === 0) {
        throw new Error(`Approval ${approvalId} not found`);
      }
      
      const approval = approvals[0];
      
      // Can only approve if status is pending
      if (approval.status !== 'pending') {
        throw new Error(`Approval ${approvalId} is not pending`);
      }
      
      // Update the approval
      const [updatedApproval] = await db
        .update(schema.workflowApprovals)
        .set({
          status: 'approved',
          approvedBy: userId,
          approvedAt: new Date(),
          comments: comments || null,
          updatedAt: new Date()
        })
        .where(eq(schema.workflowApprovals.id, approvalId))
        .returning()
        .execute(client as any);
      
      // Get all approvals for this workflow to check overall status
      const workflowApprovals = await db
        .select()
        .from(schema.workflowApprovals)
        .where(eq(schema.workflowApprovals.workflowId, approval.workflowId))
        .orderBy(schema.workflowApprovals.order)
        .execute(client as any);
      
      // Get the workflow
      const [workflow] = await db
        .select()
        .from(schema.documentWorkflows)
        .where(eq(schema.documentWorkflows.id, approval.workflowId))
        .limit(1)
        .execute(client as any);
      
      // Update next approval to pending if there is one
      const currentIndex = workflowApprovals.findIndex(a => a.id === approvalId);
      const nextApproval = workflowApprovals[currentIndex + 1];
      
      if (nextApproval) {
        await db
          .update(schema.workflowApprovals)
          .set({
            status: 'pending',
            updatedAt: new Date()
          })
          .where(eq(schema.workflowApprovals.id, nextApproval.id))
          .execute(client as any);
      }
      
      // Check if all approvals are approved
      const allApproved = workflowApprovals.every(a => a.status === 'approved');
      
      // If all approved, update workflow status to completed
      if (allApproved) {
        await db
          .update(schema.documentWorkflows)
          .set({
            status: 'completed',
            completedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(schema.documentWorkflows.id, approval.workflowId))
          .execute(client as any);
      }
      
      // Add audit log entry
      await db
        .insert(schema.workflowAuditLogs)
        .values({
          workflowId: approval.workflowId,
          action: 'step_approved',
          userId,
          details: {
            approvalId,
            stepId: approval.stepId,
            comments
          },
          createdAt: new Date()
        })
        .execute(client as any);
      
      await client.commit();
      
      return {
        approval: updatedApproval,
        workflowStatus: allApproved ? 'completed' : 'in_progress',
        nextApproval: nextApproval || null
      };
    } catch (error) {
      await client.rollback();
      console.error('Error approving step:', error);
      throw error;
    }
  }

  /**
   * Reject a workflow step
   * 
   * @param approvalId Approval ID
   * @param userId User ID performing the rejection
   * @param comments Required rejection comments
   * @returns The rejection result
   */
  async rejectStep(approvalId: number, userId: number, comments: string) {
    if (!comments) {
      throw new Error('Comments are required for rejection');
    }
    
    const client = await pgClient.begin();

    try {
      // Get the approval
      const approvals = await db
        .select()
        .from(schema.workflowApprovals)
        .where(eq(schema.workflowApprovals.id, approvalId))
        .limit(1)
        .execute(client as any);
      
      if (approvals.length === 0) {
        throw new Error(`Approval ${approvalId} not found`);
      }
      
      const approval = approvals[0];
      
      // Can only reject if status is pending
      if (approval.status !== 'pending') {
        throw new Error(`Approval ${approvalId} is not pending`);
      }
      
      // Update the approval
      const [updatedApproval] = await db
        .update(schema.workflowApprovals)
        .set({
          status: 'rejected',
          rejectedBy: userId,
          rejectedAt: new Date(),
          comments,
          updatedAt: new Date()
        })
        .where(eq(schema.workflowApprovals.id, approvalId))
        .returning()
        .execute(client as any);
      
      // Update workflow status to rejected
      await db
        .update(schema.documentWorkflows)
        .set({
          status: 'rejected',
          updatedAt: new Date()
        })
        .where(eq(schema.documentWorkflows.id, approval.workflowId))
        .execute(client as any);
      
      // Add audit log entry
      await db
        .insert(schema.workflowAuditLogs)
        .values({
          workflowId: approval.workflowId,
          action: 'step_rejected',
          userId,
          details: {
            approvalId,
            stepId: approval.stepId,
            comments
          },
          createdAt: new Date()
        })
        .execute(client as any);
      
      await client.commit();
      
      return {
        approval: updatedApproval,
        workflowStatus: 'rejected'
      };
    } catch (error) {
      await client.rollback();
      console.error('Error rejecting step:', error);
      throw error;
    }
  }

  /**
   * Find pending approvals for a user
   * 
   * @param userId User ID
   * @returns Pending approvals with workflow information
   */
  async findUserPendingApprovals(userId: number) {
    // For a real implementation, this would incorporate role-based assignment logic
    // For now, we'll return all pending approvals where no specific assignee is set
    
    // Get all approvals with pending status
    const pendingApprovals = await db
      .select()
      .from(schema.workflowApprovals)
      .where(eq(schema.workflowApprovals.status, 'pending'))
      .orderBy(desc(schema.workflowApprovals.updatedAt));
    
    if (pendingApprovals.length === 0) {
      return [];
    }
    
    // Get all workflow IDs
    const workflowIds = [...new Set(pendingApprovals.map(a => a.workflowId))];
    
    // Get workflows
    const workflows = await db
      .select()
      .from(schema.documentWorkflows)
      .where(inArray(schema.documentWorkflows.id, workflowIds));
    
    // Get documents
    const documentIds = [...new Set(workflows.map(w => w.documentId))];
    const documents = await db
      .select()
      .from(schema.documents)
      .where(inArray(schema.documents.id, documentIds));
    
    // Get template steps
    const stepIds = pendingApprovals.map(a => a.stepId);
    const steps = await db
      .select()
      .from(schema.workflowTemplateSteps)
      .where(inArray(schema.workflowTemplateSteps.id, stepIds));
    
    // Get templates
    const templateIds = [...new Set(workflows.map(w => w.templateId))];
    const templates = await db
      .select()
      .from(schema.workflowTemplates)
      .where(inArray(schema.workflowTemplates.id, templateIds));
    
    // Combine results
    return pendingApprovals.map(approval => {
      const workflow = workflows.find(w => w.id === approval.workflowId);
      const document = documents.find(d => d.id === workflow.documentId);
      const step = steps.find(s => s.id === approval.stepId);
      const template = templates.find(t => t.id === workflow.templateId);
      
      return {
        approval,
        workflow,
        document,
        step,
        template
      };
    });
  }
}

export const workflowService = new WorkflowService();