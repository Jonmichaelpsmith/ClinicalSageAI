import { users, documentVersions } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { type User, type InsertUser, type DocumentVersion, type InsertDocumentVersion } from "@shared/schema";

const scryptAsync = promisify(scrypt);

// Password hashing functions
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(
  supplied: string,
  stored: string
): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Initialize PostgreSQL session store
const PostgresSessionStore = connectPg(session);

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  // Document version methods
  getDocumentVersions(userId: number): Promise<DocumentVersion[]>;
  getDocumentVersion(id: number): Promise<DocumentVersion | undefined>;
  createDocumentVersion(version: InsertDocumentVersion): Promise<DocumentVersion>;
  
  // Session store
  sessionStore: session.Store;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: await hashPassword(insertUser.password),
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Document version methods
  async getDocumentVersions(userId: number): Promise<DocumentVersion[]> {
    return db
      .select()
      .from(documentVersions)
      .where(eq(documentVersions.userId, userId))
      .orderBy(documentVersions.createdAt);
  }

  async getDocumentVersion(id: number): Promise<DocumentVersion | undefined> {
    const [version] = await db
      .select()
      .from(documentVersions)
      .where(eq(documentVersions.id, id));
    return version;
  }

  async createDocumentVersion(
    version: InsertDocumentVersion
  ): Promise<DocumentVersion> {
    const [doc] = await db
      .insert(documentVersions)
      .values(version)
      .returning();
    return doc;
  }
}

// Create and export the storage instance
export const storage = new DatabaseStorage();