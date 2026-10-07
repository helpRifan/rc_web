import { NUMBER_WORDS } from '@/lib/dates';
import { SITE } from '@/lib/site';

export const EVENTS_LEDE = 'Competitions and workshops run by Robotics Club at VIT Chennai.';

type HeroCopy = { sentence: string; cta: { href: string; label: string; external: boolean } };

/** The hero tells the truth about today: whether anything is on, and where to go next. */
export function eventsHeroCopy(upcoming: number, hasPast: boolean): HeroCopy {
  if (upcoming > 0) {
    const sentence =
      upcoming === 1 ? 'One event is coming up.' : `${upcoming < 10 ? NUMBER_WORDS[upcoming] : upcoming} events are coming up.`;
    return { sentence, cta: { href: '#coming-up', label: 'See what’s coming up', external: false } };
  }
  if (hasPast) {
    return { sentence: 'Nothing is scheduled right now, so here’s what we’ve run so far.', cta: { href: '#past', label: 'See past events', external: false } };
  }
  return {
    sentence: 'No events are listed yet. Follow us on Instagram for new dates.',
    cta: { href: SITE.instagram, label: 'Follow us on Instagram', external: true },
  };
}
