import { ButtonLink } from '@/components/site/ButtonLink';
import { ScrambleHeading } from '@/components/site/ScrambleHeading';
import { EVENTS_LEDE, eventsHeroCopy } from './hero-copy';
import { RoadHint } from './RoadHint';
import { RoadStage } from './RoadStage';

/** Events are a road: Hyperspeed behind one word and one true sentence. Hold to speed up. */
export function EventsHero({ upcoming, hasPast }: { upcoming: number; hasPast: boolean }) {
  const { sentence, cta } = eventsHeroCopy(upcoming, hasPast);
  return (
    <RoadStage
      pace="live"
      labelledBy="events-title"
      className="site-gutter flex min-h-[max(34rem,80svh)] items-start pb-16 pt-36 sm:items-center sm:pt-28 lg:min-h-[max(34rem,88svh)]"
    >
      <div className="relative z-10 max-w-[34rem] before:absolute before:-inset-x-10 before:-inset-y-10 before:-z-10 before:rounded-[64px] before:bg-rc-bg/64 before:blur-[32px] before:content-[''] sm:before:-inset-x-20 sm:before:-inset-y-14 sm:before:blur-[44px]">
        <ScrambleHeading as="h1" id="events-title" text="Events" className="type-display text-rc-ink" />
        <p className="mt-7 text-lg text-rc-text">
          {EVENTS_LEDE} {sentence}
        </p>
        <div className="mt-9">
          {cta.external ? (
            <ButtonLink href={cta.href} target="_blank" rel="noopener noreferrer">
              {cta.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </ButtonLink>
          ) : (
            <ButtonLink href={cta.href}>{cta.label}</ButtonLink>
          )}
        </div>
        <RoadHint />
      </div>
    </RoadStage>
  );
}
