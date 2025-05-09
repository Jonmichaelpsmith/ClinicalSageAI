/**
 * Tenant Database Helper
 * 
 * Provides tenant-aware database operations to ensure proper data isolation.
 * This file extends the database with Row-Level Security (RLS) policies
 * and provides helper methods for tenant-specific operations.
 */
import { eq, and, SQL } from 'drizzle-orm';
import { db } from '../db';
import { PgTable } from 'drizzle-orm/pg-core';
import { createScopedLogger } from '../utils/logger';

const logger = createScopedLogger('tenant-db');

/**
 * TenantDb class for tenant-specific database operations
 * 
 * This class wraps the database connection with tenant context to ensure
 * proper data isolation between tenants.
 */
export class TenantDb {
  private tenantId: number;
  
  constructor(tenantId: number) {
    this.tenantId = tenantId;
  }
  
  /**
   * Select records with tenant context
   * 
   * @param table The table to select from
   * @param whereClause Optional additional WHERE conditions
   * @returns The query result with tenant context applied
   */
  async select<T extends PgTable<any>>(
    table: T,
    whereClause?: SQL<unknown>
  ) {
    try {
      let query = db.select().from(table);
      
      // Apply tenant filter if the table has organizationId column
      if ('organizationId' in table) {
        const tenantFilter = eq(table.organizationId as any, this.tenantId);
        
        if (whereClause) {
          query = query.where(and(tenantFilter, whereClause));
        } else {
          query = query.where(tenantFilter);
        }
      } else if (whereClause) {
        query = query.where(whereClause);
      }
      
      return await query;
    } catch (error) {
      logger.error(`Error in tenant select operation for tenant ${this.tenantId}`, error);
      throw error;
    }
  }
  
  /**
   * Insert records with tenant context
   * 
   * @param table The table to insert into
   * @param data The data to insert (will be augmented with tenant context)
   * @returns The inserted records
   */
  async insert<T extends PgTable<any>>(
    table: T,
    data: Record<string, any> | Record<string, any>[]
  ) {
    try {
      // Add tenant ID to the data if the table has organizationId column
      if ('organizationId' in table) {
        if (Array.isArray(data)) {
          data = data.map(item => ({
            ...item,
            organizationId: this.tenantId
          }));
        } else {
          data = {
            ...data,
            organizationId: this.tenantId
          };
        }
      }
      
      return await db.insert(table).values(data as any).returning();
    } catch (error) {
      logger.error(`Error in tenant insert operation for tenant ${this.tenantId}`, error);
      throw error;
    }
  }
  
  /**
   * Update records with tenant context
   * 
   * @param table The table to update
   * @param data The data to update
   * @param whereClause The WHERE condition for the update
   * @returns The updated records
   */
  async update<T extends PgTable<any>>(
    table: T,
    data: Record<string, any>,
    whereClause: SQL<unknown>
  ) {
    try {
      let query = db.update(table).set(data);
      
      // Apply tenant filter if the table has organizationId column
      if ('organizationId' in table) {
        const tenantFilter = eq(table.organizationId as any, this.tenantId);
        query = query.where(and(tenantFilter, whereClause));
      } else {
        query = query.where(whereClause);
      }
      
      return await query.returning();
    } catch (error) {
      logger.error(`Error in tenant update operation for tenant ${this.tenantId}`, error);
      throw error;
    }
  }
  
  /**
   * Delete records with tenant context
   * 
   * @param table The table to delete from
   * @param whereClause The WHERE condition for the delete
   * @returns The deleted records
   */
  async delete<T extends PgTable<any>>(
    table: T,
    whereClause: SQL<unknown>
  ) {
    try {
      let query = db.delete(table);
      
      // Apply tenant filter if the table has organizationId column
      if ('organizationId' in table) {
        const tenantFilter = eq(table.organizationId as any, this.tenantId);
        query = query.where(and(tenantFilter, whereClause));
      } else {
        query = query.where(whereClause);
      }
      
      return await query.returning();
    } catch (error) {
      logger.error(`Error in tenant delete operation for tenant ${this.tenantId}`, error);
      throw error;
    }
  }
  
  /**
   * Count records with tenant context
   * 
   * @param table The table to count records in
   * @param whereClause Optional additional WHERE conditions
   * @returns The count of records
   */
  async count<T extends PgTable<any> | string>(
    table: T,
    whereClause?: SQL<unknown>
  ): Promise<number> {
    try {
      let query;
      
      if (typeof table === 'string') {
        // For raw table names
        const result = await db.execute(`
          SELECT COUNT(*) FROM ${table}
          WHERE organization_id = $1
          ${whereClause ? `AND ${whereClause}` : ''}
        `, [this.tenantId]);
        
        return parseInt(result.rows[0].count);
      } else {
        // For Drizzle tables
        query = db.select({ count: SQL`count(*)` }).from(table);
        
        // Apply tenant filter if the table has organizationId column
        if ('organizationId' in table) {
          const tenantFilter = eq(table.organizationId as any, this.tenantId);
          
          if (whereClause) {
            query = query.where(and(tenantFilter, whereClause));
          } else {
            query = query.where(tenantFilter);
          }
        } else if (whereClause) {
          query = query.where(whereClause);
        }
        
        const result = await query;
        return Number(result[0]?.count || 0);
      }
    } catch (error) {
      logger.error(`Error in tenant count operation for tenant ${this.tenantId}`, error);
      throw error;
    }
  }
  
  /**
   * Execute a raw SQL query with tenant context
   * 
   * @param query The SQL query to execute
   * @param params The parameters for the query
   * @returns The query result
   */
  async execute(query: string, params: any[] = []) {
    try {
      // Add tenant ID to the parameters
      const paramsWithTenant = [this.tenantId, ...params];
      
      // Replace $1, $2, etc. with $2, $3, etc. to account for the tenant ID
      const shiftedQuery = query.replace(/\$(\d+)/g, (_, num) => `$${parseInt(num) + 1}`);
      
      // Add tenant context to the query
      const queryWithTenant = shiftedQuery.replace(
        /FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi,
        `FROM $1 WHERE organization_id = $1 AND`
      );
      
      return await db.execute(queryWithTenant, paramsWithTenant);
    } catch (error) {
      logger.error(`Error in tenant execute operation for tenant ${this.tenantId}`, error);
      throw error;
    }
  }
}