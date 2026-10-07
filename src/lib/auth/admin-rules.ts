export type Admin = { id: string; email: string; name: string | null; is_owner: boolean };
type MaybeUser = { email?: string | null; email_confirmed_at?: string | null } | null;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Spec 9.2: valid session, verified email, exact lower-cased match in admins. */
export async function decideAdmin(user: MaybeUser, findAdmin: (email: string) => Promise<Admin | null>): Promise<Admin | null> {
  if (!user?.email || !user.email_confirmed_at) return null;
  return findAdmin(normalizeEmail(user.email));
}

const BASE = 'http://rcweb.invalid';

/** Only same-origin /admin paths survive; everything else lands on /admin. */
export function safeNextPath(next: string | null | undefined): string {
  const fallback = '/admin';
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  try {
    const url = new URL(next, BASE);
    if (url.origin !== BASE) return fallback;
    if (url.pathname !== '/admin' && !url.pathname.startsWith('/admin/')) return fallback;
    return url.pathname + url.search;
  } catch {
    return fallback;
  }
}
