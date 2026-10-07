import { NextResponse } from 'next/server';
import { getGallery } from '@/lib/data/gallery';

/** GET /api/gallery (spec 8): published photos only, public columns only. */
export async function GET() {
  try {
    const photos = await getGallery();
    return NextResponse.json({ photos }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } });
  } catch (error) {
    console.error('[api/gallery] failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }
}
