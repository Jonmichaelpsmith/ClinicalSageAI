/**
 * Workflow Service
 * 
 * This service handles workflow management, including templates, workflows,
 * and approval steps.
 */

import { z } from 'zod';
import { db, pgClient } from '../db/connection';
import * as schema from '../../shared/schema/unified_workflow';
import { eq, and, inArray, desc, sql } from 'drizzle-orm';

// Define validation schemas
export const workflowTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  organizationId: z.number(),
  moduleType: z.string(),
  steps: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      order: z.number(),
      assigneeType: z.string().optional(),
      reviewerGroups: z.array(z.number()).optional()
    })
  ),
  createdBy: z.number(),
  isDefault: z.boolean().optional().default(false)
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
    return db
      .select()
      .from(schema.workflowTemplates)
      .where(
        and(
          eq(schema.workflowTemplates.organizationId, organizationId),
          eq(schema.workflowTemplates.moduleType, moduleType)
        )
      )
      .orderBy(schema.workflowTemplates.name);
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
        .execute(tx);

      // Insert the steps
      const steps = await Promise.all(templateData.steps.map(async (step, index) => {
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
          .execute(tx);

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
      .limit(1)
      .then(res => res[0] || null);

    if (!template) {
      return null;
    }

    const steps = await db
      .select()
      .from(schema.workflowTemplateSteps)
      .where(eq(schema.workflowTemplateSteps.templateId, templateId))
      .orderBy(schema.workflowTemplateSteps.order);

    return {
      ...template,
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
      // First, get the template with steps
      const template = await this.getWorkflowTemplate(templateId);
      if (!template) {
        throw new Error(`Workflow template with ID ${templateId} not found`);
      }

      // Create the workflow
      const [workflow] = await db
        .insert(schema.documentWorkflows)
        .values({
          documentId,
          templateId,
          status: 'in_progress',
          startedBy,
          metadata: metadata || {},
          startedAt: new Date(),
          updatedAt: new Date()
        })
        .returning()
        .execute(tx);

      // Create approval steps based on template steps
      const approvals = await Promise.all(template.steps.map(async (step, index) => {
        const isFirst = index === 0;

        const [approval] = await db
          .insert(schema.workflowApprovals)
          .values({
            workflowId: workflow.id,
            stepId: step.id,
            status: isFirst ? 'pending' : 'waiting',
            order: step.order,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning()
          .execute(tx);

        return approval;
      }));

      await client.commit();

      return {
        ...workflow,
        template,
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
    const workflows = await db
      .select()
      .from(schema.documentWorkflows)
      .where(eq(schema.documentWorkflows.documentId, documentId))
      .orderBy(desc(schema.documentWorkflows.startedAt));

    if (!workflows.length) {
      return [];
    }

    // Get templates for these workflows
    const templateIds = workflows.map(w => w.templateId);
    const templates = await db
      .select()
      .from(schema.workflowTemplates)
      .where(inArray(schema.workflowTemplates.id, templateIds));

    const templatesById = templates.reduce((acc, t) => {
      acc[t.id] = t;
      return acc;
    }, {});

    // Get workflow approvals
    const workflowIds = workflows.map(w => w.id);
    const approvals = await db
      .select()
      .from(schema.workflowApprovals)
      .where(inArray(schema.workflowApprovals.workflowId, workflowIds));

    // Group approvals by workflow
    const approvalsByWorkflow = approvals.reduce((acc, a) => {
      if (!acc[a.workflowId]) {
        acc[a.workflowId] = [];
      }
      acc[a.workflowId].push(a);
      return acc;
    }, {});

    // Combine data
    return workflows.map(workflow => ({
      ...workflow,
      template: templatesById[workflow.templateId] || null,
      approvals: approvalsByWorkflow[workflow.id] || []
    }));
  }

  /**
   * Get detailed workflow information
   * 
   * @param workflowId Workflow ID
   * @returns The workflow with approvals and audit logs
   */
  async getWorkflow(workflowId: number) {
    const workflow = await db
      .select()
      .from(schema.documentWorkflows)
      .where(eq(schema.documentWorkflows.id, workflowId))
      .limit(1)
      .then(res => res[0] || null);

    if (!workflow) {
      return null;
    }

    // Get template
    const template = await this.getWorkflowTemplate(workflow.templateId);

    // Get approvals
    const approvals = await db
      .select()
      .from(schema.workflowApprovals)
      .where(eq(schema.workflowApprovals.workflowId, workflowId))
      .orderBy(schema.workflowApprovals.order);

    // Get document
    const document = await db
      .select()
      .from(schema.documents)
      .where(eq(schema.documents.id, workflow.documentId))
      .limit(1)
      .then(res => res[0] || null);

    // Get audit logs
    const auditLogs = await db
      .select()
      .from(schema.workflowAuditLogs)
      .where(eq(schema.workflowAuditLogs.workflowId, workflowId))
      .orderBy(desc(schema.workflowAuditLogs.createdAt));

    return {
      ...workflow,
      template,
      document,
      approvals,
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
      const approval = await db
        .select()
        .from(schema.workflowApprovals)
        .where(eq(schema.workflowApprovals.id, approvalId))
        .limit(1)
        .then(res => res[0]);

      if (!approval) {
        throw new Error(`Approval with ID ${approvalId} not found`);
      }

      if (approval.status !== 'pending') {
        throw new Error(`Approval is not in pending status (current: ${approval.status})`);
      }

      // Update the approval
      await db
        .update(schema.workflowApprovals)
        .set({
          status: 'approved',
          updatedAt: new Date(),
          approvedBy: userId,
          approvedAt: new Date(),
          comments: comments || null
        })
        .where(eq(schema.workflowApprovals.id, approvalId))
        .execute(tx);

      // Add audit log
      await db
        .insert(schema.workflowAuditLogs)
        .values({
          workflowId: approval.workflowId,
          action: 'step_approved',
          userId,
          details: {
            approvalId,
            comments: comments || null
          },
          createdAt: new Date()
        })
        .execute(tx);

      // Get workflow to check for completion
      const workflow = await db
        .select()
        .from(schema.documentWorkflows)
        .where(eq(schema.documentWorkflows.id, approval.workflowId))
        .limit(1)
        .then(res => res[0]);

      // Find the next step if not the last one
      const nextApproval = await db
        .select()
        .from(schema.workflowApprovals)
        .where(
          and(
            eq(schema.workflowApprovals.workflowId, approval.workflowId),
            eq(schema.workflowApprovals.status, 'waiting')
          )
        )
        .orderBy(schema.workflowApprovals.order)
        .limit(1)
        .then(res => res[0] || null);

      // If there's a next step, set it to pending
      if (nextApproval) {
        await db
          .update(schema.workflowApprovals)
          .set({
            status: 'pending',
            updatedAt: new Date()
          })
          .where(eq(schema.workflowApprovals.id, nextApproval.id))
          .execute(tx);
      } else {
        // If no next step, mark workflow as completed
        await db
          .update(schema.documentWorkflows)
          .set({
            status: 'completed',
            completedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(schema.documentWorkflows.id, approval.workflowId))
          .execute(tx);

        // Add completion audit log
        await db
          .insert(schema.workflowAuditLogs)
          .values({
            workflowId: approval.workflowId,
            action: 'workflow_completed',
            userId,
            details: {},
            createdAt: new Date()
          })
          .execute(tx);
      }

      await client.commit();

      return {
        success: true,
        nextStep: nextApproval,
        workflowCompleted: !nextApproval
      };
    } catch (error) {
      await client.rollback();
      console.error('Error approving workflow step:', error);
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
      throw new Error('Comments are required when rejecting a workflow step');
    }

    const client = await pgClient.begin();

    try {
      // Get the approval
      const approval = await db
        .select()
        .from(schema.workflowApprovals)
        .where(eq(schema.workflowApprovals.id, approvalId))
        .limit(1)
        .then(res => res[0]);

      if (!approval) {
        throw new Error(`Approval with ID ${approvalId} not found`);
      }

      if (approval.status !== 'pending') {
        throw new Error(`Approval is not in pending status (current: ${approval.status})`);
      }

      // Update the approval
      await db
        .update(schema.workflowApprovals)
        .set({
          status: 'rejected',
          updatedAt: new Date(),
          rejectedBy: userId,
          rejectedAt: new Date(),
          comments
        })
        .where(eq(schema.workflowApprovals.id, approvalId))
        .execute(tx);

      // Add audit log
      await db
        .insert(schema.workflowAuditLogs)
        .values({
          workflowId: approval.workflowId,
          action: 'step_rejected',
          userId,
          details: {
            approvalId,
            comments
          },
          createdAt: new Date()
        })
        .execute(tx);

      // Mark workflow as rejected
      await db
        .update(schema.documentWorkflows)
        .set({
          status: 'rejected',
          updatedAt: new Date()
        })
        .where(eq(schema.documentWorkflows.id, approval.workflowId))
        .execute(tx);

      await client.commit();

      return {
        success: true
      };
    } catch (error) {
      await client.rollback();
      console.error('Error rejecting workflow step:', error);
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
    // In a real implementation, this would check user roles, groups, etc.
    // For now, we'll assume all pending approvals are visible to the user
    
    const pendingApprovals = await db
      .select()
      .from(schema.workflowApprovals)
      .where(eq(schema.workflowApprovals.status, 'pending'))
      .orderBy(schema.workflowApprovals.createdAt);

    if (!pendingApprovals.length) {
      return [];
    }

    // Get workflows for these approvals
    const workflowIds = new Set(pendingApprovals.map(a => a.workflowId));
    const workflows = await db
      .select()
      .from(schema.documentWorkflows)
      .where(inArray(schema.documentWorkflows.id, [...workflowIds]));

    const workflowsById = workflows.reduce((acc, w) => {
      acc[w.id] = w;
      return acc;
    }, {});

    // Get documents for these workflows
    const documentIds = workflows.map(w => w.documentId);
    const documents = await db
      .select()
      .from(schema.documents)
      .where(inArray(schema.documents.id, documentIds));

    const documentsById = documents.reduce((acc, d) => {
      acc[d.id] = d;
      return acc;
    }, {});

    // Get templates
    const templateIds = workflows.map(w => w.templateId);
    const templates = await db
      .select()
      .from(schema.workflowTemplates)
      .where(inArray(schema.workflowTemplates.id, templateIds));

    const templatesById = templates.reduce((acc, t) => {
      acc[t.id] = t;
      return acc;
    }, {});

    // Get template steps for context
    const stepIds = pendingApprovals.map(a => a.stepId);
    const steps = await db
      .select()
      .from(schema.workflowTemplateSteps)
      .where(inArray(schema.workflowTemplateSteps.id, stepIds));

    const stepsById = steps.reduce((acc, s) => {
      acc[s.id] = s;
      return acc;
    }, {});

    // Combine data
    return pendingApprovals.map(approval => {
      const workflow = workflowsById[approval.workflowId] || null;
      const document = workflow ? documentsById[workflow.documentId] || null : null;
      const template = workflow ? templatesById[workflow.templateId] || null : null;
      const step = stepsById[approval.stepId] || null;

      return {
        approval,
        workflow,
        document,
        template,
        step
      };
    });
  }
}

export const workflowService = new WorkflowService();