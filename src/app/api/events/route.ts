import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPublishedEvents } from '@/lib/data/events';

const Query = z.object({
  status: z.enum(['upcoming', 'registration_open', 'coming_soon', 'completed']).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

/** GET /api/events (spec 8): published events only, public columns only. */
export async function GET(request: NextRequest) {
  const parsed = Query.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
  try {
    const { status, limit = 50 } = parsed.data;
    const events = (await getPublishedEvents()).filter(e => !status || e.status === status).slice(0, limit);
    return NextResponse.json({ events }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } });
  } catch (error) {
    console.error('[api/events] failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }
}
