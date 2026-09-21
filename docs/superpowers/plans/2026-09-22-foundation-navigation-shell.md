# Foundation & Navigation Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the new design-token system, shared UI primitives, and app shell (TopBar, MobileDrawer, Footer) that every later phase of the RC Web redesign builds on — with the old `LoadingScreen`, `PillNav`, and `StaggeredMenu` removed.

**Architecture:** Add a Vitest + React Testing Library test harness (none exists today). Define color/typography design tokens in `src/index.css`. Build four small, independently-tested primitives (`Button`, `Badge`, `Card`) and three shell components (`Footer`, `TopBar`, `MobileDrawer`) that compose into one `AppShell`. Wire `AppShell` into `App.tsx` in place of the current inline nav/footer markup, and delete the components it replaces.

**Tech Stack:** React 19, TypeScript, Vite 6, Tailwind v4, `motion` (Framer Motion), Vitest, @testing-library/react, jsdom.

**Spec:** [docs/superpowers/specs/2026-09-22-rc-web-redesign-design.md](../specs/2026-09-22-rc-web-redesign-design.md)

## Global Constraints

- Dark-only. No light-mode toggle, no `prefers-color-scheme` branching.
- Color tokens (exact values, from spec §3): `--color-bg-deep:#0D0D0D`, `--color-bg-elevated:#141416`, `--color-bg-card:#1A1A1E`, `--color-fg-primary:#FFFFFF`, `--color-fg-subtle:#E5E8EB`, `--color-fg-muted:#BFC7CE`, `--color-fg-dim:#8A8F96`, `--color-accent-blue:#4A8DB7`, `--color-accent-blue-bright:#619AC3`, `--color-accent-blue-dim:#3A6D90`, `--color-accent-gold:#E8B828` (secondary/warning only), `--color-accent-gold-dim:#C49A1F`, `--color-border-subtle:#2A2A2E`, `--color-border-default:#3A3A3E`, `--color-border-focus:#4A8DB7`.
- Typography (spec §3): Syne 500–800 for display/headings only; Inter 400–600 for all UI/body; JetBrains Mono 400–500 reserved for genuinely code-like data (never a decorative label font).
- Anti-cliché guardrails (spec §3, binding): no tracked-out ALL-CAPS labels, no middot-joined meta strings, no em-dash label chrome, no arrows appended to CTA text, no decorative numbered markers, no gray-on-gray text.
- Motion: `transform`/`opacity` only, `prefers-reduced-motion: reduce` must disable all non-essential motion.
- No new runtime dependencies beyond what this plan lists. Three.js and TanStack Table are reserved for later phase plans (Hero, Admin) — do not add them here.
- **Out of scope for this plan:** re-skinning the content of existing views (`HomeView`, `AboutView`, `AchievementsView`, `DepartmentsView`, `MembersView`, `ActivitiesView`, `CertificatesView`, `AdminView`). Those keep their current hardcoded Tailwind classes for now and will visually clash with the new shell until their own phase plans land — that's expected, not a bug.

## File Structure

- `vitest.config.ts` — new. Test runner config (jsdom environment, setup file).
- `src/test/setup.ts` — new. Registers `@testing-library/jest-dom` matchers.
- `src/index.css` — modify. Add `@theme` color tokens, Syne font import, display/heading type-scale utilities; point `body` background/color at the new tokens.
- `src/components/ui/Button.tsx` + `Button.test.tsx` — new. Variant button primitive (primary/secondary/ghost/terminal).
- `src/components/ui/Badge.tsx` + `Badge.test.tsx` — new. Small label/status pill (tone: neutral/blue/gold).
- `src/components/ui/Card.tsx` — new. Bordered/elevated container primitive (no test file — pure presentational wrapper, covered indirectly by consumers).
- `src/components/Footer.tsx` + `Footer.test.tsx` — new. Extracted and redesigned from the footer JSX currently inline in `App.tsx`.
- `src/components/TopBar.tsx` + `TopBar.test.tsx` — new. Desktop nav bar, replaces `PillNav`.
- `src/components/MobileDrawer.tsx` + `MobileDrawer.test.tsx` — new. Slide-over mobile nav, replaces `StaggeredMenu`.
- `src/components/AppShell.tsx` + `AppShell.test.tsx` — new. Composes `TopBar` + `MobileDrawer` + `Footer` around page content.
- `src/App.tsx` — modify. Use `AppShell`, remove `LoadingScreen`/`PillNav`/`StaggeredMenu` usage and the inline footer/nav JSX.
- `src/components/PillNav.tsx`, `src/components/StaggeredMenu.tsx`, `src/components/LoadingScreen.tsx` — delete (Task 10, after nothing references them).
- `package.json` — modify. Add test devDependencies and a `test` script.

---

### Task 1: Test Infrastructure

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/test/smoke.test.tsx`

**Interfaces:**
- Produces: `npm test` runs Vitest once; `npm run test:watch` runs it in watch mode. Every later task's test files run under this config.

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: Create the Vitest config**

Create `vitest.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: false,
  },
});
```

- [ ] **Step 3: Create the test setup file**

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Add test scripts to package.json**

In `package.json`, inside `"scripts"`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write a smoke test**

Create `src/test/smoke.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

function Hello() {
  return <p>hello rc web</p>;
}

describe('test harness', () => {
  it('renders a component and finds it by text', () => {
    render(<Hello />);
    expect(screen.getByText('hello rc web')).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run it and confirm it passes**

Run: `npm test`
Expected: 1 test file, 1 test, PASS.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/test/setup.ts src/test/smoke.test.tsx
git commit -m "test: add Vitest + React Testing Library harness"
```

---

### Task 2: Design Tokens (Color + Typography)

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Produces: CSS custom properties (`--color-*`) and Tailwind v4 `@theme` tokens consumed by every component task below via classes like `bg-bg-elevated`, `text-fg-muted`, `border-border-subtle`, `text-accent-blue`, `font-display`.

This task is CSS-only; there is no meaningful unit test for a color token, so verification is a build check instead of a red/green test cycle.

- [ ] **Step 1: Replace the font import and add the color/display theme block**

In `src/index.css`, replace lines 1–7 with:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@500;600;700;800&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  --font-display: "Syne", "Inter", ui-sans-serif, system-ui, sans-serif;

  --color-bg-deep: #0D0D0D;
  --color-bg-elevated: #141416;
  --color-bg-card: #1A1A1E;

  --color-fg-primary: #FFFFFF;
  --color-fg-subtle: #E5E8EB;
  --color-fg-muted: #BFC7CE;
  --color-fg-dim: #8A8F96;

  --color-accent-blue: #4A8DB7;
  --color-accent-blue-bright: #619AC3;
  --color-accent-blue-dim: #3A6D90;
  --color-accent-gold: #E8B828;
  --color-accent-gold-dim: #C49A1F;

  --color-border-subtle: #2A2A2E;
  --color-border-default: #3A3A3E;
  --color-border-focus: #4A8DB7;
}
```

- [ ] **Step 2: Add the display type-scale utilities**

Append to `src/index.css` (after the existing `text-body-md` utility, before the "Base custom resets" comment):

```css
@utility text-display-xl {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(3.5rem, 8vw, 7rem);
  line-height: 1.05;
  letter-spacing: -0.01em;
}

@utility text-display-lg {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  line-height: 1.1;
}

@utility text-display-md {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  line-height: 1.2;
}
```

- [ ] **Step 3: Point the body background/text at the new tokens**

Replace the existing `body { ... }` rule:

```css
body {
  background-color: var(--color-bg-deep);
  color: var(--color-fg-muted);
  font-family: var(--font-sans);
}
```

- [ ] **Step 4: Verify the build compiles**

Run: `npx tsc --noEmit && npx vite build`
Expected: both complete with no errors. (The existing views still use their own hardcoded hex classes — that's expected per Global Constraints; this step only confirms the new CSS itself is valid.)

- [ ] **Step 5: Commit**

```bash
git add src/index.css
git commit -m "feat: add brand color tokens and Syne display type scale"
```

---

### Task 3: Button Primitive

**Files:**
- Create: `src/components/ui/Button.tsx`
- Test: `src/components/ui/Button.test.tsx`

**Interfaces:**
- Produces: `Button` component — `<Button variant="primary"|"secondary"|"ghost"|"terminal" size="sm"|"md" disabled? onClick? >children</Button>`. Renders a native `<button>`; forwards remaining `...rest` props.

- [ ] **Step 1: Write the failing tests**

Create `src/components/ui/Button.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Save changes</Button>);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save changes</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Save changes</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies the terminal variant class', () => {
    render(<Button variant="terminal">Run</Button>);
    expect(screen.getByRole('button', { name: 'Run' })).toHaveClass('font-mono');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- Button`
Expected: FAIL — `Cannot find module './Button'`.

- [ ] **Step 3: Implement Button**

Create `src/components/ui/Button.tsx`:

```tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'terminal';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent-blue text-white hover:bg-accent-blue-bright disabled:bg-accent-blue-dim',
  secondary:
    'bg-bg-card text-fg-subtle border border-border-default hover:border-accent-blue disabled:opacity-50',
  ghost:
    'bg-transparent text-fg-muted hover:text-fg-primary disabled:opacity-50',
  terminal:
    'font-mono bg-bg-deep text-accent-blue border border-border-default hover:border-accent-blue disabled:opacity-50',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={[
          'rounded-lg font-medium transition-colors duration-200 cursor-pointer',
          'disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-deep',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...rest}
      />
    );
  },
);
Button.displayName = 'Button';
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- Button`
Expected: PASS, 4/4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Button.tsx src/components/ui/Button.test.tsx
git commit -m "feat: add Button primitive"
```

---

### Task 4: Badge Primitive

**Files:**
- Create: `src/components/ui/Badge.tsx`
- Test: `src/components/ui/Badge.test.tsx`

**Interfaces:**
- Produces: `Badge` component — `<Badge tone="neutral"|"blue"|"gold">children</Badge>`. Renders a `<span>`.

- [ ] **Step 1: Write the failing tests**

Create `src/components/ui/Badge.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>Upcoming</Badge>);
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
  });

  it('defaults to the neutral tone', () => {
    render(<Badge>Upcoming</Badge>);
    expect(screen.getByText('Upcoming')).toHaveClass('bg-bg-card');
  });

  it('applies the gold tone for warnings/achievements', () => {
    render(<Badge tone="gold">Winner</Badge>);
    expect(screen.getByText('Winner')).toHaveClass('text-accent-gold');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- Badge`
Expected: FAIL — `Cannot find module './Badge'`.

- [ ] **Step 3: Implement Badge**

Create `src/components/ui/Badge.tsx`:

```tsx
import { HTMLAttributes } from 'react';

type Tone = 'neutral' | 'blue' | 'gold';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-bg-card text-fg-muted border-border-subtle',
  blue: 'bg-accent-blue-dim/20 text-accent-blue-bright border-accent-blue-dim',
  gold: 'bg-accent-gold-dim/20 text-accent-gold border-accent-gold-dim',
};

export function Badge({ tone = 'neutral', className = '', ...rest }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium',
        toneClasses[tone],
        className,
      ].join(' ')}
      {...rest}
    />
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- Badge`
Expected: PASS, 3/3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Badge.tsx src/components/ui/Badge.test.tsx
git commit -m "feat: add Badge primitive"
```

---

### Task 5: Card Primitive

**Files:**
- Create: `src/components/ui/Card.tsx`

**Interfaces:**
- Produces: `Card` component — `<Card elevated?>children</Card>`. Renders a `<div>`. No dedicated test file (pure style wrapper); it is exercised indirectly by every consumer's own tests in later tasks.

- [ ] **Step 1: Implement Card**

Create `src/components/ui/Card.tsx`:

```tsx
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ elevated = false, className = '', ...rest }: CardProps) {
  return (
    <div
      className={[
        'rounded-xl border border-border-subtle',
        elevated ? 'bg-bg-elevated' : 'bg-bg-card',
        className,
      ].join(' ')}
      {...rest}
    />
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Card.tsx
git commit -m "feat: add Card primitive"
```

---

### Task 6: Footer (extracted + redesigned)

**Files:**
- Create: `src/components/Footer.tsx`
- Test: `src/components/Footer.test.tsx`

**Interfaces:**
- Consumes: `Button` (Task 3) for the "Admin Control Panel" link.
- Produces: `Footer` component — `<Footer onNavigate={(tab: ClubTab) => void} />`. Reads `ClubTab` from `../types`.

This replaces the footer JSX currently inline in `App.tsx` (lines 282–378). It fixes three anti-cliché violations present in that markup: the tracked-out uppercase "ROBOTICS / CLUB" wordmark, the `·`-joined "VIT Chennai · SWC" meta string, and the tracked-out "Terminal Links" / "Connect" eyebrow labels.

- [ ] **Step 1: Write the failing tests**

Create `src/components/Footer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders the quick nav links', () => {
    render(<Footer onNavigate={vi.fn()} />);
    expect(screen.getByRole('link', { name: 'Homepage' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Events' })).toBeInTheDocument();
  });

  it('calls onNavigate with the tab id when a quick nav link is clicked', async () => {
    const onNavigate = vi.fn();
    render(<Footer onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole('link', { name: 'Homepage' }));
    expect(onNavigate).toHaveBeenCalledWith('home');
  });

  it('navigates to admin when the admin control button is clicked', async () => {
    const onNavigate = vi.fn();
    render(<Footer onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole('button', { name: /admin/i }));
    expect(onNavigate).toHaveBeenCalledWith('admin');
  });

  it('copies the club email to the clipboard', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
    render(<Footer onNavigate={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /robotics\.club@vit\.ac\.in/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('robotics.club@vit.ac.in');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- Footer`
Expected: FAIL — `Cannot find module './Footer'`.

- [ ] **Step 3: Implement Footer**

Create `src/components/Footer.tsx`:

```tsx
import { useState } from 'react';
import { Check, Instagram, Linkedin, Mail, ShieldCheck } from 'lucide-react';
import { ClubTab } from '../types';
import { Button } from './ui/Button';

interface FooterProps {
  onNavigate: (tab: ClubTab) => void;
}

const QUICK_LINKS: { id: ClubTab; label: string }[] = [
  { id: 'home', label: 'Homepage' },
  { id: 'activities', label: 'Events' },
  { id: 'departments', label: 'Divisions' },
  { id: 'achievements', label: 'Collaborations' },
  { id: 'members', label: 'Team Page' },
  { id: 'about', label: 'Genesis' },
];

export function Footer({ onNavigate }: FooterProps) {
  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('robotics.club@vit.ac.in');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <footer className="border-t border-border-subtle bg-bg-deep py-16 md:py-24 relative z-10">
      <div className="w-full max-w-container-max mx-auto px-gutter grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-border-subtle pb-12 mb-8">
        <div className="md:col-span-5 space-y-6">
          <div className="flex items-center gap-3">
            <img src="/logo-nobg.png" alt="Robotics Club logo" className="w-11 h-11 object-contain" />
            <span className="font-display font-semibold text-fg-subtle text-lg">Robotics Club</span>
          </div>
          <p className="text-sm text-fg-muted leading-relaxed max-w-sm">
            Precision mechanical rigs, embedded systems, and autonomous platforms — built by
            students, for the campus, at VIT Chennai.
          </p>
        </div>

        <div className="md:col-span-4 space-y-4">
          <span className="text-sm font-medium text-fg-subtle">Explore</span>
          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            {QUICK_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(link.id);
                }}
                className="text-sm text-fg-muted hover:text-fg-primary transition-colors w-fit py-1"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 space-y-4">
          <span className="text-sm font-medium text-fg-subtle">Connect</span>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleCopyEmail}
              className="text-sm text-fg-muted hover:text-fg-primary transition-colors flex items-center gap-2.5 w-fit cursor-pointer"
            >
              {emailCopied ? <Check className="w-4 h-4 text-accent-blue" /> : <Mail className="w-4 h-4" />}
              {emailCopied ? 'Copied to clipboard' : 'robotics.club@vit.ac.in'}
            </button>
            <a
              href="https://www.instagram.com/robotics_club_vitc/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-fg-muted hover:text-fg-primary transition-colors flex items-center gap-2.5 w-fit"
            >
              <Instagram className="w-4 h-4" /> Instagram
            </a>
            <a
              href="https://in.linkedin.com/company/robotics-club-vitc"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-fg-muted hover:text-fg-primary transition-colors flex items-center gap-2.5 w-fit"
            >
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
          </div>
        </div>
      </div>

      <div className="w-full max-w-container-max mx-auto px-gutter flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-fg-dim text-center md:text-left">
          &copy; {new Date().getFullYear()} VIT Chennai Robotics Club
        </div>
        <Button variant="terminal" size="sm" onClick={() => onNavigate('admin')}>
          <ShieldCheck className="w-4 h-4 mr-2 inline" />
          Admin control panel
        </Button>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- Footer`
Expected: PASS, 4/4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer.tsx src/components/Footer.test.tsx
git commit -m "feat: add redesigned Footer, replacing inline App.tsx footer markup"
```

---

### Task 7: TopBar (replaces PillNav)

**Files:**
- Create: `src/components/TopBar.tsx`
- Test: `src/components/TopBar.test.tsx`

**Interfaces:**
- Consumes: `Button` (Task 3).
- Produces: `TopBar` component — `<TopBar activeTab={ClubTab} onNavigate={(tab: ClubTab) => void} authUser={{ name: string; avatarUrl?: string } | null} onLoginClick={() => void} onLogoutClick={() => void} onMenuToggle={() => void} />`. Desktop-visible nav (`hidden md:flex`); exposes a hamburger button for `MobileDrawer` (Task 8) to hook into via `onMenuToggle`, visible only below `md`.

- [ ] **Step 1: Write the failing tests**

Create `src/components/TopBar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TopBar } from './TopBar';

const NOOP = () => {};

describe('TopBar', () => {
  it('renders all seven nav items', () => {
    render(
      <TopBar
        activeTab="home"
        onNavigate={NOOP}
        authUser={null}
        onLoginClick={NOOP}
        onLogoutClick={NOOP}
        onMenuToggle={NOOP}
      />,
    );
    for (const label of ['Home', 'About', 'Achievements', 'Departments', 'Members', 'Activities', 'Certificates']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('marks the active tab with aria-current', () => {
    render(
      <TopBar
        activeTab="members"
        onNavigate={NOOP}
        authUser={null}
        onLoginClick={NOOP}
        onLogoutClick={NOOP}
        onMenuToggle={NOOP}
      />,
    );
    expect(screen.getByRole('link', { name: 'Members' })).toHaveAttribute('aria-current', 'page');
  });

  it('calls onNavigate with the tab id when a nav item is clicked', async () => {
    const onNavigate = vi.fn();
    render(
      <TopBar
        activeTab="home"
        onNavigate={onNavigate}
        authUser={null}
        onLoginClick={NOOP}
        onLogoutClick={NOOP}
        onMenuToggle={NOOP}
      />,
    );
    await userEvent.click(screen.getByRole('link', { name: 'About' }));
    expect(onNavigate).toHaveBeenCalledWith('about');
  });

  it('shows a login button when logged out and calls onLoginClick', async () => {
    const onLoginClick = vi.fn();
    render(
      <TopBar
        activeTab="home"
        onNavigate={NOOP}
        authUser={null}
        onLoginClick={onLoginClick}
        onLogoutClick={NOOP}
        onMenuToggle={NOOP}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /student login/i }));
    expect(onLoginClick).toHaveBeenCalledOnce();
  });

  it('shows the student name when logged in', () => {
    render(
      <TopBar
        activeTab="home"
        onNavigate={NOOP}
        authUser={{ name: 'Karthik' }}
        onLoginClick={NOOP}
        onLogoutClick={NOOP}
        onMenuToggle={NOOP}
      />,
    );
    expect(screen.getByText('Karthik')).toBeInTheDocument();
  });

  it('calls onMenuToggle when the mobile menu button is clicked', async () => {
    const onMenuToggle = vi.fn();
    render(
      <TopBar
        activeTab="home"
        onNavigate={NOOP}
        authUser={null}
        onLoginClick={NOOP}
        onLogoutClick={NOOP}
        onMenuToggle={onMenuToggle}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
    expect(onMenuToggle).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- TopBar`
Expected: FAIL — `Cannot find module './TopBar'`.

- [ ] **Step 3: Implement TopBar**

Create `src/components/TopBar.tsx`:

```tsx
import { LogOut, Menu } from 'lucide-react';
import { ClubTab } from '../types';
import { Button } from './ui/Button';

interface AuthUserSummary {
  name: string;
  avatarUrl?: string;
}

interface TopBarProps {
  activeTab: ClubTab;
  onNavigate: (tab: ClubTab) => void;
  authUser: AuthUserSummary | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onMenuToggle: () => void;
}

const NAV_ITEMS: { id: ClubTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'departments', label: 'Departments' },
  { id: 'members', label: 'Members' },
  { id: 'activities', label: 'Activities' },
  { id: 'certificates', label: 'Certificates' },
];

export function TopBar({
  activeTab,
  onNavigate,
  authUser,
  onLoginClick,
  onLogoutClick,
  onMenuToggle,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg-deep/90 backdrop-blur-md">
      <div className="max-w-container-max mx-auto px-gutter h-16 flex items-center justify-between gap-6">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('home');
          }}
          className="flex items-center gap-2.5 shrink-0"
        >
          <img src="/logo-nobg.png" alt="Robotics Club logo" className="w-8 h-8 object-contain" />
          <span className="font-display font-semibold text-fg-subtle text-base hidden sm:inline">
            Robotics Club
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={activeTab === item.id ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.id);
              }}
              className={[
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                activeTab === item.id
                  ? 'text-fg-primary bg-bg-card'
                  : 'text-fg-muted hover:text-fg-primary',
              ].join(' ')}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {authUser ? (
            <button
              onClick={onLogoutClick}
              className="flex items-center gap-2 text-sm text-fg-muted hover:text-fg-primary transition-colors cursor-pointer"
              title="Sign out"
            >
              {authUser.avatarUrl ? (
                <img src={authUser.avatarUrl} alt={authUser.name} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <span className="w-7 h-7 rounded-full bg-accent-blue-dim/30 flex items-center justify-center text-xs font-mono text-accent-blue-bright">
                  {authUser.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              {authUser.name}
              <LogOut className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Button variant="secondary" size="sm" onClick={onLoginClick}>
              Student login
            </Button>
          )}
        </div>

        <button
          onClick={onMenuToggle}
          aria-label="Open menu"
          className="md:hidden p-2 text-fg-muted hover:text-fg-primary transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- TopBar`
Expected: PASS, 6/6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/TopBar.tsx src/components/TopBar.test.tsx
git commit -m "feat: add TopBar, replacing PillNav"
```

---

### Task 8: MobileDrawer (replaces StaggeredMenu)

**Files:**
- Create: `src/components/MobileDrawer.tsx`
- Test: `src/components/MobileDrawer.test.tsx`

**Interfaces:**
- Consumes: `motion`/`AnimatePresence` from `motion/react` (already a dependency).
- Produces: `MobileDrawer` component — `<MobileDrawer open={boolean} activeTab={ClubTab} onNavigate={(tab: ClubTab) => void} onClose={() => void} />`.

- [ ] **Step 1: Write the failing tests**

Create `src/components/MobileDrawer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MobileDrawer } from './MobileDrawer';

const NOOP = () => {};

describe('MobileDrawer', () => {
  it('renders nothing when closed', () => {
    render(<MobileDrawer open={false} activeTab="home" onNavigate={NOOP} onClose={NOOP} />);
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument();
  });

  it('renders nav items when open', () => {
    render(<MobileDrawer open activeTab="home" onNavigate={NOOP} onClose={NOOP} />);
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Certificates' })).toBeInTheDocument();
  });

  it('calls onNavigate and onClose when a link is clicked', async () => {
    const onNavigate = vi.fn();
    const onClose = vi.fn();
    render(<MobileDrawer open activeTab="home" onNavigate={onNavigate} onClose={onClose} />);
    await userEvent.click(screen.getByRole('link', { name: 'Members' }));
    expect(onNavigate).toHaveBeenCalledWith('members');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();
    render(<MobileDrawer open activeTab="home" onNavigate={NOOP} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: /close menu/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- MobileDrawer`
Expected: FAIL — `Cannot find module './MobileDrawer'`.

- [ ] **Step 3: Implement MobileDrawer**

Create `src/components/MobileDrawer.tsx`:

```tsx
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { ClubTab } from '../types';

interface MobileDrawerProps {
  open: boolean;
  activeTab: ClubTab;
  onNavigate: (tab: ClubTab) => void;
  onClose: () => void;
}

const NAV_ITEMS: { id: ClubTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'departments', label: 'Departments' },
  { id: 'members', label: 'Members' },
  { id: 'activities', label: 'Activities' },
  { id: 'certificates', label: 'Certificates' },
];

export function MobileDrawer({ open, activeTab, onNavigate, onClose }: MobileDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 md:hidden bg-bg-deep/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.nav
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-full max-w-xs bg-bg-elevated border-l border-border-subtle p-6 flex flex-col gap-2"
          >
            <div className="flex justify-end mb-4">
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="p-2 text-fg-muted hover:text-fg-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {NAV_ITEMS.map((item, i) => (
              <motion.a
                key={item.id}
                href={`#${item.id}`}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                aria-current={activeTab === item.id ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                  onClose();
                }}
                className={[
                  'px-3 py-3 rounded-lg text-base font-medium transition-colors',
                  activeTab === item.id ? 'text-fg-primary bg-bg-card' : 'text-fg-muted hover:text-fg-primary',
                ].join(' ')}
              >
                {item.label}
              </motion.a>
            ))}
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- MobileDrawer`
Expected: PASS, 4/4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/MobileDrawer.tsx src/components/MobileDrawer.test.tsx
git commit -m "feat: add MobileDrawer, replacing StaggeredMenu"
```

---

### Task 9: AppShell

**Files:**
- Create: `src/components/AppShell.tsx`
- Test: `src/components/AppShell.test.tsx`

**Interfaces:**
- Consumes: `TopBar` (Task 7), `MobileDrawer` (Task 8), `Footer` (Task 6).
- Produces: `AppShell` component — `<AppShell activeTab={ClubTab} onNavigate={(tab: ClubTab) => void} authUser={{ name: string; avatarUrl?: string } | null} onLoginClick={() => void} onLogoutClick={() => void}>{children}</AppShell>`. Owns the mobile-drawer open/close state internally (not lifted to `App.tsx`).

- [ ] **Step 1: Write the failing tests**

Create `src/components/AppShell.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppShell } from './AppShell';

const NOOP = () => {};

describe('AppShell', () => {
  it('renders children between the TopBar and Footer', () => {
    render(
      <AppShell activeTab="home" onNavigate={NOOP} authUser={null} onLoginClick={NOOP} onLogoutClick={NOOP}>
        <p>page content</p>
      </AppShell>,
    );
    expect(screen.getByText('page content')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Homepage' })).toBeInTheDocument();
  });

  it('opens the mobile drawer when the menu button is clicked', async () => {
    render(
      <AppShell activeTab="home" onNavigate={NOOP} authUser={null} onLoginClick={NOOP} onLogoutClick={NOOP}>
        <p>page content</p>
      </AppShell>,
    );
    expect(screen.queryByLabelText('Close menu')).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Open menu'));
    expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- AppShell`
Expected: FAIL — `Cannot find module './AppShell'`.

- [ ] **Step 3: Implement AppShell**

Create `src/components/AppShell.tsx`:

```tsx
import { ReactNode, useState } from 'react';
import { ClubTab } from '../types';
import { TopBar } from './TopBar';
import { MobileDrawer } from './MobileDrawer';
import { Footer } from './Footer';

interface AuthUserSummary {
  name: string;
  avatarUrl?: string;
}

interface AppShellProps {
  activeTab: ClubTab;
  onNavigate: (tab: ClubTab) => void;
  authUser: AuthUserSummary | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  children: ReactNode;
}

export function AppShell({
  activeTab,
  onNavigate,
  authUser,
  onLoginClick,
  onLogoutClick,
  children,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-bg-deep text-fg-muted">
      <TopBar
        activeTab={activeTab}
        onNavigate={onNavigate}
        authUser={authUser}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
        onMenuToggle={() => setDrawerOpen(true)}
      />
      <MobileDrawer
        open={drawerOpen}
        activeTab={activeTab}
        onNavigate={onNavigate}
        onClose={() => setDrawerOpen(false)}
      />
      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-12 relative z-10">
        {children}
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- AppShell`
Expected: PASS, 2/2 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/AppShell.tsx src/components/AppShell.test.tsx
git commit -m "feat: add AppShell composing TopBar, MobileDrawer, and Footer"
```

---

### Task 10: Wire AppShell into App.tsx and delete the old shell components

**Files:**
- Modify: `src/App.tsx`
- Delete: `src/components/PillNav.tsx`
- Delete: `src/components/StaggeredMenu.tsx`
- Delete: `src/components/LoadingScreen.tsx`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: `AppShell` (Task 9).

- [ ] **Step 1: Write the failing test**

Create `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  isAuthorizedStudentEmail: vi.fn().mockReturnValue(true),
}));

import App from './App';

describe('App', () => {
  it('renders the home view by default with no loading spinner', () => {
    render(<App />);
    expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- App.test`
Expected: FAIL — either the spinner is still present, or the `Home` link (from the new `TopBar`) doesn't exist yet, since `App.tsx` hasn't been rewired.

- [ ] **Step 3: Rewrite App.tsx to use AppShell**

Replace the full contents of `src/App.tsx`:

```tsx
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ShieldAlert, X } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { ClubTab } from './types';
import { supabase, signInWithGoogle, signOut, isAuthorizedStudentEmail } from './lib/supabase';
import { AppShell } from './components/AppShell';

import HomeView from './components/HomeView';
import ActivitiesView from './components/ActivitiesView';

const AboutView = React.lazy(() => import('./components/AboutView'));
const DepartmentsView = React.lazy(() => import('./components/DepartmentsView'));
const MembersView = React.lazy(() => import('./components/MembersView'));
const CertificatesView = React.lazy(() => import('./components/CertificatesView'));
const AdminView = React.lazy(() => import('./components/AdminView'));
const AchievementsView = React.lazy(() => import('./components/AchievementsView'));

export default function App() {
  const [activeTab, setActiveTab] = useState<ClubTab>('home');
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        if (isAuthorizedStudentEmail(session.user.email)) {
          setAuthUser(session.user);
          setAuthError(null);
        } else {
          const rejectedEmail = session.user.email || 'Unknown email';
          signOut().then(() => {
            setAuthUser(null);
            setAuthError(`Access Denied: ${rejectedEmail} is not authorized. Only @vitstudent.ac.in accounts are permitted.`);
          });
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        if (isAuthorizedStudentEmail(session.user.email)) {
          setAuthUser(session.user);
          setAuthError(null);
        } else {
          const rejectedEmail = session.user.email || 'Unknown email';
          await signOut();
          setAuthUser(null);
          setAuthError(`Access Denied: ${rejectedEmail} is not authorized. Only @vitstudent.ac.in accounts are permitted.`);
        }
      } else {
        setAuthUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) setAuthError(error.message);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to initialize Google login.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setAuthUser(null);
      localStorage.removeItem('vit_robotics_club_admin_session');
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  const handleNavigate = (tab: ClubTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const authUserSummary = authUser
    ? {
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Student',
        avatarUrl: authUser.user_metadata?.avatar_url,
      }
    : null;

  return (
    <>
      <AnimatePresence>
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 inset-x-0 z-50 bg-red-950/95 border-b border-red-500/50 backdrop-blur-md px-4 py-3 text-red-200 text-xs flex items-center justify-between shadow-2xl"
          >
            <div className="max-w-container-max mx-auto w-full flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                <span className="font-mono">{authError}</span>
              </div>
              <button
                onClick={() => setAuthError(null)}
                className="p-1 hover:bg-red-900/50 rounded text-red-400 hover:text-white transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AppShell
        activeTab={activeTab}
        onNavigate={handleNavigate}
        authUser={authUserSummary}
        onLoginClick={handleGoogleLogin}
        onLogoutClick={handleLogout}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <React.Suspense
              fallback={
                <div className="w-full flex justify-center py-24">
                  <div className="w-8 h-8 border-2 border-accent-blue-dim border-t-accent-blue rounded-full animate-spin" />
                </div>
              }
            >
              {activeTab === 'home' && <HomeView onNavigate={(tab) => handleNavigate(tab as ClubTab)} />}
              {activeTab === 'about' && <AboutView />}
              {activeTab === 'achievements' && <AchievementsView />}
              {activeTab === 'departments' && <DepartmentsView />}
              {activeTab === 'members' && <MembersView />}
              {activeTab === 'activities' && <ActivitiesView />}
              {activeTab === 'certificates' && <CertificatesView />}
              {activeTab === 'admin' && <AdminView />}
            </React.Suspense>
          </motion.div>
        </AnimatePresence>
      </AppShell>
    </>
  );
}
```

Note: the route-content `animate-spin` fallback above is Suspense's per-lazy-route spinner (shown briefly while a code-split view chunk loads), not the removed full-page `LoadingScreen`. The App test asserts no spinner is present *on initial render* of the already-loaded `home` route, so this fallback never renders in that test.

- [ ] **Step 4: Delete the obsolete components**

```bash
git rm src/components/PillNav.tsx src/components/StaggeredMenu.tsx src/components/LoadingScreen.tsx
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- App.test`
Expected: PASS, 1/1 test.

- [ ] **Step 6: Run the full test suite and the build**

Run: `npm test && npx tsc --noEmit`
Expected: all tests pass; no type errors (this also catches any remaining import of the deleted components).

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: wire AppShell into App.tsx; remove LoadingScreen, PillNav, StaggeredMenu"
```

---

## Plan Self-Review Notes

- **Spec coverage:** this plan implements spec §3 (color tokens, typography scale, anti-cliché footer fix) and the Navigation/Loading rows of the §6 component table. It intentionally does **not** implement §4 (Hero), §5 (Command Palette), the Gallery/Events/Members rows of §6, §7 (motion on content pages), or §8 (Admin/Certificates) — those are separate subsystems per the writing-plans Scope Check and get their own plan files, built in this order: (1) this plan, (2) Command Palette, (3) Hero, (4) Content pages (Gallery/Events/Members), (5) Admin Terminal, (6) Certificate Portal. Each unlocks working, reviewable software on its own.
- **Placeholder scan:** no TBD/TODO; every step has real, complete code.
- **Type consistency:** `ClubTab` is imported from the existing `./types` in every new component rather than redefined. `AuthUserSummary` shape (`{ name: string; avatarUrl?: string }`) is used identically in `TopBar` and `AppShell`. Component prop names match between producer (Task 9's `AppShell` props) and consumer (Task 10's `App.tsx` usage: `activeTab`, `onNavigate`, `authUser`, `onLoginClick`, `onLogoutClick`).
