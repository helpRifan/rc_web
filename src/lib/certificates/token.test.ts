// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { signCertLink, verifyCertLink } from './token';

const SECRET = 'test-secret-that-is-at-least-32-chars-long';
const NOW = Date.UTC(2026, 9, 6, 10, 0, 0);

describe('cert link tokens', () => {
  it('round-trips the normalised email', () => {
    const token = signCertLink(' Lead@Example.COM ', SECRET, NOW);
    expect(verifyCertLink(token, SECRET, NOW + 60_000)).toEqual({ email: 'lead@example.com' });
  });

  it('expires after 30 minutes', () => {
    const token = signCertLink('lead@example.com', SECRET, NOW);
    expect(verifyCertLink(token, SECRET, NOW + 29 * 60_000)).not.toBeNull();
    expect(verifyCertLink(token, SECRET, NOW + 30 * 60_000)).toBeNull();
  });

  it('refuses another secret, a tampered email and a swapped signature', () => {
    const token = signCertLink('lead@example.com', SECRET, NOW);
    expect(verifyCertLink(token, 'another-secret-that-is-also-32-chars-long', NOW)).toBeNull();
    const [, signature] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ e: 'someone.else@example.com', x: Math.floor(NOW / 1000) + 1800 })).toString('base64url');
    expect(verifyCertLink(`${forged}.${signature}`, SECRET, NOW)).toBeNull();
    const other = signCertLink('other@example.com', SECRET, NOW);
    expect(verifyCertLink(`${token.split('.')[0]}.${other.split('.')[1]}`, SECRET, NOW)).toBeNull();
  });

  it.each(['', 'abc', 'a.b.c', '.', 'eyJ9.', '!!!.???'])('refuses the malformed token %j', token => {
    expect(verifyCertLink(token, SECRET, NOW)).toBeNull();
  });
});
