#!/usr/bin/env node

/**
 * Import Clinical Trials Data from ClinicalTrials.gov API v2
 * 
 * This script reads a JSON file with ClinicalTrials.gov API v2 data and imports it into the database.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { importTrialsFromApiV2 } from '../data-importer.js';

// Convert ESM __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Process a single data file
 */
async function processFile(filePath) {
  try {
    // Make sure the file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    console.log(`\nReading data from ${filePath}...`);
    
    // Read and parse the JSON data
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    console.log(`Importing ${data.studies?.length || 0} studies from file...`);
    
    // Import the data
    const result = await importTrialsFromApiV2(data);
    
    if (result.success) {
      console.log(`✅ Import complete for ${filePath}!`);
      console.log(`  - Imported ${result.count.new} new records`);
      console.log(`  - Updated ${result.count.updated} existing records`);
      if (result.count.errors > 0) {
        console.log(`  - Encountered ${result.count.errors} errors`);
      }
      return result;
    } else {
      throw new Error(`Import failed: ${result.message}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
    return {
      success: false,
      message: error.message,
      count: { new: 0, updated: 0, errors: 1 }
    };
  }
}

/**
 * Main function to handle the import process
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    
    // Check if any file paths were provided
    if (args.length === 0) {
      throw new Error('Please provide at least one JSON file path as an argument');
    }

    // If a directory is provided, process all JSON files in that directory
    if (args.length === 1 && fs.lstatSync(args[0]).isDirectory()) {
      const dirPath = args[0];
      console.log(`Processing all JSON files in directory: ${dirPath}`);
      
      const files = fs.readdirSync(dirPath)
        .filter(file => file.endsWith('.json') && file.includes('clinical_trials'))
        .map(file => path.join(dirPath, file));
      
      if (files.length === 0) {
        throw new Error(`No matching JSON files found in directory: ${dirPath}`);
      }
      
      console.log(`Found ${files.length} files to process`);
      
      let totalNew = 0;
      let totalUpdated = 0;
      let totalErrors = 0;
      
      for (const file of files) {
        const result = await processFile(file);
        if (result.success) {
          totalNew += result.count.new;
          totalUpdated += result.count.updated;
          totalErrors += result.count.errors;
        } else {
          totalErrors++;
        }
      }
      
      console.log(`\n📊 FINAL IMPORT SUMMARY`);
      console.log(`  - Total files processed: ${files.length}`);
      console.log(`  - Total new records: ${totalNew}`);
      console.log(`  - Total updated records: ${totalUpdated}`);
      console.log(`  - Total errors: ${totalErrors}`);
      
    } else {
      // Process each file provided as an argument
      let totalNew = 0;
      let totalUpdated = 0;
      let totalErrors = 0;
      
      for (const filePath of args) {
        const result = await processFile(filePath);
        if (result.success) {
          totalNew += result.count.new;
          totalUpdated += result.count.updated;
          totalErrors += result.count.errors;
        } else {
          totalErrors++;
        }
      }
      
      console.log(`\n📊 FINAL IMPORT SUMMARY`);
      console.log(`  - Total files processed: ${args.length}`);
      console.log(`  - Total new records: ${totalNew}`);
      console.log(`  - Total updated records: ${totalUpdated}`);
      console.log(`  - Total errors: ${totalErrors}`);
    }
  } catch (error) {
    console.error(`❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main();