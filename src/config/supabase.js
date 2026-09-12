import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yricesawauczfkvfjgaq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes('your_anon_key')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient(supabaseUrl, 'placeholder-anon-key');

if (isSupabaseConfigured) {
  console.log('✅ Supabase connected successfully to:', supabaseUrl);
} else {
  console.info('ℹ️ Supabase client initialized. Add VITE_SUPABASE_ANON_KEY in your .env to enable live cloud sync.');
}
