/**
 * Shared Database Schema
 * 
 * This file defines the database schema for the application,
 * including all tables, relationships, and types.
 */
import { relations, InferSelectModel } from 'drizzle-orm';
import { 
  integer, pgTable, serial, text, timestamp, boolean, 
  uuid, json, unique, primaryKey, varchar
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Organizations (Tenants) Table
 * 
 * This is the root table for the multi-tenant system.
 * Each organization represents a separate tenant with isolated data.
 */
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  domain: text('domain'),
  logo: text('logo'),
  settings: json('settings'),
  apiKey: text('api_key').unique(),
  tier: text('tier').default('standard').notNull(), // standard, professional, enterprise
  status: text('status').default('active').notNull(), // active, inactive, suspended
  maxUsers: integer('max_users').default(5),
  maxProjects: integer('max_projects').default(10),
  maxStorage: integer('max_storage').default(5), // in GB
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Organization Insert Schema
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Organization Types
export type Organization = InferSelectModel<typeof organizations>;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

/**
 * Users Table
 * 
 * Represents users in the system.
 * Each user belongs to one or more organizations.
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  title: text('title'),
  department: text('department'),
  avatar: text('avatar'),
  bio: text('bio'),
  status: text('status').default('active').notNull(), // active, inactive, suspended
  lastLogin: timestamp('last_login'),
  defaultOrganizationId: integer('default_organization_id').references(() => organizations.id),
  preferences: json('preferences'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User Insert Schema
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// User Types
export type User = InferSelectModel<typeof users>;
export type InsertUser = z.infer<typeof insertUserSchema>;

/**
 * Organization Users (Junction Table)
 * 
 * Maps users to organizations with role information.
 */
export const organizationUsers = pgTable('organization_users', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  userId: integer('user_id').notNull().references(() => users.id),
  role: text('role').default('member').notNull(), // admin, manager, member, viewer
  permissions: json('permissions'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    uniqueUserOrg: unique('unique_user_org').on(table.userId, table.organizationId),
  };
});

// Organization User Insert Schema
export const insertOrganizationUserSchema = createInsertSchema(organizationUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Organization User Types
export type OrganizationUser = InferSelectModel<typeof organizationUsers>;
export type InsertOrganizationUser = z.infer<typeof insertOrganizationUserSchema>;

/**
 * CER Projects Table
 * 
 * Stores CER (Clinical Evaluation Report) projects.
 * Each project belongs to an organization (tenant).
 */
export const cerProjects = pgTable('cer_projects', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  deviceName: text('device_name').notNull(),
  deviceManufacturer: text('device_manufacturer').notNull(),
  deviceType: text('device_type'),
  deviceClass: text('device_class'),
  regulatoryContext: text('regulatory_context'), // MDR, IVDR, FDA, etc.
  description: text('description'),
  status: text('status').default('draft').notNull(), // draft, in-progress, review, approved, published
  version: text('version').default('1.0.0'),
  createdById: integer('created_by_id').references(() => users.id),
  assignedToId: integer('assigned_to_id').references(() => users.id),
  dueDate: timestamp('due_date'),
  startDate: timestamp('start_date'),
  completionDate: timestamp('completion_date'),
  reviewDate: timestamp('review_date'),
  qmpId: integer('qmp_id'), // Reference to Quality Management Plan
  settings: json('settings'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// CER Project Insert Schema
export const insertCerProjectSchema = createInsertSchema(cerProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// CER Project Types
export type CerProject = InferSelectModel<typeof cerProjects>;
export type InsertCerProject = z.infer<typeof insertCerProjectSchema>;

/**
 * Project Documents Table
 * 
 * Stores document references for CER projects with VAULT integration hooks.
 */
export const projectDocuments = pgTable('project_documents', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  projectId: integer('project_id').notNull().references(() => cerProjects.id),
  vaultDocumentId: uuid('vault_document_id'), // Reference to document in VAULT
  name: text('name').notNull(),
  type: text('type').notNull(), // protocol, report, publication, etc.
  category: text('category'), // literature, clinical-investigation, post-market, etc.
  status: text('status').default('draft').notNull(), // draft, in-review, approved, published
  version: text('version').default('1.0.0'),
  filePath: text('file_path'),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  checksum: text('checksum'),
  uploadedById: integer('uploaded_by_id').references(() => users.id),
  metaData: json('meta_data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Project Document Insert Schema
export const insertProjectDocumentSchema = createInsertSchema(projectDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Project Document Types
export type ProjectDocument = InferSelectModel<typeof projectDocuments>;
export type InsertProjectDocument = z.infer<typeof insertProjectDocumentSchema>;

/**
 * Project Activities Table
 * 
 * Tracks activities and changes within a CER project for audit trail purposes.
 */
export const projectActivities = pgTable('project_activities', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  projectId: integer('project_id').notNull().references(() => cerProjects.id),
  userId: integer('user_id').references(() => users.id),
  activityType: text('activity_type').notNull(), // create, update, delete, review, approve, etc.
  entityType: text('entity_type').notNull(), // project, document, section, etc.
  entityId: text('entity_id').notNull(), // ID of the entity affected
  description: text('description').notNull(),
  details: json('details'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Project Activity Insert Schema
export const insertProjectActivitySchema = createInsertSchema(projectActivities).omit({
  id: true,
  createdAt: true
});

// Project Activity Types
export type ProjectActivity = InferSelectModel<typeof projectActivities>;
export type InsertProjectActivity = z.infer<typeof insertProjectActivitySchema>;

/**
 * Project Milestones Table
 * 
 * Tracks important milestones and deadlines for CER projects.
 */
export const projectMilestones = pgTable('project_milestones', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  projectId: integer('project_id').notNull().references(() => cerProjects.id),
  name: text('name').notNull(),
  description: text('description'),
  dueDate: timestamp('due_date').notNull(),
  completedAt: timestamp('completed_at'),
  completedById: integer('completed_by_id').references(() => users.id),
  status: text('status').default('pending').notNull(), // pending, in-progress, completed, missed
  priority: text('priority').default('medium').notNull(), // low, medium, high, critical
  notifyDays: integer('notify_days').default(7), // Days before due date to send notification
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Project Milestone Insert Schema
export const insertProjectMilestoneSchema = createInsertSchema(projectMilestones).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Project Milestone Types
export type ProjectMilestone = InferSelectModel<typeof projectMilestones>;
export type InsertProjectMilestone = z.infer<typeof insertProjectMilestoneSchema>;

/**
 * Client User Permissions Table
 * 
 * Defines fine-grained permissions for users on specific projects.
 */
export const clientUserPermissions = pgTable('client_user_permissions', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  userId: integer('user_id').notNull().references(() => users.id),
  projectId: integer('project_id').references(() => cerProjects.id),
  // If projectId is null, permissions apply to all projects in the organization
  permissions: json('permissions').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    uniqueUserProject: unique('unique_user_project').on(table.userId, table.projectId),
  };
});

// Client User Permission Insert Schema
export const insertClientUserPermissionSchema = createInsertSchema(clientUserPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Client User Permission Types
export type ClientUserPermission = InferSelectModel<typeof clientUserPermissions>;
export type InsertClientUserPermission = z.infer<typeof insertClientUserPermissionSchema>;

// Define table relationships
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(organizationUsers),
  projects: many(cerProjects),
}));

export const usersRelations = relations(users, ({ many }) => ({
  organizations: many(organizationUsers),
  permissions: many(clientUserPermissions),
}));

export const cerProjectsRelations = relations(cerProjects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [cerProjects.organizationId],
    references: [organizations.id],
  }),
  documents: many(projectDocuments),
  activities: many(projectActivities),
  milestones: many(projectMilestones),
  approvals: many(cerApprovals),
}));

export const projectDocumentsRelations = relations(projectDocuments, ({ one }) => ({
  project: one(cerProjects, {
    fields: [projectDocuments.projectId],
    references: [cerProjects.id],
  }),
  organization: one(organizations, {
    fields: [projectDocuments.organizationId],
    references: [organizations.id],
  }),
}));

export const projectActivitiesRelations = relations(projectActivities, ({ one }) => ({
  project: one(cerProjects, {
    fields: [projectActivities.projectId],
    references: [cerProjects.id],
  }),
  organization: one(organizations, {
    fields: [projectActivities.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [projectActivities.userId],
    references: [users.id],
  }),
}));

/**
 * CER Approvals Table
 * 
 * Tracks approval workflow for CER documents and sections.
 */
export const cerApprovals = pgTable('cer_approvals', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  projectId: integer('project_id').notNull().references(() => cerProjects.id),
  documentId: integer('document_id').references(() => projectDocuments.id),
  sectionKey: text('section_key'),
  approvalType: text('approval_type').notNull(), // document, section, project
  status: text('status').default('pending').notNull(), // pending, approved, rejected
  requestedById: integer('requested_by_id').references(() => users.id),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  approvedById: integer('approved_by_id').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  rejectedById: integer('rejected_by_id').references(() => users.id),
  rejectedAt: timestamp('rejected_at'),
  comments: text('comments'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// CER Approval Insert Schema
export const insertCerApprovalSchema = createInsertSchema(cerApprovals).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// CER Approval Types
export type CerApproval = InferSelectModel<typeof cerApprovals>;
export type InsertCerApproval = z.infer<typeof insertCerApprovalSchema>;

/**
 * CER Documents Table
 * 
 * Represents documents associated with CER projects.
 */
export const cerDocuments = pgTable('cer_documents', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  cerProjectId: integer('cer_project_id').notNull().references(() => cerProjects.id),
  documentType: text('document_type').notNull(),
  title: text('title').notNull(),
  version: text('version').notNull(),
  status: text('status').notNull(),
  content: json('content'),
  metadata: json('metadata'),
  createdById: integer('created_by_id').references(() => users.id),
  updatedById: integer('updated_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// CER Document Insert Schema
export const insertCerDocumentSchema = createInsertSchema(cerDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// CER Document Types
export type CerDocument = InferSelectModel<typeof cerDocuments>;
export type InsertCerDocument = z.infer<typeof insertCerDocumentSchema>;

// CER Approvals Relations
export const cerApprovalsRelations = relations(cerApprovals, ({ one }) => ({
  organization: one(organizations, {
    fields: [cerApprovals.organizationId],
    references: [organizations.id],
  }),
  project: one(cerProjects, {
    fields: [cerApprovals.projectId],
    references: [cerProjects.id],
  }),
  document: one(cerDocuments, {
    fields: [cerApprovals.documentId],
    references: [cerDocuments.id],
  }),
  requestedBy: one(users, {
    fields: [cerApprovals.requestedById],
    references: [users.id],
  }),
  approvedBy: one(users, {
    fields: [cerApprovals.approvedById],
    references: [users.id],
  }),
  rejectedBy: one(users, {
    fields: [cerApprovals.rejectedById],
    references: [users.id],
  }),
}));

/**
 * Quality Management Plans Table
 * 
 * Stores quality management plans with tenant context.
 * Each QMP is associated with an organization and optionally a CER project.
 */
export const qualityManagementPlans = pgTable('quality_management_plans', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  description: text('description'),
  version: text('version').default('1.0.0').notNull(),
  status: text('status').default('draft').notNull(), // draft, active, retired
  approvedById: integer('approved_by_id').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  effectiveDate: timestamp('effective_date'),
  expiryDate: timestamp('expiry_date'),
  reviewFrequencyDays: integer('review_frequency_days').default(365),
  lastReviewDate: timestamp('last_review_date'),
  nextReviewDate: timestamp('next_review_date'),
  reviewReminderDays: integer('review_reminder_days').default(30),
  createdById: integer('created_by_id').references(() => users.id),
  settings: json('settings'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// QMP Insert Schema
export const insertQualityManagementPlanSchema = createInsertSchema(qualityManagementPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// QMP Types
export type QualityManagementPlan = InferSelectModel<typeof qualityManagementPlans>;
export type InsertQualityManagementPlan = z.infer<typeof insertQualityManagementPlanSchema>;

/**
 * QMP Audit Trail Table
 * 
 * Tracks changes to quality management plans for compliance and audit purposes.
 */
export const qmpAuditTrail = pgTable('qmp_audit_trail', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  qmpId: integer('qmp_id').notNull().references(() => qualityManagementPlans.id),
  userId: integer('user_id').references(() => users.id),
  actionType: text('action_type').notNull(), // create, update, approve, review, retire
  entityType: text('entity_type').notNull(), // qmp, ctq_factor, section_gate, etc.
  entityId: text('entity_id').notNull(),
  description: text('description').notNull(),
  previousState: json('previous_state'),
  newState: json('new_state'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// QMP Audit Trail Insert Schema
export const insertQmpAuditTrailSchema = createInsertSchema(qmpAuditTrail).omit({
  id: true,
  createdAt: true
});

// QMP Audit Trail Types
export type QmpAuditTrail = InferSelectModel<typeof qmpAuditTrail>;
export type InsertQmpAuditTrail = z.infer<typeof insertQmpAuditTrailSchema>;

/**
 * CTQ (Critical-to-Quality) Factors Table
 * 
 * Stores critical quality factors with risk-based categorization.
 */
export const ctqFactors = pgTable('ctq_factors', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  qmpId: integer('qmp_id').notNull().references(() => qualityManagementPlans.id),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // safety, efficacy, regulatory, clinical, etc.
  riskLevel: text('risk_level').notNull(), // high, medium, low
  applicableSection: text('applicable_section'), // benefit-risk, safety, equivalence, etc.
  validationCriteria: text('validation_criteria'),
  validationMethod: text('validation_method'),
  status: text('status').default('active').notNull(), // active, inactive
  requiresEvidenceType: text('requires_evidence_type'), // document, data, attestation, etc.
  requirementType: text('requirement_type').default('mandatory').notNull(), // mandatory, recommended, optional
  failureAction: text('failure_action').default('block').notNull(), // block, warning, notify
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// CTQ Factor Insert Schema
export const insertCtqFactorSchema = createInsertSchema(ctqFactors).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// CTQ Factor Types
export type CtqFactor = InferSelectModel<typeof ctqFactors>;
export type InsertCtqFactor = z.infer<typeof insertCtqFactorSchema>;

/**
 * QMP Section Gating Table
 * 
 * Controls which CTQ factors are required for each CER section.
 */
export const qmpSectionGating = pgTable('qmp_section_gating', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  qmpId: integer('qmp_id').notNull().references(() => qualityManagementPlans.id),
  sectionKey: text('section_key').notNull(), // benefit-risk, safety, equivalence, etc.
  sectionName: text('section_name').notNull(),
  requiredCtqFactorIds: json('required_ctq_factor_ids').notNull(), // Array of CTQ factor IDs
  minimumMandatoryCompletion: integer('minimum_mandatory_completion').default(100), // Percentage
  minimumRecommendedCompletion: integer('minimum_recommended_completion').default(80), // Percentage
  allowOverride: boolean('allow_override').default(false),
  overrideRequiresApproval: boolean('override_requires_approval').default(true),
  overrideRequiresReason: boolean('override_requires_reason').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// QMP Section Gating Insert Schema
export const insertQmpSectionGatingSchema = createInsertSchema(qmpSectionGating).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// QMP Section Gating Types
export type QmpSectionGating = InferSelectModel<typeof qmpSectionGating>;
export type InsertQmpSectionGating = z.infer<typeof insertQmpSectionGatingSchema>;

/**
 * QMP Traceability Matrix Table
 * 
 * Maps quality requirements to implementation evidence for traceability.
 */
export const qmpTraceabilityMatrix = pgTable('qmp_traceability_matrix', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  qmpId: integer('qmp_id').notNull().references(() => qualityManagementPlans.id),
  ctqFactorId: integer('ctq_factor_id').references(() => ctqFactors.id),
  requirementId: text('requirement_id').notNull(), // Unique ID for the requirement
  requirementText: text('requirement_text').notNull(),
  requirementSource: text('requirement_source'), // Regulation, standard, guidance, etc.
  verificationMethod: text('verification_method'), // Review, test, inspection, analysis
  implementationEvidence: json('implementation_evidence'), // References to documents, data, etc.
  verificationStatus: text('verification_status').default('pending').notNull(), // pending, verified, failed
  verifiedById: integer('verified_by_id').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// QMP Traceability Matrix Insert Schema
export const insertQmpTraceabilityMatrixSchema = createInsertSchema(qmpTraceabilityMatrix).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// QMP Traceability Matrix Types
export type QmpTraceabilityMatrix = InferSelectModel<typeof qmpTraceabilityMatrix>;
export type InsertQmpTraceabilityMatrix = z.infer<typeof insertQmpTraceabilityMatrixSchema>;

// Additional relations for QMP tables
export const qualityManagementPlansRelations = relations(qualityManagementPlans, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [qualityManagementPlans.organizationId],
    references: [organizations.id],
  }),
  ctqFactors: many(ctqFactors),
  sectionGating: many(qmpSectionGating),
  auditTrail: many(qmpAuditTrail),
  traceabilityMatrix: many(qmpTraceabilityMatrix),
}));

export const ctqFactorsRelations = relations(ctqFactors, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [ctqFactors.organizationId],
    references: [organizations.id],
  }),
  qmp: one(qualityManagementPlans, {
    fields: [ctqFactors.qmpId],
    references: [qualityManagementPlans.id],
  }),
  traceabilityItems: many(qmpTraceabilityMatrix),
}));

// Update CER Projects relations to include QMP reference
export const cerProjectsQmpRelation = relations(cerProjects, ({ one }) => ({
  qmp: one(qualityManagementPlans, {
    fields: [cerProjects.qmpId],
    references: [qualityManagementPlans.id],
  }),
}));

/**
 * Document Folder Table
 * 
 * Represents a folder in the document management system.
 */
export const documentFolders = pgTable('document_folders', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  description: text('description'),
  parentId: integer('parent_id').references(() => documentFolders.id),
  path: text('path'),
  createdById: integer('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Document Folder Insert Schema
export const insertDocumentFolderSchema = createInsertSchema(documentFolders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Document Folder Types
export type DocumentFolder = InferSelectModel<typeof documentFolders>;
export type InsertDocumentFolder = z.infer<typeof insertDocumentFolderSchema>;

/**
 * Documents Table
 * 
 * Represents a document in the system.
 */
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  folderId: integer('folder_id').references(() => documentFolders.id),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // report, protocol, publication, etc.
  status: text('status').default('draft').notNull(), // draft, review, approved, published
  version: text('version').default('1.0.0'),
  fileName: text('file_name'),
  fileType: text('file_type'),
  fileSize: integer('file_size'),
  filePath: text('file_path'),
  content: json('content'),
  metadata: json('metadata'),
  tags: text('tags').array(),
  createdById: integer('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Document Insert Schema
export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Document Types
export type Document = InferSelectModel<typeof documents>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;