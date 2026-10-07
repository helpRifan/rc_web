import { describe, expect, it } from 'vitest';
import { isActive, NAV } from './site';

describe('isActive', () => {
  it('matches home only on the exact root', () => {
    expect(isActive('/', '/')).toBe(true);
    expect(isActive('/team', '/')).toBe(false);
  });
  it('matches a section and its children, not prefixes of other words', () => {
    expect(isActive('/team', '/team')).toBe(true);
    expect(isActive('/team/ihsan-hashir', '/team')).toBe(true);
    expect(isActive('/teams', '/team')).toBe(false);
  });
});

it('lists the spec 6 navigation in order', () => {
  expect(NAV.map(n => n.label)).toEqual(['Home', 'Team', 'Events', 'Gallery', 'Certificates', 'Join']);
});
