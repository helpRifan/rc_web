import { describe, expect, it } from 'vitest';
import { fixturesEnabled } from './source';

describe('fixturesEnabled', () => {
  it('is off unless DATA_FIXTURES is exactly 1', () => {
    expect(fixturesEnabled({})).toBe(false);
    expect(fixturesEnabled({ DATA_FIXTURES: 'true' })).toBe(false);
    expect(fixturesEnabled({ DATA_FIXTURES: '1' })).toBe(true);
    expect(fixturesEnabled({ DATA_FIXTURES: '1', VERCEL_ENV: 'preview' })).toBe(true);
  });

  it('refuses to serve fixtures in production', () => {
    expect(() => fixturesEnabled({ DATA_FIXTURES: '1', VERCEL_ENV: 'production' })).toThrow(/production/);
  });
});
