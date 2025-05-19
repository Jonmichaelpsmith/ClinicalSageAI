import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ingestDocument } from '../services/vaultIngestService';
import { suggestTags } from '../services/vaultAIService';
import { indexSection, searchSections } from '../services/vaultSearchService';
import { runComplianceChecks } from '../services/complianceService';

// Create vault directories if they don't exist
const vaultDir = path.join(process.cwd(), 'vault');
const uploadsDir = path.join(vaultDir, 'uploads');

if (!fs.existsSync(vaultDir)) {
  fs.mkdirSync(vaultDir, { recursive: true });
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const router = Router();
const upload = multer({ dest: uploadsDir });

// POST /api/vault/:subId/ingest
router.post('/:subId/ingest', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { path: fp } = req.file;
    const { docId, sections } = await ingestDocument(fp);
    
    // Index sections for search
    await Promise.all(sections.map(s => indexSection(docId, s)));
    
    res.json({ docId, sections });
  } catch (error) {
    console.error('Error ingesting document:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
});

// POST /api/vault/:subId/tags
router.post('/:subId/tags', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text content is required' });
    }
    
    const tags = await suggestTags(text);
    res.json(tags);
  } catch (error) {
    console.error('Error suggesting tags:', error);
    res.status(500).json({ error: 'Failed to generate tags' });
  }
});

// GET /api/vault/search?q=<term>
router.get('/search', async (req, res) => {
  try {
    const q = String(req.query.q || '');
    if (!q) return res.json([]);
    
    const results = await searchSections(q);
    res.json(results);
  } catch (error) {
    console.error('Error searching documents:', error);
    res.status(500).json({ error: 'Failed to search documents' });
  }
});

// POST /api/vault/:subId/compliance
router.post('/:subId/compliance', async (req, res) => {
  try {
    const report = await runComplianceChecks(req.params.subId);
    res.json(report);
  } catch (error) {
    console.error('Error checking compliance:', error);
    res.status(500).json({ error: 'Failed to check compliance' });
  }
});

export default router;