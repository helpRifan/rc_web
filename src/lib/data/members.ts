import 'server-only';
import { cache } from 'react';
import { divisionRank } from '@/lib/divisions';
import { db } from '@/lib/supabase/admin';
import { FIXTURE_MEMBERS } from './fixtures';
import { fixturesEnabled } from './source';
import { MEMBER_PUBLIC_COLUMNS, type PublicMember } from './types';

const LEVEL_RANK: Record<string, number> = { head: 0, lead: 1, core: 2 };

const byOrderThenName = (a: PublicMember, b: PublicMember) => a.sort_order - b.sort_order || a.full_name.localeCompare(b.full_name, 'en');

/**
 * The team, split the way /team shows it. Core is ordered by division (DIVISIONS order), then
 * level (head, lead, core), then sort_order, then name: one order for the sphere, the list, the
 * keyboard rotation and the profile pages' previous and next links. `member` level isn't listed.
 */
export function splitTeam(members: readonly PublicMember[]) {
  const faculty = members.filter(m => m.level === 'faculty').sort(byOrderThenName);
  const board = members.filter(m => m.level === 'board' && m.division !== 'alumni').sort(byOrderThenName);
  const core = members
    .filter(m => (m.level === 'head' || m.level === 'lead' || m.level === 'core') && m.division !== 'alumni')
    .sort(
      (a, b) =>
        divisionRank(a.division) - divisionRank(b.division) ||
        (LEVEL_RANK[a.level] ?? 9) - (LEVEL_RANK[b.level] ?? 9) ||
        byOrderThenName(a, b),
    );
  const alumni = members.filter(m => m.division === 'alumni').sort(byOrderThenName);
  return { faculty, board, core, alumni };
}

export const getPublishedMembers = cache(async (): Promise<PublicMember[]> => {
  if (fixturesEnabled()) return FIXTURE_MEMBERS;
  const { data, error } = await db().from('members').select(MEMBER_PUBLIC_COLUMNS).eq('is_published', true);
  if (error) throw new Error(`members query failed: ${error.message}`);
  return data ?? [];
});

export async function getMembersByLevel() {
  return splitTeam(await getPublishedMembers());
}

export async function getMemberBySlug(slug: string): Promise<PublicMember | null> {
  return (await getPublishedMembers()).find(m => m.slug === slug) ?? null;
}

/** Previous and next in the same group: the Board among the Board, core members within their division. */
export async function getDivisionNeighbours(member: PublicMember): Promise<{ previous: PublicMember | null; next: PublicMember | null }> {
  const { board, core } = await getMembersByLevel();
  const group = member.level === 'board' ? board : core.filter(m => m.division === member.division);
  const index = group.findIndex(m => m.slug === member.slug);
  if (index === -1) return { previous: null, next: null };
  return { previous: group[index - 1] ?? null, next: group[index + 1] ?? null };
}
