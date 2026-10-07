// @vitest-environment node
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FIXTURE_EVENTS, FIXTURE_PHOTOS } from '@/lib/data/fixtures';

const data = vi.hoisted(() => ({ events: vi.fn(), gallery: vi.fn() }));
vi.mock('@/lib/data/events', () => ({ getPublishedEvents: data.events }));
vi.mock('@/lib/data/gallery', () => ({ getGallery: data.gallery }));

import { GET as getEvents } from './events/route';
import { GET as getGallery } from './gallery/route';

const req = (query = '') => new NextRequest(`http://localhost/api/events${query}`);

beforeEach(() => {
  data.events.mockReset().mockResolvedValue(FIXTURE_EVENTS);
  data.gallery.mockReset().mockResolvedValue(FIXTURE_PHOTOS);
});

describe('GET /api/events', () => {
  it('returns published events with a cache header', async () => {
    const res = await getEvents(req());
    expect(res.status).toBe(200);
    expect((await res.json()).events).toHaveLength(5);
    expect(res.headers.get('cache-control')).toContain('s-maxage=300');
  });

  it('filters by status and honours the limit', async () => {
    const completed = await (await getEvents(req('?status=completed&limit=2'))).json();
    expect(completed.events).toHaveLength(2);
    const upcoming = await (await getEvents(req('?status=upcoming'))).json();
    expect(upcoming.events).toEqual([]);
  });

  it('rejects bad query values with a plain 400', async () => {
    for (const query of ['?status=bogus', '?limit=0', '?limit=51', '?limit=abc']) {
      const res = await getEvents(req(query));
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: 'Invalid query' });
    }
  });

  it('answers 503 without details when the database fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    data.events.mockRejectedValue(new Error('connection refused at 10.0.0.1'));
    const res = await getEvents(req());
    expect(res.status).toBe(503);
    expect(JSON.stringify(await res.json())).not.toContain('10.0.0.1');
  });
});

describe('GET /api/gallery', () => {
  it('returns the published photos', async () => {
    const res = await getGallery();
    expect(res.status).toBe(200);
    expect((await res.json()).photos).toHaveLength(9);
  });
});
