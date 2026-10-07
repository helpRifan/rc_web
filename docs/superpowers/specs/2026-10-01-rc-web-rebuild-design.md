# VIT Chennai Robotics Club website: rebuild design spec

**Date:** 2026-10-01
**Status:** Approved by the owner, 2026-10-01
**Supersedes:** `D:\RCweb-reimagined\docs\superpowers\specs\2026-09-22-rc-web-redesign-design.md`. That spec's fonts, gold accent, 3D gear hero and OTP flow are overridden.
**Research this spec relies on:** `docs/research/2026-09-30-carryover-inventory.md`. It surveyed the old site's pages, flows, API, data and Supabase.

---

## 1. What we're building and why

The club's current site looks generic. Much of its content is invented: fake member bios, stock photos, made-up partner descriptions and wrong photo captions. Its database rules also let any Google account make itself an admin. The owner wants a brand-new site that looks like nothing else on campus, runs on real content only, and is safe to run.

**Audience**
1. VIT Chennai students deciding whether to join.
2. Participants in club events, including teams from other colleges, who need their certificates.
3. Faculty, partners and sponsors checking out the club.
4. Club admins who keep content up to date.

**Success looks like**
- A first-time visitor's reaction to the homepage is "whoa", not "template".
- Every name, number, photo and caption on the site is true.
- A participant can find and verify their certificate in under a minute.
- Admins can update events, photos, members and certificates without touching code or the Supabase dashboard.
- No public path lets anyone read private data or gain admin rights.

## 2. Decisions already made (binding)

| # | Decision | Source |
|---|---|---|
| D1 | Brand-new project on a fresh scaffold in `D:\RCweb-next`, with its own git repo and Vercel project. The old site stays up until cutover. | Owner, 2026-09-30 |
| D2 | Carry over the data, the Supabase project (auth, storage) and the API's useful endpoints. The existing rows are all seed or test filler, so no rows are migrated. | Owner; step 0 findings |
| D3 | **Colours: the club logo palette only.** Black `#0D0D0D`; blues `#4A8DB7` and `#619AC3`; greys `#E5E8EB` and `#BFC7CE`; white `#FFFFFF`. No gold, yellow or any other hue. | Owner |
| D4 | None of the old fonts (Inter, JetBrains Mono, Syne), and no 3D gear hero. | Owner |
| D5 | Stack: **Next.js** (App Router) + TypeScript + Tailwind, on Vercel, backed by Supabase. | Owner, 2026-09-30 |
| D6 | Homepage hero: React Bits **FaultyTerminal** (a CRT glyph field) with a **DecryptedText** headline. | Owner, 2026-10-01 |
| D7 | Design system: FaultyTerminal is the site-wide signature texture, and each page gets one 3D or WebGL centrepiece (§4.4). | Owner, 2026-10-01 |
| D8 | Member profiles are pages of their own, never pop-up cards. | Owner |
| D9 | Member data comes from the owner's Google Form: photo, about, 3 tags, role and more (§7.3). | Owner |
| D10 | Supabase projects: `rcweb` (`osjvefbyxwvtycxukcmq`) is production. `rcweb-dev` (`lvmibgzaaegamfesjfsk`) is for development and previews. | Owner, 2026-09-30 |
| D11 | Images stay on ImageKit. Email stays on Resend. | Inventory §8.3, §8.13 |
| D12 | Use React Bits components directly. Include their MIT + Commons Clause notice (§4.5). 21st.dev components are allowed via the shadcn CLI. | Owner |
| D13 | **Four admin owners:** the three `@vitstudent.ac.in` owner accounts hard-coded in the old site (`D:\RCweb-reimagined\api\index.ts`, `ADMIN_EMAILS`), plus the fourth owner’s personal address (kept out of the repo). Admin access is by exact email match, so non-VIT addresses listed here work. | Owner, 2026-10-01 |
| D14 | **No certificate re-issue.** The TechnoVIT '26 PDFs stay exactly as sent. Participants verify through the email lookup and the verify link it gives them. | Owner, 2026-10-01 |
| D15 | **"Beautiful and impressive" is a hard requirement.** It's enforced by the quality gate in §4.7. | Owner, 2026-10-01 |

Already done on 2026-09-30: the emergency RLS lockdown migration on `rcweb`, a full backup (`D:\RC-web-backups\supabase-2026-09-30\`), and the creation of `rcweb-dev`.

## 3. Scope

**In scope (v1)**
- Public pages: Home, About, Team, member profiles, Events, event detail, Gallery, Partners (hidden until confirmed), Certificates (find, verify, download), Join (recruitment waitlist), and 404.
- Admin sign-in and admin tools for members, events, gallery, partners, certificates, the waitlist, admins and site settings.
- A clean database schema, security rules, email, and imports: members from the Google Form responses, certificates from the owner's certificate folder.
- The cutover from the old site.

**Out of scope for v1** (noted for later)
- Members editing their own profile after signing in.
- A blog or news section.
- A contact form. Contact stays as mailto plus socials.
- The command palette or site search.
- Analytics dashboards.
- Payments.
- Mobile apps.

## 4. Design system

### 4.1 Colour

| Token | Value | Use |
|---|---|---|
| `bg` | `#0D0D0D` | Page background (dark only; there is no light theme) |
| `ink` | `#FFFFFF` | Headings, primary text on dark |
| `text` | `#E5E8EB` | Body text |
| `muted` | `#BFC7CE` | Secondary text, captions |
| `accent` | `#619AC3` | Interactive elements, links, primary buttons, glyph field |
| `accent-deep` | `#4A8DB7` | Secondary accent, hover and pressed states, gradients |

Rules:
- **Tints only.** Surfaces and hairlines may use these colours at reduced opacity, e.g. `rgba(191,199,206,.28)`. No other hue may appear, including in shaders, glows, errors and success states.
- **Contrast.** Text on `accent` or `accent-deep` buttons is `#0D0D0D`: white on the blues fails WCAG AA. Blue text is used only on black. Greys are text colours only on black. All pairs are measured in inventory §8.21.
- **Errors and success** are shown with an icon plus plain words, never by colour alone.

### 4.2 Type

- **One family: Archivo (variable, width 62–125, weight 100–900)**, self-hosted through `next/font`.
- **Display** (page h1): width 125%, weight 800, `clamp(44px, 6vw, 88px)`, line-height 1.0.
- **Section headings:** width 118%, weight 800, 28–40px.
- **Body:** width 100%, weight 400, 17–18px desktop and 16px mobile, line-height 1.55, lines of 80 characters or fewer.
- **UI labels and buttons:** width 100–105%, weight 600, 14–15px.
- **No monospace text.** The glyph field is imagery, not text.

### 4.3 Anti-slop rules (every page, every PR)

1. No tracked-out ALL-CAPS labels, and no "eyebrow" labels above headings.
2. No numbered markers ("01 / 02") unless the content really is a sequence.
3. No middle-dot-joined meta strings, no "WORD — fragment" labels, and no arrows appended to button or link text.
4. No accenting one word of a headline in a different colour or style.
5. No fake data: invented stats, bios, telemetry, "system" chrome or placeholder people. If content isn't real yet, the element is hidden, not faked.
6. No stock photos of people. Until a member's photo arrives, show their monogram.
7. No bento grids, glassmorphism kits, purple/pink gradients or generic SaaS card grids.
8. Copy is plain, sentence case, active voice. A button says what it does ("Find my certificate", not "Submit").

### 4.4 Motion and centrepieces

**Principle:** one orchestrated centrepiece per page, with everything around it quiet. (From ui-ux-pro-max: the "Immersive/Interactive" pattern and "avoid 2D-only layouts". From frontend-design: "spend boldness in one place".)

| Page | Centrepiece | Mobile / low-power fallback |
|---|---|---|
| Home | FaultyTerminal full-viewport glyph field, tinted `accent`, mouse-reactive, with a DecryptedText headline | Lower-resolution field; a static poster frame if WebGL is unavailable |
| Team | **Lanyard:** the Board hang from the top as 3D ID badges you can grab and swing. **InfiniteMenu:** a 3D sphere of core-team faces you drag to rotate; the front member shows name, role and 3 tags. **ChromaGrid** list view as an alternative. | ChromaGrid list is the default under 768px and for keyboard users; badges become static |
| Member profile | That member's own Lanyard badge beside their details | Static badge image |
| Events | **Hyperspeed** light-trail hero (press and hold to accelerate); events scroll as a stack (**ScrollStack**) | Static hero poster; a plain list |
| Gallery | **DomeGallery:** club photos on a draggable 3D dome; click to open | Masonry grid |
| Certificates | Verification plays as a terminal reveal: details DecryptedText onto a small FaultyTerminal panel | Plain reveal |
| Join | **LiquidEther** fluid behind the waitlist form | Solid background |
| About | Quiet page: story, photos, faculty coordinator (**ProfileCard**, holographic tilt) | Card without tilt |

Page h1s use DecryptedText (a scramble that resolves in 600ms or less, once). Only primary CTAs get a magnetic hover, at most two per screen. There is at most one pinned scroll sequence per page.

**Performance rules**
- The LCP element is always server-rendered text or an image, never WebGL.
- WebGL chunks load dynamically after first paint and only when in view.
- Device pixel ratio is capped at 2 on desktop and 1.5 on mobile.
- Loops pause when the tab is hidden or the canvas is off-screen.
- A WebGL failure falls back silently to the poster.

**Budgets:** LCP under 2.5 s and CLS under 0.1 on a mid-range phone over 4G. First-load JS per route is under 250 KB gzipped, not counting lazy WebGL chunks.

**Reduced motion:** a still frame instead of loops, no text scrambles, no pinning, and no physics. Every interaction still works.

### 4.5 Component sources

- **React Bits.** Install through its shadcn registry (`npx shadcn@latest add https://reactbits.dev/r/<Component>-TS-TW`, or the `-JS-CSS` variant). Components used: FaultyTerminal, DecryptedText, ScrambledText, Hyperspeed, LiquidEther, Lanyard, InfiniteMenu, ChromaGrid, ProfileCard, DomeGallery, ScrollStack.
  - Recolour every component through props or tokens.
  - Keep the component source in `src/components/reactbits/` with its original header.
  - Add React Bits' copyright notice to `THIRD_PARTY_NOTICES.md`. The licence permits using them "as part of an application, website, or product", not redistributing them alone.
- **shadcn/ui** as the base for plain UI (forms, dialogs, tables), mostly in admin.
- **21st.dev** may supply individual components through the same CLI when they beat building from scratch. Each one is restyled to §4.1–4.3.

**Prototypes already checked on a real GPU:**
- FaultyTerminal, Hyperspeed and LiquidEther heroes, plus a Team page with ProfileCard and ChromaGrid. These are throwaway HTML in the brainstorm folder.
- Tuned values carry over: FaultyTerminal uses the React Bits demo defaults with the tint `#619AC3`; LiquidEther runs without viscosity, with mouse force 32, cursor size 130 and colours `#4A8DB7 / #619AC3 / #FFFFFF`.

### 4.7 Quality gate (every page, before it counts as done)

A page is done only when all of these are true:
1. **The centrepiece is visibly the star.** It's checked on a real GPU at 1440×900 and 390×844 using the screenshot script (§11). The screenshots are attached to the PR.
2. **Nothing reads as a template.**
   - It passes the anti-slop rules (§4.3).
   - It passes a self-critique against the frontend-design guidance: one bold idea, everything else quiet, and nothing that could belong to any other site.
3. **It passes the ui-ux-pro-max pre-delivery checklist:** contrast, focus, tap targets, reduced motion, 375/768/1024/1440 widths, and no emoji icons.
4. **Motion feels intentional.**
   - Entrances resolve in 600ms or less.
   - Nothing jitters or re-wraps as it animates.
   - Loops are smooth at 60 fps on the dev machine's integrated GPU.
5. **The owner has seen it live** and said yes. "It's okay" or "mid" means another iteration, not done.

### 4.6 Accessibility

- WCAG 2.1 AA throughout.
- Every page works with the keyboard alone, with a visible focus ring (2px `#FFFFFF`, offset 3px).
- 3D centrepieces are decorative: every piece of information in them is also in accessible HTML (the Team list view, the Gallery grid, and so on).
- The real headline text is always in the DOM.
- Tap targets are at least 44px.
- The layout works from 360px wide up.

## 5. Architecture

- **Next.js App Router, TypeScript strict, Tailwind v4** with the tokens in §4.1. Package manager: npm. Node 22 or later.
- **Rendering.** Public pages are React Server Components, statically generated or ISR. Admin edits call `revalidateTag` so pages update within seconds.
- **The browser never queries the database.** All reads and writes run on the server with a server-only Supabase client using the secret key (`sb_secret_…`), guarded by `import 'server-only'`.
  - RLS stays enabled on every table with **no** anon or authenticated policies or grants. That's defence in depth: even a leaked publishable key reads nothing.
  - The browser uses Supabase only for Google sign-in.
- **Auth.** Supabase Google OAuth with the PKCE flow and cookie sessions through `@supabase/ssr`. `src/proxy.ts` (Next 16's replacement for middleware) refreshes sessions and redirects signed-out visitors away from `/admin/**`. Server code re-checks admin status on every request.
- **Writes.** Admin mutations are Server Actions or Route Handlers. Every one re-checks admin status on the server (§9.2) and validates input with zod.
- **Public HTTP API.** Route Handlers keep the old API's useful endpoints under `/api/*` (§8), with validation and rate limits.
- **Images.** ImageKit, rendered through `next/image` with an ImageKit loader. Admin uploads are signed by `/api/imagekit/auth`.
- **Files.** Certificate PDFs live in a **private** Supabase Storage bucket, `certificates`, served only through short-lived signed URLs.
- **Email.** Resend, from a verified club-controlled domain (§10).
- **Rate limiting.** A Postgres function, `hit_rate_limit(key text, window_seconds int, max_hits int)`, backed by a `rate_limits` table. It's called with the service role, so no extra vendor is needed.

**Environments**

| Env | Supabase | Vercel | Site URL |
|---|---|---|---|
| Local | `rcweb-dev` | – | `http://localhost:3000` |
| Preview | `rcweb-dev` | Preview deployments | `*.vercel.app` |
| Production | `rcweb` | Production | the club domain (§13, Q12) |

**Environment variables (names only)**
- Public: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_…`), `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`, `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`, `NEXT_PUBLIC_SITE_URL`.
- Server-only: `SUPABASE_SECRET_KEY` (`sb_secret_…`), `IMAGEKIT_PRIVATE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_NOTIFY_EMAILS`, `JOIN_EMAIL_DOMAINS` (default `vitstudent.ac.in`, used only by the Join form), `CERT_LINK_SECRET`.
- The app refuses to start if a required server variable is missing.

**Repo layout (target)**
```
src/app/(site)/...          public routes
src/app/admin/...           admin routes
src/app/api/...             route handlers
src/components/reactbits/   ported React Bits components (licence headers kept)
src/components/ui/          shadcn-based primitives
src/components/site/        site sections
src/lib/                    server clients, auth, validation, rate limit, email, imagekit
supabase/migrations/        versioned SQL, never edited after applying
scripts/                    one-off import scripts (members, certificates)
docs/                       specs, plans, research
```

## 6. Pages

Every public page has the shared header (logo, Home, Team, Events, Gallery, Certificates, Join) and footer (email, Instagram, LinkedIn, © year).

### 6.1 Home `/`
- **Hero**
  - Background: the FaultyTerminal field.
  - h1 (decrypts): "We build robots at VIT Chennai."
  - Body: "Robotics Club is where students design, wire and program robots, then take them to competitions. New members start with beginner workshops." The owner may edit this.
  - Buttons: "See upcoming events" (goes to `/events`) and "Join the club" (goes to `/join`).
- **Upcoming events:** the next 3 published events that are upcoming or open for registration. Hidden if there are none.
- **What we do:** the six divisions, each with one plain sentence written by the owner, linking to `/team#division`.
- **Latest photos:** 6 published gallery items, linking to `/gallery`.
- **Partners strip:** only if at least one partner is published.

### 6.2 About `/about`
The Genesis story (the two real paragraphs from the old site, inventory §2.5), the club's objectives (rewritten plainly), the faculty coordinator (ProfileCard, real photo, VIT profile link), and a few real photos.

### 6.3 Team `/team`
- **Faculty coordinator:** a ProfileCard.
- **Board:** Lanyard badges, one per Board member, showing photo or monogram, name and role. Grab to swing; click to open their profile.
- **Core team:**
  - InfiniteMenu sphere of published core members. The front one shows name, role, division and 3 tags, plus a "View profile" link.
  - A toggle switches to the **list view** (ChromaGrid), which has division filters. The list view is the default on small screens and when reduced motion is set.
- **Alumni & advisory:** a quiet list, only if any are published.
- Unpublished members never appear.

### 6.4 Member profile `/team/[slug]`
- Their Lanyard badge beside name, role, division and year.
- About (300 characters or fewer), 3 tags, "Currently building", fun fact.
- Links (GitHub, LinkedIn, Instagram, portfolio), shown only when present and only with consent.
- Next and previous links within the division.
- 404 unless the member is published.

### 6.5 Events `/events` and `/events/[slug]`
- **List:** Hyperspeed hero, then "Coming up" (upcoming, open for registration, coming soon), then past events grouped by year (ScrollStack).
- **Detail:**
  - Title, date (or its label), status, the full description, and the cover image.
  - Registration: a button to VIT Event Hub, with the instruction "Search for <title> on Event Hub to register", shown only when status is `registration_open`.
  - Photos from this event (gallery items linked to it).
  - For completed events that have certificates: "Took part? Find your certificate", linking to `/certificates`.

### 6.6 Gallery `/gallery`
DomeGallery of published photos, plus an accessible grid view. The photo viewer shows the caption and a link to the event.

### 6.7 Partners `/partners`
The route and nav item exist only when at least one partner is published; otherwise it returns 404. Each partner shows name, logo, the owner-written relationship line, and its website.

### 6.8 Certificates `/certificates`, `/certificates/[publicId]`, `/certificates/mine`
- **`/certificates`** has two options:
  - **"Find my certificates":** enter the email address your team registered with. The page always answers "If that address has certificates, we've emailed a link. It works for 30 minutes." The email links to `/certificates/mine?token=…`.
  - **"Verify a certificate":** paste a verify link or an ID such as `RC26-7KQ2M9XH4D`, which goes to `/certificates/[publicId]`. IDs aren't printed on the PDFs (D14), so participants get their verify links from the "mine" page and can share them with anyone who needs proof.
- **`/certificates/[publicId]`** (public):
  - Shows the recipient name, event, type (participation, winner or other), place, issue date and status (valid or revoked), as the terminal reveal.
  - "Download PDF" issues a signed URL that lasts 5 minutes.
  - Unknown IDs get the same-shaped "No certificate with that ID" answer.
- **`/certificates/mine`:** the token is an HMAC-signed `{email, exp}`. The page lists every certificate tied to that email, each linking to its verify page. Expired or invalid tokens explain how to request a new link.
- There is no public search by name or roll number.

### 6.9 Join `/join`
- LiquidEther background.
- **When recruitment is open:** a form with name, VIT email (must end in one of `JOIN_EMAIL_DOMAINS`) and a hidden honeypot field. On success: "You're on the list. We'll email you when intake opens." Duplicate emails get the same message.
- **When closed:** "Recruitment is closed right now. Leave your email and we'll tell you when it opens." (The same form.)
- The owner sets the state in admin settings.

### 6.10 404
Plain, on a dimmed glyph field, with links home and to events.

## 7. Data

### 7.1 Schema (new, clean)

The new tables replace the legacy tables. All `id` columns are uuid, and all tables have `created_at` and `updated_at`. RLS is on, with no client policies (§5).

| Table | Columns |
|---|---|
| `members` | `slug` unique · `full_name` · `role_title` · `level` enum(`faculty`,`board`,`head`,`lead`,`core`,`member`) · `division` enum(`projects`,`webdev`,`teaching`,`media`,`operations`,`marketing`,`alumni`,`none`) · `year_of_study` text · `degree` text · `joined_year` int · `about` text (300 or fewer) · `tags` text[] (0–3 entries, each from the tag list or `Other: …`) · `currently_building` text (80 or fewer) · `fun_fact` text (100 or fewer) · `photo_url` · `github_url` · `linkedin_url` · `instagram_url` · `portfolio_url` (all https) · `email` citext unique, private · `consent_at` timestamptz · `is_published` bool default false · `sort_order` int |
| `events` | `slug` unique · `title` · `summary` (160 or fewer) · `description` (markdown) · `category` · `status` enum(`upcoming`,`registration_open`,`coming_soon`,`completed`) · `starts_on` date null · `date_label` text null · `series` text null (e.g. "TechnoVIT '26") · `cover_url` · `registration_url` · `recap_url` · `is_published` |
| `gallery_items` | `image_url` · `caption` · `event_id` fk null · `taken_on` date null · `sort_order` · `is_published` |
| `partners` | `name` · `website_url` · `logo_url` · `relationship` (140 or fewer, owner-written) · `sort_order` · `is_published` default false |
| `certificates` | `public_id` unique (see below) · `event_id` fk · `type` enum(`participation`,`winner`,`runner_up`,`merit`,`volunteer`,`organiser`) · `place` smallint null · `recipient_name` · `name_norm` · `team_name` null · `institution` null · `contact_email` citext null · `email_scope` enum(`team`,`individual`) · `pdf_path` · `pdf_sha256` · `status` enum(`issued`,`revoked`) default `issued` · `issued_on` date · `emailed_at` null |
| `waitlist` | `full_name` · `email` citext unique · `source` default `join` |
| `admins` | `email` citext unique, lower-case check · `name` · `is_owner` bool default false · `added_by` |
| `site_settings` | `key` text pk · `value` jsonb. Used for recruitment state and homepage copy. |
| `rate_limits` | `key` text pk · `window_start` · `hits` |

**Certificate IDs**
- `public_id` = `RC<yy>-` followed by 10 Crockford base32 characters from a cryptographically secure random generator, e.g. `RC26-7KQ2M9XH4D`.
- That's 50 bits of randomness, never sequential and never derived from the name.
- `certificates` also has the unique constraint `(event_id, type, coalesce(team_name,''), name_norm)`.

**Tag list** (the same as the Google Form): Mechanical design / CAD, Embedded systems, PCB design, Electronics, Robotics software (ROS), Computer vision, AI / ML, Control systems, Drones, 3D printing, Fabrication, Web development, App development, UI/UX design, Graphic design, Photo & video, Content writing, Event management, Sponsorship & outreach, Teaching & mentoring, plus free-text "Other".

**Storage and images**
- Supabase Storage has one private bucket, `certificates`, with object paths `<event-slug>/<public_id>.pdf`. There are about 321 files of about 1.2 MB each, roughly 370 MB, within the free 1 GB.
- Public images (member photos, event covers, gallery, partner logos) live on ImageKit under `/rcweb/<kind>/…`.

### 7.2 Migrations and environments
- Versioned SQL in `supabase/migrations/`. The first file records the 2026-09-30 lockdown as history.
- New migrations are applied to `rcweb-dev` first, reviewed, and only then applied to `rcweb` at release.
- **The legacy tables** (`admins`, `certificates`, `collaborations`, `events`, `gallery`, `members`, `form_submissions`, `activity_logs`, `admin_settings`) are dropped from `rcweb` at cutover, after a fresh backup. They hold only filler, confirmed on 2026-09-30.
- During development, production stays in its locked-down legacy state.

### 7.3 Content imports

**Members (from the Google Form)**
1. The owner exports the responses sheet as CSV and downloads the form's photo folder as a zip.
2. The admin **Import members** tool maps each column to its field, as below, and matches photos to rows. Google names uploads "`<file> - <respondent name>`", so photos match on the respondent's name, and admins can re-match by hand.
3. It shows a preview with problems flagged. On commit it uploads the photos to ImageKit and upserts members by email.
4. Members are published only when "OK to show" is ticked and a photo is present.

Column mapping: Full name → `full_name`, Year of study → `year_of_study`, Degree and branch → `degree`, Team → `division` (Board maps to `division=none, level=board`), Level → `level`, Role title → `role_title`, Year you joined → `joined_year`, About you → `about`, Tags → `tags`, Currently building → `currently_building`, Fun fact → `fun_fact`, GitHub, LinkedIn, Instagram and Portfolio → the `*_url` fields, Email (collected by the form) → `email`, Consent → `consent_at`.

- **Seed:** the real roster names and roles (inventory §2.3) and the faculty coordinator are seeded **unpublished**. The form import fills in the rest.

**Certificates (TechnoVIT '26, from the owner's folder)**

Facts from the 2026-10-01 survey of `OneDrive\Documents\Certificates`:
- **321 distinct certificates:** 293 participation and 28 winner. They cover 5 events (Line Follower, Obstacle Race, Robo Race, Robo Soccer, Robo Sumo) and 96 teams, about 154–188 people.
- **Emails are team-level only:** 54 distinct team-leader addresses, often shared across teams. Nexbots has no email at all.
- **No certificate carries an ID, QR code or date.**
- **The PDFs:** landscape, 389×283 mm Canva designs. The signatory is Dr. Arockia Selvakumar (Faculty Coordinator), under the Office of Student Welfare.
- **Duplicates:** 317 bulk-numbered PDFs are byte-identical duplicates of the named ones, so they're skipped.
- **Sending:** `send_log.json` records 95 emails and 289 PDFs sent on 17–18 Sept. Winners' participation certificates were never sent.

The **import script** (`scripts/import-certificates.ts`, run by an admin or by Claude with the owner's go-ahead) does the following:
1. Parses the registration sheets, `winners_manifest.json` and `send_log.json`.
2. Builds one row per named PDF, with `email_scope=team`.
3. Generates a `public_id` for each. The PDFs themselves are **not modified** (D14).
4. Uploads each PDF unchanged to the bucket, and writes a review CSV.
5. Commits after the owner approves.

**Future events:** admins bulk-import a CSV plus a zip of PDFs through the same pipeline.

**Other content**
- **Events:** TechnoVIT '26's five events are created with their real titles. Descriptions, dates and covers come from the owner, and each stays unpublished until filled in.
- **Gallery:** the nine real photos are imported, dropping the unrelated `gallery/4.jpg`. Each stays unpublished until the owner writes its caption.
- **Partners:** created unpublished.

## 8. HTTP API (Route Handlers)

| Method and path | Access | Purpose |
|---|---|---|
| GET `/api/events` | public | Published events. Query: `status`, `limit`. |
| GET `/api/gallery` | public | Published gallery items |
| POST `/api/certificates/find` | public, rate-limited (5 per hour per IP and per email) | `{email}` → emails a magic link if any certificates match. The response is always 202. |
| GET `/api/certificates/[publicId]` | public, rate-limited | Verification JSON: `{found, name, event, type, place, issuedOn, status}` |
| GET `/api/certificates/[publicId]/pdf` | public, rate-limited | 302 to a 5-minute signed URL |
| POST `/api/waitlist` | public, rate-limited, honeypot | `{fullName, email}` → 201, or 200 if already listed |
| GET `/api/imagekit/auth` | admin | Upload signature |
| POST `/api/admin/request-access` | signed in | Emails `ADMIN_NOTIFY_EMAILS` |
| `/api/admin/*` | admin; owner where noted | CRUD for members, events, gallery, partners and certificates (import, revoke, resend link); waitlist (list, CSV export); admins (owner only); settings |

**Conventions**
- Errors return `{ error: string }` with a generic message; details go to server logs.
- zod validates every body. URLs must be https.
- Unknown ids return 404.
- **Dropped from the old API:** `/health`, `/admin/settings` (fake), `/admin/activities` (fake), `/email/send-otp` (an open relay), the mock certificate fallback, and the `/` router mount.

## 9. Auth, admin and security

### 9.1 Sign-in
- Google sign-in happens only on `/admin/sign-in`. There's no public "student login".
- After OAuth, the server keeps the session only if the account's email is verified **and** exactly matches a row in `admins`, compared in lower case. Anyone else is signed out straight away and told this area is for club admins, with a "Request access" button (§8).

### 9.2 Who is an admin
- A request is admin when:
  - the session is valid;
  - the email is verified;
  - and there is an **exact lower-cased match** in `admins`.
- There's no domain rule for admins. This lets the fourth owner’s personal address (kept out of the repo) (D13) in, and only the people listed.
- Owners (`is_owner=true`) can invite and remove admins. No one can remove themselves or the last owner.
- There are no hard-coded admin lists anywhere, and no `localStorage` trust.
- **Seed owners:** the four accounts in D13, confirmed.

### 9.3 Security invariants (each one gets a test)
1. The browser has no route to table data. RLS is on everywhere, with no client policies. The storage bucket is private.
2. The service-role key is imported only from `server-only` modules, and a build-time check fails if it appears in client bundles.
3. Every admin mutation re-checks §9.2 on the server.
4. Public POST endpoints are rate-limited and honeypotted. Certificate lookups never reveal whether an email or ID exists, beyond the verify page for a valid ID.
5. Magic-link tokens are HMAC-SHA256 with `CERT_LINK_SECRET`, bound to an email, expire after 30 minutes, and are compared in constant time.
6. Email HTML escapes every interpolated value.
7. Security headers are set: CSP (self, plus ImageKit, Supabase, Google Fonts only if not self-hosted, and jsdelivr only if a component needs it), `frame-ancestors 'none'`, `Referrer-Policy`, and `Permissions-Policy`.
8. `.env*` is git-ignored except `.env.example`, which lists names only.

## 10. Email (Resend)
- Messages:
  - certificate magic link;
  - certificate announcement, a one-off email to TechnoVIT '26 team contacts that needs the owner's approval to send;
  - admin invite;
  - admin access request.
- Plain, readable templates with the logo and palette.
- Needs a verified sending domain (Q11). Until then, email works only in test mode, and admin screens say so rather than claiming success.

## 11. Testing and verification
- **Unit and component (Vitest + Testing Library):** validation schemas, the token helpers, ID generation, the rate limiter, the certificate import parser (on fixtures, never real names), and component logic such as filters and the recruitment state.
- **Database:** each migration applied to `rcweb-dev` must pass Supabase's security advisor with zero warnings about RLS, exposure or security definer, plus a SQL test that `anon` and `authenticated` can't select any table.
- **End-to-end (Playwright + axe) against `rcweb-dev` seed data:**
  - every public page renders its real content and passes axe with no serious or critical issues;
  - certificate find, verify and download;
  - the waitlist (open and closed);
  - admin sign-in gating: a non-admin is refused, an admin passes;
  - admin CRUD on events;
  - reduced motion shows the fallbacks.
- **Visual:** a local GPU screenshot script, puppeteer-core driving the installed Chrome, captures every WebGL centrepiece at 1440×900 and 390×844 before each page is signed off. CI has no GPU, so it checks the fallbacks.
- **CI (GitHub Actions):** typecheck, lint, unit tests, build, and Playwright against a preview deployment.

## 12. Delivery plan (phases, each with its own implementation plan)

> **2026-10-01 update:** the owner set a 3-day deadline. The six phases below are now run as one plan, `docs/superpowers/plans/2026-10-01-three-day-launch.md`. That plan's launch-scope table says which pieces move to just after launch: the admin upload widget, the admins UI, certificate admin screens, GitHub Actions CI and the member import as an admin tool (a script at launch).
1. **Foundation:**
   - Scaffold, tokens, fonts, the layout shell (header and footer), and the `reactbits/` setup with licence notices.
   - Supabase clients, the migrations for §7.1 on `rcweb-dev`, and the rate limiter.
   - Auth and the admin gate, CI, and the Vercel project.
2. **Public pages:** Home (FaultyTerminal), About, Events with detail (Hyperspeed), Gallery (DomeGallery), Join (LiquidEther) and 404. Seed content comes from dev fixtures. The owner reviews each page live.
3. **Team:**
   - Team page (Lanyard, InfiniteMenu, ChromaGrid list), member profiles, the member import tool, and the roster seed.
   - The owner reviews with real form data.
4. **Certificates:** the import script and review CSV, the verify, find and mine pages, and email.
5. **Admin:** the remaining CRUD screens, waitlist export, admins, settings, and the ImageKit upload flow.
6. **Launch:**
   - Content entry, production migrations with the legacy tables dropped, and env vars.
   - Domain cutover, retiring the old Vercel project, a smoke test, and the certificate announcement email if approved.

## 13. Open questions for the owner (defaults apply unless changed)

| # | Question | Default |
|---|---|---|
| Q1 | Roster: surnames, Ihsan's role (Vice-Chair or President), who is Chair or President, and whether "Aditya" is Aditya Kumar Sahu | The Google Form answers settle it |
| Q2 | Should the developer (Mohamed Rifan Ajmal) be listed under Web Dev? | Yes, via the form |
| Q3 | Event descriptions, dates and cover photos for the five TechnoVIT '26 events; which archive events are real | Unpublished until provided |
| Q4 | ~~Re-issue the PDFs with an ID and QR code?~~ | **Resolved: no (D14)** |
| Q5 | Certificates: send winners their unsent participation certificates; the 4 placings with no registration; Nexbots' email and members; whether any participants are minors | Winners get both; the other three are listed as follow-ups |
| Q6 | ~~Confirm the owner accounts for admin~~ | **Resolved: four owners (D13)** |
| Q7 | Gallery captions for the nine photos | Unpublished until written |
| Q8 | Which partners are real, with a one-line relationship each and logos | Partners page hidden |
| Q9 | Division one-liners for the homepage | Owner writes; hidden until then |
| Q10 | Is recruitment open now? | Closed, collecting a waitlist |
| Q11 | Sending domain for Resend | A club-controlled domain; test mode until then |
| Q12 | Production domain, and the GitHub repo name for this project | New repo `helpRifan/rcweb-next`; keep the `*.vercel.app` URL until a domain exists |
| Q13 | Permission to use `campus.jpg` and the faculty photo `fc.jpg` | Use `fc.jpg` (VIT's own profile photo); replace `campus.jpg` with a club photo |
