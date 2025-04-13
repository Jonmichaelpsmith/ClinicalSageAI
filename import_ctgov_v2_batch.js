/**
 * Import ClinicalTrials.gov V2 API Records
 * 
 * This script coordinates the downloading and importing of ClinicalTrials.gov
 * records using the new V2 API format. It works in batches of 50 trials
 * and tracks progress separately from the V1 API import process.
 */

import { exec } from 'child_process';
import fs from 'fs';

const PROGRESS_FILE = 'ctgov_v2_import_progress.json';
const TARGET_COUNT = 500;
const BATCH_SIZE = 50;

// Get or initialize progress
function getProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  }
  return {
    batchesRun: 0,
    trialsImported: 0,
    lastRun: null,
    complete: false
  };
}

// Save progress
function saveProgress(progress) {
  progress.lastRun = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  console.log(`Progress saved: ${progress.trialsImported}/${TARGET_COUNT} trials imported.`);
}

// Run a single batch
function runBatch() {
  return new Promise((resolve, reject) => {
    console.log('Starting batch download and import...');
    
    exec('node download_clinicaltrials_v2.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution error: ${error.message}`);
        return reject(error);
      }
      
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      
      console.log(`stdout: ${stdout}`);
      
      // Parse the output to find the number of trials imported
      const successMatch = stdout.match(/Downloaded and imported (\d+) new trials/);
      const totalMatch = stdout.match(/Total downloaded so far: (\d+)/);
      
      if (successMatch && successMatch[1]) {
        const importedCount = parseInt(successMatch[1]);
        const totalCount = totalMatch && totalMatch[1] ? parseInt(totalMatch[1]) : 0;
        
        resolve({
          batchCount: importedCount,
          totalCount: totalCount
        });
      } else {
        resolve({
          batchCount: 0,
          totalCount: 0
        });
      }
    });
  });
}

// Main import function
async function runImport() {
  console.log(`Starting CTGov V2 import process. Target: ${TARGET_COUNT} trials`);
  
  let progress = getProgress();
  console.log(`Current progress: ${progress.trialsImported}/${TARGET_COUNT} trials imported`);
  
  // Check if we've reached our target
  if (progress.trialsImported >= TARGET_COUNT) {
    console.log('Target already reached. Import complete.');
    progress.complete = true;
    saveProgress(progress);
    return;
  }
  
  try {
    const result = await runBatch();
    
    progress.batchesRun++;
    progress.trialsImported += result.batchCount;
    
    saveProgress(progress);
    
    console.log(`Batch completed. ${result.batchCount} trials imported in this batch.`);
    console.log(`Total progress: ${progress.trialsImported}/${TARGET_COUNT} trials imported`);
    
    // Check if we've reached our target
    if (progress.trialsImported >= TARGET_COUNT) {
      console.log('Target reached. Import complete.');
      progress.complete = true;
      saveProgress(progress);
    } else {
      console.log(`Need to import ${TARGET_COUNT - progress.trialsImported} more trials.`);
    }
  } catch (error) {
    console.error('Error running import batch:', error);
  }
}

// Run the import
runImport().catch(error => {
  console.error('Error in import process:', error);
});