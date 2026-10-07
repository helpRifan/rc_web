import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { ButtonLink } from '@/components/site/ButtonLink';
import { EventStatus } from '@/components/site/events/EventStatus';
import { RegisterOnEventHub } from '@/components/site/events/RegisterOnEventHub';
import { RoadStage } from '@/components/site/events/RoadStage';
import { PhotoGrid } from '@/components/site/PhotoGrid';
import { ScrambleHeading } from '@/components/site/ScrambleHeading';
import { getCertificateStats } from '@/lib/data/certificates-public';
import { getEventBySlug, getPublishedEvents } from '@/lib/data/events';
import { getEventPhotos } from '@/lib/data/gallery';
import { safe } from '@/lib/data/safe';
import type { PublicEvent } from '@/lib/data/types';
import { formatEventDate } from '@/lib/dates';
import { eventNeighbours } from '@/lib/events';
import { Markdown } from '@/lib/markdown';
import { SITE } from '@/lib/site';

export const revalidate = 300;

export async function generateStaticParams() {
  const events = await safe('events (params)', () => getPublishedEvents(), []);
  return events.map(event => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: PageProps<'/events/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const event = await safe('event (metadata)', () => getEventBySlug(slug), null);
  if (!event) return { title: 'Event not found' };
  return { title: event.title, description: event.summary ?? `${event.title}, run by Robotics Club at VIT Chennai.` };
}

/** The full date, the date label, or "Date to be announced" while it's still to come (never the series again). */
function dateLine(event: PublicEvent): { text: string; iso?: string } | null {
  const date = formatEventDate(event);
  if (date?.kind === 'date') return { text: date.full, iso: date.iso };
  if (event.date_label) return { text: event.date_label };
  return event.status === 'completed' ? null : { text: 'Date to be announced' };
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-16 lg:mt-20">
      <h2 id={id} className="type-section text-rc-ink">
        {title}
      </h2>
      <div className="mt-6 lg:mt-8">{children}</div>
    </section>
  );
}

export default async function EventPage({ params }: PageProps<'/events/[slug]'>) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  const [photos, stats, events] = await Promise.all([
    safe('event photos', () => getEventPhotos(event.slug), []),
    safe('certificate stats', () => getCertificateStats(), new Map()),
    safe('events (neighbours)', () => getPublishedEvents(), [event]),
  ]);
  const date = dateLine(event);
  const issued = stats.get(event.id)?.issued ?? 0;
  const { previous, next } = eventNeighbours(event, events);

  return (
    <article aria-labelledby="event-title">
      <RoadStage
        pace="calm"
        boost={false}
        labelledBy="event-title"
        className="site-gutter flex min-h-[26rem] items-start pb-14 pt-28 sm:min-h-[60svh] sm:items-end sm:pb-16"
      >
        <div className="relative z-10 max-w-[52rem] before:absolute before:-inset-x-10 before:-inset-y-10 before:-z-10 before:rounded-[64px] before:bg-rc-bg/64 before:blur-[32px] before:content-[''] sm:before:-inset-x-20 sm:before:-inset-y-14 sm:before:blur-[44px]">
          <Link href="/events" className="text-link">
            All events
          </Link>
          {event.series && <p className="mt-6 text-lg text-rc-muted">{event.series}</p>}
          <ScrambleHeading as="h1" id="event-title" text={event.title} className={`type-display text-balance text-rc-ink ${event.series ? 'mt-2' : 'mt-6'}`} />
          {date && (
            <p className="type-ui mt-6 text-rc-text">{date.iso ? <time dateTime={date.iso}>{date.text}</time> : date.text}</p>
          )}
          <EventStatus status={event.status} className="mt-3" />
        </div>
      </RoadStage>

      <div className="site-gutter pb-24 lg:pb-28">
        <div className="max-w-[64rem]">
          {event.cover_url && (
            <div className="relative mt-4 aspect-video overflow-hidden rounded-2xl bg-rc-surface">
              <Image src={event.cover_url} alt={event.title} fill priority sizes="(min-width: 1024px) 64rem, 100vw" className="object-cover" />
            </div>
          )}
          {event.description && <Markdown source={event.description} className="mt-12 max-w-[34em] text-lg text-rc-text" />}

          {event.status === 'registration_open' && (
            <Section id="event-register" title="Register">
              <RegisterOnEventHub title={event.title} url={event.registration_url ?? SITE.eventHub} />
            </Section>
          )}

          {photos.length > 0 && (
            <Section id="event-photos" title="Photos from this event">
              <PhotoGrid photos={photos} variant="even" showEventLink={false} />
            </Section>
          )}

          {issued > 0 && (
            <Section id="event-certificates" title="Took part?">
              <p className="max-w-[56ch] text-lg text-rc-text">Find your certificate with the email address your team registered with.</p>
              <ButtonLink href="/certificates" className="mt-6 w-full sm:w-auto">
                Find your certificate
              </ButtonLink>
            </Section>
          )}

          {(previous || next) && (
            <nav aria-label="More events" className="mt-16 flex flex-wrap justify-between gap-x-10 gap-y-4 lg:mt-20">
              {previous ? (
                <Link href={`/events/${previous.slug}`} className="text-link">
                  Previous: {previous.title}
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link href={`/events/${next.slug}`} className="text-link">
                  Next: {next.title}
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </article>
  );
}
