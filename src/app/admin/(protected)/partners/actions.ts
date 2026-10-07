'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { type ActionState, dbError } from '@/lib/admin/action';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/supabase/admin';
import { firstError, formFields, partnerSchema } from '@/lib/validation/admin';

const LABELS: Record<string, string> = { name: 'Name', website_url: 'Website', logo_url: 'Logo', relationship: 'How they work with us', sort_order: 'Order' };
const id = z.uuid();

// The header's Partners item depends on whether any partner is published, so every page refreshes.
const refresh = () => revalidatePath('/', 'layout');

/** Creates (no id) or updates a partner. */
export async function savePartner(_previous: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = partnerSchema.safeParse(formFields(form, ['is_published']));
  if (!parsed.success) return { error: firstError(parsed.error, LABELS) };
  const partnerId = String(form.get('id') ?? '');
  if (partnerId) {
    if (!id.safeParse(partnerId).success) return { error: 'That partner no longer exists.' };
    const { error } = await db().from('partners').update(parsed.data).eq('id', partnerId);
    if (error) return dbError(error, 'saving a partner');
    refresh();
    return { ok: 'Saved. The public pages show it now.' };
  }
  const { data, error } = await db().from('partners').insert(parsed.data).select('id').single();
  if (error) return dbError(error, 'adding a partner');
  refresh();
  redirect(`/admin/partners/${data.id}?created=1`);
}

export async function deletePartner(_previous: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const partnerId = String(form.get('id') ?? '');
  if (!id.safeParse(partnerId).success) return { error: 'That partner no longer exists.' };
  const { error } = await db().from('partners').delete().eq('id', partnerId);
  if (error) return dbError(error, 'removing a partner');
  refresh();
  redirect('/admin/partners?deleted=1');
}
