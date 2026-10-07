// The six divisions, in the order every page shows them (never alphabetical).
export const DIVISIONS = [
  { id: 'projects', label: 'Projects' },
  { id: 'webdev', label: 'Web Dev' },
  { id: 'teaching', label: 'Teaching' },
  { id: 'media', label: 'Media & Design' },
  { id: 'operations', label: 'Operations' },
  { id: 'marketing', label: 'Marketing & Sponsorship' },
] as const;

export type DivisionId = (typeof DIVISIONS)[number]['id'];

/** The label for a division; `none` and `alumni` have none. */
export function divisionLabel(id: string): string | null {
  return DIVISIONS.find(d => d.id === id)?.label ?? null;
}

/** Sort position of a division (unknown ones last). */
export function divisionRank(id: string): number {
  const index = DIVISIONS.findIndex(d => d.id === id);
  return index === -1 ? DIVISIONS.length : index;
}
