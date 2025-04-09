// Import v2 data test script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchClinicalTrialData, importTrialsFromApiV2 } from '../data-importer';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    console.log('Running V2 API test import...');
    
    // Directly fetch data using our updated API v2 fetcher
    console.log('Fetching data from ClinicalTrials.gov API v2...');
    const fetchResult = await fetchClinicalTrialData(5, false);
    
    if (fetchResult.success && fetchResult.data) {
      console.log(`Successfully fetched ${fetchResult.data.studies.length} studies`);
      
      // Import the data
      console.log('Importing data...');
      const importResult = await importTrialsFromApiV2(fetchResult.data);
      console.log('Import result:', importResult);
    } else {
      console.error('Failed to fetch data:', fetchResult.message);
    }
  } catch (error) {
    console.error('Error in main:', error);
  }
}

// Run the test
main();