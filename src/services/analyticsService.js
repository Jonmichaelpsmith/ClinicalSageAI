/**
 * Analytics Service Module
 * 
 * Initializes analytics functionality including dashboards and data tracking.
 * Handles setup of analysis tools and migration management.
 */

import db from '../db.js';

/**
 * Initialize the analytics service
 * 
 * Sets up required tables and runs any pending migrations
 */
export async function initAnalytics() {
  try {
    // Ensure dashboards table exists
    const hasTable = await checkDashboardsTable();
    if (!hasTable) {
      console.log('Analytics service: Creating dashboards table');
      await createDashboardsTable();
    }
    
    console.log('Analytics service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize analytics service:', error);
  }
}

/**
 * Check if dashboards table exists
 */
async function checkDashboardsTable() {
  try {
    const result = await db.raw(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'dashboards'
      )
    `);
    
    return result.rows[0].exists;
  } catch (error) {
    console.error('Error checking dashboards table:', error);
    return false;
  }
}

/**
 * Create dashboards table if it doesn't exist
 */
async function createDashboardsTable() {
  try {
    await db.raw(`
      CREATE TABLE IF NOT EXISTS dashboards (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        vega_spec JSONB NOT NULL,
        organization_id VARCHAR(36) NOT NULL,
        created_by VARCHAR(36) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_dashboards_org ON dashboards(organization_id);
      CREATE INDEX IF NOT EXISTS idx_dashboards_created_by ON dashboards(created_by);
    `);
    
    // Add trigger for updated_at
    await db.raw(`
      CREATE OR REPLACE FUNCTION update_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      DROP TRIGGER IF EXISTS update_dashboards_timestamp ON dashboards;
      CREATE TRIGGER update_dashboards_timestamp
      BEFORE UPDATE ON dashboards
      FOR EACH ROW
      EXECUTE FUNCTION update_timestamp();
    `);
    
    return true;
  } catch (error) {
    console.error('Error creating dashboards table:', error);
    return false;
  }
}