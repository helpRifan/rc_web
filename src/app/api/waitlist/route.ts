import { type NextRequest, NextResponse } from 'next/server';
import { fixturesEnabled } from '@/lib/data/source';
import { joinDomains } from '@/lib/join-domains';
import { clientKey, rateLimit, requestIp } from '@/lib/rate-limit';
import { db } from '@/lib/supabase/admin';
import { makeWaitlistSchema, waitlistErrors } from '@/lib/validation/waitlist';

// Campus networks share a few addresses, so the per-IP limit is generous; the per-email limit,
// the domain rule and idempotent upserts keep abuse down (join brief 6).
export const WAITLIST_LIMITS = {
  perIp: { windowSeconds: 3600, max: 30 },
  perEmail: { windowSeconds: 3600, max: 5 },
} as const;

const tooMany = () => NextResponse.json({ error: 'Too many requests' }, { status: 429 });

/** POST /api/waitlist: { fullName, email, website } (spec 8). Never echoes input back. */
export async function POST(request: NextRequest) {
  try {
    if (!(await rateLimit(clientKey('ip', requestIp(request.headers)), WAITLIST_LIMITS.perIp))) return tooMany();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'invalid' }, { status: 400 });
    }

    const parsed = makeWaitlistSchema(joinDomains()).safeParse(body);
    if (!parsed.success) {
      const errors = waitlistErrors(parsed.error);
      const field = errors.fullName ? 'fullName' : 'email';
      return NextResponse.json({ error: 'invalid', field, code: errors[field] ?? 'email-format' }, { status: 400 });
    }

    const { fullName, email, website } = parsed.data;
    // Honeypot: look like success, store nothing.
    if (website) return NextResponse.json({ ok: true }, { status: 201 });

    if (!(await rateLimit(clientKey('email', email), WAITLIST_LIMITS.perEmail))) return tooMany();

    if (fixturesEnabled()) {
      console.info('[fixtures] waitlist sign-up accepted locally and not stored');
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const { data, error } = await db()
      .from('waitlist')
      .upsert({ full_name: fullName, email, source: 'join' }, { onConflict: 'email', ignoreDuplicates: true })
      .select('id');
    if (error) throw new Error(error.message);
    // Already listed people get the same message as new ones (spec 6.9).
    return NextResponse.json({ ok: true }, { status: data && data.length > 0 ? 201 : 200 });
  } catch (error) {
    console.error('[api/waitlist] failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }
}
