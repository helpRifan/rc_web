import { CalendarClock, Flag, Hourglass, Ticket } from 'lucide-react';
import type { EventStatus as Status } from '@/lib/data/types';

export const STATUS = {
  registration_open: { label: 'Registration open', Icon: Ticket, tone: 'text-rc-accent' },
  upcoming: { label: 'Upcoming', Icon: CalendarClock, tone: 'text-rc-muted' },
  coming_soon: { label: 'Coming soon', Icon: Hourglass, tone: 'text-rc-muted' },
  completed: { label: 'Completed', Icon: Flag, tone: 'text-rc-muted' },
} as const;

/** A status is always an icon plus words, never colour alone (spec 4.1). */
export function EventStatus({ status, className = '' }: { status: Status; className?: string }) {
  const { label, Icon, tone } = STATUS[status];
  return (
    <p className={`type-ui inline-flex items-center gap-2 ${tone} ${className}`}>
      <Icon aria-hidden="true" className="size-4" strokeWidth={2} />
      {label}
    </p>
  );
}
