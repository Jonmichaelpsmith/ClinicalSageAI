import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/programs - Get programs for user's organization
router.get('/', async (req, res) => {
  try {
    const programs = await db('programs')
      .where({ organization_id: req.user.orgId })
      .select('*')
      .orderBy('name');
    
    res.json(programs);
  } catch (error) {
    console.error('Error retrieving programs:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// GET /api/programs/:programId/studies - Get studies for a program
router.get('/:programId/studies', async (req, res) => {
  const { programId } = req.params;
  
  try {
    // Verify program belongs to user's organization
    const program = await db('programs')
      .where({ 
        id: programId, 
        organization_id: req.user.orgId 
      })
      .first();
    
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    const studies = await db('studies')
      .where({ program_id: programId })
      .select('*')
      .orderBy('name');
    
    res.json(studies);
  } catch (error) {
    console.error('Error retrieving studies:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// POST /api/programs - Create a new program
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Program name is required' });
  }
  
  try {
    const [program] = await db('programs')
      .insert({
        name,
        description,
        organization_id: req.user.orgId
      })
      .returning('*');
    
    res.status(201).json(program);
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// POST /api/programs/:programId/studies - Create a new study
router.post('/:programId/studies', async (req, res) => {
  const { programId } = req.params;
  const { name, phase } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Study name is required' });
  }
  
  try {
    // Verify program belongs to user's organization
    const program = await db('programs')
      .where({ 
        id: programId, 
        organization_id: req.user.orgId 
      })
      .first();
    
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    const [study] = await db('studies')
      .insert({
        name,
        phase,
        program_id: programId
      })
      .returning('*');
    
    res.status(201).json(study);
  } catch (error) {
    console.error('Error creating study:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

export default router;