import { describe, expect, it } from 'vitest';
import {
  mapHeaders,
  matchPhoto,
  matchSeed,
  normaliseLink,
  parseCsv,
  parseTags,
  shouldPublish,
  slugify,
  uniqueSlug,
  validateRow,
} from './member-import';

// Synthetic people only: no real names, emails or photos.

const HEADERS = [
  'Timestamp',
  'Email Address',
  'Full name',
  'Year of study',
  'Degree and branch',
  'Team',
  'Level',
  'Role title',
  'Year you joined',
  'About you (300 characters or fewer)',
  'Tags (pick up to 3)',
  'Currently building',
  'Fun fact',
  'GitHub',
  'LinkedIn',
  'Instagram',
  'Portfolio',
  'Photo',
  'Consent: OK to show my profile on the club website',
];
const { columns } = mapHeaders(HEADERS);

function row(values: Partial<Record<string, string>>): string[] {
  const base: Record<string, string> = {
    'Email Address': 'test.one@example.com',
    'Full name': 'Test One',
    Team: 'Projects',
    Level: 'Lead',
    'Role title': 'Projects Lead',
    'Consent: OK to show my profile on the club website': 'Yes, show my profile',
  };
  const merged = { ...base, ...values };
  return HEADERS.map(header => merged[header] ?? '');
}

describe('parseCsv', () => {
  it('handles quotes, doubled quotes, commas and line breaks inside fields, CRLF and a BOM', () => {
    const csv = '﻿a,b,c\r\n"x, y","say ""hi""","line one\nline two"\r\n\r\n1,2,3';
    expect(parseCsv(csv)).toEqual([
      ['a', 'b', 'c'],
      ['x, y', 'say "hi"', 'line one\nline two'],
      ['1', '2', '3'],
    ]);
  });
});

describe('mapHeaders', () => {
  it('maps the Form questions to fields', () => {
    expect(columns.get('email')).toBe(1);
    expect(columns.get('full_name')).toBe(2);
    expect(columns.get('degree')).toBe(4);
    expect(columns.get('team')).toBe(5);
    expect(columns.get('level')).toBe(6);
    expect(columns.get('role_title')).toBe(7);
    expect(columns.get('joined_year')).toBe(8);
    expect(columns.get('about')).toBe(9);
    expect(columns.get('tags')).toBe(10);
    expect(columns.get('portfolio_url')).toBe(16);
    expect(columns.get('consent')).toBe(18);
  });

  it('names the required questions it could not find', () => {
    expect(mapHeaders(['Timestamp', 'Full name']).missing).toEqual(['email', 'team']);
  });
});

describe('validateRow', () => {
  it('maps a division answer and keeps the level', () => {
    const { member, errors } = validateRow(row({}), columns, 2, 2026);
    expect(errors).toEqual([]);
    expect(member).toMatchObject({ full_name: 'Test One', email: 'test.one@example.com', division: 'projects', level: 'lead', consent: true });
  });

  it('maps Board to level board and division none, whatever the level answer', () => {
    const { member } = validateRow(row({ Team: 'Board', Level: 'Lead', 'Role title': 'Secretary' }), columns, 2, 2026);
    expect(member).toMatchObject({ level: 'board', division: 'none' });
  });

  it('maps the long division labels', () => {
    expect(validateRow(row({ Team: 'Marketing & Sponsorship' }), columns, 2, 2026).member?.division).toBe('marketing');
    expect(validateRow(row({ Team: 'media & design' }), columns, 2, 2026).member?.division).toBe('media');
  });

  it('refuses a row without a name, a valid email or a known team', () => {
    expect(validateRow(row({ 'Full name': '' }), columns, 2, 2026).errors).toContain('no name');
    expect(validateRow(row({ 'Email Address': 'not-an-email' }), columns, 2, 2026).errors).toContain('the email address is not valid');
    const team = validateRow(row({ Team: 'Space' }), columns, 2, 2026);
    expect(team.member).toBeNull();
    expect(team.errors).toContain('unknown team "Space"');
  });

  it('refuses text over the database limits', () => {
    const { errors, member } = validateRow(row({ 'About you (300 characters or fewer)': 'x'.repeat(301) }), columns, 2, 2026);
    expect(member).toBeNull();
    expect(errors).toEqual(['about is 301 characters; the limit is 300']);
  });

  it('keeps at most three tags', () => {
    const { member, warnings } = validateRow(row({ 'Tags (pick up to 3)': 'Drones, Electronics, PCB design, Computer vision' }), columns, 2, 2026);
    expect(member?.tags).toEqual(['Drones', 'Electronics', 'PCB design']);
    expect(warnings).toContain('4 tags; kept the first 3');
  });

  it('drops http links and keeps https ones', () => {
    const { member, warnings } = validateRow(row({ GitHub: 'http://github.com/test-one', LinkedIn: 'linkedin.com/in/test-one' }), columns, 2, 2026);
    expect(member?.github_url).toBeNull();
    expect(member?.linkedin_url).toBe('https://linkedin.com/in/test-one');
    expect(warnings).toContain('GitHub link dropped (only https links are kept)');
  });

  it('reads consent from a ticked box, and no answer as no', () => {
    expect(validateRow(row({ 'Consent: OK to show my profile on the club website': '' }), columns, 2, 2026).member?.consent).toBe(false);
    expect(validateRow(row({ 'Consent: OK to show my profile on the club website': 'No' }), columns, 2, 2026).member?.consent).toBe(false);
  });

  it('keeps a plausible joined year only', () => {
    expect(validateRow(row({ 'Year you joined': '2024' }), columns, 2, 2026).member?.joined_year).toBe(2024);
    const future = validateRow(row({ 'Year you joined': '2031' }), columns, 2, 2026);
    expect(future.member?.joined_year).toBeNull();
    expect(future.warnings).toContain('joined year "2031" was not used');
  });
});

describe('parseTags', () => {
  it('turns unknown answers into one Other tag', () => {
    expect(parseTags('AI / ML, underwater robots, swarms')).toEqual({ tags: ['AI / ML', 'Other: underwater robots, swarms'], extra: 0 });
  });

  it('matches known tags in any case, once', () => {
    expect(parseTags('drones, DRONES, 3d printing').tags).toEqual(['Drones', '3D printing']);
  });
});

describe('normaliseLink', () => {
  it.each([
    ['https://example.com/me', 'https://example.com/me'],
    ['github.com/test', 'https://github.com/test'],
    ['http://example.com', null],
    ['javascript:alert(1)', null],
    ['just a username', null],
  ])('%s gives %s', (input, url) => {
    expect(normaliseLink(input).url).toBe(url);
  });
});

describe('matchPhoto', () => {
  const files = ['IMG_0001 - Test One.jpg', 'photo - Test Two.PNG', 'notes.txt', 'IMG_9 - Test Three.jpeg', 'other - Test Three.jpg'];

  it('matches the Form upload by its respondent-name suffix, in any case', () => {
    expect(matchPhoto(files, 'test one')).toEqual({ file: 'IMG_0001 - Test One.jpg', candidates: 1 });
    expect(matchPhoto(files, 'Test Two').file).toBe('photo - Test Two.PNG');
  });

  it('matches nothing when there is no photo, or more than one', () => {
    expect(matchPhoto(files, 'Test Four')).toEqual({ file: null, candidates: 0 });
    expect(matchPhoto(files, 'Test Three')).toEqual({ file: null, candidates: 2 });
  });
});

describe('matchSeed', () => {
  const seeds = [
    { slug: 'alpha', full_name: 'Alpha', role_title: 'Projects Lead', email: null },
    { slug: 'beta', full_name: 'Beta', role_title: 'Secretary', email: 'beta@example.com' },
  ];

  it('finds the seeded row by first name and role, keeping its slug', () => {
    expect(matchSeed({ full_name: 'Alpha Example', role_title: 'projects lead' }, seeds)?.slug).toBe('alpha');
  });

  it('ignores rows that already have an email, and different roles', () => {
    expect(matchSeed({ full_name: 'Beta Example', role_title: 'Secretary' }, seeds)).toBeNull();
    expect(matchSeed({ full_name: 'Alpha Example', role_title: 'Projects Head' }, seeds)).toBeNull();
  });
});

describe('shouldPublish', () => {
  it('needs both consent and a photo', () => {
    expect(shouldPublish({ consent: true }, true)).toBe(true);
    expect(shouldPublish({ consent: true }, false)).toBe(false);
    expect(shouldPublish({ consent: false }, true)).toBe(false);
  });
});

describe('slugs', () => {
  it('slugifies names and avoids taken slugs', () => {
    expect(slugify('Test Ünïcode  Name')).toBe('test-unicode-name');
    expect(uniqueSlug('test-one', new Set(['test-one', 'test-one-2']))).toBe('test-one-3');
  });
});
