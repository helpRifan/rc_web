import Link from 'next/link';
import type { PublicEvent } from '@/lib/data/types';
import { SITE } from '@/lib/site';
import { EventDate } from './EventDate';
import { EventStatus } from './EventStatus';
import { RegisterOnEventHub } from './RegisterOnEventHub';

type Props = { event: PublicEvent; headingLevel?: 'h3' | 'h4'; withActions?: boolean };

/**
 * One upcoming event, led by its big date. Compact (Home): the whole row is one link.
 * With actions (Events): the title links, and open registration shows the Event Hub steps.
 */
export function EventRow({ event, headingLevel: H = 'h3', withActions = false }: Props) {
  const { slug, title, summary, status, registration_url } = event;
  return (
    <li
      className={`relative grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-5 rounded-2xl bg-rc-surface px-5 py-7 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-8 sm:px-8 lg:grid-cols-[11rem_minmax(0,1fr)_auto] lg:gap-x-10 lg:px-10 lg:py-9 ${
        withActions
          ? ''
          : 'transition-colors hover:bg-[rgba(191,199,206,0.09)] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-3 has-[a:focus-visible]:outline-rc-ink'
      }`}
    >
      <EventDate event={event} />
      <div className="min-w-0">
        <H className="type-section text-balance text-rc-ink">
          <Link
            href={`/events/${slug}`}
            className={
              withActions
                ? 'decoration-rc-accent decoration-2 underline-offset-[6px] hover:underline'
                : "after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none"
            }
          >
            {title}
          </Link>
        </H>
        {summary && <p className="mt-3 line-clamp-2 max-w-[60ch] text-rc-text">{summary}</p>}
        <EventStatus status={status} className="mt-4 lg:hidden" />
        {withActions && status === 'registration_open' && (
          <RegisterOnEventHub title={title} url={registration_url ?? SITE.eventHub} className="mt-6" />
        )}
      </div>
      <EventStatus status={status} className="hidden lg:flex lg:self-start lg:pt-2" />
    </li>
  );
}
