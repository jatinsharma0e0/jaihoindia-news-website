import { createClient } from '@supabase/supabase-js';

// Supabase configuration for frontend (Public Reads Only)
// NEVER use service role/secret key in the frontend
const supabaseUrl = 'https://ffffnasgzkmyggoobbrv.supabase.co';
const supabaseAnonKey = 'sb_publishable_0qjk3zxeVphPU3juOiM5lg_pM5QiEKC'; // This is the Safe Publishable key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
