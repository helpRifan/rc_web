import 'server-only';
import { cache } from 'react';
import { groupPastByYear, selectUpcoming } from '@/lib/events';
import { db } from '@/lib/supabase/admin';
import { FIXTURE_EVENTS } from './fixtures';
import { fixturesEnabled } from './source';
import { EVENT_PUBLIC_COLUMNS, type PublicEvent } from './types';

// The events table is small (tens of rows), so one cached query of every published event feeds
// every event rule; the rules themselves live in src/lib/events.ts and are tested there.
export const getPublishedEvents = cache(async (): Promise<PublicEvent[]> => {
  if (fixturesEnabled()) return FIXTURE_EVENTS;
  const { data, error } = await db().from('events').select(EVENT_PUBLIC_COLUMNS).eq('is_published', true);
  if (error) throw new Error(`events query failed: ${error.message}`);
  return data ?? [];
});

export async function getUpcomingEvents(limit = 50, now: Date = new Date()): Promise<PublicEvent[]> {
  return selectUpcoming(await getPublishedEvents(), now, limit);
}

export async function getPastEventsByYear(now: Date = new Date()) {
  return groupPastByYear(await getPublishedEvents(), now);
}

export async function getEventBySlug(slug: string): Promise<PublicEvent | null> {
  return (await getPublishedEvents()).find(e => e.slug === slug) ?? null;
}
