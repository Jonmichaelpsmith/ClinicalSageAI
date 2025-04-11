import { createClient } from '@supabase/supabase-js';

// Use environment variables for the Supabase URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If the environment variables are not available, try to use process.env
// This is a fallback for server-side rendering
if (!supabaseUrl && process.env.SUPABASE_URL) {
  console.warn('Using process.env.SUPABASE_URL as fallback');
}

if (!supabaseKey && process.env.SUPABASE_ANON_KEY) {
  console.warn('Using process.env.SUPABASE_ANON_KEY as fallback');
}

// Export the Supabase client
export const supabase = createClient(
  supabaseUrl || process.env.SUPABASE_URL || '',
  supabaseKey || process.env.SUPABASE_ANON_KEY || ''
);