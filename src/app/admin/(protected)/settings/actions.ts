'use server';

import { revalidatePath } from 'next/cache';
import { type ActionState, dbError } from '@/lib/admin/action';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/supabase/admin';
import { divisionLinesSchema, firstError, formFields } from '@/lib/validation/admin';

async function put(key: string, value: unknown) {
  return db().from('site_settings').upsert({ key, value: value as never }, { onConflict: 'key' });
}

/** Opens or closes recruitment (the Join page's form and wording follow it). */
export async function saveRecruitment(_previous: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const open = form.get('open') === 'on';
  const { error } = await put('recruitment', { open });
  if (error) return dbError(error, 'saving recruitment');
  revalidatePath('/join');
  return { ok: open ? 'Recruitment is open.' : 'Recruitment is closed.' };
}

/** The one-line sentence for each division (Home's "What we do", Team's filtered list). */
export async function saveDivisionLines(_previous: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = divisionLinesSchema.safeParse(formFields(form));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const lines = Object.fromEntries(Object.entries(parsed.data).filter(([, line]) => line));
  const { error } = await put('divisions', lines);
  if (error) return dbError(error, 'saving the division sentences');
  revalidatePath('/');
  revalidatePath('/team');
  return { ok: 'Saved. Home and Team show them now.' };
}
