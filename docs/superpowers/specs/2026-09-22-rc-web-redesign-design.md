# RC Web Reimagined — Full Visual & UX Redesign

**Date:** 2026-09-22
**Status:** Approved, pending implementation plan
**Repo:** `D:\RCweb-reimagined` (cloned from `D:\RC-web`, original left untouched as a live fallback)

## 1. Problem & Goals

The VIT Chennai Robotics Club site (`D:\RC-web`) works functionally — Supabase-backed member roster, certificate verification, admin CMS, event/gallery pages — but the UI reads as generic and "vibe-coded": a fake-spinner loading screen, an admin panel that looks like a stock AI dashboard template, modal-heavy flows, and no distinct visual identity tied to the club's actual brand.

Goal: a complete visual and interaction redesign that is premium, technically credible, and unmistakably *this* club's — not a template. Scope covers all seven surfaces (Home, About, Achievements, Departments, Members, Activities, Certificates) plus Admin, built around the club's real logo identity and real content (six departments — Projects, Teaching, Web Dev, Media and Design, Operations, Marketing and Sponsorship; TechnoVIT competition events like Roborace, Robosumo, Line Follower; a photo archive with real captions from ERC prep, PCB soldering, drone flight tests, etc.).

Non-goals: no light mode, no 3D asset pipeline (everything is procedural/code-driven — no GLTF models), no backend rewrite (Supabase schema, auth, and the certificate-verification logic stay as-is), no mobile-first redesign (desktop is the primary showcase; mobile is an adapted subset, not the design driver).

## 2. Constraints

- Solo developer, working iteratively (no fixed deadline, but scoped to be buildable incrementally).
- Must preserve: Supabase auth, the admin CMS, the OTP-based certificate verification flow, and the photo gallery.
- Desktop-first; mobile is a secondary, simplified pass.
- No existing 3D assets — any 3D in the hero must be procedural geometry (gears, particles), not modeled rovers/arms.
- Stack stays: React 19, TypeScript, Vite, Tailwind v4, Framer Motion, GSAP, Supabase. Three.js (via `@react-three/fiber`) is added new, for the hero only.

## 3. Brand System

Colors are derived from the club's own logo (not a generic default palette) — a circuit-and-gear badge in accent blue, metallic grey, white, and near-black:

```css
@theme {
  --color-bg-deep: #0D0D0D;          /* page background */
  --color-bg-elevated: #141416;      /* panels, nav */
  --color-bg-card: #1A1A1E;          /* cards */

  --color-fg-primary: #FFFFFF;
  --color-fg-subtle: #E5E8EB;        /* headings */
  --color-fg-muted: #BFC7CE;         /* body text */
  --color-fg-dim: #8A8F96;           /* tertiary text */

  --color-accent-blue: #4A8DB7;
  --color-accent-blue-bright: #619AC3;
  --color-accent-blue-dim: #3A6D90;
  --color-accent-gold: #E8B828;      /* kept, secondary: wins, achievements, warnings */
  --color-accent-gold-dim: #C49A1F;

  --color-border-subtle: #2A2A2E;
  --color-border-default: #3A3A3E;
  --color-border-focus: #4A8DB7;
}
```

Dark-only. No light-mode toggle — reduces scope and matches the club's existing identity.

**Typography:**

| Role | Font | Weights | Usage |
|---|---|---|---|
| Display | Syne | 500–800 | Hero headline, section titles — the one place personality shows |
| UI / Body | Inter | 400–600 | Everything else: body copy, nav, buttons, forms |
| Data | JetBrains Mono | 400–500 | **Only** genuinely code-like values: roll numbers, event codes, timestamps, certificate IDs |

Fluid clamp-based scale (`--text-display-xl` through `--text-micro`), matching the existing project's clamp pattern in `src/index.css`.

**Anti-cliché guardrails** (from design-craft review — these are binding, not suggestions):
- No tracked-out ALL-CAPS labels or eyebrows.
- No middot-joined meta strings (`Projects · R&D · 2026`).
- No em-dash label chrome (`WORD — fragment`).
- No arrows appended to CTA text (`View gallery →`). A button says what it does; if it navigates, that's implicit.
- No numbered markers (01/02/03) unless the content is a real sequence. The one legitimate case: the certificate flow (Search → Verify → Preview → Print).
- JetBrains Mono is reserved for actual data, never used as a decorative label font.
- Motion: one orchestrated hero sequence, not fade-slide-up on every card. GSAP `ScrollTrigger` reveals capped at ~8 staggered children per section, `power1.out`/`power2.out` easing only, animating `transform`/`opacity` only (never `width`/`height`).

## 4. Hero: "Kinematic Neural Core"

A procedural Three.js scene (`@react-three/fiber`) merging the club's two identities — mechanical (gears) and computational (autonomy/neural nets) — with no external 3D assets required.

- **Geometry:** 3–5 interlocking torus/gear meshes rotating at related ratios (1:2:3), metallic-grey material (`#BFC7CE` → `#E5E8EB` gradient) with subtle environment reflection.
- **Neural overlay:** ~500 particles at gear contact points, connected by bezier curves forming a graph; pulses of accent blue travel along edges to suggest data propagation.
- **Interaction:** mouse parallax shifts gears slightly and bends connections; scroll pulls the camera back to reveal more of the system.
- **Performance:** ~2,000 triangles, single render target, 60fps target on a 2018 MacBook Air-class laptop. Falls back to a static/CSS-animated SVG (gears + pulsing nodes) on `prefers-reduced-motion` or viewports under 768px.
- **Loading:** the SVG fallback renders immediately; Three.js initializes in the background and crossfades in when ready. No blocking spinner.

## 5. Global Command Palette (⌘K / Ctrl+K)

- **Navigate tab:** Home, About, Achievements, Departments, Members, Activities, Certificates, Admin — instant route.
- **Search tab:** live-filters members, events, certificates, gallery items; selecting deep-links and scrolls.
- **Actions tab (admin-only):** "New Event," "Verify Certificate," "Add Member," "Export Roster" — opens the relevant drawer/modal.
- Vim-style `g`-chords for direct nav (`g h` → Home, `g m` → Members, etc.).
- Visual: elevated panel (`--color-bg-elevated`), accent-blue focus rings, Syne for section headers, JetBrains Mono for keybinding hints (data, not decoration — this is the one legitimate mono-as-label case since it's literally showing a keystroke). Framer Motion spring entrance, ~300ms.

## 6. Component Architecture

| Area | Current | New |
|---|---|---|
| Layout | `App.tsx` monolith | `AppShell` + `PageOutlet` + `CommandPaletteProvider` |
| Navigation | `PillNav` + `StaggeredMenu` | Unified `TopBar` (logo, links, ⌘K trigger, auth) + `MobileDrawer` |
| Hero (Home) | Static text + stat counters | `KinematicHero` (Three.js + SVG fallback, see §4) |
| Stats counter | Custom `IntersectionObserver` hook | `AnimatedCounter` (reusable, Framer Motion-driven) |
| Gallery | `HeroGallery` + `DriftWall` | `MasonryGallery` (real captions from `GALLERY_ITEMS`) + `Lightbox` |
| Events (Achievements/Activities) | Horizontal scroll cards | `EventCarousel` (magnetic cards, scroll-snap) + inline `EventDetail` expand |
| Members/Departments | Modal-heavy | `MemberGrid` (grouped by the six real departments) + `MemberDrawer` (slide-over, not modal) |
| Admin | Generic card dashboard | `AdminTerminal` — three-pane layout (⌘K sidebar, TanStack Table v8 main pane, detail drawer), keyboard nav (`j`/`k`, `Enter` to expand), inline double-click cell edit, bulk-select toolbar |
| Certificates | Form → modal → print | `CertificatePortal` — single page, linear flow: Search → Verify (OTP, auto-advance) → Preview (in-place render) → Print (native `@page` print CSS, no PDF library) |
| Loading | `LoadingScreen` (blocks everything) | Removed. Progressive hydration per route; hero's own SVG-to-WebGL crossfade is the only "loading" moment on the site |

Shared primitives added under `src/components/ui/`: `Button` (primary/secondary/ghost/terminal variants), `Card`, `Input`/`Select`/`Textarea`, `Badge`/`Tag`, `Drawer`/`Dialog`/`Popover` (Framer Motion), `Table` (sortable, keyboard-navigable), `CommandPalette`.

## 7. Motion Philosophy

Default rich, `prefers-reduced-motion` respected globally (motion providers short-circuit to `initial={false}`/no scroll-triggers).

| Pattern | Library | Notes |
|---|---|---|
| Page transitions | Framer Motion `AnimatePresence` | fade + slide, ~200ms |
| Scroll-reveal | GSAP `ScrollTrigger` | per §3 guardrails — capped stagger, transform/opacity only |
| Magnetic hover | custom `useMagnetic` hook | buttons, nav items, event/member cards |
| Parallax | `useScroll`/`useTransform` | hero background and section dividers only, 3–4 layers max |
| Three.js sync | `useFrame` + scroll progress | hero camera pull-back, gear rotation speed |

Performance guards: `will-change` only on actively-animating elements; `IntersectionObserver`-driven triggers, not scroll listeners; ScrollTrigger scoped per-section, not page-wide.

## 8. Admin & Certificate Redesign (critical — this is the most-cited pain point)

**Admin Terminal:** full-height three-pane layout. Tabs for Members, Events, Certificates, Gallery — each backed by a sortable/filterable/paginated `Table`. Power actions (bulk export, bulk delete, role changes) live behind ⌘K, not scattered buttons. Visual language: monospace for tabular data cells (roll numbers, IDs, timestamps — genuinely code-like), Inter for labels/actions, accent-blue for focus/selection, gold reserved for destructive/warning states.

**Certificate Portal:** one page, no modals, linear state machine (`Empty → Loading → Found → Verified → Printed`, no backtracking):
1. **Search** — year select + roll number input, inline validation.
2. **Verify** — OTP sent, auto-focus/auto-advance code input.
3. **Preview** — certificate renders in-place, print-ready.
4. **Print** — native browser print dialog via `@page` CSS, no client-side PDF generation library.

This is the one place numbered steps are earned (§3) since it's a genuine linear sequence.

## 9. Success Criteria

- No page uses the current `LoadingScreen` spinner.
- Hero renders the fallback SVG within 100ms and crossfades to WebGL without a layout shift.
- Admin and Certificates no longer use any modal dialogs for their primary flows.
- Lighthouse performance ≥ 85 on the Home page (desktop) with the Three.js hero active.
- `prefers-reduced-motion: reduce` disables the Three.js parallax, all GSAP ScrollTriggers, and Framer Motion page transitions site-wide, verified by manual toggle.
- Zero instances of the anti-cliché list in §3 anywhere in the shipped UI (checked in code review before merge).

## 10. Open Risks

- Three.js bundle size (`@react-three/fiber` + `three` ≈ 150–200KB gzipped) — mitigate with route-level code-splitting so it only loads on Home.
- TanStack Table v8 is a new dependency for Admin — acceptable given the current admin UI is the single most-cited weak point.
- Real member photos are currently Unsplash stock placeholders (`src/data.ts`) — out of scope to source real photos; redesign should degrade gracefully whenever real photos are swapped in later.
