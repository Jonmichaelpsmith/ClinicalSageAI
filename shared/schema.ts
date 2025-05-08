import { pgTable, text, serial, timestamp, integer, jsonb, boolean, varchar, uuid, date, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// CSR Reports schema
export const csrReports = pgTable("csr_reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  sponsor: text("sponsor").notNull(),
  indication: text("indication").notNull(),
  phase: text("phase").notNull(),
  status: text("status").notNull().default("Completed"),
  date: timestamp("date"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  filePath: text("file_path"),
  nctrialId: text("nctrial_id").unique(),
  studyId: text("study_id"),
  drugName: text("drug_name"),
  region: text("region"),
  uploadDate: timestamp("upload_date").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// CSR Details schema
export const csrDetails = pgTable("csr_details", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull().references(() => csrReports.id),
  studyDesign: text("study_design"),
  primaryObjective: text("primary_objective"),
  studyDescription: text("study_description"),
  inclusionCriteria: text("inclusion_criteria"),
  exclusionCriteria: text("exclusion_criteria"),
  treatmentArms: jsonb("treatment_arms").default([]),
  studyDuration: text("study_duration"),
  endpoints: jsonb("endpoints").default([]),
  results: jsonb("results").default({}),
  safety: jsonb("safety").default({}),
  processed: boolean("processed").default(false),
  processingStatus: text("processing_status").default("pending"),
  sampleSize: integer("sample_size"),
  ageRange: text("age_range"),
  gender: jsonb("gender").default({}),
  statisticalMethods: jsonb("statistical_methods").default([]),
  adverseEvents: jsonb("adverse_events").default([]),
  efficacyResults: jsonb("efficacy_results").default({}),
  saeCount: integer("sae_count"),
  teaeCount: integer("teae_count"),
  completionRate: integer("completion_rate"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: text("password").notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  name: varchar("name", { length: 100 }),
  subscribed: boolean("subscribed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document Types
export const documentTypes = pgTable("vault_document_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  category: varchar("category", { length: 50 }),
  templateId: varchar("template_id", { length: 50 }),
  mimeTypes: jsonb("mime_types").default([]),
});

// Document Folders schema
export const documentFolders = pgTable("vault_document_folders", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  parentId: uuid("parent_id"),  // Reference will be set up in relations
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  path: text("path"),
  isSystem: boolean("is_system").default(false),
});

// Documents schema
export const documents = pgTable("vault_documents_v2", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  typeId: integer("type_id").references(() => documentTypes.id),
  category: varchar("category", { length: 100 }),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  description: text("description"),
  author: varchar("author", { length: 100 }),
  authorId: integer("author_id").references(() => users.id),
  tags: jsonb("tags").default([]),
  folderId: uuid("folder_id"),  // Reference will be set up in relations
  fileName: varchar("file_name", { length: 255 }),
  fileType: varchar("file_type", { length: 50 }),
  fileSize: integer("file_size"),
  filePath: text("file_path"),
  fileUrl: text("file_url"),
  content: jsonb("content"),
  metadata: jsonb("metadata").default({}),
  isLatest: boolean("is_latest").default(true),
  originalId: uuid("original_id"),  // Reference will be set up in relations
  checksum: varchar("checksum", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  modifiedAt: timestamp("modified_at").defaultNow(),
  accessCount: integer("access_count").default(0),
  downloadCount: integer("download_count").default(0),
  reviewStatus: varchar("review_status", { length: 50 }),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  expiresAt: timestamp("expires_at"),
});

// Document shares schema
export const documentShares = pgTable("vault_document_shares", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").notNull(),  // Reference will be set up in relations
  userId: integer("user_id").references(() => users.id),
  email: varchar("email", { length: 255 }),
  permissionLevel: varchar("permission_level", { length: 20 }).notNull(),
  token: varchar("token", { length: 255 }),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  accessCount: integer("access_count").default(0),
  lastAccessedAt: timestamp("last_accessed_at"),
});

// Document audit log
export const documentAuditLogs = pgTable("vault_document_audit_logs", {
  id: serial("id").primaryKey(),
  documentId: uuid("document_id"),  // Reference will be set up in relations
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").defaultNow(),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
});

// CER (Clinical Evaluation Report) schema
export const cerReports = pgTable("cer_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  deviceName: text("device_name").notNull(),
  deviceType: text("device_type").notNull(),
  manufacturer: text("manufacturer").notNull(),
  version: varchar("version", { length: 20 }).default("1.0.0"),
  status: varchar("status", { length: 20 }).default("draft"),
  regulatoryFramework: varchar("regulatory_framework", { length: 50 }).default("EU MDR"),
  intendedUse: text("intended_use"),
  classification: varchar("classification", { length: 50 }),
  uniiCode: varchar("unii_code", { length: 50 }),
  atcCode: varchar("atc_code", { length: 50 }),
  gmdnCode: varchar("gmdn_code", { length: 50 }),
  mechanismOfAction: text("mechanism_of_action"),
  templateId: varchar("template_id", { length: 50 }).default("eu-mdr"),
  complianceScore: jsonb("compliance_score").default({}),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  publishedAt: timestamp("published_at"),
  reviewStatus: varchar("review_status", { length: 50 }),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  documentId: uuid("document_id").references(() => documents.id),
});

// CER Sections schema
export const cerSections = pgTable("cer_sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => cerReports.id),
  title: text("title").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  content: text("content"),
  aiGenerated: boolean("ai_generated").default(true),
  wordCount: integer("word_count"),
  order: integer("order").notNull(),
  status: varchar("status", { length: 20 }).default("draft"),
  complianceScore: jsonb("compliance_score").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastReviewed: timestamp("last_reviewed"),
  metadata: jsonb("metadata").default({}),
});

// CER FAERS Data schema
export const cerFaersData = pgTable("cer_faers_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => cerReports.id),
  productName: varchar("product_name", { length: 255 }).notNull(),
  uniiCode: varchar("unii_code", { length: 50 }),
  substanceName: varchar("substance_name", { length: 255 }),
  atcCodes: jsonb("atc_codes").default([]),
  mechanismOfAction: jsonb("mechanism_of_action").default([]),
  pharmacologicalClass: jsonb("pharmacological_class").default([]),
  totalReports: integer("total_reports"),
  seriousReports: integer("serious_reports"),
  riskScore: integer("risk_score"),
  reportDates: jsonb("report_dates").default({}),
  eventsByType: jsonb("events_by_type").default({}),
  comparators: jsonb("comparators").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CER Literature schema
export const cerLiterature = pgTable("cer_literature", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => cerReports.id),
  title: text("title").notNull(),
  authors: text("authors"),
  publication: text("publication"),
  publicationDate: date("publication_date"),
  doi: varchar("doi", { length: 100 }),
  pmid: varchar("pmid", { length: 20 }),
  abstract: text("abstract"),
  fullText: text("full_text"),
  summary: text("summary"),
  relevanceScore: integer("relevance_score"),
  qualityScore: integer("quality_score"),
  outcomesSummary: text("outcomes_summary"),
  adverseEventsSummary: text("adverse_events_summary"),
  methodologySummary: text("methodology_summary"),
  sampleSize: integer("sample_size"),
  studyType: varchar("study_type", { length: 100 }),
  endpoints: jsonb("endpoints").default([]),
  metadata: jsonb("metadata").default({}),
  includedInReport: boolean("included_in_report").default(false),
  aiProcessed: boolean("ai_processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CER Compliance Checks schema
export const cerComplianceChecks = pgTable("cer_compliance_checks", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => cerReports.id),
  standard: varchar("standard", { length: 100 }).notNull(),
  checkDate: timestamp("check_date").defaultNow(),
  overallScore: integer("overall_score"),
  sectionScores: jsonb("section_scores").default({}),
  recommendations: jsonb("recommendations").default([]),
  missingElements: jsonb("missing_elements").default([]),
  warningElements: jsonb("warning_elements").default([]),
  status: varchar("status", { length: 20 }).default("pending"),
  remediationStatus: varchar("remediation_status", { length: 20 }).default("not_started"),
  autoFixesApplied: boolean("auto_fixes_applied").default(false),
  fixesLog: jsonb("fixes_log").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CER Workflows schema
export const cerWorkflows = pgTable("cer_workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => cerReports.id),
  status: varchar("status", { length: 20 }).default("in_progress"),
  currentStep: varchar("current_step", { length: 50 }),
  progress: integer("progress").default(0),
  steps: jsonb("steps").default([]),
  logs: jsonb("logs").default([]),
  metadata: jsonb("metadata").default({}),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  estimatedCompletion: timestamp("estimated_completion"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// CER Export history schema
export const cerExports = pgTable("cer_exports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => cerReports.id),
  exportType: varchar("export_type", { length: 20 }).notNull(), // pdf, docx
  filename: varchar("filename", { length: 255 }).notNull(),
  filePath: text("file_path"),
  fileSize: integer("file_size"),
  exportedAt: timestamp("exported_at").defaultNow(),
  exportedBy: integer("exported_by").references(() => users.id),
  version: varchar("version", { length: 20 }),
  checksum: varchar("checksum", { length: 255 }),
  settings: jsonb("settings").default({}),
  status: varchar("status", { length: 20 }).default("complete"),
});

// Setup relations after all tables are defined
export const documentFoldersRelations = relations(documentFolders, ({ one, many }) => ({
  parentFolder: one(documentFolders, {
    fields: [documentFolders.parentId],
    references: [documentFolders.id],
    relationName: "folder_to_parent",
  }),
  childFolders: many(documentFolders, {
    relationName: "folder_to_parent"
  }),
  documents: many(documents),
  creator: one(users, {
    fields: [documentFolders.createdBy],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  folder: one(documentFolders, {
    fields: [documents.folderId],
    references: [documentFolders.id],
  }),
  originalDocument: one(documents, {
    fields: [documents.originalId],
    references: [documents.id],
    relationName: "document_versions",
  }),
  versions: many(documents, {
    relationName: "document_versions",
  }),
  docType: one(documentTypes, {
    fields: [documents.typeId],
    references: [documentTypes.id],
  }),
  author: one(users, {
    fields: [documents.authorId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [documents.reviewedBy],
    references: [users.id],
  }),
  shares: many(documentShares),
  auditLogs: many(documentAuditLogs),
}));

export const documentSharesRelations = relations(documentShares, ({ one }) => ({
  document: one(documents, {
    fields: [documentShares.documentId],
    references: [documents.id],
  }),
  user: one(users, {
    fields: [documentShares.userId],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [documentShares.createdBy],
    references: [users.id],
  }),
}));

export const documentAuditLogsRelations = relations(documentAuditLogs, ({ one }) => ({
  document: one(documents, {
    fields: [documentAuditLogs.documentId],
    references: [documents.id],
  }),
  user: one(users, {
    fields: [documentAuditLogs.userId],
    references: [users.id],
  }),
}));

// CER Relations
export const cerReportsRelations = relations(cerReports, ({ one, many }) => ({
  document: one(documents, {
    fields: [cerReports.documentId],
    references: [documents.id],
  }),
  author: one(users, {
    fields: [cerReports.authorId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [cerReports.reviewedBy],
    references: [users.id],
  }),
  sections: many(cerSections),
  faersData: many(cerFaersData),
  literatures: many(cerLiterature),
  complianceChecks: many(cerComplianceChecks),
  workflows: many(cerWorkflows),
  exports: many(cerExports),
}));

export const cerSectionsRelations = relations(cerSections, ({ one }) => ({
  report: one(cerReports, {
    fields: [cerSections.reportId],
    references: [cerReports.id],
  }),
}));

export const cerFaersDataRelations = relations(cerFaersData, ({ one }) => ({
  report: one(cerReports, {
    fields: [cerFaersData.reportId],
    references: [cerReports.id],
  }),
}));

export const cerLiteratureRelations = relations(cerLiterature, ({ one }) => ({
  report: one(cerReports, {
    fields: [cerLiterature.reportId],
    references: [cerReports.id],
  }),
}));

export const cerComplianceChecksRelations = relations(cerComplianceChecks, ({ one }) => ({
  report: one(cerReports, {
    fields: [cerComplianceChecks.reportId],
    references: [cerReports.id],
  }),
}));

export const cerWorkflowsRelations = relations(cerWorkflows, ({ one }) => ({
  report: one(cerReports, {
    fields: [cerWorkflows.reportId],
    references: [cerReports.id],
  }),
}));

export const cerExportsRelations = relations(cerExports, ({ one }) => ({
  report: one(cerReports, {
    fields: [cerExports.reportId],
    references: [cerReports.id],
  }),
  exportedByUser: one(users, {
    fields: [cerExports.exportedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertCsrReportSchema = createInsertSchema(csrReports);
export const insertCsrDetailSchema = createInsertSchema(csrDetails);
export const insertUserSchema = createInsertSchema(users);
export const insertDocumentTypeSchema = createInsertSchema(documentTypes, {
  id: z.number().optional(),
});
export const insertDocumentFolderSchema = createInsertSchema(documentFolders, {
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  parentId: z.string().uuid().optional().nullable(),
});
export const insertDocumentSchema = createInsertSchema(documents, {
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  modifiedAt: z.date().optional(),
  originalId: z.string().uuid().optional().nullable(),
  folderId: z.string().uuid().optional().nullable(),
});
export const insertDocumentShareSchema = createInsertSchema(documentShares, {
  id: z.string().uuid().optional(),
  expiresAt: z.date().optional().nullable(),
  lastAccessedAt: z.date().optional().nullable(),
});
export const insertDocumentAuditLogSchema = createInsertSchema(documentAuditLogs, {
  id: z.number().optional(),
  documentId: z.string().uuid().optional().nullable(),
});

// CER Insert Schemas
export const insertCerReportSchema = createInsertSchema(cerReports, {
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  publishedAt: z.date().optional().nullable(),
  reviewedAt: z.date().optional().nullable(),
  reviewedBy: z.number().optional().nullable(),
  authorId: z.number().optional().nullable(),
  documentId: z.string().uuid().optional().nullable(),
});

export const insertCerSectionSchema = createInsertSchema(cerSections, {
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  lastReviewed: z.date().optional().nullable(),
  wordCount: z.number().optional(),
});

export const insertCerFaersDataSchema = createInsertSchema(cerFaersData, {
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertCerLiteratureSchema = createInsertSchema(cerLiterature, {
  id: z.string().uuid().optional(),
  publicationDate: z.date().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertCerComplianceCheckSchema = createInsertSchema(cerComplianceChecks, {
  id: z.string().uuid().optional(),
  checkDate: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertCerWorkflowSchema = createInsertSchema(cerWorkflows, {
  id: z.string().uuid().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional().nullable(),
  estimatedCompletion: z.date().optional().nullable(),
  lastUpdated: z.date().optional(),
});

export const insertCerExportSchema = createInsertSchema(cerExports, {
  id: z.string().uuid().optional(),
  exportedAt: z.date().optional(),
  exportedBy: z.number().optional().nullable(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type CsrReport = typeof csrReports.$inferSelect;
export type InsertCsrReport = z.infer<typeof insertCsrReportSchema>;
export type CsrDetail = typeof csrDetails.$inferSelect;
export type InsertCsrDetail = z.infer<typeof insertCsrDetailSchema>;

export type DocumentFolder = typeof documentFolders.$inferSelect;
export type InsertDocumentFolder = z.infer<typeof insertDocumentFolderSchema>;
export type DocumentType = typeof documentTypes.$inferSelect;
export type InsertDocumentType = z.infer<typeof insertDocumentTypeSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type DocumentShare = typeof documentShares.$inferSelect;
export type InsertDocumentShare = z.infer<typeof insertDocumentShareSchema>;
export type DocumentAuditLog = typeof documentAuditLogs.$inferSelect;
export type InsertDocumentAuditLog = z.infer<typeof insertDocumentAuditLogSchema>;

// CER Types
export type CerReport = typeof cerReports.$inferSelect;
export type InsertCerReport = z.infer<typeof insertCerReportSchema>;
export type CerSection = typeof cerSections.$inferSelect;
export type InsertCerSection = z.infer<typeof insertCerSectionSchema>;
export type CerFaersData = typeof cerFaersData.$inferSelect;
export type InsertCerFaersData = z.infer<typeof insertCerFaersDataSchema>;
export type CerLiterature = typeof cerLiterature.$inferSelect;
export type InsertCerLiterature = z.infer<typeof insertCerLiteratureSchema>;
export type CerComplianceCheck = typeof cerComplianceChecks.$inferSelect;
export type InsertCerComplianceCheck = z.infer<typeof insertCerComplianceCheckSchema>;
export type CerWorkflow = typeof cerWorkflows.$inferSelect;
export type InsertCerWorkflow = z.infer<typeof insertCerWorkflowSchema>;
export type CerExport = typeof cerExports.$inferSelect;
export type InsertCerExport = z.infer<typeof insertCerExportSchema>;

// ----------------------------------------------------------------------------
// Multi-client CER Project Management Schema
// ----------------------------------------------------------------------------

// Client organizations table
export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  contactName: text('contact_name'),
  contactEmail: text('contact_email'),
  phone: text('phone'),
  address: text('address'),
  logo: text('logo_url'),
  status: text('status').default('active'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// CER projects table
export const cerProjects = pgTable('cer_projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  clientId: integer('client_id').notNull().references(() => clients.id),
  deviceName: text('device_name').notNull(),
  deviceDescription: text('device_description'),
  deviceClass: text('device_class'),
  status: text('status').notNull().default('draft'),
  progress: integer('progress').default(0),
  regulatoryFrameworks: text('regulatory_frameworks').array(),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  assignedUsers: integer('assigned_users').array(),
  priority: text('priority').default('medium'),
  tags: text('tags').array(),
  templateId: text('template_id')
});

// CER project documents
export const cerProjectDocuments = pgTable('cer_project_documents', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => cerProjects.id),
  cerReportId: uuid('cer_report_id').references(() => cerReports.id),
  documentType: text('document_type').notNull(), // e.g., 'cer', 'literature', 'testing', etc.
  title: text('title').notNull(),
  version: text('version').default('1.0'),
  status: text('status').default('draft'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id),
  notes: text('notes'),
  documentId: uuid('document_id').references(() => documents.id),
}, (table) => {
  return {
    projectDocument: unique().on(table.projectId, table.documentType, table.version)
  }
});

// Project activities log
export const projectActivities = pgTable('project_activities', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => cerProjects.id),
  userId: integer('user_id').references(() => users.id),
  activityType: text('activity_type').notNull(), // e.g., 'create', 'update', 'review', etc.
  description: text('description').notNull(),
  metadata: jsonb('metadata').default({}),
  timestamp: timestamp('timestamp').defaultNow()
});

// Project timeline milestones
export const projectMilestones = pgTable('project_milestones', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => cerProjects.id),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: timestamp('due_date'),
  completedDate: timestamp('completed_date'),
  status: text('status').default('pending'),
  assignedTo: integer('assigned_to').references(() => users.id),
  notifyBefore: integer('notify_before'), // days before due date to send notification
  priority: text('priority').default('medium'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Client user permissions
export const clientUserPermissions = pgTable('client_user_permissions', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id),
  userId: integer('user_id').notNull().references(() => users.id),
  permission: text('permission').notNull(), // e.g., 'admin', 'editor', 'viewer'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    userClientPermission: unique().on(table.clientId, table.userId)
  }
});

// Set up relations
export const clientsRelations = relations(clients, ({ many }) => ({
  projects: many(cerProjects),
  permissions: many(clientUserPermissions)
}));

export const cerProjectsRelations = relations(cerProjects, ({ one, many }) => ({
  client: one(clients, {
    fields: [cerProjects.clientId],
    references: [clients.id]
  }),
  documents: many(cerProjectDocuments),
  activities: many(projectActivities),
  milestones: many(projectMilestones)
}));

export const cerProjectDocumentsRelations = relations(cerProjectDocuments, ({ one }) => ({
  project: one(cerProjects, {
    fields: [cerProjectDocuments.projectId],
    references: [cerProjects.id]
  }),
  cerReport: one(cerReports, {
    fields: [cerProjectDocuments.cerReportId],
    references: [cerReports.id]
  }),
  document: one(documents, {
    fields: [cerProjectDocuments.documentId],
    references: [documents.id]
  }),
  creator: one(users, {
    fields: [cerProjectDocuments.createdBy],
    references: [users.id]
  })
}));

export const projectActivitiesRelations = relations(projectActivities, ({ one }) => ({
  project: one(cerProjects, {
    fields: [projectActivities.projectId],
    references: [cerProjects.id]
  }),
  user: one(users, {
    fields: [projectActivities.userId],
    references: [users.id]
  })
}));

export const projectMilestonesRelations = relations(projectMilestones, ({ one }) => ({
  project: one(cerProjects, {
    fields: [projectMilestones.projectId],
    references: [cerProjects.id]
  }),
  assignee: one(users, {
    fields: [projectMilestones.assignedTo],
    references: [users.id]
  })
}));

export const clientUserPermissionsRelations = relations(clientUserPermissions, ({ one }) => ({
  client: one(clients, {
    fields: [clientUserPermissions.clientId],
    references: [clients.id]
  }),
  user: one(users, {
    fields: [clientUserPermissions.userId],
    references: [users.id]
  })
}));

// Create insert schemas for the new tables
export const insertClientSchema = createInsertSchema(clients);
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export const insertCerProjectSchema = createInsertSchema(cerProjects);
export type InsertCerProject = z.infer<typeof insertCerProjectSchema>;
export type CerProject = typeof cerProjects.$inferSelect;

export const insertCerProjectDocumentSchema = createInsertSchema(cerProjectDocuments);
export type InsertCerProjectDocument = z.infer<typeof insertCerProjectDocumentSchema>;
export type CerProjectDocument = typeof cerProjectDocuments.$inferSelect;

export const insertProjectActivitySchema = createInsertSchema(projectActivities);
export type InsertProjectActivity = z.infer<typeof insertProjectActivitySchema>;
export type ProjectActivity = typeof projectActivities.$inferSelect;

export const insertProjectMilestoneSchema = createInsertSchema(projectMilestones);
export type InsertProjectMilestone = z.infer<typeof insertProjectMilestoneSchema>;
export type ProjectMilestone = typeof projectMilestones.$inferSelect;

export const insertClientUserPermissionSchema = createInsertSchema(clientUserPermissions);
export type InsertClientUserPermission = z.infer<typeof insertClientUserPermissionSchema>;
export type ClientUserPermission = typeof clientUserPermissions.$inferSelect;