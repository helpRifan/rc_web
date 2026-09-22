# Command Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a global ⌘K/Ctrl+K command palette (instant navigation + live search across members/events/gallery) and vim-style `g`-chord direct navigation, on top of the app shell the Foundation phase already shipped.

**Architecture:** Two small, independently-testable pure/hook units (a shared nav-items list, and a search-index builder/filter) feed one modal UI component (`CommandPalette`, styled like `MobileDrawer`'s existing overlay+panel pattern) and one keyboard-listener hook (`useCommandPaletteHotkeys`). `AppShell` composes them the same way it already composes `TopBar`/`MobileDrawer`/`Footer`.

**Tech Stack:** React 19, TypeScript, Vite 6, Tailwind v4 (design tokens from the Foundation phase), `motion` (Framer Motion) — no new dependencies.

**Spec:** [docs/superpowers/specs/2026-09-22-rc-web-redesign-design.md](../specs/2026-09-22-rc-web-redesign-design.md) (§5, Global Command Palette)

## Global Constraints

- Color tokens (from Foundation phase, already in `src/index.css`): `bg-bg-elevated`, `bg-bg-deep`, `border-border-subtle`, `border-border-focus`, `text-fg-primary`, `text-fg-subtle`, `text-fg-muted`, `text-accent-blue`, `text-accent-blue-bright` — never raw hex.
- Typography: `font-display` (Syne) for the palette's section headings; `font-mono` (JetBrains Mono) **only** for literal keybinding hints (`⌘K`, `Esc`, `↑↓`, `Enter`) — this is the one spec-sanctioned use of mono-as-label, not a license to use it elsewhere in this plan.
- Anti-cliché guardrails (binding, same as Foundation phase): no tracked-out ALL-CAPS labels, no middot-joined meta strings, no em-dash label chrome, no arrows appended to text, no decorative numbered markers.
- Motion: `transform`/`opacity` only for CSS-driven motion. The Foundation phase's global `prefers-reduced-motion` CSS reset (`src/index.css`) only zeroes CSS `animation`/`transition` durations — it does **not** affect Framer Motion's JS-driven spring physics (a gap the Foundation phase's final review explicitly deferred). This plan's new `CommandPalette` component must check `useReducedMotion()` from `motion/react` itself and skip the spring entrance when true, rather than adding to that debt.
- `ClubTab` is `"home" | "about" | "departments" | "members" | "activities" | "certificates" | "admin" | "achievements"` (`src/types.ts`) — already defined, do not redeclare it.
- **Spec defect fixed by this plan:** §5's vim-chord table assigns `G A` to both "About" and "Admin" — a real collision. This plan resolves it: `g w` → Achievements (mnemonic: "wins"), `g x` → Admin (arbitrary, avoids the `a` collision with About). Full mapping in Task 3.
- **Out of scope (deferred to the Admin Terminal phase, Phase 5):** the spec's admin-only "Actions" tab ("New Event", "Verify Certificate", "Add Member", "Export Roster") — none of those actions exist yet to wire up, and building non-functional stub UI for them would violate YAGNI. This plan builds Navigate + Search only.
- **Out of scope (deferred to the Content Pages phase, Phase 4):** item-level deep-linking (scrolling to and highlighting a specific member/event/gallery item within its view). `MembersView`/`ActivitiesView`/`AboutView` have no such hook today; adding one means restructuring those views, which is that phase's job. This plan's search results navigate to the correct **tab** only.

## File Structure

- `src/nav.ts` — new. Exports `CLUB_NAV_ITEMS: { id: ClubTab; label: string }[]`, the canonical 8-route list (includes `admin`, unlike `TopBar`/`MobileDrawer`'s current 7-item top-level nav). Fixes a duplication the Foundation phase's final review flagged and predicted this exact need for.
- `src/components/TopBar.tsx` — modify. Import `CLUB_NAV_ITEMS` instead of its own local `NAV_ITEMS`; add a `⌘K` trigger button; add an `onPaletteOpen` prop.
- `src/components/MobileDrawer.tsx` — modify. Import `CLUB_NAV_ITEMS` instead of its own local `NAV_ITEMS` (behavior-preserving — still filters out `admin`).
- `src/components/CommandPalette/searchIndex.ts` — new. Pure functions: `buildSearchIndex()` and `filterSearchIndex(query, index)`.
- `src/components/CommandPalette/searchIndex.test.tsx` — new.
- `src/components/CommandPalette/useCommandPaletteHotkeys.ts` — new. Hook: global ⌘K/Ctrl+K toggle + vim `g`-chords.
- `src/components/CommandPalette/useCommandPaletteHotkeys.test.tsx` — new.
- `src/components/CommandPalette/CommandPalette.tsx` — new. The modal itself.
- `src/components/CommandPalette/CommandPalette.test.tsx` — new.
- `src/components/AppShell.tsx` — modify. Mounts `useCommandPaletteHotkeys` + `<CommandPalette>`, passes `onPaletteOpen` to `TopBar`.
- `src/components/AppShell.test.tsx`, `src/components/TopBar.test.tsx` — modify. Add coverage for the new wiring.

---

### Task 1: Shared nav-items list (`src/nav.ts`)

**Files:**
- Create: `src/nav.ts`
- Test: `src/nav.test.ts`
- Modify: `src/components/TopBar.tsx`
- Modify: `src/components/MobileDrawer.tsx`

**Interfaces:**
- Produces: `CLUB_NAV_ITEMS: { id: ClubTab; label: string }[]` — 8 entries, `admin` included, `home` first.
- Consumed by: `TopBar.tsx`, `MobileDrawer.tsx` (both filter out `admin`), and Task 4's `CommandPalette.tsx` (uses the full 8-item list).

This is a behavior-preserving refactor for `TopBar`/`MobileDrawer` — their rendered output does not change, so their existing test files should still pass unmodified. Verify that as the test for this task, plus one new assertion on the list itself.

- [ ] **Step 1: Write the failing test**

Create `src/nav.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { CLUB_NAV_ITEMS } from './nav';

describe('CLUB_NAV_ITEMS', () => {
  it('has 8 entries starting with home and including admin', () => {
    expect(CLUB_NAV_ITEMS).toHaveLength(8);
    expect(CLUB_NAV_ITEMS[0]).toEqual({ id: 'home', label: 'Home' });
    expect(CLUB_NAV_ITEMS.some((item) => item.id === 'admin')).toBe(true);
  });

  it('has no duplicate ids', () => {
    const ids = CLUB_NAV_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- nav.test`
Expected: FAIL — `Cannot find module './nav'`.

- [ ] **Step 3: Create `src/nav.ts`**

```ts
import { ClubTab } from './types';

export const CLUB_NAV_ITEMS: { id: ClubTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'departments', label: 'Departments' },
  { id: 'members', label: 'Members' },
  { id: 'activities', label: 'Activities' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'admin', label: 'Admin' },
];
```

- [ ] **Step 4: Update `TopBar.tsx` to use the shared list**

In `src/components/TopBar.tsx`, replace the local `NAV_ITEMS` declaration:

```ts
const NAV_ITEMS: { id: ClubTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'departments', label: 'Departments' },
  { id: 'members', label: 'Members' },
  { id: 'activities', label: 'Activities' },
  { id: 'certificates', label: 'Certificates' },
];
```

with:

```ts
const NAV_ITEMS = CLUB_NAV_ITEMS.filter((item) => item.id !== 'admin');
```

Add the import at the top: `import { CLUB_NAV_ITEMS } from '../nav';`

- [ ] **Step 5: Update `MobileDrawer.tsx` the same way**

Same change: replace the local `NAV_ITEMS` array literal with `const NAV_ITEMS = CLUB_NAV_ITEMS.filter((item) => item.id !== 'admin');` and add `import { CLUB_NAV_ITEMS } from '../nav';`.

- [ ] **Step 6: Run tests to verify everything passes**

Run: `npm test`
Expected: all existing tests still pass (this refactor changes no rendered output), plus the 2 new `nav.test.ts` tests pass.

- [ ] **Step 7: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean, zero output.

- [ ] **Step 8: Commit**

```bash
git add src/nav.ts src/nav.test.ts src/components/TopBar.tsx src/components/MobileDrawer.tsx
git commit -m "refactor: extract shared CLUB_NAV_ITEMS, dedupe TopBar/MobileDrawer nav lists"
```

---

### Task 2: Search index (`searchIndex.ts`)

**Files:**
- Create: `src/components/CommandPalette/searchIndex.ts`
- Test: `src/components/CommandPalette/searchIndex.test.tsx`

**Interfaces:**
- Produces: `interface SearchEntry { id: string; type: 'member' | 'event' | 'gallery'; title: string; subtitle: string; targetTab: ClubTab }`, `buildSearchIndex(): SearchEntry[]`, `filterSearchIndex(query: string, index: SearchEntry[]): SearchEntry[]`.
- Consumed by: Task 4's `CommandPalette.tsx`.

Data sources (already in the repo, verified against actual view usage): `CLUB_MEMBERS` (`src/data.ts`) → `targetTab: 'members'` (matches `MembersView.tsx`'s import); `UPCOMING_EVENTS` (`src/data.ts`) → `targetTab: 'activities'` (matches `ActivitiesView.tsx`); `GALLERY_ITEMS` (`src/data.ts`) → `targetTab: 'about'` (matches `AboutView.tsx`).

- [ ] **Step 1: Write the failing tests**

Create `src/components/CommandPalette/searchIndex.test.tsx`:

```ts
import { describe, expect, it } from 'vitest';
import { buildSearchIndex, filterSearchIndex } from './searchIndex';

describe('buildSearchIndex', () => {
  it('includes members, events, and gallery items with the right target tabs', () => {
    const index = buildSearchIndex();
    expect(index.some((e) => e.type === 'member' && e.targetTab === 'members')).toBe(true);
    expect(index.some((e) => e.type === 'event' && e.targetTab === 'activities')).toBe(true);
    expect(index.some((e) => e.type === 'gallery' && e.targetTab === 'about')).toBe(true);
  });

  it('gives every entry a non-empty id and title', () => {
    const index = buildSearchIndex();
    expect(index.length).toBeGreaterThan(0);
    for (const entry of index) {
      expect(entry.id).toBeTruthy();
      expect(entry.title).toBeTruthy();
    }
  });
});

describe('filterSearchIndex', () => {
  const index = buildSearchIndex();

  it('returns an empty array for an empty query', () => {
    expect(filterSearchIndex('', index)).toEqual([]);
    expect(filterSearchIndex('   ', index)).toEqual([]);
  });

  it('matches case-insensitively against title or subtitle', () => {
    const results = filterSearchIndex('robosumo', index);
    expect(results.some((r) => r.title.toLowerCase().includes('robosumo'))).toBe(true);
  });

  it('caps results at 8', () => {
    const results = filterSearchIndex('a', index);
    expect(results.length).toBeLessThanOrEqual(8);
  });

  it('returns no results for a nonsense query', () => {
    expect(filterSearchIndex('zzzzznonexistentquery', index)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- searchIndex`
Expected: FAIL — `Cannot find module './searchIndex'`.

- [ ] **Step 3: Implement `searchIndex.ts`**

Create `src/components/CommandPalette/searchIndex.ts`:

```ts
import { CLUB_MEMBERS, UPCOMING_EVENTS, GALLERY_ITEMS } from '../../data';
import { ClubTab } from '../../types';

export interface SearchEntry {
  id: string;
  type: 'member' | 'event' | 'gallery';
  title: string;
  subtitle: string;
  targetTab: ClubTab;
}

const RESULT_CAP = 8;

export function buildSearchIndex(): SearchEntry[] {
  const memberEntries: SearchEntry[] = CLUB_MEMBERS.map((member, i) => ({
    id: `member-${i}-${member.name}`,
    type: 'member',
    title: member.name,
    subtitle: member.role,
    targetTab: 'members',
  }));

  const eventEntries: SearchEntry[] = UPCOMING_EVENTS.map((event, i) => ({
    id: `event-${i}-${event.title}`,
    type: 'event',
    title: event.title,
    subtitle: event.date,
    targetTab: 'activities',
  }));

  const galleryEntries: SearchEntry[] = GALLERY_ITEMS.map((item) => ({
    id: `gallery-${item.id}`,
    type: 'gallery',
    title: item.title,
    subtitle: item.subtitle ?? '',
    targetTab: 'about',
  }));

  return [...memberEntries, ...eventEntries, ...galleryEntries];
}

export function filterSearchIndex(query: string, index: SearchEntry[]): SearchEntry[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  return index
    .filter(
      (entry) =>
        entry.title.toLowerCase().includes(trimmed) || entry.subtitle.toLowerCase().includes(trimmed),
    )
    .slice(0, RESULT_CAP);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- searchIndex`
Expected: PASS, 6/6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/CommandPalette/searchIndex.ts src/components/CommandPalette/searchIndex.test.tsx
git commit -m "feat: add command palette search index"
```

---

### Task 3: Hotkey hook (`useCommandPaletteHotkeys`)

**Files:**
- Create: `src/components/CommandPalette/useCommandPaletteHotkeys.ts`
- Test: `src/components/CommandPalette/useCommandPaletteHotkeys.test.tsx`

**Interfaces:**
- Produces: `useCommandPaletteHotkeys(onNavigate: (tab: ClubTab) => void): { open: boolean; setOpen: (open: boolean) => void }`.
- Consumed by: Task 5's `AppShell.tsx`.

Behavior:
- `⌘K` (Mac) / `Ctrl+K` (Windows/Linux) toggles `open`, and calls `preventDefault()` (browsers/some OSes bind Ctrl+K to other things).
- `g` followed by one of `h a w d m e c x` within 600ms navigates directly via `onNavigate` — it does **not** open the palette. Mapping: `h`→home, `a`→about, `w`→achievements, `d`→departments, `m`→members, `e`→activities, `c`→certificates, `x`→admin (see Global Constraints for why this differs from the spec's own colliding `g a` table).
- Both `⌘K` and `g`-chords are ignored while focus is inside an `<input>`, `<textarea>`, or any `[contenteditable]` element — so typing "cat" in a form field never accidentally triggers `g` + `a`... wait, only bare keypresses starting a chord with no modifiers count, and only when NOT focused in a text-entry element.
- Listeners attach on mount, detach on unmount (via `useEffect` cleanup) — this hook's consumer is `AppShell`, which is mounted once at the app root, so this is effectively global.

- [ ] **Step 1: Write the failing tests**

Create `src/components/CommandPalette/useCommandPaletteHotkeys.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useCommandPaletteHotkeys } from './useCommandPaletteHotkeys';

function TestHost({ onNavigate }: { onNavigate: (tab: any) => void }) {
  const { open } = useCommandPaletteHotkeys(onNavigate);
  return (
    <div>
      <p>palette is {open ? 'open' : 'closed'}</p>
      <input aria-label="some field" />
    </div>
  );
}

describe('useCommandPaletteHotkeys', () => {
  it('toggles open on Ctrl+K', async () => {
    render(<TestHost onNavigate={vi.fn()} />);
    expect(screen.getByText('palette is closed')).toBeInTheDocument();
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(screen.getByText('palette is open')).toBeInTheDocument();
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(screen.getByText('palette is closed')).toBeInTheDocument();
  });

  it('navigates on a g-chord (g then h) without opening the palette', async () => {
    const onNavigate = vi.fn();
    render(<TestHost onNavigate={onNavigate} />);
    await userEvent.keyboard('gh');
    expect(onNavigate).toHaveBeenCalledWith('home');
    expect(screen.getByText('palette is closed')).toBeInTheDocument();
  });

  it('resolves the g-a collision: g then w is achievements, g then x is admin', async () => {
    const onNavigate = vi.fn();
    render(<TestHost onNavigate={onNavigate} />);
    await userEvent.keyboard('gw');
    expect(onNavigate).toHaveBeenLastCalledWith('achievements');
    await userEvent.keyboard('gx');
    expect(onNavigate).toHaveBeenLastCalledWith('admin');
  });

  it('ignores g-chords while typing in an input', async () => {
    const onNavigate = vi.fn();
    render(<TestHost onNavigate={onNavigate} />);
    await userEvent.click(screen.getByLabelText('some field'));
    await userEvent.keyboard('gh');
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- useCommandPaletteHotkeys`
Expected: FAIL — `Cannot find module './useCommandPaletteHotkeys'`.

- [ ] **Step 3: Implement the hook**

Create `src/components/CommandPalette/useCommandPaletteHotkeys.ts`:

```ts
import { useEffect, useRef, useState } from 'react';
import { ClubTab } from '../../types';

const G_CHORD_MAP: Record<string, ClubTab> = {
  h: 'home',
  a: 'about',
  w: 'achievements',
  d: 'departments',
  m: 'members',
  e: 'activities',
  c: 'certificates',
  x: 'admin',
};

const G_CHORD_WINDOW_MS = 600;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
}

export function useCommandPaletteHotkeys(onNavigate: (tab: ClubTab) => void) {
  const [open, setOpen] = useState(false);
  const awaitingChordRef = useRef(false);
  const chordTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function clearChordWindow() {
      awaitingChordRef.current = false;
      if (chordTimeoutRef.current) {
        clearTimeout(chordTimeoutRef.current);
        chordTimeoutRef.current = null;
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;

      const isModifierCombo = e.metaKey || e.ctrlKey || e.altKey;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
        clearChordWindow();
        return;
      }

      if (isModifierCombo) return;

      if (awaitingChordRef.current) {
        const target = G_CHORD_MAP[e.key.toLowerCase()];
        clearChordWindow();
        if (target) {
          e.preventDefault();
          onNavigate(target);
        }
        return;
      }

      if (e.key.toLowerCase() === 'g') {
        awaitingChordRef.current = true;
        chordTimeoutRef.current = setTimeout(clearChordWindow, G_CHORD_WINDOW_MS);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearChordWindow();
    };
  }, [onNavigate]);

  return { open, setOpen };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- useCommandPaletteHotkeys`
Expected: PASS, 4/4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/CommandPalette/useCommandPaletteHotkeys.ts src/components/CommandPalette/useCommandPaletteHotkeys.test.tsx
git commit -m "feat: add command palette hotkey hook (Ctrl+K toggle, g-chords)"
```

---

### Task 4: `CommandPalette` component

**Files:**
- Create: `src/components/CommandPalette/CommandPalette.tsx`
- Test: `src/components/CommandPalette/CommandPalette.test.tsx`

**Interfaces:**
- Consumes: `CLUB_NAV_ITEMS` (Task 1), `buildSearchIndex`/`filterSearchIndex`/`SearchEntry` (Task 2).
- Produces: `CommandPalette({ open, onClose, onNavigate }: { open: boolean; onClose: () => void; onNavigate: (tab: ClubTab) => void })`.

Behavior:
- Renders nothing when `open` is false (same pattern as `MobileDrawer`).
- On open: backdrop + centered panel, autofocused text input.
- Empty query: show `CLUB_NAV_ITEMS` under a "Navigate" heading (all 8 routes).
- Non-empty query: filter `CLUB_NAV_ITEMS` by label (case-insensitive substring) for a (possibly narrowed) "Navigate" section, and show `filterSearchIndex(query, buildSearchIndex())` under a "Search" heading — both sections can show at once.
- `Escape` closes. Clicking the backdrop closes. Clicking inside the panel does not.
- `ArrowDown`/`ArrowUp` move a selection index across the flattened, currently-visible result list (nav results first, then search results); `Enter` activates the selected item — calls `onNavigate(targetTab)` then `onClose()`.
- Respects `prefers-reduced-motion` itself via `useReducedMotion()` — when true, skip the spring transition (render with `transition={{ duration: 0 }}` or omit the `motion` wrapper's animated properties).

- [ ] **Step 1: Write the failing tests**

Create `src/components/CommandPalette/CommandPalette.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CommandPalette } from './CommandPalette';

const NOOP = () => {};

describe('CommandPalette', () => {
  it('renders nothing when closed', () => {
    render(<CommandPalette open={false} onClose={NOOP} onNavigate={NOOP} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('shows all 8 nav items when open with an empty query', () => {
    render(<CommandPalette open onClose={NOOP} onNavigate={NOOP} />);
    expect(screen.getByText('Navigate')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Certificates')).toBeInTheDocument();
  });

  it('navigates and closes when a nav item is clicked', async () => {
    const onNavigate = vi.fn();
    const onClose = vi.fn();
    render(<CommandPalette open onClose={onClose} onNavigate={onNavigate} />);
    await userEvent.click(screen.getByText('Members'));
    expect(onNavigate).toHaveBeenCalledWith('members');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('filters nav items and shows search results as the user types', async () => {
    render(<CommandPalette open onClose={NOOP} onNavigate={NOOP} />);
    await userEvent.type(screen.getByRole('textbox'), 'robosumo');
    expect(screen.queryByText('Members')).not.toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(<CommandPalette open onClose={onClose} onNavigate={NOOP} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes when the backdrop is clicked but not when the panel is clicked', async () => {
    const onClose = vi.fn();
    render(<CommandPalette open onClose={onClose} onNavigate={NOOP} />);
    await userEvent.click(screen.getByRole('textbox'));
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.click(screen.getByTestId('command-palette-backdrop'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- CommandPalette.test`
Expected: FAIL — `Cannot find module './CommandPalette'`.

- [ ] **Step 3: Implement `CommandPalette.tsx`**

Create `src/components/CommandPalette/CommandPalette.tsx`:

```tsx
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CLUB_NAV_ITEMS } from '../../nav';
import { ClubTab } from '../../types';
import { buildSearchIndex, filterSearchIndex } from './searchIndex';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (tab: ClubTab) => void;
}

export function CommandPalette({ open, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const searchIndex = useMemo(() => buildSearchIndex(), []);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  const trimmedQuery = query.trim().toLowerCase();
  const navResults = trimmedQuery
    ? CLUB_NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(trimmedQuery))
    : CLUB_NAV_ITEMS;
  const searchResults = trimmedQuery ? filterSearchIndex(query, searchIndex) : [];

  type FlatResult = { key: string; label: string; targetTab: ClubTab };
  const flatResults: FlatResult[] = [
    ...navResults.map((item) => ({ key: `nav-${item.id}`, label: item.label, targetTab: item.id })),
    ...searchResults.map((entry) => ({ key: entry.id, label: entry.title, targetTab: entry.targetTab })),
  ];

  function activate(targetTab: ClubTab) {
    onNavigate(targetTab);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Enter') {
      const selected = flatResults[selectedIndex];
      if (selected) activate(selected.targetTab);
    }
  }

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, damping: 28, stiffness: 320 };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-testid="command-palette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          className="fixed inset-0 z-50 bg-bg-deep/80 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={transition}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            className="w-full max-w-xl bg-bg-elevated border border-border-subtle rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search or jump to..."
                className="flex-1 bg-transparent text-fg-primary placeholder:text-fg-dim outline-none text-sm"
              />
              <span className="font-mono text-xs text-fg-dim border border-border-subtle rounded px-1.5 py-0.5">
                Esc
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto py-2">
              {navResults.length > 0 && (
                <div className="px-2 pb-2">
                  <p className="font-display text-xs text-fg-dim px-2 py-1">Navigate</p>
                  {navResults.map((item) => {
                    const flatIdx = flatResults.findIndex((r) => r.key === `nav-${item.id}`);
                    return (
                      <button
                        key={item.id}
                        onClick={() => activate(item.id)}
                        className={[
                          'w-full text-left px-2 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                          flatIdx === selectedIndex
                            ? 'bg-bg-card text-fg-primary'
                            : 'text-fg-muted hover:bg-bg-card hover:text-fg-primary',
                        ].join(' ')}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="px-2 pb-2">
                  <p className="font-display text-xs text-fg-dim px-2 py-1">Search</p>
                  {searchResults.map((entry) => {
                    const flatIdx = flatResults.findIndex((r) => r.key === entry.id);
                    return (
                      <button
                        key={entry.id}
                        onClick={() => activate(entry.targetTab)}
                        className={[
                          'w-full text-left px-2 py-2 rounded-lg text-sm transition-colors cursor-pointer flex flex-col',
                          flatIdx === selectedIndex
                            ? 'bg-bg-card text-fg-primary'
                            : 'text-fg-muted hover:bg-bg-card hover:text-fg-primary',
                        ].join(' ')}
                      >
                        <span>{entry.title}</span>
                        <span className="text-xs text-fg-dim">{entry.subtitle}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {trimmedQuery && flatResults.length === 0 && (
                <p className="text-sm text-fg-dim px-4 py-6 text-center">No results for "{query}"</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- CommandPalette.test`
Expected: PASS, 6/6 tests.

- [ ] **Step 5: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/components/CommandPalette/CommandPalette.tsx src/components/CommandPalette/CommandPalette.test.tsx
git commit -m "feat: add CommandPalette modal (Navigate + Search sections)"
```

---

### Task 5: Wire into `AppShell` + `TopBar` trigger button

**Files:**
- Modify: `src/components/AppShell.tsx`
- Modify: `src/components/TopBar.tsx`
- Modify: `src/components/AppShell.test.tsx`
- Modify: `src/components/TopBar.test.tsx`

**Interfaces:**
- Consumes: `useCommandPaletteHotkeys` (Task 3), `CommandPalette` (Task 4).
- `TopBarProps` gains `onPaletteOpen: () => void`.

- [ ] **Step 1: Write the failing tests**

**Before adding the new test:** `onPaletteOpen` will be a required prop on `TopBarProps` (Step 3 below), so every existing `render(<TopBar .../>)` call in `src/components/TopBar.test.tsx` (there are 6 of them, one per existing `it` block) will fail to type-check the moment that prop is added. Go through the file first and add `onPaletteOpen={NOOP}` to every one of those 6 existing render calls — do this before writing the new test, and don't change anything else about those 6 tests.

Then add this new `it` block inside the existing `describe('TopBar', ...)`:

```tsx
it('calls onPaletteOpen when the command palette trigger is clicked', async () => {
  const onPaletteOpen = vi.fn();
  render(
    <TopBar
      activeTab="home"
      onNavigate={NOOP}
      authUser={null}
      onLoginClick={NOOP}
      onLogoutClick={NOOP}
      onMenuToggle={NOOP}
      onPaletteOpen={onPaletteOpen}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: /search/i }));
  expect(onPaletteOpen).toHaveBeenCalledOnce();
});
```

Add to `src/components/AppShell.test.tsx` (new `it` block, keep the existing two tests as-is):

```tsx
it('opens the command palette on Ctrl+K', async () => {
  render(
    <AppShell activeTab="home" onNavigate={NOOP} authUser={null} onLoginClick={NOOP} onLogoutClick={NOOP}>
      <p>page content</p>
    </AppShell>,
  );
  expect(screen.queryByPlaceholderText('Search or jump to...')).not.toBeInTheDocument();
  await userEvent.keyboard('{Control>}k{/Control}');
  expect(screen.getByPlaceholderText('Search or jump to...')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- TopBar.test AppShell.test`
Expected: FAIL — `onPaletteOpen` doesn't exist on `TopBarProps` yet (TS error surfaces as a test failure/build error), and the palette isn't mounted in `AppShell` yet.

- [ ] **Step 3: Add the trigger button to `TopBar.tsx`**

Add `onPaletteOpen: () => void;` to `TopBarProps`, add it to the destructured props, and add a button next to the auth block (inside the `hidden md:flex items-center gap-3` div, before the auth ternary):

```tsx
<button
  onClick={onPaletteOpen}
  aria-label="Search"
  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border-subtle text-fg-muted hover:text-fg-primary hover:border-border-default transition-colors cursor-pointer"
>
  <Search className="w-3.5 h-3.5" />
  <span className="font-mono text-xs">⌘K</span>
</button>
```

Add `Search` to the `lucide-react` import at the top of the file (alongside the existing `LogOut, Menu`).

- [ ] **Step 4: Wire `AppShell.tsx`**

Add these imports:

```ts
import { CommandPalette } from './CommandPalette/CommandPalette';
import { useCommandPaletteHotkeys } from './CommandPalette/useCommandPaletteHotkeys';
```

Inside the `AppShell` function body, add:

```ts
const { open: paletteOpen, setOpen: setPaletteOpen } = useCommandPaletteHotkeys(onNavigate);
```

Pass `onPaletteOpen={() => setPaletteOpen(true)}` to the `<TopBar>` element.

Add `<CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onNavigate={onNavigate} />` as a new element inside the root div (place it right after the closing `</MobileDrawer>` tag, before `<main>`).

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: all tests pass, including the 2 new ones.

- [ ] **Step 6: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add src/components/AppShell.tsx src/components/TopBar.tsx src/components/AppShell.test.tsx src/components/TopBar.test.tsx
git commit -m "feat: wire CommandPalette and hotkeys into AppShell, add TopBar trigger"
```

---

## Plan Self-Review Notes

- **Spec coverage:** implements spec §5's Navigate tab and Search tab in full, and the vim `g`-chords, fixing the spec's own `g a` collision explicitly (documented in Global Constraints). The Actions tab is deliberately deferred to Phase 5 (Admin Terminal) since none of its target actions exist yet — building it now would be dead UI, which violates the spec's own YAGNI principle from the frontend-design skill review this project adopted.
- **Placeholder scan:** no TBD/TODO; every step has complete, real code.
- **Type consistency:** `SearchEntry`, `CLUB_NAV_ITEMS`, and the `useCommandPaletteHotkeys` return shape (`{ open, setOpen }`) are each defined once (Tasks 1–3) and consumed with identical names/shapes in every later task (Tasks 4–5). `ClubTab` is imported from the existing `src/types.ts` everywhere, never redeclared.
- **Reduced-motion follow-through:** unlike the Foundation phase's deferred per-component gap, this plan's `CommandPalette` checks `useReducedMotion()` itself (Task 4) rather than adding to that debt.
