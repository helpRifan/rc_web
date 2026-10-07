import { NextResponse } from 'next/server';
import { VERIFY_LIMIT } from '@/lib/certificates/limits';
import { parsePublicId } from '@/lib/certificates/public-id';
import { getCertificateByPublicId } from '@/lib/data/certificates';
import { clientKey, rateLimit, requestIp } from '@/lib/rate-limit';

const PRIVATE = { 'Cache-Control': 'private, no-store' };

/** GET /api/certificates/[publicId] (spec 8): the verification JSON. Unknown and malformed IDs answer alike. */
export async function GET(request: Request, { params }: RouteContext<'/api/certificates/[publicId]'>) {
  if (!(await rateLimit(clientKey('verify', requestIp(request.headers)), VERIFY_LIMIT))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: PRIVATE });
  }
  const { publicId } = await params;
  const id = parsePublicId(publicId);
  try {
    const certificate = id ? await getCertificateByPublicId(id) : null;
    if (!certificate) return NextResponse.json({ found: false }, { status: 404, headers: PRIVATE });
    return NextResponse.json(
      {
        found: true,
        name: certificate.name,
        event: certificate.event ? { title: certificate.event.title, series: certificate.event.series } : null,
        type: certificate.type,
        place: certificate.place,
        issuedOn: certificate.issuedOn,
        status: certificate.status,
      },
      { headers: PRIVATE },
    );
  } catch (error) {
    console.error('[certificates] verify failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 503, headers: PRIVATE });
  }
}
