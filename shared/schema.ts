import { pgTable, text, serial, timestamp, integer, jsonb, boolean, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

// Insert schemas
export const insertCsrReportSchema = createInsertSchema(csrReports);
export const insertCsrDetailSchema = createInsertSchema(csrDetails);
export const insertUserSchema = createInsertSchema(users);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type CsrReport = typeof csrReports.$inferSelect;
export type InsertCsrReport = z.infer<typeof insertCsrReportSchema>;
export type CsrDetail = typeof csrDetails.$inferSelect;
export type InsertCsrDetail = z.infer<typeof insertCsrDetailSchema>;