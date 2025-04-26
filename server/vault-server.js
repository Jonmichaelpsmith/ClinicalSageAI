import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Setup multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// JWT verification middleware
const verifyJwt = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, tenantId }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// For demo purposes, generate a mock token
app.get('/api/vault/mock-token', (req, res) => {
  const mockUser = {
    id: '123456',
    role: 'user',
    tenantId: '123456'
  };
  const token = jwt.sign(mockUser, process.env.JWT_SECRET || 'fallback-secret-for-demo', { expiresIn: '1h' });
  res.json({ token });
});

// Auth routes
app.post('/api/vault/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ message: error.message });
    const { user } = data;
    const token = jwt.sign(
      { id: user.id, role: 'user', tenantId: user.user_metadata.tenant_id || user.id }, 
      process.env.JWT_SECRET || 'fallback-secret-for-demo', 
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
});

// AI utilities
async function generateSummary(buffer, contentType) {
  try {
    // For POC we pass limited text; in prod use proper extraction pipeline
    const base64 = buffer.toString('base64').slice(0, 10000);
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a regulatory medical writer. Provide a concise summary.' },
        { role: 'user', content: `Summarize this content: ${base64}` }
      ],
      max_tokens: 200
    });
    return resp.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Error generating summary';
  }
}

async function autoTag(buffer) {
  try {
    // simple POC – use keywords
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'List 5 relevant metadata tags (trial id, molecule, doc type, phase). Return as JSON array.' },
        { role: 'user', content: '<<document content omitted>>' }
      ],
      max_tokens: 60
    });
    try {
      return JSON.parse(resp.choices[0].message.content);
    } catch {
      return ['document', 'regulatory', 'medical', 'clinical', 'trial'];
    }
  } catch (error) {
    console.error('Error auto-tagging:', error);
    return ['document', 'regulatory', 'medical', 'clinical', 'trial'];
  }
}

// Document upload route
app.post('/api/vault/documents', verifyJwt, upload.single('file'), async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { tenantId, id: userId } = req.user;
    const path = `${tenantId}/${Date.now()}_${file.originalname}`;

    // 1. Store file to Supabase Storage
    console.log('Uploading file to Supabase...');
    const { error: uploadErr } = await supabase.storage
      .from('vault-files')
      .upload(path, file.buffer, { contentType: file.mimetype, upsert: false });
      
    if (uploadErr) {
      console.error('Storage upload error:', uploadErr);
      return res.status(500).json({ message: uploadErr.message });
    }

    // 2. Generate AI summary + tags
    console.log('Generating AI summary and tags...');
    const [summary, tags] = await Promise.all([
      generateSummary(file.buffer, file.mimetype),
      autoTag(file.buffer)
    ]);

    // 3. Insert metadata row
    console.log('Saving document metadata...');
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

    if (dbErr) {
      console.error('Database error:', dbErr);
      return res.status(500).json({ message: dbErr.message });
    }

    // 4. Create audit log entry
    await supabase.from('audit_logs').insert({
      tenant_id: tenantId,
      user_id: userId,
      action: 'DOCUMENT_UPLOAD',
      details: {
        document_id: data.id,
        filename: file.originalname,
        content_type: file.mimetype
      }
    });

    res.json(data);
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ message: 'Error processing document upload' });
  }
});

// Get audit logs
app.get('/api/vault/audit', verifyJwt, async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('timestamp', { ascending: false });
      
    if (error) {
      console.error('Audit logs error:', error);
      return res.status(500).json({ message: error.message });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Error fetching audit logs' });
  }
});

// Health check
app.get('/api/vault/health', (_, res) => {
  const connectionStatus = {
    supabase: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    jwt: !!process.env.JWT_SECRET
  };
  
  res.json({ 
    status: 'ok',
    connections: connectionStatus,
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.VAULT_PORT || 4000;
app.listen(PORT, () => {
  console.log(`TrialSage Vault API running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/api/vault/health`);
});