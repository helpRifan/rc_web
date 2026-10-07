// Certificate IDs (spec 7.1): "RC<yy>-" and 10 Crockford base32 characters from a secure random
// source, e.g. RC26-7KQ2M9XH4D. 50 bits of randomness, never sequential, never from the name.
// Pure and isomorphic (Web Crypto), so the verify form can parse IDs in the browser.

/** Crockford base32: no I, L, O or U, so IDs can't be misread. */
export const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
/** The same pattern as the database check. */
export const PUBLIC_ID = /^RC\d{2}-[0-9A-HJKMNP-TV-Z]{10}$/;

/** A new ID for a certificate issued in `year`. 256 is a multiple of 32, so `byte & 31` is uniform. */
export function generatePublicId(year: number, randomBytes: (n: number) => Uint8Array = n => crypto.getRandomValues(new Uint8Array(n))): string {
  const bytes = randomBytes(10);
  const body = Array.from(bytes, byte => CROCKFORD[byte & 31]).join('');
  return `RC${String(year % 100).padStart(2, '0')}-${body}`;
}

/**
 * The ID inside whatever was pasted: a bare ID, or a verify link with or without a trailing slash
 * or query string. Case doesn't matter, and the letters Crockford reads as digits (O as 0, I and L
 * as 1) are corrected. Null when there's no valid ID.
 */
export function parsePublicId(input: string): string | null {
  const match = input.toUpperCase().match(/RC(\d{2})-([0-9A-Z]{10})(?![0-9A-Z])/);
  if (!match) return null;
  const body = match[2].replace(/O/g, '0').replace(/[IL]/g, '1');
  const id = `RC${match[1]}-${body}`;
  return PUBLIC_ID.test(id) ? id : null;
}
