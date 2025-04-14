/**
 * Canada Batch Manager
 * 
 * This script manages the import of Health Canada clinical trial data in batches of maximum 50 trials.
 * It includes functionality to:
 * 1. Track progress across runs
 * 2. Allow sequential and parallel import strategies
 * 3. Handle import failures gracefully
 * 4. Provide detailed reporting
 */

// ES Modules compatible imports
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import https from 'https';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// Constants
const MAX_BATCH_SIZE = 50;
const DEFAULT_BATCH_COUNT = 1;
const PROGRESS_FILE = 'canada_batch_sequence_progress.json';
const IMPORT_SCRIPT = 'import_single_canada_batch_api.js'; // Use the real API script
const API_BASE_URL = 'https://clinical-information.canada.ca/ci-rc/api';

// Command line arguments
const args = process.argv.slice(2);
let batchSize = MAX_BATCH_SIZE; // Default batch size
let batchCount = DEFAULT_BATCH_COUNT; // Default number of batches to run
let startIndex = null; // Starting batch index (null = continue from last)
let parallel = false; // Whether to run batches in parallel

// Parse command line arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--batchSize' && i + 1 < args.length) {
    const requestedSize = parseInt(args[i + 1], 10);
    batchSize = Math.min(requestedSize, MAX_BATCH_SIZE); // Enforce max batch size
    console.log(`Setting batch size to ${batchSize} (max allowed: ${MAX_BATCH_SIZE})`);
    i++;
  } else if (args[i] === '--batchCount' && i + 1 < args.length) {
    batchCount = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--startIndex' && i + 1 < args.length) {
    startIndex = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--parallel') {
    parallel = true;
  } else if (args[i] === '--reset') {
    // Delete progress file if reset is requested
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
      console.log('Progress file reset.');
    }
  } else if (args[i] === '--help' || args[i] === '-h') {
    showHelp();
    process.exit(0);
  }
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
Canada Batch Manager - Health Canada CSR Import Tool
===================================================

This tool manages the import of Health Canada clinical trial data in controlled batches.

Options:
  --batchSize <n>    Set the size of each batch (max: ${MAX_BATCH_SIZE}, default: ${MAX_BATCH_SIZE})
  --batchCount <n>   Set the number of batches to run (default: ${DEFAULT_BATCH_COUNT})
  --startIndex <n>   Specify the starting batch index (default: continue from last)
  --parallel         Run batches in parallel (default: sequential)
  --reset            Reset progress tracking and start from beginning
  --help, -h         Show this help message

Examples:
  node canada_batch_manager.js --batchCount 5 
    Run 5 sequential batches of ${MAX_BATCH_SIZE} trials each
  
  node canada_batch_manager.js --batchSize 30 --batchCount 10 --parallel
    Run 10 parallel batches of 30 trials each
  
  node canada_batch_manager.js --startIndex 20 --batchCount 5
    Run 5 sequential batches starting from batch #20
  `);
}

/**
 * Load the progress data from file
 */
function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      const data = fs.readFileSync(PROGRESS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading progress file: ${error.message}`);
    }
  }
  
  // Default progress object
  return {
    lastBatchIndex: -1,
    batchesCompleted: 0,
    totalImported: 0,
    batches: [],
    startTime: new Date().toISOString(),
    lastUpdateTime: new Date().toISOString()
  };
}

/**
 * Save progress data to file
 */
function saveProgress(progressData) {
  progressData.lastUpdateTime = new Date().toISOString();
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progressData, null, 2));
  } catch (error) {
    console.error(`Error saving progress file: ${error.message}`);
  }
}

/**
 * Update progress with batch results
 */
function updateProgress(progressData, batchIndex, importCount, success, error = null) {
  const batchInfo = {
    batchIndex,
    timestamp: new Date().toISOString(),
    trialsImported: importCount,
    success
  };
  
  if (error) {
    batchInfo.error = error.message || String(error);
  }
  
  progressData.batches.push(batchInfo);
  
  if (success) {
    progressData.batchesCompleted++;
    progressData.totalImported += importCount;
  }
  
  progressData.lastBatchIndex = Math.max(progressData.lastBatchIndex, batchIndex);
  saveProgress(progressData);
  
  return progressData;
}

/**
 * Get current database statistics
 */
async function getDatabaseStats() {
  // Database connection with SSL configuration
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    const client = await pool.connect();
    
    try {
      // Get total CSR count
      const totalResult = await client.query('SELECT COUNT(*) FROM csr_reports');
      const total = parseInt(totalResult.rows[0].count, 10);
      
      // Get Health Canada CSR count
      const canadaResult = await client.query("SELECT COUNT(*) FROM csr_reports WHERE region = 'Health Canada'");
      const canadaCount = parseInt(canadaResult.rows[0].count, 10);
      
      // Get phase distribution
      const phaseResult = await client.query("SELECT phase, COUNT(*) FROM csr_reports WHERE region = 'Health Canada' GROUP BY phase");
      const phases = phaseResult.rows.reduce((acc, row) => {
        acc[row.phase || 'Unknown'] = parseInt(row.count, 10);
        return acc;
      }, {});
      
      // Get indication distribution (top 10)
      const indicationResult = await client.query(
        "SELECT indication, COUNT(*) FROM csr_reports WHERE region = 'Health Canada' GROUP BY indication ORDER BY COUNT(*) DESC LIMIT 10"
      );
      const indications = indicationResult.rows.reduce((acc, row) => {
        acc[row.indication || 'Unknown'] = parseInt(row.count, 10);
        return acc;
      }, {});
      
      return {
        total,
        canadaCount,
        phases,
        topIndications: indications
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Database stats error: ${error.message}`);
    return {
      error: error.message
    };
  } finally {
    await pool.end();
  }
}

/**
 * Run a single batch import process
 */
function runBatch(batchIndex, batchSize) {
  return new Promise((resolve, reject) => {
    console.log(`Starting batch import for index ${batchIndex} with size ${batchSize}...`);
    
    const process = spawn('node', [
      IMPORT_SCRIPT,
      '--batchIndex', batchIndex.toString(),
      '--batchSize', batchSize.toString()
    ]);
    
    let output = '';
    let errorOutput = '';
    
    process.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      console.log(`[Batch ${batchIndex}] ${chunk.trim()}`);
    });
    
    process.stderr.on('data', (data) => {
      const chunk = data.toString();
      errorOutput += chunk;
      console.error(`[Batch ${batchIndex} ERROR] ${chunk.trim()}`);
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        // Parse output to find import count
        const importedMatch = output.match(/Successfully imported (\d+) trials/);
        const importedCount = importedMatch ? parseInt(importedMatch[1], 10) : 0;
        
        console.log(`✅ Batch ${batchIndex} completed successfully. Imported ${importedCount} trials.`);
        resolve({ success: true, importedCount });
      } else {
        console.error(`❌ Batch ${batchIndex} failed with code ${code}`);
        reject(new Error(`Batch process exited with code ${code}: ${errorOutput}`));
      }
    });
  });
}

/**
 * Run multiple batches sequentially
 */
async function runSequentialBatches(startIndex, batchCount, batchSize, progressData) {
  console.log(`Running ${batchCount} sequential batches starting from index ${startIndex}...`);
  
  for (let i = 0; i < batchCount; i++) {
    const batchIndex = startIndex + i;
    
    try {
      const result = await runBatch(batchIndex, batchSize);
      progressData = updateProgress(progressData, batchIndex, result.importedCount, true);
    } catch (error) {
      console.error(`Error in batch ${batchIndex}:`, error);
      progressData = updateProgress(progressData, batchIndex, 0, false, error);
    }
  }
  
  return progressData;
}

/**
 * Run multiple batches in parallel
 */
async function runParallelBatches(startIndex, batchCount, batchSize, progressData) {
  console.log(`Running ${batchCount} parallel batches starting from index ${startIndex}...`);
  
  const batchPromises = [];
  
  for (let i = 0; i < batchCount; i++) {
    const batchIndex = startIndex + i;
    
    const batchPromise = runBatch(batchIndex, batchSize)
      .then(result => {
        progressData = updateProgress(progressData, batchIndex, result.importedCount, true);
        return { batchIndex, success: true, importedCount: result.importedCount };
      })
      .catch(error => {
        progressData = updateProgress(progressData, batchIndex, 0, false, error);
        return { batchIndex, success: false, error };
      });
    
    batchPromises.push(batchPromise);
  }
  
  const results = await Promise.all(batchPromises);
  
  // Log summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`Parallel batch execution complete: ${successful} successful, ${failed} failed.`);
  
  return progressData;
}

/**
 * Display result summary
 */
function displaySummary(progressData, dbStats) {
  console.log('\n====== Import Summary ======');
  console.log(`Total batches completed: ${progressData.batchesCompleted}`);
  console.log(`Total trials imported: ${progressData.totalImported}`);
  console.log(`Last batch index: ${progressData.lastBatchIndex}`);
  console.log(`Started: ${progressData.startTime}`);
  console.log(`Last update: ${progressData.lastUpdateTime}`);
  
  if (dbStats) {
    console.log('\n====== Database Stats ======');
    console.log(`Total CSRs in database: ${dbStats.total}`);
    console.log(`Health Canada CSRs: ${dbStats.canadaCount}`);
    
    if (dbStats.phases) {
      console.log('\nPhase distribution:');
      Object.entries(dbStats.phases).forEach(([phase, count]) => {
        console.log(`  ${phase}: ${count}`);
      });
    }
    
    if (dbStats.topIndications) {
      console.log('\nTop indications:');
      Object.entries(dbStats.topIndications).forEach(([indication, count]) => {
        console.log(`  ${indication}: ${count}`);
      });
    }
  }
}

/**
 * Main function to run the batch import process
 */
async function main() {
  console.log('Canada Batch Manager - Starting import process');
  
  // Load progress data
  const progressData = loadProgress();
  
  // Determine starting batch index
  const nextBatchIndex = startIndex !== null 
    ? startIndex 
    : (progressData.lastBatchIndex + 1);
  
  console.log(`Starting from batch index ${nextBatchIndex}`);
  
  // Run batches
  if (parallel) {
    await runParallelBatches(nextBatchIndex, batchCount, batchSize, progressData);
  } else {
    await runSequentialBatches(nextBatchIndex, batchCount, batchSize, progressData);
  }
  
  // Get database stats
  const dbStats = await getDatabaseStats();
  
  // Display summary
  displaySummary(progressData, dbStats);
}

// Run the main function
main().catch(error => {
  console.error('Error in batch manager:', error);
  process.exit(1);
});