'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { type ActionState, dbError } from '@/lib/admin/action';
import { imageSize } from '@/lib/admin/image-size';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/supabase/admin';
import { firstError, formFields, photoSchema } from '@/lib/validation/admin';

const LABELS: Record<string, string> = { image_url: 'Photo address', caption: 'Caption', event_id: 'Event', taken_on: 'Date taken', sort_order: 'Order' };
const id = z.uuid();

async function refresh(eventId: string | null) {
  revalidatePath('/');
  revalidatePath('/gallery');
  if (eventId) {
    const { data } = await db().from('events').select('slug').eq('id', eventId).maybeSingle();
    if (data) revalidatePath(`/events/${data.slug}`);
  }
}

/** Adds (no id) or updates a gallery photo. A new photo's size is read from the file itself. */
export async function savePhoto(_previous: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const photoId = String(form.get('id') ?? '');
  const fields = formFields(form, ['is_published']);
  const size = photoId ? null : await imageSize(String(fields.image_url ?? ''));
  const parsed = photoSchema.safeParse({ ...fields, width: size?.width ?? null, height: size?.height ?? null });
  if (!parsed.success) return { error: firstError(parsed.error, LABELS) };
  const { width, height, ...rest } = parsed.data;
  if (photoId) {
    if (!id.safeParse(photoId).success) return { error: 'That photo no longer exists.' };
    const { data: before } = await db().from('gallery_items').select('event_id').eq('id', photoId).maybeSingle();
    const { error } = await db().from('gallery_items').update(rest).eq('id', photoId);
    if (error) return dbError(error, 'saving a photo');
    await refresh(rest.event_id);
    if (before?.event_id && before.event_id !== rest.event_id) await refresh(before.event_id);
    return { ok: 'Saved. The public pages show it now.' };
  }
  const { data, error } = await db().from('gallery_items').insert({ ...rest, width, height }).select('id').single();
  if (error) return dbError(error, 'adding a photo');
  await refresh(rest.event_id);
  redirect(`/admin/gallery/${data.id}?created=1`);
}

/** Removes a photo from the gallery (the file stays on ImageKit). */
export async function deletePhoto(_previous: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const photoId = String(form.get('id') ?? '');
  if (!id.safeParse(photoId).success) return { error: 'That photo no longer exists.' };
  const { data: before } = await db().from('gallery_items').select('event_id').eq('id', photoId).maybeSingle();
  const { error } = await db().from('gallery_items').delete().eq('id', photoId);
  if (error) return dbError(error, 'removing a photo');
  await refresh(before?.event_id ?? null);
  redirect('/admin/gallery?deleted=1');
}
