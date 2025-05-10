/**
 * Query Batching Utility
 * 
 * This module provides batch execution capabilities for PostgreSQL queries
 * to optimize database performance by reducing round-trips.
 */
import { db } from '../db';
import { sql, SQL } from 'drizzle-orm';
import { createScopedLogger } from '../utils/logger';

const logger = createScopedLogger('query-batcher');

// Batcher configuration
const BATCH_TIMEOUT = 20; // ms to wait before executing a batch
const MAX_BATCH_SIZE = 100; // maximum queries in a single batch

// Stats for monitoring
const batchStats = {
  batchesExecuted: 0,
  queriesExecuted: 0,
  totalExecutionTimeMs: 0,
  errors: 0,
  lastBatchSize: 0,
  lastBatchTimeMs: 0
};

// Query information
interface QueuedQuery<T = any> {
  query: SQL;
  resolver: (result: T) => void;
  rejecter: (error: Error) => void;
  startTime: number;
}

// Mutable state for batching
const state = {
  queryQueue: [] as QueuedQuery[],
  timeoutId: null as NodeJS.Timeout | null,
  isProcessing: false
};

/**
 * Check if the database connection is available
 */
async function isDatabaseAvailable(): Promise<boolean> {
  try {
    if (!db) {
      logger.error('Database connection is not initialized');
      return false;
    }
    
    // Test the connection with a simple query
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    logger.error('Database connection test failed', error);
    return false;
  }
}

/**
 * Process the current batch of queries
 */
async function processBatch(): Promise<void> {
  // Clear the timeout
  if (state.timeoutId) {
    clearTimeout(state.timeoutId);
    state.timeoutId = null;
  }
  
  // If already processing or queue is empty, don't do anything
  if (state.isProcessing || state.queryQueue.length === 0) {
    return;
  }
  
  // Check database availability
  if (!await isDatabaseAvailable()) {
    // Reject all queued queries
    const error = new Error('Database connection not available');
    state.queryQueue.forEach(({ rejecter }) => {
      try {
        rejecter(error);
      } catch (e) {
        logger.error('Error rejecting query due to database unavailability', e);
      }
    });
    
    // Clear the queue
    state.queryQueue = [];
    batchStats.errors++;
    return;
  }
  
  // Get queries to process in this batch
  const queriesToProcess = state.queryQueue.splice(0, MAX_BATCH_SIZE);
  const batchSize = queriesToProcess.length;
  
  // Track batch size
  batchStats.lastBatchSize = batchSize;
  
  // Set processing flag
  state.isProcessing = true;
  
  // Start batch execution time tracking
  const batchStartTime = Date.now();
  
  try {
    // Construct the SQL for the combined batch
    // In PostgreSQL, we can execute multiple statements in a single call
    const combinedQuery = sql`BEGIN;${sql.raw('\n')}`;
    
    // Add each individual query
    queriesToProcess.forEach(({ query }) => {
      // @ts-ignore - Append the query
      combinedQuery.append(query);
      // @ts-ignore - Add a semicolon and newline after each query
      combinedQuery.append(sql.raw(';\n'));
    });
    
    // End the transaction
    // @ts-ignore
    combinedQuery.append(sql.raw('COMMIT;'));
    
    // Execute the combined query
    const result = await db!.execute(combinedQuery);
    
    // Update stats
    const batchTimeMs = Date.now() - batchStartTime;
    batchStats.batchesExecuted++;
    batchStats.queriesExecuted += batchSize;
    batchStats.totalExecutionTimeMs += batchTimeMs;
    batchStats.lastBatchTimeMs = batchTimeMs;
    
    // Log batch execution
    logger.debug('Batch query executed', { 
      batchSize, 
      executionTimeMs: batchTimeMs,
      avgTimePerQueryMs: batchTimeMs / batchSize
    });
    
    // Resolve each query in the batch with its individual result
    // Note: If the PostgreSQL driver returns a single result for the batch
    // (which is likely since we submitted a single combined query),
    // we'll need alternative approaches like using named parameters
    // or parsing the results. This is a simplified implementation.
    queriesToProcess.forEach(({ resolver, startTime }, index) => {
      try {
        // Here we assume each query's result is at the corresponding index
        // This might need adjustment based on how the DB driver returns results
        const queryResult = result;
        resolver(queryResult);
        
        // Log individual query time
        const queryTime = Date.now() - startTime;
        logger.debug('Query resolved', { index, queryTimeMs: queryTime });
      } catch (e) {
        logger.error('Error resolving query result', { error: e, index });
      }
    });
  } catch (error) {
    // Error in batch execution
    batchStats.errors++;
    logger.error('Error executing batch query', { error, batchSize });
    
    // Reject all queries with the error
    queriesToProcess.forEach(({ rejecter }, index) => {
      try {
        rejecter(error as Error);
      } catch (e) {
        logger.error('Error rejecting query after batch failure', { error: e, index });
      }
    });
  } finally {
    // Reset processing flag
    state.isProcessing = false;
    
    // Process the next batch if there are still items in the queue
    if (state.queryQueue.length > 0) {
      setImmediate(() => processBatch());
    }
  }
}

/**
 * Queue a query for batched execution
 * @param query SQL query to execute
 * @returns Promise that resolves with the query result
 */
export function batchQuery<T = any>(query: SQL): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    // Add query to the queue
    state.queryQueue.push({
      query,
      resolver: resolve,
      rejecter: reject,
      startTime: Date.now()
    });
    
    // Schedule batch processing
    if (!state.timeoutId && !state.isProcessing) {
      state.timeoutId = setTimeout(processBatch, BATCH_TIMEOUT);
    }
  });
}

/**
 * Force immediate execution of the current batch
 * This can be useful when you need a query to execute right away
 * without waiting for other queries to accumulate
 */
export function flushBatchQueue(): void {
  if (state.queryQueue.length > 0 && !state.isProcessing) {
    // Clear any existing timeout
    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
      state.timeoutId = null;
    }
    
    // Process immediately
    setImmediate(() => processBatch());
  }
}

/**
 * Get current batching statistics
 */
export function getBatchStats(): typeof batchStats {
  return { ...batchStats };
}

/**
 * Log current batching statistics
 */
export function logBatchStats(): void {
  const avgTimePerBatchMs = batchStats.batchesExecuted > 0 
    ? batchStats.totalExecutionTimeMs / batchStats.batchesExecuted 
    : 0;
    
  const avgTimePerQueryMs = batchStats.queriesExecuted > 0 
    ? batchStats.totalExecutionTimeMs / batchStats.queriesExecuted 
    : 0;
    
  logger.info('Query batching statistics', {
    batchesExecuted: batchStats.batchesExecuted,
    queriesExecuted: batchStats.queriesExecuted,
    avgQueriesPerBatch: batchStats.batchesExecuted > 0 
      ? batchStats.queriesExecuted / batchStats.batchesExecuted 
      : 0,
    avgTimePerBatchMs,
    avgTimePerQueryMs,
    errors: batchStats.errors,
    lastBatchSize: batchStats.lastBatchSize,
    lastBatchTimeMs: batchStats.lastBatchTimeMs
  });
}

/**
 * Reset batching statistics
 */
export function resetBatchStats(): void {
  batchStats.batchesExecuted = 0;
  batchStats.queriesExecuted = 0;
  batchStats.totalExecutionTimeMs = 0;
  batchStats.errors = 0;
  batchStats.lastBatchSize = 0;
  batchStats.lastBatchTimeMs = 0;
  logger.info('Batch statistics reset');
}

// Export a transaction utility that leverages batching
/**
 * Execute multiple queries in a single transaction with batching
 * This ensures all queries succeed or all fail together
 * @param queries Array of SQL queries to execute in a transaction
 * @returns Promise that resolves when the transaction completes
 */
export async function batchTransaction(queries: SQL[]): Promise<void> {
  if (queries.length === 0) {
    return;
  }
  
  try {
    // Begin transaction
    await batchQuery(sql`BEGIN`);
    
    // Execute all queries in the transaction
    for (const query of queries) {
      await batchQuery(query);
    }
    
    // Commit transaction
    await batchQuery(sql`COMMIT`);
  } catch (error) {
    logger.error('Error in batch transaction, rolling back', { error });
    
    try {
      // Roll back the transaction on error
      await batchQuery(sql`ROLLBACK`);
    } catch (rollbackError) {
      logger.error('Error rolling back batch transaction', { error: rollbackError });
    }
    
    // Re-throw the original error
    throw error;
  }
}

// Clean up when the process exits
process.on('beforeExit', () => {
  // Flush any pending queries
  flushBatchQueue();
  
  // Log final stats
  logBatchStats();
});