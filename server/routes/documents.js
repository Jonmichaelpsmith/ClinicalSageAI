import express from 'express';
import multer from 'multer';
import supabase from '../lib/supabaseClient.js';
import { verifyJwt, requireRoles } from '../middleware/auth.js';
import { generateSummary, autoTag } from '../services/ai.js';

const router = express.Router();

// Set up multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

/**
 * @route GET /api/vault/documents
 * @desc Get documents for the current tenant
 * @access Private
 */
router.get('/', verifyJwt, async (req, res) => {
  try {
    const { tenantId } = req.user;
    
    // Query parameters for filtering
    const { status, limit = 100, offset = 0 } = req.query;
    
    // Build query
    let query = supabase
      .from('documents')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('inserted_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Add status filter if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching documents:', error);
      return res.status(500).json({ message: error.message });
    }
    
    return res.json({
      documents: data || [],
      count,
    });
  } catch (error) {
    console.error('Error in documents GET route:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/vault/documents/:id
 * @desc Get a single document by ID
 * @access Private
 */
router.get('/:id', verifyJwt, async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();
    
    if (error) {
      console.error('Error fetching document:', error);
      return res.status(404).json({ message: 'Document not found' });
    }
    
    return res.json(data);
  } catch (error) {
    console.error('Error in document GET by ID route:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/vault/documents
 * @desc Upload a new document
 * @access Private
 */
router.post('/', verifyJwt, upload.single('file'), async (req, res) => {
  try {
    const { file } = req;
    const { tenantId, id: userId } = req.user;
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    console.log('File upload request received:', {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
    
    // Create storage path based on tenant and timestamp
    const timestamp = Date.now();
    const path = `${tenantId}/${timestamp}_${file.originalname}`;
    
    // 1. Store file to Supabase Storage
    console.log('Uploading file to Supabase Storage...');
    const { error: uploadError } = await supabase.storage
      .from('vault-files')
      .upload(path, file.buffer, { 
        contentType: file.mimetype,
        upsert: false,
      });
    
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return res.status(500).json({ message: uploadError.message });
    }
    
    // 2. Generate AI summary and tags if OpenAI API key is available
    console.log('Generating AI summary and tags...');
    let summary = 'AI summary not available';
    let tags = ['document'];
    
    if (process.env.OPENAI_API_KEY) {
      try {
        [summary, tags] = await Promise.all([
          generateSummary(file.buffer, file.mimetype),
          autoTag(file.buffer)
        ]);
      } catch (aiError) {
        console.error('AI processing error:', aiError);
        // Continue with default values
      }
    }
    
    // 3. Insert metadata into database
    console.log('Saving document metadata to database...');
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        tenant_id: tenantId,
        path,
        filename: file.originalname,
        content_type: file.mimetype,
        uploader_id: userId,
        summary,
        tags,
        status: 'Draft',
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ message: dbError.message });
    }
    
    // 4. Create audit log entry
    await supabase.from('audit_logs').insert({
      tenant_id: tenantId,
      user_id: userId,
      action: 'DOCUMENT_UPLOAD',
      details: {
        document_id: document.id,
        filename: file.originalname,
        content_type: file.mimetype,
        size: file.size,
      }
    });
    
    return res.status(201).json(document);
  } catch (error) {
    console.error('Error in document upload route:', error);
    return res.status(500).json({ message: 'Server error uploading document' });
  }
});

/**
 * @route PUT /api/vault/documents/:id
 * @desc Update a document's metadata
 * @access Private
 */
router.put('/:id', verifyJwt, async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId, id: userId } = req.user;
    const { status, tags } = req.body;
    
    // Verify document exists and belongs to tenant
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();
    
    if (fetchError) {
      console.error('Document fetch error:', fetchError);
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Update document metadata
    const updates = {};
    if (status) updates.status = status;
    if (tags) updates.tags = tags;
    
    const { data: updatedDoc, error: updateError } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Document update error:', updateError);
      return res.status(500).json({ message: updateError.message });
    }
    
    // Create audit log entry
    await supabase.from('audit_logs').insert({
      tenant_id: tenantId,
      user_id: userId,
      action: 'DOCUMENT_UPDATE',
      details: {
        document_id: id,
        updated_fields: Object.keys(updates),
        previous_values: {
          status: document.status,
          tags: document.tags,
        },
        new_values: updates,
      }
    });
    
    return res.json(updatedDoc);
  } catch (error) {
    console.error('Error in document update route:', error);
    return res.status(500).json({ message: 'Server error updating document' });
  }
});

/**
 * @route DELETE /api/vault/documents/:id
 * @desc Mark a document as deleted (soft delete)
 * @access Private
 */
router.delete('/:id', verifyJwt, requireRoles(['admin', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId, id: userId } = req.user;
    
    // Verify document exists and belongs to tenant
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();
    
    if (fetchError) {
      console.error('Document fetch error:', fetchError);
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Soft delete by updating status
    const { error: updateError } = await supabase
      .from('documents')
      .update({ status: 'Deleted' })
      .eq('id', id)
      .eq('tenant_id', tenantId);
    
    if (updateError) {
      console.error('Document delete error:', updateError);
      return res.status(500).json({ message: updateError.message });
    }
    
    // Create audit log entry
    await supabase.from('audit_logs').insert({
      tenant_id: tenantId,
      user_id: userId,
      action: 'DOCUMENT_DELETE',
      details: {
        document_id: id,
        filename: document.filename,
      }
    });
    
    return res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error in document delete route:', error);
    return res.status(500).json({ message: 'Server error deleting document' });
  }
});

/**
 * @route GET /api/vault/documents/:id/download
 * @desc Download a document file
 * @access Private
 */
router.get('/:id/download', verifyJwt, async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId, id: userId } = req.user;
    
    // Verify document exists and belongs to tenant
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();
    
    if (fetchError) {
      console.error('Document fetch error:', fetchError);
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Generate signed URL for download
    const { data: signedUrl, error: signedUrlError } = await supabase.storage
      .from('vault-files')
      .createSignedUrl(document.path, 60); // 60 second expiry
    
    if (signedUrlError) {
      console.error('Signed URL generation error:', signedUrlError);
      return res.status(500).json({ message: signedUrlError.message });
    }
    
    // Create audit log entry
    await supabase.from('audit_logs').insert({
      tenant_id: tenantId,
      user_id: userId,
      action: 'DOCUMENT_DOWNLOAD',
      details: {
        document_id: id,
        filename: document.filename,
      }
    });
    
    // Return the signed URL
    return res.json({ 
      url: signedUrl.signedUrl,
      filename: document.filename,
      expiresAt: new Date(Date.now() + 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Error in document download route:', error);
    return res.status(500).json({ message: 'Server error generating download link' });
  }
});

export default router;