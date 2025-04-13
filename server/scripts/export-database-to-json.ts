/**
 * Export Database CSRs to JSON Files
 * 
 * This script exports all CSR records from the database to individual JSON files
 * in the data/processed_csrs directory so they can be loaded by the search service.
 * 
 * This addresses the discrepancy between the number of CSRs in the database (~2,871)
 * and the number loaded by the search service (~779).
 */

import path from 'path';
import fs from 'fs/promises';
import { db } from '../db';
import { csrReports, csrDetails } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Convert database CSR record to a structure suitable for JSON export
 */
async function formatCsrForExport(report: any, details: any) {
  // Create a merged JSON structure with all CSR data
  const exportData = {
    id: report.id,
    title: report.title || '',
    sponsor: report.sponsor || '',
    indication: report.indication || '',
    phase: report.phase || '',
    summary: report.summary || '',
    
    // Details fields if available
    studyDesign: details?.studyDesign || '',
    primaryObjective: details?.primaryObjective || '',
    studyDescription: details?.studyDescription || '',
    inclusionCriteria: details?.inclusionCriteria || [],
    exclusionCriteria: details?.exclusionCriteria || [],
    endpoints: details?.endpoints || {},
    fileName: report.fileName || '',
    
    // Additional metadata 
    exportDate: new Date().toISOString(),
    source: 'database-export'
  };
  
  return exportData;
}

/**
 * Main export function
 */
export async function exportDatabaseToJson() {
  // Make sure the export directory exists
  const exportDir = path.resolve('./data/processed_csrs');
  
  try {
    await fs.mkdir(exportDir, { recursive: true });
  } catch (e) {
    console.error(`Failed to create directory: ${e}`);
  }
  
  // Get all CSR reports from database
  const reports = await db.select().from(csrReports);
  console.log(`Found ${reports.length} CSR reports in database`);
  
  // Check how many JSON files already exist
  let existingFiles: string[] = [];
  try {
    existingFiles = await fs.readdir(exportDir);
    existingFiles = existingFiles.filter(f => f.endsWith('.json'));
  } catch (e) {
    console.error(`Error reading existing files: ${e}`);
  }
  
  console.log(`Found ${existingFiles.length} existing JSON files`);
  
  // Keep track of results
  const results = {
    total: reports.length,
    exported: 0,
    skipped: 0,
    errors: 0,
    filesInDir: existingFiles.length
  };
  
  // Process each report
  for (const report of reports) {
    const jsonFilename = `csr_${report.id}.json`;
    const fullPath = path.join(exportDir, jsonFilename);
    
    // Skip if file already exists
    if (existingFiles.includes(jsonFilename)) {
      results.skipped++;
      continue;
    }
    
    try {
      // Get details for this report
      const [details] = await db
        .select()
        .from(csrDetails)
        .where(eq(csrDetails.reportId, report.id));
      
      // Format the data for export
      const exportData = await formatCsrForExport(report, details);
      
      // Write to file
      await fs.writeFile(
        fullPath,
        JSON.stringify(exportData, null, 2)
      );
      
      results.exported++;
    } catch (error) {
      console.error(`Error exporting CSR ID ${report.id}:`, error);
      results.errors++;
    }
  }
  
  // Recount the files after export
  try {
    const updatedFiles = await fs.readdir(exportDir);
    results.filesInDir = updatedFiles.filter(f => f.endsWith('.json')).length;
  } catch (e) {
    console.error(`Error counting updated files: ${e}`);
  }
  
  console.log(`Export complete. Exported ${results.exported} new files. Total available: ${results.filesInDir}`);
  return results;
}