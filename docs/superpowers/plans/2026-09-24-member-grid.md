# Member Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `MembersView.tsx`'s duplicated card markup and full-screen modal with a shared `MemberCard`, a department-tabbed `MemberGrid`, and a slide-over `MemberDrawer` — removing the anti-cliché violations (fake "Level 01/02/03" hierarchy framing, ALL-CAPS tracked labels, middot-joined meta strings, arrow-suffixed CTAs) that were explicitly called out as "AI flopped" in the original brief.

**Architecture:** Three new presentational components (`MemberCard`, `MemberGrid`, `MemberDrawer` — the last following the already-shipped `MobileDrawer`'s slide-over pattern: Framer Motion spring, Escape-to-close, body-scroll lock, backdrop click) replace the inline card JSX and modal in `MembersView.tsx`. The Board tier and Core-team tier both render through the same `MemberCard`, so there is one card design instead of two near-duplicates.

**Tech Stack:** React 19, TypeScript, Vite 6, Tailwind v4, `motion` (Framer Motion), Vitest + React Testing Library.

**Spec:** [docs/superpowers/specs/2026-09-22-rc-web-redesign-design.md](../specs/2026-09-22-rc-web-redesign-design.md) (§6 component table: "Members | Modal-heavy | MemberGrid (department tabs) + MemberDrawer (slide-over, not modal)")

## Global Constraints

- Color tokens (already in `src/index.css`, from the Foundation phase): `bg-bg-deep`, `bg-bg-card`, `bg-bg-elevated`, `text-fg-primary`, `text-fg-subtle`, `text-fg-muted`, `text-fg-dim`, `text-accent-blue`, `text-accent-blue-bright`, `border-border-subtle`, `border-border-default`, `border-border-focus`. Never raw hex — this file currently uses `#e8b828`/`#101010`/`#0c0c0e`/zinc-* throughout; all of that goes.
- Typography: `font-display` (Syne) for section headings; `font-mono` (JetBrains Mono) **only** for genuinely code-like data (nothing in this plan's scope is data-like — role titles, department names, and bios are all prose, so `font-mono` should not appear anywhere in the new components, unlike the current file which uses it decoratively for nearly every label).
- Anti-cliché guardrails (binding, same as every prior phase): no tracked-out ALL-CAPS labels (`uppercase tracking-[...]`), no middot-joined meta strings (`{a} · {b}`), no em-dash label chrome, no arrows appended to text/CTAs (`Apply for Cohort →`, hover-reveal `Profile →`), no decorative numbered markers (the current "Level 01" / "Level 02" / "Level 03" tier labels are exactly this — remove them; the tier *structure* — Faculty, Board, Core Team — stays, just without the fake numbering).
- Reuse the existing `Button` (`src/components/ui/Button.tsx`) and `Badge` (`src/components/ui/Badge.tsx`) primitives from the Foundation phase wherever this plan needs a button or a small status/tag pill — do not re-implement button or badge styling inline.
- `Member` type (already in `src/types.ts`, do not modify): `{ name: string; role: string; image: string; email: string; github: string; bio?: string; department?: "Teaching" | "Projects" | "Web Dev" | "Media and Design" | "Operations" | "Marketing and Sponsorship" | "Alumni & Advisory" | "Core Leadership"; departmentId?: string; subsystem?: string; linkedin?: string; instagram?: string }`.
- **Scope boundary:** this plan touches only `src/components/MembersView.tsx` and the three new files it creates. It does **not** touch `src/components/DepartmentsView.tsx` (a separate view with its own modal — a follow-up plan's job) or the cohort-application-form modal inside `MembersView.tsx` (a distinct functional flow, not part of the member-grid/drawer redesign — its `Sparkles`/`Send` icon usage and copy stay as they are for this plan).
- `MembersView.tsx` currently never renders `member.image` for board/core cards — it always shows initials (`getInitials(name)`) in a styled box. Keep that pattern; the fixture data's `image` field is an Unsplash placeholder, not a real club photo, so initials remain the more honest choice.

## Review Focus

- A member with no `bio` (the field is optional in `Member`) — the current code interpolates `bio` directly into card and drawer text with no fallback; an undefined bio must not render `"undefined"` or crash.
- A member with no `linkedin` and no `instagram` — the current drawer conditionally renders a LinkedIn link only `if (selectedMember.linkedin || instagram)`; the new drawer must handle the all-absent case without an empty/broken social row.
- Rapid open→close→open of the drawer on different members (click one card, then another before the first drawer animation finishes) — the drawer must end up showing the *last* clicked member, not a stale one.
- Selecting a department filter that matches zero members (a department with no `CORE_MEMBERS` entries, e.g. if one is ever fully empty) — `MemberGrid` must show a clear empty state, not a blank gap.
- Keyboard-only interaction: a member card must be reachable and activatable via keyboard (not just `onClick` on a `div`), and the drawer's close control must be reachable the same way — the current cards are plain `<motion.div onClick={...}>` with no keyboard affordance at all.

## File Structure

- `src/components/Members/MemberCard.tsx` — new. One member's card, used for both the Board tier and the Core-team tier.
- `src/components/Members/MemberCard.test.tsx` — new.
- `src/components/Members/MemberDrawer.tsx` — new. Slide-over detail panel, replacing the current fixed-modal popup.
- `src/components/Members/MemberDrawer.test.tsx` — new.
- `src/components/Members/MemberGrid.tsx` — new. Department-tabbed grid of `MemberCard`s (the Core-team tier's filtering UI, extracted and reusable).
- `src/components/Members/MemberGrid.test.tsx` — new.
- `src/components/MembersView.tsx` — modify. Replace the inline Board-tier and Core-team-tier card JSX with `MemberCard`/`MemberGrid`; replace the `selectedMember` modal with `MemberDrawer`; remove the "Level 01/02/03" numbered-tier labels and other anti-cliché copy from the Faculty/Board headers (the sections these labels are attached to are not touched structurally, only their label text/classes).

---

### Task 1: `MemberCard`

**Files:**
- Create: `src/components/Members/MemberCard.tsx`
- Test: `src/components/Members/MemberCard.test.tsx`

**Interfaces:**
- Produces: `MemberCard({ member, onSelect, variant }: { member: Member; onSelect: (member: Member) => void; variant?: 'board' | 'core' })` — named export. `variant` defaults to `'core'`; `'board'` renders a slightly larger card (used for the 3-person Board tier), `'core'` the standard grid card. Both variants share the same interaction contract.
- Consumes: `Member` (`src/types.ts`, existing), `Badge` (`src/components/ui/Badge.tsx`, existing).

- [ ] **Step 1: Write the failing tests**

Create `src/components/Members/MemberCard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemberCard } from './MemberCard';
import { Member } from '../../types';

const BASE_MEMBER: Member = {
  name: 'Karthik',
  role: 'Projects Head',
  image: 'https://example.com/photo.jpg',
  email: 'karthik@example.com',
  github: 'github.com/karthik',
  bio: 'Leads autonomous robotics hardware.',
  department: 'Projects',
  subsystem: 'R&D & Robotics',
};

describe('MemberCard', () => {
  it('renders the member name, role, and initials', () => {
    render(<MemberCard member={BASE_MEMBER} onSelect={vi.fn()} />);
    expect(screen.getByText('Karthik')).toBeInTheDocument();
    expect(screen.getByText('Projects Head')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('calls onSelect with the member when clicked', async () => {
    const onSelect = vi.fn();
    render(<MemberCard member={BASE_MEMBER} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: /karthik/i }));
    expect(onSelect).toHaveBeenCalledWith(BASE_MEMBER);
  });

  it('is keyboard-activatable (Enter triggers onSelect)', async () => {
    const onSelect = vi.fn();
    render(<MemberCard member={BASE_MEMBER} onSelect={onSelect} />);
    const card = screen.getByRole('button', { name: /karthik/i });
    card.focus();
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith(BASE_MEMBER);
  });

  it('renders without crashing when bio is missing', () => {
    const { bio, ...noBio } = BASE_MEMBER;
    render(<MemberCard member={noBio} onSelect={vi.fn()} />);
    expect(screen.getByText('Karthik')).toBeInTheDocument();
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
  });

  it('renders no ALL-CAPS tracked label classes', () => {
    const { container } = render(<MemberCard member={BASE_MEMBER} onSelect={vi.fn()} />);
    expect(container.querySelector('[class*="uppercase"]')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- MemberCard`
Expected: FAIL — `Cannot find module './MemberCard'`.

- [ ] **Step 3: Implement `MemberCard.tsx`**

Create `src/components/Members/MemberCard.tsx`:

```tsx
import { Member } from '../../types';
import { Badge } from '../ui/Badge';

interface MemberCardProps {
  member: Member;
  onSelect: (member: Member) => void;
  variant?: 'board' | 'core';
}

function getInitials(name: string): string {
  const clean = name.replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.|Prof\.)\s+/i, '');
  const parts = clean.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export function MemberCard({ member, onSelect, variant = 'core' }: MemberCardProps) {
  const isBoard = variant === 'board';

  return (
    <button
      type="button"
      onClick={() => onSelect(member)}
      className={[
        'group text-left w-full bg-bg-card border border-border-subtle hover:border-border-default rounded-xl transition-colors cursor-pointer flex flex-col',
        isBoard ? 'p-8 items-center text-center gap-4' : 'p-6 gap-4',
      ].join(' ')}
    >
      <div
        className={[
          'rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center shrink-0 text-accent-blue-bright font-display font-semibold',
          isBoard ? 'w-20 h-20 text-2xl' : 'w-14 h-14 text-base',
        ].join(' ')}
      >
        {getInitials(member.name)}
      </div>

      <div className={isBoard ? 'space-y-2' : 'space-y-1 min-w-0'}>
        <h3 className="text-fg-primary font-medium truncate group-hover:text-accent-blue-bright transition-colors">
          {member.name}
        </h3>
        <Badge tone="blue">{member.role}</Badge>
        {member.subsystem && (
          <p className="text-xs text-fg-dim truncate">{member.subsystem}</p>
        )}
      </div>

      {member.bio && (
        <p className="text-sm text-fg-muted leading-relaxed line-clamp-3">{member.bio}</p>
      )}
    </button>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- MemberCard`
Expected: PASS, 5/5 tests.

- [ ] **Step 5: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/components/Members/MemberCard.tsx src/components/Members/MemberCard.test.tsx
git commit -m "feat: add MemberCard, replacing duplicated board/core card markup"
```

---

### Task 2: `MemberDrawer`

**Files:**
- Create: `src/components/Members/MemberDrawer.tsx`
- Test: `src/components/Members/MemberDrawer.test.tsx`

**Interfaces:**
- Produces: `MemberDrawer({ member, onClose }: { member: Member | null; onClose: () => void })` — named export. Renders nothing when `member` is `null`. This is the "open" signal (unlike `MobileDrawer`'s separate `open` boolean) — the caller sets `member` to a `Member` to open, `null` to close.
- Consumes: `Member` (`src/types.ts`).

Follows `MobileDrawer.tsx`'s existing slide-over pattern (already shipped, already reviewed): `AnimatePresence` + backdrop + panel sliding in from the right, `useEffect` for Escape-to-close and body-scroll lock, backdrop click closes, panel click does not.

- [ ] **Step 1: Write the failing tests**

Create `src/components/Members/MemberDrawer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemberDrawer } from './MemberDrawer';
import { Member } from '../../types';

const MEMBER: Member = {
  name: 'Grace',
  role: 'Secretary',
  image: 'https://example.com/photo.jpg',
  email: 'grace@example.com',
  github: 'github.com/grace',
  bio: 'Manages institutional compliance.',
  department: 'Operations',
  subsystem: 'Executive Administration',
  linkedin: 'linkedin.com/in/grace',
};

describe('MemberDrawer', () => {
  it('renders nothing when member is null', () => {
    render(<MemberDrawer member={null} onClose={vi.fn()} />);
    expect(screen.queryByText('Grace')).not.toBeInTheDocument();
  });

  it('renders the member name, role, and bio when open', () => {
    render(<MemberDrawer member={MEMBER} onClose={vi.fn()} />);
    expect(screen.getByText('Grace')).toBeInTheDocument();
    expect(screen.getByText('Secretary')).toBeInTheDocument();
    expect(screen.getByText('Manages institutional compliance.')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(<MemberDrawer member={MEMBER} onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes when the backdrop is clicked but not when the panel is clicked', async () => {
    const onClose = vi.fn();
    render(<MemberDrawer member={MEMBER} onClose={onClose} />);
    await userEvent.click(screen.getByText('Grace'));
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.click(screen.getByTestId('member-drawer-backdrop'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders no linkedin/instagram links when both are absent, but always shows email', () => {
    const { linkedin, ...noSocial } = MEMBER;
    render(<MemberDrawer member={noSocial} onClose={vi.fn()} />);
    expect(screen.queryByRole('link', { name: /linkedin/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /instagram/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /email/i })).toBeInTheDocument();
  });

  it('renders an Instagram link when instagram is present but linkedin is absent', () => {
    const { linkedin, ...rest } = MEMBER;
    const igOnly: Member = { ...rest, instagram: 'instagram.com/grace_ops' };
    render(<MemberDrawer member={igOnly} onClose={vi.fn()} />);
    expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /linkedin/i })).not.toBeInTheDocument();
  });

  it('swaps to a newly selected member without showing stale content', () => {
    const { rerender } = render(<MemberDrawer member={MEMBER} onClose={vi.fn()} />);
    expect(screen.getByText('Grace')).toBeInTheDocument();

    const OTHER: Member = { ...MEMBER, name: 'Vinayak', role: 'Co-Secretary' };
    rerender(<MemberDrawer member={OTHER} onClose={vi.fn()} />);
    expect(screen.getByText('Vinayak')).toBeInTheDocument();
    expect(screen.queryByText('Grace')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- MemberDrawer`
Expected: FAIL — `Cannot find module './MemberDrawer'`.

- [ ] **Step 3: Implement `MemberDrawer.tsx`**

Create `src/components/Members/MemberDrawer.tsx`:

```tsx
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Mail, Github, Linkedin, Instagram, X } from 'lucide-react';
import { Member } from '../../types';
import { Badge } from '../ui/Badge';

interface MemberDrawerProps {
  member: Member | null;
  onClose: () => void;
}

function getInitials(name: string): string {
  const clean = name.replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.|Prof\.)\s+/i, '');
  const parts = clean.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export function MemberDrawer({ member, onClose }: MemberDrawerProps) {
  useEffect(() => {
    if (!member) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [member, onClose]);

  return (
    <AnimatePresence>
      {member && (
        <motion.div
          data-testid="member-drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-bg-deep/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-bg-elevated border-l border-border-subtle overflow-y-auto"
          >
            <div className="flex justify-end p-4">
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-2 text-fg-muted hover:text-fg-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pb-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-bg-card border border-border-subtle flex items-center justify-center text-accent-blue-bright font-display font-semibold text-xl shrink-0">
                  {getInitials(member.name)}
                </div>
                <div className="min-w-0 space-y-1">
                  <h2 className="font-display text-xl text-fg-primary truncate">{member.name}</h2>
                  <Badge tone="blue">{member.role}</Badge>
                </div>
              </div>

              {member.subsystem && (
                <p className="text-sm text-fg-dim">{member.subsystem}</p>
              )}

              {member.bio && (
                <p className="text-sm text-fg-muted leading-relaxed">{member.bio}</p>
              )}

              <div className="flex flex-wrap gap-3 pt-4 border-t border-border-subtle">
                <a
                  href={`mailto:${member.email}`}
                  aria-label="Email"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-card border border-border-subtle hover:border-border-default text-fg-muted hover:text-fg-primary transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" /> Email
                </a>
                <a
                  href={`https://${member.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-card border border-border-subtle hover:border-border-default text-fg-muted hover:text-fg-primary transition-colors text-sm"
                >
                  <Github className="w-4 h-4" /> GitHub
                </a>
                {member.linkedin && (
                  <a
                    href={`https://${member.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-card border border-border-subtle hover:border-border-default text-fg-muted hover:text-fg-primary transition-colors text-sm"
                  >
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                )}
                {member.instagram && (
                  <a
                    href={`https://${member.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-card border border-border-subtle hover:border-border-default text-fg-muted hover:text-fg-primary transition-colors text-sm"
                  >
                    <Instagram className="w-4 h-4" /> Instagram
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- MemberDrawer`
Expected: PASS, 7/7 tests.

- [ ] **Step 5: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/components/Members/MemberDrawer.tsx src/components/Members/MemberDrawer.test.tsx
git commit -m "feat: add MemberDrawer slide-over, replacing the full-screen member modal"
```

---

### Task 3: `MemberGrid`

**Files:**
- Create: `src/components/Members/MemberGrid.tsx`
- Test: `src/components/Members/MemberGrid.test.tsx`

**Interfaces:**
- Consumes: `MemberCard` (Task 1).
- Produces: `MemberGrid({ members, onSelectMember }: { members: Member[]; onSelectMember: (member: Member) => void })` — named export. Groups `members` by their `department` field, renders a filter-tab row (department name + count, "All" included) above a grid of `MemberCard`s for the selected department (or all, grouped by department, when "All" is selected).

- [ ] **Step 1: Write the failing tests**

Create `src/components/Members/MemberGrid.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemberGrid } from './MemberGrid';
import { Member } from '../../types';

const MEMBERS: Member[] = [
  { name: 'Karthik', role: 'Projects Head', image: '', email: 'a@x.com', github: 'g/a', department: 'Projects' },
  { name: 'Pranjal', role: 'Technical Head', image: '', email: 'b@x.com', github: 'g/b', department: 'Web Dev' },
  { name: 'Aurka', role: 'Teaching Lead', image: '', email: 'c@x.com', github: 'g/c', department: 'Teaching' },
];

describe('MemberGrid', () => {
  it('shows all members by default under an "All" filter', () => {
    render(<MemberGrid members={MEMBERS} onSelectMember={vi.fn()} />);
    expect(screen.getByText('Karthik')).toBeInTheDocument();
    expect(screen.getByText('Pranjal')).toBeInTheDocument();
    expect(screen.getByText('Aurka')).toBeInTheDocument();
  });

  it('renders a filter tab per department with a member count', () => {
    render(<MemberGrid members={MEMBERS} onSelectMember={vi.fn()} />);
    expect(screen.getByRole('button', { name: /projects/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /web dev/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /teaching/i })).toBeInTheDocument();
  });

  it('filters to only the selected department when a tab is clicked', async () => {
    render(<MemberGrid members={MEMBERS} onSelectMember={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /^projects/i }));
    expect(screen.getByText('Karthik')).toBeInTheDocument();
    expect(screen.queryByText('Pranjal')).not.toBeInTheDocument();
  });

  it('calls onSelectMember when a card is clicked', async () => {
    const onSelectMember = vi.fn();
    render(<MemberGrid members={MEMBERS} onSelectMember={onSelectMember} />);
    await userEvent.click(screen.getByRole('button', { name: /karthik/i }));
    expect(onSelectMember).toHaveBeenCalledWith(MEMBERS[0]);
  });

  it('shows an empty state when members is empty', () => {
    render(<MemberGrid members={[]} onSelectMember={vi.fn()} />);
    expect(screen.getByText(/no members/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- MemberGrid`
Expected: FAIL — `Cannot find module './MemberGrid'`.

- [ ] **Step 3: Implement `MemberGrid.tsx`**

Create `src/components/Members/MemberGrid.tsx`:

```tsx
import { useMemo, useState } from 'react';
import { Member } from '../../types';
import { MemberCard } from './MemberCard';

interface MemberGridProps {
  members: Member[];
  onSelectMember: (member: Member) => void;
}

export function MemberGrid({ members, onSelectMember }: MemberGridProps) {
  const [selectedDept, setSelectedDept] = useState<string>('All');

  const departments = useMemo(() => {
    const seen = new Set<string>();
    for (const m of members) {
      if (m.department) seen.add(m.department);
    }
    return Array.from(seen);
  }, [members]);

  const filtered = selectedDept === 'All' ? members : members.filter((m) => m.department === selectedDept);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedDept('All')}
          className={[
            'px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer',
            selectedDept === 'All' ? 'bg-bg-card text-fg-primary border border-border-default' : 'text-fg-muted hover:text-fg-primary',
          ].join(' ')}
        >
          All ({members.length})
        </button>
        {departments.map((dept) => {
          const count = members.filter((m) => m.department === dept).length;
          return (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDept(dept)}
              className={[
                'px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                selectedDept === dept ? 'bg-bg-card text-fg-primary border border-border-default' : 'text-fg-muted hover:text-fg-primary',
              ].join(' ')}
            >
              {dept} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-fg-dim py-12 text-center">No members in this department yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((member) => (
            <MemberCard key={member.name} member={member} onSelect={onSelectMember} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- MemberGrid`
Expected: PASS, 5/5 tests.

- [ ] **Step 5: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/components/Members/MemberGrid.tsx src/components/Members/MemberGrid.test.tsx
git commit -m "feat: add MemberGrid with department filter tabs"
```

---

### Task 4: Wire into `MembersView.tsx`

**Files:**
- Modify: `src/components/MembersView.tsx`

**Interfaces:**
- Consumes: `MemberCard` (Task 1), `MemberDrawer` (Task 2), `MemberGrid` (Task 3).

This is the integration task. `MembersView.tsx` currently has: a Faculty Coordinator section (Tier 1, keep structurally, only clean up its labels), a Board grid (Tier 2, replace card markup with `MemberCard variant="board"`), a Core-team-by-department section (Tier 3, replace the whole `DEPARTMENT_GROUPS`-driven grid with `MemberGrid`), and a fixed-modal member detail popup (replace with `MemberDrawer`). The cohort-application-form modal at the bottom stays untouched.

- [ ] **Step 1: Read the current file and plan the diff**

Read `src/components/MembersView.tsx` in full before editing — it's ~750 lines and this task touches most of it. Identify exactly:
- The `DEPARTMENT_GROUPS` constant and `getMemberDetails` helper (both become unused once Tier 3 is replaced — remove them).
- The `selectedMember` state and the "MEMBER DETAILS MODAL POPUP" `AnimatePresence` block (replace with `<MemberDrawer member={selectedMember} onClose={() => setSelectedMember(null)} />`).
- The Tier 2 Board grid's `.map()` block (replace each card's JSX with `<MemberCard key={member.name} member={member} onSelect={setSelectedMember} variant="board" />`).
- The Tier 3 section's department-pill-filter + grouped-grid JSX (replace entirely with `<MemberGrid members={CORE_MEMBERS} onSelectMember={setSelectedMember} />`).
- The "Level 01" / "Level 02" / "Level 03" labels and their surrounding `uppercase tracking-[...]` span markup in the Tier 1/2/3 section headers — remove the numbered badge entirely; keep the plain section title (e.g. "Faculty Leadership", "The Board", "Core Team by Department") but without the fake-tier-number prefix or tracked-uppercase styling.
- The Tier 1 Faculty Coordinator card's own `uppercase tracking-[...]` labels ("Coordinator Address", "VIT CHENNAI ROBOTICS CLUB") — remove the tracking/uppercase styling, keep the text content as plain-case labels using `text-fg-dim`/`text-fg-muted` tokens instead of `zinc-*`/hardcoded hex.

- [ ] **Step 2: Apply the changes**

Make all the edits identified in Step 1. Import the three new components at the top of the file:

```tsx
import { MemberCard } from "./Members/MemberCard";
import { MemberDrawer } from "./Members/MemberDrawer";
import { MemberGrid } from "./Members/MemberGrid";
```

Remove now-unused imports that only the deleted code paths needed (check each lucide-react icon import and the `DEPARTMENT_GROUPS`/`getMemberDetails` removal doesn't leave anything else orphaned — `tsc --noEmit` in Step 4 will catch unused-but-still-imported names only if `noUnusedLocals` were on, which it isn't in this project, so don't rely on the compiler to catch this — grep for each removed identifier's usages yourself before deleting its import).

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: all tests pass. `MembersView.tsx` itself has no dedicated test file (none existed before this plan, and adding one is out of scope — `App.test.tsx`'s render of the default `home` route doesn't exercise the `members` tab, so this integration's correctness is verified by Task 1-3's component tests plus the manual browser check in Step 5, not by an automated MembersView-level test).

- [ ] **Step 4: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean — this specifically catches any dangling reference to `DEPARTMENT_GROUPS`, `getMemberDetails`, or the old `selectedMember`-modal JSX you may have missed removing.

- [ ] **Step 5: Verify visually in a browser**

Start the dev server from this worktree on its own port (the shared launch configs point at the wrong checkout — a known issue every prior task in this project has had to work around; run `npm run dev` manually with `PORT` set to something free). Navigate to the Members tab. Confirm: Faculty/Board/Core sections all render, department filter tabs work, clicking a member card opens the slide-over drawer (not a centered modal), Escape and backdrop-click both close it, no ALL-CAPS tracked labels or "Level 0X" numbering remain visible anywhere on the page. Stop the server when done.

- [ ] **Step 6: Commit**

```bash
git add src/components/MembersView.tsx
git commit -m "feat: wire MemberCard/MemberGrid/MemberDrawer into MembersView"
```

---

## Plan Self-Review Notes

- **Spec coverage:** implements spec §6's "Members | MemberGrid (department tabs) + MemberDrawer (slide-over, not modal)" row in full, and the anti-cliché guardrails from §3 as applied to this specific view (removing the "Level 01/02/03" numbering, ALL-CAPS tracked labels, middot separators, arrow-suffixed CTAs that this file was full of). `DepartmentsView.tsx`'s own modal is explicitly out of scope, noted as a follow-up.
- **Review Focus coverage:** missing-bio (Task 1, test 4), missing-social-links (Task 2, test 5), rapid member-swap (Task 2, test 7), zero-match empty state (Task 3, test 5 — the empty-`members`-array case, the realistic instance of a department with no members yet), keyboard activation (Task 1, test 3) — all five items from the Review Focus section have an owning task and a real test.
- **Placeholder scan:** no TBD/TODO; every step has complete, real code (an earlier draft of Task 3 had an assertion-less test case — caught and removed during this self-review, not left in with a note to delete it later).
- **Type consistency:** `Member` is imported from the existing `src/types.ts` in every new file, never redeclared. `MemberCard`'s `onSelect: (member: Member) => void` and `MemberDrawer`'s `onClose: () => void` / `member: Member | null` shapes are consumed identically by `MemberGrid` (Task 3) and `MembersView.tsx` (Task 4).
