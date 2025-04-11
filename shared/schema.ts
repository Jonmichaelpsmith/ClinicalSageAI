import { pgTable, pgEnum, text, serial, integer, jsonb, timestamp, boolean, date, varchar, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// TABLES

// Chat message role enum
export const messageRoleEnum = pgEnum("message_role", ["user", "assistant", "system"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login"),
});

// CSR (Clinical Study Report) schema
export const csrReports = pgTable(
  "csr_reports", 
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    sponsor: text("sponsor").notNull(),
    indication: text("indication").notNull(),
    phase: text("phase").notNull(),
    status: text("status").notNull().default("Processing"),
    date: text("date"),
    uploadDate: timestamp("upload_date").notNull().defaultNow(),
    summary: text("summary"),
    fileName: text("file_name").notNull(),
    fileSize: integer("file_size").notNull(),
    filePath: text("file_path"),
    nctrialId: text("nctrial_id"),
    studyId: text("study_id"),
    drugName: text("drug_name"),
    region: text("region"),
    lastUpdated: timestamp("last_updated").defaultNow(),
    deletedAt: timestamp("deleted_at"),
  }
);

// CSR Report Details schema (for extracted data from CSRs)
export const csrDetails = pgTable(
  "csr_details", 
  {
    id: serial("id").primaryKey(),
    reportId: integer("report_id").notNull().references(() => csrReports.id, {
      onDelete: "cascade",
    }),
    studyDesign: text("study_design"),
    primaryObjective: text("primary_objective"),
    studyDescription: text("study_description"),
    inclusionCriteria: text("inclusion_criteria"),
    exclusionCriteria: text("exclusion_criteria"),
    treatmentArms: jsonb("treatment_arms"),
    studyDuration: text("study_duration"),
    endpoints: jsonb("endpoints"),
    results: jsonb("results"),
    safety: jsonb("safety"),
    processingStatus: text("processing_status").default("pending"),
    processed: boolean("processed").default(false),
    extractionDate: timestamp("extraction_date").defaultNow(),
    sampleSize: integer("sample_size"),
    ageRange: text("age_range"),
    gender: jsonb("gender_distribution"),
    statisticalMethods: jsonb("statistical_methods"),
    adverseEvents: jsonb("adverse_events"),
    efficacyResults: jsonb("efficacy_results"),
    saeCount: integer("sae_count"),
    teaeCount: integer("teae_count"),
    completionRate: numeric("completion_rate", { precision: 5, scale: 2 }),
    lastUpdated: timestamp("last_updated").defaultNow(),
  }
);

// Document segments for chunking large CSRs (helpful for efficient retrieval)
export const csrSegments = pgTable(
  "csr_segments",
  {
    id: serial("id").primaryKey(),
    reportId: integer("report_id").notNull().references(() => csrReports.id, {
      onDelete: "cascade",
    }),
    segmentNumber: integer("segment_number").notNull(),
    segmentType: text("segment_type").notNull(), // e.g., "methods", "results", "discussion"
    content: text("content").notNull(),
    pageNumbers: text("page_numbers"),
    // Embedding data stored as JSON
    embedding: jsonb("embedding"),
    extractedEntities: jsonb("extracted_entities"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  }
);

// Medical terms and taxonomies for standardization
export const medicalTerms = pgTable(
  "medical_terms",
  {
    id: serial("id").primaryKey(),
    term: text("term").notNull(),
    category: text("category").notNull(), // e.g., "condition", "drug", "endpoint"
    standardizedTerm: text("standardized_term"),
    taxonomyCode: text("taxonomy_code"),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// AI Research Assistant Chat Conversations
export const chatConversations = pgTable(
  "chat_conversations",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    title: text("title").notNull().default("New Conversation"),
    context: text("context"), // Any specific context for the conversation (e.g., report ID, indication)
    reportId: integer("report_id").references(() => csrReports.id),
    created: timestamp("created").defaultNow(),
    updated: timestamp("updated").defaultNow(),
    active: boolean("active").default(true),
  }
);

// Individual messages in chat conversations
export const chatMessages = pgTable(
  "chat_messages",
  {
    id: serial("id").primaryKey(),
    conversationId: integer("conversation_id").notNull().references(() => chatConversations.id, {
      onDelete: "cascade",
    }),
    role: messageRoleEnum("role").notNull(),
    content: text("content").notNull(),
    timestamp: timestamp("timestamp").defaultNow(),
    metadata: jsonb("metadata"), // Any additional data like referenced documents, tokens used, etc.
  }
);

// Define relations for better TypeScript inference
export const csrReportsRelations = relations(csrReports, ({ many }) => ({
  details: many(csrDetails),
  segments: many(csrSegments),
  conversations: many(chatConversations),
}));

export const csrDetailsRelations = relations(csrDetails, ({ one }) => ({
  report: one(csrReports, {
    fields: [csrDetails.reportId],
    references: [csrReports.id],
  }),
}));

export const csrSegmentsRelations = relations(csrSegments, ({ one }) => ({
  report: one(csrReports, {
    fields: [csrSegments.reportId],
    references: [csrReports.id],
  }),
}));

export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [chatConversations.userId],
    references: [users.id],
  }),
  report: one(csrReports, {
    fields: [chatConversations.reportId],
    references: [csrReports.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversationId],
    references: [chatConversations.id],
  }),
}));

// SCHEMAS

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
});

export const insertCsrReportSchema = createInsertSchema(csrReports).pick({
  title: true,
  sponsor: true,
  indication: true,
  phase: true,
  fileName: true,
  fileSize: true,
  filePath: true,
  nctrialId: true,
  studyId: true,
  drugName: true,
  region: true,
  date: true,
});

export const insertCsrDetailsSchema = createInsertSchema(csrDetails).pick({
  reportId: true,
  studyDesign: true,
  primaryObjective: true,
  studyDescription: true,
  inclusionCriteria: true,
  exclusionCriteria: true,
  treatmentArms: true,
  studyDuration: true,
  endpoints: true,
  results: true,
  safety: true,
  processed: true,
  processingStatus: true,
  sampleSize: true,
  ageRange: true,
  gender: true,
  statisticalMethods: true,
  adverseEvents: true,
  efficacyResults: true,
  saeCount: true,
  teaeCount: true,
  completionRate: true,
});

export const insertCsrSegmentSchema = createInsertSchema(csrSegments).pick({
  reportId: true,
  segmentNumber: true,
  segmentType: true,
  content: true,
  pageNumbers: true,
  embedding: true,
  extractedEntities: true,
});

export const insertChatConversationSchema = createInsertSchema(chatConversations).pick({
  userId: true,
  title: true,
  context: true,
  reportId: true,
  active: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  conversationId: true,
  role: true,
  content: true,
  metadata: true,
});

// TYPES

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCsrReport = z.infer<typeof insertCsrReportSchema>;
export type CsrReport = typeof csrReports.$inferSelect;

export type InsertCsrDetails = z.infer<typeof insertCsrDetailsSchema>;
export type CsrDetails = typeof csrDetails.$inferSelect;

export type InsertCsrSegment = z.infer<typeof insertCsrSegmentSchema>;
export type CsrSegment = typeof csrSegments.$inferSelect;

export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Academic Knowledge Base Tables
export const academicResources = pgTable('academic_resources', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  authors: text('authors').notNull().default('[]'), // JSON string of authors array
  publicationDate: text('publication_date').notNull(),
  source: text('source').notNull(), // pubmed, clinicaltrials.gov, manual_upload, etc.
  resourceType: text('resource_type').notNull(), // pdf, text, xml, json
  summary: text('summary'),
  topics: text('topics').notNull().default('[]'), // JSON string of topics array
  keywords: text('keywords').notNull().default('[]'), // JSON string of keywords array
  filePath: text('file_path').notNull(),
  fileSize: integer('file_size').notNull(),
  uploadDate: timestamp('upload_date').notNull().defaultNow(),
  lastAccessed: timestamp('last_accessed'),
  accessCount: integer('access_count').notNull().default(0)
});

export const academicEmbeddings = pgTable('academic_embeddings', {
  id: serial('id').primaryKey(),
  resourceId: integer('resource_id').notNull().references(() => academicResources.id),
  embedding: text('embedding').notNull() // JSON string of embedding vector
});

export const insertAcademicResourceSchema = createInsertSchema(academicResources).pick({
  title: true,
  authors: true,
  publicationDate: true,
  source: true,
  resourceType: true,
  summary: true,
  topics: true,
  keywords: true,
  filePath: true,
  fileSize: true,
  uploadDate: true,
  lastAccessed: true,
  accessCount: true
});

export const insertAcademicEmbeddingSchema = createInsertSchema(academicEmbeddings).pick({
  resourceId: true,
  embedding: true
});

export type InsertAcademicResource = z.infer<typeof insertAcademicResourceSchema>;
export type AcademicResource = typeof academicResources.$inferSelect;

export type InsertAcademicEmbedding = z.infer<typeof insertAcademicEmbeddingSchema>;
export type AcademicEmbedding = typeof academicEmbeddings.$inferSelect;

// Protocol schema for clinical trial protocols
export const protocols = pgTable('protocols', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  indication: text('indication').notNull(),
  phase: text('phase').notNull(),
  sponsorId: integer('sponsor_id').references(() => users.id),
  primaryEndpoints: jsonb('primary_endpoints').notNull(),
  secondaryEndpoints: jsonb('secondary_endpoints'),
  sampleSize: integer('sample_size'),
  durationWeeks: integer('duration_weeks'),
  controlType: text('control_type'),
  blinding: text('blinding'),
  status: text('status').notNull().default('draft'),
  createdById: integer('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  content: jsonb('content') // Full protocol content (sections, etc.)
});

// Strategic reports for protocols
export const strategicReports = pgTable('strategic_reports', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  protocolId: integer('protocol_id').references(() => protocols.id),
  generatedDate: text('generated_date').notNull(),
  indication: text('indication').notNull(),
  phase: text('phase').notNull(),
  executiveSummary: jsonb('executive_summary').notNull(),
  content: jsonb('content').notNull() // Full report content
});

// Define relations for protocols and strategic reports
export const protocolsRelations = relations(protocols, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [protocols.createdById],
    references: [users.id]
  }),
  sponsor: one(users, {
    fields: [protocols.sponsorId],
    references: [users.id]
  }),
  strategicReports: many(strategicReports)
}));

export const strategicReportsRelations = relations(strategicReports, ({ one }) => ({
  protocol: one(protocols, {
    fields: [strategicReports.protocolId],
    references: [protocols.id]
  })
}));

// Insert schemas for protocols and strategic reports
export const insertProtocolSchema = createInsertSchema(protocols).pick({
  title: true,
  indication: true,
  phase: true,
  sponsorId: true,
  primaryEndpoints: true,
  secondaryEndpoints: true,
  sampleSize: true,
  durationWeeks: true,
  controlType: true,
  blinding: true,
  status: true,
  createdById: true,
  content: true
});

export const insertStrategicReportSchema = createInsertSchema(strategicReports).pick({
  title: true,
  protocolId: true,
  generatedDate: true,
  indication: true,
  phase: true,
  executiveSummary: true,
  content: true
});

export type InsertProtocol = z.infer<typeof insertProtocolSchema>;
export type Protocol = typeof protocols.$inferSelect;

export type InsertStrategicReport = z.infer<typeof insertStrategicReportSchema>;
export type StrategicReport = typeof strategicReports.$inferSelect;