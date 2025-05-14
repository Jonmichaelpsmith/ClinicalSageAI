import { integer, pgEnum, pgTable, serial, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Module type enum
 * Defines the various modules that can integrate with the unified workflow system
 */
export const moduleTypeEnum = pgEnum('module_type', [
  'cmc_wizard',
  'ectd_coauthor',
  'med_device',
  'study_architect'
]);

/**
 * Document status enum
 * Defines the possible states of a document in the workflow system
 */
export const documentStatusEnum = pgEnum('document_status', [
  'draft',
  'in_review',
  'approved',
  'rejected',
  'archived'
]);

/**
 * Workflow status enum
 * Defines the possible states of a workflow
 */
export const workflowStatusEnum = pgEnum('workflow_status', [
  'draft',
  'in_review',
  'approved',
  'rejected',
  'on_hold'
]);

/**
 * Approval status enum
 * Defines the possible states of an approval step
 */
export const approvalStatusEnum = pgEnum('approval_status', [
  'pending',
  'in_progress',
  'approved',
  'rejected',
  'skipped'
]);

/**
 * Unified Documents Table
 * 
 * This table stores metadata for documents from various modules that
 * are registered with the unified workflow system.
 */
export const unifiedDocuments = pgTable('unified_documents', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  moduleType: moduleTypeEnum('module_type').notNull(),
  originalDocumentId: text('original_document_id').notNull(),
  title: text('title').notNull(),
  documentType: text('document_type').notNull(),
  status: documentStatusEnum('status').default('draft'),
  metadata: jsonb('metadata'),
  content: jsonb('content'),
  vaultFolderId: integer('vault_folder_id'),
  createdBy: integer('created_by').notNull(),
  updatedBy: integer('updated_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Unified documents insert schema
export const insertUnifiedDocumentSchema = createInsertSchema(unifiedDocuments)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  });

export type InsertUnifiedDocument = z.infer<typeof insertUnifiedDocumentSchema>;
export type UnifiedDocument = typeof unifiedDocuments.$inferSelect;

/**
 * Workflow Templates Table
 * 
 * This table stores templates for different workflow processes.
 * Templates define the approval steps required for different document types.
 */
export const workflowTemplates = pgTable('workflow_templates', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  moduleType: moduleTypeEnum('module_type').notNull(),
  steps: jsonb('steps').notNull(), // Array of step objects with role, title, description
  isActive: boolean('is_active').default(true),
  createdBy: integer('created_by').notNull(),
  updatedBy: integer('updated_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Workflow templates insert schema
export const insertWorkflowTemplateSchema = createInsertSchema(workflowTemplates)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  });

export type InsertWorkflowTemplate = z.infer<typeof insertWorkflowTemplateSchema>;
export type WorkflowTemplate = typeof workflowTemplates.$inferSelect;

/**
 * Document Workflows Table
 * 
 * This table tracks active workflows for documents.
 * A workflow represents an approval process that a document must go through.
 */
export const documentWorkflows = pgTable('document_workflows', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => unifiedDocuments.id),
  templateId: integer('template_id').notNull().references(() => workflowTemplates.id),
  status: workflowStatusEnum('status').default('draft'),
  currentStep: integer('current_step').default(0),
  metadata: jsonb('metadata'),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  createdBy: integer('created_by').notNull(),
  updatedBy: integer('updated_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Document workflows insert schema
export const insertDocumentWorkflowSchema = createInsertSchema(documentWorkflows)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  });

export type InsertDocumentWorkflow = z.infer<typeof insertDocumentWorkflowSchema>;
export type DocumentWorkflow = typeof documentWorkflows.$inferSelect;

/**
 * Document Workflow Approvals Table
 * 
 * This table stores information about individual approval steps within a workflow.
 * Each record represents a person's review/approval of a specific step.
 */
export const workflowApprovals = pgTable('workflow_approvals', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').notNull().references(() => documentWorkflows.id),
  stepIndex: integer('step_index').notNull(),
  assignedRole: text('assigned_role').notNull(),
  assignedTo: integer('assigned_to'),
  status: approvalStatusEnum('status').default('pending'),
  comments: text('comments'),
  completedBy: integer('completed_by'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Workflow approvals insert schema
export const insertWorkflowApprovalSchema = createInsertSchema(workflowApprovals)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  });

export type InsertWorkflowApproval = z.infer<typeof insertWorkflowApprovalSchema>;
export type WorkflowApproval = typeof workflowApprovals.$inferSelect;

/**
 * Document Workflow Audit Trail Table
 * 
 * This table maintains a complete audit trail of all actions taken
 * within document workflows for compliance and transparency.
 */
export const workflowAuditTrail = pgTable('workflow_audit_trail', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').notNull().references(() => documentWorkflows.id),
  actionType: text('action_type').notNull(), // e.g., 'workflow_started', 'step_approved', 'step_rejected'
  actionBy: integer('action_by').notNull(),
  actionDetails: jsonb('action_details'),
  timestamp: timestamp('timestamp').defaultNow().notNull()
});

// Workflow audit trail insert schema
export const insertWorkflowAuditTrailSchema = createInsertSchema(workflowAuditTrail)
  .omit({
    id: true,
    timestamp: true
  });

export type InsertWorkflowAuditTrail = z.infer<typeof insertWorkflowAuditTrailSchema>;
export type WorkflowAuditTrail = typeof workflowAuditTrail.$inferSelect;