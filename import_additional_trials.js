#!/usr/bin/env node

/**
 * Mass Import Script for TrialSage
 * 
 * This script handles importing additional trials from the ClinicalTrials.gov API
 * and processing them into the database.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure neon with WebSocket
neonConfig.webSocketConstructor = ws;

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Make sure we have the DATABASE_URL environment variable
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable not set');
  process.exit(1);
}

// Connect to the database
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create a function to run the import process
async function runMassImport() {
  try {
    console.log('Starting mass import process...');
    
    // Run the Python script to fetch more trials
    console.log('Fetching additional trials from ClinicalTrials.gov API...');
    try {
      execSync('python3 server/scripts/fetch_more_trials.py', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error running Python script:', error);
      process.exit(1);
    }
    
    // Check if additional_trials.json was created
    if (!fs.existsSync('additional_trials.json')) {
      console.error('Failed to generate additional_trials.json');
      process.exit(1);
    }
    
    // Read and parse the additional trials data
    const additionalData = JSON.parse(fs.readFileSync('additional_trials.json', 'utf-8'));
    
    if (!additionalData.studies || !Array.isArray(additionalData.studies)) {
      console.error('Invalid format in additional_trials.json');
      process.exit(1);
    }
    
    console.log(`Successfully fetched ${additionalData.processed_count} additional trials. Importing to database...`);
    
    // Import each study into the database in batches
    let importedCount = 0;
    const batchSize = 50;
    const totalStudies = additionalData.studies.length;
    
    for (let i = 0; i < totalStudies; i += batchSize) {
      const batch = additionalData.studies.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(totalStudies/batchSize)} (${batch.length} studies)...`);
      
      for (const study of batch) {
        try {
          // Check if this study already exists in the database
          const { rows: existingReports } = await pool.query(
            'SELECT id FROM csr_reports WHERE nctrial_id = $1',
            [study.nctrialId]
          );
          
          if (existingReports.length > 0) {
            console.log(`Study ${study.nctrialId} already exists in database, skipping...`);
            continue;
          }
          
          // Insert new report
          const { rows: [newReport] } = await pool.query(
            `INSERT INTO csr_reports 
             (title, sponsor, indication, phase, file_name, file_size, date, nctrial_id, drug_name, status, summary) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
             RETURNING id`,
            [
              study.title,
              study.sponsor,
              study.indication,
              study.phase,
              study.fileName,
              study.fileSize || 0,
              study.date,
              study.nctrialId,
              study.drugName,
              "Imported",
              study.officialTitle || "" // Use officialTitle as summary
            ]
          );
          
          // Insert details
          await pool.query(
            `INSERT INTO csr_details 
             (report_id, study_design, primary_objective, study_description, inclusion_criteria, exclusion_criteria, endpoints, statistical_methods, safety, results, last_updated) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              newReport.id,
              study.studyType,
              "To evaluate the efficacy and safety of the investigational product",
              study.description || study.detailedDescription,
              study.eligibilityCriteria,
              "",
              JSON.stringify({}), // endpoints
              JSON.stringify({}), // statistical_methods
              JSON.stringify({}), // safety
              JSON.stringify({}), // results
              new Date()
            ]
          );
          
          importedCount++;
          
          if (importedCount % 10 === 0) {
            console.log(`Imported ${importedCount}/${totalStudies} studies...`);
          }
        } catch (error) {
          console.error(`Error importing study ${study.nctrialId}:`, error);
        }
      }
      
      // Add a small delay between batches to avoid overwhelming the database
      if (i + batchSize < totalStudies) {
        console.log('Pausing between batches...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`Successfully imported ${importedCount} new studies to the database.`);
    console.log(`Total studies in database should now be ${70 + importedCount}.`);
    
    // Close the database connection pool
    await pool.end();
    
    console.log('Mass import process completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error in mass import process:', error);
    process.exit(1);
  }
}

// Run the import process
runMassImport();