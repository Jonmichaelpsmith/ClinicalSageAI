// Simple in-memory storage

// Define the storage interface
export interface IStorage {
  // Add future storage methods here
}

// Implement in-memory storage
export class MemStorage implements IStorage {
  // Add future storage implementation here
}

// Export a singleton instance
export const storage = new MemStorage();