import { Router } from 'express';
import multer from 'multer';
import { supabase } from '../lib/supabaseClient.js';
import { generateSummary, autoTag } from '../services/ai.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// POST /api/documents  (multipart/form-data)
router.post('/', upload.single('file'), async (req, res) => {
  const { file } = req;
  const { tenantId, id: userId } = req.user;
  const path = `${tenantId}/${Date.now()}_${file.originalname}`;

  // 1️⃣ store file to Supabase Storage
  const { error: uploadErr } = await supabase.storage
    .from('vault-files')
    .upload(path, file.buffer, { contentType: file.mimetype, upsert: false });
  if (uploadErr) return res.status(500).json({ message: uploadErr.message });

  // 2️⃣ generate AI summary + tags
  const [summary, tags] = await Promise.all([
    generateSummary(file.buffer, file.mimetype),
    autoTag(file.buffer)
  ]);

  // 3️⃣ insert metadata row
  const { error: dbErr, data } = await supabase.from('documents').insert({
    tenant_id: tenantId,
    path,
    filename: file.originalname,
    content_type: file.mimetype,
    uploader_id: userId,
    summary,
    tags,
    status: 'Draft'
  }).select().single();

  if (dbErr) return res.status(500).json({ message: dbErr.message });

  res.json(data);
});

export default router;