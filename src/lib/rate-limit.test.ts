import { beforeEach, describe, expect, it, vi } from 'vitest';

const rpc = vi.hoisted(() => vi.fn());
vi.mock('@/lib/supabase/admin', () => ({ db: () => ({ rpc }) }));

import { clientKey, rateLimit } from './rate-limit';

// Block body on purpose: mockReset() returns the mock, and Vitest runs a function returned
// from beforeEach as that test's teardown, which would call rpc() once more after every test.
beforeEach(() => {
  rpc.mockReset();
});

describe('rateLimit', () => {
  it('passes the window and limit to the database function', async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    await expect(rateLimit('find:abc', { windowSeconds: 3600, max: 5 })).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith('hit_rate_limit', { p_key: 'find:abc', p_window_seconds: 3600, p_max_hits: 5 });
  });
  it('denies when over the limit', async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    await expect(rateLimit('k', { windowSeconds: 60, max: 1 })).resolves.toBe(false);
  });
  it('fails closed when the database errors', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'boom' } });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(rateLimit('k', { windowSeconds: 60, max: 1 })).resolves.toBe(false);
  });
  it('fails closed when the call itself throws', async () => {
    rpc.mockRejectedValue(new Error('fetch failed'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(rateLimit('k', { windowSeconds: 60, max: 1 })).resolves.toBe(false);
  });
});

describe('clientKey', () => {
  it('hashes the value so raw IPs and emails are never stored', () => {
    const key = clientKey('ip', '203.0.113.9');
    expect(key).toMatch(/^ip:[0-9a-f]{64}$/);
    expect(key).not.toContain('203.0.113.9');
    expect(clientKey('email', 'A@B.com ')).toBe(clientKey('email', 'a@b.com'));
  });
});
