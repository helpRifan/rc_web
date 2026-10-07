import 'server-only';
import { fixturesEnabled } from '@/lib/data/source';
import { serverEnv } from '@/lib/env';

/**
 * A fixed, public secret for local fixtures only, so "Your certificates" can be tried without a
 * real one. Fixtures refuse to run in production, so this can never sign a real link.
 */
export const FIXTURE_LINK_SECRET = 'fixtures-only-cert-link-secret-never-real';

/** The secret magic links are signed with, or null when none is configured. */
export function certLinkSecret(): string | null {
  const secret = serverEnv().CERT_LINK_SECRET ?? null;
  return secret ?? (fixturesEnabled() ? FIXTURE_LINK_SECRET : null);
}
