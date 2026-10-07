import type { PublicMember } from '@/lib/data/types';
import { divisionLabel } from '@/lib/divisions';
import { initialsOf } from '@/lib/members/display';
import { bandFor, type BadgeFace } from './badge-art';

/** What one badge prints, plus its photo, as plain data the server can hand to the client. */
export type BadgeData = BadgeFace & { photo: string | null };

export function badgeFaceOf(member: PublicMember): BadgeData {
  return {
    slug: member.slug,
    name: member.full_name,
    role: member.role_title || null,
    initials: initialsOf(member.full_name),
    band: bandFor(member.level, member.division, divisionLabel(member.division)),
    joinedYear: member.joined_year,
    photo: member.photo_url,
  };
}

/** The window's shape on the static badge (84 by 72.6 card-width hundredths), for the photo crop. */
export const WINDOW_ASPECT = 84 / 72.6;
