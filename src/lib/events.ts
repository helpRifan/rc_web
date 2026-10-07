// Pure event rules, shared by the data layer (database or fixtures), pages and tests.
import { addDays, todayInIndia } from './dates';
import type { PublicEvent } from './data/types';

const UPCOMING_STATUSES = new Set(['upcoming', 'registration_open', 'coming_soon']);

// An event dated more than 2 days ago is past, even if an admin forgot to mark it completed.
const GRACE_DAYS = 2;

function cutoff(now: Date): string {
  return addDays(todayInIndia(now), -GRACE_DAYS);
}

function isStale(e: PublicEvent, now: Date): boolean {
  return e.starts_on !== null && e.starts_on < cutoff(now);
}

function byDateThenTitle(a: PublicEvent, b: PublicEvent, direction: 1 | -1): number {
  if (a.starts_on !== b.starts_on) {
    if (a.starts_on === null) return 1; // nulls last either way
    if (b.starts_on === null) return -1;
    return a.starts_on < b.starts_on ? -direction : direction;
  }
  return a.title.localeCompare(b.title, 'en');
}

/** Upcoming, registration open or coming soon, and not stale. Soonest first, undated last. */
export function selectUpcoming(events: readonly PublicEvent[], now: Date = new Date(), limit = 50): PublicEvent[] {
  return events
    .filter(e => UPCOMING_STATUSES.has(e.status) && !isStale(e, now))
    .sort((a, b) => byDateThenTitle(a, b, 1))
    .slice(0, limit);
}

/** Completed events, plus any whose date is clearly past. */
export function selectPast(events: readonly PublicEvent[], now: Date = new Date()): PublicEvent[] {
  return events.filter(e => e.status === 'completed' || isStale(e, now));
}

/**
 * The year an event belongs to: its date's year; otherwise a 4-digit year or 'yy in the series,
 * then the date label (2000 + yy), accepted only if it isn't after next year; otherwise null.
 */
export function eventYear(e: Pick<PublicEvent, 'starts_on' | 'series' | 'date_label'>, now: Date = new Date()): number | null {
  if (e.starts_on) return Number(e.starts_on.slice(0, 4));
  const limit = Number(todayInIndia(now).slice(0, 4)) + 1;
  for (const text of [e.series, e.date_label]) {
    if (!text) continue;
    const full = text.match(/\b(20\d{2})\b/);
    const short = text.match(/['’](\d{2})\b/);
    const year = full ? Number(full[1]) : short ? 2000 + Number(short[1]) : null;
    if (year !== null && year <= limit) return year;
  }
  return null;
}

/** Past events grouped by year, newest year first, the undated group last. */
export function groupPastByYear(events: readonly PublicEvent[], now: Date = new Date()): Array<{ year: number | null; events: PublicEvent[] }> {
  const groups = new Map<number | null, PublicEvent[]>();
  for (const e of selectPast(events, now)) {
    const year = eventYear(e, now);
    groups.set(year, [...(groups.get(year) ?? []), e]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a === null ? 1 : b === null ? -1 : b - a))
    .map(([year, list]) => ({ year, events: list.sort((a, b) => byDateThenTitle(a, b, -1)) }));
}

/**
 * The events either side of this one on its detail page: within its series (or among all events
 * when it has none), in date order (undated last), then by title.
 */
export function eventNeighbours(event: PublicEvent, events: readonly PublicEvent[]): { previous: PublicEvent | null; next: PublicEvent | null } {
  const group = events.filter(e => (event.series ? e.series === event.series : true)).sort((a, b) => byDateThenTitle(a, b, 1));
  const index = group.findIndex(e => e.id === event.id);
  if (index === -1) return { previous: null, next: null };
  return { previous: group[index - 1] ?? null, next: group[index + 1] ?? null };
}
