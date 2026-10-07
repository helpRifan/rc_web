import { formatEventDate } from '@/lib/dates';
import type { PublicEvent } from '@/lib/data/types';

/** The big day numeral (Archivo at its widest, used for real information), a label, or nothing. */
export function EventDate({ event }: { event: Pick<PublicEvent, 'starts_on' | 'date_label' | 'series' | 'status'> }) {
  const date = formatEventDate(event);
  if (date?.kind === 'date') {
    return (
      <time dateTime={date.iso} className="block tabular-nums">
        <span className="block text-[clamp(2.75rem,5vw,4.5rem)] font-extrabold leading-[0.9] text-rc-ink [font-stretch:125%]">{date.day}</span>
        <span className="type-ui mt-2 block text-rc-muted">{date.monthYear}</span>
      </time>
    );
  }
  if (date?.kind === 'label') return <p className="type-ui text-balance text-rc-text">{date.label}</p>;
  if (event.status !== 'completed') return <p className="type-ui text-balance text-rc-text">Date to be announced</p>;
  return null;
}
