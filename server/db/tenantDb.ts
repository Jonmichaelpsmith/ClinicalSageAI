/**
 * Tenant Database Utilities
 * 
 * This module provides database utilities specifically designed for
 * multi-tenant operations with proper isolation.
 */
import { SQL, eq, and, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { getDb } from './index';
import { PgTable } from 'drizzle-orm/pg-core';
import { createScopedLogger } from '../utils/logger';

const logger = createScopedLogger('tenant-db');

/**
 * A utility class for performing tenant-isolated database operations
 */
export class TenantDb {
  private db: PostgresJsDatabase;
  private organizationId: number;
  
  /**
   * Create a new TenantDb instance for a specific tenant
   * 
   * @param organizationId - The tenant's organization ID
   * @param db - Optional database instance to use instead of the global one
   */
  constructor(organizationId: number, db?: PostgresJsDatabase) {
    this.organizationId = organizationId;
    this.db = db || getDb();
    
    if (!this.organizationId) {
      throw new Error('Organization ID is required for tenant database operations');
    }
  }
  
  /**
   * Query the database with automatic tenant filtering
   * 
   * @param table - The table to query
   * @param extraFilter - Optional additional filter conditions
   * @returns A filtered query for the tenant
   */
  query<T extends PgTable>(table: T, extraFilter?: SQL<unknown>) {
    // Create the base condition to filter by tenant
    const organizationIdColumn = table.name === 'organizations' 
      ? 'id' 
      : 'organization_id';
    
    const tenantCondition = eq(
      table[organizationIdColumn as keyof typeof table], 
      this.organizationId
    );
    
    // Combine with extra filter if provided
    const filter = extraFilter 
      ? and(tenantCondition, extraFilter) 
      : tenantCondition;
    
    // Return filtered query
    return this.db
      .select()
      .from(table)
      .where(filter);
  }
  
  /**
   * Get a single record with tenant isolation
   * 
   * @param table - The table to query
   * @param id - The ID of the record to retrieve
   * @returns The record if found
   */
  async findById<T extends PgTable>(table: T, id: number | string) {
    // Create the base condition to filter by tenant and ID
    const organizationIdColumn = table.name === 'organizations' 
      ? 'id' 
      : 'organization_id';
    
    const filter = and(
      eq(table[organizationIdColumn as keyof typeof table], this.organizationId),
      eq(table.id as any, id)
    );
    
    // Execute query
    const result = await this.db
      .select()
      .from(table)
      .where(filter)
      .limit(1);
    
    return result[0] || null;
  }
  
  /**
   * Count records with tenant isolation
   * 
   * @param table - The table to query
   * @param extraFilter - Optional additional filter conditions
   * @returns The count of matching records
   */
  async count<T extends PgTable>(table: T, extraFilter?: SQL<unknown>) {
    // Create the base condition to filter by tenant
    const organizationIdColumn = table.name === 'organizations' 
      ? 'id' 
      : 'organization_id';
    
    const tenantCondition = eq(
      table[organizationIdColumn as keyof typeof table], 
      this.organizationId
    );
    
    // Combine with extra filter if provided
    const filter = extraFilter 
      ? and(tenantCondition, extraFilter) 
      : tenantCondition;
    
    // Execute count query
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(table)
      .where(filter);
    
    return result[0]?.count || 0;
  }
  
  /**
   * Insert a record with automatic tenant assignment
   * 
   * @param table - The table to insert into
   * @param data - The data to insert
   * @returns The inserted record
   */
  async create<T extends PgTable>(table: T, data: { [x: string]: any }) {
    // Skip tenant assignment for the organizations table
    if (table.name !== 'organizations') {
      // Add the organization_id to the data
      data.organization_id = this.organizationId;
    }
    
    // Execute insert
    const result = await this.db.insert(table).values(data).returning();
    return result[0];
  }
  
  /**
   * Update a record with tenant isolation
   * 
   * @param table - The table to update
   * @param id - The ID of the record to update
   * @param data - The data to update
   * @returns The updated record
   */
  async update<T extends PgTable>(table: T, id: number | string, data: { [x: string]: any }) {
    // Create the base condition to filter by tenant and ID
    const organizationIdColumn = table.name === 'organizations' 
      ? 'id' 
      : 'organization_id';
    
    const filter = and(
      eq(table[organizationIdColumn as keyof typeof table], this.organizationId),
      eq(table.id as any, id)
    );
    
    // Execute update with tenant isolation
    const result = await this.db
      .update(table)
      .set(data)
      .where(filter)
      .returning();
    
    return result[0];
  }
  
  /**
   * Delete a record with tenant isolation
   * 
   * @param table - The table to delete from
   * @param id - The ID of the record to delete
   * @returns The deleted record
   */
  async delete<T extends PgTable>(table: T, id: number | string) {
    // Create the base condition to filter by tenant and ID
    const organizationIdColumn = table.name === 'organizations' 
      ? 'id' 
      : 'organization_id';
    
    const filter = and(
      eq(table[organizationIdColumn as keyof typeof table], this.organizationId),
      eq(table.id as any, id)
    );
    
    // Execute delete with tenant isolation
    const result = await this.db
      .delete(table)
      .where(filter)
      .returning();
    
    return result[0];
  }
}