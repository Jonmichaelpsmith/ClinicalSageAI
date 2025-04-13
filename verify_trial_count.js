/**
 * Health Canada Trial Count Verification Script
 * 
 * This script checks the current number of Health Canada trials in the database
 * and provides a summary of progress toward the 4000 trial target.
 */

// ES Module imports
import pg from 'pg';

// Database connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function getTrialCounts() {
  const client = await pool.connect();
  try {
    // Get total count
    const totalResult = await client.query('SELECT COUNT(*) FROM csr_reports');
    const totalCount = parseInt(totalResult.rows[0].count, 10);
    
    // Get Health Canada count
    const hcResult = await client.query("SELECT COUNT(*) FROM csr_reports WHERE region = 'Health Canada'");
    const hcCount = parseInt(hcResult.rows[0].count, 10);
    
    // Get count by region
    const regionResult = await client.query(
      "SELECT region, COUNT(*) FROM csr_reports GROUP BY region ORDER BY COUNT(*) DESC"
    );
    
    // Get count by indication (top 10)
    const indicationResult = await client.query(
      "SELECT indication, COUNT(*) FROM csr_reports GROUP BY indication ORDER BY COUNT(*) DESC LIMIT 10"
    );
    
    // Get count by phase
    const phaseResult = await client.query(
      "SELECT phase, COUNT(*) FROM csr_reports GROUP BY phase ORDER BY COUNT(*) DESC"
    );
    
    return {
      totalCount,
      hcCount,
      byRegion: regionResult.rows,
      byIndication: indicationResult.rows,
      byPhase: phaseResult.rows
    };
  } catch (error) {
    console.error('Error getting trial counts:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  console.log('=== Trial Count Verification ===');
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    const counts = await getTrialCounts();
    
    console.log('\nTotal Trials:', counts.totalCount);
    console.log('Health Canada Trials:', counts.hcCount);
    console.log(`Progress to 4000 Target: ${counts.hcCount}/4000 (${Math.round(counts.hcCount/4000*100)}%)`);
    
    console.log('\n=== Trials by Region ===');
    counts.byRegion.forEach(row => {
      console.log(`${row.region}: ${row.count}`);
    });
    
    console.log('\n=== Top 10 Indications ===');
    counts.byIndication.forEach(row => {
      console.log(`${row.indication}: ${row.count}`);
    });
    
    console.log('\n=== Trials by Phase ===');
    counts.byPhase.forEach(row => {
      console.log(`${row.phase}: ${row.count}`);
    });
    
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await pool.end();
  }
}

// Run the verification
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});