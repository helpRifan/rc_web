// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Runs scripts/check-client-bundle.mjs against a fake build in a temp folder.
const SCRIPT = resolve('scripts/check-client-bundle.mjs');
const FAKE_SECRET = 'sb_secret_TESTONLY_not_a_real_key_0000';
let root: string;

function put(path: string, text: string) {
  const full = join(root, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, text);
}

function check() {
  const env = { ...process.env, SUPABASE_SECRET_KEY: FAKE_SECRET };
  const run = spawnSync(process.execPath, [SCRIPT], { cwd: root, env, encoding: 'utf8' });
  return { status: run.status, output: `${run.stdout}${run.stderr}` };
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'bundle-check-'));
  put('.next/static/chunks/app.js', 'console.log("clean")');
  put('.next/server/app/index.html', '<p>clean</p>');
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('check-client-bundle', () => {
  it('passes a clean build', () => {
    const { status, output } = check();
    expect(status).toBe(0);
    expect(output).toMatch(/client bundles are clean/);
  });

  it('ignores supabase-js\'s own startsWith("sb_secret_") check', () => {
    put('.next/static/chunks/supabase.js', 'if (key.startsWith("sb_secret_")) {}');
    expect(check().status).toBe(0);
  });

  // Everything Next serves to browsers as-is: client chunks, styles and source maps, prerendered
  // pages, RSC payloads, route-handler bodies and their headers, and public/.
  it.each([
    '.next/static/chunks/leak.js',
    '.next/static/css/leak.css',
    '.next/static/chunks/leak.js.map',
    '.next/server/app/leak.html',
    '.next/server/app/leak.rsc',
    '.next/server/app/sitemap.xml.body',
    '.next/server/app/sitemap.xml.meta',
    'public/leak.txt',
  ])('fails when %s holds secret material, without printing it', path => {
    put(path, `const k = "${FAKE_SECRET}";`);
    const { status, output } = check();
    expect(status).toBe(1);
    expect(output).toContain(join(...path.split('/')));
    expect(output).not.toContain(FAKE_SECRET);
  });

  it('fails on the key\'s name too', () => {
    put('.next/server/app/api.body', 'process.env.SUPABASE_SECRET_KEY');
    expect(check().status).toBe(1);
  });
});
