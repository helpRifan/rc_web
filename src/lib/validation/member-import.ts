// The member import (spec 7.3, plan Task 16): Google Form responses (CSV) to member rows. Pure
// functions, shared by scripts/import-members.ts and, later, the admin's Import members tool.
import { z } from 'zod';
import { DIVISIONS } from '@/lib/divisions';

/** The Form's tag list (spec 7.1). Anything else a member typed is kept as one "Other: …" tag. */
export const MEMBER_TAGS = [
  'Mechanical design / CAD',
  'Embedded systems',
  'PCB design',
  'Electronics',
  'Robotics software (ROS)',
  'Computer vision',
  'AI / ML',
  'Control systems',
  'Drones',
  '3D printing',
  'Fabrication',
  'Web development',
  'App development',
  'UI/UX design',
  'Graphic design',
  'Photo & video',
  'Content writing',
  'Event management',
  'Sponsorship & outreach',
  'Teaching & mentoring',
] as const;

export type ImportField =
  | 'full_name'
  | 'year_of_study'
  | 'degree'
  | 'team'
  | 'level'
  | 'role_title'
  | 'joined_year'
  | 'about'
  | 'tags'
  | 'currently_building'
  | 'fun_fact'
  | 'github_url'
  | 'linkedin_url'
  | 'instagram_url'
  | 'portfolio_url'
  | 'email'
  | 'consent';

/** Form question to field, by the words in its header, so a reworded question still maps. First match wins. */
const HEADER_RULES: [RegExp, ImportField][] = [
  [/e-?mail/i, 'email'],
  [/full name|^name$/i, 'full_name'],
  [/year of study|current year/i, 'year_of_study'],
  [/degree|branch/i, 'degree'],
  [/year you joined|joined/i, 'joined_year'],
  [/^team\b|which team|division/i, 'team'],
  [/^level\b/i, 'level'],
  [/role/i, 'role_title'],
  [/about you|^about\b|bio/i, 'about'],
  [/currently building/i, 'currently_building'],
  [/fun fact/i, 'fun_fact'],
  [/github/i, 'github_url'],
  [/linkedin/i, 'linkedin_url'],
  [/instagram/i, 'instagram_url'],
  [/portfolio|website/i, 'portfolio_url'],
  [/consent|ok to show|okay to show/i, 'consent'],
  [/tags?\b|work on|interests/i, 'tags'],
];

/** Without these the import can't run: a name to show, an email to upsert by, a team to file them under. */
export const REQUIRED_FIELDS: ImportField[] = ['full_name', 'email', 'team'];

export function mapHeaders(headers: string[]): { columns: Map<ImportField, number>; missing: ImportField[] } {
  const columns = new Map<ImportField, number>();
  headers.forEach((header, index) => {
    const field = HEADER_RULES.find(([pattern, f]) => pattern.test(header.trim()) && !columns.has(f))?.[1];
    if (field) columns.set(field, index);
  });
  return { columns, missing: REQUIRED_FIELDS.filter(field => !columns.has(field)) };
}

/** RFC 4180 CSV: quoted fields, doubled quotes, commas and line breaks inside quotes, CRLF or LF. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const source = text.replace(/^﻿/, '');
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter(r => r.some(cell => cell.trim() !== ''));
}

export type MemberLevel = 'board' | 'head' | 'lead' | 'core' | 'member';
export type MemberDivision = (typeof DIVISIONS)[number]['id'] | 'alumni' | 'none';

export type ImportedMember = {
  full_name: string;
  email: string;
  level: MemberLevel;
  division: MemberDivision;
  role_title: string | null;
  year_of_study: string | null;
  degree: string | null;
  joined_year: number | null;
  about: string | null;
  tags: string[];
  currently_building: string | null;
  fun_fact: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  portfolio_url: string | null;
  consent: boolean;
};

export type RowResult = {
  /** The sheet's row number (the header is row 1). */
  row: number;
  member: ImportedMember | null;
  /** Problems that stop the row from importing. */
  errors: string[];
  /** Problems the import worked around (a dropped link, extra tags). */
  warnings: string[];
};

const clean = (value: string | undefined) => {
  const text = value?.replace(/\s+/g, ' ').trim();
  return text ? text : null;
};

/** Team answer to division (and level, for the Board). */
export function teamOf(answer: string): { division: MemberDivision; board: boolean } | null {
  const text = answer.trim().toLowerCase();
  if (text === 'board') return { division: 'none', board: true };
  if (text === 'alumni') return { division: 'alumni', board: false };
  const division = DIVISIONS.find(d => d.label.toLowerCase() === text || d.id === text);
  return division ? { division: division.id, board: false } : null;
}

const LEVELS: Record<string, MemberLevel> = { head: 'head', lead: 'lead', core: 'core', 'core team': 'core', 'core member': 'core', member: 'member' };

/** Known tags (any case), then everything else as one "Other: …" tag, then at most three. */
export function parseTags(answer: string | undefined): { tags: string[]; extra: number } {
  if (!answer?.trim()) return { tags: [], extra: 0 };
  const known: string[] = [];
  const other: string[] = [];
  for (const piece of answer.split(',').map(p => p.trim()).filter(Boolean)) {
    const tag = MEMBER_TAGS.find(t => t.toLowerCase() === piece.toLowerCase());
    if (tag) {
      if (!known.includes(tag)) known.push(tag);
    } else {
      other.push(piece.replace(/^other:\s*/i, ''));
    }
  }
  const all = other.length ? [...known, `Other: ${other.join(', ')}`.slice(0, 60)] : known;
  return { tags: all.slice(0, 3), extra: Math.max(0, all.length - 3) };
}

const HTTPS_URL = z.url({ protocol: /^https$/ });

/** A profile link as https, or null. Bare domains ("github.com/x") get https://; http and junk are dropped. */
export function normaliseLink(answer: string | undefined): { url: string | null; dropped: boolean } {
  const text = clean(answer);
  if (!text) return { url: null, dropped: false };
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text.replace(/^\/+/, '')}`;
  const parsed = HTTPS_URL.safeParse(candidate);
  return parsed.success && /\./.test(new URL(candidate).hostname) ? { url: candidate, dropped: false } : { url: null, dropped: true };
}

const LIMITS = { full_name: 80, role_title: 60, about: 300, currently_building: 80, fun_fact: 100 } as const;
const LINK_FIELDS = ['github_url', 'linkedin_url', 'instagram_url', 'portfolio_url'] as const;
const LINK_LABEL = { github_url: 'GitHub', linkedin_url: 'LinkedIn', instagram_url: 'Instagram', portfolio_url: 'Portfolio' } as const;

export function validateRow(cells: string[], columns: Map<ImportField, number>, row: number, year = new Date().getFullYear()): RowResult {
  const get = (field: ImportField) => {
    const index = columns.get(field);
    return index === undefined ? undefined : cells[index];
  };
  const errors: string[] = [];
  const warnings: string[] = [];

  const full_name = clean(get('full_name'));
  if (!full_name) errors.push('no name');

  const emailText = clean(get('email'))?.toLowerCase() ?? null;
  const email = emailText && z.email().safeParse(emailText).success ? emailText : null;
  if (!email) errors.push(emailText ? 'the email address is not valid' : 'no email address');

  const team = teamOf(get('team') ?? '');
  if (!team) errors.push(clean(get('team')) ? `unknown team "${clean(get('team'))}"` : 'no team');

  let level: MemberLevel = 'member';
  if (team?.board) {
    level = 'board';
  } else {
    const answer = clean(get('level'))?.toLowerCase();
    if (answer && LEVELS[answer]) level = LEVELS[answer];
    else if (answer) warnings.push(`unknown level "${answer}", imported as member`);
    else warnings.push('no level, imported as member');
  }

  const text = {
    full_name,
    role_title: clean(get('role_title')),
    about: clean(get('about')),
    currently_building: clean(get('currently_building')),
    fun_fact: clean(get('fun_fact')),
  };
  for (const [field, max] of Object.entries(LIMITS) as [keyof typeof LIMITS, number][]) {
    const value = text[field];
    if (value && value.length > max) errors.push(`${field.replace('_', ' ')} is ${value.length} characters; the limit is ${max}`);
  }

  const yearText = clean(get('joined_year'));
  const joined = yearText ? Number.parseInt(yearText.match(/\d{4}/)?.[0] ?? '', 10) : null;
  const joined_year = joined && joined >= 2015 && joined <= year ? joined : null;
  if (yearText && !joined_year) warnings.push(`joined year "${yearText}" was not used`);

  const { tags, extra } = parseTags(get('tags'));
  if (extra) warnings.push(`${tags.length + extra} tags; kept the first 3`);

  const links = {} as Record<(typeof LINK_FIELDS)[number], string | null>;
  for (const field of LINK_FIELDS) {
    const { url, dropped } = normaliseLink(get(field));
    links[field] = url;
    if (dropped) warnings.push(`${LINK_LABEL[field]} link dropped (only https links are kept)`);
  }

  const consentText = clean(get('consent'));
  const consent = Boolean(consentText) && !/^no\b/i.test(consentText!);

  if (errors.length || !full_name || !email || !team) return { row, member: null, errors, warnings };
  return {
    row,
    errors,
    warnings,
    member: {
      full_name,
      email,
      level,
      division: team.division,
      role_title: text.role_title,
      year_of_study: clean(get('year_of_study')),
      degree: clean(get('degree')),
      joined_year,
      about: text.about,
      tags,
      currently_building: text.currently_building,
      fun_fact: text.fun_fact,
      ...links,
      consent,
    },
  };
}

/** Lower case, no accents, single spaces: for matching names. */
export function normaliseName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

const PHOTO_EXT = /\.(jpe?g|png|webp|heic|heif)$/i;

/**
 * The respondent's photo among the Form's downloaded uploads, which Google names
 * "<file> - <respondent name>.<ext>". Null when none or more than one match.
 */
export function matchPhoto(files: string[], fullName: string): { file: string | null; candidates: number } {
  const suffix = ` - ${normaliseName(fullName)}`;
  const matches = files.filter(file => PHOTO_EXT.test(file) && normaliseName(file.replace(PHOTO_EXT, '')).endsWith(suffix));
  return { file: matches.length === 1 ? matches[0] : null, candidates: matches.length };
}

/** A URL slug from a name: "Mohamed Rifan Ajmal" gives "mohamed-rifan-ajmal". */
export function slugify(name: string): string {
  return (
    normaliseName(name)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
      .replace(/-+$/, '') || 'member'
  );
}

/** The slug, or the slug with -2, -3… if it's taken. */
export function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
}

export type ExistingMember = { slug: string; full_name: string; role_title: string | null; email: string | null };

/**
 * The seeded launch row this person is (spec 7.3, team brief 8): no email yet, the same first name
 * and the same role. Its slug is kept, so links already shared keep working. Null unless exactly one.
 */
export function matchSeed(member: Pick<ImportedMember, 'full_name' | 'role_title'>, existing: ExistingMember[]): ExistingMember | null {
  const first = normaliseName(member.full_name).split(' ')[0];
  const role = normaliseName(member.role_title ?? '');
  const matches = existing.filter(
    seed => !seed.email && normaliseName(seed.full_name).split(' ')[0] === first && normaliseName(seed.role_title ?? '') === role,
  );
  return matches.length === 1 ? matches[0] : null;
}

/** Published only when the member said yes and sent a photo (spec 7.3). */
export function shouldPublish(member: Pick<ImportedMember, 'consent'>, hasPhoto: boolean): boolean {
  return member.consent && hasPhoto;
}
