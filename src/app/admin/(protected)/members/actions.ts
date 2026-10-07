'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { type ActionState, dbError } from '@/lib/admin/action';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/supabase/admin';
import { firstError, formFields, memberSchema } from '@/lib/validation/admin';

const LABELS: Record<string, string> = {
  full_name: 'Name',
  role_title: 'Role',
  level: 'Level',
  division: 'Division',
  year_of_study: 'Year of study',
  degree: 'Degree',
  joined_year: 'Year joined',
  about: 'About',
  currently_building: 'Currently building',
  fun_fact: 'Fun fact',
  github_url: 'GitHub',
  linkedin_url: 'LinkedIn',
  instagram_url: 'Instagram',
  portfolio_url: 'Portfolio',
  sort_order: 'Order',
};
const id = z.uuid();

/** Updates a member's text, links, publishing and order. Photos come only from the import script. */
export async function saveMember(_previous: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const memberId = String(form.get('id') ?? '');
  if (!id.safeParse(memberId).success) return { error: 'That member no longer exists.' };
  const parsed = memberSchema.safeParse(formFields(form, ['is_published']));
  if (!parsed.success) return { error: firstError(parsed.error, LABELS) };
  const { error } = await db()
    .from('members')
    .update(parsed.data as never)
    .eq('id', memberId);
  if (error) return dbError(error, 'saving a member');
  revalidatePath('/team', 'layout');
  revalidatePath('/about');
  return { ok: 'Saved. The Team page shows it now.' };
}
