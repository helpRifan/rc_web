import { ik } from '@/lib/photos';

const HONORIFICS = new Set(['dr', 'prof', 'mr', 'ms', 'mrs']);

/**
 * One or two letters for a monogram: the first word's initial, plus the initial of the last word
 * longer than 2 characters when there is one. Honorifics are dropped. "Grace" gives "G",
 * "Mohamed Rifan Ajmal" gives "MA", "Dr. Arockia Selvakumar A." gives "AS".
 */
export function initialsOf(fullName: string): string {
  const words = fullName
    .trim()
    .split(/\s+/)
    .filter(word => word && !HONORIFICS.has(word.replace(/\.$/, '').toLowerCase()));
  if (words.length === 0) return '';
  const first = words[0][0];
  const last = words
    .slice(1)
    .reverse()
    .find(word => word.replace(/\.$/, '').length > 2);
  return (first + (last ? last[0] : '')).toLocaleUpperCase('en-IN');
}

type Levelled = { level: string; division: string };

/** The word printed on a badge's band. */
export function levelLabel(member: Levelled): string {
  if (member.division === 'alumni') return 'Alumni';
  switch (member.level) {
    case 'board':
      return 'Board';
    case 'head':
    case 'lead':
    case 'core':
      return 'Core team';
    case 'faculty':
      return 'Faculty';
    default:
      return 'Member';
  }
}

/** A face-aware ImageKit crop at an exact size. Other hosts pass through unchanged. */
export function photoUrl(url: string, { w, h }: { w: number; h: number }): string {
  return ik(url, `w-${w},h-${h},fo-face,q-80`);
}

/** A tag as shown: a Form "Other: …" answer drops its prefix. */
export function displayTag(tag: string): string {
  return tag.replace(/^Other:\s*/i, '').trim();
}

/** The first name, for places that are too small for the whole name. */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}
