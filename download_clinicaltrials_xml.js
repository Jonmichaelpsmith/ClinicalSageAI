/**
 * Download ClinicalTrials.gov XML Files
 * 
 * This script downloads XML files from ClinicalTrials.gov for trials that
 * are not already in our database. It will download a specified number of
 * trials and save them to the attached_assets directory.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import pg from 'pg';
import { spawn } from 'child_process';

const { Pool } = pg;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Constants
const NUM_TO_DOWNLOAD = 50; // Number of files to download in each batch
const OUTPUT_DIR = path.join('.', 'attached_assets');
const DOWNLOAD_LOG = 'downloaded_trials.json';

// Initialize download log
function getDownloadLog() {
  if (fs.existsSync(DOWNLOAD_LOG)) {
    return JSON.parse(fs.readFileSync(DOWNLOAD_LOG, 'utf8'));
  }
  return {
    downloadedIds: [],
    lastNCTID: 'NCT00000000', // Start from this ID
    totalDownloaded: 0,
    lastRunTime: null
  };
}

// Save download log
function saveDownloadLog(data) {
  data.lastRunTime = new Date().toISOString();
  fs.writeFileSync(DOWNLOAD_LOG, JSON.stringify(data, null, 2));
  console.log(`Download progress saved. Total downloaded: ${data.totalDownloaded}`);
}

// Check if an NCT ID already exists in the database
async function checkTrialExists(nctId) {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) 
      FROM csr_reports 
      WHERE "nctrial_id" = $1
    `, [nctId]);
    
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    console.error('Error checking if trial exists:', error);
    return true; // Assume it exists to avoid duplicate downloads
  }
}

// Download XML file from ClinicalTrials.gov
function downloadTrialXML(nctId) {
  return new Promise((resolve, reject) => {
    const url = `https://clinicaltrials.gov/ct2/show/${nctId}?resultsxml=true`;
    const outputPath = path.join(OUTPUT_DIR, `${nctId}.xml`);
    
    // Check if file already exists
    if (fs.existsSync(outputPath)) {
      console.log(`File ${nctId}.xml already exists, skipping.`);
      resolve(false);
      return;
    }
    
    console.log(`Downloading ${nctId} from ${url}`);
    
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      // Handle HTTP redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        console.log(`Redirected to ${response.headers.location}`);
        file.close();
        fs.unlinkSync(outputPath); // Remove the incomplete file
        
        https.get(response.headers.location, (finalResponse) => {
          finalResponse.pipe(file);
          
          file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${nctId}.xml`);
            resolve(true);
          });
        }).on('error', (err) => {
          fs.unlinkSync(outputPath); // Remove the incomplete file
          console.error(`Error downloading ${nctId}: ${err.message}`);
          reject(err);
        });
        
        return;
      }
      
      // Handle direct response
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(outputPath); // Remove the incomplete file
        reject(new Error(`Failed to download ${nctId}. Status code: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${nctId}.xml`);
        
        // Check if file is valid XML (contains "clinical_study" tag)
        const content = fs.readFileSync(outputPath, 'utf8');
        if (!content.includes('<clinical_study>')) {
          console.warn(`${nctId}.xml does not contain valid trial data, removing file.`);
          fs.unlinkSync(outputPath);
          resolve(false);
          return;
        }
        
        resolve(true);
      });
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(outputPath); // Remove the incomplete file
      console.error(`Error downloading ${nctId}: ${err.message}`);
      reject(err);
    });
  });
}

// Generate the next NCT ID to try
function getNextNCTID(lastNCTID) {
  // Extract the numeric part
  const numPart = parseInt(lastNCTID.replace('NCT', ''));
  // Increment and format with leading zeros
  const nextNum = numPart + 1;
  return `NCT${nextNum.toString().padStart(8, '0')}`;
}

// Generate a sequence of NCT IDs to try
function generateNCTIDs(startId, count) {
  const ids = [];
  let currentId = startId;
  
  for (let i = 0; i < count * 3; i++) { // Generate more than we need to account for failures
    currentId = getNextNCTID(currentId);
    ids.push(currentId);
  }
  
  return ids;
}

// Main download function
async function downloadTrialBatch() {
  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // Load download log
    const downloadLog = getDownloadLog();
    console.log(`Starting download from ID: ${downloadLog.lastNCTID}`);
    console.log(`Previously downloaded: ${downloadLog.totalDownloaded} files`);
    
    // Generate IDs to try
    const idsToTry = generateNCTIDs(downloadLog.lastNCTID, NUM_TO_DOWNLOAD);
    let successCount = 0;
    let lastSuccessfulId = downloadLog.lastNCTID;
    
    // Try downloading each ID
    for (const nctId of idsToTry) {
      // Check if we already have this trial in the database
      const exists = await checkTrialExists(nctId);
      
      if (exists) {
        console.log(`Trial ${nctId} already exists in database, skipping.`);
        continue;
      }
      
      try {
        const success = await downloadTrialXML(nctId);
        
        if (success) {
          downloadLog.downloadedIds.push(nctId);
          lastSuccessfulId = nctId;
          successCount++;
        }
        
        // Add a short delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // If we've downloaded enough, stop
        if (successCount >= NUM_TO_DOWNLOAD) {
          break;
        }
      } catch (error) {
        console.error(`Error downloading ${nctId}:`, error);
        continue;
      }
    }
    
    // Update download log
    downloadLog.lastNCTID = lastSuccessfulId;
    downloadLog.totalDownloaded += successCount;
    saveDownloadLog(downloadLog);
    
    console.log(`Downloaded ${successCount} new XML files.`);
    console.log(`Total downloaded so far: ${downloadLog.totalDownloaded}`);
    
    return {
      success: successCount > 0,
      count: successCount,
      total: downloadLog.totalDownloaded
    };
  } finally {
    await pool.end();
  }
}

// Run the download
downloadTrialBatch().then((result) => {
  if (result.success) {
    console.log('Download completed successfully.');
    process.exit(0);
  } else {
    console.error('No new trials downloaded.');
    process.exit(1);
  }
}).catch((error) => {
  console.error('Error during download process:', error);
  process.exit(1);
});