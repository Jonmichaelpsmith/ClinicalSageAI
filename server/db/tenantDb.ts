import { Request } from 'express';
import { db } from '../db';
import { SQL, and, eq } from 'drizzle-orm';
import { PostgresTable } from 'drizzle-orm/pg-core';

/**
 * TenantDb provides a database access layer that automatically
 * applies tenant isolation for all database operations.
 * 
 * It ensures that a tenant can only access its own data.
 */
export class TenantDb {
  private organizationId: number;
  
  constructor(organizationId: number) {
    this.organizationId = organizationId;
  }
  
  /**
   * Factory method to create a TenantDb instance from a request
   * that has been processed by the tenant context middleware
   */
  static fromRequest(req: Request): TenantDb {
    if (!req.tenantContext?.organizationId) {
      throw new Error('Tenant context not available on request');
    }
    
    return new TenantDb(req.tenantContext.organizationId);
  }
  
  /**
   * Apply tenant filter to a table if it has an organizationId column
   */
  private applyTenantFilter<T extends PostgresTable>(
    table: T, 
    additionalFilter?: SQL<unknown>
  ): SQL<unknown> {
    // Check if table has organizationId column
    if (!('organizationId' in table)) {
      throw new Error(`Table ${table} does not have organizationId column for tenant isolation`);
    }
    
    const tenantFilter = eq(table.organizationId as any, this.organizationId);
    
    // Combine with additional filter if provided
    if (additionalFilter) {
      return and(tenantFilter, additionalFilter);
    }
    
    return tenantFilter;
  }
  
  /**
   * Query methods with automatic tenant filtering
   */
  
  async findMany<T extends PostgresTable>(
    table: T,
    options: {
      where?: SQL<unknown>;
      limit?: number;
      offset?: number;
      orderBy?: SQL<unknown>;
    } = {}
  ) {
    const { where, ...restOptions } = options;
    const tenantFilter = this.applyTenantFilter(table, where);
    
    return db.select().from(table).where(tenantFilter).limit(options.limit || 100)
      .offset(options.offset || 0)
      .orderBy(options.orderBy || undefined);
  }
  
  async findFirst<T extends PostgresTable>(
    table: T,
    options: {
      where?: SQL<unknown>;
      orderBy?: SQL<unknown>;
    } = {}
  ) {
    const { where, ...restOptions } = options;
    const tenantFilter = this.applyTenantFilter(table, where);
    
    const results = await db.select().from(table).where(tenantFilter)
      .limit(1)
      .orderBy(options.orderBy || undefined);
      
    return results[0] || null;
  }
  
  async findById<T extends PostgresTable>(
    table: T,
    id: number | string
  ) {
    // Handle UUID or number ID
    const idFilter = typeof id === 'number' 
      ? eq(table.id as any, id)
      : eq(table.id as any, id);
      
    const tenantFilter = this.applyTenantFilter(table, idFilter);
    
    const results = await db.select().from(table).where(tenantFilter).limit(1);
    return results[0] || null;
  }
  
  async insert<T extends PostgresTable>(
    table: T,
    data: Record<string, any>
  ) {
    // Add organizationId to the data
    const dataWithTenant = {
      ...data,
      organizationId: this.organizationId
    };
    
    return db.insert(table).values(dataWithTenant).returning();
  }
  
  async update<T extends PostgresTable>(
    table: T,
    id: number | string,
    data: Record<string, any>
  ) {
    // Handle UUID or number ID
    const idFilter = typeof id === 'number' 
      ? eq(table.id as any, id)
      : eq(table.id as any, id);
      
    const tenantFilter = this.applyTenantFilter(table, idFilter);
    
    // Don't allow changing organizationId
    const { organizationId, ...safeData } = data;
    
    return db.update(table).set(safeData).where(tenantFilter).returning();
  }
  
  async delete<T extends PostgresTable>(
    table: T,
    id: number | string
  ) {
    // Handle UUID or number ID
    const idFilter = typeof id === 'number' 
      ? eq(table.id as any, id)
      : eq(table.id as any, id);
      
    const tenantFilter = this.applyTenantFilter(table, idFilter);
    
    return db.delete(table).where(tenantFilter).returning();
  }
  
  /**
   * Execute a custom query with tenant filter
   * For more complex queries that the basic CRUD operations don't cover
   */
  async executeQuery<T extends any>(
    callback: (tenantId: number) => Promise<T>
  ): Promise<T> {
    return callback(this.organizationId);
  }
}