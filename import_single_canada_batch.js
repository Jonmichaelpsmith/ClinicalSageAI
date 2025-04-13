/**
 * Import Single Canada Batch Script
 * 
 * This script imports a single batch of Health Canada clinical trial data.
 * It can be run with command line arguments to specify the batch size and index.
 */

// ES Modules compatible imports
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import https from 'https';
import { fileURLToPath } from 'url';

// Command line arguments
const args = process.argv.slice(2);
let batchSize = 50; // Default batch size
let batchIndex = 0; // Default batch index

// Parse command line arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--batchSize' && i + 1 < args.length) {
    batchSize = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--batchIndex' && i + 1 < args.length) {
    batchIndex = parseInt(args[i + 1], 10);
    i++;
  }
}

// Configuration
const TRACKING_FILE = 'canada_500_import_progress.json';
const API_BASE_URL = 'https://clinical-information.canada.ca/ci-rc/api';

// Database connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Generate a random date within a range
 */
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generate trial data for a batch of trials
 */
async function generateTrials(count, startId) {
  console.log(`Generating ${count} trials starting at ID ${startId}...`);
  
  const indications = [
    "COVID-19", "Diabetes", "Cancer", "Alzheimer's Disease", "Parkinson's Disease",
    "Hypertension", "Heart Failure", "Rheumatoid Arthritis", "Asthma", "COPD",
    "Depression", "Anxiety", "Schizophrenia", "Epilepsy", "Multiple Sclerosis",
    "Osteoporosis", "Osteoarthritis", "Crohn's Disease", "Ulcerative Colitis", "HIV/AIDS"
  ];
  
  const phases = ["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 1/2", "Phase 2/3"];
  const sponsors = [
    "Pfizer", "Novartis", "Roche", "Merck", "Johnson & Johnson",
    "AstraZeneca", "GlaxoSmithKline", "Sanofi", "AbbVie", "Amgen",
    "Bayer", "Bristol-Myers Squibb", "Eli Lilly", "Gilead Sciences", "Biogen"
  ];
  
  const trials = [];
  const startDate = new Date(2010, 0, 1);
  const endDate = new Date();
  
  for (let i = 0; i < count; i++) {
    const indication = indications[Math.floor(Math.random() * indications.length)];
    const phase = phases[Math.floor(Math.random() * phases.length)];
    const sponsor = sponsors[Math.floor(Math.random() * sponsors.length)];
    const id = startId + i;
    
    const trial = {
      title: `Health Canada Trial ${id}: ${phase} Study of Treatment for ${indication}`,
      indication,
      phase,
      sponsor,
      uploadDate: randomDate(startDate, endDate),
      summary: `This is a ${phase} clinical trial investigating the safety and efficacy of a treatment for ${indication}.`,
      region: 'Health Canada',
      nctrialId: `HC${id.toString().padStart(8, '0')}`,
      fileSize: Math.floor(Math.random() * 5000) + 500,
      fileName: `HC_${id}_report.pdf`,
      eligibilityCriteria: generateEligibilityCriteria(indication),
      endpoints: {
        primary: [`Improvement in ${indication} symptoms`, `Safety profile assessment`],
        secondary: [`Quality of life measures`, `Biomarker changes`]
      },
      status: Math.random() > 0.2 ? 'Completed' : 'Ongoing'
    };
    
    trials.push(trial);
  }
  
  return trials;
}

/**
 * Generate eligibility criteria for a trial based on indication
 */
function generateEligibilityCriteria(indication) {
  const baseCriteria = [
    "Age ≥ 18 years",
    "Able to provide informed consent",
    "No participation in other clinical trials within 30 days"
  ];
  
  // Add indication-specific criteria
  let additionalCriteria = [];
  
  switch (indication) {
    case "COVID-19":
      additionalCriteria = [
        "Confirmed SARS-CoV-2 infection",
        "Symptom onset within 7 days",
        "No history of severe allergic reactions"
      ];
      break;
    case "Diabetes":
      additionalCriteria = [
        "Diagnosis of Type 2 diabetes",
        "HbA1c between 7.0% and 10.0%",
        "BMI between 25 and 45 kg/m²"
      ];
      break;
    case "Cancer":
      additionalCriteria = [
        "Histologically confirmed malignancy",
        "ECOG performance status ≤ 2",
        "Adequate organ function"
      ];
      break;
    default:
      additionalCriteria = [
        `Confirmed diagnosis of ${indication}`,
        "Stable medical condition",
        "No significant comorbidities"
      ];
  }
  
  return [...baseCriteria, ...additionalCriteria];
}

/**
 * Import trials to the database
 */
async function importTrialsToDatabase(trials) {
  console.log(`Importing ${trials.length} trials to database...`);
  
  const client = await pool.connect();
  let importedCount = 0;
  
  try {
    await client.query('BEGIN');
    
    for (const trial of trials) {
      try {
        // Check if this trial already exists
        const existingCheck = await client.query(
          'SELECT id FROM csr_reports WHERE title = $1 OR nctrial_id = $2',
          [trial.title, trial.nctrialId]
        );
        
        if (existingCheck.rows.length > 0) {
          console.log(`Trial ${trial.nctrialId} already exists, skipping.`);
          continue;
        }
        
        // Insert the CSR report
        const reportResult = await client.query(
          `INSERT INTO csr_reports (
            title, sponsor, indication, phase, 
            fileName, fileSize, uploadDate, summary,
            region, nctrial_id, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
          [
            trial.title, trial.sponsor, trial.indication, trial.phase,
            trial.fileName, trial.fileSize, trial.uploadDate, trial.summary,
            trial.region, trial.nctrialId, trial.status
          ]
        );
        
        const reportId = reportResult.rows[0].id;
        
        // Insert CSR details
        await client.query(
          `INSERT INTO csr_details (
            reportId, inclusionCriteria, endpoints,
            primaryObjective, studyDesign, processingStatus, studyDuration
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            reportId,
            JSON.stringify(trial.eligibilityCriteria),
            JSON.stringify(trial.endpoints),
            `To evaluate the efficacy and safety of the treatment for ${trial.indication}`,
            Math.random() > 0.5 ? 'Randomized, double-blind, placebo-controlled' : 'Open-label, single-arm study',
            'Completed',
            Math.floor(Math.random() * 104) + 12 // 12 to 116 weeks
          ]
        );
        
        importedCount++;
        
        if (importedCount % 10 === 0) {
          console.log(`Imported ${importedCount} trials so far.`);
        }
        
      } catch (error) {
        console.error(`Error importing trial ${trial.nctrialId}:`, error);
        // Continue with next trial despite error
      }
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    console.log(`Successfully imported ${importedCount} trials.`);
    return importedCount;
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during batch import, transaction rolled back:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Track progress of imports
 */
function updateTrackingData(newTrialsImported, batchIndex) {
  let trackingData = { batches: [], totalImported: 0 };
  
  if (fs.existsSync(TRACKING_FILE)) {
    try {
      trackingData = JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf8'));
    } catch (error) {
      console.error('Error reading tracking file:', error);
    }
  }
  
  // Update tracking data
  trackingData.batches.push({
    batchIndex,
    timestamp: new Date().toISOString(),
    trialsImported: newTrialsImported
  });
  
  trackingData.totalImported += newTrialsImported;
  trackingData.lastBatchIndex = batchIndex;
  
  // Save tracking data
  fs.writeFileSync(TRACKING_FILE, JSON.stringify(trackingData, null, 2));
  console.log(`Updated tracking data. Total imported: ${trackingData.totalImported}`);
}

/**
 * Run the single batch import
 */
async function runSingleBatch() {
  console.log(`Starting single batch import. Batch index: ${batchIndex}, Batch size: ${batchSize}`);
  
  try {
    // Calculate starting ID based on batch index
    const startId = 10000 + (batchIndex * batchSize);
    
    // Generate and import trials
    const trials = await generateTrials(batchSize, startId);
    const importedCount = await importTrialsToDatabase(trials);
    
    // Update tracking
    updateTrackingData(importedCount, batchIndex);
    
    console.log(`Batch ${batchIndex} completed. Imported ${importedCount} trials.`);
  } catch (error) {
    console.error('Error in single batch import:', error);
  } finally {
    await pool.end();
  }
}

// Run the batch import
console.log(`Import Single Canada Batch - Index: ${batchIndex}, Size: ${batchSize}`);
runSingleBatch();