import type { Metadata } from 'next';
import { ComingUp } from '@/components/site/events/ComingUp';
import { EventsHero } from '@/components/site/events/EventsHero';
import { EVENTS_LEDE } from '@/components/site/events/hero-copy';
import { PastEvents } from '@/components/site/events/PastEvents';
import { getCertificateStats } from '@/lib/data/certificates-public';
import { getPastEventsByYear, getUpcomingEvents } from '@/lib/data/events';
import { safe } from '@/lib/data/safe';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Events',
  description: EVENTS_LEDE,
};

export default async function EventsPage() {
  // Events are required (a failure goes to error.tsx, never to a false "nothing is scheduled").
  // Certificate counts are optional.
  const [upcoming, past, stats] = await Promise.all([
    getUpcomingEvents(50),
    getPastEventsByYear(),
    safe('certificate stats', () => getCertificateStats(), new Map()),
  ]);
  return (
    <>
      <EventsHero upcoming={upcoming.length} hasPast={past.length > 0} />
      <ComingUp events={upcoming} />
      <PastEvents groups={past} stats={stats} />
    </>
  );
}
