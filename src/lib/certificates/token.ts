import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { normalizeEmail } from './normalize';

// The "Find my certificates" magic link (spec 9.3 item 5): an HMAC-SHA256-signed {email, expiry},
// valid for 30 minutes, compared in constant time. The token carries the email, so the page can
// list that email's certificates without any session or database state.

export const LINK_MINUTES = 30;

const b64 = (data: Buffer | string) => Buffer.from(data).toString('base64url');
const sign = (payload: string, secret: string) => createHmac('sha256', secret).update(payload).digest();

export function signCertLink(email: string, secret: string, now: number = Date.now()): string {
  const payload = b64(JSON.stringify({ e: normalizeEmail(email), x: Math.floor(now / 1000) + LINK_MINUTES * 60 }));
  return `${payload}.${b64(sign(payload, secret))}`;
}

/** The email the token was issued for, or null when it's malformed, tampered with or expired. */
export function verifyCertLink(token: string, secret: string, now: number = Date.now()): { email: string } | null {
  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const [payload, signature] = parts;
  const expected = sign(payload, secret);
  const given = Buffer.from(signature, 'base64url');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const { e, x } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { e?: unknown; x?: unknown };
    if (typeof e !== 'string' || typeof x !== 'number' || !e.includes('@')) return null;
    if (Math.floor(now / 1000) >= x) return null;
    return { email: e };
  } catch {
    return null;
  }
}
