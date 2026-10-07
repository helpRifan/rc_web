'use client';

import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { useHash, useHydrated, useMedia, useWebGL2 } from '@/hooks/use-media';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import type { DivisionLines } from '@/lib/data/settings';
import { DIVISIONS, type DivisionId } from '@/lib/divisions';
import { CoreSphere } from './CoreSphere';
import { CHIP, TeamList } from './TeamList';
import type { CoreItem } from './team-items';

/** The sphere needs at least this many people: fewer, repeated over 42 discs, looks broken. */
export const SPHERE_MIN = 6;

export type CoreView = 'sphere' | 'list';

/** Whether the view toggle shows, and which view is on (team brief 5.13). */
export function resolveCoreView(s: {
  hydrated: boolean;
  wide: boolean;
  reducedMotion: boolean;
  webgl2: boolean;
  count: number;
  coarse: boolean;
  hashDivision: boolean;
  chosen: CoreView | null;
}): { toggle: boolean; view: CoreView } {
  if (!s.hydrated || !s.wide || s.reducedMotion || !s.webgl2 || s.count < SPHERE_MIN) return { toggle: false, view: 'list' };
  if (s.chosen) return { toggle: true, view: s.chosen };
  if (s.hashDivision || s.coarse) return { toggle: true, view: 'list' };
  return { toggle: true, view: 'sphere' };
}

type Props = {
  members: CoreItem[];
  divisionLines: DivisionLines;
  /** The section's h2 and sentence (server-rendered), with the view toggle beside them. */
  header: ReactNode;
};

/** The core team: the sphere on wide fine-pointer screens, the list everywhere else, and a toggle between them. */
export function CoreTeam({ members, divisionLines, header }: Props) {
  const hydrated = useHydrated();
  const wide = useMedia('(min-width: 48rem)');
  const coarse = useMedia('(pointer: coarse)');
  const reducedMotion = usePrefersReducedMotion();
  const webgl2 = useWebGL2();
  const hash = useHash();
  const [chosen, setChosen] = useState<CoreView | null>(null);
  const [sphereFailed, setSphereFailed] = useState(false);
  const onSphereFail = useCallback(() => setSphereFailed(true), []);

  const hashed = DIVISIONS.find(d => d.id === hash);
  const hashDivision = hashed && members.some(m => m.division === hashed.id) ? (hashed.id as DivisionId) : null;
  const { toggle, view } = resolveCoreView({
    hydrated,
    wide,
    reducedMotion,
    webgl2: webgl2 && !sphereFailed,
    count: members.length,
    coarse,
    hashDivision: hashDivision !== null,
    chosen,
  });

  // A division in the hash with nobody in it: land on the section with All selected.
  useEffect(() => {
    if (hashed && !hashDivision) document.getElementById('core-team')?.scrollIntoView();
  }, [hashed, hashDivision]);

  return (
    <div>
      <div className="mb-10 flex max-w-[80rem] flex-wrap items-end justify-between gap-x-10 gap-y-6 lg:mb-12">
        {header}
        {toggle && (
          <div role="group" aria-label="Choose a view" className="flex gap-2">
            {(['sphere', 'list'] as const).map(option => (
              <button
                key={option}
                type="button"
                aria-pressed={view === option}
                onClick={() => setChosen(option)}
                className={`${CHIP} ${view === option ? '' : 'border-rc-line text-rc-muted hover:border-rc-muted hover:text-rc-ink'}`}
              >
                {option === 'sphere' ? 'Sphere' : 'List'}
              </button>
            ))}
          </div>
        )}
      </div>
      {view === 'sphere' ? (
        <CoreSphere members={members} onFail={onSphereFail} />
      ) : (
        <div className="max-w-[80rem]">
          <TeamList members={members} divisionLines={divisionLines} initialDivision={hashDivision} />
        </div>
      )}
    </div>
  );
}
