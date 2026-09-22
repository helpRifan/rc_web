import { describe, expect, it } from 'vitest';
import { buildSearchIndex, filterSearchIndex } from './searchIndex';

describe('buildSearchIndex', () => {
  it('includes members, events, and gallery items with the right target tabs', () => {
    const index = buildSearchIndex();
    expect(index.some((e) => e.type === 'member' && e.targetTab === 'members')).toBe(true);
    expect(index.some((e) => e.type === 'event' && e.targetTab === 'activities')).toBe(true);
    expect(index.some((e) => e.type === 'gallery' && e.targetTab === 'about')).toBe(true);
  });

  it('gives every entry a non-empty id and title', () => {
    const index = buildSearchIndex();
    expect(index.length).toBeGreaterThan(0);
    for (const entry of index) {
      expect(entry.id).toBeTruthy();
      expect(entry.title).toBeTruthy();
    }
  });
});

describe('filterSearchIndex', () => {
  const index = buildSearchIndex();

  it('returns an empty array for an empty query', () => {
    expect(filterSearchIndex('', index)).toEqual([]);
    expect(filterSearchIndex('   ', index)).toEqual([]);
  });

  it('matches case-insensitively against title or subtitle', () => {
    const results = filterSearchIndex('robosumo', index);
    expect(results.some((r) => r.title.toLowerCase().includes('robosumo'))).toBe(true);
  });

  it('caps results at 8', () => {
    const results = filterSearchIndex('a', index);
    expect(results.length).toBeLessThanOrEqual(8);
  });

  it('returns no results for a nonsense query', () => {
    expect(filterSearchIndex('zzzzznonexistentquery', index)).toEqual([]);
  });
});
