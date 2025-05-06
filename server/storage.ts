/**
 * Storage Interface for TrialSage
 * 
 * Provides a unified storage interface with both in-memory and database implementations.
 * The system automatically falls back to in-memory storage if no database is available.
 */
import { createScopedLogger } from './utils/logger';
import { pool, query, transaction, db } from './db';
import { eq, desc, and, or, like, isNull, not } from 'drizzle-orm';
import * as schema from '../shared/schema';
import { generateUUID } from './utils/id-generator';

const logger = createScopedLogger('storage');

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
  getDocument(id: string): Promise<schema.Document | undefined>;
  getDocumentByName(name: string): Promise<schema.Document | undefined>;
  getDocuments(options?: { 
    limit?: number; 
    offset?: number;
    folderId?: string;
    status?: string;
    type?: string;
    search?: string;
  }): Promise<schema.Document[]>;
  createDocument(document: schema.InsertDocument): Promise<schema.Document>;
  updateDocument(id: string, documentData: Partial<schema.InsertDocument>): Promise<schema.Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;
  
  // Document folder methods
  getFolder(id: string): Promise<schema.DocumentFolder | undefined>;
  getFolders(options?: { parentId?: string | null }): Promise<schema.DocumentFolder[]>;
  createFolder(folder: schema.InsertDocumentFolder): Promise<schema.DocumentFolder>;
  updateFolder(id: string, folderData: Partial<schema.InsertDocumentFolder>): Promise<schema.DocumentFolder | undefined>;
  deleteFolder(id: string): Promise<boolean>;
  
  // CER Report methods
  getCerReport(id: string): Promise<schema.CerReport | undefined>;
  getCerReports(options?: { 
    limit?: number; 
    offset?: number;
    status?: string;
    deviceName?: string;
    search?: string;
  }): Promise<schema.CerReport[]>;
  createCerReport(cerReport: schema.InsertCerReport): Promise<schema.CerReport>;
  updateCerReport(id: string, reportData: Partial<schema.InsertCerReport>): Promise<schema.CerReport | undefined>;
  deleteCerReport(id: string): Promise<boolean>;
  
  // CER Section methods
  getCerSection(id: string): Promise<schema.CerSection | undefined>;
  getCerSections(reportId: string, options?: { orderBy?: string }): Promise<schema.CerSection[]>;
  createCerSection(section: schema.InsertCerSection): Promise<schema.CerSection>;
  updateCerSection(id: string, sectionData: Partial<schema.InsertCerSection>): Promise<schema.CerSection | undefined>;
  deleteCerSection(id: string): Promise<boolean>;

  // CER FAERS Data methods
  getCerFaersData(id: string): Promise<schema.CerFaersData | undefined>;
  getCerFaersDataByReportId(reportId: string): Promise<schema.CerFaersData[]>;
  createCerFaersData(faersData: schema.InsertCerFaersData): Promise<schema.CerFaersData>;
  updateCerFaersData(id: string, faersData: Partial<schema.InsertCerFaersData>): Promise<schema.CerFaersData | undefined>;
  
  // CER Literature methods
  getCerLiterature(id: string): Promise<schema.CerLiterature | undefined>;
  getCerLiteratureByReportId(reportId: string, options?: { 
    limit?: number; 
    offset?: number;
    relevanceThreshold?: number;
    includedOnly?: boolean;
  }): Promise<schema.CerLiterature[]>;
  createCerLiterature(literature: schema.InsertCerLiterature): Promise<schema.CerLiterature>;
  updateCerLiterature(id: string, literature: Partial<schema.InsertCerLiterature>): Promise<schema.CerLiterature | undefined>;
  
  // CER Compliance methods
  getCerComplianceCheck(id: string): Promise<schema.CerComplianceCheck | undefined>;
  getCerComplianceChecksByReportId(reportId: string): Promise<schema.CerComplianceCheck[]>;
  createCerComplianceCheck(check: schema.InsertCerComplianceCheck): Promise<schema.CerComplianceCheck>;
  updateCerComplianceCheck(id: string, check: Partial<schema.InsertCerComplianceCheck>): Promise<schema.CerComplianceCheck | undefined>;
  
  // CER Workflow methods
  getCerWorkflow(id: string): Promise<schema.CerWorkflow | undefined>;
  getCerWorkflowByReportId(reportId: string): Promise<schema.CerWorkflow | undefined>;
  createCerWorkflow(workflow: schema.InsertCerWorkflow): Promise<schema.CerWorkflow>;
  updateCerWorkflow(id: string, workflow: Partial<schema.InsertCerWorkflow>): Promise<schema.CerWorkflow | undefined>;
  
  // CER Export methods
  getCerExport(id: string): Promise<schema.CerExport | undefined>;
  getCerExportsByReportId(reportId: string): Promise<schema.CerExport[]>;
  createCerExport(export_: schema.InsertCerExport): Promise<schema.CerExport>;
  
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
  private folders: schema.DocumentFolder[] = [];
  private cerReports: schema.CerReport[] = [];
  private cerSections: schema.CerSection[] = [];
  private cerFaersData: schema.CerFaersData[] = [];
  private cerLiterature: schema.CerLiterature[] = [];
  private cerComplianceChecks: schema.CerComplianceCheck[] = [];
  private cerWorkflows: schema.CerWorkflow[] = [];
  private cerExports: schema.CerExport[] = [];
  
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
  async getDocument(id: string): Promise<schema.Document | undefined> {
    return this.documents.find(d => d.id === id) as schema.Document | undefined;
  }
  
  async getDocumentByName(name: string): Promise<schema.Document | undefined> {
    return this.documents.find(d => d.name === name) as schema.Document | undefined;
  }
  
  async getDocuments(options: { 
    limit?: number; 
    offset?: number;
    folderId?: string;
    status?: string;
    type?: string;
    search?: string;
  } = {}): Promise<schema.Document[]> {
    const { limit = 20, offset = 0, folderId, status, type, search } = options;
    
    // Filter documents based on provided criteria
    let result = this.documents as schema.Document[];
    
    if (folderId) {
      result = result.filter(d => d.folderId === folderId);
    }
    
    if (status) {
      result = result.filter(d => d.status === status);
    }
    
    if (type) {
      result = result.filter(d => d.type === type);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(d => 
        d.name.toLowerCase().includes(searchLower) || 
        (d.description && d.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort by modified date (descending)
    result = result.sort((a, b) => {
      const dateA = a.modifiedAt ? new Date(a.modifiedAt).getTime() : 0;
      const dateB = b.modifiedAt ? new Date(b.modifiedAt).getTime() : 0;
      return dateB - dateA;
    });
    
    return result.slice(offset, offset + limit);
  }
  
  async createDocument(document: schema.InsertDocument): Promise<schema.Document> {
    // Generate UUID for document
    const id = generateUUID();
    
    // Set timestamps if not provided
    const now = new Date();
    const newDocument = { 
      ...document,
      id,
      createdAt: document.createdAt || now,
      modifiedAt: document.modifiedAt || now,
      isLatest: true,
    } as schema.Document;
    
    this.documents.push(newDocument);
    return newDocument;
  }
  
  async updateDocument(id: string, documentData: Partial<schema.InsertDocument>): Promise<schema.Document | undefined> {
    const index = this.documents.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    
    // Update modified timestamp
    const now = new Date();
    this.documents[index] = { 
      ...this.documents[index], 
      ...documentData,
      modifiedAt: now
    };
    
    return this.documents[index] as schema.Document;
  }
  
  async deleteDocument(id: string): Promise<boolean> {
    const initialLength = this.documents.length;
    this.documents = this.documents.filter(d => d.id !== id);
    return initialLength > this.documents.length;
  }
  
  // Document folder methods
  async getFolder(id: string): Promise<schema.DocumentFolder | undefined> {
    return this.folders.find(f => f.id === id);
  }
  
  async getFolders(options: { parentId?: string | null } = {}): Promise<schema.DocumentFolder[]> {
    // If parentId is explicitly null, return root folders
    if (options.parentId === null) {
      return this.folders.filter(f => f.parentId === null);
    }
    
    // If parentId is specified, return child folders
    if (options.parentId) {
      return this.folders.filter(f => f.parentId === options.parentId);
    }
    
    // Return all folders if no filter specified
    return this.folders;
  }
  
  async createFolder(folderData: schema.InsertDocumentFolder): Promise<schema.DocumentFolder> {
    // Generate UUID for folder
    const id = generateUUID();
    
    // Set timestamps if not provided
    const now = new Date();
    const newFolder = { 
      ...folderData,
      id,
      createdAt: folderData.createdAt || now,
      updatedAt: folderData.updatedAt || now
    } as schema.DocumentFolder;
    
    this.folders.push(newFolder);
    return newFolder;
  }
  
  async updateFolder(id: string, folderData: Partial<schema.InsertDocumentFolder>): Promise<schema.DocumentFolder | undefined> {
    const index = this.folders.findIndex(f => f.id === id);
    if (index === -1) return undefined;
    
    // Update timestamp
    const now = new Date();
    this.folders[index] = { 
      ...this.folders[index], 
      ...folderData,
      updatedAt: now
    };
    
    return this.folders[index];
  }
  
  async deleteFolder(id: string): Promise<boolean> {
    const initialLength = this.folders.length;
    this.folders = this.folders.filter(f => f.id !== id);
    return initialLength > this.folders.length;
  }
  
  // CER Report methods
  async getCerReport(id: string): Promise<schema.CerReport | undefined> {
    return this.cerReports.find(r => r.id === id);
  }
  
  async getCerReports(options: { 
    limit?: number; 
    offset?: number;
    status?: string;
    deviceName?: string;
    search?: string;
  } = {}): Promise<schema.CerReport[]> {
    const { limit = 20, offset = 0, status, deviceName, search } = options;
    
    // Filter reports based on provided criteria
    let result = [...this.cerReports];
    
    if (status) {
      result = result.filter(r => r.status === status);
    }
    
    if (deviceName) {
      result = result.filter(r => r.deviceName.toLowerCase().includes(deviceName.toLowerCase()));
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(r => 
        r.title.toLowerCase().includes(searchLower) || 
        r.deviceName.toLowerCase().includes(searchLower) ||
        r.manufacturer.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by updatedAt date (descending)
    result = result.sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });
    
    return result.slice(offset, offset + limit);
  }
  
  async createCerReport(cerReport: schema.InsertCerReport): Promise<schema.CerReport> {
    // Generate UUID for report
    const id = generateUUID();
    
    // Set timestamps if not provided
    const now = new Date();
    const newReport = { 
      ...cerReport,
      id,
      createdAt: cerReport.createdAt || now,
      updatedAt: cerReport.updatedAt || now,
    } as schema.CerReport;
    
    this.cerReports.push(newReport);
    return newReport;
  }
  
  async updateCerReport(id: string, reportData: Partial<schema.InsertCerReport>): Promise<schema.CerReport | undefined> {
    const index = this.cerReports.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    
    // Update timestamp
    const now = new Date();
    this.cerReports[index] = { 
      ...this.cerReports[index], 
      ...reportData,
      updatedAt: now
    };
    
    return this.cerReports[index];
  }
  
  async deleteCerReport(id: string): Promise<boolean> {
    const initialLength = this.cerReports.length;
    this.cerReports = this.cerReports.filter(r => r.id !== id);
    return initialLength > this.cerReports.length;
  }
  
  // CER Section methods
  async getCerSection(id: string): Promise<schema.CerSection | undefined> {
    return this.cerSections.find(s => s.id === id);
  }
  
  async getCerSections(reportId: string, options: { orderBy?: string } = {}): Promise<schema.CerSection[]> {
    // Get sections for the specified report
    let sections = this.cerSections.filter(s => s.reportId === reportId);
    
    // Sort by order if no other sort is specified
    if (!options.orderBy || options.orderBy === 'order') {
      sections = sections.sort((a, b) => a.order - b.order);
    } else if (options.orderBy === 'title') {
      sections = sections.sort((a, b) => a.title.localeCompare(b.title));
    } else if (options.orderBy === 'updatedAt') {
      sections = sections.sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      });
    }
    
    return sections;
  }
  
  async createCerSection(section: schema.InsertCerSection): Promise<schema.CerSection> {
    // Generate UUID for section
    const id = generateUUID();
    
    // Set timestamps if not provided
    const now = new Date();
    const newSection = { 
      ...section,
      id,
      createdAt: section.createdAt || now,
      updatedAt: section.updatedAt || now,
    } as schema.CerSection;
    
    this.cerSections.push(newSection);
    return newSection;
  }
  
  async updateCerSection(id: string, sectionData: Partial<schema.InsertCerSection>): Promise<schema.CerSection | undefined> {
    const index = this.cerSections.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    
    // Update timestamp
    const now = new Date();
    this.cerSections[index] = { 
      ...this.cerSections[index], 
      ...sectionData,
      updatedAt: now
    };
    
    return this.cerSections[index];
  }
  
  async deleteCerSection(id: string): Promise<boolean> {
    const initialLength = this.cerSections.length;
    this.cerSections = this.cerSections.filter(s => s.id !== id);
    return initialLength > this.cerSections.length;
  }
  
  // CER FAERS Data methods
  async getCerFaersData(id: string): Promise<schema.CerFaersData | undefined> {
    return this.cerFaersData.find(f => f.id === id);
  }
  
  async getCerFaersDataByReportId(reportId: string): Promise<schema.CerFaersData[]> {
    return this.cerFaersData.filter(f => f.reportId === reportId);
  }
  
  async createCerFaersData(faersData: schema.InsertCerFaersData): Promise<schema.CerFaersData> {
    // Generate UUID for FAERS data
    const id = generateUUID();
    
    // Set timestamps if not provided
    const now = new Date();
    const newFaersData = { 
      ...faersData,
      id,
      createdAt: faersData.createdAt || now,
      updatedAt: faersData.updatedAt || now,
    } as schema.CerFaersData;
    
    this.cerFaersData.push(newFaersData);
    return newFaersData;
  }
  
  async updateCerFaersData(id: string, faersData: Partial<schema.InsertCerFaersData>): Promise<schema.CerFaersData | undefined> {
    const index = this.cerFaersData.findIndex(f => f.id === id);
    if (index === -1) return undefined;
    
    // Update timestamp
    const now = new Date();
    this.cerFaersData[index] = { 
      ...this.cerFaersData[index], 
      ...faersData,
      updatedAt: now
    };
    
    return this.cerFaersData[index];
  }
  
  // CER Literature methods
  async getCerLiterature(id: string): Promise<schema.CerLiterature | undefined> {
    return this.cerLiterature.find(l => l.id === id);
  }
  
  async getCerLiteratureByReportId(reportId: string, options: { 
    limit?: number; 
    offset?: number;
    relevanceThreshold?: number;
    includedOnly?: boolean;
  } = {}): Promise<schema.CerLiterature[]> {
    const { 
      limit = 50, 
      offset = 0, 
      relevanceThreshold = 0,
      includedOnly = false 
    } = options;
    
    // Filter literature entries
    let result = this.cerLiterature.filter(l => l.reportId === reportId);
    
    if (relevanceThreshold > 0) {
      result = result.filter(l => (l.relevanceScore || 0) >= relevanceThreshold);
    }
    
    if (includedOnly) {
      result = result.filter(l => l.includedInReport);
    }
    
    // Sort by relevance score (descending)
    result = result.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    
    return result.slice(offset, offset + limit);
  }
  
  async createCerLiterature(literature: schema.InsertCerLiterature): Promise<schema.CerLiterature> {
    // Generate UUID for literature
    const id = generateUUID();
    
    // Set timestamps if not provided
    const now = new Date();
    const newLiterature = { 
      ...literature,
      id,
      createdAt: literature.createdAt || now,
      updatedAt: literature.updatedAt || now,
    } as schema.CerLiterature;
    
    this.cerLiterature.push(newLiterature);
    return newLiterature;
  }
  
  async updateCerLiterature(id: string, literature: Partial<schema.InsertCerLiterature>): Promise<schema.CerLiterature | undefined> {
    const index = this.cerLiterature.findIndex(l => l.id === id);
    if (index === -1) return undefined;
    
    // Update timestamp
    const now = new Date();
    this.cerLiterature[index] = { 
      ...this.cerLiterature[index], 
      ...literature,
      updatedAt: now
    };
    
    return this.cerLiterature[index];
  }
  
  // CER Compliance methods
  async getCerComplianceCheck(id: string): Promise<schema.CerComplianceCheck | undefined> {
    return this.cerComplianceChecks.find(c => c.id === id);
  }
  
  async getCerComplianceChecksByReportId(reportId: string): Promise<schema.CerComplianceCheck[]> {
    // Get compliance checks for the specified report, sorted by date (newest first)
    return this.cerComplianceChecks
      .filter(c => c.reportId === reportId)
      .sort((a, b) => {
        const dateA = a.checkDate ? new Date(a.checkDate).getTime() : 0;
        const dateB = b.checkDate ? new Date(b.checkDate).getTime() : 0;
        return dateB - dateA;
      });
  }
  
  async createCerComplianceCheck(check: schema.InsertCerComplianceCheck): Promise<schema.CerComplianceCheck> {
    // Generate UUID for compliance check
    const id = generateUUID();
    
    // Set timestamps if not provided
    const now = new Date();
    const newCheck = { 
      ...check,
      id,
      checkDate: check.checkDate || now,
      createdAt: check.createdAt || now,
      updatedAt: check.updatedAt || now,
    } as schema.CerComplianceCheck;
    
    this.cerComplianceChecks.push(newCheck);
    return newCheck;
  }
  
  async updateCerComplianceCheck(id: string, check: Partial<schema.InsertCerComplianceCheck>): Promise<schema.CerComplianceCheck | undefined> {
    const index = this.cerComplianceChecks.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    
    // Update timestamp
    const now = new Date();
    this.cerComplianceChecks[index] = { 
      ...this.cerComplianceChecks[index], 
      ...check,
      updatedAt: now
    };
    
    return this.cerComplianceChecks[index];
  }
  
  // CER Workflow methods
  async getCerWorkflow(id: string): Promise<schema.CerWorkflow | undefined> {
    return this.cerWorkflows.find(w => w.id === id);
  }
  
  async getCerWorkflowByReportId(reportId: string): Promise<schema.CerWorkflow | undefined> {
    return this.cerWorkflows.find(w => w.reportId === reportId);
  }
  
  async createCerWorkflow(workflow: schema.InsertCerWorkflow): Promise<schema.CerWorkflow> {
    // Generate UUID for workflow
    const id = generateUUID();
    
    // Set timestamps if not provided
    const now = new Date();
    const newWorkflow = { 
      ...workflow,
      id,
      startedAt: workflow.startedAt || now,
      lastUpdated: workflow.lastUpdated || now
    } as schema.CerWorkflow;
    
    this.cerWorkflows.push(newWorkflow);
    return newWorkflow;
  }
  
  async updateCerWorkflow(id: string, workflow: Partial<schema.InsertCerWorkflow>): Promise<schema.CerWorkflow | undefined> {
    const index = this.cerWorkflows.findIndex(w => w.id === id);
    if (index === -1) return undefined;
    
    // Update timestamp
    const now = new Date();
    this.cerWorkflows[index] = { 
      ...this.cerWorkflows[index], 
      ...workflow,
      lastUpdated: now
    };
    
    return this.cerWorkflows[index];
  }
  
  // CER Export methods
  async getCerExport(id: string): Promise<schema.CerExport | undefined> {
    return this.cerExports.find(e => e.id === id);
  }
  
  async getCerExportsByReportId(reportId: string): Promise<schema.CerExport[]> {
    // Get exports for the specified report, sorted by date (newest first)
    return this.cerExports
      .filter(e => e.reportId === reportId)
      .sort((a, b) => {
        const dateA = a.exportedAt ? new Date(a.exportedAt).getTime() : 0;
        const dateB = b.exportedAt ? new Date(b.exportedAt).getTime() : 0;
        return dateB - dateA;
      });
  }
  
  async createCerExport(export_: schema.InsertCerExport): Promise<schema.CerExport> {
    // Generate UUID for export
    const id = generateUUID();
    
    // Set export date if not provided
    const now = new Date();
    const newExport = { 
      ...export_,
      id,
      exportedAt: export_.exportedAt || now
    } as schema.CerExport;
    
    this.cerExports.push(newExport);
    return newExport;
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
  async getDocument(id: string): Promise<schema.Document | undefined> {
    if (!db) return undefined;
    
    try {
      const documents = await db.select().from(schema.documents).where(eq(schema.documents.id, id));
      return documents[0];
    } catch (error) {
      logger.error('Failed to get document', { id, error });
      return undefined;
    }
  }
  
  async getDocumentByName(name: string): Promise<schema.Document | undefined> {
    if (!db) return undefined;
    
    try {
      const documents = await db.select().from(schema.documents).where(eq(schema.documents.name, name));
      return documents[0];
    } catch (error) {
      logger.error('Failed to get document by name', { name, error });
      return undefined;
    }
  }
  
  async getDocuments(options: { 
    limit?: number; 
    offset?: number;
    folderId?: string;
    status?: string;
    type?: string;
    search?: string;
  } = {}): Promise<schema.Document[]> {
    if (!db) return [];
    
    const { limit = 20, offset = 0, folderId, status, type, search } = options;
    
    try {
      let query = db.select().from(schema.documents);
      
      // Apply filters
      if (folderId) {
        query = query.where(eq(schema.documents.folderId, folderId));
      }
      
      if (status) {
        query = query.where(eq(schema.documents.status, status));
      }
      
      if (type) {
        query = query.where(eq(schema.documents.type, type));
      }
      
      if (search) {
        query = query.where(
          or(
            like(schema.documents.name, `%${search}%`),
            like(schema.documents.description || '', `%${search}%`)
          )
        );
      }
      
      // Apply sorting, limit, and offset
      query = query.orderBy(desc(schema.documents.modifiedAt)).limit(limit).offset(offset);
      
      const documents = await query;
      return documents;
    } catch (error) {
      logger.error('Failed to get documents', { options, error });
      return [];
    }
  }
  
  async createDocument(documentData: schema.InsertDocument): Promise<schema.Document> {
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    try {
      // Add creation timestamp if not provided
      if (!documentData.createdAt) {
        documentData.createdAt = new Date();
      }
      
      // Add modified timestamp if not provided
      if (!documentData.modifiedAt) {
        documentData.modifiedAt = new Date();
      }
      
      const results = await db.insert(schema.documents).values(documentData).returning();
      return results[0];
    } catch (error) {
      logger.error('Failed to create document', { documentData, error });
      throw error;
    }
  }
  
  async updateDocument(id: string, documentData: Partial<schema.InsertDocument>): Promise<schema.Document | undefined> {
    if (!db) return undefined;
    
    try {
      // Always update the modified timestamp
      documentData.modifiedAt = new Date();
      
      const results = await db
        .update(schema.documents)
        .set(documentData)
        .where(eq(schema.documents.id, id))
        .returning();
      
      return results[0];
    } catch (error) {
      logger.error('Failed to update document', { id, documentData, error });
      return undefined;
    }
  }
  
  async deleteDocument(id: string): Promise<boolean> {
    if (!db) return false;
    
    try {
      const results = await db
        .delete(schema.documents)
        .where(eq(schema.documents.id, id))
        .returning({ id: schema.documents.id });
      
      return results.length > 0;
    } catch (error) {
      logger.error('Failed to delete document', { id, error });
      return false;
    }
  }
  
  // Document folders methods
  async getFolders(options: { parentId?: string | null } = {}): Promise<schema.DocumentFolder[]> {
    if (!db) return [];
    
    try {
      let query = db.select().from(schema.documentFolders);
      
      if (options.parentId === null) {
        // Get root folders (where parentId is null)
        query = query.where(isNull(schema.documentFolders.parentId));
      } else if (options.parentId) {
        // Get child folders of a specific parent
        query = query.where(eq(schema.documentFolders.parentId, options.parentId));
      }
      
      return await query.orderBy(schema.documentFolders.name);
    } catch (error) {
      logger.error('Failed to get folders', { options, error });
      return [];
    }
  }
  
  async getFolder(id: string): Promise<schema.DocumentFolder | undefined> {
    if (!db) return undefined;
    
    try {
      const folders = await db
        .select()
        .from(schema.documentFolders)
        .where(eq(schema.documentFolders.id, id));
      
      return folders[0];
    } catch (error) {
      logger.error('Failed to get folder', { id, error });
      return undefined;
    }
  }
  
  async createFolder(folderData: schema.InsertDocumentFolder): Promise<schema.DocumentFolder> {
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    try {
      // Add timestamps if not provided
      if (!folderData.createdAt) {
        folderData.createdAt = new Date();
      }
      
      if (!folderData.updatedAt) {
        folderData.updatedAt = new Date();
      }
      
      const results = await db
        .insert(schema.documentFolders)
        .values(folderData)
        .returning();
      
      return results[0];
    } catch (error) {
      logger.error('Failed to create folder', { folderData, error });
      throw error;
    }
  }
  
  async updateFolder(id: string, folderData: Partial<schema.InsertDocumentFolder>): Promise<schema.DocumentFolder | undefined> {
    if (!db) return undefined;
    
    try {
      // Always update the updatedAt timestamp
      folderData.updatedAt = new Date();
      
      const results = await db
        .update(schema.documentFolders)
        .set(folderData)
        .where(eq(schema.documentFolders.id, id))
        .returning();
      
      return results[0];
    } catch (error) {
      logger.error('Failed to update folder', { id, folderData, error });
      return undefined;
    }
  }
  
  async deleteFolder(id: string): Promise<boolean> {
    if (!db) return false;
    
    try {
      // Delete the folder
      const results = await db
        .delete(schema.documentFolders)
        .where(eq(schema.documentFolders.id, id))
        .returning({ id: schema.documentFolders.id });
      
      return results.length > 0;
    } catch (error) {
      logger.error('Failed to delete folder', { id, error });
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