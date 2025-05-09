/**
 * Quality Management API Initializer
 * 
 * This module initializes the quality management API, including setting up
 * database checks, migrations for quality tables if needed, and scheduling
 * maintenance tasks.
 */
import { createScopedLogger } from '../utils/logger';
import { getDb } from '../db/tenantDbHelper';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import waiversService from '../services/quality-waiver-service';

const logger = createScopedLogger('quality-api-initializer');

/**
 * Initialize quality management tables if they don't exist
 */
async function initializeTables() {
  try {
    logger.info('Checking quality management tables');
    
    // Check if the qmp_section_gating table exists
    const checkTableSql = sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'qmp_section_gating'
      );
    `;
    
    const tableExists = await db.execute(checkTableSql);
    
    if (!tableExists.rows[0]?.exists) {
      logger.warn('Quality management tables not found. Please run database migrations.');
    } else {
      logger.info('Quality management tables already exist');
    }
  } catch (error) {
    logger.error('Error checking quality management tables', { error });
    // Don't throw - this is not critical for server startup
  }
}

/**
 * Schedule periodic maintenance tasks
 */
function scheduleMaintenanceTasks() {
  try {
    logger.info('Scheduling quality management maintenance tasks');
    
    // Schedule waiver expiration check every 24 hours
    const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    setInterval(async () => {
      try {
        logger.info('Running scheduled waiver expiration check');
        
        // This would normally query all tenants and check waivers for each
        // For simplicity in the prototype, we'll just check tenant ID 1
        const mockReq = {}; // Mock request object
        const organizationId = 1;
        
        const count = await waiversService.checkAndUpdateExpiredWaivers(mockReq, organizationId);
        logger.info(`Updated ${count} expired waivers`);
      } catch (error) {
        logger.error('Error running waiver expiration check', { error });
      }
    }, CHECK_INTERVAL);
    
    logger.info('Quality management maintenance tasks scheduled');
  } catch (error) {
    logger.error('Error scheduling quality management maintenance tasks', { error });
    // Don't throw - this is not critical for server startup
  }
}

/**
 * Initialize the quality API
 */
export async function initializeQualityApi(): Promise<void> {
  try {
    logger.info('Initializing quality management API');
    
    // Initialize tables
    await initializeTables();
    
    // Schedule maintenance tasks
    scheduleMaintenanceTasks();
    
    logger.info('Quality management API successfully initialized');
  } catch (error) {
    logger.error('Error initializing quality management API', { error });
    throw error;
  }
}

export default initializeQualityApi;