import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Execute a raw SQL query using Drizzle ORM
 */
export async function execute(sqlQuery: string, params: any[] = []) {
  // Use drizzle-orm's sql template tag
  return db.execute(sql.raw(sqlQuery));
}