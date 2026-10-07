import { after, type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { FIND_LIMITS } from '@/lib/certificates/limits';
import { normalizeEmail } from '@/lib/certificates/normalize';
import { certLinkSecret } from '@/lib/certificates/secret';
import { signCertLink } from '@/lib/certificates/token';
import { countCertificatesForEmail } from '@/lib/data/certificates';
import { fixturesEnabled } from '@/lib/data/source';
import { emailReady, sendEmail } from '@/lib/email/send';
import { certificateLinkEmail } from '@/lib/email/templates';
import { serverEnv } from '@/lib/env';
import { clientKey, rateLimit, requestIp } from '@/lib/rate-limit';

const body = z.object({ email: z.string().trim().max(254).pipe(z.email()) });
const ACCEPTED = { ok: true } as const;

/**
 * POST /api/certificates/find (spec 8, 9.3 item 4): emails a 30-minute link to that address's
 * certificates, if it has any. The answer is always the same 202, so it never says whether an
 * address is known; the lookup runs either way and the sending happens after the response.
 */
export async function POST(request: NextRequest) {
  if (!emailReady()) return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  if (!(await rateLimit(clientKey('find-ip', requestIp(request.headers)), FIND_LIMITS.perIp))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  let parsed;
  try {
    parsed = body.safeParse(await request.json());
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const email = normalizeEmail(parsed.data.email);
  if (!(await rateLimit(clientKey('find-email', email), FIND_LIMITS.perEmail))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const count = await countCertificatesForEmail(email);
    if (count > 0 && !fixturesEnabled()) {
      const link = new URL(`/certificates/mine?token=${signCertLink(email, certLinkSecret()!)}`, serverEnv().NEXT_PUBLIC_SITE_URL).toString();
      after(async () => {
        try {
          await sendEmail(email, certificateLinkEmail({ link, count }));
        } catch (error) {
          console.error('[certificates] sending the link failed:', error instanceof Error ? error.message : error);
        }
      });
    }
  } catch (error) {
    // Logged, never shown: the visitor gets the same answer as everyone else.
    console.error('[certificates] find failed:', error instanceof Error ? error.message : error);
  }
  return NextResponse.json(ACCEPTED, { status: 202 });
}
