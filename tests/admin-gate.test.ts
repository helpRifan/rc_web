// @vitest-environment node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

// Spec 9.2: every admin read and write re-checks the admins table on the server. The proxy only
// sees "some Supabase session", and a layout's check doesn't guard its pages (Next can render a
// page without running its layout), so each admin page, route handler and action file checks for
// itself. Sign-in, the OAuth callback and sign-out are the only parts reachable without being an admin.
const ROOTS = ['src/app/admin', 'src/app/api/admin'];
const EXEMPT = new Set([
  'src/app/admin/sign-in/page.tsx',
  'src/app/admin/auth/callback/route.ts',
  'src/app/admin/(protected)/actions.ts', // signOut: any session may end itself
]);
const GATED = /(^|\/)(page\.tsx|route\.ts|actions\.ts)$/;
const CHECK = /await\s+require(Admin|Owner)\(\)/;

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = ROOTS.flatMap(walk)
  .map(path => relative(process.cwd(), path).split(sep).join('/'))
  .filter(path => GATED.test(path) && !path.includes('.test.'));

describe('admin gate', () => {
  it('finds the admin pages', () => {
    expect(files).toContain('src/app/admin/(protected)/page.tsx');
  });

  it.each(files.filter(path => !EXEMPT.has(path)))('%s re-checks admin status itself', path => {
    expect(readFileSync(path, 'utf8')).toMatch(CHECK);
  });
});
