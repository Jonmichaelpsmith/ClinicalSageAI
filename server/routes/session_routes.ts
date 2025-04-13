import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

// Ensure session_emails table exists
async function ensureSessionEmailTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS session_emails (
        session_id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log('Session emails table ready');
  } catch (error) {
    console.error('Error ensuring session_emails table exists:', error);
    // Continue even if table creation fails - we'll use in-memory fallback
  }
}

// Initialize the table
ensureSessionEmailTable();

// Session email data type
interface SessionEmailMapping {
  session_id: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

// Create an in-memory cache for session emails
const sessionEmailCache: Record<string, string> = {};

// Save email for a session
router.post('/email/save', async (req, res) => {
  try {
    const { session_id, recipient_email } = req.body;
    
    if (!session_id || !recipient_email) {
      return res.status(400).json({ error: 'Missing session_id or recipient_email' });
    }
    
    // Update in-memory cache
    sessionEmailCache[session_id] = recipient_email;
    
    // Try to store in database if available
    try {
      await db.execute(sql`
        INSERT INTO session_emails (session_id, email, created_at, updated_at)
        VALUES (${session_id}, ${recipient_email}, NOW(), NOW())
        ON CONFLICT (session_id) 
        DO UPDATE SET email = ${recipient_email}, updated_at = NOW()
      `);
    } catch (error) {
      console.log('Database storage for session email failed, using in-memory cache only');
      // Continue with in-memory cache if DB fails
    }
    
    res.status(200).json({
      session_id,
      email: recipient_email,
      status: 'saved'
    });
    
  } catch (error) {
    console.error('Error saving session email:', error);
    res.status(500).json({ error: 'Failed to save session email' });
  }
});

// Get email for a session
router.get('/email/get/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;
    
    if (!session_id) {
      return res.status(400).json({ error: 'Missing session_id' });
    }
    
    // First check in-memory cache
    if (sessionEmailCache[session_id]) {
      return res.status(200).json({
        session_id,
        email: sessionEmailCache[session_id]
      });
    }
    
    // Try to get from database if available
    try {
      const result = await db.execute<SessionEmailMapping>(sql`
        SELECT email FROM session_emails WHERE session_id = ${session_id}
      `);
      
      if (result.length > 0) {
        const email = result[0].email;
        
        // Update in-memory cache
        sessionEmailCache[session_id] = email;
        
        return res.status(200).json({
          session_id,
          email
        });
      }
    } catch (error) {
      console.log('Database retrieval for session email failed, using in-memory cache only');
      // Continue with no email if DB fails
    }
    
    // No email found
    res.status(404).json({
      session_id,
      email: null,
      status: 'not_found'
    });
    
  } catch (error) {
    console.error('Error retrieving session email:', error);
    res.status(500).json({ error: 'Failed to retrieve session email' });
  }
});

// List all sessions with emails (for admin)
router.get('/emails', async (req, res) => {
  try {
    const sessions = Object.entries(sessionEmailCache).map(([session_id, email]) => ({
      session_id,
      email
    }));
    
    res.status(200).json(sessions);
    
  } catch (error) {
    console.error('Error listing session emails:', error);
    res.status(500).json({ error: 'Failed to list session emails' });
  }
});

export default router;