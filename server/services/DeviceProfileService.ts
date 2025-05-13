import { pool } from '../db'; // Using the existing database connection pool

// Type definition for device profile
interface DeviceProfile {
  id?: string;
  deviceName: string;
  modelNumber?: string;
  manufacturer?: string;
  deviceClass: 'I' | 'II' | 'III';
  intendedUse: string;
  technologyType?: string;
  predicateDevice?: string;
  createdAt?: Date;
  updatedAt?: Date;
  organizationId?: string;
  clientWorkspaceId?: string;
}

/**
 * Save a device profile to the database
 * 
 * @param data The device profile data
 * @param orgId Optional organization ID for multi-tenant support
 * @param clientId Optional client workspace ID for multi-tenant support
 * @returns The saved device profile with ID
 */
export async function saveDeviceProfile(
  data: Omit<DeviceProfile, 'id' | 'createdAt' | 'updatedAt'>, 
  orgId?: string, 
  clientId?: string
): Promise<DeviceProfile> {
  try {
    // Add tenant context if provided
    const tenantInfo = {
      ...(orgId ? { organizationId: orgId } : {}),
      ...(clientId ? { clientWorkspaceId: clientId } : {})
    };
    
    const now = new Date();
    
    // Create complete record with metadata
    const record = {
      ...data,
      ...tenantInfo,
      createdAt: now,
      updatedAt: now
    };
    
    // SQL query to insert the device profile
    const query = `
      INSERT INTO device_profiles (
        device_name, 
        model_number, 
        manufacturer, 
        device_class, 
        intended_use, 
        technology_type, 
        predicate_device, 
        organization_id, 
        client_workspace_id,
        created_at, 
        updated_at
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      record.deviceName,
      record.modelNumber || null,
      record.manufacturer || null,
      record.deviceClass,
      record.intendedUse,
      record.technologyType || null,
      record.predicateDevice || null,
      record.organizationId || null,
      record.clientWorkspaceId || null,
      record.createdAt,
      record.updatedAt
    ];
    
    const result = await pool.query(query, values);
    
    // Return the inserted record
    return result.rows[0];
  } catch (error) {
    console.error('Error saving device profile:', error);
    throw error;
  }
}

/**
 * Get all device profiles for an organization
 * 
 * @param orgId Organization ID
 * @param clientId Optional client workspace ID
 * @returns Array of device profiles
 */
export async function getDeviceProfiles(
  orgId?: string,
  clientId?: string
): Promise<DeviceProfile[]> {
  try {
    let query = `SELECT * FROM device_profiles WHERE 1=1`;
    const values: any[] = [];
    
    if (orgId) {
      values.push(orgId);
      query += ` AND organization_id = $${values.length}`;
    }
    
    if (clientId) {
      values.push(clientId);
      query += ` AND client_workspace_id = $${values.length}`;
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error getting device profiles:', error);
    throw error;
  }
}

/**
 * Get a device profile by ID
 * 
 * @param id Device profile ID
 * @param orgId Optional organization ID for security check
 * @returns The device profile or null if not found
 */
export async function getDeviceProfileById(
  id: string,
  orgId?: string
): Promise<DeviceProfile | null> {
  try {
    let query = `SELECT * FROM device_profiles WHERE id = $1`;
    const values: any[] = [id];
    
    if (orgId) {
      values.push(orgId);
      query += ` AND organization_id = $${values.length}`;
    }
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting device profile by ID:', error);
    throw error;
  }
}

/**
 * Update a device profile
 * 
 * @param id Device profile ID
 * @param data Updated device profile data
 * @param orgId Optional organization ID for security check
 * @returns The updated device profile
 */
export async function updateDeviceProfile(
  id: string,
  data: Partial<Omit<DeviceProfile, 'id' | 'createdAt' | 'updatedAt'>>,
  orgId?: string
): Promise<DeviceProfile | null> {
  try {
    // Get the current profile
    const currentProfile = await getDeviceProfileById(id, orgId);
    
    if (!currentProfile) {
      return null;
    }
    
    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    
    // Add each field that needs to be updated
    Object.entries(data).forEach(([key, value]) => {
      // Convert camelCase to snake_case for column names
      const column = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      values.push(value);
      updates.push(`${column} = $${values.length}`);
    });
    
    // Add updated_at timestamp
    values.push(new Date());
    updates.push(`updated_at = $${values.length}`);
    
    // Add ID and optional orgId for WHERE clause
    values.push(id);
    let query = `
      UPDATE device_profiles 
      SET ${updates.join(', ')}
      WHERE id = $${values.length}
    `;
    
    if (orgId) {
      values.push(orgId);
      query += ` AND organization_id = $${values.length}`;
    }
    
    query += ` RETURNING *`;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating device profile:', error);
    throw error;
  }
}