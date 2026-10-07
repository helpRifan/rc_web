import { divisionLabel } from '@/lib/divisions';
import { displayTag } from './display';

type ProfileFields = {
  full_name: string;
  role_title: string | null;
  division: string;
  year_of_study: string | null;
  degree: string | null;
  tags: string[] | null;
  github_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  portfolio_url: string | null;
};

/** "Operations, 3rd year, B.Tech CSE", from the parts that exist; null when none do. */
export function metaLine(member: Pick<ProfileFields, 'division' | 'year_of_study' | 'degree'>): string | null {
  const parts = [divisionLabel(member.division), member.year_of_study, member.degree].map(part => part?.trim()).filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

/** Up to three tags, with any "Other: " prefix dropped. */
export function profileTags(member: Pick<ProfileFields, 'tags'>): string[] {
  return (member.tags ?? []).map(displayTag).filter(Boolean).slice(0, 3);
}

const LINKS = [
  ['github_url', 'GitHub'],
  ['linkedin_url', 'LinkedIn'],
  ['instagram_url', 'Instagram'],
  ['portfolio_url', 'Portfolio'],
] as const;

/** The member's links that exist and are https, in a fixed order. */
export function profileLinks(member: ProfileFields): { label: string; href: string }[] {
  return LINKS.flatMap(([field, label]) => {
    const href = member[field];
    if (!href) return [];
    try {
      return new URL(href).protocol === 'https:' ? [{ label, href }] : [];
    } catch {
      return [];
    }
  });
}

/** The profile's meta description. */
export function profileDescription(member: Pick<ProfileFields, 'role_title'>): string {
  return member.role_title ? `${member.role_title} at Robotics Club, VIT Chennai.` : 'Member of Robotics Club, VIT Chennai.';
}
