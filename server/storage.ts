import { users, User, InsertUser, projects, Project, InsertProject, documents, Document, InsertDocument } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project operations
  getProjects(userId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project>;
  deleteProject(id: number): Promise<boolean>;
  
  // Document operations
  getDocuments(projectId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<Document>): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;
}

// Memory-based storage implementation for development
export class MemStorage implements IStorage {
  private _users: User[] = [];
  private _projects: Project[] = [];
  private _documents: Document[] = [];
  private _userIdCounter = 1;
  private _projectIdCounter = 1;
  private _documentIdCounter = 1;

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this._users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this._users.find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser = {
      ...user,
      id: this._userIdCounter++,
      createdAt: new Date()
    } as User;
    
    this._users.push(newUser);
    return newUser;
  }

  // Project operations
  async getProjects(userId: number): Promise<Project[]> {
    return this._projects.filter(project => project.userId === userId);
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this._projects.find(project => project.id === id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const newProject = {
      ...project,
      id: this._projectIdCounter++,
      createdAt: new Date()
    } as Project;
    
    this._projects.push(newProject);
    return newProject;
  }

  async updateProject(id: number, projectData: Partial<Project>): Promise<Project> {
    const index = this._projects.findIndex(project => project.id === id);
    if (index === -1) {
      throw new Error(`Project with ID ${id} not found`);
    }
    
    const updatedProject = {
      ...this._projects[index],
      ...projectData
    };
    
    this._projects[index] = updatedProject;
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    const initialLength = this._projects.length;
    this._projects = this._projects.filter(project => project.id !== id);
    return this._projects.length !== initialLength;
  }

  // Document operations
  async getDocuments(projectId: number): Promise<Document[]> {
    return this._documents.filter(document => document.projectId === projectId);
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this._documents.find(document => document.id === id);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const now = new Date();
    const newDocument = {
      ...document,
      id: this._documentIdCounter++,
      createdAt: now,
      updatedAt: now
    } as Document;
    
    this._documents.push(newDocument);
    return newDocument;
  }

  async updateDocument(id: number, documentData: Partial<Document>): Promise<Document> {
    const index = this._documents.findIndex(document => document.id === id);
    if (index === -1) {
      throw new Error(`Document with ID ${id} not found`);
    }
    
    const updatedDocument = {
      ...this._documents[index],
      ...documentData,
      updatedAt: new Date()
    };
    
    this._documents[index] = updatedDocument;
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const initialLength = this._documents.length;
    this._documents = this._documents.filter(document => document.id !== id);
    return this._documents.length !== initialLength;
  }
}

// Export a singleton instance of the storage
export const storage = new MemStorage();