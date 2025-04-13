/**
 * Download and Import ClinicalTrials.gov Records using V2 API
 * 
 * This script handles downloading trial data from the ClinicalTrials.gov API V2 
 * in JSON format, saving it to disk, and then processing it into the database.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import pg from 'pg';

// Configuration
const NUM_TO_DOWNLOAD = 10; // Reduced number of trials to download per batch for better reliability
const OUTPUT_DIR = path.join('.', 'attached_assets', 'ctgov_v2');
const DOWNLOAD_LOG = 'ctgov_v2_downloaded.json';

// Database connection with more reliable configuration
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 10000, // How long to wait for a connection to become available
  maxUses: 7500, // Close and replace a client after it has been used this many times
  // Error handler prevents server crashes on connection issues
  on: 'error', 
  error: (err, client) => {
    console.error('Unexpected error on idle client', err);
    // Do not crash on connection errors
  }
});

// Sample of known valid NCT IDs (a mix of older and newer trials)
const KNOWN_VALID_NCTIDS = [
  'NCT03811366', 'NCT03794050', 'NCT03785600', 'NCT03792139', 'NCT03815682',
  'NCT03814343', 'NCT03787836', 'NCT03800550', 'NCT03808376', 'NCT03798106',
  'NCT03808727', 'NCT03808844', 'NCT03803072', 'NCT03800823', 'NCT03793439',
  'NCT03809169', 'NCT03797274', 'NCT03805269', 'NCT03785704', 'NCT03812861',
  'NCT04572633', 'NCT04572646', 'NCT04569760', 'NCT04574362', 'NCT04575337',
  'NCT04577599', 'NCT04578366', 'NCT04572464', 'NCT04576442', 'NCT04570527',
  'NCT04573764', 'NCT04566159', 'NCT04571970', 'NCT04577430', 'NCT04577300',
  'NCT04573036', 'NCT04572334', 'NCT04571814', 'NCT04576130', 'NCT04568928',
  'NCT05570149', 'NCT05567341', 'NCT05566977', 'NCT05567653', 'NCT05569824',
  'NCT05569889', 'NCT05567692', 'NCT05570006', 'NCT05569550', 'NCT05567406'
];

// Initialize download log
function getDownloadLog() {
  if (fs.existsSync(DOWNLOAD_LOG)) {
    return JSON.parse(fs.readFileSync(DOWNLOAD_LOG, 'utf8'));
  }
  return {
    downloadedIds: [],
    lastNCTID: 'NCT03700000', // Initialize with a value smaller than our known valid IDs
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

// Download JSON file from ClinicalTrials.gov API V2 with retry mechanism
function downloadTrialJSON(nctId, retryCount = 0) {
  const MAX_RETRIES = 5; // Increased from 3 to 5 for better resilience
  
  return new Promise((resolve, reject) => {
    const url = `https://clinicaltrials.gov/api/v2/studies/${nctId}?format=json`;
    const outputPath = path.join(OUTPUT_DIR, `${nctId}.json`);
    
    // Check if file already exists
    if (fs.existsSync(outputPath)) {
      console.log(`File ${nctId}.json already exists, skipping.`);
      resolve(false);
      return;
    }
    
    console.log(`Downloading ${nctId} from ${url}`);
    
    const file = fs.createWriteStream(outputPath);
    
    // Create request with timeout
    const req = https.get(url, { timeout: 30000 }, (response) => {
      // Handle HTTP redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const location = response.headers.location;
        console.log(`Redirected to ${location}`);
        file.close();
        fs.unlinkSync(outputPath); // Remove the incomplete file
        
        // Handle relative URLs in redirects
        let redirectUrl = location;
        if (location.startsWith('/')) {
          redirectUrl = `https://clinicaltrials.gov${location}`;
        }
        
        console.log(`Following redirect to ${redirectUrl}`);
        
        const redirectReq = https.get(redirectUrl, { timeout: 30000 }, (finalResponse) => {
          finalResponse.pipe(file);
          
          file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${nctId}.json`);
            resolve(true);
          });
        }).on('error', (err) => {
          fs.unlinkSync(outputPath); // Remove the incomplete file
          console.error(`Error following redirect for ${nctId}: ${err.message}`);
          
          // Add retry logic for redirect errors
          if (retryCount < MAX_RETRIES) {
            console.log(`Retrying download for ${nctId} after redirect failure (attempt ${retryCount + 1} of ${MAX_RETRIES})...`);
            // Exponential backoff for retries
            const retryDelay = 5000 * Math.pow(2, retryCount);
            setTimeout(() => {
              resolve(downloadTrialJSON(nctId, retryCount + 1));
            }, retryDelay);
          } else {
            console.error(`Failed to download ${nctId} after ${MAX_RETRIES} attempts.`);
            reject(err);
          }
        });
        
        return;
      }
      
      // Handle direct response
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(outputPath); // Remove the incomplete file
        
        // Check if this is a retriable status code
        const isRetriable = [429, 500, 502, 503, 504].includes(response.statusCode);
        
        if (isRetriable && retryCount < MAX_RETRIES) {
          console.log(`Received status code ${response.statusCode} for ${nctId}, will retry (attempt ${retryCount + 1} of ${MAX_RETRIES})...`);
          // Use exponential backoff with longer delays for rate limiting (429)
          const retryDelay = response.statusCode === 429 
            ? 10000 * Math.pow(2, retryCount) // Longer delay for rate limiting
            : 5000 * Math.pow(2, retryCount);  // Standard delay for server errors
            
          setTimeout(() => {
            resolve(downloadTrialJSON(nctId, retryCount + 1));
          }, retryDelay);
          return;
        }
        
        reject(new Error(`Failed to download ${nctId}. Status code: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${nctId}.json`);
        
        // Check if file is valid JSON (contains trial data)
        try {
          const content = fs.readFileSync(outputPath, 'utf8');
          const data = JSON.parse(content);
          
          // Verify that this is a valid trial with basic data
          if (!data.protocolSection || !data.protocolSection.identificationModule) {
            console.warn(`${nctId}.json does not contain valid trial data, removing file.`);
            fs.unlinkSync(outputPath);
            resolve(false);
            return;
          }
          
          resolve(true);
        } catch (error) {
          console.warn(`${nctId}.json is not valid JSON, removing file.`);
          fs.unlinkSync(outputPath);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(outputPath); // Remove the incomplete file
      console.error(`Error downloading ${nctId}: ${err.message}`);
      
      // Add retry logic
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying download for ${nctId} (attempt ${retryCount + 1} of ${MAX_RETRIES})...`);
        // Wait longer between retries (exponential backoff)
        const retryDelay = 5000 * Math.pow(2, retryCount);
        setTimeout(() => {
          resolve(downloadTrialJSON(nctId, retryCount + 1));
        }, retryDelay);
      } else {
        console.error(`Failed to download ${nctId} after ${MAX_RETRIES} attempts.`);
        reject(err);
      }
    });
  });
}

// Generate a list of NCT IDs to try
function generateNCTIDs(startId, count) {
  // Filter out IDs that are "smaller" than our starting ID
  const validIds = KNOWN_VALID_NCTIDS.filter(id => id > startId);
  
  // Sort them numerically
  validIds.sort();
  
  // Take just what we need
  return validIds.slice(0, count * 3); // Generate more than we need to account for failures
}

// Extract relevant data from JSON trial and prepare for database insertion
function extractTrialData(nctId, jsonContent) {
  try {
    const data = JSON.parse(jsonContent);
    
    // Extract basic information from the protocol section
    const protocol = data.protocolSection;
    const identification = protocol.identificationModule || {};
    const design = protocol.designModule || {};
    const status = protocol.statusModule || {};
    const conditions = protocol.conditionsModule || {};
    const eligibility = protocol.eligibilityModule || {};
    const description = protocol.descriptionModule || {};
    const contacts = protocol.contactsLocationsModule || {};
    const sponsor = protocol.sponsorCollaboratorsModule || {};
    
    // Extract trial details
    return {
      title: identification.briefTitle || '',
      sponsor: (sponsor.leadSponsor ? sponsor.leadSponsor.name : '') || null,
      indication: (conditions.conditions ? conditions.conditions.join(', ') : '') || null,
      phase: (design.phases ? design.phases.join('/') : '') || null,
      fileName: `${nctId}.json`,
      fileSize: jsonContent.length,
      nctrial_id: nctId,
      uploadDate: new Date(),
      summary: description.briefSummary || null,
      status: status.overallStatus || null
    };
  } catch (error) {
    console.error(`Error extracting data from ${nctId}:`, error);
    return null;
  }
}

// Extract detailed information for the trial details table
function extractTrialDetails(reportId, jsonContent) {
  try {
    const data = JSON.parse(jsonContent);
    
    // Extract detailed information
    const protocol = data.protocolSection;
    const design = protocol.designModule || {};
    const eligibility = protocol.eligibilityModule || {};
    const outcomes = protocol.outcomesModule || {};
    const description = protocol.descriptionModule || {};
    
    // Primary and secondary outcomes
    const primaryOutcomes = outcomes.primaryOutcomes || [];
    const secondaryOutcomes = outcomes.secondaryOutcomes || [];
    
    // Inclusion and exclusion criteria
    const inclusionCriteria = eligibility.eligibilityCriteria || '';
    const inclusionList = inclusionCriteria.split(/\\n|\\r\\n/).filter(line => 
      line.trim().startsWith('Inclusion') || 
      (!line.trim().startsWith('Exclusion') && line.trim().length > 0)
    );
    
    const exclusionList = inclusionCriteria.split(/\\n|\\r\\n/).filter(line => 
      line.trim().startsWith('Exclusion')
    );
    
    return {
      reportId: reportId,
      studyDesign: design.designInfo || null,
      primaryObjective: description.detailedDescription || null,
      studyDescription: description.briefSummary || null,
      inclusionCriteria: inclusionList.length > 0 ? inclusionList : null,
      exclusionCriteria: exclusionList.length > 0 ? exclusionList : null,
      outcomes: primaryOutcomes.map(o => o.measure).concat(secondaryOutcomes.map(o => o.measure)),
      processingStatus: 'Processed',
      studyDuration: design.studyDesignInfo ? design.studyDesignInfo.duration : null
    };
  } catch (error) {
    console.error(`Error extracting details for report ${reportId}:`, error);
    return null;
  }
}

// Import a trial JSON file into the database
async function importTrialToDatabase(nctId) {
  try {
    const filePath = path.join(OUTPUT_DIR, `${nctId}.json`);
    if (!fs.existsSync(filePath)) {
      console.error(`File ${filePath} does not exist.`);
      return false;
    }
    
    // Read the JSON content
    const jsonContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract basic trial information
    const trialData = extractTrialData(nctId, jsonContent);
    if (!trialData) {
      console.error(`Could not extract trial data for ${nctId}.`);
      return false;
    }
    
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Insert into csr_reports table
      const reportResult = await client.query(`
        INSERT INTO csr_reports (
          title, sponsor, indication, phase, "fileName", "fileSize", 
          "nctrial_id", "uploadDate", summary, status
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `, [
        trialData.title,
        trialData.sponsor,
        trialData.indication,
        trialData.phase,
        trialData.fileName,
        trialData.fileSize,
        trialData.nctrial_id,
        trialData.uploadDate,
        trialData.summary,
        trialData.status
      ]);
      
      const reportId = reportResult.rows[0].id;
      
      // Extract and insert details
      const detailsData = extractTrialDetails(reportId, jsonContent);
      if (detailsData) {
        await client.query(`
          INSERT INTO csr_details (
            "reportId", "filePath", "studyDesign", "primaryObjective", 
            "studyDescription", "inclusionCriteria", "exclusionCriteria", 
            outcomes, "processingStatus", "studyDuration"
          ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          detailsData.reportId,
          filePath,
          detailsData.studyDesign,
          detailsData.primaryObjective,
          detailsData.studyDescription,
          detailsData.inclusionCriteria,
          detailsData.exclusionCriteria,
          detailsData.outcomes,
          detailsData.processingStatus,
          detailsData.studyDuration
        ]);
      }
      
      await client.query('COMMIT');
      console.log(`Successfully imported ${nctId} into database.`);
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error importing ${nctId} to database:`, error);
      return false;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error in importTrialToDatabase for ${nctId}:`, error);
    return false;
  }
}

// Main download and import function
async function downloadAndImportTrials() {
  // First, test the database connection
  let isDbConnected = false;
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    isDbConnected = true;
    console.log('Database connection verified');
  } catch (dbErr) {
    console.error('Failed to establish database connection:', dbErr);
    console.error('Will continue with downloads but imports will be skipped');
  }

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
    
    if (idsToTry.length === 0) {
      console.log('No more NCT IDs to try. All known IDs have been processed.');
      return { success: false, count: 0, total: downloadLog.totalDownloaded };
    }
    
    // Try downloading each ID
    for (const nctId of idsToTry) {
      // Check if we already have this trial in the database
      const exists = await checkTrialExists(nctId);
      
      if (exists) {
        console.log(`Trial ${nctId} already exists in database, skipping.`);
        continue;
      }
      
      try {
        // Download the JSON file
        const downloaded = await downloadTrialJSON(nctId);
        
        if (downloaded) {
          // Import to database
          const imported = await importTrialToDatabase(nctId);
          
          if (imported) {
            downloadLog.downloadedIds.push(nctId);
            lastSuccessfulId = nctId;
            successCount++;
          }
        }
        
        // Add a longer delay to avoid overwhelming the server and prevent timeouts
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // If we've downloaded enough, stop
        if (successCount >= NUM_TO_DOWNLOAD) {
          break;
        }
      } catch (error) {
        console.error(`Error processing ${nctId}:`, error);
        continue;
      }
    }
    
    // Update download log
    downloadLog.lastNCTID = lastSuccessfulId;
    downloadLog.totalDownloaded += successCount;
    saveDownloadLog(downloadLog);
    
    console.log(`Downloaded and imported ${successCount} new trials.`);
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

// Run the download and import
downloadAndImportTrials().then((result) => {
  if (result.success) {
    console.log('Download and import completed successfully.');
    process.exit(0);
  } else {
    console.error('No new trials downloaded and imported.');
    process.exit(1);
  }
}).catch((error) => {
  console.error('Error during download and import process:', error);
  process.exit(1);
});