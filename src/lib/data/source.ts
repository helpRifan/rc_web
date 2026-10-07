/**
 * DATA_FIXTURES=1 serves the real-content fixtures (src/lib/data/fixtures.ts) instead of the
 * database: for local builds, screenshots and e2e while there's no secret key. It must never be on
 * in production, so it throws there rather than silently serving fixtures.
 */
export function fixturesEnabled(env: Record<string, string | undefined> = process.env): boolean {
  if (env.DATA_FIXTURES !== '1') return false;
  if (env.VERCEL_ENV === 'production') {
    throw new Error('DATA_FIXTURES is set in production. Remove it from the production environment.');
  }
  return true;
}
