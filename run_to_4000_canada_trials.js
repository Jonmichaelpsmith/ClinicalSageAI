import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import pg from 'pg';

/**
 * Run To 4000 Health Canada Trials Script
 * 
 * This script runs batches of 50 trials sequentially until 
 * the Health Canada trial count reaches 4000.
 */

// Configuration
const BATCH_SIZE = 50; // Import 50 trials per batch
const TARGET_COUNT = 4000; // Target number of Health Canada trials
const TRACKING_FILE = 'hc_import_tracker.json';

// Database connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Get tracking data
function getTrackingData() {
  try {
    if (fs.existsSync(TRACKING_FILE)) {
      const data = JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf8'));
      return data;
    }
  } catch (error) {
    console.error('Error reading tracking file:', error.message);
  }
  
  // Default tracking data
  return {
    nextId: 1240,
    batchesCompleted: 17,
    trialsImported: 790
  };
}

// Get current Health Canada trial count
async function getHealthCanadaCount() {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT COUNT(*) as count FROM csr_reports WHERE region = 'Health Canada'");
    return parseInt(result.rows[0].count);
  } finally {
    client.release();
  }
}

// Run batches until target is reached
async function runUntilTarget() {
  console.log('=== Run Until 4000 Health Canada Trials ===');
  console.log('Starting timestamp:', new Date().toISOString());
  
  try {
    let currentCount = await getHealthCanadaCount();
    console.log(`Starting with ${currentCount} Health Canada trials`);
    console.log(`Target: ${TARGET_COUNT} trials`);
    console.log(`Progress: ${Math.round(currentCount/TARGET_COUNT*100)}%`);
    
    let batchesRun = 0;
    
    // Run batches until we hit or exceed the target
    while (currentCount < TARGET_COUNT) {
      const remaining = TARGET_COUNT - currentCount;
      const batchesToRun = Math.min(Math.ceil(remaining / BATCH_SIZE), 10); // Run at most 10 batches at once
      
      console.log(`\n=== Running ${batchesToRun} batches of 50 trials (${batchesToRun * BATCH_SIZE} total) ===`);
      
      // Run multiple batches
      for (let i = 0; i < batchesToRun; i++) {
        console.log(`\nStarting batch ${i + 1} of ${batchesToRun}...`);
        execSync('node import_batch_of_50.js', { stdio: 'inherit' });
        batchesRun++;
      }
      
      // Update current count
      currentCount = await getHealthCanadaCount();
      console.log(`\nProgress update: ${currentCount}/${TARGET_COUNT} Health Canada trials (${Math.round(currentCount/TARGET_COUNT*100)}%)`);
      
      // Exit if we've run 20+ batches but still haven't reached target (safety check)
      if (batchesRun >= 20 && currentCount < TARGET_COUNT) {
        console.log('Warning: 20+ batches run but target not reached. Please check for errors and restart.');
        break;
      }
    }
    
    if (currentCount >= TARGET_COUNT) {
      console.log(`\n=== Target Reached! ===`);
      console.log(`Target of ${TARGET_COUNT} Health Canada trials has been reached.`);
      console.log(`Current count: ${currentCount} trials`);
      console.log(`Batches run: ${batchesRun}`);
    }
    
  } catch (error) {
    console.error('Error during batch runs:', error);
  } finally {
    await pool.end();
  }
  
  console.log('Process completed at:', new Date().toISOString());
}

// Run the main function
runUntilTarget();