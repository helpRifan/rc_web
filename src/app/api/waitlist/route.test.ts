// @vitest-environment node
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeDb } from '../../../../tests/helpers/fake-db';

const state = vi.hoisted(() => ({ allow: [] as boolean[], db: null as null | { client: unknown } }));
vi.mock('@/lib/rate-limit', async importOriginal => {
  const real = await importOriginal<typeof import('@/lib/rate-limit')>();
  return { ...real, rateLimit: vi.fn(async () => state.allow.shift() ?? true) };
});
vi.mock('@/lib/supabase/admin', () => ({ db: () => state.db!.client }));

import { rateLimit } from '@/lib/rate-limit';
import { POST, WAITLIST_LIMITS } from './route';

const post = (body: unknown, raw = false) =>
  POST(
    new NextRequest('http://localhost/api/waitlist', {
      method: 'POST',
      body: raw ? (body as string) : JSON.stringify(body),
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.9, 10.0.0.1' },
    }),
  );
const valid = { fullName: 'Asha Rao', email: 'Asha.Rao@VITstudent.ac.in', website: '' };

beforeEach(() => {
  state.allow = [];
  vi.stubEnv('DATA_FIXTURES', '');
  vi.stubEnv('JOIN_EMAIL_DOMAINS', '');
  vi.mocked(rateLimit).mockClear();
});
afterEach(() => vi.unstubAllEnvs());

describe('POST /api/waitlist', () => {
  it('stores a new sign-up and answers 201', async () => {
    const db = (state.db = fakeDb({ waitlist: { data: [{ id: '1' }], error: null } }));
    const res = await post(valid);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
    const upsert = db.calls.find(c => c.method === 'upsert')!;
    expect(upsert.args[0]).toEqual({ full_name: 'Asha Rao', email: 'asha.rao@vitstudent.ac.in', source: 'join' });
  });

  it('answers 200 with the same body for someone already listed', async () => {
    state.db = fakeDb({ waitlist: { data: [], error: null } });
    const res = await post(valid);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('rate-limits per network first, then per email', async () => {
    state.db = fakeDb({ waitlist: { data: [{ id: '1' }], error: null } });
    state.allow = [false];
    expect((await post(valid)).status).toBe(429);
    state.allow = [true, false];
    expect((await post(valid)).status).toBe(429);
    expect(vi.mocked(rateLimit).mock.calls.at(-2)?.[1]).toEqual(WAITLIST_LIMITS.perIp);
    expect(vi.mocked(rateLimit).mock.calls.at(-1)?.[1]).toEqual(WAITLIST_LIMITS.perEmail);
    // Raw IPs and emails are never the key.
    for (const [key] of vi.mocked(rateLimit).mock.calls) {
      expect(key).not.toContain('203.0.113.9');
      expect(key).not.toContain('asha');
    }
  });

  it('rejects other domains, bad emails and empty names with a field code', async () => {
    state.db = fakeDb();
    const cases: Array<[unknown, string, string]> = [
      [{ ...valid, email: 'asha@gmail.com' }, 'email', 'email-domain'],
      [{ ...valid, email: 'not-an-email' }, 'email', 'email-format'],
      [{ ...valid, fullName: '   ' }, 'fullName', 'name-empty'],
      [{ ...valid, fullName: 'x'.repeat(81) }, 'fullName', 'name-long'],
    ];
    for (const [body, field, code] of cases) {
      const res = await post(body);
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: 'invalid', field, code });
    }
  });

  it('accepts other domains when configured', async () => {
    vi.stubEnv('JOIN_EMAIL_DOMAINS', 'vitstudent.ac.in, vit.ac.in');
    state.db = fakeDb({ waitlist: { data: [{ id: '1' }], error: null } });
    expect((await post({ ...valid, email: 'faculty@vit.ac.in' })).status).toBe(201);
  });

  it('treats a honeypot hit as success and stores nothing', async () => {
    const db = (state.db = fakeDb());
    const res = await post({ ...valid, website: 'https://spam.example' });
    expect(res.status).toBe(201);
    expect(db.calls).toEqual([]);
  });

  it('answers 400 to a body that is not JSON', async () => {
    state.db = fakeDb();
    expect((await post('{nope', true)).status).toBe(400);
  });

  it('answers 503 without details when the database fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    state.db = fakeDb({ waitlist: { data: null, error: { message: 'duplicate key at 10.0.0.1' } } });
    const res = await post(valid);
    expect(res.status).toBe(503);
    expect(JSON.stringify(await res.json())).not.toContain('10.0.0.1');
  });
});
