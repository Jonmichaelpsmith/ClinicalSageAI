import db from '../db.js';

const allowedTables = ['programs', 'studies', 'documents', 'subject_data'];
const forbiddenKeywords = [
  'insert', 'update', 'delete', 'drop', 'truncate', 'alter', 
  'create', 'exec', 'execute', '--', ';', 'rollback', 'commit'
];

/**
 * Validates that SQL is a SELECT statement and only accesses allowed tables
 * 
 * Security measures:
 * 1. Ensures only SELECT statements are executed (no writes)
 * 2. Validates tables accessed are in the allowlist
 * 3. Checks for forbidden SQL keywords and patterns
 * 4. Prevents multi-statement SQL injection with ; checks
 * 
 * @param {string} sql - SQL query to validate
 * @throws {Error} If SQL is invalid or attempts to access unauthorized tables
 */
export function validateSelect(sql) {
  // Normalize SQL for consistent checks (lowercase, single spaces)
  const normalizedSql = sql.trim().toLowerCase().replace(/\s+/g, ' ');
  
  // 1. Check that it's a SELECT statement
  if (!normalizedSql.startsWith('select')) {
    throw new Error('Only SELECT statements are allowed');
  }
  
  // 2. Check for forbidden keywords
  for (const keyword of forbiddenKeywords) {
    if (normalizedSql.includes(keyword)) {
      throw new Error(`Forbidden SQL keyword: ${keyword}`);
    }
  }
  
  // 3. Check that only allowed tables are referenced
  const fromMatches = normalizedSql.match(/from\s+([a-z0-9_]+)/g) || [];
  const joinMatches = normalizedSql.match(/join\s+([a-z0-9_]+)/g) || [];
  
  // Extract table names from FROM and JOIN clauses
  const tableReferences = [...fromMatches, ...joinMatches].map(match => {
    return match.split(/\s+/)[1].replace(/[^a-z0-9_]/g, '');
  });
  
  // Ensure all referenced tables are allowed
  for (const table of tableReferences) {
    if (!allowedTables.includes(table)) {
      throw new Error(`Table not permitted: ${table}`);
    }
  }
  
  // 4. Additional security: Ensure there are tables referenced
  if (tableReferences.length === 0) {
    throw new Error('No valid tables referenced');
  }
}

/**
 * Executes a validated SQL query safely
 * 
 * @param {string} sql - SQL query to execute
 * @returns {Promise<Array>} Query results
 */
export async function runQuery(sql) { 
  // Validate before executing
  validateSelect(sql);
  
  try {
    // Execute with error handling
    const result = await db.raw(sql);
    return result.rows;
  } catch (err) {
    console.error('SQL execution error:', err.message);
    throw new Error(`Error executing query: ${err.message}`);
  }
}