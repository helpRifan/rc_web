import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ScrollStack, { ScrollStackItem } from '@/components/reactbits/ScrollStack';
import { FIXTURE_EVENTS } from '@/lib/data/fixtures';
import type { PublicEvent } from '@/lib/data/types';
import { EventRow } from './EventRow';
import { EventStatus } from './EventStatus';
import { eventsHeroCopy } from './hero-copy';
import { certificateLine, PastEventCard } from './PastEventCard';

const base = FIXTURE_EVENTS[4]; // Robo Sumo
const open: PublicEvent = { ...base, status: 'registration_open', starts_on: '2027-03-14' };

describe('eventsHeroCopy', () => {
  it('says what is true today', () => {
    expect(eventsHeroCopy(0, true)).toMatchObject({
      sentence: 'Nothing is scheduled right now, so here’s what we’ve run so far.',
      cta: { href: '#past', label: 'See past events' },
    });
    expect(eventsHeroCopy(1, true).sentence).toBe('One event is coming up.');
    expect(eventsHeroCopy(3, false)).toMatchObject({ sentence: 'Three events are coming up.', cta: { href: '#coming-up' } });
    expect(eventsHeroCopy(12, false).sentence).toBe('12 events are coming up.');
    expect(eventsHeroCopy(0, false)).toMatchObject({ cta: { label: 'Follow us on Instagram', external: true } });
  });
});

describe('EventStatus', () => {
  it('shows words with a hidden icon; only open registration uses the accent', () => {
    const { container, rerender } = render(<EventStatus status="registration_open" />);
    expect(screen.getByText('Registration open')).toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(container.firstElementChild).toHaveClass('text-rc-accent');
    rerender(<EventStatus status="completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(container.firstElementChild).not.toHaveClass('text-rc-accent');
  });
});

describe('EventRow', () => {
  it('is one link covering the row in compact mode', () => {
    render(<ul><EventRow event={open} /></ul>);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', '/events/robo-sumo');
    expect(screen.queryByText(/on Event Hub to register/)).toBeNull();
  });

  it('shows the Event Hub steps only for open registration', () => {
    const { rerender } = render(<ul><EventRow event={open} withActions /></ul>);
    expect(screen.getByText('Search for “Robo Sumo” on Event Hub to register.')).toBeInTheDocument();
    const hub = screen.getByRole('link', { name: /Open VIT Event Hub/ });
    expect(hub).toHaveAttribute('target', '_blank');
    expect(hub.getAttribute('rel')).toContain('noopener');
    rerender(<ul><EventRow event={{ ...open, status: 'upcoming' }} withActions /></ul>);
    expect(screen.queryByText(/on Event Hub to register/)).toBeNull();
  });

  it('says the date is to be announced when an upcoming event has none', () => {
    render(<ul><EventRow event={{ ...base, status: 'upcoming', series: null }} /></ul>);
    expect(screen.getByText('Date to be announced')).toBeInTheDocument();
  });
});

describe('PastEventCard', () => {
  it('counts certificates in plain words, and hides the line at zero', () => {
    expect(certificateLine(0)).toBeNull();
    expect(certificateLine(1)).toBe('1 certificate issued');
    expect(certificateLine(12)).toBe('12 certificates issued');
  });

  it('is a type-only card without a cover', () => {
    const { container } = render(<PastEventCard event={base} issued={3} />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByRole('heading', { level: 4, name: 'Robo Sumo' })).toBeInTheDocument();
    expect(screen.getByText('3 certificates issued')).toBeInTheDocument();
    expect(screen.getByText("TechnoVIT '26")).toBeInTheDocument();
  });
});

describe('ScrollStack (sticky port)', () => {
  it('is a plain list when disabled: no sticky, no inline transforms', () => {
    const { container } = render(
      <ScrollStack enabled={false}>
        <ScrollStackItem>a</ScrollStackItem>
        <ScrollStackItem>b</ScrollStackItem>
        <ScrollStackItem>c</ScrollStackItem>
      </ScrollStack>,
    );
    const cards = container.querySelectorAll('li[data-card]');
    expect(cards).toHaveLength(3);
    cards.forEach(card => {
      expect(card.className).not.toContain('sticky');
      expect((card as HTMLElement).style.transform).toBe('');
    });
  });

  it('pins cards with sticky when enabled', () => {
    const { container } = render(
      <ScrollStack>
        <ScrollStackItem>a</ScrollStackItem>
        <ScrollStackItem>b</ScrollStackItem>
        <ScrollStackItem>c</ScrollStackItem>
      </ScrollStack>,
    );
    container.querySelectorAll('li[data-card]').forEach(card => expect(card.className).toContain('sticky'));
    // The end spacer lets the full deck hold before it leaves; it's hidden from assistive tech.
    expect(container.querySelector('li[aria-hidden="true"]')).not.toBeNull();
  });
});
