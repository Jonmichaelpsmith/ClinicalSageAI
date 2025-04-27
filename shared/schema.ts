import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create the insert schema for users
export const insertUserSchema = createInsertSchema(users).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address").optional(),
});

// Define the types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Define the projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull(), // Foreign key to users
  createdAt: timestamp("created_at").defaultNow(),
});

// Create the insert schema for projects
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

// Define the types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

// Define the documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  projectId: integer("project_id").notNull(), // Foreign key to projects
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create the insert schema for documents
export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Define the types
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;