// Spec 9.3 item 2: the build fails if the secret key's name, anything shaped like an
// `sb_secret_` key, or the key's value reaches anything the browser downloads. Runs after
// `next build` (see package.json). It prints file paths and which rule matched, never the text.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd());

// The bare prefix isn't a rule on its own: supabase-js ships `key.startsWith("sb_secret_")`
// to tell new-format keys from JWTs, so the sign-in chunk always contains it. A key is the
// prefix followed by key characters, which that check (followed by a quote) never is.
const rules = [
  { label: 'the SUPABASE_SECRET_KEY name', test: text => text.includes('SUPABASE_SECRET_KEY') },
  { label: 'an sb_secret_ key', test: text => /sb_secret_[A-Za-z0-9_-]{8,}/.test(text) },
  { label: 'the IMAGEKIT_PRIVATE_KEY name', test: text => text.includes('IMAGEKIT_PRIVATE_KEY') },
];
const secret = process.env.SUPABASE_SECRET_KEY;
if (secret) rules.push({ label: 'the SUPABASE_SECRET_KEY value', test: text => text.includes(secret) });
const imagekit = process.env.IMAGEKIT_PRIVATE_KEY;
if (imagekit) rules.push({ label: 'the IMAGEKIT_PRIVATE_KEY value', test: text => text.includes(imagekit) });

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

if (!existsSync('.next/static')) {
  console.error('No .next/static to check. Run `next build` first.');
  process.exit(1);
}

// Everything served to browsers as-is: every text file under .next/static (chunks, CSS, source
// maps, manifests) and public/, plus what's prerendered under .next/server/app: HTML pages, RSC
// payloads, and route-handler bodies with their header files (.body, .meta), such as a sitemap or
// a cached JSON response. The server-only .js bundles there are never sent, so they're skipped.
const TEXT = /\.(js|mjs|cjs|json|txt|css|map|html|xml|svg|webmanifest|rsc|body|meta)$/;
const PRERENDERED = /\.(html|rsc|body|meta)$/;
const list = (dir, pattern) => (existsSync(dir) ? walk(dir).filter(path => pattern.test(path)) : []);
const clientFiles = [...list('.next/static', TEXT), ...list('.next/server/app', PRERENDERED), ...list('public', TEXT)];

const leaks = clientFiles.flatMap(path => {
  const text = readFileSync(path, 'utf8');
  const matched = rules.filter(rule => rule.test(text)).map(rule => rule.label);
  return matched.length ? [`${path} (${matched.join(', ')})`] : [];
});

if (leaks.length) {
  console.error(`Secret material found in client bundles (values not printed):\n${leaks.join('\n')}`);
  process.exit(1);
}
console.log(`client bundles are clean (${clientFiles.length} files checked)`);
