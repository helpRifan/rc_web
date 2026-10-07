// Imports the members' Google Form responses (spec 7.3, plan Task 16).
//
//   npx tsx scripts/import-members.ts <responses.csv> <photos-dir> [--commit]
//
// <responses.csv> is the responses sheet downloaded as CSV; <photos-dir> is the Form's upload folder,
// downloaded from Drive and unzipped (Google names each file "<file> - <respondent name>").
//
// Without --commit it changes nothing: it reads the sheet, matches photos and existing rows, and
// prints a review table (names, for the owner's own review in this terminal; never emails).
// With --commit it resizes each photo to an 800px WebP, uploads it to ImageKit /rcweb/members/,
// and upserts the member: by email, else onto the seeded launch row with the same first name and
// role (keeping its slug), else as a new member. A member is published only when they ticked
// consent and sent a photo. Rows with errors are skipped.
//
// The Supabase project and keys come from .env.local (or the environment) like the site's; the
// target project's host is printed first, so a run against production is never a surprise.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { FIXTURE_MEMBERS } from '../src/lib/data/fixtures';
import { parseServerEnv, type ServerEnv } from '../src/lib/env-schema';
import {
  type ExistingMember,
  type ImportedMember,
  mapHeaders,
  matchPhoto,
  matchSeed,
  parseCsv,
  type RowResult,
  shouldPublish,
  slugify,
  uniqueSlug,
  validateRow,
} from '../src/lib/validation/member-import';

type Plan = {
  result: RowResult;
  member: ImportedMember | null;
  photo: string | null;
  action: { kind: 'update' | 'seed' | 'new'; slug: string } | null;
  publish: boolean;
};

function usage(): never {
  console.error('usage: npx tsx scripts/import-members.ts <responses.csv> <photos-dir> [--commit]');
  process.exit(1);
}

async function uploadPhoto(env: ServerEnv, file: string, slug: string): Promise<string> {
  const webp = await sharp(file).rotate().resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  const form = new FormData();
  form.set('file', new Blob([new Uint8Array(webp)], { type: 'image/webp' }), `${slug}.webp`);
  form.set('fileName', `${slug}.webp`);
  form.set('folder', '/rcweb/members/');
  form.set('useUniqueFileName', 'false');
  form.set('overwriteFile', 'true');
  const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${env.IMAGEKIT_PRIVATE_KEY}:`).toString('base64')}` },
    body: form,
  });
  if (!res.ok) throw new Error(`ImageKit upload failed with HTTP ${res.status}`);
  const { url } = (await res.json()) as { url: string };
  // A re-upload keeps the URL, so the version busts the CDN's copy of the old photo.
  return `${url}?v=${Date.now().toString(36)}`;
}

async function main() {
  const args = process.argv.slice(2);
  const commit = args.includes('--commit');
  const [csvPath, photosDir] = args.filter(arg => !arg.startsWith('--'));
  if (!csvPath || !photosDir) usage();

  loadEnvConfig(process.cwd());
  const env = parseServerEnv(process.env);
  // DATA_FIXTURES=1: a rehearsal against the fixture roster, with no database at all.
  const rehearsal = process.env.DATA_FIXTURES === '1';
  if (commit && rehearsal) throw new Error('--commit writes to the database; unset DATA_FIXTURES first.');
  if (commit && !env.IMAGEKIT_PRIVATE_KEY) throw new Error('--commit needs IMAGEKIT_PRIVATE_KEY (see .env.example).');
  console.log(
    rehearsal
      ? 'Rehearsal against the fixture roster (DATA_FIXTURES=1): nothing is read from or written to the database.'
      : `Supabase project: ${new URL(env.NEXT_PUBLIC_SUPABASE_URL).host}${commit ? '' : ' (dry run: nothing is written)'}`,
  );

  const rows = parseCsv(readFileSync(resolve(csvPath), 'utf8'));
  if (rows.length < 2) throw new Error('The sheet has no responses.');
  const { columns, missing } = mapHeaders(rows[0]);
  if (missing.length) throw new Error(`The sheet has no column for: ${missing.join(', ')}.`);

  const photoFiles = readdirSync(resolve(photosDir)).filter(
    name => /\.(jpe?g|png|webp|heic|heif)$/i.test(name) && statSync(join(resolve(photosDir), name)).isFile(),
  );
  const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
  let existing: (ExistingMember & { photo_url: string | null })[];
  if (rehearsal) {
    existing = FIXTURE_MEMBERS.map(({ slug, full_name, role_title, photo_url }) => ({ slug, full_name, role_title, email: null, photo_url }));
  } else {
    const { data, error } = await db.from('members').select('slug, full_name, role_title, email, photo_url');
    if (error) throw new Error(`Reading members failed: ${error.message}`);
    existing = data ?? [];
  }
  const taken = new Set(existing.map(m => m.slug));
  const claimedSeeds = new Set<string>();

  // Later answers win: a member who filled the Form twice is imported once, from their last answer.
  const results = rows.slice(1).map((cells, i) => validateRow(cells, columns, i + 2));
  const lastRowForEmail = new Map<string, number>();
  for (const result of results) if (result.member) lastRowForEmail.set(result.member.email, result.row);

  const plans: Plan[] = results.map(result => {
    const member = result.member;
    if (!member) return { result, member, photo: null, action: null, publish: false };
    if (lastRowForEmail.get(member.email) !== result.row) {
      result.errors.push(`answered again in row ${lastRowForEmail.get(member.email)}; that answer is used`);
      return { result, member: null, photo: null, action: null, publish: false };
    }
    const { file, candidates } = matchPhoto(photoFiles, member.full_name);
    if (candidates > 1) result.warnings.push(`${candidates} photos match this name; none was used`);
    if (!file && candidates === 0) result.warnings.push('no photo found');
    const byEmail = existing.find(m => m.email?.toLowerCase() === member.email);
    let action: Plan['action'];
    // A photo already on file counts, so an answer without one doesn't unpublish them.
    let photoOnFile = Boolean(byEmail?.photo_url);
    if (byEmail) {
      action = { kind: 'update', slug: byEmail.slug };
    } else {
      const seed = matchSeed(member, existing.filter(m => !claimedSeeds.has(m.slug)));
      if (seed) {
        claimedSeeds.add(seed.slug);
        photoOnFile = Boolean(existing.find(m => m.slug === seed.slug)?.photo_url);
        action = { kind: 'seed', slug: seed.slug };
      } else {
        const slug = uniqueSlug(slugify(member.full_name), taken);
        taken.add(slug);
        action = { kind: 'new', slug };
      }
    }
    return { result, member, photo: file ? join(resolve(photosDir), file) : null, action, publish: shouldPublish(member, Boolean(file) || photoOnFile) };
  });

  console.log('\nRow  Name                      Team               Photo  Publish  Action');
  for (const plan of plans) {
    const { result, member, action } = plan;
    const name = (member?.full_name ?? '(not imported)').slice(0, 24).padEnd(24);
    const team = (member ? (member.level === 'board' ? 'board' : `${member.division}/${member.level}`) : '').slice(0, 18).padEnd(18);
    const what = action ? `${action.kind === 'seed' ? 'fills seeded' : action.kind} /team/${action.slug}` : 'skipped';
    console.log(`${String(result.row).padStart(3)}  ${name}  ${team} ${plan.photo ? 'yes  ' : 'no   '}  ${plan.publish ? 'yes    ' : 'no     '}  ${what}`);
    for (const message of result.errors) console.log(`       error: ${message}`);
    for (const message of result.warnings) console.log(`       note: ${message}`);
  }
  const ok = plans.filter(p => p.member && p.action);
  console.log(
    `\n${results.length} responses: ${ok.length} to import (${ok.filter(p => p.publish).length} published), ${results.length - ok.length} skipped, ${
      photoFiles.length - ok.filter(p => p.photo).length
    } photo(s) not matched to anyone.`,
  );
  if (!commit) {
    console.log('Dry run. Fix the errors in the sheet if needed, then run again with --commit.');
    return;
  }

  let failed = 0;
  for (const plan of ok) {
    const member = plan.member!;
    const { kind, slug } = plan.action!;
    try {
      const photo_url = plan.photo ? await uploadPhoto(env, plan.photo, slug) : undefined;
      const { consent, ...fields } = member;
      const record = {
        ...fields,
        ...(photo_url ? { photo_url } : {}),
        consent_at: consent ? new Date().toISOString() : null,
        is_published: plan.publish,
      };
      const query =
        kind === 'new' ? db.from('members').insert({ ...record, slug }) : db.from('members').update(record).eq('slug', slug);
      const { error: writeError } = await query;
      if (writeError) throw new Error(writeError.message);
      console.log(`row ${plan.result.row}: ${kind === 'new' ? 'added' : 'updated'} /team/${slug}${plan.publish ? ', published' : ''}`);
    } catch (err) {
      failed++;
      console.error(`row ${plan.result.row}: failed (${err instanceof Error ? err.message : String(err)})`);
    }
  }
  console.log(`\nDone: ${ok.length - failed} written, ${failed} failed.`);
  if (failed) process.exitCode = 1;
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
