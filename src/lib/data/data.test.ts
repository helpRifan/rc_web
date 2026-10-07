import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeDb } from '../../../tests/helpers/fake-db';
import { FIXTURE_EVENTS, FIXTURE_MEMBERS, FIXTURE_PHOTOS } from './fixtures';
import { EVENT_PUBLIC_COLUMNS, GALLERY_PUBLIC_COLUMNS, MEMBER_PUBLIC_COLUMNS, PARTNER_PUBLIC_COLUMNS } from './types';

const fake = vi.hoisted(() => ({ current: null as null | { client: unknown } }));
vi.mock('@/lib/supabase/admin', () => ({ db: () => fake.current!.client }));

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.stubEnv('DATA_FIXTURES', '');
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function use(results: Parameters<typeof fakeDb>[0]) {
  const db = fakeDb(results);
  fake.current = db;
  return db;
}

describe('public column lists', () => {
  it('never include private columns', () => {
    for (const columns of [EVENT_PUBLIC_COLUMNS, GALLERY_PUBLIC_COLUMNS, MEMBER_PUBLIC_COLUMNS, PARTNER_PUBLIC_COLUMNS]) {
      const names = columns.split(/[\s,()]+/).map(s => s.replace(/^.*:/, ''));
      for (const secret of ['email', 'consent_at', 'contact_email', 'pdf_path', 'recipient_name', 'name_norm']) {
        expect(names).not.toContain(secret);
      }
    }
  });

  it('certificate stats read counts and dates only', async () => {
    const { CERT_STAT_COLUMNS } = await import('./certificates-public');
    expect(CERT_STAT_COLUMNS).toBe('event_id, issued_on');
  });
});

describe('events', () => {
  it('reads published events only, with the public columns', async () => {
    const db = use({ events: { data: [], error: null } });
    const { getPublishedEvents } = await import('./events');
    await getPublishedEvents();
    expect(db.trace('events')).toEqual([`from("events")`, `select(${JSON.stringify(EVENT_PUBLIC_COLUMNS)})`, `eq("is_published", true)`]);
  });

  it('throws on a query error, so required pages go to their error page', async () => {
    use({ events: { data: null, error: { message: 'boom' } } });
    const { getUpcomingEvents } = await import('./events');
    await expect(getUpcomingEvents()).rejects.toThrow('events query failed: boom');
  });

  it('serves the fixtures when DATA_FIXTURES=1, without touching the database', async () => {
    vi.stubEnv('DATA_FIXTURES', '1');
    const db = use({});
    const { getPastEventsByYear } = await import('./events');
    const groups = await getPastEventsByYear(new Date('2026-10-05T00:00:00Z'));
    expect(groups).toHaveLength(1);
    expect(groups[0].year).toBe(2026);
    expect(groups[0].events.map(e => e.title)).toEqual(FIXTURE_EVENTS.map(e => e.title));
    expect(db.calls).toEqual([]);
  });
});

describe('gallery', () => {
  it('keeps an event link only when that event is published', async () => {
    const db = use({
      gallery_items: {
        data: [
          { ...FIXTURE_PHOTOS[0], event: { slug: 'robo-sumo', title: 'Robo Sumo', is_published: true } },
          { ...FIXTURE_PHOTOS[1], event: { slug: 'secret', title: 'Draft', is_published: false } },
        ],
        error: null,
      },
    });
    const { getGallery } = await import('./gallery');
    const photos = await getGallery();
    expect(photos[0].event).toEqual({ slug: 'robo-sumo', title: 'Robo Sumo' });
    expect(photos[1].event).toBeNull();
    expect(db.trace('gallery_items')).toContain(`eq("is_published", true)`);
  });
});

describe('members', () => {
  it('splits and orders the team the way /team shows it', async () => {
    const { splitTeam } = await import('./members');
    const { faculty, board, core, alumni } = splitTeam(FIXTURE_MEMBERS);
    expect(faculty.map(m => m.full_name)).toEqual(['Dr. Arockia Selvakumar Arockia Doss']);
    expect(board.map(m => m.full_name)).toEqual(['Ihsan', 'Grace', 'Vinayak']);
    // Divisions in DIVISIONS order; heads before leads inside each.
    expect(core.map(m => m.full_name)).toEqual([
      'Karthik', 'Akshaj', 'Tarun', 'Pranjal', 'Rifan', 'Aurka', 'Basil', 'Leni', 'Goutham', 'Akshita', 'Aditya', 'Gurudeep', 'Ashton', 'Madhava', 'Daksh',
    ]);
    expect(alumni).toEqual([]);
  });

  it('finds neighbours within the same division only', async () => {
    vi.stubEnv('DATA_FIXTURES', '1');
    use({});
    const { getDivisionNeighbours, getMemberBySlug } = await import('./members');
    const tarun = (await getMemberBySlug('tarun'))!;
    const { previous, next } = await getDivisionNeighbours(tarun);
    expect(previous?.full_name).toBe('Akshaj');
    expect(next).toBeNull(); // Pranjal is Web Dev, not Projects
  });

  it('reads published members only, never private columns', async () => {
    const db = use({ members: { data: [], error: null } });
    const { getPublishedMembers } = await import('./members');
    await getPublishedMembers();
    expect(db.trace('members')).toEqual([`from("members")`, `select(${JSON.stringify(MEMBER_PUBLIC_COLUMNS)})`, `eq("is_published", true)`]);
  });
});

describe('settings', () => {
  it('reads recruitment as closed when the row is missing, malformed or the query fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    for (const result of [
      { data: null, error: null },
      { data: { value: { open: 'yes' } }, error: null },
      { data: null, error: { message: 'down' } },
    ]) {
      vi.resetModules();
      use({ site_settings: result });
      const { getRecruitment } = await import('./settings');
      await expect(getRecruitment()).resolves.toEqual({ open: false });
    }
  });

  it('reads recruitment as open when it says so', async () => {
    use({ site_settings: { data: { value: { open: true } }, error: null } });
    const { getRecruitment } = await import('./settings');
    await expect(getRecruitment()).resolves.toEqual({ open: true });
  });

  it('keeps only known divisions with a valid sentence', async () => {
    const { parseDivisionLines } = await import('./settings');
    expect(
      parseDivisionLines({ projects: '  Builds the robots.  ', webdev: '', robots: 'unknown key', teaching: 'x'.repeat(161), media: 42 }),
    ).toEqual({ projects: 'Builds the robots.' });
    expect(parseDivisionLines(null)).toEqual({});
    expect(parseDivisionLines(['projects'])).toEqual({});
  });
});

describe('certificate stats and the home prompt', () => {
  it('aggregates counts and the latest issue date per event', async () => {
    const { aggregateStats } = await import('./certificates-public');
    const stats = aggregateStats([
      { event_id: 'a', issued_on: '2026-09-17' },
      { event_id: 'a', issued_on: '2026-09-18' },
      { event_id: 'b', issued_on: '2026-09-17' },
    ]);
    expect(stats.get('a')).toEqual({ issued: 2, lastIssuedOn: '2026-09-18' });
    expect(stats.get('b')).toEqual({ issued: 1, lastIssuedOn: '2026-09-17' });
  });

  it('reads every page of issued certificates', async () => {
    const firstPage = Array.from({ length: 1000 }, () => ({ event_id: FIXTURE_EVENTS[0].id, issued_on: '2026-09-17' }));
    const db = use({
      certificates: [
        { data: firstPage, error: null },
        { data: [{ event_id: FIXTURE_EVENTS[1].id, issued_on: '2026-09-18' }], error: null },
      ],
    });
    const { getCertificateStats } = await import('./certificates-public');
    const stats = await getCertificateStats();
    expect(stats.get(FIXTURE_EVENTS[0].id)?.issued).toBe(1000);
    expect(stats.get(FIXTURE_EVENTS[1].id)?.issued).toBe(1);
    expect(db.trace('certificates')).toContain(`range(1000, 1999)`);
  });

  it('names the most recent series and every event in it, within 120 days only', async () => {
    const rows = FIXTURE_EVENTS.map(e => ({ event_id: e.id, issued_on: '2026-09-18' }));
    use({ certificates: { data: rows, error: null }, events: { data: FIXTURE_EVENTS, error: null } });
    const { getRecentCertificatePrompt } = await import('./certificates-public');
    await expect(getRecentCertificatePrompt(new Date('2026-10-05T00:00:00Z'))).resolves.toEqual({
      label: "TechnoVIT '26",
      titles: ['Line Follower', 'Obstacle Race', 'Robo Race', 'Robo Soccer', 'Robo Sumo'],
    });
    await expect(getRecentCertificatePrompt(new Date('2027-03-01T00:00:00Z'))).resolves.toBeNull();
  });
});
