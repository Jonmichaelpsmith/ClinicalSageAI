import pg from 'pg';
import crypto from 'crypto';

// Simple UUID v4 generator to avoid external dependencies
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Define interfaces for device profile data
export interface DeviceProfile {
  id: number;
  deviceName: string;
  modelNumber?: string;
  manufacturer?: string;
  deviceClass: 'I' | 'II' | 'III';
  intendedUse: string;
  technologyType?: string;
  predicateDevice?: string;
  organizationId?: string;
  clientWorkspaceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDeviceProfileInput {
  deviceName: string;
  modelNumber?: string;
  manufacturer?: string;
  deviceClass: 'I' | 'II' | 'III';
  intendedUse: string;
  technologyType?: string;
  predicateDevice?: string;
  organizationId?: string;
  clientWorkspaceId?: string;
}

export interface UpdateDeviceProfileInput {
  deviceName?: string;
  modelNumber?: string;
  manufacturer?: string;
  deviceClass?: 'I' | 'II' | 'III';
  intendedUse?: string;
  technologyType?: string;
  predicateDevice?: string;
}

/**
 * Service class for managing device profiles
 */
class DeviceProfileService {
  private pool: pg.Pool | null = null;
  private static instance: DeviceProfileService | null = null;

  constructor() {
    // Initialize the database connection
    this.initializeDatabase();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DeviceProfileService {
    if (!DeviceProfileService.instance) {
      DeviceProfileService.instance = new DeviceProfileService();
    }
    return DeviceProfileService.instance;
  }

  /**
   * Initialize the database connection pool
   */
  private async initializeDatabase(): Promise<void> {
    try {
      // Create database connection pool using environment variable
      this.pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

      // Verify the connection
      const client = await this.pool.connect();
      client.release();
      
      // Ensure the device_profiles table exists
      await this.createTableIfNotExists();
      
      console.log('Database connection established successfully.');
    } catch (error) {
      console.error('Failed to connect to the database:', error);
      throw error;
    }
  }

  /**
   * Create device_profiles table if it doesn't exist
   */
  private async createTableIfNotExists(): Promise<void> {
    try {
      if (!this.pool) {
        throw new Error('Database pool not initialized');
      }
      
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS device_profiles (
          id SERIAL PRIMARY KEY,
          device_name VARCHAR(255) NOT NULL,
          model_number VARCHAR(255),
          manufacturer VARCHAR(255),
          device_class VARCHAR(10) NOT NULL CHECK (device_class IN ('I', 'II', 'III')),
          intended_use TEXT NOT NULL,
          technology_type VARCHAR(255),
          predicate_device VARCHAR(255),
          organization_id VARCHAR(255),
          client_workspace_id VARCHAR(255),
          created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Add index for organization-based queries
        CREATE INDEX IF NOT EXISTS idx_device_profiles_organization_id 
        ON device_profiles(organization_id);
        
        -- Add index for workspace-based queries
        CREATE INDEX IF NOT EXISTS idx_device_profiles_client_workspace_id 
        ON device_profiles(client_workspace_id);
      `;
      
      await this.pool.query(createTableQuery);
    } catch (error) {
      console.error('Error creating device_profiles table:', error);
      throw error;
    }
  }

  /**
   * Create a new device profile
   */
  public async createDeviceProfile(data: CreateDeviceProfileInput): Promise<DeviceProfile> {
    try {
      if (!this.pool) {
        throw new Error('Database pool not initialized');
      }
      
      const now = new Date();
      
      const query = `
        INSERT INTO device_profiles (
          device_name, model_number, manufacturer, device_class, 
          intended_use, technology_type, predicate_device, 
          organization_id, client_workspace_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
      `;
      
      const values = [
        data.deviceName,
        data.modelNumber || null,
        data.manufacturer || null,
        data.deviceClass,
        data.intendedUse,
        data.technologyType || null,
        data.predicateDevice || null,
        data.organizationId || null,
        data.clientWorkspaceId || null,
        now,
        now
      ];
      
      const result = await this.pool.query(query, values);
      
      return this.mapDatabaseToDeviceProfile(result.rows[0]);
    } catch (error) {
      console.error('Error creating device profile:', error);
      throw error;
    }
  }

  /**
   * Get a device profile by ID
   */
  public async getDeviceProfile(id: string): Promise<DeviceProfile | null> {
    try {
      if (!this.pool) {
        throw new Error('Database pool not initialized');
      }
      
      const query = 'SELECT * FROM device_profiles WHERE id = $1;';
      const result = await this.pool.query(query, [parseInt(id, 10)]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapDatabaseToDeviceProfile(result.rows[0]);
    } catch (error) {
      console.error('Error getting device profile:', error);
      throw error;
    }
  }

  /**
   * Get device profiles for an organization
   */
  public async getDeviceProfilesByOrganization(
    organizationId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<DeviceProfile[]> {
    try {
      if (!this.pool) {
        throw new Error('Database pool not initialized');
      }
      
      const query = `
        SELECT * FROM device_profiles 
        WHERE organization_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3;
      `;
      
      const result = await this.pool.query(query, [organizationId, limit, offset]);
      
      return result.rows.map(this.mapDatabaseToDeviceProfile);
    } catch (error) {
      console.error('Error getting device profiles by organization:', error);
      throw error;
    }
  }

  /**
   * Update a device profile
   */
  public async updateDeviceProfile(id: string, data: UpdateDeviceProfileInput): Promise<DeviceProfile | null> {
    try {
      if (!this.pool) {
        throw new Error('Database pool not initialized');
      }
      
      // Build update query dynamically based on provided fields
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCounter = 1;
      
      if (data.deviceName !== undefined) {
        updateFields.push(`device_name = $${paramCounter++}`);
        values.push(data.deviceName);
      }
      
      if (data.modelNumber !== undefined) {
        updateFields.push(`model_number = $${paramCounter++}`);
        values.push(data.modelNumber);
      }
      
      if (data.manufacturer !== undefined) {
        updateFields.push(`manufacturer = $${paramCounter++}`);
        values.push(data.manufacturer);
      }
      
      if (data.deviceClass !== undefined) {
        updateFields.push(`device_class = $${paramCounter++}`);
        values.push(data.deviceClass);
      }
      
      if (data.intendedUse !== undefined) {
        updateFields.push(`intended_use = $${paramCounter++}`);
        values.push(data.intendedUse);
      }
      
      if (data.technologyType !== undefined) {
        updateFields.push(`technology_type = $${paramCounter++}`);
        values.push(data.technologyType);
      }
      
      if (data.predicateDevice !== undefined) {
        updateFields.push(`predicate_device = $${paramCounter++}`);
        values.push(data.predicateDevice);
      }
      
      // Always update the updated_at timestamp
      updateFields.push(`updated_at = $${paramCounter++}`);
      values.push(new Date());
      
      // Add the ID for the WHERE clause
      values.push(parseInt(id, 10));
      
      if (updateFields.length === 0) {
        throw new Error('No fields provided for update');
      }
      
      const query = `
        UPDATE device_profiles 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramCounter}
        RETURNING *;
      `;
      
      const result = await this.pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapDatabaseToDeviceProfile(result.rows[0]);
    } catch (error) {
      console.error('Error updating device profile:', error);
      throw error;
    }
  }

  /**
   * Delete a device profile
   */
  public async deleteDeviceProfile(id: string): Promise<boolean> {
    try {
      if (!this.pool) {
        throw new Error('Database pool not initialized');
      }
      
      const query = 'DELETE FROM device_profiles WHERE id = $1 RETURNING id;';
      const result = await this.pool.query(query, [parseInt(id, 10)]);
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting device profile:', error);
      throw error;
    }
  }

  /**
   * Map database row to DeviceProfile interface
   */
  private mapDatabaseToDeviceProfile(row: any): DeviceProfile {
    return {
      id: row.id,
      deviceName: row.device_name,
      modelNumber: row.model_number,
      manufacturer: row.manufacturer,
      deviceClass: row.device_class as 'I' | 'II' | 'III',
      intendedUse: row.intended_use,
      technologyType: row.technology_type,
      predicateDevice: row.predicate_device,
      organizationId: row.organization_id,
      clientWorkspaceId: row.client_workspace_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export default DeviceProfileService;