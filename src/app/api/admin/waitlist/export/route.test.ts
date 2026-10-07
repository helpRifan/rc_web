// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ admin: true }));
vi.mock('@/lib/auth/admin', () => ({ requireAdmin: vi.fn(async () => (state.admin ? { id: 'a' } : Promise.reject(new Error('NEXT_REDIRECT')))) }));
vi.mock('@/lib/admin/data', () => ({
  adminWaitlist: vi.fn(async () => [
    { full_name: 'Test, Person', email: 'test@example.com', source: 'join', created_at: '2026-10-05T10:00:00Z' },
    { full_name: '=HYPERLINK("http://evil.example")', email: 'x@example.com', source: 'join', created_at: '2026-10-06T10:00:00Z' },
  ]),
}));

import { GET } from './route';

beforeEach(() => {
  state.admin = true;
});

it('exports a CSV with commas, quotes and formulas made safe', async () => {
  const res = await GET();
  expect(res.headers.get('content-type')).toBe('text/csv; charset=utf-8');
  expect(res.headers.get('content-disposition')).toMatch(/^attachment; filename="waitlist-\d{4}-\d{2}-\d{2}\.csv"$/);
  const text = await res.text();
  expect(text).toContain('"Test, Person","test@example.com","join","2026-10-05"');
  expect(text).toContain(`"'=HYPERLINK(""http://evil.example"")"`);
});

it('refuses a non-admin', async () => {
  state.admin = false;
  await expect(GET()).rejects.toThrow('NEXT_REDIRECT');
});
