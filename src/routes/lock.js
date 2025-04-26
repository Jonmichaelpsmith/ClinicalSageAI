import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/documents/:docId/lock
router.post('/documents/:docId/lock', requireAuth, async (req, res) => {
  const { docId } = req.params;
  const now = new Date();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1-hour lock
  
  try {
    // Lock only if currently unlocked or expired
    const updated = await db('documents')
      .where({ 
        id: docId, 
        organization_id: req.user.orgId 
      })
      .andWhere(function() { 
        this.whereNull('locked_by').orWhere('lock_expires', '<', now); 
      })
      .update({ 
        locked_by: req.user.id, 
        locked_at: now, 
        lock_expires: expires 
      });
    
    if (!updated) {
      return res.status(423).json({ message: 'Document already locked' });
    }
    
    res.json({ 
      ok: true, 
      locked_by: req.user.id, 
      lock_expires: expires 
    });
  } catch (error) {
    console.error('Lock error:', error);
    res.status(500).json({ 
      message: 'Failed to lock document', 
      error: error.message 
    });
  }
});

// POST /api/documents/:docId/unlock
router.post('/documents/:docId/unlock', requireAuth, async (req, res) => {
  const { docId } = req.params;
  
  try {
    // Get document
    const doc = await db('documents')
      .where({ id: docId })
      .first();
    
    // Check if user is the lock owner
    if (doc.locked_by !== req.user.id) {
      return res.status(403).json({ message: 'Not lock owner' });
    }
    
    // Release lock
    await db('documents')
      .where({ id: docId })
      .update({ 
        locked_by: null, 
        locked_at: null, 
        lock_expires: null 
      });
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Unlock error:', error);
    res.status(500).json({ 
      message: 'Failed to unlock document', 
      error: error.message 
    });
  }
});

export default router;