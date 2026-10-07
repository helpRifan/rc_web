import type { PublicMember } from '@/lib/data/types';
import { divisionLabel } from '@/lib/divisions';
import { displayTag, initialsOf, photoUrl } from '@/lib/members/display';

/** Each division's card gradient angle (team brief 5.12). */
export const DIVISION_ANGLE: Record<string, number> = {
  projects: 145,
  webdev: 210,
  teaching: 165,
  media: 195,
  operations: 225,
  marketing: 135,
};

/** One core member, as the list, the sphere and its caption show them. Plain data, so the server can pass it. */
export type CoreItem = {
  key: string;
  href: string;
  name: string;
  role: string | null;
  division: string;
  divisionLabel: string | null;
  /** The list card's photo (a 4:4.2 face crop), or null for the monogram. */
  photo: string | null;
  /** The sphere disc's photo (a square face crop), or null for the glyph print. */
  spherePhoto: string | null;
  initials: string;
  gradientAngle: number;
  tags: string[];
};

export function coreItemOf(member: PublicMember): CoreItem {
  return {
    key: member.slug,
    href: `/team/${member.slug}`,
    name: member.full_name,
    role: member.role_title || null,
    division: member.division,
    divisionLabel: divisionLabel(member.division),
    photo: member.photo_url ? photoUrl(member.photo_url, { w: 480, h: 504 }) : null,
    spherePhoto: member.photo_url ? photoUrl(member.photo_url, { w: 512, h: 512 }) : null,
    initials: initialsOf(member.full_name),
    gradientAngle: DIVISION_ANGLE[member.division] ?? 160,
    tags: (member.tags ?? []).slice(0, 3).map(displayTag).filter(Boolean),
  };
}
