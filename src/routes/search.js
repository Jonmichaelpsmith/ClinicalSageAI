import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/search?studyId=&q=keyword&tags=tag1,tag2
router.get('/search', requireAuth, async (req, res) => {
  const { studyId, q = '', tags = '' } = req.query;
  
  if (!studyId) {
    return res.status(400).json({ message: 'studyId required' });
  }
  
  try {
    // Parse tags into array
    const tagArr = tags ? tags.split(',').map(t => t.trim()) : [];
    
    // Start building the query
    let query = db('documents')
      .where({ 
        study_id: studyId, 
        organization_id: req.user.orgId 
      });
    
    // Add text search if query parameter is provided
    if (q) {
      query = query.andWhere('summary', 'ilike', `%${q}%`);
    }
    
    // Add tag filter if tags are provided
    if (tagArr.length) {
      query = query.andWhereRaw('tags ?| array[??]', [tagArr]);
    }
    
    // Execute query
    const docs = await query
      .select('*')
      .orderBy('uploaded_at', 'desc');
    
    res.json(docs);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      message: 'Search error', 
      error: error.message 
    });
  }
});

export default router;