import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { serverEnv } from '@/lib/env';
import type { Database } from './database.types';

let client: SupabaseClient<Database> | undefined;

/** Secret-key client. Bypasses RLS. Server-only; never sent to the browser. */
export function db(): SupabaseClient<Database> {
  if (!client) {
    const env = serverEnv();
    client = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return client;
}
