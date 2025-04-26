import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabaseClient.js';

const router = Router();

// Email/password login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ message: error.message });
  const { user } = data;
  const token = jwt.sign({ id: user.id, role: 'user', tenantId: user.user_metadata.tenant_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Google OAuth callback handled client-side → Exchange for JWT here if needed

export default router;