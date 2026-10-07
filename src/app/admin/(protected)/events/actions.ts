'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { type ActionState, dbError } from '@/lib/admin/action';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/supabase/admin';
import { eventSchema, firstError, formFields } from '@/lib/validation/admin';

const LABELS: Record<string, string> = {
  title: 'Title',
  slug: 'Web address',
  summary: 'Summary',
  description: 'Description',
  category: 'Category',
  status: 'Status',
  starts_on: 'Date',
  date_label: 'Date label',
  series: 'Series',
  cover_url: 'Cover image',
  registration_url: 'Registration link',
  recap_url: 'Recap link',
};
const id = z.uuid();

function refresh(slug: string) {
  revalidatePath('/');
  revalidatePath('/events');
  revalidatePath(`/events/${slug}`);
}

/** Creates (no id) or updates an event. */
export async function saveEvent(_previous: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = eventSchema.safeParse(formFields(form, ['is_published']));
  if (!parsed.success) return { error: firstError(parsed.error, LABELS) };
  const eventId = String(form.get('id') ?? '');
  if (eventId) {
    if (!id.safeParse(eventId).success) return { error: 'That event no longer exists.' };
    const { data: before } = await db().from('events').select('slug').eq('id', eventId).maybeSingle();
    const { error } = await db().from('events').update(parsed.data).eq('id', eventId);
    if (error) return dbError(error, 'saving an event');
    refresh(parsed.data.slug);
    if (before && before.slug !== parsed.data.slug) refresh(before.slug);
    return { ok: 'Saved. The public pages show it now.' };
  }
  const { data, error } = await db().from('events').insert(parsed.data).select('id').single();
  if (error) return dbError(error, 'creating an event');
  refresh(parsed.data.slug);
  redirect(`/admin/events/${data.id}?created=1`);
}

/** Deletes an event, but only one no certificate points at. */
export async function deleteEvent(_previous: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const eventId = String(form.get('id') ?? '');
  if (!id.safeParse(eventId).success) return { error: 'That event no longer exists.' };
  const { count, error: countError } = await db().from('certificates').select('id', { count: 'exact', head: true }).eq('event_id', eventId);
  if (countError) return dbError(countError, 'checking an event’s certificates');
  if ((count ?? 0) > 0) return { error: `This event has ${count} certificates, so it can’t be deleted. Unpublish it instead.` };
  const { data: before } = await db().from('events').select('slug').eq('id', eventId).maybeSingle();
  const { error } = await db().from('events').delete().eq('id', eventId);
  if (error) return dbError(error, 'deleting an event');
  if (before) refresh(before.slug);
  redirect('/admin/events?deleted=1');
}
