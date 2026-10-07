// Reads the owner's TechnoVIT '26 certificates folder (spec 7.3) into one row per distinct PDF.
// Node only (scripts/import-certificates.ts). Never returns or logs anything from a .env file.
//
// The folder, as the owner's scripts left it:
//   <EventFolder>/<group>/<team>/<Name>_<EventToken>.pdf   participation, with <team>/email.txt
//   <EventFolder>/<bulk folder>/<n>.pdf                     Canva's numbered copies of the same PDFs
//   Winners&Runnerups/<EventFolder>/<1st|2nd|3rd>/<Name>_<EventFolder>_<place>.pdf, with email.txt
//   Winners&Runnerups/winners_manifest.json                 name, team and email per winner PDF
//   python/send_log.json                                    what was emailed, and when
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, sep } from 'node:path';
import { normalizeEmail, normalizeName } from './normalize';

/** The five TechnoVIT '26 events, by the owner's folder names. */
export const EVENT_FOLDERS: Record<string, { slug: string; title: string }> = {
  LFR: { slug: 'line-follower', title: 'Line Follower' },
  Obstaclerace: { slug: 'obstacle-race', title: 'Obstacle Race' },
  Roborace: { slug: 'robo-race', title: 'Robo Race' },
  RoboSoccer: { slug: 'robo-soccer', title: 'Robo Soccer' },
  Robosumo: { slug: 'robo-sumo', title: 'Robo Sumo' },
};
export const SERIES = "TechnoVIT '26";
const WINNERS = 'Winners&Runnerups';
const PLACES: Record<string, { type: 'winner' | 'runner_up'; place: number }> = {
  '1st': { type: 'winner', place: 1 },
  '2nd': { type: 'runner_up', place: 2 },
  '3rd': { type: 'runner_up', place: 3 },
};

export type CertificateRow = {
  eventFolder: string;
  eventSlug: string;
  type: 'participation' | 'winner' | 'runner_up';
  place: number | null;
  recipientName: string;
  nameNorm: string;
  teamName: string;
  contactEmail: string | null;
  /** The PDF on disk (never printed by the import; it holds the person's name). */
  pdfFile: string;
  pdfSha256: string;
  issuedOn: string;
  emailedAt: string | null;
};

export type FolderParse = { rows: CertificateRow[]; duplicates: number; numbered: number; problems: string[] };

type SendEntry = { timestamp: string };
type WinnerEntry = { event_folder: string; place_folder: string; team: string; name: string; email: string };

const NUMBERED = /^\d+\.pdf$/i;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    if (name.startsWith('.env')) return [];
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function readJson<T>(path: string, fallback: T): T {
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as T) : fallback;
}

/** The one address in a team folder's email.txt, or null. */
function teamEmail(folder: string): string | null {
  const path = join(folder, 'email.txt');
  if (!existsSync(path)) return null;
  const address = readFileSync(path, 'utf8')
    .split(/[\s,;]+/)
    .find(part => part.includes('@'));
  return address ? normalizeEmail(address) : null;
}

const sha256 = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');
/** "Alice Example_LineFollower" gives "Alice Example". */
const nameFromFile = (file: string) => basename(file).replace(/\.pdf$/i, '').split('_')[0].replace(/\s+/g, ' ').trim();
// Among byte-identical copies the first one seen is kept, so plain names ("Test_X.pdf") go before
// copies ("Test copy_X.pdf"): shorter file names first, then by path.
const byPlainName = (a: string, b: string) => basename(a).length - basename(b).length || a.localeCompare(b);
const cleanForFile = (name: string) => [...name].filter(c => /[\p{L}\p{N} ._-]/u.test(c)).join('').trim();

export function parseCertificateFolder(root: string, { fallbackIssuedOn = '2026-09-17' } = {}): FolderParse {
  const sendLog = readJson<Record<string, SendEntry>>(join(root, 'python', 'send_log.json'), {});
  const manifest = readJson<WinnerEntry[]>(join(root, WINNERS, 'winners_manifest.json'), []);
  const sentDates = Object.values(sendLog)
    .map(entry => entry.timestamp?.slice(0, 10))
    .filter(Boolean)
    .sort();
  // Certificates that were never emailed (the winners' participation PDFs) were issued with the rest.
  const issuedDefault = sentDates[0] ?? fallbackIssuedOn;
  const sent = (category: string, event: string, team: string) => sendLog[`${category}_${event}_${team}`]?.timestamp ?? null;

  const rows: CertificateRow[] = [];
  const problems: string[] = [];
  const seen = new Set<string>();
  let duplicates = 0;
  let numbered = 0;

  const add = (row: Omit<CertificateRow, 'pdfSha256' | 'nameNorm'>) => {
    const pdfSha256 = sha256(row.pdfFile);
    if (seen.has(pdfSha256)) {
      duplicates++;
      return;
    }
    seen.add(pdfSha256);
    rows.push({ ...row, pdfSha256, nameNorm: normalizeName(row.recipientName) });
  };

  for (const [eventFolder, event] of Object.entries(EVENT_FOLDERS)) {
    const dir = join(root, eventFolder);
    if (!existsSync(dir)) {
      problems.push(`no folder for ${event.title}`);
      continue;
    }
    for (const file of walk(dir).filter(f => f.toLowerCase().endsWith('.pdf')).sort(byPlainName)) {
      if (NUMBERED.test(basename(file))) {
        numbered++;
        continue;
      }
      const parts = relative(dir, file).split(sep);
      if (parts.length !== 3) {
        problems.push(`${event.title}: a PDF outside a team folder was skipped`);
        continue;
      }
      const teamDir = dirname(file);
      const teamName = basename(teamDir).replace(/\s+/g, ' ').trim();
      const emailedAt = sent('participant', eventFolder, basename(teamDir));
      add({
        eventFolder,
        eventSlug: event.slug,
        type: 'participation',
        place: null,
        recipientName: nameFromFile(file),
        teamName,
        contactEmail: teamEmail(teamDir),
        pdfFile: file,
        issuedOn: emailedAt?.slice(0, 10) ?? issuedDefault,
        emailedAt,
      });
    }
  }

  const winnersDir = join(root, WINNERS);
  if (existsSync(winnersDir)) {
    for (const file of walk(winnersDir).filter(f => f.toLowerCase().endsWith('.pdf')).sort(byPlainName)) {
      if (NUMBERED.test(basename(file))) {
        numbered++;
        continue;
      }
      const parts = relative(winnersDir, file).split(sep);
      const [eventFolder, placeFolder] = parts;
      const event = EVENT_FOLDERS[eventFolder];
      const place = PLACES[placeFolder];
      if (parts.length !== 3 || !event || !place) {
        problems.push('a winner PDF outside an <event>/<place> folder was skipped');
        continue;
      }
      const fileName = nameFromFile(file);
      const entry = manifest.find(m => m.event_folder === eventFolder && m.place_folder === placeFolder && cleanForFile(m.name) === fileName);
      if (!entry) problems.push(`${event.title} ${placeFolder}: a winner PDF has no manifest entry; its file name was used`);
      const teamName = (entry?.team ?? '').replace(/\s+/g, ' ').trim();
      const emailedAt = entry ? sent('winner', eventFolder, entry.team) : null;
      add({
        eventFolder,
        eventSlug: event.slug,
        type: place.type,
        place: place.place,
        recipientName: (entry?.name ?? fileName).replace(/\s+/g, ' ').trim(),
        teamName,
        contactEmail: entry?.email ? normalizeEmail(entry.email) : teamEmail(dirname(file)),
        pdfFile: file,
        issuedOn: emailedAt?.slice(0, 10) ?? issuedDefault,
        emailedAt,
      });
    }
  }

  return { rows, duplicates, numbered, problems };
}
