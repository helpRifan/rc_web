import { NextResponse } from 'next/server';
import { fixturePdf } from '@/lib/certificates/fixture-pdf';
import { PDF_LIMIT } from '@/lib/certificates/limits';
import { parsePublicId } from '@/lib/certificates/public-id';
import { getCertificateFile, signedPdfUrl } from '@/lib/data/certificates';
import { fixturesEnabled } from '@/lib/data/source';
import { clientKey, rateLimit, requestIp } from '@/lib/rate-limit';

const PRIVATE = { 'Cache-Control': 'private, no-store' };

/**
 * GET /api/certificates/[publicId]/pdf (spec 8): a 302 to a 5-minute signed URL for the stored PDF.
 * Revoked, unknown and malformed IDs all get the same 404.
 */
export async function GET(request: Request, { params }: RouteContext<'/api/certificates/[publicId]/pdf'>) {
  if (!(await rateLimit(clientKey('pdf', requestIp(request.headers)), PDF_LIMIT))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: PRIVATE });
  }
  const { publicId } = await params;
  const id = parsePublicId(publicId);
  try {
    const file = id ? await getCertificateFile(id) : null;
    if (!id || !file || file.status !== 'issued') return NextResponse.json({ error: 'Not found' }, { status: 404, headers: PRIVATE });
    if (fixturesEnabled()) {
      return new NextResponse(new Uint8Array(fixturePdf(id)), {
        headers: { ...PRIVATE, 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${id}.pdf"` },
      });
    }
    return NextResponse.redirect(await signedPdfUrl(file.pdfPath), { status: 302, headers: PRIVATE });
  } catch (error) {
    console.error('[certificates] pdf failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 503, headers: PRIVATE });
  }
}
