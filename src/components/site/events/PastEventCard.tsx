import { Award } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatEventDate } from '@/lib/dates';
import type { PublicEvent } from '@/lib/data/types';

function titleSize(title: string): string {
  if (title.length <= 16) return 'text-[clamp(2.5rem,6.5vw,6rem)]';
  if (title.length <= 32) return 'text-[clamp(2rem,4.5vw,4rem)]';
  return 'type-section';
}

export function certificateLine(issued: number): string | null {
  if (issued <= 0) return null;
  return issued === 1 ? '1 certificate issued' : `${issued} certificates issued`;
}

/**
 * A finished event as a card built from type: the title at display size, lit from the bottom
 * right like the road's headlights (or its cover photo under a scrim). It dims as the next card
 * parks on top of it in the deck (--depth, written by ScrollStack).
 */
export function PastEventCard({ event, issued = 0 }: { event: PublicEvent; issued?: number }) {
  const date = formatEventDate(event);
  const dateText = date ? (date.kind === 'date' ? date.full : date.label) : null;
  const certificates = certificateLine(issued);
  return (
    <article className="relative isolate flex h-[18rem] flex-col justify-between overflow-hidden rounded-[28px] border border-rc-line bg-rc-bg p-6 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-rc-bg after:opacity-[var(--depth,0)] after:content-[''] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-3 has-[a:focus-visible]:outline-rc-ink sm:h-[20rem] sm:p-8 lg:h-[22rem] lg:p-10">
      {event.cover_url ? (
        <>
          <Image src={event.cover_url} alt="" fill sizes="(min-width: 1024px) 64rem, 100vw" className="-z-20 object-cover" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(13,13,13,0.92)_0%,rgba(13,13,13,0.6)_50%,rgba(13,13,13,0.25)_100%)]" />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_100%_100%,rgba(74,141,183,0.22),transparent_60%),linear-gradient(rgba(191,199,206,0.06),rgba(191,199,206,0.06))]"
        />
      )}
      <div className="type-ui flex items-start justify-between gap-6 text-rc-muted">
        <span>{dateText}</span>
        <span>{event.category}</span>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div className="min-w-0">
          <h4 className={`${titleSize(event.title)} line-clamp-3 text-balance font-extrabold leading-[0.95] text-rc-ink [font-stretch:125%]`}>
            <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {event.title}
            </Link>
          </h4>
          {event.summary && <p className="mt-3 line-clamp-2 max-w-[52ch] text-rc-text">{event.summary}</p>}
        </div>
        {certificates && (
          <p className="type-ui inline-flex shrink-0 items-center gap-2 text-rc-text">
            <Award aria-hidden="true" className="size-4" />
            {certificates}
          </p>
        )}
      </div>
    </article>
  );
}
