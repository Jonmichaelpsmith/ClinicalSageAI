/**
 * Database Resilience Utility
 * 
 * This module provides enhanced PostgreSQL connection management with
 * automatic retry, circuit breaking, and connection health monitoring.
 * 
 * CRITICAL STABILITY COMPONENT - DO NOT MODIFY WITHOUT THOROUGH TESTING
 */

import { Pool, PoolClient } from 'pg';
import { EventEmitter } from 'events';

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  timeoutMs: number;
  resetTimeoutMs: number;
}

// Health metrics
interface HealthMetrics {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  totalConnections: number;
  connectionErrors: number;
  lastError: Error | null;
  lastErrorTime: Date | null;
  circuitBreakerOpen: boolean;
  circuitBreakerTrippedAt: Date | null;
  averageQueryTimeMs: number;
  activeConnections: number;
  consecutiveFailures: number;
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  timeoutMs: 30000,
  resetTimeoutMs: 60000
};

/**
 * Resilient Database Pool with enhanced stability features
 */
export class ResilientPool extends EventEmitter {
  private pool: Pool;
  private retryConfig: RetryConfig;
  private health: HealthMetrics;
  private isConnected: boolean = false;
  private connectionAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private circuitBreakerTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private queryTimeHistory: number[] = [];
  
  /**
   * Create a new resilient database pool
   * 
   * @param connectionString - PostgreSQL connection string
   * @param retryConfig - Retry configuration
   */
  constructor(connectionString: string, retryConfig: Partial<RetryConfig> = {}) {
    super();
    
    // Merge default config with provided config
    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...retryConfig
    };
    
    // Initialize health metrics
    this.health = {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      totalConnections: 0,
      connectionErrors: 0,
      lastError: null,
      lastErrorTime: null,
      circuitBreakerOpen: false,
      circuitBreakerTrippedAt: null,
      averageQueryTimeMs: 0,
      activeConnections: 0,
      consecutiveFailures: 0
    };
    
    // Create the pool
    this.pool = new Pool({
      connectionString,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
    });
    
    // Set up event listeners
    this.pool.on('error', (err) => {
      this.recordError(err);
      this.emit('error', err);
    });
    
    this.pool.on('connect', (client) => {
      this.health.totalConnections++;
      this.health.activeConnections++;
      this.isConnected = true;
      this.connectionAttempts = 0;
      this.emit('connect', client);
    });
    
    this.pool.on('remove', () => {
      this.health.activeConnections = Math.max(0, this.health.activeConnections - 1);
    });
    
    // Start heartbeat to check connection health
    this.startHeartbeat();
  }
  
  /**
   * Start a heartbeat to check database connection health
   */
  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    
    this.heartbeatTimer = setInterval(async () => {
      try {
        if (!this.health.circuitBreakerOpen) {
          const startTime = Date.now();
          const client = await this.pool.connect();
          
          try {
            await client.query('SELECT 1');
            const endTime = Date.now();
            this.recordQueryTime(endTime - startTime);
            
            if (!this.isConnected) {
              this.isConnected = true;
              this.emit('reconnect');
            }
          } finally {
            client.release();
          }
        }
      } catch (err) {
        this.recordError(err);
        
        if (this.isConnected) {
          this.isConnected = false;
          this.emit('disconnect', err);
        }
        
        this.checkCircuitBreaker();
      }
    }, 10000); // Check every 10 seconds
  }
  
  /**
   * Record query execution time
   */
  private recordQueryTime(timeMs: number): void {
    this.queryTimeHistory.push(timeMs);
    
    // Keep only the last 100 query times
    if (this.queryTimeHistory.length > 100) {
      this.queryTimeHistory.shift();
    }
    
    // Update average query time
    this.health.averageQueryTimeMs = this.queryTimeHistory.reduce((sum, time) => sum + time, 0) / 
                                     this.queryTimeHistory.length;
  }
  
  /**
   * Record a database error
   */
  private recordError(err: unknown): void {
    this.health.lastError = err instanceof Error ? err : new Error(String(err));
    this.health.lastErrorTime = new Date();
    this.health.connectionErrors++;
    this.health.consecutiveFailures++;
    
    console.error('Database error:', err);
  }
  
  /**
   * Record a successful database operation
   */
  private recordSuccess(): void {
    this.health.consecutiveFailures = 0;
  }
  
  /**
   * Check if the circuit breaker should be tripped
   */
  private checkCircuitBreaker(): void {
    // Trip the circuit breaker if we have too many consecutive failures
    if (this.health.consecutiveFailures >= 5 && !this.health.circuitBreakerOpen) {
      this.tripCircuitBreaker();
    }
  }
  
  /**
   * Trip the circuit breaker to stop further connection attempts
   */
  private tripCircuitBreaker(): void {
    this.health.circuitBreakerOpen = true;
    this.health.circuitBreakerTrippedAt = new Date();
    
    console.warn(`Circuit breaker tripped at ${this.health.circuitBreakerTrippedAt}`);
    this.emit('circuit-break', this.health.lastError);
    
    // Reset the circuit breaker after a timeout
    if (this.circuitBreakerTimer) {
      clearTimeout(this.circuitBreakerTimer);
    }
    
    this.circuitBreakerTimer = setTimeout(() => {
      this.resetCircuitBreaker();
    }, this.retryConfig.resetTimeoutMs);
  }
  
  /**
   * Reset the circuit breaker
   */
  private resetCircuitBreaker(): void {
    this.health.circuitBreakerOpen = false;
    this.health.consecutiveFailures = 0;
    
    console.log('Circuit breaker reset');
    this.emit('circuit-reset');
  }
  
  /**
   * Connect to the database with retry logic
   */
  async connect(): Promise<PoolClient> {
    if (this.health.circuitBreakerOpen) {
      throw new Error('Circuit breaker is open, database connections temporarily disabled');
    }
    
    this.connectionAttempts++;
    let retries = 0;
    let lastError: Error | null = null;
    
    while (retries <= this.retryConfig.maxRetries) {
      try {
        const client = await this.pool.connect();
        this.recordSuccess();
        return client;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        this.recordError(err);
        
        // Check if we should stop retrying
        if (retries >= this.retryConfig.maxRetries) {
          break;
        }
        
        // Exponential backoff with jitter
        const delay = Math.min(
          this.retryConfig.maxDelayMs,
          this.retryConfig.initialDelayMs * Math.pow(2, retries)
        );
        const jitter = delay * 0.2 * Math.random();
        const backoff = delay + jitter;
        
        console.log(`Retrying database connection in ${backoff}ms (attempt ${retries + 1}/${this.retryConfig.maxRetries})`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, backoff));
        
        retries++;
      }
    }
    
    this.checkCircuitBreaker();
    throw lastError || new Error('Failed to connect to database after retries');
  }
  
  /**
   * Execute a query with retry logic
   */
  async query(text: string, params: any[] = []): Promise<any> {
    if (this.health.circuitBreakerOpen) {
      throw new Error('Circuit breaker is open, database queries temporarily disabled');
    }
    
    this.health.totalQueries++;
    let retries = 0;
    let lastError: Error | null = null;
    
    while (retries <= this.retryConfig.maxRetries) {
      let client: PoolClient | null = null;
      
      try {
        const startTime = Date.now();
        
        // Get a client from the pool
        client = await this.pool.connect();
        
        // Execute the query
        const result = await client.query(text, params);
        
        // Record metrics
        const endTime = Date.now();
        this.recordQueryTime(endTime - startTime);
        this.health.successfulQueries++;
        this.recordSuccess();
        
        return result;
      } catch (err) {
        this.health.failedQueries++;
        lastError = err instanceof Error ? err : new Error(String(err));
        this.recordError(err);
        
        // Check if we should stop retrying
        // Some errors should not be retried
        const shouldRetry = this.shouldRetryError(err);
        
        if (!shouldRetry || retries >= this.retryConfig.maxRetries) {
          break;
        }
        
        // Exponential backoff with jitter
        const delay = Math.min(
          this.retryConfig.maxDelayMs,
          this.retryConfig.initialDelayMs * Math.pow(2, retries)
        );
        const jitter = delay * 0.2 * Math.random();
        const backoff = delay + jitter;
        
        console.log(`Retrying database query in ${backoff}ms (attempt ${retries + 1}/${this.retryConfig.maxRetries})`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, backoff));
        
        retries++;
      } finally {
        if (client) {
          client.release();
        }
      }
    }
    
    this.checkCircuitBreaker();
    throw lastError || new Error('Failed to execute query after retries');
  }
  
  /**
   * Execute a batch of queries in a transaction with retry logic
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    if (this.health.circuitBreakerOpen) {
      throw new Error('Circuit breaker is open, database transactions temporarily disabled');
    }
    
    let retries = 0;
    let lastError: Error | null = null;
    
    while (retries <= this.retryConfig.maxRetries) {
      let client: PoolClient | null = null;
      
      try {
        // Get a client from the pool
        client = await this.pool.connect();
        
        // Start transaction
        await client.query('BEGIN');
        
        // Execute callback
        const result = await callback(client);
        
        // Commit transaction
        await client.query('COMMIT');
        
        this.recordSuccess();
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        this.recordError(err);
        
        // Rollback transaction if we got a client
        if (client) {
          try {
            await client.query('ROLLBACK');
          } catch (rollbackErr) {
            console.error('Error rolling back transaction:', rollbackErr);
          }
        }
        
        // Check if we should stop retrying
        const shouldRetry = this.shouldRetryError(err);
        
        if (!shouldRetry || retries >= this.retryConfig.maxRetries) {
          break;
        }
        
        // Exponential backoff with jitter
        const delay = Math.min(
          this.retryConfig.maxDelayMs,
          this.retryConfig.initialDelayMs * Math.pow(2, retries)
        );
        const jitter = delay * 0.2 * Math.random();
        const backoff = delay + jitter;
        
        console.log(`Retrying transaction in ${backoff}ms (attempt ${retries + 1}/${this.retryConfig.maxRetries})`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, backoff));
        
        retries++;
      } finally {
        if (client) {
          client.release();
        }
      }
    }
    
    this.checkCircuitBreaker();
    throw lastError || new Error('Failed to execute transaction after retries');
  }
  
  /**
   * Determine if an error is retryable
   */
  private shouldRetryError(err: any): boolean {
    // Don't retry certain error types:
    // - Syntax errors
    // - Permission errors
    // - Constraint violations
    if (err.code) {
      // PostgreSQL error codes
      const nonRetryableCodes = [
        '42601', // syntax_error
        '42501', // insufficient_privilege
        '23505', // unique_violation
        '23503', // foreign_key_violation
        '23502', // not_null_violation
        '23514', // check_violation
        '42P01', // undefined_table
      ];
      
      if (nonRetryableCodes.includes(err.code)) {
        return false;
      }
    }
    
    // Retry network-related errors and temporary failures
    return true;
  }
  
  /**
   * Get database health metrics
   */
  getHealth(): HealthMetrics {
    return { ...this.health };
  }
  
  /**
   * Check if the database is currently connected
   */
  isHealthy(): boolean {
    return this.isConnected && !this.health.circuitBreakerOpen;
  }
  
  /**
   * Close the connection pool
   */
  async end(): Promise<void> {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    if (this.circuitBreakerTimer) {
      clearTimeout(this.circuitBreakerTimer);
      this.circuitBreakerTimer = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    await this.pool.end();
  }
}

// Create a global resilient pool instance
let globalPool: ResilientPool | null = null;

/**
 * Get the global resilient database pool
 */
export function getResilientPool(connectionString?: string): ResilientPool {
  if (!globalPool && connectionString) {
    globalPool = new ResilientPool(connectionString);
    
    // Log events
    globalPool.on('error', (err) => {
      console.error('Database pool error:', err);
    });
    
    globalPool.on('connect', () => {
      console.log('Database connected');
    });
    
    globalPool.on('disconnect', (err) => {
      console.error('Database disconnected:', err);
    });
    
    globalPool.on('reconnect', () => {
      console.log('Database reconnected');
    });
    
    globalPool.on('circuit-break', (err) => {
      console.warn('Database circuit breaker opened:', err);
    });
    
    globalPool.on('circuit-reset', () => {
      console.log('Database circuit breaker reset');
    });
  }
  
  if (!globalPool) {
    throw new Error('Database connection string must be provided when first creating the pool');
  }
  
  return globalPool;
}

/**
 * Reset the global pool (for testing purposes)
 */
export function resetResilientPool(): void {
  if (globalPool) {
    globalPool.end().catch(err => {
      console.error('Error ending pool:', err);
    });
    globalPool = null;
  }
}

export default {
  ResilientPool,
  getResilientPool,
  resetResilientPool
};