// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The plan's Global Constraints pin these versions. The lockfile is what actually gets installed.
const EXACT = {
  next: '16.3.8',
  react: '19.2.8',
  'react-dom': '19.2.8',
  '@supabase/ssr': '0.12.7',
  '@supabase/supabase-js': '2.117.2',
  zod: '4.6.5',
  vitest: '5.0.3',
  shadcn: '4.21.0',
} as const;
const MAJOR = { '@vitejs/plugin-react': 5, '@types/node': 26 } as const;

const lock = JSON.parse(readFileSync('package-lock.json', 'utf8')) as { packages: Record<string, { version?: string }> };
const installed = (name: string) => lock.packages[`node_modules/${name}`]?.version;

describe('pinned versions', () => {
  it.each(Object.entries(EXACT))('%s is %s', (name, version) => {
    expect(installed(name)).toBe(version);
  });

  it.each(Object.entries(MAJOR))('%s stays on major %i', (name, major) => {
    expect(Number(installed(name)?.split('.')[0])).toBe(major);
  });
});
