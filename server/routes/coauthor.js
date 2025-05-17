import express from 'express';
import fs from 'fs';
import path from 'path';
import { generateDraft } from '../brain/draftGenerator.js';

const router = express.Router();

// Directory to persist drafts
const draftsDir = path.join(process.cwd(), 'data', 'drafts');
if (!fs.existsSync(draftsDir)) {
  fs.mkdirSync(draftsDir, { recursive: true });
}

// Mock in-memory store—swap for your DB
let sections = [
  { id: '1.1', title: 'Module 1: Admin', x: 50, y: 50, status: 'complete', connections: [] },
  { id: '2.7', title: 'Module 2.7: Clinical Summary', x: 300, y: 50, status: 'critical', connections: ['1.1'] },
  { id: '3.2', title: 'Module 3.2: Clinical Efficacy', x: 550, y: 50, status: 'pending', connections: ['2.7'] },
  { id: '3.4', title: 'Module 3.4: Safety Reports', x: 550, y: 150, status: 'pending', connections: ['2.7'] },
  { id: '4.1', title: 'Module 4.1: Nonclinical Studies', x: 300, y: 150, status: 'pending', connections: ['1.1'] },
  { id: '5.1', title: 'Module 5.1: Study Listings', x: 50, y: 150, status: 'pending', connections: ['1.1'] },
];

// In-memory store for annotations
const annotations = {};

// AI advice templates based on section type
const adviceTemplates = {
  '1.1': 'Module 1 requires administrative information including contact details, application forms, and reference lists.',
  '2.7': 'The Clinical Summary should provide a comprehensive analysis of clinical data including efficacy and safety findings.',
  '3.2': 'The Clinical Efficacy section should present critical analyses of clinical trial data supporting your product\'s efficacy claims.',
  '3.4': 'Safety Reports require detailed analysis of adverse events, safety signals, and benefit-risk assessments.',
  '4.1': 'Nonclinical Studies should provide tabulated summaries of all relevant studies and their findings.',
  '5.1': 'Study Listings must include details of all clinical studies referenced in the application with proper indexing.',
  'default': 'This section requires thorough documentation following ICH guidelines. Consider referencing previous successful submissions.'
};

/**
 * Get all document sections with their positions
 */
router.get('/sections', (req, res) => {
  res.json(sections);
});

/**
 * Update position for a specific section
 */
router.post('/layout/:id', (req, res) => {
  const { id } = req.params;
  const { x, y } = req.body;
  
  sections = sections.map(sec => 
    sec.id === id ? { ...sec, x, y } : sec
  );
  
  res.sendStatus(204);
});

/**
 * Add a new connection between sections
 */
router.post('/connect', (req, res) => {
  const { fromId, toId } = req.body;
  
  sections = sections.map(sec => 
    sec.id === fromId 
      ? { ...sec, connections: [...sec.connections, toId] } 
      : sec
  );
  
  res.sendStatus(204);
});

/**
 * Get annotation for a section
 */
router.get('/annotation/:id', (req, res) => {
  const { id } = req.params;
  res.json({ notes: annotations[id] || '' });
});

/**
 * Save annotation for a section
 */
router.post('/annotation/:id', (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  
  if (notes) {
    annotations[id] = notes;
    res.sendStatus(204);
  } else {
    res.status(400).json({ error: 'Notes content is required' });
  }
});

/**
 * Get AI advice for a section
 */
router.post('/advice', (req, res) => {
  const { sectionId, text } = req.body;
  
  if (!sectionId) {
    return res.status(400).json({ error: 'Section ID is required' });
  }
  
  // Simulate AI processing time
  setTimeout(() => {
    const advice = adviceTemplates[sectionId] || adviceTemplates.default;
    
    // Add section-specific details
    const section = sections.find(s => s.id === sectionId);
    
    let enhancedAdvice = advice;
    if (section && section.status === 'critical') {
      enhancedAdvice += ' This section is flagged as critical and requires immediate attention.';
    }
    
    res.json({ advice: enhancedAdvice });
  }, 1000);
});

/**
 * Save a draft for a section
 */
router.post('/draft', (req, res) => {
  const { sectionId, content } = req.body;

  if (!sectionId || !content) {
    return res.status(400).json({ error: 'sectionId and content are required' });
  }

  const file = path.join(draftsDir, `${sectionId}.json`);
  let history = [];
  if (fs.existsSync(file)) {
    try {
      history = JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch {
      history = [];
    }
  }

  const entry = {
    id: `version-${history.length + 1}`,
    timestamp: new Date().toISOString(),
    content,
  };
  history.unshift(entry);
  fs.writeFileSync(file, JSON.stringify(history, null, 2));

  res.json({ success: true, version: entry.id });
});

/**
 * Retrieve draft history for a section
 */
router.get('/history/:sectionId', (req, res) => {
  const { sectionId } = req.params;
  const file = path.join(draftsDir, `${sectionId}.json`);
  if (!fs.existsSync(file)) {
    return res.json([]);
  }

  try {
    const history = JSON.parse(fs.readFileSync(file, 'utf-8'));
    res.json(history);
  } catch (err) {
    console.error('Failed to read history:', err);
    res.status(500).json({ error: 'Failed to read history' });
  }
});

/**
 * Generate a draft via AI
 */
router.post('/generate', async (req, res) => {
  try {
    const { moduleId = 'm2', sectionId, currentContent = '', contextIds = [], query = '' } = req.body;
    if (!sectionId) {
      return res.status(400).json({ error: 'sectionId is required' });
    }

    const draft = await generateDraft({ moduleId, sectionId, currentContent, contextIds, query });
    res.json({ draft });
  } catch (err) {
    console.error('generate error:', err);
    res.status(500).json({ error: 'Failed to generate draft' });
  }
});

/**
 * Export content in a given format
 */
router.post('/export', (req, res) => {
  const { content = '', format = 'txt' } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'content is required' });
  }

  const ext = ['pdf', 'docx', 'html', 'txt'].includes(format) ? format : 'txt';
  const filename = `draft-${Date.now()}.${ext}`;
  const filePath = path.join(draftsDir, filename);
  fs.writeFileSync(filePath, content);
  res.json({ url: `/drafts/${filename}`, filename });
});

export default router;