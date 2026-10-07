import Link from 'next/link';
import { BadgeStatic } from './badge/BadgeStatic';
import type { BadgeData } from './badge/badge-face';

/**
 * One <li> per Board member: the static badge on its strap, and the label under it, all one link to
 * the profile. In the live board the art is hidden and only the label takes the pointer (the canvas
 * badge above it is the thing to grab); the label is still the keyboard and screen reader link.
 */
export function BoardUnits({ badges }: { badges: BadgeData[] }) {
  return badges.map((badge, i) => (
    <li key={badge.slug} className="badge-unit" style={{ '--i': i } as React.CSSProperties}>
      <Link href={`/team/${badge.slug}`} data-slug={badge.slug} className="badge-unit-link group block">
        <span aria-hidden="true" className="badge-static-art relative block">
          <span className="badge-strap" />
          <span className="badge-clip" />
          <BadgeStatic badge={badge} priority={i < 2} />
        </span>
        <span className="badge-label">
          <span className="block font-bold text-rc-ink transition-colors group-hover:text-rc-accent [font-stretch:112%]">{badge.name}</span>
          {badge.role && <span className="mt-1 block text-rc-muted">{badge.role}</span>}
        </span>
      </Link>
    </li>
  ));
}
