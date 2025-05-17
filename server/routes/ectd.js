import { Router } from 'express';
import { supabase } from '../lib/supabaseClient.js';
import { verifyJwt } from '../middleware/auth.js';
import { suggestMissing } from '../services/ai.js';

const router = Router();

// POST /api/ectd – create a new dossier skeleton
router.post('/', verifyJwt, async (req, res) => {
  const { tenantId, id: userId } = req.user;
  const { product, region, dossierType } = req.body; // e.g. NDA, MAA
  const { data, error } = await supabase
    .from('submissions')
    .insert({ tenant_id: tenantId, product, region, dossier_type: dossierType, status: 'Planning', created_by: userId })
    .select('*')
    .single();
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// GET /api/ectd/:id/outline – returns outline + readiness info
router.get('/:id/outline', verifyJwt, async (req, res) => {
  const { tenantId } = req.user;
  const { id } = req.params;
  const { data: sub, error: subErr } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single();
  if (subErr) return res.status(404).json({ message: 'Submission not found' });

  // Example static outline – could be driven by region
  const outline = [
    { section: 'Module 1', name: 'Regional Admin', docs: [] },
    { section: 'Module 2', name: 'Summary', docs: [] },
    { section: 'Module 3', name: 'Quality (CMC)', docs: [] },
    { section: 'Module 4', name: 'Non‑clinical', docs: [] },
    { section: 'Module 5', name: 'Clinical', docs: [] }
  ];
  // fetch existing docs linked to this submission
  const { data: docs } = await supabase
    .from('documents')
    .select('*')
    .contains('tags', [`submission:${id}`]);
  // map docs to outline
  outline.forEach(o => { o.docs = docs.filter(d => d.tags?.includes(o.section)); });

  // AI suggestion for missing sections
  const missing = outline.filter(o => o.docs.length === 0).map(o => o.section);
  const aiHint = missing.length ? await suggestMissing(missing, sub.region) : null;

  res.json({ outline, missing, aiHint });
});

export default router;
