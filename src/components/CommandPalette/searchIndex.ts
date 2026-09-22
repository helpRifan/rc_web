import { CLUB_MEMBERS, UPCOMING_EVENTS, GALLERY_ITEMS } from '../../data';
import { ClubTab } from '../../types';

export interface SearchEntry {
  id: string;
  type: 'member' | 'event' | 'gallery';
  title: string;
  subtitle: string;
  targetTab: ClubTab;
}

const RESULT_CAP = 8;

export function buildSearchIndex(): SearchEntry[] {
  const memberEntries: SearchEntry[] = CLUB_MEMBERS.map((member, i) => ({
    id: `member-${i}-${member.name}`,
    type: 'member',
    title: member.name,
    subtitle: member.role,
    targetTab: 'members',
  }));

  const eventEntries: SearchEntry[] = UPCOMING_EVENTS.map((event, i) => ({
    id: `event-${i}-${event.title}`,
    type: 'event',
    title: event.title,
    subtitle: event.date,
    targetTab: 'activities',
  }));

  const galleryEntries: SearchEntry[] = GALLERY_ITEMS.map((item) => ({
    id: `gallery-${item.id}`,
    type: 'gallery',
    title: item.title,
    subtitle: item.subtitle ?? '',
    targetTab: 'about',
  }));

  return [...memberEntries, ...eventEntries, ...galleryEntries];
}

export function filterSearchIndex(query: string, index: SearchEntry[]): SearchEntry[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  return index
    .filter(
      (entry) =>
        entry.title.toLowerCase().includes(trimmed) || entry.subtitle.toLowerCase().includes(trimmed),
    )
    .slice(0, RESULT_CAP);
}
