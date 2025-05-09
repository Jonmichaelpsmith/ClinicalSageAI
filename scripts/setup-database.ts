/**
 * Database Setup Script
 * 
 * This script initializes the database by creating all required tables,
 * indexes, and RLS policies for multi-tenant isolation.
 */
import dotenv from 'dotenv';
import setupDatabase from '../server/db/setup';

// Load environment variables
dotenv.config();

// Define and immediately invoke an async main function
(async () => {
  console.log('Starting database setup...');
  
  try {
    await setupDatabase();
    console.log('Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
})();