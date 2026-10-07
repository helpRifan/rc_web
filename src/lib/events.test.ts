import { describe, expect, it } from 'vitest';
import type { PublicEvent } from './data/types';
import { eventNeighbours, eventYear, groupPastByYear, selectPast, selectUpcoming } from './events';

const NOW = new Date('2026-10-05T06:00:00Z');

function ev(partial: Partial<PublicEvent> & Pick<PublicEvent, 'slug'>): PublicEvent {
  return {
    id: partial.slug,
    title: partial.slug,
    summary: null,
    description: null,
    category: null,
    status: 'completed',
    starts_on: null,
    date_label: null,
    series: null,
    cover_url: null,
    registration_url: null,
    recap_url: null,
    ...partial,
  };
}

describe('eventNeighbours', () => {
  const series = "TechnoVIT '26";
  const events = [
    ev({ slug: 'robo-sumo', series }),
    ev({ slug: 'line-follower', series }),
    ev({ slug: 'workshop', starts_on: '2026-08-01' }),
    ev({ slug: 'obstacle-race', series }),
  ];

  it('stays inside the series, ordered by title when undated', () => {
    const { previous, next } = eventNeighbours(events[3], events);
    expect(previous?.slug).toBe('line-follower');
    expect(next?.slug).toBe('robo-sumo');
  });

  it('has one side at the ends', () => {
    expect(eventNeighbours(events[1], events)).toEqual({ previous: null, next: expect.objectContaining({ slug: 'obstacle-race' }) });
  });

  it('uses every event, dated first, when the event has no series', () => {
    expect(eventNeighbours(events[2], events).next?.slug).toBe('line-follower');
  });
});

describe('selectUpcoming', () => {
  it('keeps upcoming statuses, soonest first, undated last', () => {
    const list = selectUpcoming(
      [
        ev({ slug: 'later', status: 'upcoming', starts_on: '2026-11-20' }),
        ev({ slug: 'undated', status: 'coming_soon' }),
        ev({ slug: 'soon', status: 'registration_open', starts_on: '2026-10-10' }),
        ev({ slug: 'done', status: 'completed', starts_on: '2026-10-08' }),
      ],
      NOW,
    );
    expect(list.map(e => e.slug)).toEqual(['soon', 'later', 'undated']);
  });

  it('drops events dated more than 2 days ago even if still marked upcoming', () => {
    const list = selectUpcoming(
      [ev({ slug: 'stale', status: 'upcoming', starts_on: '2026-10-01' }), ev({ slug: 'yesterday', status: 'upcoming', starts_on: '2026-10-04' })],
      NOW,
    );
    expect(list.map(e => e.slug)).toEqual(['yesterday']);
  });

  it('respects the limit', () => {
    const many = ['a', 'b', 'c', 'd'].map(slug => ev({ slug, status: 'upcoming' }));
    expect(selectUpcoming(many, NOW, 3)).toHaveLength(3);
  });
});

describe('selectPast and eventYear', () => {
  it('treats a stale upcoming event as past', () => {
    expect(selectPast([ev({ slug: 'stale', status: 'upcoming', starts_on: '2026-09-01' })], NOW)).toHaveLength(1);
  });

  it('reads the year from the date, then the series, then the label', () => {
    expect(eventYear({ starts_on: '2025-02-07', series: null, date_label: null }, NOW)).toBe(2025);
    expect(eventYear({ starts_on: null, series: "TechnoVIT '26", date_label: null }, NOW)).toBe(2026);
    expect(eventYear({ starts_on: null, series: 'TechnoVIT ’26', date_label: null }, NOW)).toBe(2026);
    expect(eventYear({ starts_on: null, series: null, date_label: 'March 2027' }, NOW)).toBe(2027);
    expect(eventYear({ starts_on: null, series: null, date_label: 'Soon' }, NOW)).toBeNull();
    expect(eventYear({ starts_on: null, series: "Fest '99", date_label: null }, NOW)).toBeNull();
  });

  it('groups past events by year, newest first, undated last, titles A to Z within a year', () => {
    const groups = groupPastByYear(
      [
        ev({ slug: 'robo-sumo', title: 'Robo Sumo', series: "TechnoVIT '26" }),
        ev({ slug: 'line-follower', title: 'Line Follower', series: "TechnoVIT '26" }),
        ev({ slug: 'robotica', title: 'ROBOTICA-25', starts_on: '2025-02-07' }),
        ev({ slug: 'mystery', title: 'Mystery' }),
      ],
      NOW,
    );
    expect(groups.map(g => g.year)).toEqual([2026, 2025, null]);
    expect(groups[0].events.map(e => e.title)).toEqual(['Line Follower', 'Robo Sumo']);
  });
});
