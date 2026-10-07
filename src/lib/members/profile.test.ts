import { describe, expect, it } from 'vitest';
import { metaLine, profileDescription, profileLinks, profileTags } from './profile';

const base = {
  full_name: 'Test Person',
  role_title: 'Projects Lead',
  division: 'projects',
  year_of_study: null,
  degree: null,
  tags: null,
  github_url: null,
  linkedin_url: null,
  instagram_url: null,
  portfolio_url: null,
};

describe('metaLine', () => {
  it('joins the parts that exist', () => {
    expect(metaLine({ division: 'operations', year_of_study: '3rd year', degree: 'B.Tech CSE' })).toBe('Operations, 3rd year, B.Tech CSE');
  });

  it('skips missing parts', () => {
    expect(metaLine({ division: 'none', year_of_study: '2nd year', degree: null })).toBe('2nd year');
    expect(metaLine({ division: 'webdev', year_of_study: ' ', degree: null })).toBe('Web Dev');
  });

  it('is null when nothing is known', () => {
    expect(metaLine({ division: 'none', year_of_study: null, degree: null })).toBeNull();
  });
});

describe('profileTags', () => {
  it('drops the Other: prefix and keeps three', () => {
    expect(profileTags({ tags: ['Embedded systems', 'Other: Drones', 'CAD', 'Extra'] })).toEqual(['Embedded systems', 'Drones', 'CAD']);
  });
});

describe('profileLinks', () => {
  it('renders only the links that exist, in order', () => {
    expect(profileLinks({ ...base, portfolio_url: 'https://example.com', github_url: 'https://github.com/test' })).toEqual([
      { label: 'GitHub', href: 'https://github.com/test' },
      { label: 'Portfolio', href: 'https://example.com' },
    ]);
  });

  it('drops anything that is not https', () => {
    expect(profileLinks({ ...base, github_url: 'http://github.com/test', linkedin_url: 'javascript:alert(1)', instagram_url: 'not a url' })).toEqual([]);
  });
});

describe('profileDescription', () => {
  it('uses the role when there is one', () => {
    expect(profileDescription({ role_title: 'Secretary' })).toBe('Secretary at Robotics Club, VIT Chennai.');
    expect(profileDescription({ role_title: null })).toBe('Member of Robotics Club, VIT Chennai.');
  });
});
