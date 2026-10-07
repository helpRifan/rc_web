import { createBrowserClient } from '@supabase/ssr';

/** Browser client for Google sign-in only. The browser never queries tables (spec 5). */
export function browserClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
}
