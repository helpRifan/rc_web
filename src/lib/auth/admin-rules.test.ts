import { describe, expect, it, vi } from 'vitest';
import { decideAdmin, normalizeEmail, safeNextPath, type Admin } from './admin-rules';

const OWNER: Admin = { id: '1', email: 'owner@vitstudent.ac.in', name: 'Owner', is_owner: true };
const findAdmin = vi.fn(async (email: string) => (email === OWNER.email ? OWNER : null));

describe('normalizeEmail', () => {
  it('trims and lower-cases', () => expect(normalizeEmail('  Owner@VITstudent.ac.in ')).toBe('owner@vitstudent.ac.in'));
});

describe('decideAdmin', () => {
  it('accepts a verified email that matches in any case or spacing', async () => {
    await expect(decideAdmin({ email: ' Owner@VITSTUDENT.ac.in', email_confirmed_at: '2026-10-01T00:00:00Z' }, findAdmin)).resolves.toEqual(OWNER);
  });
  it('refuses when there is no user or no email', async () => {
    await expect(decideAdmin(null, findAdmin)).resolves.toBeNull();
    await expect(decideAdmin({ email: undefined, email_confirmed_at: '2026-10-01' }, findAdmin)).resolves.toBeNull();
  });
  it('refuses an unverified email even if it is listed', async () => {
    await expect(decideAdmin({ email: OWNER.email, email_confirmed_at: null }, findAdmin)).resolves.toBeNull();
  });
  it('refuses a verified email that is not listed', async () => {
    await expect(decideAdmin({ email: 'someone@gmail.com', email_confirmed_at: '2026-10-01' }, findAdmin)).resolves.toBeNull();
  });
});

describe('safeNextPath', () => {
  it.each([
    [null, '/admin'],
    ['', '/admin'],
    ['https://evil.com', '/admin'],
    ['//evil.com', '/admin'],
    ['/\\evil.com', '/admin'],
    ['javascript:alert(1)', '/admin'],
    ['/admin/../team', '/admin'],
    ['/administrator', '/admin'],
    ['/admin', '/admin'],
    ['/admin/events?page=2', '/admin/events?page=2'],
  ])('%s -> %s', (input, expected) => expect(safeNextPath(input)).toBe(expected));
});
