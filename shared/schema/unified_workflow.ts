/**
 * Unified Document Workflow System Schema
 * 
 * This file defines the schema for the unified document workflow system that
 * integrates across different modules (CMC Wizard, TrialSage Vault, Study Architect,
 * eCTD Co-author, and Medical Device and Diagnostics RA).
 */
import { relations, InferSelectModel } from 'drizzle-orm';
import { 
  pgTable, uuid, varchar, text, timestamp, integer, boolean, jsonb
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Import references to existing tables
import { documents } from '../schema';
import { users } from '../schema';

/**
 * Module Documents - Links documents from specific modules to the unified system
 */
export const moduleDocuments = pgTable('module_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: integer('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  moduleType: varchar('module_type', { length: 50 }).notNull(),
  moduleDocumentId: varchar('module_document_id', { length: 100 }).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Workflow Templates - Defines the structure and steps of workflows
 */
export const workflowTemplates = pgTable('workflow_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  moduleType: varchar('module_type', { length: 50 }).notNull(),
  steps: jsonb('steps').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Document Workflows - Active workflow instances for documents
 */
export const documentWorkflows = pgTable('document_workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: integer('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  workflowTemplateId: uuid('workflow_template_id').references(() => workflowTemplates.id),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  currentStep: integer('current_step').default(0),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  initiatedBy: integer('initiated_by').references(() => users.id),
  data: jsonb('data'),
});

/**
 * Workflow Approvals - Individual approval steps in a workflow
 */
export const workflowApprovals = pgTable('workflow_approvals', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id').notNull().references(() => documentWorkflows.id, { onDelete: 'cascade' }),
  stepIndex: integer('step_index').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  assignedRole: varchar('assigned_role', { length: 50 }).notNull(),
  assignedTo: integer('assigned_to').references(() => users.id),
  completedBy: integer('completed_by').references(() => users.id),
  completedAt: timestamp('completed_at'),
  comments: text('comments'),
  signatureData: text('signature_data'),
});

/**
 * Document Relationships - Tracks relationships between documents
 */
export const documentRelationships = pgTable('document_relationships', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceDocumentId: integer('source_document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  targetDocumentId: integer('target_document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  relationshipType: varchar('relationship_type', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  data: jsonb('data'),
});

// Define insert schemas
export const insertModuleDocumentSchema = createInsertSchema(moduleDocuments)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertWorkflowTemplateSchema = createInsertSchema(workflowTemplates)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertDocumentWorkflowSchema = createInsertSchema(documentWorkflows)
  .omit({ id: true, startedAt: true, completedAt: true });

export const insertWorkflowApprovalSchema = createInsertSchema(workflowApprovals)
  .omit({ id: true, completedAt: true });

export const insertDocumentRelationshipSchema = createInsertSchema(documentRelationships)
  .omit({ id: true, createdAt: true });

// Define types
export type ModuleDocument = InferSelectModel<typeof moduleDocuments>;
export type InsertModuleDocument = z.infer<typeof insertModuleDocumentSchema>;

export type WorkflowTemplate = InferSelectModel<typeof workflowTemplates>;
export type InsertWorkflowTemplate = z.infer<typeof insertWorkflowTemplateSchema>;

export type DocumentWorkflow = InferSelectModel<typeof documentWorkflows>;
export type InsertDocumentWorkflow = z.infer<typeof insertDocumentWorkflowSchema>;

export type WorkflowApproval = InferSelectModel<typeof workflowApprovals>;
export type InsertWorkflowApproval = z.infer<typeof insertWorkflowApprovalSchema>;

export type DocumentRelationship = InferSelectModel<typeof documentRelationships>;
export type InsertDocumentRelationship = z.infer<typeof insertDocumentRelationshipSchema>;

// Define step type for workflow templates
export const workflowStepSchema = z.object({
  role: z.string(),
  title: z.string(),
  description: z.string().optional(),
  assignTo: z.number().optional(),
  requireSignature: z.boolean().default(false),
});

export type WorkflowStep = z.infer<typeof workflowStepSchema>;

// Define table relationships
export const moduleDocumentsRelations = relations(moduleDocuments, ({ one }) => ({
  document: one(documents, {
    fields: [moduleDocuments.documentId],
    references: [documents.id],
  }),
}));

export const documentWorkflowsRelations = relations(documentWorkflows, ({ one, many }) => ({
  document: one(documents, {
    fields: [documentWorkflows.documentId],
    references: [documents.id],
  }),
  template: one(workflowTemplates, {
    fields: [documentWorkflows.workflowTemplateId],
    references: [workflowTemplates.id],
  }),
  approvals: many(workflowApprovals),
  initiator: one(users, {
    fields: [documentWorkflows.initiatedBy],
    references: [users.id],
  }),
}));

export const workflowApprovalsRelations = relations(workflowApprovals, ({ one }) => ({
  workflow: one(documentWorkflows, {
    fields: [workflowApprovals.workflowId],
    references: [documentWorkflows.id],
  }),
  assignee: one(users, {
    fields: [workflowApprovals.assignedTo],
    references: [users.id],
  }),
  completer: one(users, {
    fields: [workflowApprovals.completedBy],
    references: [users.id],
  }),
}));

export const documentRelationshipsRelations = relations(documentRelationships, ({ one }) => ({
  sourceDocument: one(documents, {
    fields: [documentRelationships.sourceDocumentId],
    references: [documents.id],
  }),
  targetDocument: one(documents, {
    fields: [documentRelationships.targetDocumentId],
    references: [documents.id],
  }),
}));

// Export all schema components
export const unifiedWorkflowSchema = {
  moduleDocuments,
  workflowTemplates,
  documentWorkflows,
  workflowApprovals,
  documentRelationships,
};