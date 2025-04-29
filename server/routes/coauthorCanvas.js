import express from 'express';
const router = express.Router();

// Dummy in‐memory CTD sections
let sections = [
  { id: '1.1', title: 'Module 1: Administrative', status: 'complete', x: 50,  y: 50 },
  { id: '2.7', title: 'Module 2.7: Clinical Summary', status: 'critical', x: 300, y: 50 },
  { id: '4.1', title: 'Module 4.1: Nonclinical Studies', status: 'warning',  x: 300, y: 200 },
  { id: '5.1', title: 'Module 5.1: Study Listings', status: 'warning',  x: 50,  y: 200 },
];

// Dummy connections between sections
let connections = [
  { from: '1.1', to: '2.7', critical: true },
  { from: '1.1', to: '4.1', critical: false },
  { from: '1.1', to: '5.1', critical: false },
];

/**
 * GET /api/coauthor/sections
 * Returns an array of CTD sections with their metadata
 */
router.get('/sections', (req, res) => {
  res.json(sections);
});

/**
 * GET /api/coauthor/connections
 * Returns an array of connections between sections with metadata
 */
router.get('/connections', (req, res) => {
  res.json(connections);
});

/**
 * POST /api/coauthor/layout/:id
 * Updates the position of a section
 */
router.post('/layout/:id', (req, res) => {
  const { id } = req.params;
  const { x, y } = req.body;
  
  // In a real implementation, this would update the database
  console.log(`Updating position for section ${id} to (${x}, ${y})`);
  
  res.json({ success: true, id, x, y });
});

/**
 * GET /api/coauthor/guidance/:id
 * Returns AI guidance for a specific section
 */
router.get('/guidance/:id', (req, res) => {
  const { id } = req.params;
  
  // In a real implementation, this would be generated with AI or fetched from a CMS
  const guidance = {
    id,
    title: `Guidance for Section ${id}`,
    content: `This section should describe the ${id.includes('2') ? 'clinical' : id.includes('3') ? 'chemical' : id.includes('4') ? 'nonclinical' : id.includes('5') ? 'clinical study' : 'relevant'} aspects in detail.`,
    examples: [`Example from a similar ${id} section in a successful IND submission`]
  };
  
  res.json(guidance);
});

/**
 * GET /api/coauthor/risk/:id
 * Returns risk assessment for a specific section
 */
router.get('/risk/:id', (req, res) => {
  const { id } = req.params;
  
  // In a real implementation, this would be calculated based on content analysis
  const risk = {
    id,
    level: id.includes('critical') ? 'high' : Math.random() > 0.5 ? 'medium' : 'low',
    factors: [
      `Quality of data in section ${id}`,
      `Completeness of information`
    ],
    delayImpact: Math.floor(Math.random() * 10) + 1 // 1-10 days
  };
  
  res.json(risk);
});

export default router;