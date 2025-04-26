import cron from 'node-cron';
import { supabase } from '../lib/supabaseClient.js';

/**
 * Run the retention policy job to archive and delete documents
 * based on configured retention rules
 */
async function runRetentionJob() {
  console.log('[Retention] Starting document retention job');
  try {
    // 1️⃣ fetch all rules
    const { data: rules, error: rulesError } = await supabase.from('retention_rules').select('*');
    
    if (rulesError) {
      console.error('[Retention] Error fetching retention rules:', rulesError.message);
      return false;
    }
    
    if (!rules || rules.length === 0) {
      console.log('[Retention] No retention rules configured, job complete');
      return true;
    }
    
    console.log(`[Retention] Processing ${rules.length} retention rules`);
    
    const now = new Date();
    let archivedCount = 0;
    let deletedCount = 0;
    
    for (const rule of rules) {
      const { tenant_id, doc_type, archive_after, delete_after } = rule;
      
      // build time thresholds
      const archiveBefore = new Date(now); 
      archiveBefore.setMonth(archiveBefore.getMonth() - archive_after);
      
      const deleteBefore = new Date(now); 
      deleteBefore.setMonth(deleteBefore.getMonth() - delete_after);
      
      console.log(`[Retention] Processing rule for tenant ${tenant_id}, doc type "${doc_type}" (archive: ${archive_after} months, delete: ${delete_after} months)`);

      // 2️⃣ archive eligible documents
      if (archive_after) {
        const { data: archivedDocs, error: archiveError } = await supabase
          .from('documents')
          .update({ status: 'Archived' })
          .eq('tenant_id', tenant_id)
          .eq('doc_type', doc_type)
          .eq('status', 'Effective')
          .lte('inserted_at', archiveBefore.toISOString());
          
        if (archiveError) {
          console.error(`[Retention] Error archiving documents for tenant ${tenant_id}, doc type "${doc_type}":`, archiveError.message);
          continue;
        }
        
        const count = archivedDocs?.length || 0;
        archivedCount += count;
        console.log(`[Retention] Archived ${count} documents for tenant ${tenant_id}, doc type "${doc_type}"`);
        
        // Log to audit trail
        await supabase.from('audit_logs').insert({
          tenant_id: tenant_id,
          action: 'auto_document_archive',
          details: JSON.stringify({ 
            doc_type, 
            count,
            rule_id: rule.id,
            archive_threshold: archiveBefore.toISOString() 
          })
        });
      }
      
      // 3️⃣ delete eligible documents
      if (delete_after) {
        // fetch ids to delete storage too
        const { data: delDocs, error: fetchError } = await supabase
          .from('documents')
          .select('id, path')
          .eq('tenant_id', tenant_id)
          .eq('doc_type', doc_type)
          .eq('status', 'Archived')
          .lte('inserted_at', deleteBefore.toISOString());
          
        if (fetchError) {
          console.error(`[Retention] Error fetching documents for deletion for tenant ${tenant_id}, doc type "${doc_type}":`, fetchError.message);
          continue;
        }
        
        if (!delDocs || delDocs.length === 0) {
          console.log(`[Retention] No documents eligible for deletion for tenant ${tenant_id}, doc type "${doc_type}"`);
          continue;
        }
        
        console.log(`[Retention] Deleting ${delDocs.length} documents for tenant ${tenant_id}, doc type "${doc_type}"`);
        
        // Delete files from storage
        for (const d of delDocs) {
          if (d.path) {
            const { error: storageError } = await supabase.storage.from('vault-files').remove([d.path]);
            if (storageError) {
              console.error(`[Retention] Error deleting file ${d.path}:`, storageError.message);
            }
          }
        }
        
        // Delete document records
        const { error: deleteError } = await supabase
          .from('documents')
          .delete()
          .in('id', delDocs.map(d => d.id));
          
        if (deleteError) {
          console.error(`[Retention] Error deleting documents for tenant ${tenant_id}, doc type "${doc_type}":`, deleteError.message);
          continue;
        }
        
        deletedCount += delDocs.length;
        
        // Log to audit trail
        await supabase.from('audit_logs').insert({
          tenant_id: tenant_id,
          action: 'auto_document_deletion',
          details: JSON.stringify({ 
            doc_type, 
            count: delDocs.length,
            rule_id: rule.id,
            delete_threshold: deleteBefore.toISOString() 
          })
        });
      }
    }
    
    console.log(`[Retention] Job completed successfully. Total: ${archivedCount} documents archived, ${deletedCount} documents deleted`);
    return true;
  } catch (err) {
    console.error('[Retention] Unexpected error in retention job:', err);
    return false;
  }
}

// Schedule job to run daily at 03:00 UTC
const job = cron.schedule('0 3 * * *', async () => {
  await runRetentionJob();
});

// Handle termination signals properly
process.on('SIGTERM', () => {
  console.log('[Retention] SIGTERM received, stopping job');
  job.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Retention] SIGINT received, stopping job');
  job.stop();
  process.exit(0);
});

// Export the job runner for manual execution
export { runRetentionJob };