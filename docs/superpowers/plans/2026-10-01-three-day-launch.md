# Robotics Club site: 3-day launch plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Launch the rebuilt VIT Chennai Robotics Club site by the end of 3 October 2026. That means every public page with its centrepiece, certificates, and a light admin, on real content only.

**Architecture:** Next.js 16 App Router on Vercel, with public pages as ISR server components. All database access runs server-side with the Supabase secret key: RLS is on and the browser has no grants. Google sign-in (Supabase, PKCE, cookies) gates `/admin`, and every admin read and write re-checks the `admins` table. React Bits WebGL pieces load client-only, after first paint, over server-rendered text.

**Tech Stack:**
- **Framework:** Next.js 16.3.8, React 19.2.8, TypeScript 5 (strict).
- **Styling and UI:** Tailwind v4 (CSS-first `@theme`); shadcn 4.21.0 (base-nova, Base UI); React Bits (MIT + Commons Clause); lucide-react; Archivo via `next/font`.
- **Data and auth:** @supabase/ssr 0.12.7, @supabase/supabase-js 2.117.2, zod 4.6.5.
- **Services:** ImageKit, Resend.
- **Testing:** Vitest 5 + Testing Library + jsdom; Playwright 1.63 (installed Chrome) + axe; puppeteer-core for GPU screenshots.

**Spec:** `docs/superpowers/specs/2026-10-01-rc-web-rebuild-design.md`. Read it alongside this plan. The spec wins on behaviour; this plan wins on sequencing and launch scope.

**How detailed each day is:** Day 1 tasks carry full code, because they set the patterns everything else copies (tokens, the field, env, clients, auth, security). Day 2 and Day 3 tasks give files, interfaces, the tests to write and acceptance checks. Their code is written at execution time following Day 1's patterns. This trade was made on purpose to fit the owner's 3-day deadline.

---

## Launch scope (3-day cut)

| At launch (3 Oct) | Right after launch |
|---|---|
| All public pages in spec §6 with their §4.4 centrepieces | Admin ImageKit upload widget. At launch, admins paste ImageKit URLs, and the import scripts upload photos. |
| Certificates: import, verify, PDF download, "find my certificates" by email (needs the Resend domain, owner action A1) | Certificate admin: revoke and resend-link screens (a script covers these at launch) |
| Light admin: sign-in gate, events, gallery, members, partners, recruitment setting, waitlist list and CSV export | Admins management UI (the four owners are seeded), request-access email |
| Member import as a **script** from the Google Form CSV and photo zip (not the admin tool in spec §7.3) | Member import as an admin tool |
| Checks: local `npm run verify` plus Vercel builds; the bundle secret check runs inside `npm run build` | GitHub Actions CI (spec §11) |
| | Certificate announcement email (needs owner approval anyway) |

## Owner actions (the critical path)

| # | What | Needed by | Why |
|---|---|---|---|
| A1 | A domain for email. Tell me the club domain, or buy one (for example on Namecheap or GoDaddy). I then add Resend's DNS records with you. | End of Day 1 | Resend only sends to other people's inboxes from a verified domain. Without one, "Find my certificates" can't launch. |
| A2 | Send the member Google Form, due the night of Day 2 | Today | The Team page shows only members who answered, gave consent and sent a photo. |
| A3 | Paste secrets into `D:\RCweb-next\.env.local`: the `rcweb-dev` secret key (Supabase dashboard, then Settings, then API Keys, then "Create secret key"); later the ImageKit private key and the Resend API key | Task 5 (Day 1); ImageKit by Day 2; Resend by Day 3 | Claude never handles secret values. |
| A4 | Turn on Google sign-in for `rcweb-dev`. In Google Cloud, add `https://lvmibgzaaegamfesjfsk.supabase.co/auth/v1/callback` to the OAuth client's redirect URIs. In Supabase, open Auth, then Providers, then Google, and paste the client ID and secret. | Task 8 (Day 1) | Admin sign-in |
| A5 | Say yes to creating the GitHub repo `helpRifan/rcweb-next` and the Vercel project, then add env vars in Vercel | Task 10 (end of Day 1) | Preview links for review |
| A6 | Content: descriptions, dates and covers for the five TechnoVIT '26 events; captions for the nine photos; the six division one-liners; the real partners | Morning of Day 3 | Anything missing stays hidden, never faked. |
| A7 | Live reviews: Home (end of Day 1); every public page (end of Day 2); certificates and admin (midday Day 3) | As listed | Quality gate §4.7 item 5 |

## Global Constraints

- Colours are the club logo palette only: `#0D0D0D`, `#4A8DB7`, `#619AC3`, `#E5E8EB`, `#BFC7CE`, `#FFFFFF`. Tints of these at reduced opacity are allowed. No other hue anywhere, including shaders, glows, errors and success states.
- Text on `#619AC3`/`#4A8DB7` buttons is `#0D0D0D`. Blue text only on black. Errors and success are shown with an icon plus words, never colour alone.
- One family: Archivo (variable, width 62–125, weight 100–900), self-hosted through `next/font`. No monospace text. None of Inter, JetBrains Mono, Syne or Geist.
- Display h1: width 125%, weight 800, `clamp(44px, 6vw, 88px)`, line-height 1.0. Section headings: width 118%, weight 800, 28–40px. Body: 17–18px desktop, 16px mobile, line-height 1.55, lines of at most 80 characters. UI labels: width 100–105%, weight 600, 14–15px.
- Anti-slop:
  - no tracked-out ALL-CAPS or eyebrow labels;
  - no fake numbered markers;
  - no " · " meta strings, "WORD — fragment" labels or "→" on buttons or links;
  - no one-word headline accents;
  - no fake data;
  - no stock people;
  - no bento, glassmorphism or SaaS card grids;
  - copy is sentence case, active voice, and buttons say what they do.
- One centrepiece per page. The LCP element is server-rendered text or an image, never WebGL. WebGL loads after first paint, only in view. DPR is capped at 2 on desktop and 1.5 on touch. Loops pause when hidden or off-screen. A WebGL failure falls back silently.
- Reduced motion: a still frame instead of loops, no text scrambles, no pinning, no physics. Every interaction still works.
- Budgets: LCP under 2.5 s, CLS under 0.1, first-load JS per route under 250 KB gzipped (lazy WebGL chunks excluded).
- Accessibility:
  - WCAG 2.1 AA;
  - keyboard-only works everywhere;
  - focus ring is 2px `#FFFFFF`, offset 3px;
  - tap targets at least 44px;
  - works from 360px wide;
  - the real headline text is always in the DOM.
- The browser never queries the database. The secret key is used only in `import 'server-only'` modules. RLS is on for every table, with no anon or authenticated grants or policies. The `certificates` bucket is private.
- Every admin mutation re-checks admin status on the server and validates with zod. Admin means a verified email with an exact lower-cased match in `admins`.
- Next 16 conventions:
  - `src/proxy.ts`, not `middleware.ts`;
  - `params`, `searchParams`, `cookies()` and `headers()` are async;
  - `LayoutProps`/`PageProps` global types;
  - read `node_modules/next/dist/docs/` before using an unfamiliar API.
- Caching: public pages use `export const revalidate = 300`, and admin actions call `revalidatePath`. Cache Components stays off.
- Pinned versions: next 16.3.8, react 19.2.8, @supabase/ssr 0.12.7, @supabase/supabase-js 2.117.2, zod 4.6.5, vitest 5.0.3, @vitejs/plugin-react ^5.2.0 (v6 conflicts), @types/node ^26 (^20 conflicts with Vite 8), shadcn 4.21.0.
- Supabase: `rcweb-dev` (`lvmibgzaaegamfesjfsk`) for all development. `rcweb` (`osjvefbyxwvtycxukcmq`) is touched only in Task 24, with the owner's go-ahead. Never touch `qerekbtwimbxrvijrdce`.
- Never open, print or copy secret values. Never open the `.env` in the owner's Certificates folder. Participant data is PII: report counts, never dump names or emails.

## Review Focus

1. **The hero with WebGL unavailable, a lost context, or reduced motion set:** the page renders the headline, copy and buttons over the poster (no WebGL) or a still frame (reduced motion), never a blank or crashed hero. *Pinned in Task 4 (`HeroField.test.tsx`, `FaultyTerminal.test.tsx`) and Task 9 (reduced-motion e2e).*
2. **An open redirect through `next` on sign-in or the callback:** `//evil.com`, `https://evil.com`, `/\evil.com` and `/admin/../x` all land on `/admin`. *Pinned in Task 8 (`admin.test.ts`).*
3. **Admin email variants:** `  Owner@VITstudent.ac.in ` matches the owner. An unverified email, or an email not in the table, is refused and signed out. *Pinned in Task 8.*
4. **Missing or malformed env:** the server refuses to start and names the bad variables, never their values. *Pinned in Task 5 (`env-schema.test.ts`).*
5. **The mobile nav:** Escape closes it and returns focus to the button, a route change closes it, and there's no horizontal overflow at 360 or 390px. *Pinned in Task 3 (`SiteHeader.test.tsx`) and Task 9 (e2e overflow check).*

---

# Day 1 (1 Oct): foundation and the homepage hero, live on a preview link

### Task 1: Scaffold

**Files:**
- Create: the whole Next.js scaffold in `D:\RCweb-next` (keeping the existing `.gitignore` and `docs/`)
- Create: `vitest.config.mts`, `tests/setup.ts`, `tests/stubs/server-only.ts`, `tests/smoke.test.ts`
- Modify: `package.json` (name, engines, scripts)

**Interfaces:**
- Produces: the `@/*` alias for `src/*`; `npm run typecheck | lint | test | test:watch | build`; a Vitest jsdom environment with jest-dom, matchMedia, IntersectionObserver and ResizeObserver stubs; `server-only` stubbed in tests.

- [ ] **Step 1: Scaffold into a temp folder without installing**

```bash
cd D:/ && npx --yes create-next-app@16.3.8 rcweb-next-scaffold --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --disable-git --agents-md --skip-install --yes
```

Expected: `D:\rcweb-next-scaffold` holds `package.json` with `"next": "16.3.8"` and no `babel-plugin-react-compiler`. If the compiler was added, remove it from `package.json` and `next.config.ts`.

- [ ] **Step 2: Move it into the repo, keeping our `.gitignore`**

```bash
rm D:/rcweb-next-scaffold/.gitignore && cp -r D:/rcweb-next-scaffold/. D:/RCweb-next/ && rm -rf D:/rcweb-next-scaffold
```

Then append `/shots/` to `D:\RCweb-next\.gitignore`, for local GPU screenshots.

- [ ] **Step 3: Install pinned dependencies**

```bash
cd D:/RCweb-next && npm install && npm install @supabase/ssr@0.12.7 @supabase/supabase-js@2.117.2 zod@4.6.5 server-only@0.0.1 ogl@^1.0.11 motion@^12.43.0 && npm install -D vitest@5.0.3 @vitejs/plugin-react@^5.2.0 jsdom@^30.1.1 @testing-library/react@^16.3.3 @testing-library/dom@^10.4.2 @testing-library/jest-dom@^7.0.1 @testing-library/user-event@^14.6.7 @types/node@^26.6.3
```

Expected: no ERESOLVE. If npm reports a peer conflict, check that the two known pins (`@vitejs/plugin-react@^5.2.0`, `@types/node@^26`) went in.

- [ ] **Step 4: Set package metadata and scripts**

```bash
cd D:/RCweb-next && npm pkg set name=rcweb-next engines.node=">=22" scripts.typecheck="tsc --noEmit" scripts.test="vitest run" scripts.test:watch="vitest" scripts.verify="npm run typecheck && npm run lint && npm run test && npm run build"
```

- [ ] **Step 5: Write the Vitest config and setup**

`vitest.config.mts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'server-only': fileURLToPath(new URL('./tests/stubs/server-only.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    css: false,
  },
});
```

`tests/stubs/server-only.ts`:
```ts
export {};
```

`tests/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';

if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
  root = null;
  rootMargin = '';
  thresholds = [];
}
if (!('IntersectionObserver' in window)) {
  (window as unknown as { IntersectionObserver: typeof IO }).IntersectionObserver = IO;
}

class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!('ResizeObserver' in window)) {
  (window as unknown as { ResizeObserver: typeof RO }).ResizeObserver = RO;
}
```

`tests/smoke.test.ts`:
```ts
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('runs component tests in jsdom with jest-dom matchers', () => {
  document.body.innerHTML = '<p>ready</p>';
  expect(screen.getByText('ready')).toBeInTheDocument();
});
```

- [ ] **Step 6: Clear the scaffold's boilerplate**

- Delete `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg` and `public/window.svg`.
- Replace `README.md` with a three-line description: what the project is, `npm run dev`, and `npm run verify`.
- Keep `AGENTS.md` and `CLAUDE.md` as generated.

- [ ] **Step 7: Run the checks**

Run: `cd D:/RCweb-next && npm run typecheck && npm run test && npm run lint`
Expected: the smoke test passes (1 test), and there are no type or lint errors.

- [ ] **Step 8: Commit**

```bash
cd D:/RCweb-next && git add -A && git commit -m "Scaffold Next.js 16 app with Vitest"
```

---

### Task 2: Design tokens, Archivo, guardrails

**Files:**
- Create: `components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx` (from shadcn init)
- Replace: `src/app/globals.css`
- Create: `src/lib/palette.ts`
- Modify: `src/app/layout.tsx`
- Test: `tests/guardrails.test.ts`

**Interfaces:**
- Produces:
  - Tailwind colours `rc-bg`, `rc-ink`, `rc-text`, `rc-muted`, `rc-accent`, `rc-accent-deep`, `rc-line` (hairline tint) and `rc-surface` (surface tint), used as `bg-rc-bg`, `text-rc-muted`, `border-rc-line` and so on;
  - the shadcn semantic variables mapped onto the palette;
  - type utilities `type-display`, `type-section`, `type-body`, `type-ui`;
  - `.field-poster`;
  - `PALETTE` in `src/lib/palette.ts`: `{ bg, ink, text, muted, accent, accentDeep }` as hex strings.

- [ ] **Step 1: Write the failing guardrail test**

`tests/guardrails.test.ts`:
```ts
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
```

- [ ] **Step 2: Run it and watch it fail**

Run: `cd D:/RCweb-next && npx vitest run tests/guardrails.test.ts`
Expected: FAIL. "uses Archivo only" flags `app/layout.tsx: Geist`, and the scaffold's `globals.css` hexes fail the palette test.

- [ ] **Step 3: Initialise shadcn**

```bash
cd D:/RCweb-next && npx shadcn@4.21.0 init --defaults --yes
```

Expected: `components.json` has `"style": "base-nova"`, and `src/lib/utils.ts` is `export { cn } from "cn"`. `@base-ui/react`, `class-variance-authority`, `cn`, `lucide-react`, `shadcn` and `tw-animate-css` are installed. If it prompts, choose Next.js, Base UI and base-nova.

- [ ] **Step 4: Replace `src/app/globals.css`**

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

/* Club logo palette only (spec 4.1). Every colour resolves to one of these six or a tint of one. */
@theme {
  --color-rc-bg: #0D0D0D;
  --color-rc-ink: #FFFFFF;
  --color-rc-text: #E5E8EB;
  --color-rc-muted: #BFC7CE;
  --color-rc-accent: #619AC3;
  --color-rc-accent-deep: #4A8DB7;
  --color-rc-line: rgba(191, 199, 206, 0.28);
  --color-rc-surface: rgba(191, 199, 206, 0.06);
}

@theme inline {
  --font-sans: var(--font-archivo), system-ui, sans-serif;
  --font-heading: var(--font-archivo), system-ui, sans-serif;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
}

/* Dark only: there is no light theme (spec 4.1). */
:root {
  color-scheme: dark;
  --background: #0D0D0D;
  --foreground: #E5E8EB;
  --card: #0D0D0D;
  --card-foreground: #E5E8EB;
  --popover: #0D0D0D;
  --popover-foreground: #E5E8EB;
  --primary: #619AC3;
  --primary-foreground: #0D0D0D;
  --secondary: rgba(191, 199, 206, 0.12);
  --secondary-foreground: #FFFFFF;
  --muted: rgba(191, 199, 206, 0.08);
  --muted-foreground: #BFC7CE;
  --accent: rgba(97, 154, 195, 0.16);
  --accent-foreground: #FFFFFF;
  --destructive: #E5E8EB;
  --border: rgba(191, 199, 206, 0.28);
  --input: rgba(191, 199, 206, 0.28);
  --ring: #FFFFFF;
  --chart-1: #619AC3;
  --chart-2: #4A8DB7;
  --chart-3: #BFC7CE;
  --chart-4: #E5E8EB;
  --chart-5: #FFFFFF;
  --radius: 0.5rem;
  --sidebar: #0D0D0D;
  --sidebar-foreground: #E5E8EB;
  --sidebar-primary: #619AC3;
  --sidebar-primary-foreground: #0D0D0D;
  --sidebar-accent: rgba(97, 154, 195, 0.16);
  --sidebar-accent-foreground: #FFFFFF;
  --sidebar-border: rgba(191, 199, 206, 0.28);
  --sidebar-ring: #FFFFFF;
}

@utility type-display {
  font-stretch: 125%;
  font-weight: 800;
  font-size: clamp(2.75rem, 6vw, 5.5rem);
  line-height: 1;
}

@utility type-section {
  font-stretch: 118%;
  font-weight: 800;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  line-height: 1.1;
}

@utility type-body {
  font-size: 1rem;
  line-height: 1.55;
  @media (width >= 48rem) {
    font-size: 1.0625rem;
  }
}

@utility type-ui {
  font-stretch: 102%;
  font-weight: 600;
  font-size: 0.9375rem;
}

/* Poster for the glyph field: shown before WebGL loads and whenever WebGL is unavailable. */
.field-poster {
  background-color: #0D0D0D;
  background-image: radial-gradient(rgba(97, 154, 195, 0.22) 1.2px, transparent 1.6px);
  background-size: 18px 18px;
  mask-image: radial-gradient(ellipse at 70% 45%, #0D0D0D 0%, transparent 75%);
}

@layer base {
  * {
    @apply border-border;
  }
  html {
    @apply font-sans;
    background: #0D0D0D;
  }
  body {
    @apply bg-background text-foreground type-body;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  :focus-visible {
    outline: 2px solid #FFFFFF;
    outline-offset: 3px;
  }
}
```

- [ ] **Step 5: Add `src/lib/palette.ts`** (for props that need raw hex, such as WebGL tints)

```ts
/** The club logo palette (spec 4.1). The only colours allowed anywhere on the site. */
export const PALETTE = {
  bg: '#0D0D0D',
  ink: '#FFFFFF',
  text: '#E5E8EB',
  muted: '#BFC7CE',
  accent: '#619AC3',
  accentDeep: '#4A8DB7',
} as const;
```

- [ ] **Step 6: Replace `src/app/layout.tsx` with Archivo**

```tsx
import type { Metadata } from 'next';
import { Archivo } from 'next/font/google';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'Robotics Club, VIT Chennai', template: '%s | Robotics Club, VIT Chennai' },
  description: 'Students at VIT Chennai who design, wire and program robots, then take them to competitions.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${archivo.variable} antialiased`}>
      <body className="min-h-svh">{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Clean shadcn's output**

Replace any `bg-black`, `oklch(` or other non-palette colour in `src/components/ui/*` with palette tokens (for example `bg-black/50` becomes `bg-rc-bg/80`).

- [ ] **Step 8: Run the checks**

Run: `cd D:/RCweb-next && npx vitest run && npm run typecheck && npm run build`
Expected: all guardrail tests pass. The build succeeds and downloads Archivo at build time, so it's self-hosted.

- [ ] **Step 9: Commit**

```bash
cd D:/RCweb-next && git add -A && git commit -m "Add logo-palette tokens, Archivo and design guardrail tests"
```

---

### Task 3: Site shell (header, footer, 404, icons)

**Files:**
- Create: `src/lib/site.ts`, `src/components/site/SiteHeader.tsx`, `src/components/site/SiteFooter.tsx`, `src/components/site/ButtonLink.tsx`, `src/app/(site)/layout.tsx`, `src/app/not-found.tsx`, `scripts/make-icons.mjs`
- Create (generated): `public/logo.png`, `src/app/icon.png`, `src/app/apple-icon.png`
- Delete: `src/app/page.tsx` (moves to `src/app/(site)/page.tsx` in Task 4). Remove `src/app/favicon.ico`.
- Test: `src/components/site/SiteHeader.test.tsx`, `src/lib/site.test.ts`

**Interfaces:**
- Produces:
  - `SITE: { name, shortName, email, instagram, linkedin }`;
  - `NAV: ReadonlyArray<{ href: string; label: string }>`;
  - `isActive(pathname: string, href: string): boolean`;
  - `<ButtonLink href variant="primary" | "secondary">`, at least 48px tall;
  - `<SiteHeader />` (client), `<SiteFooter />` (server).
- Layout contract: the header is `fixed`, so every page's first section adds its own top padding (`pt-28` or more). The home hero runs full-bleed under the header.

- [ ] **Step 1: Write failing tests**

`src/lib/site.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { isActive, NAV } from './site';

describe('isActive', () => {
  it('matches home only on the exact root', () => {
    expect(isActive('/', '/')).toBe(true);
    expect(isActive('/team', '/')).toBe(false);
  });
  it('matches a section and its children, not prefixes of other words', () => {
    expect(isActive('/team', '/team')).toBe(true);
    expect(isActive('/team/ihsan-hashir', '/team')).toBe(true);
    expect(isActive('/teams', '/team')).toBe(false);
  });
});

it('lists the spec 6 navigation in order', () => {
  expect(NAV.map(n => n.label)).toEqual(['Home', 'Team', 'Events', 'Gallery', 'Certificates', 'Join']);
});
```

`src/components/site/SiteHeader.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const nav = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => nav.pathname }));

import { SiteHeader } from './SiteHeader';

describe('SiteHeader', () => {
  beforeEach(() => { nav.pathname = '/'; });

  it('marks the current section with aria-current', () => {
    nav.pathname = '/events/robo-sumo';
    render(<SiteHeader />);
    const links = screen.getAllByRole('link', { name: 'Events' });
    expect(links[0]).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByRole('link', { name: 'Team' })[0]).not.toHaveAttribute('aria-current');
  });

  it('opens and closes the mobile menu with the button and Escape, returning focus', async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);
    const button = screen.getByRole('button', { name: 'Open menu' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById('mobile-nav')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('mobile-nav')).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  it('closes the mobile menu when the route changes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<SiteHeader />);
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    nav.pathname = '/team';
    rerender(<SiteHeader />);
    expect(document.getElementById('mobile-nav')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run them and watch them fail**

Run: `cd D:/RCweb-next && npx vitest run src/lib/site.test.ts src/components/site/SiteHeader.test.tsx`
Expected: FAIL with "Cannot find module './site'" and "'./SiteHeader'".

- [ ] **Step 3: Implement `src/lib/site.ts`**

```ts
export const SITE = {
  name: 'Robotics Club, VIT Chennai',
  shortName: 'Robotics Club',
  email: 'robotics.club@vit.ac.in',
  instagram: 'https://www.instagram.com/robotics_club_vitc/',
  linkedin: 'https://in.linkedin.com/company/robotics-club-vitc',
} as const;

export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/team', label: 'Team' },
  { href: '/events', label: 'Events' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/certificates', label: 'Certificates' },
  { href: '/join', label: 'Join' },
] as const;

export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
```

- [ ] **Step 4: Implement `src/components/site/SiteHeader.tsx`**

```tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { isActive, NAV, SITE } from '@/lib/site';

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close the menu on navigation (adjusting state during render, not in an effect).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const linkClass =
    'inline-flex min-h-11 items-center font-medium text-rc-muted transition-colors hover:text-rc-ink aria-[current=page]:text-rc-ink';

  return (
    <header className="fixed inset-x-0 top-0 z-30">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-rc-bg/90 via-rc-bg/60 to-transparent" />
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-8">
        <Link href="/" className="inline-flex min-h-11 items-center gap-3 font-bold text-rc-muted transition-colors hover:text-rc-ink [font-stretch:112%]">
          <Image src="/logo.png" alt="" width={34} height={34} priority />
          <span>{SITE.shortName}</span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-6 text-[15px]">
            {NAV.map(item => (
              <li key={item.href}>
                <Link href={item.href} aria-current={isActive(pathname, item.href) ? 'page' : undefined} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          ref={buttonRef}
          type="button"
          className="inline-flex size-11 items-center justify-center text-rc-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(value => !value)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Main" className="relative border-t border-rc-line bg-rc-bg px-4 pb-6 md:hidden">
          <ul className="flex flex-col text-lg">
            {NAV.map(item => (
              <li key={item.href}>
                <Link href={item.href} aria-current={isActive(pathname, item.href) ? 'page' : undefined} className={`${linkClass} min-h-12 w-full`}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
```

- [ ] **Step 5: Implement the footer, button link and layouts**

`src/components/site/ButtonLink.tsx`:
```tsx
import Link from 'next/link';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof Link> & { variant?: 'primary' | 'secondary' };

const VARIANTS = {
  primary: 'bg-rc-accent text-rc-bg hover:bg-rc-accent-deep',
  secondary: 'border border-rc-line text-rc-ink hover:border-rc-muted',
} as const;

export function ButtonLink({ variant = 'primary', className = '', ...props }: Props) {
  return (
    <Link
      {...props}
      className={`type-ui inline-flex min-h-12 items-center justify-center rounded-md px-6 transition-colors ${VARIANTS[variant]} ${className}`}
    />
  );
}
```

`src/components/site/SiteFooter.tsx`:
```tsx
import { SITE } from '@/lib/site';

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-rc-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-rc-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li><a className="inline-flex min-h-11 items-center hover:text-rc-ink" href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
          <li><a className="inline-flex min-h-11 items-center hover:text-rc-ink" href={SITE.instagram} rel="noopener noreferrer" target="_blank">Instagram</a></li>
          <li><a className="inline-flex min-h-11 items-center hover:text-rc-ink" href={SITE.linkedin} rel="noopener noreferrer" target="_blank">LinkedIn</a></li>
        </ul>
        <p>© {year} {SITE.name}</p>
      </div>
    </footer>
  );
}
```

`src/app/(site)/layout.tsx`:
```tsx
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';

export default function SiteLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-rc-bg focus:px-4 focus:py-3 focus:text-rc-ink">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
```

`src/app/not-found.tsx`: plain, with a server-rendered h1 "Page not found", one sentence ("That page doesn't exist or has moved."), and `ButtonLink`s to `/` ("Go to the homepage") and `/events` ("See events"). Wrap it in `SiteHeader` and `SiteFooter` directly, because the root not-found doesn't get the `(site)` layout. The dimmed glyph field is added in Task 15.

- [ ] **Step 6: Generate the logo and icons**

`scripts/make-icons.mjs`:
```js
import sharp from 'sharp';

const SOURCE = 'D:/RC-web/public/logo-nobg.png';
await sharp(SOURCE).resize(256, 256).png({ compressionLevel: 9 }).toFile('public/logo.png');
await sharp(SOURCE).resize(512, 512).png({ compressionLevel: 9 }).toFile('src/app/icon.png');
await sharp(SOURCE).resize(180, 180).flatten({ background: '#0D0D0D' }).png().toFile('src/app/apple-icon.png');
console.log('icons written');
```

Run: `cd D:/RCweb-next && node scripts/make-icons.mjs && rm -f src/app/favicon.ico`
Expected: "icons written", and `public/logo.png` is under 60 KB.

- [ ] **Step 7: Run the tests and guardrails**

Run: `cd D:/RCweb-next && npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
cd D:/RCweb-next && git add -A && git commit -m "Add site header, footer, 404 and icons"
```

---

### Task 4: React Bits and the homepage hero

**Files:**
- Create (via registry): `src/components/reactbits/FaultyTerminal.tsx`, `src/components/reactbits/DecryptedText.tsx`
- Modify: `src/components/reactbits/FaultyTerminal.tsx` (port the approved prototype's behaviour)
- Create: `src/hooks/use-prefers-reduced-motion.ts`, `src/hooks/use-field-mode.ts`, `src/components/site/ScrambleHeading.tsx`, `src/components/site/home/field-layout.ts`, `src/components/site/home/HeroField.tsx`, `src/components/site/home/HomeHero.tsx`, `src/app/(site)/page.tsx`, `THIRD_PARTY_NOTICES.md`, `scripts/shoot.mjs`
- Test: `src/components/reactbits/FaultyTerminal.test.tsx`, `src/hooks/use-field-mode.test.ts`, `src/components/site/ScrambleHeading.test.tsx`, `src/components/site/home/field-layout.test.ts`, `src/components/site/home/HeroField.test.tsx`, `src/components/site/home/HomeHero.test.tsx`

**Interfaces:**
- Consumes: `PALETTE` (Task 2), `ButtonLink` (Task 3).
- Produces:
  - `usePrefersReducedMotion(): boolean`, which is `true` on the server;
  - `type FieldMode = 'webgl' | 'still' | 'poster'`, `resolveFieldMode({ webgl, reducedMotion }): FieldMode`, `useFieldMode(): FieldMode`;
  - `<ScrambleHeading text as?="h1" | "h2" className? />`, used for every page h1 from now on;
  - `fieldLayout(width, height, coarse?): { dpr; scale; gridMul }`;
  - `<HeroField />`, reused dimmed on the 404 in Task 15, which is why it takes a `dim?: boolean` prop.

**Reference:** the owner-approved prototype is `scratchpad/design/.superpowers/brainstorm/2053-1790790106/content/rb-faulty-terminal.html`, lines 1005–1270. Before starting, copy it to `D:\RCweb-next\.superpowers\prototypes\` (git-ignored) so it outlives the session. Its tuned values and loop behaviour are what the owner said yes to.

- [ ] **Step 1: Install the two components from the React Bits registry**

```bash
cd D:/RCweb-next && npx shadcn@4.21.0 add https://reactbits.dev/r/FaultyTerminal-TS-TW https://reactbits.dev/r/DecryptedText-TS-TW --path src/components/reactbits --yes
```

Expected: both files are in `src/components/reactbits/`, and `ogl` and `motion` are in `package.json`.

- [ ] **Step 2: Write the failing FaultyTerminal behaviour test**

`src/components/reactbits/FaultyTerminal.test.tsx`:
```tsx
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const gl = vi.hoisted(() => ({ renderers: 0, renders: 0 }));
vi.mock('ogl', () => {
  class Renderer {
    dpr: number;
    gl = {
      canvas: document.createElement('canvas'),
      clearColor() {},
      getExtension() { return { loseContext() {} }; },
    };
    constructor(options: { dpr: number }) { gl.renderers++; this.dpr = options.dpr; }
    setSize() {}
    render() { gl.renders++; }
  }
  class Program { uniforms: Record<string, { value: unknown }>; constructor(_: unknown, o: { uniforms: Record<string, { value: unknown }> }) { this.uniforms = o.uniforms; } }
  class Mesh {}
  class Triangle {}
  class Color { constructor(...values: number[]) { return values as unknown as Color; } }
  return { Renderer, Program, Mesh, Triangle, Color };
});

import FaultyTerminal from './FaultyTerminal';

let frames: Array<FrameRequestCallback | null> = [];
let io: IntersectionObserverCallback | undefined;
const flush = (n = 3) => {
  for (let i = 0; i < n; i++) {
    const batch = frames; frames = [];
    batch.forEach(cb => cb?.(performance.now()));
  }
};

beforeEach(() => {
  gl.renderers = 0; gl.renders = 0; frames = []; io = undefined;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb));
  vi.stubGlobal('cancelAnimationFrame', (id: number) => { frames[id - 1] = null; });
  vi.stubGlobal('IntersectionObserver', class {
    constructor(cb: IntersectionObserverCallback) { io = cb; }
    observe() {} unobserve() {} disconnect() {}
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('FaultyTerminal (ported loop)', () => {
  it('keeps one WebGL context while pause toggles', () => {
    const { rerender } = render(<FaultyTerminal pause={false} />);
    rerender(<FaultyTerminal pause />);
    rerender(<FaultyTerminal pause={false} />);
    expect(gl.renderers).toBe(1);
  });

  it('renders exactly one frame in still mode', () => {
    render(<FaultyTerminal stillFrame />);
    flush(5);
    expect(gl.renders).toBe(1);
  });

  it('stops rendering when the canvas leaves the viewport', () => {
    render(<FaultyTerminal />);
    flush(2);
    const before = gl.renders;
    expect(before).toBeGreaterThan(0);
    io?.([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
    flush(5);
    expect(gl.renders).toBe(before);
  });
});
```

Run: `cd D:/RCweb-next && npx vitest run src/components/reactbits/FaultyTerminal.test.tsx`
Expected: FAIL. The stock component rebuilds on `pause`, has no `stillFrame` and doesn't stop off-screen.

- [ ] **Step 3: Port the prototype's behaviour into FaultyTerminal**

Keep the registry file's header, shaders and `hexToRgb` untouched. Make these changes:

1. Extend the props (after `lightMode?: boolean;`):
```ts
  /** Recomputes dpr, scale and gridMul from the container size on each resize. Uniforms only; no context rebuild. */
  layout?: (width: number, height: number) => { dpr: number; scale: number; gridMul: Vec2 };
  /** Render one frame and never loop (reduced motion). */
  stillFrame?: boolean;
  /** Where the cursor halo starts, in 0 to 1 container coordinates (y up). */
  initialMouse?: { x: number; y: number };
```
2. Add `const DEFAULT_GRID_MUL: Vec2 = [2, 1];` at module scope and default `gridMul = DEFAULT_GRID_MUL`. An inline `[2, 1]` default is a new array every render, which re-ran the effect and rebuilt the context.
3. Make `dpr` default to `undefined`, and resolve it inside the effect as `const startDpr = layout ? layout(ctn.offsetWidth, ctn.offsetHeight).dpr : (dpr ?? Math.min(window.devicePixelRatio || 1, 2));`.
4. Keep `pause` in a ref (`const pauseRef = useRef(pause); useEffect(() => { pauseRef.current = pause; }, [pause]);`), read `pauseRef.current` in `update`, and **remove `pause` from the effect's dependency list**. Do the same for `initialMouse` (`initialMouseRef`, read once at effect start to seed `mouseRef` and `smoothMouseRef`).
5. Replace the effect body's loop wiring with the prototype's (lines 1090–1208):
   - `renderStill()`, which picks a frame where the glitch band is idle;
   - `resize()`, which applies `layout` to `renderer.dpr`, `uScale` and `uGridMul`;
   - `syncLoop()`, which runs only when `!stillFrame && !document.hidden && inView`;
   - an `IntersectionObserver` on the container;
   - a `visibilitychange` listener;
   - `window` `resize`;
   - `pointermove`/`pointerdown` on **`window`** (passive), because the container sits behind page content;
   - a matching cleanup that also cancels `stillRaf` and removes every listener.
6. `className` becomes ``className={`w-full h-full relative overflow-hidden ${className ?? ''}`}``.
7. Keep every other prop and the uniforms as they are.

Run: `cd D:/RCweb-next && npx vitest run src/components/reactbits/FaultyTerminal.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 4: Write failing tests for the mode hook, the layout and ScrambleHeading**

`src/hooks/use-field-mode.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { resolveFieldMode } from './use-field-mode';

describe('resolveFieldMode', () => {
  it('shows the poster when WebGL is unavailable, whatever the motion setting', () => {
    expect(resolveFieldMode({ webgl: false, reducedMotion: false })).toBe('poster');
    expect(resolveFieldMode({ webgl: false, reducedMotion: true })).toBe('poster');
  });
  it('renders a still frame under reduced motion', () => {
    expect(resolveFieldMode({ webgl: true, reducedMotion: true })).toBe('still');
  });
  it('animates otherwise', () => {
    expect(resolveFieldMode({ webgl: true, reducedMotion: false })).toBe('webgl');
  });
});
```

`src/components/site/home/field-layout.test.ts`:
```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fieldLayout } from './field-layout';

afterEach(() => vi.unstubAllGlobals());

describe('fieldLayout', () => {
  it('keeps the demo glyph size at full screen (1440x900)', () => {
    vi.stubGlobal('devicePixelRatio', 1);
    const l = fieldLayout(1440, 900);
    expect(l.scale).toBeCloseTo(2.7);
    expect(l.gridMul[0]).toBeCloseTo(1.6);
    expect(l.gridMul[1]).toBe(1);
  });
  it('holds the backbuffer near 2.4 megapixels on retina desktops', () => {
    vi.stubGlobal('devicePixelRatio', 2);
    const { dpr } = fieldLayout(1440, 900);
    expect(1440 * 900 * dpr * dpr).toBeLessThanOrEqual(2.4e6 + 1);
    expect(dpr).toBeGreaterThanOrEqual(1);
  });
  it('caps DPR at 1.5 on touch devices', () => {
    vi.stubGlobal('devicePixelRatio', 3);
    expect(fieldLayout(390, 844, true).dpr).toBeLessThanOrEqual(1.5);
  });
});
```

`src/components/site/ScrambleHeading.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScrambleHeading } from './ScrambleHeading';

const TEXT = 'We build robots at VIT Chennai.';

afterEach(() => vi.restoreAllMocks());

describe('ScrambleHeading', () => {
  it('exposes the real text as the heading name, with the scramble hidden from assistive tech', () => {
    const { container } = render(<ScrambleHeading as="h1" text={TEXT} />);
    expect(screen.getByRole('heading', { level: 1, name: TEXT })).toBeInTheDocument();
    expect(container.querySelector('[data-scramble]')).not.toBeNull();
    expect(container.querySelector('[data-scramble]')?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('renders plain text and no scramble under reduced motion', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(query => ({
      matches: query.includes('reduce'), media: query, onchange: null,
      addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false,
    }) as MediaQueryList);
    const { container } = render(<ScrambleHeading as="h1" text={TEXT} />);
    expect(screen.getByRole('heading', { level: 1, name: TEXT })).toBeInTheDocument();
    expect(container.querySelector('[data-scramble]')).toBeNull();
  });
});
```

Run: `cd D:/RCweb-next && npx vitest run src/hooks src/components/site`
Expected: FAIL, because the modules are missing.

- [ ] **Step 5: Implement the hooks, the layout and ScrambleHeading**

`src/hooks/use-prefers-reduced-motion.ts`:
```ts
'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/** True on the server, so server HTML is always the still, readable version. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => true);
}
```

`src/hooks/use-field-mode.ts`:
```ts
'use client';

import { useSyncExternalStore } from 'react';
import { usePrefersReducedMotion } from './use-prefers-reduced-motion';

export type FieldMode = 'webgl' | 'still' | 'poster';

export function resolveFieldMode({ webgl, reducedMotion }: { webgl: boolean; reducedMotion: boolean }): FieldMode {
  if (!webgl) return 'poster';
  return reducedMotion ? 'still' : 'webgl';
}

let webglSupport: boolean | undefined;
function hasWebGL(): boolean {
  if (webglSupport !== undefined) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    webglSupport = Boolean(gl);
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

const noop = () => () => {};

/** 'poster' on the server and when WebGL is missing; 'still' under reduced motion; otherwise 'webgl'. */
export function useFieldMode(): FieldMode {
  const reducedMotion = usePrefersReducedMotion();
  const isClient = useSyncExternalStore(noop, () => true, () => false);
  if (!isClient) return 'poster';
  return resolveFieldMode({ webgl: hasWebGL(), reducedMotion });
}
```

`src/components/site/home/field-layout.ts`:
```ts
type Vec2 = [number, number];

// The React Bits demo was tuned in a 500px-tall box (scale 1.5, gridMul [2, 1]).
// Deriving both from the viewport keeps that glyph size at full screen (owner-approved prototype).
const DEMO_BOX_HEIGHT = 500;
const BACKBUFFER_BUDGET = 2.4e6; // the shader runs digit() 10x per pixel

export function fieldLayout(width: number, height: number, coarse = false): { dpr: number; scale: number; gridMul: Vec2 } {
  const safeH = Math.max(height, 1);
  const k = Math.min(Math.max(safeH / DEMO_BOX_HEIGHT, 1), 3);
  const cap = coarse ? 1.5 : 2;
  let dpr = Math.min(window.devicePixelRatio || 1, cap);
  if (width * height * dpr * dpr > BACKBUFFER_BUDGET) dpr = Math.max(1, Math.sqrt(BACKBUFFER_BUDGET / Math.max(width * height, 1)));
  return { dpr, scale: 1.5 * k, gridMul: [Math.max(width, 1) / safeH, 1] };
}
```

`src/components/site/ScrambleHeading.tsx`:
```tsx
'use client';

import { Fragment } from 'react';
import DecryptedText from '@/components/reactbits/DecryptedText';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

type Props = { text: string; as?: 'h1' | 'h2'; className?: string };

/**
 * Page headline that decrypts once (at most 600ms). Each word's box is sized by its real
 * text, so scrambled glyphs never re-wrap the lines. The real text is always in the DOM.
 */
export function ScrambleHeading({ text, as: Tag = 'h1', className }: Props) {
  const still = usePrefersReducedMotion();
  const words = text.split(' ');
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <Fragment key={i}>
            <span className="relative inline-block whitespace-nowrap">
              <span className={still ? undefined : 'invisible'}>{word}</span>
              {!still && (
                <span data-scramble className="absolute inset-0">
                  <DecryptedText text={word} animateOn="view" speed={40} maxIterations={12} className="text-rc-ink" encryptedClassName="text-rc-accent" />
                </span>
              )}
            </span>
            {i < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
```

Run: `cd D:/RCweb-next && npx vitest run src/hooks src/components/site`
Expected: PASS.

- [ ] **Step 6: Write failing HeroField and HomeHero tests**

`src/components/site/home/HeroField.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { HeroField } from './HeroField';

it('shows the poster and no canvas when WebGL is unavailable (jsdom)', () => {
  const { container } = render(<HeroField />);
  expect(screen.getByTestId('field-poster')).toBeInTheDocument();
  expect(container.querySelector('canvas')).toBeNull();
  expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
});
```

`src/components/site/home/HomeHero.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { HomeHero } from './HomeHero';

it('renders the spec 6.1 headline, copy and actions', () => {
  render(<HomeHero />);
  expect(screen.getByRole('heading', { level: 1, name: 'We build robots at VIT Chennai.' })).toBeInTheDocument();
  expect(screen.getByText(/design, wire and program robots/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'See upcoming events' })).toHaveAttribute('href', '/events');
  expect(screen.getByRole('link', { name: 'Join the club' })).toHaveAttribute('href', '/join');
});
```

Run: `cd D:/RCweb-next && npx vitest run src/components/site/home`
Expected: FAIL, because the modules are missing.

- [ ] **Step 7: Implement HeroField, HomeHero and the page**

`src/components/site/home/HeroField.tsx`:
```tsx
'use client';

import dynamic from 'next/dynamic';
import { Component, type ReactNode } from 'react';
import { useFieldMode } from '@/hooks/use-field-mode';
import { PALETTE } from '@/lib/palette';
import { fieldLayout } from './field-layout';

const FaultyTerminal = dynamic(() => import('@/components/reactbits/FaultyTerminal'), { ssr: false });

/** A WebGL or chunk-load failure falls back silently to the poster underneath. */
class FieldBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

const layout = (w: number, h: number) => fieldLayout(w, h, window.matchMedia('(pointer: coarse)').matches);

export function HeroField({ dim = false }: { dim?: boolean }) {
  const mode = useFieldMode();
  const wide = typeof window !== 'undefined' && window.innerWidth >= 700;
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 z-0 ${dim ? 'opacity-40' : ''}`}>
      <div data-testid="field-poster" className="field-poster absolute inset-0" />
      {mode !== 'poster' && (
        <FieldBoundary>
          <FaultyTerminal
            className="absolute inset-0 mix-blend-lighten"
            layout={layout}
            stillFrame={mode === 'still'}
            mouseReact={mode === 'webgl'}
            pageLoadAnimation={mode === 'webgl'}
            tint={PALETTE.accent}
            digitSize={1.2}
            timeScale={0.5}
            scanlineIntensity={0.5}
            curvature={0.1}
            mouseStrength={0.5}
            noiseAmp={1}
            brightness={dim ? 0.35 : 0.6}
            initialMouse={wide ? { x: 0.78, y: 0.5 } : { x: 0.5, y: 0.14 }}
          />
        </FieldBoundary>
      )}
    </div>
  );
}
```

`src/components/site/home/HomeHero.tsx` is a server component. Layout: the section is `relative isolate min-h-svh overflow-hidden`, and the copy is vertically centred and left-aligned, with padding `pt-28 pb-18 px-5 sm:px-[7vw]`. The copy block has the prototype's dark radial scrim behind it: a `before:` pseudo-element with the `radial-gradient(closest-side, rgba(13,13,13,.8), rgba(13,13,13,.66) 50%, rgba(13,13,13,.32) 78%, transparent)` stops, which keeps body text above AA over the brightest glyphs.
```tsx
import { ButtonLink } from '@/components/site/ButtonLink';
import { ScrambleHeading } from '@/components/site/ScrambleHeading';
import { HeroField } from './HeroField';

export const HERO = {
  title: 'We build robots at VIT Chennai.',
  body: 'Robotics Club is where students design, wire and program robots, then take them to competitions. New members start with beginner workshops.',
} as const;

export function HomeHero() {
  return (
    <section className="relative isolate flex min-h-svh items-center overflow-x-clip px-5 pb-18 pt-28 sm:px-[7vw]">
      <HeroField />
      <div className="relative z-10 isolate max-w-full before:absolute before:-inset-x-[30%] before:-inset-y-[30%] before:-z-10 before:bg-[radial-gradient(closest-side,rgba(13,13,13,0.8)_0%,rgba(13,13,13,0.66)_50%,rgba(13,13,13,0.32)_78%,transparent_100%)] before:content-['']">
        <ScrambleHeading as="h1" text={HERO.title} className="type-display max-w-[11em] text-balance text-rc-ink" />
        <p className="mt-7 max-w-[34em] text-lg text-rc-text">{HERO.body}</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="/events">See upcoming events</ButtonLink>
          <ButtonLink href="/join" variant="secondary">Join the club</ButtonLink>
        </div>
      </div>
    </section>
  );
}
```

`src/app/(site)/page.tsx`:
```tsx
import { HomeHero } from '@/components/site/home/HomeHero';

export default function HomePage() {
  return <HomeHero />;
}
```

Run: `cd D:/RCweb-next && npx vitest run && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 8: Add the licence notice**

Create `THIRD_PARTY_NOTICES.md`. It names React Bits (https://reactbits.dev), lists the components used so far (FaultyTerminal, DecryptedText), and contains the React Bits `LICENSE.md` text copied verbatim from the React Bits repository (MIT + Commons Clause, Copyright (c) 2026 David Haz). Add one line: "Used as part of this website; not redistributed on their own."

- [ ] **Step 9: Verify on a real GPU**

Adapt the scratchpad's `shots/shoot.mjs` into `scripts/shoot.mjs`:
- it takes `node scripts/shoot.mjs <baseUrl> <path...>` and drops the brainstorm key;
- it shoots each path at 1440×900 and at 390×844 (touch, DPR 2), idle and after a mouse sweep, into `shots/`;
- it prints the WebGL renderer string, the h1 text and any console errors;
- keep the GPU args (`--use-angle=d3d11 --enable-gpu --ignore-gpu-blocklist`) and `headless: 'new'`.

```bash
cd D:/RCweb-next && npm install -D puppeteer-core@^24 && npm run build && npx next start -p 3000
```
Start the server through `preview_start`, using a `.claude/launch.json` entry named `rcweb-next` that runs `npm run start` on port 3000. Then run:
```bash
cd D:/RCweb-next && node scripts/shoot.mjs http://localhost:3000 /
```
Expected:
- the renderer string names the real GPU (not SwiftShader);
- the h1 reads the headline;
- there are no console errors;
- the screenshots match the approved prototype: glyph field tinted `#619AC3`, the cursor halo moving, text readable.

Compare the screenshots side by side with the prototype's. Iterate until they match.

- [ ] **Step 10: Commit**

```bash
cd D:/RCweb-next && git add -A && git commit -m "Add FaultyTerminal hero with DecryptedText headline and fallbacks"
```

---

### Task 5: Env validation and Supabase clients

**Files:**
- Create: `src/lib/env-schema.ts`, `src/lib/env.ts`, `src/instrumentation.ts`, `src/lib/supabase/admin.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/browser.ts`, `src/lib/supabase/proxy-session.ts`, `.env.example`
- Test: `src/lib/env-schema.test.ts`

**Interfaces:**
- Produces:
  - `parseServerEnv(source): ServerEnv`, which throws `Invalid or missing environment variables: A, B. See .env.example.`;
  - `serverEnv(): ServerEnv`, memoised and server-only;
  - `db(): SupabaseClient<Database>`, using the secret key (server-only, no session);
  - `authClient(): Promise<SupabaseClient<Database>>`, using the publishable key and the request cookies;
  - `browserClient()`, using the publishable key, for sign-in only;
  - `updateSession(request): Promise<{ response: NextResponse; claims: JwtPayload | null }>`.
- Note: `env-schema.ts` has no `server-only` import, because `instrumentation.ts` and `proxy.ts` aren't bundled in the react-server layer, where `server-only` resolves safely.

- [ ] **Step 1: Write the failing env test**

`src/lib/env-schema.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { parseServerEnv } from './env-schema';

const VALID = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://lvmibgzaaegamfesjfsk.supabase.co',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
  SUPABASE_SECRET_KEY: 'sb_secret_example_value',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
};

describe('parseServerEnv', () => {
  it('accepts a complete environment', () => {
    expect(parseServerEnv(VALID).SUPABASE_SECRET_KEY).toBe('sb_secret_example_value');
  });

  it('names every missing variable', () => {
    expect(() => parseServerEnv({})).toThrow(
      'Invalid or missing environment variables: NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY. See .env.example.',
    );
  });

  it('rejects legacy JWT keys and http Supabase URLs', () => {
    expect(() => parseServerEnv({ ...VALID, SUPABASE_SECRET_KEY: 'eyJhbGciOi.legacy' })).toThrow(/SUPABASE_SECRET_KEY/);
    expect(() => parseServerEnv({ ...VALID, NEXT_PUBLIC_SUPABASE_URL: 'http://x.supabase.co' })).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it('never echoes a value in the error', () => {
    try {
      parseServerEnv({ ...VALID, NEXT_PUBLIC_SUPABASE_URL: 'not a url' });
    } catch (error) {
      expect(String(error)).not.toContain('sb_secret_example_value');
      expect(String(error)).not.toContain('not a url');
    }
  });
});
```

Run: `cd D:/RCweb-next && npx vitest run src/lib/env-schema.test.ts`
Expected: FAIL (module missing).

- [ ] **Step 2: Implement env**

`src/lib/env-schema.ts`:
```ts
import { z } from 'zod';

export const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url({ protocol: /^https$/ }),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().startsWith('sb_publishable_'),
  SUPABASE_SECRET_KEY: z.string().startsWith('sb_secret_'),
  NEXT_PUBLIC_SITE_URL: z.url(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source);
  if (!result.success) {
    const names = [...new Set(result.error.issues.map(issue => String(issue.path[0])))].sort();
    throw new Error(`Invalid or missing environment variables: ${names.join(', ')}. See .env.example.`);
  }
  return result.data;
}
```

`src/lib/env.ts`:
```ts
import 'server-only';
import { parseServerEnv, type ServerEnv } from './env-schema';

let cached: ServerEnv | undefined;

export function serverEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env);
  return cached;
}
```

`src/instrumentation.ts`:
```ts
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { parseServerEnv } = await import('./lib/env-schema');
  parseServerEnv(process.env); // fail fast at server start (spec 5)
}
```

`.env.example`:
```bash
# Names only. Real values go in .env.local (git-ignored) and in Vercel.
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 3: Implement the clients**

`src/lib/supabase/admin.ts`:
```ts
import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { serverEnv } from '@/lib/env';
import type { Database } from './database.types';

let client: SupabaseClient<Database> | undefined;

/** Secret-key client. Bypasses RLS. Server-only; never sent to the browser. */
export function db(): SupabaseClient<Database> {
  if (!client) {
    const env = serverEnv();
    client = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return client;
}
```

`src/lib/supabase/server.ts`:
```ts
import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { serverEnv } from '@/lib/env';
import type { Database } from './database.types';

/** Publishable-key client bound to the request's auth cookies. Used only for auth calls. */
export async function authClient() {
  const env = serverEnv();
  const cookieStore = await cookies();
  return createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, which can't set cookies; proxy.ts refreshes sessions.
        }
      },
    },
  });
}
```

`src/lib/supabase/browser.ts`:
```ts
import { createBrowserClient } from '@supabase/ssr';

/** Browser client for Google sign-in only. The browser never queries tables (spec 5). */
export function browserClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
}
```

`src/lib/supabase/proxy-session.ts`:
```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/** Refreshes the auth session cookies for a request (runs inside proxy.ts). */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });
  const { data } = await supabase.auth.getClaims();
  return { response, claims: data?.claims ?? null };
}
```

`database.types.ts` doesn't exist until Task 6. For now, create a placeholder with `export type Database = any; // replaced by generated types in Task 6`, marked with an eslint-disable comment. Task 6 overwrites it.

- [ ] **Step 4: Wire the local env (owner action A3)**

Fetch the `rcweb-dev` URL and publishable key with the Supabase MCP (`get_project_url`, `get_publishable_keys` for `lvmibgzaaegamfesjfsk`). Write those two public values and `NEXT_PUBLIC_SITE_URL` into `.env.local`. Ask the owner to paste `SUPABASE_SECRET_KEY` into `.env.local` themselves, and never read the file back.

- [ ] **Step 5: Run the checks**

Run: `cd D:/RCweb-next && npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd D:/RCweb-next && git add -A && git commit -m "Add env validation and server-only Supabase clients"
```

---

### Task 6: Database schema on rcweb-dev

**Files:**
- Create:
  - `supabase/history/2026-09-30-emergency-rls-lockdown.sql` (a copy of `D:\RC-web-backups\supabase-2026-09-30\emergency_rls_lockdown.sql`, as history: it was applied to `rcweb` and is never re-applied);
  - `supabase/migrations/20261001000100_schema_v1.sql`, `supabase/migrations/20261001000200_seed_settings.sql`;
  - `supabase/tests/privileges.sql`.
- Replace: `src/lib/supabase/database.types.ts` (generated)

**Interfaces:**
- Produces:
  - the tables, enums and constraints from spec §7.1;
  - `public.hit_rate_limit(p_key text, p_window_seconds int, p_max_hits int) returns boolean` (true means allowed), callable only by `service_role`;
  - the private bucket `certificates`;
  - `site_settings` row `recruitment = {"open": false}`;
  - generated `Database` types.

- [ ] **Step 1: Write the privilege test first**

`supabase/tests/privileges.sql` (run with `execute_sql`; every query must return **zero rows**):
```sql
-- 1. No table in public lets anon or authenticated read or write.
select c.relname, r.role
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
cross join (values ('anon'), ('authenticated')) as r(role)
where n.nspname = 'public' and c.relkind in ('r', 'v', 'm', 'p')
  and (has_table_privilege(r.role, c.oid, 'select') or has_table_privilege(r.role, c.oid, 'insert')
    or has_table_privilege(r.role, c.oid, 'update') or has_table_privilege(r.role, c.oid, 'delete'));

-- 2. RLS is enabled on every public table.
select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;

-- 3. No policies exist for client roles.
select tablename, policyname from pg_policies where schemaname in ('public', 'storage') and roles && array['anon', 'authenticated', 'public']::name[];

-- 4. Only service_role can call the rate limiter.
select r.role from (values ('anon'), ('authenticated')) as r(role)
where has_function_privilege(r.role, 'public.hit_rate_limit(text, integer, integer)', 'execute');

-- 5. The certificates bucket exists and is private (returns a row only if it's missing or public).
select 'certificates bucket missing or public' where not exists (select 1 from storage.buckets where id = 'certificates' and public = false);
```

Before any migration, run query 5 with `execute_sql` on `lvmibgzaaegamfesjfsk`. Expected: 1 row (FAIL, the bucket doesn't exist yet).

- [ ] **Step 2: Write `supabase/migrations/20261001000100_schema_v1.sql`**

```sql
create extension if not exists citext with schema extensions;

create type public.member_level as enum ('faculty', 'board', 'head', 'lead', 'core', 'member');
create type public.member_division as enum ('projects', 'webdev', 'teaching', 'media', 'operations', 'marketing', 'alumni', 'none');
create type public.event_status as enum ('upcoming', 'registration_open', 'coming_soon', 'completed');
create type public.certificate_type as enum ('participation', 'winner', 'runner_up', 'merit', 'volunteer', 'organiser');
create type public.certificate_status as enum ('issued', 'revoked');
create type public.email_scope as enum ('team', 'individual');

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.members (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  full_name text not null check (char_length(full_name) between 1 and 80),
  role_title text check (char_length(role_title) <= 60),
  level public.member_level not null default 'member',
  division public.member_division not null default 'none',
  year_of_study text,
  degree text,
  joined_year int check (joined_year between 2015 and 2100),
  about text check (char_length(about) <= 300),
  tags text[] not null default '{}' check (cardinality(tags) <= 3),
  currently_building text check (char_length(currently_building) <= 80),
  fun_fact text check (char_length(fun_fact) <= 100),
  photo_url text check (photo_url ~ '^https://'),
  github_url text check (github_url ~ '^https://'),
  linkedin_url text check (linkedin_url ~ '^https://'),
  instagram_url text check (instagram_url ~ '^https://'),
  portfolio_url text check (portfolio_url ~ '^https://'),
  email extensions.citext unique,
  consent_at timestamptz,
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 120),
  summary text check (char_length(summary) <= 160),
  description text,
  category text,
  status public.event_status not null default 'coming_soon',
  starts_on date,
  date_label text,
  series text,
  cover_url text check (cover_url ~ '^https://'),
  registration_url text check (registration_url ~ '^https://'),
  recap_url text check (recap_url ~ '^https://'),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_url text not null check (image_url ~ '^https://'),
  caption text check (char_length(caption) <= 200),
  event_id uuid references public.events(id) on delete set null,
  taken_on date,
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index gallery_items_event_id_idx on public.gallery_items (event_id);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  website_url text check (website_url ~ '^https://'),
  logo_url text check (logo_url ~ '^https://'),
  relationship text check (char_length(relationship) <= 140),
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique check (public_id ~ '^RC[0-9]{2}-[0-9A-HJKMNP-TV-Z]{10}$'),
  event_id uuid not null references public.events(id) on delete restrict,
  type public.certificate_type not null,
  place smallint check (place between 1 and 10),
  recipient_name text not null check (char_length(recipient_name) between 1 and 120),
  name_norm text not null,
  team_name text,
  institution text,
  contact_email extensions.citext,
  email_scope public.email_scope not null default 'team',
  pdf_path text not null,
  pdf_sha256 text not null check (pdf_sha256 ~ '^[0-9a-f]{64}$'),
  status public.certificate_status not null default 'issued',
  issued_on date not null,
  emailed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index certificates_identity_idx on public.certificates (event_id, type, coalesce(team_name, ''), name_norm);
create index certificates_contact_email_idx on public.certificates (contact_email);

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 1 and 80),
  email extensions.citext not null unique,
  source text not null default 'join',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admins (
  id uuid primary key default gen_random_uuid(),
  email extensions.citext not null unique check (email::text = lower(email::text) and email::text = btrim(email::text)),
  name text,
  is_owner boolean not null default false,
  added_by extensions.citext,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rate_limits (
  key text primary key,
  window_start timestamptz not null,
  hits int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['members', 'events', 'gallery_items', 'partners', 'certificates', 'waitlist', 'admins', 'site_settings', 'rate_limits'] loop
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', t || '_updated_at', t);
    execute format('alter table public.%I enable row level security', t);
  end loop;
end;
$$;

-- Defence in depth (spec 5): client roles get nothing, even with a leaked publishable key.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from public, anon, authenticated;

create function public.hit_rate_limit(p_key text, p_window_seconds int, p_max_hits int) returns boolean
language plpgsql security invoker set search_path = '' as $$
declare v_hits int;
begin
  insert into public.rate_limits as rl (key, window_start, hits)
  values (p_key, now(), 1)
  on conflict (key) do update set
    window_start = case when rl.window_start < now() - make_interval(secs => p_window_seconds) then now() else rl.window_start end,
    hits = case when rl.window_start < now() - make_interval(secs => p_window_seconds) then 1 else rl.hits + 1 end
  returning hits into v_hits;
  return v_hits <= p_max_hits;
end;
$$;
revoke execute on function public.hit_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, int, int) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('certificates', 'certificates', false, 5242880, array['application/pdf'])
on conflict (id) do nothing;
```

- [ ] **Step 3: Write `supabase/migrations/20261001000200_seed_settings.sql`**

```sql
insert into public.site_settings (key, value) values ('recruitment', '{"open": false}'::jsonb)
on conflict (key) do nothing;
```

- [ ] **Step 4: Apply both migrations to rcweb-dev only**

Use the Supabase MCP `apply_migration` with `project_id: lvmibgzaaegamfesjfsk`, names `schema_v1` and `seed_settings`, and each file's SQL. Never pass `osjvefbyxwvtycxukcmq` here.

- [ ] **Step 5: Run the privilege test and the advisors**

Run each query in `supabase/tests/privileges.sql` with `execute_sql` on `lvmibgzaaegamfesjfsk`.
Expected: every query returns 0 rows.

Run `get_advisors` (type `security`) on `lvmibgzaaegamfesjfsk`.
Expected: no RLS, exposure or security-definer warnings. A "RLS enabled, no policy" INFO is expected and intended (spec §5). Fix anything else with a new migration file, never by editing an applied one.

- [ ] **Step 6: Seed the four owners (not committed)**

Take the three `ADMIN_EMAILS` from `D:\RCweb-reimagined\api\index.ts` plus the fourth owner’s personal address (kept out of the repo) (spec D13). Insert them with `execute_sql` on `lvmibgzaaegamfesjfsk`:
`insert into public.admins (email, name, is_owner) values (lower(btrim('<email>')), '<name>', true) on conflict (email) do nothing;`
Then run `select count(*) from public.admins where is_owner`.
Expected: `4`.

- [ ] **Step 7: Generate types**

Use the MCP `generate_typescript_types` for `lvmibgzaaegamfesjfsk` and write the result to `src/lib/supabase/database.types.ts`.

Run: `cd D:/RCweb-next && npm run typecheck`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
cd D:/RCweb-next && git add -A && git commit -m "Add schema v1 with locked-down privileges, rate limiter and private bucket"
```

---

### Task 7: Rate limiter

**Files:**
- Create: `src/lib/rate-limit.ts`
- Test: `src/lib/rate-limit.test.ts`

**Interfaces:**
- Consumes: `db()` (Task 5) and the `hit_rate_limit` RPC (Task 6).
- Produces:
  - `rateLimit(key: string, opts: { windowSeconds: number; max: number }): Promise<boolean>`, where true means allowed and it fails closed;
  - `clientKey(kind: string, value: string): string`, which gives `kind:sha256(value)` so raw IPs and emails are never stored.

- [ ] **Step 1: Write the failing test**

`src/lib/rate-limit.test.ts`:
```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

const rpc = vi.hoisted(() => vi.fn());
vi.mock('@/lib/supabase/admin', () => ({ db: () => ({ rpc }) }));

import { clientKey, rateLimit } from './rate-limit';

beforeEach(() => rpc.mockReset());

describe('rateLimit', () => {
  it('passes the window and limit to the database function', async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    await expect(rateLimit('find:abc', { windowSeconds: 3600, max: 5 })).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith('hit_rate_limit', { p_key: 'find:abc', p_window_seconds: 3600, p_max_hits: 5 });
  });
  it('denies when over the limit', async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    await expect(rateLimit('k', { windowSeconds: 60, max: 1 })).resolves.toBe(false);
  });
  it('fails closed when the database errors', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'boom' } });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(rateLimit('k', { windowSeconds: 60, max: 1 })).resolves.toBe(false);
  });
});

describe('clientKey', () => {
  it('hashes the value so raw IPs and emails are never stored', () => {
    const key = clientKey('ip', '203.0.113.9');
    expect(key).toMatch(/^ip:[0-9a-f]{64}$/);
    expect(key).not.toContain('203.0.113.9');
    expect(clientKey('email', 'A@B.com ')).toBe(clientKey('email', 'a@b.com'));
  });
});
```

Run: `cd D:/RCweb-next && npx vitest run src/lib/rate-limit.test.ts`
Expected: FAIL (module missing).

- [ ] **Step 2: Implement it**

`src/lib/rate-limit.ts`:
```ts
import 'server-only';
import { createHash } from 'node:crypto';
import { db } from '@/lib/supabase/admin';

export function clientKey(kind: string, value: string): string {
  return `${kind}:${createHash('sha256').update(value.trim().toLowerCase()).digest('hex')}`;
}

/** True when the request is allowed. Fails closed: if the check itself fails, the request is refused. */
export async function rateLimit(key: string, { windowSeconds, max }: { windowSeconds: number; max: number }): Promise<boolean> {
  const { data, error } = await db().rpc('hit_rate_limit', { p_key: key, p_window_seconds: windowSeconds, p_max_hits: max });
  if (error) {
    console.error('rate limit check failed:', error.message);
    return false;
  }
  return data === true;
}
```

Run: `cd D:/RCweb-next && npx vitest run src/lib/rate-limit.test.ts`
Expected: PASS.

- [ ] **Step 3: Run a one-off live check on rcweb-dev**

With `execute_sql`: run `select public.hit_rate_limit('selftest', 60, 2)` three times.
Expected: `true`, `true`, `false`.
Then `delete from public.rate_limits where key = 'selftest';`.

- [ ] **Step 4: Commit**

```bash
cd D:/RCweb-next && git add -A && git commit -m "Add Postgres-backed rate limiter"
```

---

### Task 8: Admin sign-in and gate

**Files:**
- Create: `src/lib/auth/admin-rules.ts`, `src/lib/auth/admin.ts`, `src/proxy.ts`, `src/app/admin/layout.tsx`, `src/app/admin/sign-in/page.tsx`, `src/app/admin/sign-in/SignInButton.tsx`, `src/app/admin/auth/callback/route.ts`, `src/app/admin/(protected)/layout.tsx`, `src/app/admin/(protected)/page.tsx`, `src/app/admin/(protected)/actions.ts`
- Test: `src/lib/auth/admin-rules.test.ts`

**Interfaces:**
- Consumes: `authClient()`, `db()`, `browserClient()`, `updateSession()` (Task 5).
- Produces:
  - `normalizeEmail(email: string): string`;
  - `safeNextPath(next: string | null | undefined): string` (always a `/admin` path);
  - `decideAdmin(user, findAdmin): Promise<Admin | null>`;
  - `type Admin = { id: string; email: string; name: string | null; is_owner: boolean }`;
  - `getCurrentAdmin(): Promise<Admin | null>`;
  - `requireAdmin(): Promise<Admin>`, which redirects to `/admin/sign-in`;
  - `requireOwner(): Promise<Admin>`.
  - **Every admin page, Server Action and Route Handler in later tasks starts with `await requireAdmin()`, and so does every admin data helper.** The `(protected)` layout's check is not enough: Next can render a page without running its layout, and a layout's redirect still streams the page (review fix, 2 Oct). `getCurrentAdmin` is wrapped in React `cache()`, so repeated checks cost one lookup per request. `tests/admin-gate.test.ts` fails on any admin page, route handler or `actions.ts` without the call.

- [ ] **Step 1: Write the failing rules test**

`src/lib/auth/admin-rules.test.ts`:
```ts
import { describe, expect, it, vi } from 'vitest';
import { decideAdmin, normalizeEmail, safeNextPath, type Admin } from './admin-rules';

const OWNER: Admin = { id: '1', email: 'owner@vitstudent.ac.in', name: 'Owner', is_owner: true };
const findAdmin = vi.fn(async (email: string) => (email === OWNER.email ? OWNER : null));

describe('normalizeEmail', () => {
  it('trims and lower-cases', () => expect(normalizeEmail('  Owner@VITstudent.ac.in ')).toBe('owner@vitstudent.ac.in'));
});

describe('decideAdmin', () => {
  it('accepts a verified email that matches in any case or spacing', async () => {
    await expect(decideAdmin({ email: ' Owner@VITSTUDENT.ac.in', email_confirmed_at: '2026-10-01T00:00:00Z' }, findAdmin)).resolves.toEqual(OWNER);
  });
  it('refuses when there is no user or no email', async () => {
    await expect(decideAdmin(null, findAdmin)).resolves.toBeNull();
    await expect(decideAdmin({ email: undefined, email_confirmed_at: '2026-10-01' }, findAdmin)).resolves.toBeNull();
  });
  it('refuses an unverified email even if it is listed', async () => {
    await expect(decideAdmin({ email: OWNER.email, email_confirmed_at: null }, findAdmin)).resolves.toBeNull();
  });
  it('refuses a verified email that is not listed', async () => {
    await expect(decideAdmin({ email: 'someone@gmail.com', email_confirmed_at: '2026-10-01' }, findAdmin)).resolves.toBeNull();
  });
});

describe('safeNextPath', () => {
  it.each([
    [null, '/admin'],
    ['', '/admin'],
    ['https://evil.com', '/admin'],
    ['//evil.com', '/admin'],
    ['/\\evil.com', '/admin'],
    ['javascript:alert(1)', '/admin'],
    ['/admin/../team', '/admin'],
    ['/administrator', '/admin'],
    ['/admin', '/admin'],
    ['/admin/events?page=2', '/admin/events?page=2'],
  ])('%s -> %s', (input, expected) => expect(safeNextPath(input)).toBe(expected));
});
```

Run: `cd D:/RCweb-next && npx vitest run src/lib/auth/admin-rules.test.ts`
Expected: FAIL (module missing).

- [ ] **Step 2: Implement the rules (pure, no server-only, so they're testable)**

`src/lib/auth/admin-rules.ts`:
```ts
export type Admin = { id: string; email: string; name: string | null; is_owner: boolean };
type MaybeUser = { email?: string | null; email_confirmed_at?: string | null } | null;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Spec 9.2: valid session, verified email, exact lower-cased match in admins. */
export async function decideAdmin(user: MaybeUser, findAdmin: (email: string) => Promise<Admin | null>): Promise<Admin | null> {
  if (!user?.email || !user.email_confirmed_at) return null;
  return findAdmin(normalizeEmail(user.email));
}

const BASE = 'http://rcweb.invalid';

/** Only same-origin /admin paths survive; everything else lands on /admin. */
export function safeNextPath(next: string | null | undefined): string {
  const fallback = '/admin';
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  try {
    const url = new URL(next, BASE);
    if (url.origin !== BASE) return fallback;
    if (url.pathname !== '/admin' && !url.pathname.startsWith('/admin/')) return fallback;
    return url.pathname + url.search;
  } catch {
    return fallback;
  }
}
```

Run: `cd D:/RCweb-next && npx vitest run src/lib/auth/admin-rules.test.ts`
Expected: PASS.

- [ ] **Step 3: Implement the server helpers, proxy and routes**

`src/lib/auth/admin.ts`:
```ts
import 'server-only';
import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase/admin';
import { authClient } from '@/lib/supabase/server';
import { decideAdmin, type Admin } from './admin-rules';

async function findAdmin(email: string): Promise<Admin | null> {
  const { data, error } = await db().from('admins').select('id, email, name, is_owner').eq('email', email).maybeSingle();
  if (error) {
    console.error('admin lookup failed:', error.message);
    return null;
  }
  return data;
}

export async function getCurrentAdmin(): Promise<Admin | null> {
  const supabase = await authClient();
  const { data } = await supabase.auth.getUser();
  return decideAdmin(data.user, findAdmin);
}

export async function requireAdmin(): Promise<Admin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/sign-in');
  return admin;
}

export async function requireOwner(): Promise<Admin> {
  const admin = await requireAdmin();
  if (!admin.is_owner) redirect('/admin');
  return admin;
}
```

`src/proxy.ts`:
```ts
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy-session';

const PUBLIC_ADMIN_PATHS = ['/admin/sign-in', '/admin/auth/'];

export async function proxy(request: NextRequest) {
  const { response, claims } = await updateSession(request);
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ADMIN_PATHS.some(p => pathname === p || pathname.startsWith(p));
  if (!isPublic && !claims) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/sign-in';
    url.search = '';
    url.searchParams.set('next', pathname);
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    return redirect;
  }
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = { matcher: ['/admin', '/admin/:path*'] };
```

`src/app/admin/layout.tsx`: a minimal admin chrome with the logo, "Admin" and no site nav. Add `export const metadata = { robots: { index: false, follow: false } }`.

`src/app/admin/sign-in/page.tsx` is a server component. It awaits `searchParams`, reads `error` and `next`, and renders:
- the h1 "Sign in to admin";
- the sentence "This area is for club admins.";
- `error === 'not_admin'`: an icon plus "That Google account isn't a club admin. Ask an owner to add you.";
- `error === 'failed'`: "Sign-in didn't complete. Try again.";
- `<SignInButton next={safeNextPath(next)} />`.

`src/app/admin/sign-in/SignInButton.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { browserClient } from '@/lib/supabase/browser';

export function SignInButton({ next }: { next: string }) {
  const [pending, setPending] = useState(false);
  async function signIn() {
    setPending(true);
    const redirectTo = `${window.location.origin}/admin/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await browserClient().auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    if (error) setPending(false);
  }
  return (
    <button type="button" onClick={signIn} disabled={pending} className="type-ui inline-flex min-h-12 items-center rounded-md bg-rc-accent px-6 text-rc-bg hover:bg-rc-accent-deep disabled:opacity-60">
      {pending ? 'Opening Google…' : 'Sign in with Google'}
    </button>
  );
}
```

`src/app/admin/auth/callback/route.ts`:
```ts
import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth/admin';
import { safeNextPath } from '@/lib/auth/admin-rules';
import { authClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get('code');
  const next = safeNextPath(url.searchParams.get('next'));
  const signInUrl = (error: string) => new URL(`/admin/sign-in?error=${error}`, url.origin);

  if (!code) return NextResponse.redirect(signInUrl('failed'));
  const supabase = await authClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(signInUrl('failed'));

  const admin = await getCurrentAdmin();
  if (!admin) {
    await supabase.auth.signOut();
    return NextResponse.redirect(signInUrl('not_admin'));
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
```

`src/app/admin/(protected)/layout.tsx`: `const admin = await requireAdmin();`. It renders the admin nav (Dashboard only for now; Task 21 adds sections), `Signed in as {admin.email}`, and a sign-out `<form action={signOut}>` button.

`src/app/admin/(protected)/actions.ts`:
```ts
'use server';

import { redirect } from 'next/navigation';
import { authClient } from '@/lib/supabase/server';

export async function signOut() {
  const supabase = await authClient();
  await supabase.auth.signOut();
  redirect('/admin/sign-in');
}
```

`src/app/admin/(protected)/page.tsx`: the h1 "Admin" and a short list of what's coming today. Real counts come in Task 21. No fake numbers.

- [ ] **Step 4: Check it by hand (after owner action A4)**

Run the dev server through `preview_start`, open `/admin`, and sign in with an owner account.
Expected:
- `/admin` redirects to `/admin/sign-in?next=%2Fadmin`;
- an owner lands on `/admin`;
- a non-listed Google account lands on `/admin/sign-in?error=not_admin` and is signed out (the cookies are gone).

Also add `http://localhost:3000/admin/auth/callback` and the Vercel preview pattern to `rcweb-dev` Auth → URL configuration. The owner does this, or does it with guidance.

- [ ] **Step 5: Run the checks and commit**

Run: `cd D:/RCweb-next && npx vitest run && npm run typecheck && npm run lint`
Expected: PASS.

```bash
cd D:/RCweb-next && git add -A && git commit -m "Add Google admin sign-in with server-side admin gate"
```

---

### Task 9: Security headers, bundle secret check, e2e smoke

**Files:**
- Modify: `next.config.ts`, `package.json` (`build` runs the bundle check)
- Create: `scripts/check-client-bundle.mjs`, `playwright.config.ts`, `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Produces: `npm run build` fails if the secret key's name, its `sb_secret_` prefix or its value appears in `.next/static`, and `npm run e2e` runs Playwright on the installed Chrome.

- [ ] **Step 1: Write the failing e2e smoke**

```bash
cd D:/RCweb-next && npm install -D @playwright/test@^1.63 @axe-core/playwright@^4 && npm pkg set scripts.e2e="playwright test"
```

`playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000', channel: 'chrome' },
  webServer: process.env.E2E_BASE_URL ? undefined : { command: 'npm run start', port: 3000, reuseExistingServer: true },
});
```

`tests/e2e/smoke.spec.ts`:
```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('home renders its headline and passes axe', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'We build robots at VIT Chennai.' })).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter(v => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
});

test('security headers are set', async ({ request }) => {
  const res = await request.get('/');
  expect(res.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(res.headers()['x-content-type-options']).toBe('nosniff');
});

test('admin redirects signed-out visitors to sign-in', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/sign-in\?next=%2Fadmin$/);
});

test('unknown pages return 404 with a way home', async ({ page }) => {
  const res = await page.goto('/no-such-page');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'Go to the homepage' })).toBeVisible();
});

for (const width of [360, 390]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('shows the real headline with no scramble', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-scramble]')).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/We build robots at VIT Chennai\./);
  });
});
```

Run: `cd D:/RCweb-next && npm run build && npx playwright test`
Expected: FAIL on "security headers are set".

- [ ] **Step 2: Add the headers to `next.config.ts`**

```ts
import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://ik.imagekit.io",
  "font-src 'self'",
  `connect-src 'self' ${supabase} https://upload.imagekit.io`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'ik.imagekit.io' }] },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 3: Add the bundle secret check**

`scripts/check-client-bundle.mjs`:
```js
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd());
const needles = ['SUPABASE_SECRET_KEY', 'sb_secret_'];
if (process.env.SUPABASE_SECRET_KEY) needles.push(process.env.SUPABASE_SECRET_KEY);

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const leaks = walk('.next/static')
  .filter(path => /\.(js|json|txt)$/.test(path))
  .filter(path => {
    const text = readFileSync(path, 'utf8');
    return needles.some(needle => text.includes(needle));
  });

if (leaks.length) {
  console.error(`Secret material found in client bundles (values not printed):\n${leaks.join('\n')}`);
  process.exit(1);
}
console.log('client bundles are clean');
```

```bash
cd D:/RCweb-next && npm pkg set scripts.build="next build && node scripts/check-client-bundle.mjs"
```

- [ ] **Step 4: Run everything**

Run: `cd D:/RCweb-next && npm run verify && npx playwright test`
Expected: the build prints "client bundles are clean", and all e2e tests pass.

To prove the check works, temporarily add `console.log(process.env.SUPABASE_SECRET_KEY)` to `SignInButton.tsx` and run `npm run build`. Expected: exit 1, listing a file. Revert.

- [ ] **Step 5: Commit**

```bash
cd D:/RCweb-next && git add -A && git commit -m "Add security headers, client-bundle secret check and e2e smoke"
```

---

### Task 10: GitHub and Vercel (owner action A5, and ask before each step)

- [ ] **Step 1:** Ask the owner to confirm creating the **private** repo `helpRifan/rcweb-next`. On yes: `gh repo create helpRifan/rcweb-next --private --source D:/RCweb-next --push`.
- [ ] **Step 2:** The owner imports the repo in Vercel as a new project, with framework Next.js and build command `npm run build`.
  - **Preview** env vars point to `rcweb-dev`. The owner pastes the secret; I give the exact names from `.env.example`.
  - **Production** env vars are left empty until Task 24.
- [ ] **Step 3:** Add the Vercel preview callback pattern to `rcweb-dev` Auth → redirect URLs.
- [ ] **Step 4:** Open the preview URL and run `E2E_BASE_URL=<preview> npx playwright test`. Expected: PASS.
- [ ] **Step 5:** Run `node scripts/shoot.mjs <preview> /` on the GPU, then send the owner the preview link and screenshots (owner review A7, Home).

**End of Day 1 checkpoint:** Home is live on a preview link, admin sign-in works, the schema is locked down, and every check is green.

---

# Day 2 (2 Oct): every public page, including Team

Rules for every Day 2 page:
- It's a server component with `export const revalidate = 300`.
- Its h1 is `<ScrambleHeading>`, and its first section has `pt-28`.
- Its centrepiece is a client component loaded with `next/dynamic` (`ssr: false`) and wrapped in the `FieldBoundary` pattern from Task 4. Move `FieldBoundary` to `src/components/site/FieldBoundary.tsx` in Task 11 and reuse it.
- Every React Bits component is installed with `npx shadcn@4.21.0 add https://reactbits.dev/r/<Name>-TS-TW --path src/components/reactbits --yes`. Its non-palette defaults are changed to palette values in the source, the guardrail test enforces that, and it's appended to `THIRD_PARTY_NOTICES.md`.
- Every centrepiece has a reduced-motion or small-screen fallback that carries the same information in plain HTML (spec §4.4 table). The fallback gets a component test. The page gets an e2e test: it renders real content, axe passes, there's no overflow at 360px, and the reduced-motion fallback shows.
- Before the owner sees it, the page goes through the GPU screenshot script at 1440×900 and 390×844, then the §4.7 quality gate.

### Task 11: Data layer and dev fixtures

**Files:**
- Create: `src/lib/data/events.ts`, `src/lib/data/gallery.ts`, `src/lib/data/members.ts`, `src/lib/data/partners.ts`, `src/lib/data/settings.ts`, `src/lib/imagekit.ts`, `src/components/site/FieldBoundary.tsx`, `supabase/dev/fixtures.sql` (applied to `rcweb-dev` only, never a migration)
- Test: `src/lib/data/events.test.ts`, `src/lib/data/members.test.ts`

**Interfaces:**
- Each module is `server-only`, wraps queries in React `cache()`, selects explicit columns (never `email`, `consent_at` or `contact_email` for public reads) and filters `is_published = true`.
- Produces:
  - `getUpcomingEvents(limit)`, which returns statuses `upcoming | registration_open | coming_soon` ordered by `starts_on` with nulls last;
  - `getPastEventsByYear()`, `getEventBySlug(slug)`, `getEventPhotos(eventId)`;
  - `getGallery(limit?)`;
  - `getMembersByLevel()`, which returns `{ faculty, board, core, alumni }`, `getMemberBySlug(slug)`, `getDivisionNeighbours(member)`;
  - `getPublishedPartners()`;
  - `getRecruitment(): Promise<{ open: boolean }>`;
  - `imagekitLoader` for `next/image`.
- Tests (mocking `db()`) assert that published-only filters and the public column list are applied, and that a private column never appears in `select()`.

Fixtures:
- The five real TechnoVIT '26 event titles (Line Follower, Obstacle Race, Robo Race, Robo Soccer, Robo Sumo), published in dev, with `summary` set to "Details coming soon." until owner action A6 lands.
- The nine real gallery photos, uploaded to ImageKit `/rcweb/gallery/` by a one-off script, captions left empty.
- Nothing invented.

### Task 12: Home sections

**Files:** `src/components/site/home/UpcomingEvents.tsx`, `WhatWeDo.tsx`, `LatestPhotos.tsx`, `PartnersStrip.tsx`; modify `src/app/(site)/page.tsx`.

Implements spec §6.1:
- Each section is **hidden when it has no data**.
- Division one-liners come from `site_settings.divisions`, a `{ [division]: string }` object. The section is hidden until the owner writes them.
- Sections are quiet (no second centrepiece) and sit on `bg-rc-bg` below the hero.

Tests: each section renders nothing for empty input, and renders links for real input.

### Task 13: Events (Hyperspeed and ScrollStack)

**Files:** `src/app/(site)/events/page.tsx`, `src/app/(site)/events/[slug]/page.tsx` (with `generateStaticParams` and `notFound()` for unpublished), `src/components/site/events/EventsHero.tsx` (Hyperspeed, press-and-hold to accelerate), `PastEventsStack.tsx` (ScrollStack; plain list under reduced motion), `EventStatus.tsx`, `RegisterOnEventHub.tsx`.

Implements spec §6.5:
- Registration shows only when status is `registration_open`, with the exact instruction text "Search for <title> on Event Hub to register".
- "Took part? Find your certificate" shows for completed events that have certificates.
- Hyperspeed colours are recoloured to the palette: road `#0D0D0D`, lights `#619AC3`/`#4A8DB7`/`#FFFFFF`.

**Public JSON API (spec §8):**
- `src/app/api/events/route.ts` handles `GET` with `status` and `limit`. zod accepts only the enum values and 1 to 50. It returns published events only, with the public column list.
- `src/app/api/gallery/route.ts` handles `GET` and returns published gallery items.
- Bad query values get 400 with `{ error }`.

Tests:
- the detail page returns 404 for unpublished;
- the Event Hub instruction appears only for `registration_open`;
- the reduced-motion list shows every past event;
- `/api/events?status=bogus` returns 400, and `/api/events` never returns an unpublished row (with `db` mocked).

### Task 14: Gallery (DomeGallery) and Join (LiquidEther)

**Files:** `src/app/(site)/gallery/page.tsx`, `src/components/site/gallery/GalleryDome.tsx`, `GalleryGrid.tsx`, `PhotoViewer.tsx` (a Base UI dialog with the caption and event link, focus trapped, Escape closes); `src/app/(site)/join/page.tsx`, `src/components/site/join/JoinField.tsx` (LiquidEther: no viscosity, mouse force 32, cursor size 130, colours `#4A8DB7 / #619AC3 / #FFFFFF`), `WaitlistForm.tsx`, `src/app/api/waitlist/route.ts`, `src/lib/validation/waitlist.ts`.

- Env: add `JOIN_EMAIL_DOMAINS` (default `vitstudent.ac.in`) to the env schema, and test it.
- `/api/waitlist` (spec §8):
  - zod `{ fullName, email, website }`, where `website` is the honeypot: non-empty returns 201 and nothing is stored;
  - the email domain must be in `JOIN_EMAIL_DOMAINS`;
  - rate limit 5 per hour per `clientKey('ip', ip)`;
  - upsert on email; 201 when new, 200 when already listed, the same message either way;
  - errors return `{ error }` with a generic message.
- The form copy switches on `getRecruitment()`, using spec §6.9's exact sentences.

Tests:
- validation (domain, lengths, honeypot);
- the route handler with `db` and `rateLimit` mocked: 201, 200 duplicate, 429 over limit, 400 bad domain, honeypot stores nothing;
- the form shows the closed-state sentence when closed;
- the gallery grid lists every photo with alt text from the caption, or "Robotics Club photo" when there's no caption;
- e2e `tests/e2e/join.spec.ts`: sign up while open and while closed (toggle `site_settings` on `rcweb-dev` with `execute_sql` before each run), check a duplicate gets the same message, then delete the test rows.

### Task 15: About and the 404 field

**Files:** `src/app/(site)/about/page.tsx`, `src/components/site/about/FacultyCard.tsx` (ProfileCard: holographic tilt on pointer devices, static under reduced motion or touch); modify `src/app/not-found.tsx` to add `<HeroField dim />`.

- The copy is the two real Genesis paragraphs (inventory §2.5) and the objectives rewritten plainly (inventory P5).
- Faculty: Dr. Arockia Selvakumar, with the photo `fc.jpg` uploaded to ImageKit and a link to https://chennai.vit.ac.in/member/dr-arockia-selvakumar/.
- The two build photos `genesis-1.jpg` (resized to 1600px wide at most) and `genesis-2.jpg`.

**Partners (spec §6.7):**
- `src/app/(site)/partners/page.tsx` calls `notFound()` unless `getPublishedPartners()` returns at least one partner. Each partner shows its name, logo, the owner-written relationship line and a website link.
- `(site)/layout.tsx` passes `showPartners` to `SiteHeader`, which then inserts `{ href: '/partners', label: 'Partners' }` after Gallery. Add a test for that to `SiteHeader.test.tsx`.

Tests:
- the Genesis text renders, and the faculty link points to the VIT profile;
- `/partners` returns 404 with no published partners;
- the nav shows Partners only when `showPartners` is set.

### Task 16: Team, profiles and the member import

**Files:**
- `supabase/dev/roster.sql` (the 17 roster names, roles and divisions from inventory §2.3, **unpublished**, slugs from first names until surnames arrive), plus the faculty coordinator;
- `scripts/import-members.ts`, run with `npx tsx scripts/import-members.ts <responses.csv> <photos-dir> [--commit]`;
- `src/lib/validation/member-import.ts` (zod for each row, the tag list from spec §7.1, `Other: …` allowed, https-only links);
- `src/app/(site)/team/page.tsx`, `src/app/(site)/team/[slug]/page.tsx`;
- `src/components/site/team/BoardLanyards.tsx` (Lanyard);
- `CoreSphere.tsx` (InfiniteMenu; the front member shows name, role, division, 3 tags and "View profile");
- `TeamList.tsx` (ChromaGrid with division filters; the default under 768px, with reduced motion, and reachable by keyboard);
- `ViewToggle.tsx`, `Monogram.tsx`, `ProfileBadge.tsx`.

- The import script:
  - parses the Form CSV using spec §7.3's column mapping;
  - matches photos by the "`<file> - <respondent name>`" suffix;
  - resizes photos to 800px WebP with sharp;
  - prints a review table of problems (counts plus row numbers; names only for the owner's own review, in the terminal);
  - with `--commit`, uploads to ImageKit `/rcweb/members/` and upserts by email;
  - publishes only when consent is ticked **and** a photo is present.
- Env: add `IMAGEKIT_PRIVATE_KEY`, `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` and `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` to the schema. The script reads them through `parseServerEnv`.
- Profiles follow spec §6.4:
  - links render only when present;
  - next and previous links stay within the division;
  - `notFound()` unless published.

Tests:
- the import validator on **synthetic fixtures** (never real names): the 3-tag limit, unknown tags, http links rejected, the Board → `level=board, division=none` mapping, photo matching by suffix, and unpublished without consent or photo;
- `TeamList` filters by division;
- the profile page 404s for unpublished;
- `Monogram` renders initials when there's no photo.

### Task 17: Day 2 review

- [ ] Run `npm run verify`, then `npx playwright test` against the preview. Expected: PASS.
- [ ] Run `node scripts/shoot.mjs <preview> / /events /gallery /join /about /team /no-such-page` and review every shot against §4.7.
- [ ] Send the owner the preview link and screenshots (owner review A7). "Okay" or "mid" means iterate on the named page before Day 3 work starts on it.

---

# Day 3 (3 Oct): certificates, light admin, launch

### Task 18: Certificate import

**Files:** `scripts/import-certificates.ts` (`npx tsx scripts/import-certificates.ts <folder> --project dev|prod [--commit]`), `src/lib/certificates/public-id.ts`, `src/lib/certificates/normalize.ts`, `src/lib/certificates/parse-folder.ts`.

- Produces:
  - `generatePublicId(year: number): string`, giving `RC<yy>-` plus 10 Crockford base32 characters from `crypto.randomInt`;
  - `normalizeName(name: string): string` (NFKC, trimmed, spaces collapsed, lower case);
  - `parseCertificateFolder(dir)`, which reads the registration sheets, `winners_manifest.json` and `send_log.json` and returns rows. Byte-identical duplicates are skipped by SHA-256.
- The script:
  - creates the five TechnoVIT '26 events if they're missing;
  - uploads each PDF **unchanged** to the private `certificates` bucket at `<event-slug>/<public_id>.pdf`;
  - writes the review CSV to `D:\RC-web-backups\cert-review-<date>.csv` (outside the repo, because it's PII);
  - is idempotent on the identity index.
- It never opens the folder's `.env`, and never prints names or emails, only counts per event and type. Expected counts: 321 certificates (293 participation, 28 winner) and 54 distinct contact emails.

Tests:
- `generatePublicId` matches the DB check regex and has no I, L, O or U;
- 10,000 IDs have no duplicates;
- `normalizeName` folds case and whitespace;
- the parser on a **synthetic** fixture folder skips duplicates and maps winners' places.

Run order: `--project dev --commit` first. The owner checks the review CSV. `--project prod --commit` runs in Task 24.

### Task 19: Verify page and PDF download

**Files:** `src/app/(site)/certificates/page.tsx`, `src/app/(site)/certificates/[publicId]/page.tsx`, `src/components/site/certificates/VerifyReveal.tsx` (a small FaultyTerminal panel with DecryptedText details; a plain reveal under reduced motion), `VerifyForm.tsx`, `src/app/api/certificates/[publicId]/route.ts`, `src/app/api/certificates/[publicId]/pdf/route.ts`, `src/lib/data/certificates.ts`.

Implements spec §6.8 and §8:
- The verify JSON is `{ found, name, event, type, place, issuedOn, status }`. Unknown and malformed IDs get the same-shaped `{ found: false }` and the page text "No certificate with that ID".
- The PDF route rate-limits 30 per hour per IP, creates a 5-minute signed URL with `db().storage.from('certificates').createSignedUrl(path, 300)`, and returns a 302.
- Revoked certificates show "Revoked" with an icon and offer no download.
- The verify form accepts a pasted verify link or a bare ID, upper-cases it, and navigates.

Tests:
- the ID parser pulls an ID out of a pasted link;
- unknown and malformed IDs give identical response shapes;
- revoked certificates get no PDF;
- the rate-limited path returns 429;
- e2e `tests/e2e/certificates.spec.ts`: verify a known dev certificate ID, get a PDF redirect to a signed URL, and see "No certificate with that ID" for an unknown one.

### Task 20: "Find my certificates" and the magic link

**Files:** `src/lib/certificates/token.ts`, `src/lib/email/send.ts`, `src/lib/email/templates.ts`, `src/app/api/certificates/find/route.ts`, `src/components/site/certificates/FindForm.tsx`, `src/app/(site)/certificates/mine/page.tsx`.

- Env: add `CERT_LINK_SECRET` (at least 32 characters), `RESEND_API_KEY`, `RESEND_FROM_EMAIL` and `ADMIN_NOTIFY_EMAILS` to the schema, with tests.
- `token.ts`:
  - `signCertLink(email, now)` produces `base64url(payload).base64url(hmacSha256)` with payload `{ e: normalizedEmail, x: expiryUnix }` and a 30-minute expiry;
  - `verifyCertLink(token, now)` returns `{ email } | null`, using `timingSafeEqual`;
  - it rejects wrong signatures, expired tokens, malformed tokens and tampered emails.
- `/api/certificates/find`:
  - **always** returns 202 with the same body;
  - rate-limits 5 per hour per IP and per email;
  - sends only when certificates exist;
  - timing is kept similar by doing the lookup first either way.
- Email HTML escapes every interpolated value.
- If the Resend domain (A1) isn't verified, the page tells the visitor the feature is coming soon rather than claiming an email was sent, and the admin dashboard says so.

Tests:
- token round trip, expiry, tampering, malformed input;
- the route gives identical responses for known and unknown emails;
- the template escapes `<script>`.

### Task 21: Light admin

**Files:** `src/app/admin/(protected)/{events,gallery,members,partners,settings,waitlist}/page.tsx`, plus `actions.ts` in each; `src/lib/validation/admin.ts`; shadcn `input`, `textarea`, `select`, `switch`, `table`, `dialog` and `label` (restyled to the palette); `src/app/api/admin/waitlist/export/route.ts` (CSV).

- Every page (not only the layout), action, route handler and admin data helper starts with `await requireAdmin()`. `tests/admin-gate.test.ts` enforces this for pages, route handlers and `actions.ts` files.
- Every action:
  - starts with `await requireAdmin()`;
  - validates with zod (https-only URLs);
  - writes through `db()`;
  - calls `revalidatePath` for the affected public paths;
  - returns `{ error }` messages in plain words.
- Scope:
  - events: create, edit, publish, delete when there are no certificates;
  - gallery: caption, event link, publish, order;
  - members: edit text fields, publish, order (no photo upload; import script only);
  - partners: create, edit, publish;
  - settings: recruitment open or closed, division one-liners, the home intro;
  - waitlist: list and CSV export.
- The dashboard shows real counts from the database.

Tests:
- each action refuses a non-admin: mock `requireAdmin` to redirect and assert no `db()` write;
- each page refuses a non-admin: mock `requireAdmin` to redirect and assert the page rejects before any `db()` read (see `src/app/admin/(protected)/page.test.tsx`);
- zod rejects `http://` URLs;
- the CSV export escapes commas, quotes and formula prefixes (`=`, `+`, `-`, `@`);
- manual e2e (Google sign-in can't be automated without real credentials): as an owner, create, edit, publish and unpublish an event, and see the public `/events` page update. Signed-out access to every admin route redirects, and that part is automated in `smoke.spec.ts` by looping over the admin paths.

### Task 22: Content entry (owner action A6)

- [ ] Enter the owner's event descriptions, dates and covers, the photo captions, the division one-liners and the partners through the admin, on `rcweb-dev`.
- [ ] Run `scripts/import-members.ts` on the exported Form responses (dev first), and the owner checks the review table.
- [ ] Missing content stays unpublished. Nothing is invented to fill gaps.

### Task 23: Pre-launch quality pass

- [ ] Run `npm run verify` and `npx playwright test` against the preview. Expected: PASS.
- [ ] Run the GPU screenshots for every page at both sizes, and check every page against the §4.7 checklist.
- [ ] Lighthouse mobile on `/`, `/team` and `/certificates`: LCP under 2.5 s, CLS under 0.1. Check the build output for first-load JS under 250 KB per route.
- [ ] Axe shows no serious or critical issues on every route, and keyboard-only passes on the nav, the team list, the gallery viewer and every form.
- [ ] The owner's final live review (A7).

### Task 24: Production (each step needs the owner's go-ahead)

- [ ] Take a fresh backup of `rcweb`, using the method from `D:\RC-web-backups\supabase-2026-09-30\README.md`.
- [ ] Apply `schema_v1` and `seed_settings` to `rcweb` (`osjvefbyxwvtycxukcmq`), then run `supabase/tests/privileges.sql` and the security advisors. Expected: 0 rows and no warnings.
- [ ] Drop the legacy tables (spec §7.2) in a migration `20261003000100_drop_legacy.sql`. This is the owner's explicit yes, because it's irreversible without the backup.
- [ ] Seed the four owners on prod. Regenerate types if prod differs (it shouldn't).
- [ ] Run the member and certificate imports with `--project prod --commit`.
- [ ] Vercel Production env vars (the owner pastes the secrets). Add the production URL to the `rcweb` Auth redirect URLs. Google OAuth redirect URIs are already set for `rcweb`.
- [ ] Deploy to production, run `E2E_BASE_URL=<prod> npx playwright test`, and do a manual certificate find, verify and download plus an admin sign-in on prod.
- [ ] Cutover: point the domain, or keep `*.vercel.app` per Q12, then retire the old Vercel project **only** after the owner confirms.

**End of Day 3 checkpoint:** production is live, every check is green, and the owner has signed off. The "right after launch" column above becomes the next plan.
