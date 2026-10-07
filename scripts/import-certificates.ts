// Imports the TechnoVIT '26 certificates from the owner's folder (spec 7.3, plan Task 18).
//
//   npx tsx scripts/import-certificates.ts <folder> --project dev|prod [--commit]
//
// Without --commit it changes nothing: it reads the folder (never its .env), prints counts per
// event and type, checks them against the 2026-10-01 survey, and writes the review file to
// D:\RC-web-backups (outside the repo: it lists names and emails, for the owner's eyes).
// With --commit it creates any missing TechnoVIT '26 events (unpublished), gives each new
// certificate a public ID, uploads its PDF unchanged to the private `certificates` bucket at
// <event-slug>/<public_id>.pdf, and inserts its row. Rows already imported are kept as they are,
// with their IDs, so running it again only adds what's new.
//
// --project must name the Supabase project the environment points at, so a production run is
// always deliberate. This script prints counts only, never names or emails.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { EVENT_FOLDERS, parseCertificateFolder, SERIES, type CertificateRow } from '../src/lib/certificates/parse-folder';
import { generatePublicId } from '../src/lib/certificates/public-id';
import { toCsv } from '../src/lib/csv';
import { parseServerEnv } from '../src/lib/env-schema';

const PROJECTS = { dev: 'lvmibgzaaegamfesjfsk', prod: 'osjvefbyxwvtycxukcmq' } as const;
/** The 2026-10-01 survey of the folder (spec 7.3). */
const EXPECTED = { total: 321, participation: 293, placed: 28, emails: 54 };
const REVIEW_DIR = 'D:/RC-web-backups';

function usage(): never {
  console.error('usage: npx tsx scripts/import-certificates.ts <folder> --project dev|prod [--commit]');
  process.exit(1);
}

const identity = (r: { event_id: string; type: string; team_name: string | null; name_norm: string }) => `${r.event_id}|${r.type}|${r.team_name ?? ''}|${r.name_norm}`;

function writeReview(rows: CertificateRow[], ids: Map<CertificateRow, string>): string {
  mkdirSync(REVIEW_DIR, { recursive: true });
  const path = join(REVIEW_DIR, `cert-review-${new Date().toISOString().slice(0, 10)}.csv`);
  writeFileSync(
    path,
    toCsv(
      ['event', 'type', 'place', 'team', 'name', 'contact_email', 'issued_on', 'emailed_at', 'public_id', 'pdf_sha256'],
      rows.map(r => [EVENT_FOLDERS[r.eventFolder].title, r.type, r.place ?? '', r.teamName, r.recipientName, r.contactEmail ?? '', r.issuedOn, r.emailedAt ?? '', ids.get(r) ?? '(on commit)', r.pdfSha256]),
    ),
  );
  return path;
}

async function main() {
  const args = process.argv.slice(2);
  const commit = args.includes('--commit');
  const projectIndex = args.indexOf('--project');
  const project = args[projectIndex + 1] as keyof typeof PROJECTS;
  const folder = args.find((arg, i) => !arg.startsWith('--') && i !== projectIndex + 1);
  if (!folder || projectIndex === -1 || !(project in PROJECTS)) usage();

  const { rows, duplicates, numbered, problems } = parseCertificateFolder(resolve(folder));

  console.log(`\nEvent              participation  winner  runner-up`);
  for (const [eventFolder, event] of Object.entries(EVENT_FOLDERS)) {
    const n = (type: string) => rows.filter(r => r.eventFolder === eventFolder && r.type === type).length;
    console.log(`${event.title.padEnd(19)}${String(n('participation')).padStart(13)}${String(n('winner')).padStart(8)}${String(n('runner_up')).padStart(11)}`);
  }
  const count = (type: CertificateRow['type']) => rows.filter(r => r.type === type).length;
  const emails = new Set(rows.map(r => r.contactEmail).filter(Boolean)).size;
  const noEmail = rows.filter(r => !r.contactEmail).length;
  console.log(
    `\n${rows.length} distinct certificates (${count('participation')} participation, ${count('winner') + count('runner_up')} placed), ${emails} distinct contact emails, ${noEmail} with no email.`,
  );
  console.log(`Skipped: ${numbered} numbered bulk copies, ${duplicates} other byte-identical duplicates.`);
  for (const problem of problems) console.log(`note: ${problem}`);
  const matches =
    rows.length === EXPECTED.total &&
    count('participation') === EXPECTED.participation &&
    count('winner') + count('runner_up') === EXPECTED.placed &&
    emails === EXPECTED.emails;
  console.log(
    matches
      ? 'These match the 2026-10-01 survey (321: 293 participation, 28 placed; 54 emails).'
      : 'These differ from the 2026-10-01 survey (321: 293 participation, 28 placed; 54 emails). Check before committing.',
  );

  if (!commit) {
    console.log(`\nReview file (names and emails, for the owner): ${writeReview(rows, new Map())}`);
    console.log('Dry run: nothing was uploaded or written to the database.');
    return;
  }

  loadEnvConfig(process.cwd());
  const env = parseServerEnv(process.env);
  const host = new URL(env.NEXT_PUBLIC_SUPABASE_URL).host;
  if (!host.startsWith(`${PROJECTS[project]}.`)) throw new Error(`--project ${project} doesn't match the environment's Supabase project (${host}).`);
  console.log(`\nCommitting to ${project} (${host}).`);
  const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });

  // The five events, created unpublished if missing (the owner fills them in through the admin).
  const slugs = Object.values(EVENT_FOLDERS).map(e => e.slug);
  const { data: found, error: eventsError } = await db.from('events').select('id, slug').in('slug', slugs);
  if (eventsError) throw new Error(`Reading events failed: ${eventsError.message}`);
  const eventIds = new Map((found ?? []).map(e => [e.slug, e.id as string]));
  for (const event of Object.values(EVENT_FOLDERS)) {
    if (eventIds.has(event.slug)) continue;
    const { data, error } = await db
      .from('events')
      .insert({ slug: event.slug, title: event.title, status: 'completed', series: SERIES, is_published: false })
      .select('id')
      .single();
    if (error) throw new Error(`Creating ${event.title} failed: ${error.message}`);
    eventIds.set(event.slug, data.id);
    console.log(`created the event ${event.title} (unpublished)`);
  }

  const { data: existingRows, error: existingError } = await db
    .from('certificates')
    .select('public_id, event_id, type, team_name, name_norm')
    .in('event_id', [...eventIds.values()]);
  if (existingError) throw new Error(`Reading certificates failed: ${existingError.message}`);
  const existing = new Map((existingRows ?? []).map(r => [identity(r), r.public_id as string]));
  const takenIds = new Set((existingRows ?? []).map(r => r.public_id as string));

  const ids = new Map<CertificateRow, string>();
  let added = 0;
  let kept = 0;
  let failed = 0;
  for (const row of rows) {
    const eventId = eventIds.get(row.eventSlug)!;
    const key = identity({ event_id: eventId, type: row.type, team_name: row.teamName || null, name_norm: row.nameNorm });
    const already = existing.get(key);
    if (already) {
      ids.set(row, already);
      kept++;
      continue;
    }
    let publicId = generatePublicId(Number(row.issuedOn.slice(0, 4)));
    while (takenIds.has(publicId)) publicId = generatePublicId(Number(row.issuedOn.slice(0, 4)));
    takenIds.add(publicId);
    const pdfPath = `${row.eventSlug}/${publicId}.pdf`;
    const upload = await db.storage.from('certificates').upload(pdfPath, readFileSync(row.pdfFile), { contentType: 'application/pdf', upsert: false });
    if (upload.error) {
      failed++;
      console.error(`upload failed (${upload.error.message})`);
      continue;
    }
    const { error } = await db.from('certificates').insert({
      public_id: publicId,
      event_id: eventId,
      type: row.type,
      place: row.place,
      recipient_name: row.recipientName,
      name_norm: row.nameNorm,
      team_name: row.teamName || null,
      contact_email: row.contactEmail,
      email_scope: 'team',
      pdf_path: pdfPath,
      pdf_sha256: row.pdfSha256,
      issued_on: row.issuedOn,
      emailed_at: row.emailedAt ? new Date(row.emailedAt).toISOString() : null,
    });
    if (error) {
      failed++;
      await db.storage.from('certificates').remove([pdfPath]);
      console.error(`insert failed (${error.message})`);
      continue;
    }
    ids.set(row, publicId);
    added++;
  }
  console.log(`\nDone: ${added} added, ${kept} already imported, ${failed} failed.`);
  console.log(`Review file (names, emails and IDs, for the owner): ${writeReview(rows, ids)}`);
  if (failed) process.exitCode = 1;
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
