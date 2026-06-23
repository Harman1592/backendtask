import { createClient } from '@supabase/supabase-js';
import { config } from './index.js';

if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  throw new Error('Missing required Supabase configuration');
}

export const supabaseClient = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

export type Database = any;
