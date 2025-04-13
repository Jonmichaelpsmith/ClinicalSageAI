/**
 * Import a single batch of CSRs from Health Canada
 * This is specifically designed to work with the Health Canada API
 */
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xml2js from 'xml2js';
import pkg from 'pg';
const { Pool } = pkg;
import { importTrialsFromApiV2 } from './server/data-importer.js';

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure batch size from command line or use default
const args = process.argv.slice(2);
let batchSize = 50; // Default batch size
let batchIndex = 0;

// Parse command line arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--batchSize' && args[i + 1]) {
    batchSize = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--batchIndex' && args[i + 1]) {
    batchIndex = parseInt(args[i + 1], 10);
    i++;
  }
}

// Track CSRs already imported to avoid duplicates
const IMPORT_TRACKER_FILE = 'hc_import_tracker.json';
let importedIds = [];

if (fs.existsSync(IMPORT_TRACKER_FILE)) {
  try {
    importedIds = JSON.parse(fs.readFileSync(IMPORT_TRACKER_FILE, 'utf8')).importedIds || [];
    console.log(`Loaded ${importedIds.length} previously imported IDs`);
  } catch (err) {
    console.error('Error loading import tracker, starting fresh:', err);
  }
}

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Health Canada API endpoints
const HC_API_BASE = 'https://clinical-information.canada.ca/ci-rc/api';
const HC_SEARCH_ENDPOINT = `${HC_API_BASE}/search`;
const HC_DETAIL_ENDPOINT = `${HC_API_BASE}/clinical-trial`;

// Ensure directories exist
const attachedAssetsDir = path.join(process.cwd(), 'attached_assets');
if (!fs.existsSync(attachedAssetsDir)) {
  fs.mkdirSync(attachedAssetsDir, { recursive: true });
}

/**
 * Main function to import a batch of CSRs from Health Canada
 */
async function importCanadaCSRBatch() {
  try {
    console.log(`Starting import of ${batchSize} CSRs from Health Canada (batch ${batchIndex})...`);
    
    // 1. Search for clinical trials
    const searchParams = {
      lang: 'en',
      type: 'search',
      query: '*',
      page: batchIndex,
      pageSize: batchSize
    };
    
    console.log(`Searching for trials with parameters:`, searchParams);
    const searchResponse = await axios.get(HC_SEARCH_ENDPOINT, { params: searchParams });
    
    if (!searchResponse.data || !searchResponse.data.content) {
      throw new Error('Invalid response format from Health Canada search API');
    }
    
    // Filter out already imported trials
    const trials = searchResponse.data.content.filter(trial => !importedIds.includes(trial.protocolId));
    
    if (trials.length === 0) {
      console.log('No new trials found in this batch. Try increasing the batch index.');
      
      // Advance batch index if no new trials found
      batchIndex++;
      console.log(`Automatically advancing to batch index ${batchIndex}...`);
      
      // Retry with the next batch
      searchParams.page = batchIndex;
      const retryResponse = await axios.get(HC_SEARCH_ENDPOINT, { params: searchParams });
      
      if (!retryResponse.data || !retryResponse.data.content) {
        throw new Error('Invalid response format from Health Canada search API on retry');
      }
      
      // Check again with the new batch
      const retryTrials = retryResponse.data.content.filter(trial => !importedIds.includes(trial.protocolId));
      
      if (retryTrials.length === 0) {
        console.log('Still no new trials found after advancing batch index. Stopping.');
        return { success: true, imported: 0, message: 'No new trials found after retry' };
      }
      
      console.log(`Found ${retryTrials.length} trials to import in new batch (index ${batchIndex})`);
      
      // Use the trials from the retry
      trials.push(...retryTrials);
    }
    
    console.log(`Found ${trials.length} trials to import (filtered from ${searchResponse.data.content.length})`);
    
    // 2. Download details and XML for each trial
    const importedTrials = [];
    for (let i = 0; i < trials.length; i++) {
      const trial = trials[i];
      try {
        console.log(`Processing trial ${i+1}/${trials.length}: ${trial.protocolId}`);
        
        // Get detailed information
        const detailUrl = `${HC_DETAIL_ENDPOINT}/${trial.protocolId}?lang=en`;
        const detailResponse = await axios.get(detailUrl);
        
        if (!detailResponse.data) {
          console.error(`Error getting details for trial ${trial.protocolId}: Invalid response`);
          continue;
        }
        
        // Download the XML data
        const xmlResponse = await axios.get(detailResponse.data._links.xml.href);
        const xmlData = xmlResponse.data;
        
        // Save XML to file
        const xmlFilename = `NCT${trial.protocolId}.xml`;
        const xmlPath = path.join(attachedAssetsDir, xmlFilename);
        fs.writeFileSync(xmlPath, xmlData);
        
        console.log(`Saved XML for trial ${trial.protocolId} to ${xmlPath}`);
        
        // Convert to JSON format compatible with our importer
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlData);
        
        // Transform to the format expected by the importer
        const transformedData = {
          id: trial.protocolId,
          title: detailResponse.data.scientificTitle || 'Unknown',
          sponsor: detailResponse.data.sponsor?.name || 'Unknown',
          phase: detailResponse.data.phase || 'Unknown',
          status: detailResponse.data.status || 'Unknown',
          indication: detailResponse.data.healthCondition?.join(', ') || 'Unknown',
          interventions: detailResponse.data.intervention?.join(', ') || 'Unknown',
          fileName: xmlFilename,
          filePath: xmlPath,
          fileSize: fs.statSync(xmlPath).size,
          uploadDate: new Date(),
          source: 'health_canada'
        };
        
        // Store the imported ID
        importedIds.push(trial.protocolId);
        importedTrials.push(transformedData);
        
        // Save the imported IDs list after each successful import to avoid duplicates
        fs.writeFileSync(IMPORT_TRACKER_FILE, JSON.stringify({ importedIds }, null, 2));
      } catch (error) {
        console.error(`Error processing trial ${trial.protocolId}:`, error);
      }
    }
    
    // 3. Import transformed data into our database
    if (importedTrials.length > 0) {
      console.log(`Importing ${importedTrials.length} trials into database...`);
      
      // Use the existing import function
      const result = await importTrialsFromApiV2(importedTrials);
      
      console.log(`Import completed. Results:`, result);
      return { 
        success: true, 
        imported: importedTrials.length,
        message: `Successfully imported ${importedTrials.length} trials from Health Canada`
      };
    } else {
      return { 
        success: true, 
        imported: 0, 
        message: 'No trials were successfully processed in this batch' 
      };
    }
  } catch (error) {
    console.error('Error importing CSR batch from Health Canada:', error);
    return { 
      success: false, 
      imported: 0, 
      error: error.message || 'Unknown error',
      message: 'Failed to import batch' 
    };
  }
}

// Run the import process
importCanadaCSRBatch().then(result => {
  console.log('Batch import completed with result:', result);
  process.exit(result.success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error during import:', error);
  process.exit(1);
});