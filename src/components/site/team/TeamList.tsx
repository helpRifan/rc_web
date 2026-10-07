'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type CSSProperties } from 'react';
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

/** Heads before leads before everyone else; within each, the roster's own order. */
export function rankInDivision(role: string | null): number {
  if (/\bhead\b/i.test(role ?? '')) return 0;
  if (/\blead\b/i.test(role ?? '')) return 1;
  return 2;
}

export type DivisionGroup = { id: DivisionId; label: string; members: CoreItem[] };

/** The core team as one group per division, in the site's division order, heads first. */
export function groupByDivision(members: CoreItem[]): DivisionGroup[] {
  return DIVISIONS.flatMap(d => {
    const inDivision = members
      .map((member, order) => ({ member, order }))
      .filter(({ member }) => member.division === d.id)
      .sort((a, b) => rankInDivision(a.member.role) - rankInDivision(b.member.role) || a.order - b.order)
      .map(({ member }) => member);
    return inDivision.length ? [{ id: d.id, label: d.label, members: inDivision }] : [];
  });
}

function MemberCard({ member }: { member: CoreItem }) {
  return (
    <Link href={member.href} className="member-card group" style={{ '--card-angle': `${member.gradientAngle}deg` } as CSSProperties}>
      <span className="member-card-media">
        {member.photo ? (
          <Image src={member.photo} alt="" fill sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 45vw" className="object-cover" />
        ) : (
          <span aria-hidden="true" className="monotile @container flex h-full w-full items-center justify-center">
            <span className="text-[40cqw] font-extrabold leading-none text-rc-ink [font-stretch:125%]">{member.initials}</span>
          </span>
        )}
      </span>
      <div className="px-1.5 pb-1 pt-3">
        <h4 className="text-[17px] font-bold leading-snug text-rc-ink">{member.name}</h4>
        {member.role && <p className="mt-1 text-[14.5px] leading-snug text-rc-text">{member.role}</p>}
      </div>
    </Link>
  );
}

type Props = {
  members: CoreItem[];
  divisionLines: DivisionLines;
  /** A division from the URL's hash (/team#projects), selected until the visitor picks another. */
  initialDivision: DivisionId | null;
};

/**
 * The core team grouped by division (owner's brief, 2026-10-08: organised, and in colour): each
 * division's heading, headcount and sentence, then its people, heads first. The chips narrow it
 * to one division. The accessible baseline view.
 */
export function TeamList({ members, divisionLines, initialDivision }: Props) {
  const [chosen, setChosen] = useState<DivisionId | 'all' | null>(null);
  const groups = groupByDivision(members);
  const division = chosen ?? initialDivision ?? 'all';
  const selected = groups.find(g => g.id === division) ?? null;
  const shown = selected ? [selected] : groups;
  const count = shown.reduce((n, g) => n + g.members.length, 0);

  return (
    <div>
      <div role="group" aria-label="Filter by division" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        <button type="button" aria-pressed={!selected} onClick={() => setChosen('all')} className={`${CHIP} ${selected ? CHIP_IDLE : ''}`}>
          All
        </button>
        {groups.map(g => (
          <button
            key={g.id}
            id={g.id}
            type="button"
            aria-pressed={selected?.id === g.id}
            onClick={() => setChosen(g.id)}
            className={`${CHIP} ${selected?.id === g.id ? '' : CHIP_IDLE}`}
          >
            {g.label}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="sr-only">
        {filterStatus(count, selected?.label ?? null)}
      </p>
      <div className="division-groups mt-10 lg:mt-12">
        {shown.map(g => {
          // A division's sentence needs room, so it shows when that division is picked on its own.
          const line = selected ? divisionLines[g.id] : undefined;
          return (
            <section key={g.id} aria-labelledby={`division-${g.id}`} className="division-group" style={{ '--n': g.members.length } as CSSProperties}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h3 id={`division-${g.id}`} className="text-[1.375rem] font-extrabold leading-tight text-rc-ink [font-stretch:118%]">
                  {g.label}
                </h3>
                <p className="text-[14.5px] text-rc-muted">{g.members.length === 1 ? '1 person' : `${g.members.length} people`}</p>
              </div>
              {line && <p className="mt-3 max-w-[56ch] text-rc-text">{line}</p>}
              <ul role="list" className="division-group-cards mt-5">
                {g.members.map(member => (
                  <li key={member.key}>
                    <MemberCard member={member} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
