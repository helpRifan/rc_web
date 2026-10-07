import 'server-only';
import { cache } from 'react';
import { db } from '@/lib/supabase/admin';
import { FIXTURE_PHOTOS } from './fixtures';
import { fixturesEnabled } from './source';
import { GALLERY_PUBLIC_COLUMNS, type PublicPhoto } from './types';

type Row = Omit<PublicPhoto, 'event'> & { event: { slug: string; title: string; is_published: boolean } | null };

/** A photo's event link survives only if that event is published. */
export function toPublicPhoto(row: Row): PublicPhoto {
  const { event, ...rest } = row;
  return { ...rest, event: event && event.is_published ? { slug: event.slug, title: event.title } : null };
}

// Published photos in the gallery's own order (sort_order, then upload order).
export const getPublishedPhotos = cache(async (): Promise<PublicPhoto[]> => {
  if (fixturesEnabled()) return FIXTURE_PHOTOS;
  const { data, error } = await db()
    .from('gallery_items')
    .select(GALLERY_PUBLIC_COLUMNS)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw new Error(`gallery query failed: ${error.message}`);
  return ((data ?? []) as Row[]).map(toPublicPhoto);
});

export async function getGallery(limit?: number): Promise<PublicPhoto[]> {
  const photos = await getPublishedPhotos();
  return limit === undefined ? photos : photos.slice(0, limit);
}

/** Newest first by the date taken (undated last), then the gallery order. For Home. */
export async function getLatestPhotos(limit: number): Promise<PublicPhoto[]> {
  const photos = [...(await getPublishedPhotos())];
  photos.sort((a, b) => {
    if (a.taken_on !== b.taken_on) {
      if (a.taken_on === null) return 1;
      if (b.taken_on === null) return -1;
      return a.taken_on < b.taken_on ? 1 : -1;
    }
    return a.sort_order - b.sort_order;
  });
  return photos.slice(0, limit);
}

export async function getEventPhotos(eventSlug: string): Promise<PublicPhoto[]> {
  return (await getPublishedPhotos()).filter(p => p.event?.slug === eventSlug);
}
