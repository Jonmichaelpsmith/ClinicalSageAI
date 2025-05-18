/**
 * Database Optimizer Module for TrialSage
 * 
 * This module provides database optimization utilities specific to the 510(k) workflow,
 * including creating necessary indexes for performance, validating database schema,
 * and ensuring query performance.
 */

const { Pool } = require('pg');
const logger = require('./logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

/**
 * Create necessary indexes for 510(k) workflow tables
 * 
 * @returns {Promise<boolean>} True if successful
 */
async function create510kIndexes() {
  logger.info('Initializing 510(k) database indexes');
  try {
    // Create index on device_profiles table for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_device_profiles_id 
      ON device_profiles(id)
    `);
    
    // Create index on predicate_selections for device_id
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_predicate_selections_device_id 
      ON predicate_selections(device_id)
    `);
    
    // Create index on equivalence_analyses for device_id
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_equivalence_analyses_device_id 
      ON equivalence_analyses(device_id)
    `);
    
    // Create composite index for better performance on workflow status checks
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_workflow_status_device_org
      ON workflow_status(device_id, organization_id) 
    `);
    
    logger.info('Successfully created 510(k) database indexes');
    return true;
  } catch (error) {
    logger.error(`Error creating 510(k) database indexes: ${error.message}`);
    return false;
  }
}

/**
 * Test 510(k) workflow database connectivity and performance
 * 
 * @returns {Promise<{success: boolean, latency: number}>} Test results
 */
async function test510kDatabasePerformance() {
  logger.info('Testing 510(k) database performance');
  try {
    const startTime = Date.now();
    
    // Simple query to test connectivity and performance
    await pool.query('SELECT COUNT(*) FROM device_profiles');
    
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    logger.info(`Database performance test completed: ${latency}ms latency`);
    
    return {
      success: true,
      latency
    };
  } catch (error) {
    logger.error(`Database performance test failed: ${error.message}`);
    return {
      success: false,
      latency: -1,
      error: error.message
    };
  }
}

/**
 * Analyze slow queries and log recommendations
 * 
 * @returns {Promise<void>}
 */
async function analyzeSlowQueries() {
  try {
    logger.info('Analyzing slow queries for 510(k) module');
    
    // For PostgreSQL, we can query pg_stat_statements for slow query analysis
    // This assumes pg_stat_statements extension is installed
    
    const result = await pool.query(`
      SELECT query, calls, total_time / calls as avg_time, rows
      FROM pg_stat_statements
      WHERE query LIKE '%device_profiles%' OR query LIKE '%predicate_selections%' 
        OR query LIKE '%equivalence_analyses%'
      ORDER BY total_time / calls DESC
      LIMIT 10
    `);
    
    if (result.rows.length > 0) {
      logger.info(`Found ${result.rows.length} slow queries to optimize`);
      
      // Log the slow queries with recommendations
      result.rows.forEach((row, i) => {
        logger.info(`Slow query #${i+1}: ${row.query.substring(0, 100)}...`);
        logger.info(`  Avg time: ${row.avg_time}ms, Calls: ${row.calls}, Rows: ${row.rows}`);
        
        // Simple recommendation based on query patterns
        if (row.query.includes('WHERE') && !row.query.includes('INDEX')) {
          logger.info('  Recommendation: Consider adding an index for the WHERE clause conditions');
        }
      });
    } else {
      logger.info('No slow queries detected for 510(k) module tables');
    }
  } catch (error) {
    logger.error(`Error analyzing slow queries: ${error.message}`);
  }
}

// Export both as CommonJS and ESM compatible exports
module.exports = {
  create510kIndexes,
  test510kDatabasePerformance,
  analyzeSlowQueries
};

// Also export individual functions for ESM imports
export { create510kIndexes, test510kDatabasePerformance, analyzeSlowQueries };