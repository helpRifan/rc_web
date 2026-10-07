import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { db } from '@/lib/supabase/admin';
import { authClient } from '@/lib/supabase/server';
import { decideAdmin, type Admin } from './admin-rules';

async function findAdmin(email: string): Promise<Admin | null> {
  const { data, error } = await db().from('admins').select('id, email, name, is_owner').eq('email', email).maybeSingle();
  if (error) {
    console.error('admin lookup failed:', error.message);
    return null;
  }
  return data;
}

// Memoised per server request, so the layout, the page and its data helpers share one lookup.
export const getCurrentAdmin = cache(async (): Promise<Admin | null> => {
  const supabase = await authClient();
  const { data } = await supabase.auth.getUser();
  return decideAdmin(data.user, findAdmin);
});

export async function requireAdmin(): Promise<Admin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/sign-in');
  return admin;
}

export async function requireOwner(): Promise<Admin> {
  const admin = await requireAdmin();
  if (!admin.is_owner) redirect('/admin');
  return admin;
}
