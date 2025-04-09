import { pgTable, pgEnum, text, serial, integer, jsonb, timestamp, boolean, date, varchar, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// TABLES

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
    // embedding vector will be added later with pgvector extension
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

// Define relations for better TypeScript inference
export const csrReportsRelations = relations(csrReports, ({ many }) => ({
  details: many(csrDetails),
  segments: many(csrSegments),
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
  extractedEntities: true,
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
