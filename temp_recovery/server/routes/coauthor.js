import express from 'express';
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

export default router;