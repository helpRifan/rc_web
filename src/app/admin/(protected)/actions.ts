'use server';

import { redirect } from 'next/navigation';
import { authClient } from '@/lib/supabase/server';

export async function signOut() {
  const supabase = await authClient();
  await supabase.auth.signOut();
  redirect('/admin/sign-in');
}
