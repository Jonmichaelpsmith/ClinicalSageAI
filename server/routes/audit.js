import { Router } from 'express';
import { supabase } from '../lib/supabaseClient.js';
const router = Router();

router.get('/', async (req, res) => {
  const { tenantId } = req.user;
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('timestamp', { ascending: false });
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

export default router;