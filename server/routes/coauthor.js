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

export default router;