import { describe, expect, it } from 'vitest';
import { CLUB_NAV_ITEMS } from './nav';

describe('CLUB_NAV_ITEMS', () => {
  it('has 8 entries starting with home and including admin', () => {
    expect(CLUB_NAV_ITEMS).toHaveLength(8);
    expect(CLUB_NAV_ITEMS[0]).toEqual({ id: 'home', label: 'Home' });
    expect(CLUB_NAV_ITEMS.some((item) => item.id === 'admin')).toBe(true);
  });

  it('has no duplicate ids', () => {
    const ids = CLUB_NAV_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
