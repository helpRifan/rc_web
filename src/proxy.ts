import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy-session';

// Reachable without a session. Matched as whole segments, so `/admin/sign-inx` is still gated.
const PUBLIC_ADMIN_PATHS = ['/admin/sign-in', '/admin/auth'];

function isPublic(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Refreshes the session and sends signed-out visitors to sign-in (spec 5). This is only the
 * first gate (any session passes): every admin page, Server Action and Route Handler re-checks with
 * requireAdmin(), and so does each admin data helper.
 */
export async function proxy(request: NextRequest) {
  const { response, claims } = await updateSession(request);
  const { pathname } = request.nextUrl;
  if (!isPublic(pathname) && !claims) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/sign-in';
    url.search = '';
    url.searchParams.set('next', pathname);
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    return redirect;
  }
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = { matcher: ['/admin', '/admin/:path*'] };
