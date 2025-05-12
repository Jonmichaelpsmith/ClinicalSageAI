/**
 * Literature System Setup Module
 * 
 * This module handles the initialization of the literature management system,
 * including database tables, PgVector extension, and external API connections.
 */

import { Pool } from 'pg';
import { readFile } from 'fs/promises';
import path from 'path';
import { OpenAI } from 'openai';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize database connection pool
let pool: Pool;
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
} catch (error) {
  console.error('Error initializing database pool:', error);
  throw error;
}

// Initialize OpenAI client (if available)
const openai = process.env.OPENAI_API_KEY ? 
  new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : 
  null;

/**
 * Setup literature system
 */
export async function setupLiteratureSystem(): Promise<{
  tablesSetup: boolean;
  pgvectorWorking: boolean;
  openaiWorking: boolean;
  pubmedWorking: boolean;
}> {
  try {
    console.log('Setting up literature management system...');
    
    // Check and setup database tables
    const tablesSetup = await setupDatabaseTables();
    
    // Test pgvector extension
    const pgvectorWorking = await testPgVector();
    
    // Test OpenAI connection
    const openaiWorking = await testOpenAI();
    
    // Test PubMed connection
    const pubmedWorking = await testPubMed();
    
    console.log('Literature system setup complete with status:');
    console.log(`- Database tables: ${tablesSetup ? 'SETUP' : 'FAILED'}`);
    console.log(`- pgvector extension: ${pgvectorWorking ? 'WORKING' : 'NOT WORKING'}`);
    console.log(`- OpenAI connection: ${openaiWorking ? 'WORKING' : 'NOT WORKING'}`);
    console.log(`- PubMed connection: ${pubmedWorking ? 'WORKING' : 'NOT WORKING'}`);
    
    return {
      tablesSetup,
      pgvectorWorking,
      openaiWorking,
      pubmedWorking
    };
  } catch (error) {
    console.error('Error setting up literature system:', error);
    return {
      tablesSetup: false,
      pgvectorWorking: false,
      openaiWorking: false,
      pubmedWorking: false
    };
  }
}

/**
 * Setup database tables for literature management
 */
async function setupDatabaseTables(): Promise<boolean> {
  try {
    const client = await pool.connect();
    
    try {
      // Check if migration script exists
      let migrationScript: string;
      try {
        migrationScript = await readFile(
          path.join(__dirname, '../../migrations/20250512_literature_entries.sql'),
          'utf-8'
        );
      } catch (err) {
        console.error('Migration script not found:', err);
        return false;
      }
      
      // Execute migration script
      await client.query(migrationScript);
      
      // Verify essential tables exist
      const tables = ['literature_entries', 'document_citations', 'literature_summaries'];
      for (const table of tables) {
        const result = await client.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = $1
          )`,
          [table]
        );
        
        if (!result.rows[0].exists) {
          console.error(`Table "${table}" does not exist after migration`);
          return false;
        }
      }
      
      console.log('Literature tables verified');
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error setting up database tables:', error);
    return false;
  }
}

/**
 * Test PgVector extension
 */
async function testPgVector(): Promise<boolean> {
  try {
    const client = await pool.connect();
    
    try {
      // Check if pgvector extension is available
      const result = await client.query(
        `SELECT EXISTS (
          SELECT FROM pg_extension
          WHERE extname = 'vector'
        )`
      );
      
      if (!result.rows[0].exists) {
        console.error('pgvector extension not installed');
        return false;
      }
      
      // Test basic vector functionality
      try {
        await client.query(`
          SELECT '[1,2,3]'::vector <-> '[4,5,6]'::vector as distance
        `);
        console.log('pgvector extension working');
        return true;
      } catch (err) {
        console.error('Error testing pgvector functionality:', err);
        return false;
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error testing pgvector:', error);
    return false;
  }
}

/**
 * Test OpenAI API connection
 */
async function testOpenAI(): Promise<boolean> {
  if (!openai) {
    console.log('OpenAI API key not configured');
    return false;
  }
  
  try {
    // Test API connection with a simple embedding request
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'Testing OpenAI connection',
      encoding_format: 'float'
    });
    
    if (response && response.data && response.data.length > 0) {
      console.log('OpenAI API connection working');
      return true;
    } else {
      console.error('OpenAI API response incomplete');
      return false;
    }
  } catch (error) {
    console.error('Error testing OpenAI API:', error);
    return false;
  }
}

/**
 * Test PubMed API connection
 */
async function testPubMed(): Promise<boolean> {
  try {
    // Test PubMed API connection with a simple search
    const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
    const searchUrl = `${baseUrl}/esearch.fcgi?db=pubmed&term=medical+device&retmax=1&retmode=json`;
    
    // Add API key if available
    const pubmedApiKey = process.env.PUBMED_API_KEY;
    const apiKeyParam = pubmedApiKey ? `&api_key=${pubmedApiKey}` : '';
    
    const response = await axios.get(searchUrl + apiKeyParam);
    
    if (response && response.data && response.data.esearchresult) {
      console.log('PubMed API connection working');
      return true;
    } else {
      console.error('PubMed API response incomplete');
      return false;
    }
  } catch (error) {
    console.error('Error testing PubMed API:', error);
    return false;
  }
}

/**
 * Run standalone setup
 */
export async function runStandaloneSetup(): Promise<void> {
  console.log('Running standalone literature system setup...');
  const result = await setupLiteratureSystem();
  
  if (result.tablesSetup && result.pgvectorWorking) {
    console.log('Literature system setup successful');
  } else {
    console.error('Literature system setup failed');
    console.error('Please check the error messages above and fix the issues');
  }
  
  // Close the database connection
  await pool.end();
}

// For ESM compatibility, detect if file is being run directly
// Note: In ESM, we can't use require.main === module
const isMainModule = import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
  runStandaloneSetup().catch(console.error);
}

// Export the database pool for reuse in other modules
export { pool };