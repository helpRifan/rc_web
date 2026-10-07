import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth/admin';
import { safeNextPath } from '@/lib/auth/admin-rules';
import { authClient } from '@/lib/supabase/server';

/** OAuth return: keep the session only for a verified, listed admin (spec 9.1). */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get('code');
  const next = safeNextPath(url.searchParams.get('next'));
  const signInUrl = (error: string) => new URL(`/admin/sign-in?error=${error}`, url.origin);

  if (!code) return NextResponse.redirect(signInUrl('failed'));
  const supabase = await authClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(signInUrl('failed'));

  const admin = await getCurrentAdmin();
  if (!admin) {
    await supabase.auth.signOut();
    return NextResponse.redirect(signInUrl('not_admin'));
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
