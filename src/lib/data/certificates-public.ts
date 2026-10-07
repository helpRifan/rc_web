import 'server-only';
import { cache } from 'react';
import { addDays, todayInIndia } from '@/lib/dates';
import { db } from '@/lib/supabase/admin';
import { getPublishedEvents } from './events';
import { fixturesEnabled } from './source';
import type { CertificateStat } from './types';

// Counts only: this module never selects names, teams, institutions or emails. A test pins the column list.
export const CERT_STAT_COLUMNS = 'event_id, issued_on';
const PAGE = 1000; // PostgREST's default row cap

/** Issued certificates per event: how many, and the latest issue date. */
export function aggregateStats(rows: ReadonlyArray<{ event_id: string; issued_on: string }>): Map<string, CertificateStat> {
  const stats = new Map<string, CertificateStat>();
  for (const { event_id, issued_on } of rows) {
    const current = stats.get(event_id);
    stats.set(event_id, {
      issued: (current?.issued ?? 0) + 1,
      lastIssuedOn: current && current.lastIssuedOn > issued_on ? current.lastIssuedOn : issued_on,
    });
  }
  return stats;
}

export const getCertificateStats = cache(async (): Promise<Map<string, CertificateStat>> => {
  if (fixturesEnabled()) return new Map();
  const rows: { event_id: string; issued_on: string }[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db()
      .from('certificates')
      .select(CERT_STAT_COLUMNS)
      .eq('status', 'issued')
      .order('id', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`certificate stats query failed: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return aggregateStats(rows);
});

/**
 * The most recent series (or single event) whose certificates were issued in the last `days`
 * days, for the home prompt. Counts only; never reads names or emails.
 */
export async function getRecentCertificatePrompt(now: Date = new Date(), days = 120): Promise<{ label: string; titles: string[] } | null> {
  const [stats, events] = await Promise.all([getCertificateStats(), getPublishedEvents()]);
  const since = addDays(todayInIndia(now), -days);
  const recent = events
    .filter(e => e.status === 'completed')
    .map(e => ({ event: e, stat: stats.get(e.id) }))
    .filter((x): x is { event: (typeof events)[number]; stat: CertificateStat } => !!x.stat && x.stat.issued > 0 && x.stat.lastIssuedOn >= since);
  if (!recent.length) return null;
  const newest = recent.reduce((a, b) => (b.stat.lastIssuedOn > a.stat.lastIssuedOn ? b : a));
  const series = newest.event.series;
  const titles = series
    ? recent.filter(x => x.event.series === series).map(x => x.event.title).sort((a, b) => a.localeCompare(b, 'en'))
    : [newest.event.title];
  return { label: series ?? newest.event.title, titles };
}
