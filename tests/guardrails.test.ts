// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = join(__dirname, '..', 'src');
const PALETTE_HEX = new Set(['0d0d0d', '4a8db7', '619ac3', 'e5e8eb', 'bfc7ce', 'ffffff']);
const PALETTE_RGB = new Set(['13,13,13', '74,141,183', '97,154,195', '229,232,235', '191,199,206', '255,255,255']);
const TAILWIND_HUES =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const COLOR_UTIL = 'bg|text|border|ring|fill|stroke|from|via|to|outline|shadow|decoration|divide|placeholder|caret|accent';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    if (!/\.(ts|tsx|css|mjs)$/.test(name) || /\.test\.tsx?$/.test(name) || name === 'database.types.ts') return [];
    return [path];
  });
}

const files = walk(SRC).map(path => ({ path: relative(SRC, path).split(sep).join('/'), text: readFileSync(path, 'utf8') }));
const copyFiles = files.filter(f => f.path.startsWith('app/') || f.path.startsWith('components/site/'));

function find(list: typeof files, pattern: RegExp, allowed: (match: RegExpMatchArray) => boolean = () => false) {
  return list.flatMap(f => [...f.text.matchAll(pattern)].filter(m => !allowed(m)).map(m => `${f.path}: ${m[0]}`));
}

describe('palette guardrail', () => {
  it('uses only logo-palette hex colours', () => {
    expect(find(files, /#([0-9a-fA-F]{3,8})\b/g, m => PALETTE_HEX.has(m[1].toLowerCase()))).toEqual([]);
  });

  // WebGL colours are often numbers (three.js `0xRRGGBB`). Exactly six hex digits, so bit masks and
  // hash constants such as 0x811c9dc5 aren't mistaken for colours.
  it('uses only logo-palette 0xRRGGBB colours', () => {
    expect(find(files, /\b0x([0-9a-fA-F]{6})\b/g, m => PALETTE_HEX.has(m[1].toLowerCase()))).toEqual([]);
  });

  it('uses only logo-palette rgb and rgba triples', () => {
    expect(find(files, /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g, m => PALETTE_RGB.has(`${m[1]},${m[2]},${m[3]}`))).toEqual([]);
  });

  it('uses no other colour functions', () => {
    expect(find(files, /\b(oklch|oklab|hsla?|lab|lch)\(/g)).toEqual([]);
  });

  it('uses no Tailwind default palette colours or pure black', () => {
    const hue = new RegExp(`\\b(?:${COLOR_UTIL})-(?:${TAILWIND_HUES})-\\d{2,3}\\b|\\b(?:${COLOR_UTIL})-black\\b`, 'g');
    expect(find(files, hue)).toEqual([]);
  });
});

describe('anti-slop guardrail', () => {
  it('has no tracked-out capitals in site copy', () => {
    expect(find(copyFiles, /\buppercase\b|\btracking-(?:wide|wider|widest)\b/g)).toEqual([]);
  });

  it('has no arrows, middle dots or spaced em dashes in site copy', () => {
    expect(find(copyFiles, /→|·| — /g)).toEqual([]);
  });

  it('uses Archivo only', () => {
    expect(find(files, /\bfont-mono\b|\bInter\b|JetBrains|\bSyne\b|\bGeist\b/g)).toEqual([]);
  });
});

describe('bundle guardrail', () => {
  // zod is 90 KB in the browser; the forms use lib/validation/email.ts and waitlist-check.ts instead.
  it('keeps zod out of client components', () => {
    const client = files.filter(f => /^\s*['"]use client['"]/.test(f.text));
    // Type-only imports are erased at build time, so they're allowed.
    const value = /^import (?!type\b)[^;]*?from ['"](?:zod|@\/lib\/validation\/(?:waitlist|admin|member-import))['"]/m;
    expect(client.filter(f => value.test(f.text)).map(f => f.path)).toEqual([]);
  });
});
