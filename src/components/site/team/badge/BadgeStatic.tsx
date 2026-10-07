import Image from 'next/image';
import { photoUrl } from '@/lib/members/display';
import { GlyphPrintSvg } from './GlyphPrintSvg';
import type { BadgeData } from './badge-face';

// The HTML version of the badge's front face (team brief 5.6), for phones, reduced motion, no WebGL
// and no JavaScript. Every size is a share of the card's width (cqw), matching badge-art.ts.

/** A name fits on one line down to 6.8cqw; past that it wraps to two lines at 6.8cqw. */
function nameSize(name: string): { size: number; twoLines: boolean } {
  const fit = 84 / (name.length * 0.66);
  return fit >= 6.8 ? { size: Math.min(fit, 11.5), twoLines: false } : { size: 6.8, twoLines: true };
}

export function BadgeStatic({ badge, priority = false, sizes = '240px' }: { badge: BadgeData; priority?: boolean; sizes?: string }) {
  const name = nameSize(badge.name);
  const windowBottom = name.twoLines ? 44.5 : 37;
  // The card is the size container, so its corner radius lives on the inner layer: container units
  // on the container itself would measure the stage around it, not the card.
  return (
    <span className="@container relative block aspect-[0.7164]">
      <span className="absolute inset-0 overflow-hidden rounded-[5cqw] bg-rc-bg">
        <span className="absolute inset-0 bg-[linear-gradient(215deg,rgba(74,141,183,0.22),rgba(13,13,13,0)_60%)]" />
        <span className="absolute inset-[2.5cqw] rounded-[5cqw] border-[0.6cqw] border-[rgba(191,199,206,0.45)]" />

        <Image src="/logo.png" alt="" width={64} height={64} className="absolute left-[8cqw] top-[16cqw] size-[10cqw]" />
        <span className="absolute left-[21cqw] top-[15.4cqw] text-[5.2cqw] font-bold leading-none text-rc-ink [font-stretch:112.5%]">Robotics Club</span>
        <span className="absolute left-[21cqw] top-[21.6cqw] text-[4cqw] font-medium leading-none text-rc-muted">VIT Chennai</span>

        <span
          className="absolute left-[8cqw] right-[8cqw] top-[30cqw] overflow-hidden rounded-[3cqw] bg-rc-bg ring-1 ring-inset ring-[rgba(191,199,206,0.2)]"
          style={{ bottom: `${windowBottom}cqw` }}
        >
          {badge.photo ? (
            <Image src={photoUrl(badge.photo, { w: 640, h: 553 })} alt="" fill sizes={sizes} priority={priority} className="object-cover" />
          ) : (
            <GlyphPrintSvg seed={badge.slug} initials={badge.initials} height={Math.round(726 - (windowBottom - 37) * 10)} />
          )}
        </span>

        <span
          className={`absolute bottom-[23.6cqw] left-[8cqw] right-[8cqw] font-extrabold leading-[1.1] text-rc-ink [font-stretch:125%] ${name.twoLines ? 'line-clamp-2' : 'truncate'}`}
          style={{ fontSize: `${name.size}cqw` }}
        >
          {badge.name}
        </span>
        {badge.role && <span className="absolute bottom-[17.4cqw] left-[8cqw] right-[8cqw] truncate text-[5cqw] font-medium leading-none text-rc-text">{badge.role}</span>}

        <span
          className="absolute inset-x-0 bottom-0 flex h-[12cqw] items-center justify-between px-[8cqw] text-[4.5cqw] font-bold leading-none [font-stretch:112.5%]"
          style={{ background: badge.band.fill, color: badge.band.text, borderTop: badge.band.rule ? '0.4cqw solid #BFC7CE' : undefined }}
        >
          <span>{badge.band.label}</span>
          {badge.band.right && <span className="truncate pl-[4cqw]">{badge.band.right}</span>}
        </span>
      </span>
    </span>
  );
}
