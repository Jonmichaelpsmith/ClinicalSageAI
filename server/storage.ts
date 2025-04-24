/**
 * Storage Interface for TrialSage
 * 
 * Provides a unified storage interface with both in-memory and database implementations.
 * The system automatically falls back to in-memory storage if no database is available.
 */
import { createContextLogger } from './utils/logger';
import { pool, query, transaction } from './db';

const logger = createContextLogger({ module: 'storage' });

// Basic User type
export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  role: string;
  name: string;
  subscribed: boolean;
}

// Mock users for development
export const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    email: 'admin@trialsage.ai',
    role: 'admin',
    name: 'Admin User',
    subscribed: true
  },
  {
    id: 2,
    username: 'demo',
    password: 'demo123',
    email: 'demo@trialsage.ai',
    role: 'user',
    name: 'Demo User',
    subscribed: true
  }
];

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'id'>): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Trial methods
  getTrial(id: number): Promise<any | undefined>;
  getTrials(options?: { limit?: number; offset?: number; }): Promise<any[]>;
  createTrial(trial: any): Promise<any>;
  updateTrial(id: number, trialData: any): Promise<any | undefined>;
  deleteTrial(id: number): Promise<boolean>;
  
  // Document methods
  getDocument(id: number): Promise<any | undefined>;
  getDocuments(options?: { limit?: number; offset?: number; }): Promise<any[]>;
  createDocument(document: any): Promise<any>;
  updateDocument(id: number, documentData: any): Promise<any | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Health check
  healthCheck(): Promise<boolean>;
}

/**
 * In-memory storage implementation
 */
export class MemStorage implements IStorage {
  private users: User[] = [...mockUsers];
  private trials: any[] = [];
  private documents: any[] = [];
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }
  
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const id = this.users.length > 0 
      ? Math.max(...this.users.map(u => u.id)) + 1 
      : 1;
    
    const newUser = { id, ...userData };
    this.users.push(newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    
    this.users[index] = { ...this.users[index], ...userData };
    return this.users[index];
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const initialLength = this.users.length;
    this.users = this.users.filter(u => u.id !== id);
    return initialLength > this.users.length;
  }
  
  // Trial methods
  async getTrial(id: number): Promise<any | undefined> {
    return this.trials.find(t => t.id === id);
  }
  
  async getTrials(options: { limit?: number; offset?: number; } = {}): Promise<any[]> {
    const { limit = 10, offset = 0 } = options;
    return this.trials.slice(offset, offset + limit);
  }
  
  async createTrial(trial: any): Promise<any> {
    const id = this.trials.length > 0 
      ? Math.max(...this.trials.map(t => t.id)) + 1 
      : 1;
    
    const newTrial = { id, ...trial };
    this.trials.push(newTrial);
    return newTrial;
  }
  
  async updateTrial(id: number, trialData: any): Promise<any | undefined> {
    const index = this.trials.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    
    this.trials[index] = { ...this.trials[index], ...trialData };
    return this.trials[index];
  }
  
  async deleteTrial(id: number): Promise<boolean> {
    const initialLength = this.trials.length;
    this.trials = this.trials.filter(t => t.id !== id);
    return initialLength > this.trials.length;
  }
  
  // Document methods
  async getDocument(id: number): Promise<any | undefined> {
    return this.documents.find(d => d.id === id);
  }
  
  async getDocuments(options: { limit?: number; offset?: number; } = {}): Promise<any[]> {
    const { limit = 10, offset = 0 } = options;
    return this.documents.slice(offset, offset + limit);
  }
  
  async createDocument(document: any): Promise<any> {
    const id = this.documents.length > 0 
      ? Math.max(...this.documents.map(d => d.id)) + 1 
      : 1;
    
    const newDocument = { id, ...document };
    this.documents.push(newDocument);
    return newDocument;
  }
  
  async updateDocument(id: number, documentData: any): Promise<any | undefined> {
    const index = this.documents.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    
    this.documents[index] = { ...this.documents[index], ...documentData };
    return this.documents[index];
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    const initialLength = this.documents.length;
    this.documents = this.documents.filter(d => d.id !== id);
    return initialLength > this.documents.length;
  }
  
  // Health check
  async healthCheck(): Promise<boolean> {
    return true; // In-memory storage is always healthy
  }
}

/**
 * Database storage implementation
 */
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    if (!pool) return undefined;
    
    try {
      const result = await query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to get user', { id, error });
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!pool) return undefined;
    
    try {
      const result = await query('SELECT * FROM users WHERE username = $1', [username]);
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to get user by username', { username, error });
      return undefined;
    }
  }
  
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    if (!pool) {
      throw new Error('Database connection not available');
    }
    
    try {
      const { username, password, email, role, name, subscribed } = userData;
      const result = await query(
        'INSERT INTO users (username, password, email, role, name, subscribed) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [username, password, email, role, name, subscribed]
      );
      
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to create user', { userData, error });
      throw error;
    }
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    if (!pool) return undefined;
    
    try {
      // Build SET clause and values array
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      Object.entries(userData).forEach(([key, value]) => {
        if (key !== 'id') {
          setClauses.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });
      
      if (setClauses.length === 0) {
        return this.getUser(id);
      }
      
      values.push(id); // Add ID as the last parameter
      
      const result = await query(
        `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );
      
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to update user', { id, userData, error });
      return undefined;
    }
  }
  
  async deleteUser(id: number): Promise<boolean> {
    if (!pool) return false;
    
    try {
      const result = await query('DELETE FROM users WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      logger.error('Failed to delete user', { id, error });
      return false;
    }
  }
  
  // Trial methods
  async getTrial(id: number): Promise<any | undefined> {
    if (!pool) return undefined;
    
    try {
      const result = await query('SELECT * FROM trials WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to get trial', { id, error });
      return undefined;
    }
  }
  
  async getTrials(options: { limit?: number; offset?: number; } = {}): Promise<any[]> {
    if (!pool) return [];
    
    const { limit = 10, offset = 0 } = options;
    
    try {
      const result = await query(
        'SELECT * FROM trials ORDER BY id DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );
      
      return result.rows;
    } catch (error) {
      logger.error('Failed to get trials', { options, error });
      return [];
    }
  }
  
  async createTrial(trial: any): Promise<any> {
    if (!pool) {
      throw new Error('Database connection not available');
    }
    
    try {
      // Dynamically create INSERT statement based on trial object
      const columns = Object.keys(trial).filter(k => k !== 'id');
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const values = columns.map(col => trial[col]);
      
      const result = await query(
        `INSERT INTO trials (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to create trial', { trial, error });
      throw error;
    }
  }
  
  async updateTrial(id: number, trialData: any): Promise<any | undefined> {
    if (!pool) return undefined;
    
    try {
      // Build SET clause and values array
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      Object.entries(trialData).forEach(([key, value]) => {
        if (key !== 'id') {
          setClauses.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });
      
      if (setClauses.length === 0) {
        return this.getTrial(id);
      }
      
      values.push(id); // Add ID as the last parameter
      
      const result = await query(
        `UPDATE trials SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );
      
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to update trial', { id, trialData, error });
      return undefined;
    }
  }
  
  async deleteTrial(id: number): Promise<boolean> {
    if (!pool) return false;
    
    try {
      const result = await query('DELETE FROM trials WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      logger.error('Failed to delete trial', { id, error });
      return false;
    }
  }
  
  // Document methods
  async getDocument(id: number): Promise<any | undefined> {
    if (!pool) return undefined;
    
    try {
      const result = await query('SELECT * FROM documents WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to get document', { id, error });
      return undefined;
    }
  }
  
  async getDocuments(options: { limit?: number; offset?: number; } = {}): Promise<any[]> {
    if (!pool) return [];
    
    const { limit = 10, offset = 0 } = options;
    
    try {
      const result = await query(
        'SELECT * FROM documents ORDER BY id DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );
      
      return result.rows;
    } catch (error) {
      logger.error('Failed to get documents', { options, error });
      return [];
    }
  }
  
  async createDocument(document: any): Promise<any> {
    if (!pool) {
      throw new Error('Database connection not available');
    }
    
    try {
      // Dynamically create INSERT statement based on document object
      const columns = Object.keys(document).filter(k => k !== 'id');
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const values = columns.map(col => document[col]);
      
      const result = await query(
        `INSERT INTO documents (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to create document', { document, error });
      throw error;
    }
  }
  
  async updateDocument(id: number, documentData: any): Promise<any | undefined> {
    if (!pool) return undefined;
    
    try {
      // Build SET clause and values array
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      Object.entries(documentData).forEach(([key, value]) => {
        if (key !== 'id') {
          setClauses.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });
      
      if (setClauses.length === 0) {
        return this.getDocument(id);
      }
      
      values.push(id); // Add ID as the last parameter
      
      const result = await query(
        `UPDATE documents SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );
      
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to update document', { id, documentData, error });
      return undefined;
    }
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    if (!pool) return false;
    
    try {
      const result = await query('DELETE FROM documents WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      logger.error('Failed to delete document', { id, error });
      return false;
    }
  }
  
  // Health check
  async healthCheck(): Promise<boolean> {
    if (!pool) return false;
    
    try {
      const result = await query('SELECT 1');
      return result.rows.length > 0;
    } catch (error) {
      logger.error('Database health check failed', { error });
      return false;
    }
  }
}

// Determine which storage implementation to use based on database availability
let storage: IStorage;

if (pool) {
  logger.info('Using database storage implementation');
  storage = new DatabaseStorage();
} else {
  logger.warn('Database not available, using in-memory storage');
  storage = new MemStorage();
}

export { storage };