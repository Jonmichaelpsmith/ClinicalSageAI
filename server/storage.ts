import { db } from "./db";
import {
  users,
  documents,
  documentVersions,
  documentComments,
  insertUserSchema,
  insertDocumentSchema,
  insertDocumentVersionSchema,
  insertDocumentCommentSchema
} from "../shared/schema";
import { eq, desc } from "drizzle-orm";
import * as expressSession from "express-session";

// We'll use a memory store for now to get the app running
const MemoryStore = expressSession.MemoryStore;

export interface IStorage {
  // User operations
  createUser(user: typeof insertUserSchema._type): Promise<any>;
  getUser(id: number): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  
  // Document operations
  createDocument(document: typeof insertDocumentSchema._type): Promise<any>;
  getDocument(id: number): Promise<any>;
  getAllDocuments(): Promise<any[]>;
  updateDocument(id: number, content: any): Promise<any>;
  
  // Document Version operations
  createDocumentVersion(version: typeof insertDocumentVersionSchema._type): Promise<any>;
  getDocumentVersions(documentId: number): Promise<any[]>;
  
  // Document Comment operations
  createDocumentComment(comment: typeof insertDocumentCommentSchema._type): Promise<any>;
  getDocumentComments(documentId: number): Promise<any[]>;
  
  // Session store
  sessionStore: any; // Use any for now to avoid type errors
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Use a memory store for sessions to get things working
    this.sessionStore = new MemoryStore();
  }
  
  // User operations
  async createUser(user: typeof insertUserSchema._type) {
    const [newUser] = await db.insert(users)
      .values(user)
      .returning();
    
    return newUser;
  }
  
  async getUser(id: number) {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, id));
    
    return user;
  }
  
  async getUserByUsername(username: string) {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.username, username));
    
    return user;
  }
  
  // Document operations
  async createDocument(document: typeof insertDocumentSchema._type) {
    const [newDocument] = await db.insert(documents)
      .values(document)
      .returning();
    
    return newDocument;
  }
  
  async getDocument(id: number) {
    const [document] = await db.select()
      .from(documents)
      .where(eq(documents.id, id));
    
    return document;
  }
  
  async getAllDocuments() {
    const allDocuments = await db.select()
      .from(documents)
      .orderBy(desc(documents.updated_at));
    
    return allDocuments;
  }
  
  async updateDocument(id: number, content: any) {
    // First, create a version of the current document
    const [currentDoc] = await db.select({
      id: documents.id,
      content: documents.id
    })
    .from(documents)
    .where(eq(documents.id, id));
    
    if (currentDoc) {
      // Get latest version content
      const [latestVersion] = await db.select()
        .from(documentVersions)
        .where(eq(documentVersions.document_id, id))
        .orderBy(desc(documentVersions.created_at))
        .limit(1);
      
      if (latestVersion && latestVersion.content) {
        // Create a new version with current content
        await db.insert(documentVersions)
          .values({
            document_id: id,
            content: latestVersion.content
          });
      }
    }
    
    // Now update the document
    const [updatedDoc] = await db.update(documents)
      .set({ 
        updated_at: new Date()
      })
      .where(eq(documents.id, id))
      .returning();
    
    // Also insert a new document version with the new content
    const [newVersion] = await db.insert(documentVersions)
      .values({
        document_id: id,
        content: content
      })
      .returning();
    
    return {
      document: updatedDoc,
      version: newVersion
    };
  }
  
  // Document Version operations
  async createDocumentVersion(version: typeof insertDocumentVersionSchema._type) {
    const [newVersion] = await db.insert(documentVersions)
      .values(version)
      .returning();
    
    return newVersion;
  }
  
  async getDocumentVersions(documentId: number) {
    const versions = await db.select()
      .from(documentVersions)
      .where(eq(documentVersions.document_id, documentId))
      .orderBy(desc(documentVersions.created_at));
    
    return versions;
  }
  
  // Document Comment operations
  async createDocumentComment(comment: typeof insertDocumentCommentSchema._type) {
    const [newComment] = await db.insert(documentComments)
      .values(comment)
      .returning();
    
    return newComment;
  }
  
  async getDocumentComments(documentId: number) {
    const comments = await db.select()
      .from(documentComments)
      .where(eq(documentComments.document_id, documentId))
      .orderBy(desc(documentComments.created_at));
    
    return comments;
  }
}

export const storage = new DatabaseStorage();