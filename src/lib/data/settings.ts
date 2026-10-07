import 'server-only';
import { cache } from 'react';
import { z } from 'zod';
import { DIVISIONS, type DivisionId } from '@/lib/divisions';
import { db } from '@/lib/supabase/admin';
import { FIXTURE_SETTINGS } from './fixtures';
import { fixturesEnabled } from './source';

async function readSetting(key: string): Promise<unknown> {
  const { data, error } = await db().from('site_settings').select('value').eq('key', key).maybeSingle();
  if (error) throw new Error(`site_settings query failed: ${error.message}`);
  return data?.value ?? null;
}

const RecruitmentSchema = z.object({ open: z.boolean() });

/** Recruitment state. A missing row, bad JSON or a failed query all mean closed (spec Q10). */
export const getRecruitment = cache(async (): Promise<{ open: boolean }> => {
  if (fixturesEnabled()) return { ...FIXTURE_SETTINGS.recruitment };
  try {
    const parsed = RecruitmentSchema.safeParse(await readSetting('recruitment'));
    return parsed.success ? parsed.data : { open: false };
  } catch (error) {
    console.error('[data] recruitment failed, showing closed:', error instanceof Error ? error.message : error);
    return { open: false };
  }
});

export type DivisionLines = Partial<Record<DivisionId, string>>;

const line = z.string().trim().min(1).max(160);

/** Keeps only known divisions with a valid one-line sentence; drops everything else. */
export function parseDivisionLines(value: unknown): DivisionLines {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const lines: DivisionLines = {};
  for (const { id } of DIVISIONS) {
    const parsed = line.safeParse((value as Record<string, unknown>)[id]);
    if (parsed.success) lines[id] = parsed.data;
  }
  return lines;
}

/** The owner's one-line description of each division (site_settings key `divisions`). Throws on query errors. */
export const getDivisionLines = cache(async (): Promise<DivisionLines> => {
  if (fixturesEnabled()) return parseDivisionLines(FIXTURE_SETTINGS.divisions);
  return parseDivisionLines(await readSetting('divisions'));
});
