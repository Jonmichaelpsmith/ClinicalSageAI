import { Router } from 'express';
import multer from 'multer';
import { supabaseSrv } from '../utils/supabaseSrv.js';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/studies/:studyId/documents
router.get('/studies/:studyId/documents', requireAuth, async (req, res) => {
  const { studyId } = req.params;
  
  try {
    // ensure tenant scope
    const docs = await db('documents')
      .where({ 
        study_id: studyId, 
        organization_id: req.user.orgId 
      })
      .select('*')
      .orderBy('uploaded_at', 'desc');
    
    res.json(docs);
  } catch (error) {
    console.error('Error retrieving documents:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// POST /api/studies/:studyId/documents (multipart/form-data file)
router.post('/studies/:studyId/documents', requireAuth, upload.single('file'), async (req, res) => {
  const { studyId } = req.params;
  const file = req.file;
  
  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  try {
    // Create a unique storage path based on timestamp and original filename
    const key = `${studyId}/${Date.now()}_${file.originalname}`;
    
    // Upload to Supabase Storage bucket "vault-files"
    const { error: upErr } = await supabaseSrv.storage
      .from('vault-files')
      .upload(key, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });
    
    if (upErr) {
      console.error('Supabase storage upload error:', upErr);
      return res.status(500).json({ 
        message: 'Upload failed', 
        error: upErr.message 
      });
    }
    
    // Get the public URL for the file
    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/vault-files/${key}`;
    
    // Insert document metadata into database
    const [doc] = await db('documents')
      .insert({
        study_id: studyId,
        organization_id: req.user.orgId,
        filename: file.originalname,
        mime_type: file.mimetype,
        file_size: file.size,
        storage_path: key,
        uploaded_by: req.user.id
      })
      .returning('*');
    
    res.status(201).json({
      ...doc,
      url: publicUrl
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// GET /api/documents/:docId/url → return signed URL (5-min expiry)
router.get('/documents/:docId/url', requireAuth, async (req, res) => {
  const { docId } = req.params;
  
  try {
    // Verify document exists and belongs to user's organization
    const doc = await db('documents')
      .where({ 
        id: docId, 
        organization_id: req.user.orgId 
      })
      .first();
    
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Create signed URL from Supabase Storage (expires in 300s = 5 minutes)
    const { data, error } = await supabaseSrv.storage
      .from('vault-files')
      .createSignedUrl(doc.storage_path, 300);
    
    if (error) {
      console.error('Signed URL generation error:', error);
      return res.status(500).json({ 
        message: 'Failed to sign URL', 
        error: error.message 
      });
    }
    
    res.json({ 
      url: data.signedUrl, 
      mime: doc.mime_type, 
      filename: doc.filename 
    });
  } catch (error) {
    console.error('Signed URL error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

export default router;