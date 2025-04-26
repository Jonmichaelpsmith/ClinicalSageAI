import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check for required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupDatabase() {
  console.log('Setting up TrialSage Vault database in Supabase...');

  try {
    // Create the uuid extension if it doesn't exist
    console.log('Ensuring uuid-ossp extension is enabled...');
    const { error: extensionError } = await supabase.from('_postgrest_rpc').select(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `).execute().catch((e) => {
      // Suppressing extension error - might not have permission to create extensions
      console.log('Note: UUID extension might already be enabled in Supabase by default');
      return { error: null };
    });

    if (extensionError) {
      console.warn(`Warning: Could not create UUID extension, but continuing: ${extensionError.message}`);
    }

    // Create documents table using SQL
    console.log('Creating documents table...');
    const { error: documentsError } = await supabase.from('_postgrest_rpc').select(`
      CREATE TABLE IF NOT EXISTS documents (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        title text NOT NULL,
        description text,
        file_path text NOT NULL,
        file_name text NOT NULL,
        mime_type text,
        size bigint,
        content_hash text,
        document_type text,
        category text,
        tags jsonb,
        ai_tags jsonb,
        ai_summary text,
        created_by text NOT NULL,
        tenant_id text NOT NULL,
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now()
      );
    `).execute();

    if (documentsError) {
      throw new Error(`Failed to create documents table: ${documentsError.message}`);
    }

    // Create audit_trail table using SQL
    console.log('Creating audit_trail table...');
    const { error: auditError } = await supabase.from('_postgrest_rpc').select(`
      CREATE TABLE IF NOT EXISTS audit_trail (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id text NOT NULL,
        event_type text NOT NULL,
        event_details jsonb,
        ip_address text,
        timestamp timestamp with time zone DEFAULT now()
      );
    `).execute();

    if (auditError) {
      throw new Error(`Failed to create audit_trail table: ${auditError.message}`);
    }

    // Create users table using SQL
    console.log('Creating users table...');
    const { error: usersError } = await supabase.from('_postgrest_rpc').select(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        username text UNIQUE NOT NULL,
        password text NOT NULL,
        email text UNIQUE,
        name text,
        role text DEFAULT 'user',
        tenant_id text NOT NULL,
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now()
      );
    `).execute();

    if (usersError) {
      throw new Error(`Failed to create users table: ${usersError.message}`);
    }

    // Create admin user if it doesn't exist
    console.log('Creating admin user...');
    const { data: existingAdmin, error: checkAdminError } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .single();

    if (checkAdminError && checkAdminError.code !== 'PGRST116') {
      throw new Error(`Failed to check for admin user: ${checkAdminError.message}`);
    }

    if (!existingAdmin) {
      const { error: insertAdminError } = await supabase
        .from('users')
        .insert({
          username: 'admin',
          password: 'admin123', // This would be properly hashed in production
          email: 'admin@trialsage.com',
          name: 'TrialSage Administrator',
          role: 'admin',
          tenant_id: 'default'
        });

      if (insertAdminError) {
        throw new Error(`Failed to create admin user: ${insertAdminError.message}`);
      }
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    console.log('TrialSage Vault database setup completed successfully!');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();