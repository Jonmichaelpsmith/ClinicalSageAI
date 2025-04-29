import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const router = express.Router();
const pool = new Pool();

// Authentication middleware (reused from cerRoutes)
const authenticate = (req: Request, res: Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// List jobs with filtering by status
router.get('/jobs', authenticate, async (req: Request, res: Response) => {
  const { status, reviewer, page = 1, limit = 20 } = req.query;
  const filters = [];
  const values: any[] = [];
  let idx = 1;

  if (status && status !== 'all') { 
    filters.push(`status = $${idx++}`); 
    values.push(status); 
  }
  
  if (reviewer) { 
    filters.push(`EXISTS (SELECT 1 FROM cer_approvals a WHERE a.job_id = cj.job_id AND a.reviewer_id = $${idx++})`); 
    values.push(reviewer); 
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(limit);

  try {
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM cer_jobs cj ${where}`;
    const countResult = await pool.query(countQuery, values.slice(0, values.length - 2));
    const totalCount = parseInt(countResult.rows[0].count);
    
    // Get jobs with pagination
    const query = `SELECT cj.*, 
        COUNT(a.*) AS approvals_count,
        (SELECT jsonb_agg(json_build_object(
          'id', a.id,
          'reviewer_id', a.reviewer_id, 
          'decision', a.decision, 
          'comments', a.comments,
          'created_at', a.created_at
        )) FROM cer_approvals a WHERE a.job_id = cj.job_id) AS approvals
      FROM cer_jobs cj
      LEFT JOIN cer_approvals a ON a.job_id = cj.job_id
      ${where}
      GROUP BY cj.job_id
      ORDER BY cj.updated_at DESC
      LIMIT $${idx++} OFFSET $${idx++}`;
    
    values.push(limit, offset);
    const { rows } = await pool.query(query, values);
    
    res.json({ 
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get job details including approvals
router.get('/jobs/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const jobQuery = `
      SELECT j.*, 
        jsonb_agg(json_build_object(
          'id', a.id,
          'reviewer_id', a.reviewer_id, 
          'decision', a.decision, 
          'comments', a.comments,
          'created_at', a.created_at
        )) FILTER (WHERE a.id IS NOT NULL) AS approvals
      FROM cer_jobs j
      LEFT JOIN cer_approvals a ON j.job_id = a.job_id
      WHERE j.job_id = $1
      GROUP BY j.job_id`;
    
    const { rows } = await pool.query(jobQuery, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching job details:', err);
    res.status(500).json({ error: 'Failed to fetch job details' });
  }
});

// Review a CER (approve/reject/request changes)
router.post('/jobs/:id/review', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { decision, comments } = req.body; 
  const reviewerId = req.user!.id;

  if (!['approved', 'rejected', 'changes_requested'].includes(decision)) {
    return res.status(400).json({ error: 'Invalid decision value' });
  }

  try {
    // Start a transaction
    await pool.query('BEGIN');

    // Insert the review
    await pool.query(`
      INSERT INTO cer_approvals(job_id, reviewer_id, decision, comments)
      VALUES($1, $2, $3, $4)
    `, [id, reviewerId, decision, comments]);

    // Update job status
    const newStatus = decision === 'approved' 
      ? 'approved' 
      : (decision === 'changes_requested' ? 'in-review' : 'rejected');
      
    await pool.query(
      `UPDATE cer_jobs SET status = $1 WHERE job_id = $2`, 
      [newStatus, id]
    );

    // Get job owner's email for notification
    const { rows } = await pool.query(
      `SELECT u.email FROM cer_jobs j JOIN users u ON j.user_id = u.id WHERE j.job_id = $1`,
      [id]
    );

    // Commit the transaction
    await pool.query('COMMIT');

    // Send notification if we have an email (handled outside transaction)
    if (rows.length > 0 && rows[0].email) {
      try {
        await notifyOwnerOnReview(rows[0].email, id, decision);
      } catch (notifyErr) {
        console.error('Failed to send notification:', notifyErr);
        // Don't fail the request if notification fails
      }
    }

    res.status(200).json({ message: 'Review recorded' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error recording review:', err);
    res.status(500).json({ error: 'Failed to record review' });
  }
});

// Notification helper (stub for now)
async function notifyOwnerOnReview(jobOwnerEmail: string, jobId: string, decision: string) {
  console.log(`[NOTIFICATION] Would send email to ${jobOwnerEmail} about job ${jobId} being ${decision}`);
  // TODO: Implement actual email sending when notification service is ready
}

export default router;