import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { generateDraft as aiGenerateDraft } from '../brain/draftGenerator.js';

const router = express.Router();

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

// In-memory drafts store keyed by sectionId
const drafts = {};

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
 * Save a draft of a section
 */
router.post('/drafts', (req, res) => {
  const { sectionId, content, author = 'anonymous' } = req.body;

  if (!sectionId || !content) {
    return res.status(400).json({ error: 'sectionId and content are required' });
  }

  const version = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    author,
    content
  };

  if (!drafts[sectionId]) drafts[sectionId] = [];
  drafts[sectionId].unshift(version);

  res.status(201).json(version);
});

/**
 * Retrieve draft history for a section
 */
router.get('/history/:sectionId', (req, res) => {
  const { sectionId } = req.params;
  res.json(drafts[sectionId] || []);
});

/**
 * Generate a draft using AI
 */
router.post('/generate-draft', async (req, res) => {
  const { moduleId, sectionId, currentText = '', query = '' } = req.body;

  if (!moduleId || !sectionId) {
    return res.status(400).json({ error: 'moduleId and sectionId are required' });
  }

  try {
    const draft = await aiGenerateDraft({
      moduleId,
      sectionId,
      currentContent: currentText,
      query
    });

    res.json({ draft });
  } catch (err) {
    console.error('Draft generation error:', err);
    res.status(500).json({ error: 'Failed to generate draft' });
  }
});

/**
 * Export content in the requested format
 */
router.post('/export', async (req, res) => {
  const { content, format = 'txt' } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    if (format === 'pdf') {
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      let { height } = page.getSize();
      let y = height - 50;

      content.split('\n').forEach(line => {
        page.drawText(line, { x: 50, y, size: 12, font });
        y -= 15;
        if (y < 50) {
          page = pdfDoc.addPage();
          height = page.getSize().height;
          y = height - 50;
        }
      });

      const bytes = await pdfDoc.save();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="export.pdf"');
      return res.send(Buffer.from(bytes));
    }

    const mime =
      format === 'html'
        ? 'text/html'
        : format === 'docx'
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'text/plain';

    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `attachment; filename="export.${format}"`);
    return res.send(content);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Failed to export content' });
  }
});

export default router;