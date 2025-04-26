import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw error;
    
    // TODO: fetch org & role mapping from DB (UserOrganization)
    req.user = { 
      id: user.id, 
      email: user.email, 
      orgId: user.user_metadata?.org_id, 
      role: user.user_metadata?.role 
    };
    
    return next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.sendStatus(401);
  }
}