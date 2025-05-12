/**
 * Literature System Setup Module
 * 
 * This module handles the initialization of the literature management system,
 * including database tables, PgVector extension, and external API connections.
 */

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import axios from 'axios';

// Database connection pool
let pool: Pool;

// Initialize OpenAI client
let openai: OpenAI | null = null;

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
    // Initialize database connection
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    // Setup results
    const results = {
      tablesSetup: false,
      pgvectorWorking: false,
      openaiWorking: false,
      pubmedWorking: false,
    };
    
    // Create database tables
    results.tablesSetup = await setupDatabaseTables();
    
    // Test PgVector extension
    results.pgvectorWorking = await testPgVector();
    
    // Test OpenAI API connection
    results.openaiWorking = await testOpenAI();
    
    // Test PubMed API connection
    results.pubmedWorking = await testPubMed();
    
    return results;
  } catch (error) {
    console.error('Error setting up literature system:', error);
    return {
      tablesSetup: false,
      pgvectorWorking: false,
      openaiWorking: false,
      pubmedWorking: false,
    };
  } finally {
    // Close database connection
    if (pool) {
      await pool.end();
    }
  }
}

/**
 * Setup database tables for literature management
 */
async function setupDatabaseTables(): Promise<boolean> {
  try {
    // Read migration SQL file
    const migrationFile = path.join(process.cwd(), 'migrations', '20250512_literature_entries.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    // Execute migration SQL
    await pool.query(sql);
    
    return true;
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
    // Test vector operations
    const result = await pool.query(`
      SELECT 
        '[1,2,3]'::vector <-> '[4,5,6]'::vector as distance
    `);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error testing PgVector extension:', error);
    return false;
  }
}

/**
 * Test OpenAI API connection
 */
async function testOpenAI(): Promise<boolean> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OpenAI API key not found');
    return false;
  }
  
  try {
    // Initialize OpenAI client
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Test API connection with a simple embedding request
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: "Hello, world!",
    });
    
    return response.data && response.data.length > 0;
  } catch (error) {
    console.error('Error testing OpenAI API connection:', error);
    return false;
  }
}

/**
 * Test PubMed API connection
 */
async function testPubMed(): Promise<boolean> {
  const pubmedKey = process.env.PUBMED_API_KEY;
  
  try {
    // Base URL for PubMed E-utilities
    const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
    
    // Simple query to test the API
    const url = `${baseUrl}esearch.fcgi?db=pubmed&term=medical+device&retmode=json&retmax=1${pubmedKey ? `&api_key=${pubmedKey}` : ''}`;
    
    const response = await axios.get(url);
    
    return response.status === 200 && response.data && response.data.esearchresult;
  } catch (error) {
    console.error('Error testing PubMed API connection:', error);
    return false;
  }
}

// Function to run standalone setup (can be called from CLI tools)
export async function runStandaloneSetup(): Promise<void> {
  try {
    const results = await setupLiteratureSystem();
      
    console.log('\nLiterature System Setup Results:');
    console.log('---------------------------------');
    console.log(`Database Tables: ${results.tablesSetup ? '✅ Setup Complete' : '❌ Failed'}`);
    console.log(`PgVector Extension: ${results.pgvectorWorking ? '✅ Working' : '❌ Not Working'}`);
    console.log(`OpenAI API: ${results.openaiWorking ? '✅ Connected' : '❌ Not Connected'}`);
    console.log(`PubMed API: ${results.pubmedWorking ? '✅ Connected' : '❌ Not Connected'}`);
    console.log('---------------------------------');
    
    if (!results.tablesSetup || !results.pgvectorWorking) {
      console.error('\nCritical components failed setup. Literature search features may not work correctly.');
      return;
    }
    
    if (!results.openaiWorking) {
      console.warn('\nOpenAI API connection failed. Semantic search features will not be available.');
    }
    
    if (!results.pubmedWorking) {
      console.warn('\nPubMed API connection failed. PubMed literature search will not be available.');
    }
    
    console.log('\nSetup completed successfully.');
  } catch (error) {
    console.error('Setup failed with error:', error);
    throw error;
  }
}