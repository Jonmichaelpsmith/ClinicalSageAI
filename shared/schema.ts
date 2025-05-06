import { pgTable, text, serial, timestamp, integer, jsonb, boolean, varchar, uuid } from "drizzle-orm/pg-core";
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
export const documentTypes = pgTable("document_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  category: varchar("category", { length: 50 }),
  templateId: varchar("template_id", { length: 50 }),
  mimeTypes: jsonb("mime_types").default([]),
});

// Document Folders schema
export const documentFolders = pgTable("document_folders", {
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
export const documents = pgTable("documents", {
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
export const documentShares = pgTable("document_shares", {
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
export const documentAuditLogs = pgTable("document_audit_logs", {
  id: serial("id").primaryKey(),
  documentId: uuid("document_id"),  // Reference will be set up in relations
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").defaultNow(),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
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