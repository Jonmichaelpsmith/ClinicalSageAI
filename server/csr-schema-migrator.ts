/**
 * CSR Schema Migrator
 * 
 * This module provides functionality to migrate existing CSR data to the new semantic model.
 * It converts legacy data formats from different sources into the standardized structure
 * defined in the comprehensive CSR schema.
 */

import { pool, db } from './db';
import * as schema from '../shared/schema';
import * as csrSchema from '../shared/csr-schema';
import { eq, and, isNull, desc } from 'drizzle-orm';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { log } from './vite';

// Constants
const PROCESSED_CSRS_DIR = path.resolve('./data/processed_csrs');
const CSR_DATABASE_PATH = path.resolve('./csr_database.db');
const DEFAULT_BATCH_SIZE = 50;

/**
 * Main migration function to move data to new schema
 */
export async function migrateToSemanticModel() {
  log('Starting migration to semantic CSR model...');

  // Create necessary directories
  await ensureDirectoriesExist();

  // Track counts for summary
  const counts = {
    jsonFiles: 0,
    sqliteRecords: 0,
    drizzleRecords: 0,
    migrated: 0,
    skipped: 0,
    failed: 0
  };

  try {
    // Check if tables exist in postgres
    const tableExists = await checkIfTableExists('csr_reports');
    if (!tableExists) {
      log('Tables do not exist yet. Please run the migration script first.');
      return false;
    }

    // 1. Migrate data from processed_csrs directory (JSON files)
    counts.jsonFiles = await countJsonFiles();
    if (counts.jsonFiles > 0) {
      log(`Found ${counts.jsonFiles} JSON files to process...`);
      await migrateFromJsonFiles(counts);
    }

    // 2. Migrate data from SQLite database if it exists
    if (existsSync(CSR_DATABASE_PATH)) {
      counts.sqliteRecords = await countSqliteRecords();
      if (counts.sqliteRecords > 0) {
        log(`Found ${counts.sqliteRecords} records in SQLite database...`);
        await migrateFromSqlite(counts);
      }
    }

    // 3. Migrate data from legacy Drizzle schema
    counts.drizzleRecords = await countDrizzleRecords();
    if (counts.drizzleRecords > 0) {
      log(`Found ${counts.drizzleRecords} records in legacy Drizzle schema...`);
      await migrateFromDrizzle(counts);
    }

    // 4. Update statistics and metrics
    await updateStatistics();

    // Log summary
    log('\nMigration Summary:');
    log(`JSON Files Found: ${counts.jsonFiles}`);
    log(`SQLite Records Found: ${counts.sqliteRecords}`);
    log(`Drizzle Records Found: ${counts.drizzleRecords}`);
    log(`Records Migrated: ${counts.migrated}`);
    log(`Records Skipped (already exist): ${counts.skipped}`);
    log(`Failed Migrations: ${counts.failed}`);

    return true;
  } catch (error) {
    log(`Error during migration: ${error instanceof Error ? error.message : String(error)}`);
    console.error('Migration error:', error);
    return false;
  }
}

/**
 * Check if a table exists in the database
 */
async function checkIfTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName]);
    return result.rows[0].exists;
  } catch (error) {
    log(`Error checking if table exists: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Ensure all required directories exist
 */
async function ensureDirectoriesExist() {
  if (!existsSync(PROCESSED_CSRS_DIR)) {
    await fs.mkdir(PROCESSED_CSRS_DIR, { recursive: true });
  }
}

/**
 * Count JSON files in the processed_csrs directory
 */
async function countJsonFiles(): Promise<number> {
  try {
    const files = await fs.readdir(PROCESSED_CSRS_DIR);
    return files.filter(file => file.endsWith('.json')).length;
  } catch (error) {
    log(`Error counting JSON files: ${error instanceof Error ? error.message : String(error)}`);
    return 0;
  }
}

/**
 * Count records in the SQLite database
 */
async function countSqliteRecords(): Promise<number> {
  try {
    const sqlite3 = require('sqlite3').verbose();
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(CSR_DATABASE_PATH, sqlite3.OPEN_READONLY, (err: Error) => {
        if (err) {
          reject(err);
          return;
        }
        
        db.get('SELECT COUNT(*) as count FROM csr_metadata', [], (err: Error, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          
          db.close();
          resolve(row ? row.count : 0);
        });
      });
    });
  } catch (error) {
    log(`Error counting SQLite records: ${error instanceof Error ? error.message : String(error)}`);
    return 0;
  }
}

/**
 * Count records in the legacy Drizzle schema
 */
async function countDrizzleRecords(): Promise<number> {
  try {
    // Handle case where csrReports might not exist in schema
    try {
      // @ts-ignore - This is a runtime check, so we can ignore TypeScript errors
      if (schema.csrReports) {
        const result = await db.select({ count: sql`COUNT(*)` }).from(schema.csrReports);
        return Number(result[0]?.count || 0);
      }
    } catch (e) {
      // Table doesn't exist or schema is different
    }
    return 0;
  } catch (error) {
    log(`Error counting Drizzle records: ${error instanceof Error ? error.message : String(error)}`);
    return 0;
  }
}

/**
 * Migrate data from JSON files
 */
async function migrateFromJsonFiles(counts: Record<string, number>) {
  try {
    const files = await fs.readdir(PROCESSED_CSRS_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    // Process in batches
    for (let i = 0; i < jsonFiles.length; i += DEFAULT_BATCH_SIZE) {
      const batch = jsonFiles.slice(i, i + DEFAULT_BATCH_SIZE);
      log(`Processing batch ${i / DEFAULT_BATCH_SIZE + 1} of ${Math.ceil(jsonFiles.length / DEFAULT_BATCH_SIZE)}`);
      
      await Promise.all(batch.map(async (file) => {
        try {
          const filePath = path.join(PROCESSED_CSRS_DIR, file);
          const fileContent = await fs.readFile(filePath, 'utf-8');
          const csrData = JSON.parse(fileContent);
          
          // Extract CSR ID from filename or data
          const csrId = csrData.csr_id || path.basename(file, '.json');
          
          // Check if CSR already exists
          const existingCsr = await db.select({ id: csrSchema.csrReports.id })
            .from(csrSchema.csrReports)
            .where(eq(csrSchema.csrReports.csr_id, csrId))
            .limit(1);
          
          if (existingCsr.length > 0) {
            counts.skipped++;
            return;
          }
          
          // Map data to new schema
          const reportData = mapJsonToReportSchema(csrData, csrId);
          const detailsData = mapJsonToDetailsSchema(csrData, 0); // Will be updated later with report_id
          
          // Insert report
          const [report] = await db.insert(csrSchema.csrReports)
            .values(reportData)
            .returning();
          
          // Update report_id in details and insert
          detailsData.report_id = report.id;
          await db.insert(csrSchema.csrDetails)
            .values(detailsData);
          
          // Extract and insert segments if available
          if (csrData.sections || csrData.content) {
            await extractAndInsertSegments(csrData, report.id);
          }
          
          counts.migrated++;
        } catch (error) {
          log(`Error processing file ${file}: ${error instanceof Error ? error.message : String(error)}`);
          counts.failed++;
        }
      }));
    }
  } catch (error) {
    log(`Error migrating from JSON files: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Migrate data from SQLite database
 */
async function migrateFromSqlite(counts: Record<string, number>) {
  try {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(CSR_DATABASE_PATH, sqlite3.OPEN_READONLY);
    
    // Get all CSR records from SQLite
    const rows = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM csr_metadata', [], (err: Error, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows || []);
      });
    });
    
    // Process in batches
    for (let i = 0; i < rows.length; i += DEFAULT_BATCH_SIZE) {
      const batch = rows.slice(i, i + DEFAULT_BATCH_SIZE);
      log(`Processing SQLite batch ${i / DEFAULT_BATCH_SIZE + 1} of ${Math.ceil(rows.length / DEFAULT_BATCH_SIZE)}`);
      
      await Promise.all(batch.map(async (row) => {
        try {
          // Check if CSR already exists
          const existingCsr = await db.select({ id: csrSchema.csrReports.id })
            .from(csrSchema.csrReports)
            .where(eq(csrSchema.csrReports.csr_id, row.csr_id))
            .limit(1);
          
          if (existingCsr.length > 0) {
            counts.skipped++;
            return;
          }
          
          // Map SQLite row to new schema
          const reportData = mapSqliteToReportSchema(row);
          const detailsData = mapSqliteToDetailsSchema(row, 0); // Will be updated later with report_id
          
          // Insert report
          const [report] = await db.insert(csrSchema.csrReports)
            .values(reportData)
            .returning();
          
          // Update report_id in details and insert
          detailsData.report_id = report.id;
          await db.insert(csrSchema.csrDetails)
            .values(detailsData);
          
          counts.migrated++;
        } catch (error) {
          log(`Error processing SQLite row for CSR ${row.csr_id}: ${error instanceof Error ? error.message : String(error)}`);
          counts.failed++;
        }
      }));
    }
    
    // Close SQLite database
    db.close();
  } catch (error) {
    log(`Error migrating from SQLite: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Migrate data from legacy Drizzle schema
 */
async function migrateFromDrizzle(counts: Record<string, number>) {
  try {
    // Handle case where csrReports might not exist in schema
    // @ts-ignore - This is a runtime check, so we can ignore TypeScript errors
    if (!schema.csrReports) {
      return;
    }
    
    // Get all CSR records from legacy schema
    // @ts-ignore - This is a runtime check, so we can ignore TypeScript errors
    const legacyReports = await db.select().from(schema.csrReports);
    
    // Process in batches
    for (let i = 0; i < legacyReports.length; i += DEFAULT_BATCH_SIZE) {
      const batch = legacyReports.slice(i, i + DEFAULT_BATCH_SIZE);
      log(`Processing Drizzle batch ${i / DEFAULT_BATCH_SIZE + 1} of ${Math.ceil(legacyReports.length / DEFAULT_BATCH_SIZE)}`);
      
      await Promise.all(batch.map(async (legacyReport) => {
        try {
          // Generate a CSR ID if not available
          const csrId = legacyReport.csr_id || 
                     legacyReport.nctrial_id || 
                     `LTG-${legacyReport.id}`;
          
          // Check if CSR already exists
          const existingCsr = await db.select({ id: csrSchema.csrReports.id })
            .from(csrSchema.csrReports)
            .where(eq(csrSchema.csrReports.csr_id, csrId))
            .limit(1);
          
          if (existingCsr.length > 0) {
            counts.skipped++;
            return;
          }
          
          // Map legacy data to new schema
          const reportData = mapLegacyToReportSchema(legacyReport, csrId);
          
          // Get legacy details if available
          let legacyDetails: any = null;
          // @ts-ignore - This is a runtime check, so we can ignore TypeScript errors
          if (schema.csrDetails) {
            // @ts-ignore - This is a runtime check, so we can ignore TypeScript errors
            const details = await db.select().from(schema.csrDetails)
              // @ts-ignore - This is a runtime check
              .where(eq(schema.csrDetails.report_id, legacyReport.id))
              .limit(1);
            
            if (details.length > 0) {
              legacyDetails = details[0];
            }
          }
          
          const detailsData = mapLegacyToDetailsSchema(legacyReport, legacyDetails, 0);
          
          // Insert report
          const [report] = await db.insert(csrSchema.csrReports)
            .values(reportData)
            .returning();
          
          // Update report_id in details and insert
          detailsData.report_id = report.id;
          await db.insert(csrSchema.csrDetails)
            .values(detailsData);
          
          counts.migrated++;
        } catch (error) {
          log(`Error processing Drizzle record: ${error instanceof Error ? error.message : String(error)}`);
          counts.failed++;
        }
      }));
    }
  } catch (error) {
    log(`Error migrating from Drizzle: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Extract and insert segments from CSR data
 */
async function extractAndInsertSegments(csrData: any, reportId: number) {
  // Handle sections if available
  if (Array.isArray(csrData.sections)) {
    for (const section of csrData.sections) {
      if (!section || !section.title) continue;
      
      await db.insert(csrSchema.csrSegments)
        .values({
          report_id: reportId,
          section_id: `custom-${reportId}-${Math.random().toString(36).substr(2, 9)}`,
          section_type: section.type || 'Custom Section',
          section_title: section.title,
          section_number: section.number || null,
          content: section.content || null,
          page_start: section.page_start || null,
          page_end: section.page_end || null
        });
    }
  }
  
  // Handle content as fallback
  else if (typeof csrData.content === 'string' && csrData.content.trim()) {
    // Split content into major sections based on headings
    const contentSections = splitContentIntoSections(csrData.content);
    
    for (const [idx, section] of contentSections.entries()) {
      await db.insert(csrSchema.csrSegments)
        .values({
          report_id: reportId,
          section_id: `auto-${reportId}-${idx}`,
          section_type: 'Auto-Extracted Section',
          section_title: section.title || `Section ${idx + 1}`,
          content: section.content
        });
    }
  }
}

/**
 * Split content text into sections based on headings
 */
function splitContentIntoSections(content: string): { title: string; content: string }[] {
  if (!content || typeof content !== 'string') {
    return [];
  }
  
  // Simple heading detection regex
  const headingRegex = /\n\s*(#{1,6}\s+.+|[A-Z][A-Za-z\s]+:|\d+\.\s+[A-Z][A-Za-z\s]+|\d+\.\d+\s+[A-Za-z\s]+)/g;
  const sections: { title: string; content: string }[] = [];
  
  let lastIndex = 0;
  let match;
  let currentTitle = 'Introduction';
  
  // Add first section if content doesn't start with a heading
  if (content.trim() && !content.trim().match(/^(#{1,6}\s+.+|[A-Z][A-Za-z\s]+:|\d+\.\s+[A-Z][A-Za-z\s]+)/)) {
    const firstHeadingMatch = content.match(headingRegex);
    if (firstHeadingMatch && firstHeadingMatch.index) {
      const initialContent = content.substring(0, firstHeadingMatch.index).trim();
      if (initialContent) {
        sections.push({
          title: 'Introduction',
          content: initialContent
        });
        lastIndex = firstHeadingMatch.index;
      }
    }
  }
  
  // eslint-disable-next-line no-cond-assign
  while (match = headingRegex.exec(content)) {
    if (lastIndex < match.index && currentTitle) {
      const sectionContent = content.substring(lastIndex, match.index).trim();
      if (sectionContent) {
        sections.push({
          title: currentTitle,
          content: sectionContent
        });
      }
    }
    
    currentTitle = match[1].trim().replace(/^#+\s+/, '').replace(/:$/, '');
    lastIndex = match.index + match[0].length;
  }
  
  // Add the last section
  if (lastIndex < content.length && currentTitle) {
    const sectionContent = content.substring(lastIndex).trim();
    if (sectionContent) {
      sections.push({
        title: currentTitle,
        content: sectionContent
      });
    }
  }
  
  return sections;
}

/**
 * Update statistics after migration
 */
async function updateStatistics() {
  try {
    // Count CSRs by therapeutic area
    const therapeuticAreaStats = await db.select({
      therapeutic_area: csrSchema.csrReports.therapeutic_area,
      count: sql`COUNT(*)`
    })
    .from(csrSchema.csrReports)
    .where(and(
      isNull(csrSchema.csrReports.deleted_at),
      isNull(csrSchema.csrReports.therapeutic_area).not()
    ))
    .groupBy(csrSchema.csrReports.therapeutic_area)
    .orderBy(desc(sql`COUNT(*)`));
    
    // Count CSRs by phase
    const phaseStats = await db.select({
      phase: csrSchema.csrReports.phase,
      count: sql`COUNT(*)`
    })
    .from(csrSchema.csrReports)
    .where(and(
      isNull(csrSchema.csrReports.deleted_at),
      isNull(csrSchema.csrReports.phase).not()
    ))
    .groupBy(csrSchema.csrReports.phase)
    .orderBy(desc(sql`COUNT(*)`));
    
    // Count CSRs by source
    const sourceStats = await db.select({
      source: csrSchema.csrReports.source,
      count: sql`COUNT(*)`
    })
    .from(csrSchema.csrReports)
    .where(isNull(csrSchema.csrReports.deleted_at))
    .groupBy(csrSchema.csrReports.source)
    .orderBy(desc(sql`COUNT(*)`));
    
    // Count processed vs unprocessed CSRs
    const processingStats = await db.select({
      has_details: csrSchema.csrReports.has_details,
      count: sql`COUNT(*)`
    })
    .from(csrSchema.csrReports)
    .where(isNull(csrSchema.csrReports.deleted_at))
    .groupBy(csrSchema.csrReports.has_details);
    
    // Log statistics
    log('\nCSR Database Statistics:');
    log(`Total CSRs: ${therapeuticAreaStats.reduce((sum, item) => sum + Number(item.count), 0)}`);
    
    log('\nBy Therapeutic Area:');
    therapeuticAreaStats.slice(0, 10).forEach(item => {
      log(`  ${item.therapeutic_area || 'Unknown'}: ${item.count}`);
    });
    
    log('\nBy Phase:');
    phaseStats.forEach(item => {
      log(`  ${item.phase || 'Unknown'}: ${item.count}`);
    });
    
    log('\nBy Source:');
    sourceStats.forEach(item => {
      log(`  ${item.source || 'Unknown'}: ${item.count}`);
    });
    
    log('\nProcessing Status:');
    const processed = processingStats.find(item => item.has_details === true);
    const unprocessed = processingStats.find(item => item.has_details === false);
    log(`  Processed: ${processed ? processed.count : 0}`);
    log(`  Unprocessed: ${unprocessed ? unprocessed.count : 0}`);
    
  } catch (error) {
    log(`Error updating statistics: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Map functions for different data sources to the new schema
 */

function mapJsonToReportSchema(data: any, csrId: string): Partial<csrSchema.InsertCsrReport> {
  return {
    csr_id: csrId,
    title: data.title || null,
    study_id: data.study_id || data.studyId || null,
    protocol_id: data.protocol_id || data.protocolId || null,
    nctrial_id: data.nctrial_id || data.nctrialId || null,
    sponsor: data.sponsor || null,
    indication: data.indication || null,
    therapeutic_area: data.therapeutic_area || data.therapeuticArea || null,
    phase: data.phase || null,
    drug_name: data.drug_name || data.drugName || null,
    region: data.region || null,
    file_name: data.file_name || data.fileName || null,
    file_path: data.file_path || data.filePath || null,
    file_size: data.file_size || data.fileSize || null,
    upload_date: data.upload_date ? new Date(data.upload_date) : new Date(),
    report_date: data.report_date ? new Date(data.report_date) : null,
    summary: data.summary || null,
    status: data.status || 'active',
    source: data.source || 'json',
    has_details: true
  };
}

function mapJsonToDetailsSchema(data: any, reportId: number): Partial<csrSchema.InsertCsrDetail> {
  return {
    report_id: reportId,
    study_design: data.study_design || null,
    study_type: data.study_type || null,
    randomization: data.randomization || null,
    blinding: data.blinding || null,
    control_type: data.control_type || null,
    primary_objective: data.primary_objective || null,
    secondary_objectives: data.secondary_objectives || null,
    exploratory_objectives: data.exploratory_objectives || null,
    study_description: data.study_description || null,
    inclusion_criteria: data.inclusion_criteria || null,
    exclusion_criteria: data.exclusion_criteria || null,
    population: data.population || null,
    study_start_date: data.study_start_date ? new Date(data.study_start_date) : null,
    study_end_date: data.study_end_date ? new Date(data.study_end_date) : null,
    study_duration: data.study_duration || null,
    follow_up_period: data.follow_up_period || null,
    sample_size: data.sample_size || null,
    age_range: data.age_range || null,
    gender_distribution: data.gender_distribution || null,
    ethnicity_distribution: data.ethnicity_distribution || null,
    treatment_arms: data.treatment_arms || null,
    endpoints: data.endpoints || null,
    statistical_methods: data.statistical_methods || null,
    results: data.results || null,
    efficacy_results: data.efficacy_results || null,
    safety: data.safety || null,
    adverse_events: data.adverse_events || null,
    serious_adverse_events: data.serious_adverse_events || null,
    sae_count: data.sae_count || null,
    teae_count: data.teae_count || null,
    completion_rate: data.completion_rate || null,
    processing_status: 'completed',
    processed: true
  };
}

function mapSqliteToReportSchema(row: any): Partial<csrSchema.InsertCsrReport> {
  return {
    csr_id: row.csr_id,
    title: row.title || null,
    indication: row.indication || null,
    phase: row.phase || null,
    sample_size: row.sample_size || null,
    upload_date: row.import_date ? new Date(row.import_date) : new Date(),
    summary: row.outcome || null,
    status: 'active',
    source: 'sqlite',
    has_details: true
  };
}

function mapSqliteToDetailsSchema(row: any, reportId: number): Partial<csrSchema.InsertCsrDetail> {
  return {
    report_id: reportId,
    sample_size: row.sample_size || null,
    processing_status: 'completed',
    processed: true
  };
}

function mapLegacyToReportSchema(legacyReport: any, csrId: string): Partial<csrSchema.InsertCsrReport> {
  return {
    csr_id: csrId,
    title: legacyReport.title || null,
    study_id: legacyReport.study_id || null,
    protocol_id: legacyReport.protocol_id || null,
    nctrial_id: legacyReport.nctrial_id || null,
    sponsor: legacyReport.sponsor || null,
    sponsor_id: legacyReport.sponsor_id || null,
    indication: legacyReport.indication || null,
    therapeutic_area: legacyReport.therapeutic_area || null,
    phase: legacyReport.phase || null,
    drug_name: legacyReport.drug_name || null,
    region: legacyReport.region || null,
    file_name: legacyReport.file_name || legacyReport.fileName || null,
    file_path: legacyReport.file_path || legacyReport.filePath || null,
    file_size: legacyReport.file_size || legacyReport.fileSize || null,
    upload_date: legacyReport.upload_date || legacyReport.uploadDate ? new Date(legacyReport.upload_date || legacyReport.uploadDate) : new Date(),
    report_date: legacyReport.report_date ? new Date(legacyReport.report_date) : null,
    summary: legacyReport.summary || null,
    status: legacyReport.status || 'active',
    source: legacyReport.source || 'drizzle',
    has_details: legacyReport.has_details || false,
    vectorized: legacyReport.vectorized || false
  };
}

function mapLegacyToDetailsSchema(legacyReport: any, legacyDetails: any | null, reportId: number): Partial<csrSchema.InsertCsrDetail> {
  const details: Partial<csrSchema.InsertCsrDetail> = {
    report_id: reportId,
    processing_status: 'completed',
    processed: true
  };
  
  // Map details if available
  if (legacyDetails) {
    details.study_design = legacyDetails.study_design || null;
    details.primary_objective = legacyDetails.primary_objective || null;
    details.study_description = legacyDetails.study_description || null;
    details.inclusion_criteria = legacyDetails.inclusion_criteria || null;
    details.exclusion_criteria = legacyDetails.exclusion_criteria || null;
    details.treatment_arms = legacyDetails.treatment_arms || null;
    details.endpoints = legacyDetails.endpoints || null;
    details.sample_size = legacyDetails.sample_size || null;
    details.results = legacyDetails.results || null;
    details.safety = legacyDetails.safety || null;
    details.sae_count = legacyDetails.sae_count || null;
    details.teae_count = legacyDetails.teae_count || null;
    details.completion_rate = legacyDetails.completion_rate || null;
  }
  
  return details;
}

// Named export
export { migrateToSemanticModel };