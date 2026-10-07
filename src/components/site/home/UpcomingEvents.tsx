import { EventRow } from '@/components/site/events/EventRow';
import { SectionHeader, SectionLinkMobile } from '@/components/site/SectionHeader';
import type { PublicEvent } from '@/lib/data/types';

const LINK = { href: '/events', label: 'See all events' };

/** The next events, each row one link to its page. Nothing renders when there are none. */
export function UpcomingEvents({ events }: { events: PublicEvent[] }) {
  if (!events.length) return null;
  return (
    <section aria-labelledby="home-upcoming" className="site-gutter py-20 sm:py-24 lg:py-28">
      <div className="max-w-[80rem]">
        <SectionHeader id="home-upcoming" title="Coming up" link={LINK} />
        <ul role="list" className="mt-10 grid gap-4 lg:mt-12">
          {events.map(event => (
            <EventRow key={event.id} event={event} />
          ))}
        </ul>
        <SectionLinkMobile {...LINK} />
      </div>
    </section>
  );
}
