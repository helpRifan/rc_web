import { ButtonLink } from '@/components/site/ButtonLink';
import { SectionHeader } from '@/components/site/SectionHeader';
import type { CertificateStat, PublicEvent } from '@/lib/data/types';
import { PastEventCard } from './PastEventCard';
import { PastEventsStack } from './PastEventsStack';

type Props = { groups: Array<{ year: number | null; events: PublicEvent[] }>; stats: Map<string, CertificateStat> };

/** Past events grouped by year, each year a deck; one certificate prompt after them all. */
export function PastEvents({ groups, stats }: Props) {
  if (!groups.length) return null;
  const anyCertificates = groups.some(g => g.events.some(e => (stats.get(e.id)?.issued ?? 0) > 0));
  return (
    <section id="past" aria-labelledby="past-title" className="site-gutter scroll-mt-24 py-20 sm:py-24 lg:py-28">
      <div className="max-w-[80rem]">
        <SectionHeader id="past-title" title="Past events" />
        {groups.map(group => {
          const key = group.year ?? 'other';
          return (
            <section key={key} aria-labelledby={`year-${key}`} className="mt-12 lg:grid lg:grid-cols-[10rem_minmax(0,64rem)] lg:gap-x-16">
              <h3
                id={`year-${key}`}
                className={`${group.year ? 'text-[clamp(2rem,3vw,2.75rem)] tabular-nums' : 'type-section'} font-extrabold leading-none text-rc-muted [font-stretch:118%] lg:sticky lg:top-[max(6rem,14svh)] lg:self-start`}
              >
                {group.year ?? 'Other past events'}
              </h3>
              <PastEventsStack
                className="mt-6 lg:mt-0"
                cards={group.events.map(event => ({ key: event.id, node: <PastEventCard event={event} issued={stats.get(event.id)?.issued ?? 0} /> }))}
              />
            </section>
          );
        })}
        {anyCertificates && (
          <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <p className="type-section text-rc-ink">Took part?</p>
            <ButtonLink href="/certificates">Find your certificate</ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
}
