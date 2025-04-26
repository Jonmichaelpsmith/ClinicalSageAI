import db from '../db.js';

export async function listPrograms(req, res) {
  try {
    const progs = await db('programs')
      .where({ organization_id: req.user.orgId })
      .select('*');
    res.json(progs);
  } catch (err) { 
    console.error('Error listing programs:', err);
    res.status(500).json({message: 'Database error'});
  }
}

export async function createProgram(req, res) {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({message: 'Name required'});
  
  try {
    const [prog] = await db('programs')
      .insert({ 
        name, 
        description, 
        organization_id: req.user.orgId 
      })
      .returning('*');
    res.status(201).json(prog);
  } catch (err) { 
    console.error('Error creating program:', err);
    res.status(500).json({message: 'Database error'});
  }
}