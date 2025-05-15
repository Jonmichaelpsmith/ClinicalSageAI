import { Pool } from 'pg';
import express from 'express';
const router = express.Router();
const db = new Pool({ connectionString: process.env.DATABASE_URL });

// GET existing profile
router.get('/device-profile/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    const { rows } = await db.query(
      `SELECT * FROM device_profiles WHERE project_id = $1`,
      [projectId]
    );
    res.json(rows[0] || null);
  } catch (error) {
    console.error('Error retrieving device profile:', error);
    res.status(500).json({ error: 'Failed to retrieve device profile' });
  }
});

// POST save/update profile
router.post('/device-profile', async (req, res) => {
  const { projectId, name, model, intendedUse, technology } = req.body;
  const now = new Date();
  
  try {
    // upsert
    await db.query(
      `INSERT INTO device_profiles(project_id,name,model,intended_use,technology,created_at,updated_at)
      VALUES($1,$2,$3,$4,$5,$6,$6)
      ON CONFLICT (project_id)
      DO UPDATE SET
        name=EXCLUDED.name,
        model=EXCLUDED.model,
        intended_use=EXCLUDED.intended_use,
        technology=EXCLUDED.technology,
        updated_at=EXCLUDED.updated_at`,
      [projectId, name, model, intendedUse, technology, now]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving device profile:', error);
    res.status(500).json({ error: 'Failed to save device profile' });
  }
});

export default router;