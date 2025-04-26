import { Router } from 'express';
import { supabase } from '../lib/supabaseClient.js';
import { verifyJwt } from '../middleware/auth.js';
import { validateBody, schemas } from '../middleware/validation.js';

const router = Router();

// GET /api/retention – list rules for tenant
router.get('/', verifyJwt, async (req, res) => {
  const { tenantId } = req.user;
  const { data, error } = await supabase.from('retention_rules').select('*').eq('tenant_id', tenantId);
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// POST /api/retention – create/update rule {docType, archiveAfterMonths, deleteAfterMonths}
router.post('/', verifyJwt, validateBody(schemas.retentionRule), async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { docType, archiveAfterMonths, deleteAfterMonths } = req.body;
    
    // upsert
    const { error } = await supabase
      .from('retention_rules')
      .upsert({ 
        tenant_id: tenantId, 
        doc_type: docType, 
        archive_after: archiveAfterMonths, 
        delete_after: deleteAfterMonths 
      }, 
      { onConflict: 'tenant_id,doc_type' });
    
    if (error) return res.status(400).json({ message: error.message });
    
    // Log the action to audit trail
    await supabase.from('audit_logs').insert({
      tenant_id: tenantId,
      user_id: req.user.id,
      action: 'retention_rule_updated',
      details: JSON.stringify({ docType, archiveAfterMonths, deleteAfterMonths })
    });
    
    res.json({ ok: true });
  } catch (err) {
    console.error('Error updating retention rule:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;