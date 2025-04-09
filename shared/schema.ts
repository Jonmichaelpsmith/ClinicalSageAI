import { pgTable, text, serial, integer, jsonb, timestamp, boolean, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// CSR (Clinical Study Report) schema
export const csrReports = pgTable("csr_reports", {
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
});

export const insertCsrReportSchema = createInsertSchema(csrReports).pick({
  title: true,
  sponsor: true,
  indication: true,
  phase: true,
  fileName: true,
  fileSize: true,
});

export type InsertCsrReport = z.infer<typeof insertCsrReportSchema>;
export type CsrReport = typeof csrReports.$inferSelect;

// CSR Report Details schema (for extracted data from CSRs)
export const csrDetails = pgTable("csr_details", {
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
  processed: boolean("processed").default(false),
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
});

export type InsertCsrDetails = z.infer<typeof insertCsrDetailsSchema>;
export type CsrDetails = typeof csrDetails.$inferSelect;
