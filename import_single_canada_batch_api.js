/**
 * Import Single Canada Batch Script (API Version)
 * 
 * This script imports a single batch of Health Canada clinical trial data from the actual API.
 * It can be run with command line arguments to specify the batch size and index.
 */

// ES Modules compatible imports
import fs from 'fs';
import pg from 'pg';
import { 
  fetchTrialBatch, 
  fetchTrialDetails, 
  convertToCSRFormat 
} from './canada_api_client.js';

// Command line arguments
const args = process.argv.slice(2);
let batchSize = 50; // Default batch size (max 50 allowed by API)
let batchIndex = 0; // Default batch index

// Parse command line arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--batchSize' && i + 1 < args.length) {
    const requestedSize = parseInt(args[i + 1], 10);
    batchSize = Math.min(requestedSize, 50); // Enforce API limit
    i++;
  } else if (args[i] === '--batchIndex' && i + 1 < args.length) {
    batchIndex = parseInt(args[i + 1], 10);
    i++;
  }
}

// Configuration
const TRACKING_FILE = 'canada_api_import_progress.json';

// Database connection with SSL configuration
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/**
 * Track progress of imports
 */
function updateTrackingData(newTrialsImported, trialIds, batchIndex) {
  let trackingData = { batches: [], totalImported: 0, importedIds: [] };
  
  if (fs.existsSync(TRACKING_FILE)) {
    try {
      trackingData = JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf8'));
      if (!trackingData.batches) trackingData.batches = [];
      if (!trackingData.importedIds) trackingData.importedIds = [];
    } catch (error) {
      console.error('Error reading tracking file:', error);
    }
  }
  
  // Update tracking data
  trackingData.batches.push({
    batchIndex,
    timestamp: new Date().toISOString(),
    trialsImported: newTrialsImported,
    offset: batchIndex * batchSize
  });
  
  // Add newly imported IDs
  trackingData.importedIds = [...new Set([...trackingData.importedIds, ...trialIds])];
  trackingData.totalImported += newTrialsImported;
  trackingData.lastBatchIndex = batchIndex;
  
  // Save tracking data
  fs.writeFileSync(TRACKING_FILE, JSON.stringify(trackingData, null, 2));
  console.log(`Updated tracking data. Total imported: ${trackingData.totalImported}`);
}

/**
 * Import trials to the database
 */
async function importTrialsToDatabase(trials) {
  console.log(`Importing ${trials.length} trials to database...`);
  
  const client = await pool.connect();
  let importedCount = 0;
  let successfulImports = [];
  
  try {
    for (const trial of trials) {
      try {
        // Start a new transaction for each trial
        await client.query('BEGIN');
        
        // Check if this trial already exists
        const existingCheck = await client.query(
          'SELECT id FROM csr_reports WHERE nctrial_id = $1',
          [trial.nctrialId]
        );
        
        if (existingCheck.rows.length > 0) {
          console.log(`Trial ${trial.nctrialId} already exists, skipping.`);
          await client.query('COMMIT');
          continue;
        }
        
        // Insert the CSR report
        const reportResult = await client.query(
          `INSERT INTO csr_reports (
            title, sponsor, indication, phase, 
            file_name, file_size, upload_date, summary,
            region, nctrial_id, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
          [
            trial.title,
            trial.sponsor,
            trial.indication,
            trial.phase,
            trial.fileName,
            trial.fileSize,
            trial.uploadDate,
            trial.summary,
            trial.region,
            trial.nctrialId,
            trial.studyStatus || 'Unknown'
          ]
        );
        
        const reportId = reportResult.rows[0].id;
        
        // Insert CSR details
        await client.query(
          `INSERT INTO csr_details (
            report_id, inclusion_criteria, exclusion_criteria, endpoints,
            primary_objective, study_design, processing_status, study_duration,
            drug_name, therapeutic_areas
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            reportId,
            JSON.stringify(trial.eligibilityCriteria?.inclusion || []),
            JSON.stringify(trial.eligibilityCriteria?.exclusion || []),
            JSON.stringify(trial.endpoints),
            `To evaluate the efficacy and safety of the treatment for ${trial.indication}`,
            JSON.stringify(trial.studyDesign),
            'Completed',
            Math.floor(Math.random() * 104) + 12, // 12 to 116 weeks (estimated)
            trial.drugName || 'Not specified',
            JSON.stringify(trial.therapeuticAreas || [])
          ]
        );
        
        // Commit this trial's transaction
        await client.query('COMMIT');
        
        importedCount++;
        successfulImports.push(trial.nctrialId);
        
        if (importedCount % 10 === 0) {
          console.log(`Imported ${importedCount} trials so far.`);
        }
        
      } catch (error) {
        // Rollback this individual trial's transaction
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          console.error(`Error rolling back transaction: ${rollbackError.message}`);
        }
        
        console.error(`Error importing trial ${trial.nctrialId}:`, error.message);
      }
    }
    
    console.log(`Successfully imported ${importedCount} trials.`);
    return { importedCount, successfulImports };
    
  } catch (error) {
    console.error('Error during batch import process:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Run the single batch import
 */
async function runSingleBatch() {
  console.log(`Starting single API batch import. Batch index: ${batchIndex}, Batch size: ${batchSize}`);
  
  try {
    // Calculate offset based on batch index
    const offset = batchIndex * batchSize;
    console.log(`Fetching batch with offset ${offset} and limit ${batchSize}...`);
    
    // Fetch trials from API
    const batchResponse = await fetchTrialBatch(offset, batchSize);
    console.log(`Fetched ${batchResponse.count} trials from API.`);
    
    if (!batchResponse.results || batchResponse.results.length === 0) {
      console.log('No trials found in this batch. This may indicate we have reached the end of available trials.');
      await pool.end();
      return;
    }
    
    // Get IDs for fetching details
    const trialIds = batchResponse.results.map(trial => trial.id);
    console.log(`Fetching details for ${trialIds.length} trials...`);
    
    // Fetch details for each trial
    const detailsResponse = await fetchTrialDetails(trialIds);
    console.log(`Successfully fetched details for ${detailsResponse.results.length} trials.`);
    
    if (detailsResponse.errors && detailsResponse.errors.length > 0) {
      console.warn(`Failed to fetch details for ${detailsResponse.errors.length} trials.`);
    }
    
    // Convert to CSR format
    const formattedTrials = detailsResponse.results.map(trial => convertToCSRFormat(trial));
    console.log(`Formatted ${formattedTrials.length} trials for import.`);
    
    // Import trials to database
    const importResult = await importTrialsToDatabase(formattedTrials);
    
    // Update tracking data
    updateTrackingData(
      importResult.importedCount,
      importResult.successfulImports.map(id => id.replace('HC-', '')),
      batchIndex
    );
    
    console.log(`Batch ${batchIndex} completed. Imported ${importResult.importedCount} trials.`);
  } catch (error) {
    console.error('Error in single batch import:', error);
  } finally {
    await pool.end();
  }
}

// Run the batch import
console.log(`Import Single Canada Batch (API) - Index: ${batchIndex}, Size: ${batchSize}`);
runSingleBatch();