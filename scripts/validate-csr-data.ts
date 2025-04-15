/**
 * CSR Data Validator
 * 
 * This utility validates CSR data against the semantic data model to ensure
 * data consistency and quality. It identifies data issues and provides
 * recommendations for fixing them.
 * 
 * Usage:
 *   npm run tsx scripts/validate-csr-data.ts
 */

import { db } from '../server/db';
import * as csrSchema from '../shared/csr-schema';
import { eq, isNull, sql } from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';

// Validation report structure
interface ValidationReport {
  total_reports: number;
  data_quality_issues: {
    missing_essential_fields: {
      count: number;
      affected_reports: { id: number; csr_id: string; field: string }[];
    };
    inconsistent_relationships: {
      count: number;
      affected_reports: { id: number; csr_id: string; issue: string }[];
    };
    data_format_issues: {
      count: number;
      affected_reports: { id: number; csr_id: string; field: string; issue: string }[];
    };
  };
  completeness_metrics: {
    fields_completeness: Record<string, { total: number; percentage: number }>;
    section_completeness: Record<string, { total: number; percentage: number }>;
  };
  data_distribution: {
    by_therapeutic_area: Record<string, number>;
    by_phase: Record<string, number>;
    by_source: Record<string, number>;
  };
  recommendations: string[];
}

async function main() {
  console.log('====================================================================');
  console.log(' CSR Data Validation');
  console.log('====================================================================');
  console.log('\nValidating CSR data against the semantic data model...\n');
  
  try {
    // Initialize validation report
    const report: ValidationReport = {
      total_reports: 0,
      data_quality_issues: {
        missing_essential_fields: { count: 0, affected_reports: [] },
        inconsistent_relationships: { count: 0, affected_reports: [] },
        data_format_issues: { count: 0, affected_reports: [] }
      },
      completeness_metrics: {
        fields_completeness: {},
        section_completeness: {}
      },
      data_distribution: {
        by_therapeutic_area: {},
        by_phase: {},
        by_source: {}
      },
      recommendations: []
    };
    
    // 1. Count total CSR reports
    const countResult = await db.select({ count: sql`COUNT(*)` }).from(csrSchema.csrReports);
    report.total_reports = Number(countResult[0]?.count || 0);
    
    if (report.total_reports === 0) {
      console.log('No CSR reports found in the database. Nothing to validate.');
      return;
    }
    
    console.log(`Found ${report.total_reports} CSR reports to validate.`);
    
    // 2. Check for missing essential fields
    const essentialFields = [
      { field: 'title', description: 'CSR Title' },
      { field: 'sponsor', description: 'Study Sponsor' },
      { field: 'indication', description: 'Indication' },
      { field: 'phase', description: 'Study Phase' }
    ];
    
    for (const { field, description } of essentialFields) {
      const missingFieldResults = await db.select({ 
        id: csrSchema.csrReports.id, 
        csr_id: csrSchema.csrReports.csr_id 
      })
      .from(csrSchema.csrReports)
      .where(isNull(csrSchema.csrReports[field as keyof typeof csrSchema.csrReports]))
      .limit(100);
      
      const count = missingFieldResults.length;
      if (count > 0) {
        report.data_quality_issues.missing_essential_fields.count += count;
        report.data_quality_issues.missing_essential_fields.affected_reports.push(
          ...missingFieldResults.map(r => ({ id: r.id, csr_id: r.csr_id, field: description }))
        );
      }
      
      // Track field completeness
      const filledCount = report.total_reports - count;
      report.completeness_metrics.fields_completeness[description] = {
        total: filledCount,
        percentage: Math.round((filledCount / report.total_reports) * 100)
      };
    }
    
    // 3. Check for CSRs without details
    const missingDetailsResults = await db.select({
      id: csrSchema.csrReports.id,
      csr_id: csrSchema.csrReports.csr_id
    })
    .from(csrSchema.csrReports)
    .leftJoin(csrSchema.csrDetails, eq(csrSchema.csrReports.id, csrSchema.csrDetails.report_id))
    .where(isNull(csrSchema.csrDetails.id))
    .limit(100);
    
    if (missingDetailsResults.length > 0) {
      report.data_quality_issues.inconsistent_relationships.count += missingDetailsResults.length;
      report.data_quality_issues.inconsistent_relationships.affected_reports.push(
        ...missingDetailsResults.map(r => ({ id: r.id, csr_id: r.csr_id, issue: 'Missing CSR Details' }))
      );
    }
    
    // 4. Check for CSRs without segments
    const missingSegmentsResults = await db.select({
      id: csrSchema.csrReports.id,
      csr_id: csrSchema.csrReports.csr_id
    })
    .from(csrSchema.csrReports)
    .leftJoin(csrSchema.csrSegments, eq(csrSchema.csrReports.id, csrSchema.csrSegments.report_id))
    .where(isNull(csrSchema.csrSegments.id))
    .groupBy(csrSchema.csrReports.id, csrSchema.csrReports.csr_id)
    .limit(100);
    
    if (missingSegmentsResults.length > 0) {
      report.data_quality_issues.inconsistent_relationships.count += missingSegmentsResults.length;
      report.data_quality_issues.inconsistent_relationships.affected_reports.push(
        ...missingSegmentsResults.map(r => ({ id: r.id, csr_id: r.csr_id, issue: 'Missing CSR Segments' }))
      );
    }
    
    // 5. Check for data format issues
    // Sample size should be a positive number
    const invalidSampleSizeResults = await db.select({
      id: csrSchema.csrDetails.report_id,
      csr_id: csrSchema.csrReports.csr_id
    })
    .from(csrSchema.csrDetails)
    .innerJoin(csrSchema.csrReports, eq(csrSchema.csrDetails.report_id, csrSchema.csrReports.id))
    .where(sql`${csrSchema.csrDetails.sample_size} <= 0 OR ${csrSchema.csrDetails.sample_size} > 100000`)
    .limit(100);
    
    if (invalidSampleSizeResults.length > 0) {
      report.data_quality_issues.data_format_issues.count += invalidSampleSizeResults.length;
      report.data_quality_issues.data_format_issues.affected_reports.push(
        ...invalidSampleSizeResults.map(r => ({ 
          id: r.id, 
          csr_id: r.csr_id, 
          field: 'Sample Size', 
          issue: 'Value outside reasonable range (1-100,000)' 
        }))
      );
    }
    
    // 6. Calculate section completeness
    const sections = [
      { field: 'study_design', name: 'Study Design' },
      { field: 'primary_objective', name: 'Primary Objective' },
      { field: 'inclusion_criteria', name: 'Inclusion Criteria' },
      { field: 'exclusion_criteria', name: 'Exclusion Criteria' },
      { field: 'treatment_arms', name: 'Treatment Arms' },
      { field: 'endpoints', name: 'Endpoints' },
      { field: 'results', name: 'Results' },
      { field: 'safety', name: 'Safety Data' }
    ];
    
    for (const { field, name } of sections) {
      const filledResults = await db.select({ count: sql`COUNT(*)` })
        .from(csrSchema.csrDetails)
        .where(sql`${csrSchema.csrDetails[field as keyof typeof csrSchema.csrDetails]} IS NOT NULL`);
      
      const filledCount = Number(filledResults[0]?.count || 0);
      report.completeness_metrics.section_completeness[name] = {
        total: filledCount,
        percentage: Math.round((filledCount / report.total_reports) * 100)
      };
    }
    
    // 7. Calculate data distribution
    // By therapeutic area
    const therapeuticAreaDistribution = await db.select({
      therapeutic_area: csrSchema.csrReports.therapeutic_area,
      count: sql`COUNT(*)`
    })
    .from(csrSchema.csrReports)
    .where(isNull(csrSchema.csrReports.therapeutic_area).not())
    .groupBy(csrSchema.csrReports.therapeutic_area)
    .orderBy(sql`COUNT(*)`, 'desc');
    
    therapeuticAreaDistribution.forEach(item => {
      if (item.therapeutic_area) {
        report.data_distribution.by_therapeutic_area[item.therapeutic_area] = Number(item.count);
      }
    });
    
    // By phase
    const phaseDistribution = await db.select({
      phase: csrSchema.csrReports.phase,
      count: sql`COUNT(*)`
    })
    .from(csrSchema.csrReports)
    .where(isNull(csrSchema.csrReports.phase).not())
    .groupBy(csrSchema.csrReports.phase)
    .orderBy(sql`COUNT(*)`, 'desc');
    
    phaseDistribution.forEach(item => {
      if (item.phase) {
        report.data_distribution.by_phase[item.phase] = Number(item.count);
      }
    });
    
    // By source
    const sourceDistribution = await db.select({
      source: csrSchema.csrReports.source,
      count: sql`COUNT(*)`
    })
    .from(csrSchema.csrReports)
    .groupBy(csrSchema.csrReports.source)
    .orderBy(sql`COUNT(*)`, 'desc');
    
    sourceDistribution.forEach(item => {
      if (item.source) {
        report.data_distribution.by_source[item.source] = Number(item.count);
      }
    });
    
    // 8. Generate recommendations
    if (report.data_quality_issues.missing_essential_fields.count > 0) {
      report.recommendations.push(
        'Fill in missing essential fields to improve data quality and search capabilities.'
      );
    }
    
    if (report.data_quality_issues.inconsistent_relationships.count > 0) {
      report.recommendations.push(
        'Create missing CSR details and segments for reports to ensure comprehensive data structure.'
      );
    }
    
    if (report.data_quality_issues.data_format_issues.count > 0) {
      report.recommendations.push(
        'Correct data format issues to ensure data validity and accurate analysis.'
      );
    }
    
    // Check for low section completeness
    const lowCompletenessSections = Object.entries(report.completeness_metrics.section_completeness)
      .filter(([_, { percentage }]) => percentage < 50)
      .map(([name, _]) => name);
    
    if (lowCompletenessSections.length > 0) {
      report.recommendations.push(
        `Focus on extracting and populating the following sections: ${lowCompletenessSections.join(', ')}.`
      );
    }
    
    // Check for imbalanced data distribution
    const totalTherapeuticAreas = Object.keys(report.data_distribution.by_therapeutic_area).length;
    if (totalTherapeuticAreas < 5) {
      report.recommendations.push(
        'Diversify therapeutic areas in the CSR collection for better coverage.'
      );
    }
    
    const totalPhases = Object.keys(report.data_distribution.by_phase).length;
    if (totalPhases < 6) {
      report.recommendations.push(
        'Ensure representation of all clinical trial phases in the CSR collection.'
      );
    }
    
    // 9. Save the report
    const reportPath = path.resolve('./data/csr_validation_report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // 10. Print summary
    console.log('\n====================================================================');
    console.log(' Validation Report Summary');
    console.log('====================================================================');
    console.log(`\nTotal CSR Reports: ${report.total_reports}`);
    
    console.log('\nData Quality Issues:');
    console.log(`- Missing Essential Fields: ${report.data_quality_issues.missing_essential_fields.count}`);
    console.log(`- Inconsistent Relationships: ${report.data_quality_issues.inconsistent_relationships.count}`);
    console.log(`- Data Format Issues: ${report.data_quality_issues.data_format_issues.count}`);
    
    console.log('\nCompleteness Metrics (Top 5):');
    Object.entries(report.completeness_metrics.section_completeness)
      .sort((a, b) => b[1].percentage - a[1].percentage)
      .slice(0, 5)
      .forEach(([name, { percentage }]) => {
        console.log(`- ${name}: ${percentage}%`);
      });
    
    console.log('\nData Distribution:');
    console.log(`- Therapeutic Areas: ${Object.keys(report.data_distribution.by_therapeutic_area).length}`);
    console.log(`- Phases: ${Object.keys(report.data_distribution.by_phase).length}`);
    console.log(`- Sources: ${Object.keys(report.data_distribution.by_source).length}`);
    
    console.log('\nRecommendations:');
    report.recommendations.forEach(rec => {
      console.log(`- ${rec}`);
    });
    
    console.log(`\nDetailed report saved to: ${reportPath}`);
    console.log('\nValidation complete!');
    
  } catch (error) {
    console.error('Error during validation:', error);
    console.log('\n❌ Validation failed. Please check the error message above.');
  } finally {
    process.exit(0);
  }
}

// Run the script
main().catch(console.error);