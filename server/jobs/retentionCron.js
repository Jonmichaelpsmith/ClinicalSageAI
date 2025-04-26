import cron from 'node-cron';
import { supabase } from '../lib/supabaseClient.js';

cron.schedule('0 3 * * *', async () => { // run daily at 03:00 UTC
  console.log('[Retention] nightly job');
  // 1️⃣ fetch all rules
  const { data: rules } = await supabase.from('retention_rules').select('*');
  const now = new Date();
  for (const rule of rules) {
    const { tenant_id, doc_type, archive_after, delete_after } = rule;
    // build time thresholds
    const archiveBefore = new Date(now); archiveBefore.setMonth(archiveBefore.getMonth() - archive_after);
    const deleteBefore = new Date(now); deleteBefore.setMonth(deleteBefore.getMonth() - delete_after);

    // 2️⃣ archive eligible
    if (archive_after) {
      await supabase.from('documents').update({ status: 'Archived' })
        .eq('tenant_id', tenant_id)
        .eq('doc_type', doc_type)
        .eq('status', 'Effective')
        .lte('inserted_at', archiveBefore.toISOString());
    }
    // 3️⃣ delete eligible
    if (delete_after) {
      // fetch ids to delete storage too
      const { data: delDocs } = await supabase.from('documents')
        .select('id, path')
        .eq('tenant_id', tenant_id)
        .eq('doc_type', doc_type)
        .eq('status', 'Archived')
        .lte('inserted_at', deleteBefore.toISOString());
      for (const d of delDocs) {
        await supabase.storage.from('vault-files').remove([d.path]);
      }
      await supabase.from('documents').delete().in('id', delDocs.map(d=>d.id));
    }
  }
  console.log('[Retention] job completed');
});