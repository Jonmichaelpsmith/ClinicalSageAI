#!/usr/bin/env node

/**
 * Import 500 ClinicalTrials.gov Trials in Batches of 50
 * 
 * This script will download and import 500 trials from ClinicalTrials.gov in batches of 50
 * to build up the knowledge base.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Pool, neonConfig } from '@neondatabase/serverless';
import axios from 'axios';
import ws from 'ws';

// Configure neon with WebSocket
neonConfig.webSocketConstructor = ws;

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path for tracking progress
const PROGRESS_FILE = 'ct_import_progress.json';
const SUCCESSFUL_IMPORTS_FILE = 'ct_successful_imports.json';

// Make sure we have the DATABASE_URL environment variable
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable not set');
  process.exit(1);
}

// Connect to the database
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Initialize or read progress tracking
function getProgressData() {
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    } catch (error) {
      console.error('Error reading progress file:', error);
    }
  }
  
  // Default initial state
  return {
    targetBatches: 10,
    batchesProcessed: 0,
    startTimestamp: new Date().toISOString(),
    lastBatchTimestamp: null,
    status: 'starting',
    currentOffset: 0,
    errors: []
  };
}

// Save progress tracking data
function saveProgressData(data) {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
    console.log('Updated progress data saved');
  } catch (error) {
    console.error('Error saving progress data:', error);
  }
}

// Initialize or read successful imports
function getSuccessfulImports() {
  if (fs.existsSync(SUCCESSFUL_IMPORTS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(SUCCESSFUL_IMPORTS_FILE, 'utf-8'));
    } catch (error) {
      console.error('Error reading successful imports file:', error);
    }
  }
  
  return { ids: [] };
}

// Save successful imports
function saveSuccessfulImports(data) {
  try {
    fs.writeFileSync(SUCCESSFUL_IMPORTS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving successful imports data:', error);
  }
}

// Search ClinicalTrials.gov API to get trial IDs
async function searchClinicalTrials(limit = 50, offset = 0) {
  try {
    const response = await axios.get('https://clinicaltrials.gov/api/v2/studies', {
      params: {
        format: 'json',
        filter: 'phase:PHASE1,PHASE2,PHASE3,PHASE4|resultsFirst:true|status:COMPLETED',
        pageSize: limit,
        offset: offset
      }
    });
    
    return response.data.studies;
  } catch (error) {
    console.error('Error searching ClinicalTrials.gov:', error.message);
    throw error;
  }
}

// Get detailed information for a single trial
async function getTrialDetails(nctId) {
  try {
    const response = await axios.get(`https://clinicaltrials.gov/api/v2/studies/${nctId}`, {
      params: {
        format: 'json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error getting details for trial ${nctId}:`, error.message);
    throw error;
  }
}

// Transform trial data to our format
function transformTrialData(trialData) {
  const protocolSection = trialData.protocolSection || {};
  const identificationModule = protocolSection.identificationModule || {};
  const statusModule = protocolSection.statusModule || {};
  const sponsorCollaboratorsModule = protocolSection.sponsorCollaboratorsModule || {};
  const conditionsModule = protocolSection.conditionsModule || {};
  const designModule = protocolSection.designModule || {};
  const eligibilityModule = protocolSection.eligibilityModule || {};
  const descriptionModule = protocolSection.descriptionModule || {};
  
  // Format phase properly
  let phase = 'Unknown';
  if (designModule && designModule.phases && designModule.phases.length > 0) {
    const phaseText = designModule.phases[0];
    if (phaseText.includes('Phase 1')) phase = 'Phase 1';
    else if (phaseText.includes('Phase 2')) phase = 'Phase 2';
    else if (phaseText.includes('Phase 3')) phase = 'Phase 3';
    else if (phaseText.includes('Phase 4')) phase = 'Phase 4';
    else phase = phaseText;
  }
  
  // Format eligibility criteria
  let eligibilityCriteria = '';
  if (eligibilityModule) {
    if (eligibilityModule.eligibilityCriteria) {
      eligibilityCriteria = eligibilityModule.eligibilityCriteria;
    } else {
      const criteria = [];
      
      if (eligibilityModule.inclusionCriteria) {
        criteria.push('Inclusion Criteria:');
        criteria.push(eligibilityModule.inclusionCriteria);
      }
      
      if (eligibilityModule.exclusionCriteria) {
        criteria.push('Exclusion Criteria:');
        criteria.push(eligibilityModule.exclusionCriteria);
      }
      
      eligibilityCriteria = criteria.join('\n');
    }
  }
  
  // Format date
  let date = null;
  if (statusModule && statusModule.completionDateStruct) {
    const year = statusModule.completionDateStruct.year;
    const month = statusModule.completionDateStruct.month || 1;
    const day = statusModule.completionDateStruct.day || 1;
    
    date = new Date(year, month - 1, day).toISOString().split('T')[0];
  }
  
  return {
    nctrialId: identificationModule.nctId || '',
    title: identificationModule.briefTitle || '',
    officialTitle: identificationModule.officialTitle || '',
    sponsor: getSponsorName(sponsorCollaboratorsModule),
    indication: getIndication(conditionsModule),
    phase: phase,
    fileName: `${identificationModule.nctId || 'unknown'}.json`,
    fileSize: JSON.stringify(trialData).length,
    date: date,
    drugName: getInterventions(protocolSection),
    studyType: designModule?.studyType || 'Unknown',
    description: descriptionModule?.briefSummary || '',
    detailedDescription: descriptionModule?.detailedDescription || '',
    eligibilityCriteria: eligibilityCriteria,
    region: 'ClinicalTrials.gov'
  };
}

// Extract sponsor name
function getSponsorName(sponsorModule) {
  if (!sponsorModule) return 'Unknown';
  
  if (sponsorModule.leadSponsor && sponsorModule.leadSponsor.name) {
    return sponsorModule.leadSponsor.name;
  }
  
  return 'Unknown';
}

// Extract indication
function getIndication(conditionsModule) {
  if (!conditionsModule) return 'Not specified';
  
  if (conditionsModule.conditions && conditionsModule.conditions.length > 0) {
    return conditionsModule.conditions[0];
  }
  
  return 'Not specified';
}

// Extract intervention/drug name
function getInterventions(protocolSection) {
  if (!protocolSection || !protocolSection.armsInterventionsModule) {
    return 'Not specified';
  }
  
  const interventions = protocolSection.armsInterventionsModule.interventions;
  if (interventions && interventions.length > 0) {
    return interventions[0].name || 'Not specified';
  }
  
  return 'Not specified';
}

// Check if trial already exists in database
async function checkTrialExists(nctId) {
  try {
    const { rows } = await pool.query(
      'SELECT id FROM csr_reports WHERE nctrial_id = $1',
      [nctId]
    );
    
    return rows.length > 0;
  } catch (error) {
    console.error(`Error checking if trial ${nctId} exists:`, error);
    return false;
  }
}

// Import a batch of trials to database
async function importTrialBatch(batchSize = 50, offset = 0) {
  console.log(`\n=== Starting Import of ${batchSize} ClinicalTrials.gov Trials ===`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Offset: ${offset}`);
  
  const successfulImports = getSuccessfulImports();
  const startTime = Date.now();
  let importedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  
  try {
    // Search for trials
    console.log('Searching ClinicalTrials.gov API...');
    const trials = await searchClinicalTrials(batchSize, offset);
    
    if (!trials || trials.length === 0) {
      console.log('No trials found.');
      return { imported: 0, skipped: 0, failed: 0, newOffset: offset };
    }
    
    console.log(`Found ${trials.length} trials.`);
    
    // Process each trial
    for (const trial of trials) {
      const nctId = trial.protocolSection?.identificationModule?.nctId;
      
      if (!nctId) {
        console.log('Trial missing NCT ID, skipping.');
        skippedCount++;
        continue;
      }
      
      // Skip if already imported
      if (successfulImports.ids.includes(nctId)) {
        console.log(`Skipping already imported trial ID: ${nctId}`);
        skippedCount++;
        continue;
      }
      
      // Skip if already in database
      const exists = await checkTrialExists(nctId);
      if (exists) {
        console.log(`Skipping trial already in database: ${nctId}`);
        // Add to our tracking to avoid checking the database again
        successfulImports.ids.push(nctId);
        skippedCount++;
        continue;
      }
      
      try {
        // Get detailed data
        const trialDetails = await getTrialDetails(nctId);
        
        // Transform to our format
        const transformedTrial = transformTrialData(trialDetails);
        
        // Insert into database
        await importTrialToDatabase(transformedTrial);
        
        // Track successful import
        successfulImports.ids.push(nctId);
        importedCount++;
        
        console.log(`Successfully imported trial ${nctId}`);
      } catch (error) {
        console.error(`Failed to import trial ${nctId}:`, error);
        failedCount++;
      }
    }
    
    // Save successful imports
    saveSuccessfulImports(successfulImports);
    
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    // Get current database counts
    const dbStatus = await getDatabaseStatus();
    
    console.log(`\n=== Import Summary ===`);
    console.log(`Total trials processed: ${trials.length}`);
    console.log(`Successfully imported: ${importedCount}`);
    console.log(`Skipped (already exists): ${skippedCount}`);
    console.log(`Failed imports: ${failedCount}`);
    console.log(`Processing time: ${processingTime}s`);
    
    console.log(`\n=== Current Database Status ===`);
    console.log(`Total trials in database: ${dbStatus.total}`);
    console.log(`ClinicalTrials.gov trials: ${dbStatus.ctTrials}`);
    console.log(`Health Canada trials: ${dbStatus.hcTrials}`);
    
    return { 
      imported: importedCount, 
      skipped: skippedCount, 
      failed: failedCount, 
      newOffset: offset + batchSize
    };
  } catch (error) {
    console.error('Error in batch import:', error);
    return { imported: importedCount, skipped: skippedCount, failed: failedCount, newOffset: offset };
  }
}

// Import a single trial to database
async function importTrialToDatabase(trial) {
  // Insert new report
  const { rows: [newReport] } = await pool.query(
    `INSERT INTO csr_reports 
     (title, sponsor, indication, phase, file_name, file_size, date, nctrial_id, drug_name, status, summary, region) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
     RETURNING id`,
    [
      trial.title,
      trial.sponsor,
      trial.indication,
      trial.phase,
      trial.fileName,
      trial.fileSize,
      trial.date,
      trial.nctrialId,
      trial.drugName,
      "Imported",
      trial.officialTitle || "",
      trial.region
    ]
  );
  
  // Insert details
  await pool.query(
    `INSERT INTO csr_details 
     (report_id, study_design, primary_objective, study_description, inclusion_criteria, exclusion_criteria, endpoints, statistical_methods, safety, results, last_updated) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      newReport.id,
      trial.studyType,
      "To evaluate the efficacy and safety of the investigational product",
      trial.description || trial.detailedDescription,
      trial.eligibilityCriteria,
      "",
      JSON.stringify({}), // endpoints
      JSON.stringify({}), // statistical_methods
      JSON.stringify({}), // safety
      JSON.stringify({}), // results
      new Date()
    ]
  );
}

// Get current database status
async function getDatabaseStatus() {
  try {
    const { rows } = await pool.query(`
      SELECT 
        count(*) as total, 
        count(*) FILTER (WHERE region = 'Health Canada') as hc_trials,
        count(*) FILTER (WHERE region = 'ClinicalTrials.gov') as ct_trials
      FROM csr_reports;
    `);
    
    return {
      total: parseInt(rows[0].total),
      hcTrials: parseInt(rows[0].hc_trials),
      ctTrials: parseInt(rows[0].ct_trials)
    };
  } catch (error) {
    console.error('Error getting database status:', error);
    return { total: 0, hcTrials: 0, ctTrials: 0 };
  }
}

// Main function to run the import
async function runImport() {
  console.log('\n=========================================================');
  console.log('IMPORTING 500 CLINICALTRIALS.GOV TRIALS IN BATCHES OF 50');
  console.log('=========================================================\n');
  
  try {
    // Get progress data
    const progress = getProgressData();
    
    // If we've completed all batches, exit
    if (progress.batchesProcessed >= progress.targetBatches) {
      console.log('All batches have been processed. Import complete.');
      return;
    }
    
    // If we're resuming an import
    if (progress.batchesProcessed > 0) {
      console.log(`Resuming import from batch ${progress.batchesProcessed + 1}/${progress.targetBatches}`);
    }
    
    // Save initial state
    saveProgressData(progress);
    
    // Get current database status
    const dbStatus = await getDatabaseStatus();
    console.log(`Current database: ${dbStatus.total} total trials, ${dbStatus.ctTrials} ClinicalTrials.gov trials`);
    
    // Process batches until we reach the target
    while (progress.batchesProcessed < progress.targetBatches) {
      console.log(`\n=== Processing batch ${progress.batchesProcessed + 1}/${progress.targetBatches} ===\n`);
      
      try {
        // Import batch
        const result = await importTrialBatch(50, progress.currentOffset);
        
        // Update progress
        progress.batchesProcessed++;
        progress.lastBatchTimestamp = new Date().toISOString();
        progress.status = 'in_progress';
        progress.currentOffset = result.newOffset;
        
        saveProgressData(progress);
        
        // Wait before next batch
        if (progress.batchesProcessed < progress.targetBatches) {
          console.log('\nWaiting 5 seconds before next batch...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (error) {
        console.error('Error processing batch:', error);
        progress.errors.push({
          batch: progress.batchesProcessed + 1,
          timestamp: new Date().toISOString(),
          error: error.message
        });
        saveProgressData(progress);
      }
    }
    
    // Update final status
    progress.status = 'completed';
    saveProgressData(progress);
    
    // Get final database status
    const finalStatus = await getDatabaseStatus();
    console.log('\n=== Import Complete ===');
    console.log(`Final database status: ${finalStatus.total} total trials`);
    console.log(`ClinicalTrials.gov trials: ${finalStatus.ctTrials}`);
    console.log(`Health Canada trials: ${finalStatus.hcTrials}`);
    
    // Close the database connection
    await pool.end();
  } catch (error) {
    console.error('Error in import process:', error);
    process.exit(1);
  }
}

// Run the import
runImport();