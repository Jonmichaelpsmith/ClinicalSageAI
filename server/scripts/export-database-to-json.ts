/**
 * Export Database CSRs to JSON Files
 * 
 * This script exports all CSR records from the database to individual JSON files
 * in the data/processed_csrs directory so they can be loaded by the search service.
 * 
 * This addresses the discrepancy between the number of CSRs in the database (~2,871)
 * and the number loaded by the search service (~779).
 */

import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { csrReports, csrDetails } from '../sage-plus-service';
import { eq } from 'drizzle-orm';

// Directory for processed CSR JSON files
const PROCESSED_CSR_DIR = path.join(process.cwd(), 'data/processed_csrs');

// Ensure the processed CSR directory exists
if (!fs.existsSync(PROCESSED_CSR_DIR)) {
  fs.mkdirSync(PROCESSED_CSR_DIR, { recursive: true });
  console.log(`Created directory: ${PROCESSED_CSR_DIR}`);
}

/**
 * Convert database CSR record to a structure suitable for JSON export
 */
async function formatCsrForExport(report: any, details: any) {
  // Basic CSR information
  const csr = {
    csr_id: `${report.id}`,
    title: report.title || 'Untitled Study',
    indication: report.indication || 'Unknown',
    phase: report.phase || 'Unknown',
    sponsor: report.sponsor || 'Unknown',
    nct_id: report.nctrialId || null,
    study_id: report.studyId || null,
    upload_date: report.uploadDate ? new Date(report.uploadDate).toISOString() : null,
    drug_name: report.drugName || null,
    region: report.region || null,
    
    // Add details fields if available
    study_design: details?.studyDesign || null,
    primary_objective: details?.primaryObjective || null,
    study_description: details?.studyDescription || null,
    
    // Handle arrays and objects
    treatment_arms: details?.treatmentArms || [],
    primary_endpoints: details?.endpoints?.filter(e => e.type === 'primary')?.map(e => e.name) || [],
    secondary_endpoints: details?.endpoints?.filter(e => e.type === 'secondary')?.map(e => e.name) || [],
    inclusion_criteria: details?.inclusionCriteria || [],
    exclusion_criteria: details?.exclusionCriteria || [],
    
    // Statistical data
    sample_size: details?.sampleSize || null,
    completion_rate: details?.completionRate || null,
    duration_weeks: details?.studyDuration || null,
    
    // Results
    efficacy_results: details?.efficacyResults || {},
    safety_results: details?.safety || {},
    adverse_events: details?.adverseEvents || [],
    
    // Other metadata
    age_range: details?.ageRange || null,
    gender_distribution: details?.gender || null,
    statistical_methods: details?.statisticalMethods || []
  };
  
  return csr;
}

/**
 * Main export function
 */
async function exportDatabaseToJson() {
  try {
    console.log('Starting export of CSR database records to JSON files...');
    
    // Get all CSR reports from database
    const reports = await db.select().from(csrReports);
    console.log(`Found ${reports.length} CSR reports in database`);
    
    let exportedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process each report
    for (const report of reports) {
      try {
        // Get details for this report
        const [details] = await db.select().from(csrDetails).where(eq(csrDetails.reportId, report.id));
        
        // Format the data for export
        const csrData = await formatCsrForExport(report, details);
        
        // Determine filename - use NCT ID if available, otherwise use database ID
        const fileId = report.nctrialId || `CSR-${report.id}`;
        const fileName = `${fileId}.json`;
        const filePath = path.join(PROCESSED_CSR_DIR, fileName);
        
        // Check if file already exists
        if (fs.existsSync(filePath)) {
          // Avoid overwriting existing files that might have manual changes
          console.log(`Skipping existing file: ${fileName}`);
          skippedCount++;
          continue;
        }
        
        // Write the JSON file
        fs.writeFileSync(filePath, JSON.stringify(csrData, null, 2));
        console.log(`Exported: ${fileName}`);
        exportedCount++;
        
      } catch (error) {
        console.error(`Error exporting CSR ID ${report.id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\nExport Summary:');
    console.log(`- Total CSR records in database: ${reports.length}`);
    console.log(`- Newly exported: ${exportedCount}`);
    console.log(`- Skipped (already exist): ${skippedCount}`);
    console.log(`- Errors: ${errorCount}`);
    
    // Count files in directory after export
    const filesInDir = fs.readdirSync(PROCESSED_CSR_DIR).filter(f => f.endsWith('.json')).length;
    console.log(`\nTotal JSON files in ${PROCESSED_CSR_DIR}: ${filesInDir}`);
    
    return {
      total: reports.length,
      exported: exportedCount,
      skipped: skippedCount,
      errors: errorCount,
      filesInDir
    };
    
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

// Export the function so it can be run from the API
export { exportDatabaseToJson };

// Run the export if this script is executed directly
if (require.main === module) {
  exportDatabaseToJson()
    .then(() => {
      console.log('Export completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Export failed:', error);
      process.exit(1);
    });
}