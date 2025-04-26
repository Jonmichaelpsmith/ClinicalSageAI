import { Router } from 'express';
import multer from 'multer';
import { supabaseSrv } from '../utils/supabaseSrv.js';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import OpenAI from 'openai';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate AI summary and tags for a document
 */
async function generateAI(meta) {
  try {
    const prompt = `You are a regulatory medical writer. Provide a 3-sentence summary and 5 keyword tags for a file named "${meta.filename}" which has MIME type ${meta.mime}. Guess from the filename if necessary.`;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200
    });
    
    const txt = completion.choices[0].message.content;
    const [summaryLine, ...rest] = txt.split('\n');
    const summary = summaryLine.trim();
    const tags = rest.join(' ').match(/#[A-Za-z0-9_]+/g) || [];
    
    return { summary, tags };
  } catch (error) {
    console.error('AI generation error:', error);
    return { summary: null, tags: [] };
  }
}

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
    const keyBase = `${studyId}/${Date.now()}_${file.originalname}`;
    
    // Upload to Supabase Storage bucket "vault-files"
    const { error: upErr } = await supabaseSrv.storage
      .from('vault-files')
      .upload(keyBase, file.buffer, {
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
    
    // Check if document exists (by filename within study)
    let doc = await db('documents')
      .where({ 
        filename: file.originalname, 
        study_id: studyId, 
        organization_id: req.user.orgId 
      })
      .first();
    
    let versionNumber = 1;
    
    if (!doc) {
      // Create new document record
      [doc] = await db('documents')
        .insert({
          study_id: studyId,
          organization_id: req.user.orgId,
          filename: file.originalname,
          mime_type: file.mimetype,
          file_size: file.size,
          storage_path: keyBase,
          uploaded_by: req.user.id,
          latest_version: 1
        })
        .returning('*');
    } else {
      // Update existing document record with new version
      versionNumber = doc.latest_version + 1;
      
      await db('documents')
        .where({ id: doc.id })
        .update({
          latest_version: versionNumber,
          file_size: file.size,
          mime_type: file.mimetype,
          storage_path: keyBase,
          uploaded_at: db.fn.now()
        });
    }
    
    // Generate AI summary and tags
    const ai = await generateAI({ 
      filename: file.originalname, 
      mime: file.mimetype 
    });
    
    // Update document with AI summary and tags
    if (ai.summary) {
      await db('documents')
        .where({ id: doc.id })
        .update({ 
          summary: ai.summary, 
          tags: JSON.stringify(ai.tags) 
        });
    }
    
    // Create document version record
    await db('document_versions')
      .insert({
        document_id: doc.id,
        version_number: versionNumber,
        storage_path: keyBase,
        mime_type: file.mimetype,
        file_size: file.size,
        summary: ai.summary,
        tags: JSON.stringify(ai.tags),
        uploaded_by: req.user.id
      });
    
    // Return updated document info
    res.status(201).json({
      ...doc,
      latest_version: versionNumber,
      summary: ai.summary,
      tags: ai.tags
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

// GET /api/documents/:docId/versions → get document version history
router.get('/documents/:docId/versions', requireAuth, async (req, res) => {
  const { docId } = req.params;
  
  try {
    // Get versions with document verification for tenant scope
    const versions = await db('document_versions as v')
      .join('documents as d', 'd.id', 'v.document_id')
      .where({
        'v.document_id': docId,
        'd.organization_id': req.user.orgId
      })
      .orderBy('v.version_number', 'desc')
      .select(
        'v.id',
        'v.version_number',
        'v.uploaded_at',
        'v.file_size',
        'v.summary'
      );
    
    res.json(versions);
  } catch (error) {
    console.error('Versions retrieval error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

export default router;