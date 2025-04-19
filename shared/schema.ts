import { pgTable, serial, text, timestamp, json, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  display_name: text("display_name"),
  can_edit: text("can_edit").default("true"),
  created_at: timestamp("created_at").defaultNow()
});

// Document model
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author_id: integer("author_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

// Document version model
export const documentVersions = pgTable("document_versions", {
  id: serial("id").primaryKey(),
  document_id: integer("document_id").references(() => documents.id).notNull(),
  content: json("content").notNull(),
  created_at: timestamp("created_at").defaultNow()
});

// Document comment model
export const documentComments = pgTable("document_comments", {
  id: serial("id").primaryKey(),
  document_id: integer("document_id").references(() => documents.id).notNull(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  position: text("position"), // Store position data within the doc
  created_at: timestamp("created_at").defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents)
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  author: one(users, {
    fields: [documents.author_id],
    references: [users.id]
  }),
  versions: many(documentVersions),
  comments: many(documentComments)
}));

export const documentVersionsRelations = relations(documentVersions, ({ one }) => ({
  document: one(documents, {
    fields: [documentVersions.document_id],
    references: [documents.id]
  })
}));

export const documentCommentsRelations = relations(documentComments, ({ one }) => ({
  document: one(documents, {
    fields: [documentComments.document_id],
    references: [documents.id]
  }),
  user: one(users, {
    fields: [documentComments.user_id],
    references: [users.id]
  })
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, created_at: true, updated_at: true });
export const insertDocumentVersionSchema = createInsertSchema(documentVersions).omit({ id: true, created_at: true });
export const insertDocumentCommentSchema = createInsertSchema(documentComments).omit({ id: true, created_at: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type DocumentVersion = typeof documentVersions.$inferSelect;
export type InsertDocumentVersion = z.infer<typeof insertDocumentVersionSchema>;

export type DocumentComment = typeof documentComments.$inferSelect;
export type InsertDocumentComment = z.infer<typeof insertDocumentCommentSchema>;