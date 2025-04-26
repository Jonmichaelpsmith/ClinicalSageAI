import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupSupabase() {
  console.log('Starting Supabase setup...');

  try {
    // 1. Create vault-files storage bucket
    console.log('Setting up storage bucket...');
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('vault-files', {
      public: false,
      allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      fileSizeLimit: 50000000 // 50MB
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('Storage bucket "vault-files" already exists, skipping creation');
      } else {
        throw bucketError;
      }
    } else {
      console.log('Storage bucket "vault-files" created successfully');
    }

    // 2. Check if documents table exists and create if not
    console.log('Setting up documents table...');
    
    // First check if table exists
    const { data: tableExists, error: tableExistsError } = await supabase
      .from('documents')
      .select('id')
      .limit(1);
    
    if (tableExistsError && !tableExistsError.message.includes('does not exist')) {
      throw tableExistsError;
    }
    
    if (tableExistsError && tableExistsError.message.includes('does not exist')) {
      // Create the documents table
      const { error: createError } = await supabase.query(`
        CREATE TABLE documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id UUID NOT NULL,
          path TEXT NOT NULL,
          filename TEXT NOT NULL,
          content_type TEXT NOT NULL,
          uploader_id UUID,
          summary TEXT,
          tags JSONB,
          status TEXT,
          inserted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      
      if (createError) throw createError;
      console.log('Documents table created successfully');
      
      // Add Row Level Security
      const { error: rlsError } = await supabase.query(`
        -- Enable RLS
        ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for tenant access
        CREATE POLICY "Tenants can view their own documents"
          ON documents
          FOR SELECT
          USING (auth.uid() IN (
            SELECT user_id FROM tenants WHERE id = tenant_id
          ));
          
        -- Create policy for tenant document creation
        CREATE POLICY "Tenants can create their own documents"
          ON documents
          FOR INSERT
          WITH CHECK (auth.uid() IN (
            SELECT user_id FROM tenants WHERE id = tenant_id
          ));
      `);
      
      if (rlsError) {
        console.warn('Warning: Could not set up RLS policies:', rlsError.message);
        console.warn('You may need to create appropriate policies manually');
      } else {
        console.log('Row Level Security policies added to documents table');
      }
    } else {
      console.log('Documents table already exists, skipping creation');
    }
    
    // 3. Check if audit_logs table exists and create if not
    console.log('Setting up audit_logs table...');
    
    // First check if table exists
    const { data: auditExists, error: auditExistsError } = await supabase
      .from('audit_logs')
      .select('id')
      .limit(1);
    
    if (auditExistsError && !auditExistsError.message.includes('does not exist')) {
      throw auditExistsError;
    }
    
    if (auditExistsError && auditExistsError.message.includes('does not exist')) {
      // Create the audit_logs table
      const { error: createAuditError } = await supabase.query(`
        CREATE TABLE audit_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id UUID NOT NULL,
          user_id UUID,
          action TEXT NOT NULL,
          details JSONB,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      
      if (createAuditError) throw createAuditError;
      console.log('Audit_logs table created successfully');
      
      // Add Row Level Security
      const { error: auditRlsError } = await supabase.query(`
        -- Enable RLS
        ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for tenant access
        CREATE POLICY "Tenants can view their own audit logs"
          ON audit_logs
          FOR SELECT
          USING (auth.uid() IN (
            SELECT user_id FROM tenants WHERE id = tenant_id
          ));
          
        -- Create policy for audit log creation
        CREATE POLICY "System can create audit logs"
          ON audit_logs
          FOR INSERT
          WITH CHECK (true);
      `);
      
      if (auditRlsError) {
        console.warn('Warning: Could not set up RLS policies for audit_logs:', auditRlsError.message);
        console.warn('You may need to create appropriate policies manually');
      } else {
        console.log('Row Level Security policies added to audit_logs table');
      }
    } else {
      console.log('Audit_logs table already exists, skipping creation');
    }

    console.log('Supabase setup completed successfully!');
  } catch (error) {
    console.error('Error during Supabase setup:', error);
    process.exit(1);
  }
}

setupSupabase();