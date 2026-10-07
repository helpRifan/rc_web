import 'server-only';
import { createHash } from 'node:crypto';
import { fixturesEnabled } from '@/lib/data/source';
import { db } from '@/lib/supabase/admin';

export function clientKey(kind: string, value: string): string {
  return `${kind}:${createHash('sha256').update(value.trim().toLowerCase()).digest('hex')}`;
}

/** True when the request is allowed. Fails closed: if the check itself fails, the request is refused. */
export async function rateLimit(key: string, { windowSeconds, max }: { windowSeconds: number; max: number }): Promise<boolean> {
  // Local fixtures have no database to count in (and never run in production).
  if (fixturesEnabled()) return true;
  try {
    const { data, error } = await db().rpc('hit_rate_limit', { p_key: key, p_window_seconds: windowSeconds, p_max_hits: max });
    if (error) {
      console.error('rate limit check failed:', error.message);
      return false;
    }
    return data === true;
  } catch (error) {
    // A thrown error (bad env, network) is refused too, never let through.
    console.error('rate limit check failed:', error instanceof Error ? error.message : 'unknown error');
    return false;
  }
}

/** The caller's IP for rate limiting (Vercel sets x-forwarded-for). Never stored raw: see clientKey. */
export function requestIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip')?.trim() || 'unknown';
}
