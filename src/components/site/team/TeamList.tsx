'use client';

import { useState } from 'react';
import ChromaGrid from '@/components/reactbits/ChromaGrid';
import { useMedia } from '@/hooks/use-media';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import type { DivisionLines } from '@/lib/data/settings';
import { DIVISIONS, type DivisionId } from '@/lib/divisions';
import type { CoreItem } from './team-items';

export const CHIP =
  'type-ui inline-flex min-h-11 shrink-0 scroll-mt-28 items-center rounded-full border px-4 transition-colors aria-pressed:border-rc-accent aria-pressed:bg-rc-accent aria-pressed:text-rc-bg';
const CHIP_IDLE = 'border-rc-line text-rc-muted hover:border-rc-muted hover:text-rc-ink';

/** "Showing all 14 people." or "Showing 3 people in Projects." */
export function filterStatus(count: number, division: string | null): string {
  const people = count === 1 ? '1 person' : `${count} people`;
  return division ? `Showing ${people} in ${division}.` : `Showing all ${people}.`;
}

type Props = {
  members: CoreItem[];
  divisionLines: DivisionLines;
  /** A division from the URL's hash (/team#projects), selected until the visitor picks another. */
  initialDivision: DivisionId | null;
};

/** The core team as the spotlight grid, filtered by division. The accessible baseline view. */
export function TeamList({ members, divisionLines, initialDivision }: Props) {
  const [chosen, setChosen] = useState<DivisionId | 'all' | null>(null);
  const coarse = useMedia('(pointer: coarse)');
  const still = usePrefersReducedMotion();
  const present = DIVISIONS.filter(d => members.some(m => m.division === d.id));
  const division = chosen ?? initialDivision ?? 'all';
  const selected = present.find(d => d.id === division) ?? null;
  const shown = selected ? members.filter(m => m.division === selected.id) : members;
  const line = selected ? divisionLines[selected.id] : undefined;

  return (
    <div>
      <div role="group" aria-label="Filter by division" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        <button type="button" aria-pressed={!selected} onClick={() => setChosen('all')} className={`${CHIP} ${selected ? CHIP_IDLE : ''}`}>
          All
        </button>
        {present.map(d => (
          <button
            key={d.id}
            id={d.id}
            type="button"
            aria-pressed={selected?.id === d.id}
            onClick={() => setChosen(d.id)}
            className={`${CHIP} ${selected?.id === d.id ? '' : CHIP_IDLE}`}
          >
            {d.label}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="sr-only">
        {filterStatus(shown.length, selected?.label ?? null)}
      </p>
      {line && <p className="mt-6 max-w-[56ch] text-rc-text">{line}</p>}
      <ChromaGrid items={shown} coarse={coarse} still={still} className="mt-8" />
    </div>
  );
}
