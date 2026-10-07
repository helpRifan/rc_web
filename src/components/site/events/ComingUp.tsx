import { SectionHeader } from '@/components/site/SectionHeader';
import type { PublicEvent } from '@/lib/data/types';
import { EventRow } from './EventRow';

export function ComingUp({ events }: { events: PublicEvent[] }) {
  if (!events.length) return null;
  return (
    <section id="coming-up" aria-labelledby="coming-up-title" className="site-gutter scroll-mt-24 py-20 sm:py-24 lg:py-28">
      <div className="max-w-[80rem]">
        <SectionHeader id="coming-up-title" title="Coming up" />
        <ul role="list" className="mt-10 grid gap-4 lg:mt-12">
          {events.map(event => (
            <EventRow key={event.id} event={event} withActions headingLevel="h3" />
          ))}
        </ul>
      </div>
    </section>
  );
}
