import { afterEach, describe, expect, it, vi } from 'vitest';
import { addDays, formatDay, formatEventDate, joinList, todayInIndia } from './dates';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('formatEventDate', () => {
  it('formats a calendar date the same in every time zone', () => {
    vi.stubEnv('TZ', 'America/Los_Angeles');
    expect(formatEventDate({ starts_on: '2027-03-14', date_label: null, series: null })).toEqual({
      kind: 'date',
      iso: '2027-03-14',
      day: '14',
      monthYear: 'March 2027',
      full: '14 March 2027',
    });
  });

  it('falls back to the label, then the series, then nothing', () => {
    expect(formatEventDate({ starts_on: null, date_label: "TechnoVIT '27", series: 'x' })).toEqual({ kind: 'label', label: "TechnoVIT '27" });
    expect(formatEventDate({ starts_on: null, date_label: null, series: "TechnoVIT '26" })).toEqual({ kind: 'label', label: "TechnoVIT '26" });
    expect(formatEventDate({ starts_on: null, date_label: null, series: null })).toBeNull();
  });
});

describe('date helpers', () => {
  it('formats a day', () => {
    expect(formatDay('2026-09-18')).toBe('18 September 2026');
  });

  it('reads today in India, which is ahead of UTC', () => {
    // 20:00 UTC on 1 Oct is 01:30 on 2 Oct in India.
    expect(todayInIndia(new Date('2026-10-01T20:00:00Z'))).toBe('2026-10-02');
  });

  it('moves dates across month ends', () => {
    expect(addDays('2026-10-01', -2)).toBe('2026-09-29');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('joins lists with a final "and" and no Oxford comma', () => {
    expect(joinList(['A'])).toBe('A');
    expect(joinList(['A', 'B'])).toBe('A and B');
    expect(joinList(['Line Follower', 'Obstacle Race', 'Robo Race'])).toBe('Line Follower, Obstacle Race and Robo Race');
  });
});
