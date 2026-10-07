# Carry-over inventory: VIT Chennai Robotics Club rebuild

Prepared 2026-09-30. It merges three read-only survey reports (A: content pages and assets; B: functional flows and API; C: data, Supabase and config) and checks them against the source in `D:/RCweb-reimagined` (branch `main`, read-only). Where noted, it also checks `D:/RC-web`.

- References are `file:line`, relative to `D:/RCweb-reimagined/` unless they start with `RC-web/`.
- This document contains no key, token or secret value. Environment variables are listed by name only.
- "Rebuild" means the new, freshly scaffolded project. No component code carries over. This document lists the behaviour, data, contracts and files that do.

**The owner's decisions (binding)**
1. Brand-new project on a fresh scaffold.
2. Carry over the data, the Supabase setup (auth, tables, storage) and the API.
3. Colours come only from the logo: blue `#4A8DB7` / `#619AC3`, greys `#E5E8EB` to `#BFC7CE`, white `#FFFFFF`, black `#0D0D0D`. No gold or yellow.
4. Do not carry over the current fonts (Inter, JetBrains Mono, Syne) or the 3D gear hero.
5. Drop fake and decorative ("AI slop") content and features.

**Summary.**
- **Live data today.** Only two tables drive the public site (`events`, `gallery`). Everything else is hard-coded, and much of it is invented.
- **What the rebuild keeps.** The real flows: events, gallery, team, partners, certificates, the recruitment waitlist, the admin content tools and the admin list.
- **Where the static data goes.** The hard-coded team list and partner list move into `members` and `collaborations`. Both tables already exist but nothing reads them.
- **Fix this first.** The database security rules (RLS) let any Google account make itself an admin. The old site is still live, so this must be closed as the very first step after the paused project is restored.
- **What could not be checked.** The Supabase project is paused, so nothing about the live database was verified.

---

## 1. Feature inventory

### 1.1 Public site

| # | Page or flow | What it must provide | Data source today | Data source in the rebuild |
|---|---|---|---|---|
| P1 | Site shell | Logo, nav, footer with contact and socials, "© {year} VIT Chennai Robotics Club" (`Footer.tsx:93`). **Each page needs its own URL, so deep links and the back button work.** Today the page lives in React state only (`App.tsx:20`); links call `preventDefault` (`TopBar.tsx:50-54`, `Footer.tsx:48-52`). Add a 404 page. | Static | Static, plus a router |
| P2 | Home | Club name and one honest sentence; an upcoming-events strip; a photo-highlights strip; socials and contact. Show a stats row only if the owner supplies verified numbers (see 8.8). | `events` where `stage='upcoming'`, ordered by `date` descending (`HomeView.tsx:66`). `gallery` ordered by `order_index` (`HomeView.tsx:78`). If that is empty it tries `GET /api/gallery` (`:87`), then the static `GALLERY_ITEMS` (`:60`). | Same two tables. With no rows, show an honest empty state instead of static fallbacks. |
| P3 | Event detail | Title, date, description, status, and a link out to VIT Event Hub with the instruction to search for the event title there (`HomeView.tsx:560-564`, `ActivitiesView.tsx:122-136`). The status `'Coming Soon'` switches the button label (`ActivitiesView.tsx:130-135`, `HomeView.tsx:568-573`). | `events` row, shown in a pop-up | `events` row on its own page, e.g. `/events/:id` |
| P4 | Events page | An upcoming list, plus an archive grouped by `year` (newest first). An archive card links out when `link` is set (`ActivitiesView.tsx:16-19, 145-200`). | `events`. The static `UPCOMING_EVENTS` shows only if the query errors (`:9`). `ARCHIVE_RECAPS` is imported but never used (`:4, :10`). | `events` |
| P5 | About | The two Genesis paragraphs (`AboutView.tsx:113-118`); the two build photos (`:132, :136`); the objectives, rewritten (`:274-278`); the campus photo and Maps link (`:149, :156`). A photo wall from `gallery` is optional. | Static copy; `gallery` (`AboutView.tsx:16-28`) | Static copy; `gallery` |
| P6 | Team | Faculty coordinator block (`MembersView.tsx:221-254`), board, and core team grouped by division, with a division filter. No invented contact links. | Static `BOARD_MEMBERS` and `CORE_MEMBERS` (`data.ts:3-222`) | **`members` table.** It exists but is never queried (`supabase_schema.sql:11-27`). |
| P7 | Divisions | The six divisions, a description of each, and who is in each (`DepartmentsView.tsx:20-70`). Could be merged into P6 (see 8.18). | Inline arrays, plus `CLUB_MEMBERS` filtered by `departmentId` (`:70`) | Static division list, plus `members.department_id` |
| P8 | Partners (today labelled "Achievements", heading "Industry Collaborations") | Partner name, category, logo and website. Ship only after the owner confirms the partners (see 8.9). | Hard-coded `partners` array (`AchievementsView.tsx:19-120`) | **`collaborations` table.** It exists but is never queried (`supabase_schema.sql:91-101`). |
| P9 | Certificates | Look up by cohort year and roll number, show the certificate, print it with a proper print stylesheet. The certificate must use the stored `event_name`. Add a new "verify by certificate ID" page (see 8.10). | `POST /api/certificates/validate`, which reads `certificates` (`api/index.ts:537-581`) | Same table, through a hardened endpoint |
| P10 | Recruitment waitlist | Name and VIT email sign-up. Report real success or failure. The owner can open or close it. | `POST /api/forms/submit`, which writes `form_submissions` (`api/index.ts:648-683`). The page shows success even on failure (`MembersView.tsx:164-172`). | Same endpoint and table. **The table must be created**, because the schema file never creates it. |
| P11 | Contact | A `mailto:` link and a copy-email button for robotics.club@vit.ac.in, plus Instagram and LinkedIn (`HomeView.tsx:9-52`, `Footer.tsx:22-26, 71-86`). There is no contact form, even though the README claims one (`README.md:18`). | Static | Static |
| P12 | Search (command palette) | Optional (see 8.17). If kept, it must search live tables, not `data.ts` (`CommandPalette/searchIndex.ts:1-40`). | Static `data.ts` | Live tables, or drop it |

### 1.2 Authentication

| # | Flow | Today | Rebuild |
|---|---|---|---|
| A1 | Google sign-in and sign-out | Supabase Google OAuth (`src/lib/supabase.ts:48-64`). The `@vitstudent.ac.in` rule is checked only in the browser, after Supabase has already issued a session (`App.tsx:25-58`). | Same provider. **Check the domain on the server** for every authenticated API call, and optionally with a Supabase sign-up hook. |
| A2 | Public "Student login" | Shown in TopBar and MobileDrawer (`TopBar.tsx:77-97`, `MobileDrawer.tsx:77-119`). It unlocks nothing on the public site. | Offer sign-in only on `/admin` (see 8.4), unless certificates adopt sign-in (8.10). |

### 1.3 Admin (all real flows; the fake panels are in section 7)

| # | Control | Today | Rebuild |
|---|---|---|---|
| AD1 | Admin page states (signed out, signed in but not admin, admin) | `AdminView.tsx:267-761`. It reads the session once and never listens for changes (`:87-114`). It also trusts a `localStorage` key (`:43-50`). | Admin status checked on the server through `admins`. React to auth changes. No `localStorage` trust. |
| AD2 | Request admin access | `POST /api/admin/request-access` sends a Resend email (`api/index.ts:314-346`, `AdminView.tsx:190-217`) | Keep. Fix the error handling (section 4.6). |
| AD3 | Events: create, edit, delete, "Mark completed" | `EventsManager.tsx`, using `/api/events*`, with direct-to-Supabase fallbacks | Keep, API only |
| AD4 | Gallery: create, edit, delete, image upload, preview | `HighlightsManager.tsx`, using `/api/gallery*` and `/api/imagekit/auth` | Keep, API only. Fix the `year` reset (section 3.6, item 7). Drop "Import 10 defaults". |
| AD5 | Admin list, invite and revoke | `AdminAccessManager.tsx`, using `/api/admin/list`, `/invite` and `/remove/:id` | Keep. The protected accounts become a DB flag instead of hard-coded lists (see 8.5). |
| AD6 | **New:** members editor | No UI. The `members` table is unused. | Needed once P6 reads from `members` (see 8.19) |
| AD7 | **New:** partners editor | No UI. The `collaborations` table is unused. | Needed once P8 reads from `collaborations` |
| AD8 | **New:** certificate CSV import, list and revoke | Rows can be added only by hand in the Supabase dashboard | Recommended (see 8.19) |
| AD9 | **New:** waitlist submissions list and CSV export | Nothing reads `form_submissions` anywhere | Recommended (see 8.19) |

---

## 2. Data to carry over

### 2.1 Identity and contact (verified in source)

| Item | Value | Source |
|---|---|---|
| Club name | Robotics Club, VIT Chennai ("VIT Chennai Robotics Club" in the footer) | `HomeView.tsx:241-242`, `Footer.tsx:93` |
| Email | robotics.club@vit.ac.in | `HomeView.tsx:41-42`, `Footer.tsx:23` |
| Instagram | `@robotics_club_vitc`, https://www.instagram.com/robotics_club_vitc/ | `HomeView.tsx:13-14`, `Footer.tsx:72` |
| LinkedIn | https://in.linkedin.com/company/robotics-club-vitc | `HomeView.tsx:28`, `Footer.tsx:80` |
| Event registration | https://eventhubcc.vit.ac.in/EventHub/, plus the "search for the event title to register" instruction | `HomeView.tsx:560-564`, `data.ts:233` |
| Campus map | https://maps.google.com/?q=VIT+Chennai | `AboutView.tsx:156` |
| Page title today | "Robotics Club VITC" | `index.html:12` |

### 2.2 Faculty coordinator (verified)

- **Name:** Dr. Arockia Selvakumar A., "Faculty Coordinator" (`MembersView.tsx:227-230`).
- **Photo:** `public/fc.jpg`, 354×354 (`MembersView.tsx:221`).
- **Quote:** the coordinator's quote at `MembersView.tsx:248`. Carry it word for word, after confirming with him.
- **Profile link:** https://chennai.vit.ac.in/member/dr-arockia-selvakumar/ (`MembersView.tsx:254`).

### 2.3 Roster: names, roles and divisions only

Everything else in these records is invented: email, github, instagram, linkedin, bio, subsystem and image (see section 7). Board records are at `data.ts:3-40`; core records at `data.ts:42-222`.

| Name (as in source) | Role | `department` / `departmentId` | Line | Notes |
|---|---|---|---|---|
| Ihsan | Vice-Chair | Projects / `projects` | 5-13 | The admin seed names him "Ihsan Hashir", role "President / Core Leadership" (`supabase_schema.sql:222`). **The roles conflict.** |
| Grace | Secretary | Operations / `operations` | 17-25 | |
| Vinayak | Co-Secretary | Operations / `operations` | 29-37 | |
| Karthik | Projects Head | Projects / `projects` | 45-53 | |
| Akshaj | Projects Lead | Projects / `projects` | 57-65 | |
| Tarun | Projects Lead | Projects / `projects` | 69-77 | |
| Pranjal | Technical Head | Web Dev / `webdev` | 83-91 | The only Web Dev member |
| Aurka | Teaching Lead | Teaching / `teaching` | 97-105 | Teaching has no Head |
| Basil | Design / Creative Head | Media and Design / `media` | 111-119 | |
| Leni | Design / Creative Lead | Media and Design / `media` | 123-131 | |
| Goutham | Management Head | Operations / `operations` | 137-145 | |
| Akshita | Management Lead | Operations / `operations` | 149-157 | |
| Aditya | Management Lead | Operations / `operations` | 161-169 | Possibly "Aditya Kumar Sahu", role "Core Leadership", in the admin seed (`supabase_schema.sql:223`). Unconfirmed. |
| Gurudeep | Outreach Head | Marketing and Sponsorship / `marketing` | 175-183 | |
| Madhava | Outreach Lead | Marketing and Sponsorship / `marketing` | 187-195 | |
| Ashton | Publicity Head | Marketing and Sponsorship / `marketing` | 199-207 | |
| Daksh | Publicity Lead | Marketing and Sponsorship / `marketing` | 211-219 | |

- **Gaps in the roster:** no Chair or President appears anywhere. There are no surnames except the two in the admin seed.
- **The developer is missing:** the admin seed lists "Mohamed Rifan Ajmal, Lead Developer & Admin" (`supabase_schema.sql:220`), but he is not on the public roster.
- **Duplicate roster:** `DIVISIONAL_MEMBERS` (`data.ts:377-593`) repeats the same 17 people with different invented bios. Drop it.

### 2.4 Divisions

The six `departmentId` values in `data.ts` are the only consistent keys. The Members page shows the same divisions under different labels.

| `department_id` | Departments-page name and tag (`DepartmentsView.tsx`) | Members-page label (`MembersView.tsx:25-68`) | Description (Departments page) | Verdict |
|---|---|---|---|---|
| `projects` | Projects, "Engineering & R&D" (22-27) | Projects & Robotics | line 25 | Keep the description |
| `webdev` | Web Dev, "Digital Infrastructure" (29-34) | Technical & Software | line 32 | Rewrite: it claims "real-time telemetry dashboards" |
| `teaching` | Teaching, "Knowledge Sharing" (36-41) | Teaching & Mentorship | line 39 | Keep; "board routing" is borderline |
| `media` | Media and Design (46-51) | Design & Creative | line 49 | Keep, but tone it down |
| `operations` | Operations (53-58) | Management & Operations | line 56 | Keep |
| `marketing` | Marketing and Sponsorship (60-65) | Outreach & Publicity | line 63 | Keep, but tone it down |

### 2.5 About copy

- **Genesis:** the two paragraphs at `AboutView.tsx:113-118` are real, plain descriptions. Keep them.
- **Objectives:** keep the substance of the list at `AboutView.tsx:274-278` (workshops, competitions, industry links, member portfolios, robotics for society) but rewrite the wording. The competitions named, ERC and RoboClash, need confirming.
- **Workspace and inventory claims:** "24/7 sandbox… high-frequency kinetic machinery" (`:184`) and "NVIDIA Jetson… multi-sensor spatial navigation arrays" (`:196`) are unverified. Use them only if the owner confirms.

### 2.6 Events

These are the five TechnoVIT '26 events. The titles, the "TechnoVIT '26" label and the Event Hub link are real. The descriptions and images are filler.

| Title | Seed `category` (`supabase_schema.sql:191-195`) | Image today | Description |
|---|---|---|---|
| Roborace | Roborace | `/gallery/8.jpg` (unrelated) | Rewrite |
| Line Follower | Autonomous | `/gallery/7.jpg` (unrelated) | Rewrite; drop the "PID… micro-second" jargon (`data.ts:239`) |
| Robosoccer | Combat & Sports | `/gallery/3.jpg` (unrelated) | Rewrite; drop "pneumatic kicking levers" (`data.ts:247`) |
| Obstacle Course | All-Terrain | `/gallery/2.jpg` (unrelated) | Rewrite |
| Robosumo | Robowars & Sumo | `/gallery/4.jpg` (unrelated) | Rewrite |

- **Date format:** the seed stores the date as the text `Technovit26'` (`supabase_schema.sql:191`), while `data.ts:229` has `TechnoVIT '26`. Use one label, and store a real date if one is known.
- **Archive events** (`data.ts:269-302`, never shown): "Arduino Rev Up Level 1", "Robotics Club Expo '26", "TechnoVIT '25 Flagship", "Advanced Kinematics Session". Carry them only if the owner confirms each one. Drop the `https://photos.google.com/` placeholder link (`:277`) and the "500+ participants" claim (`:292`).

### 2.7 Gallery photos and honest captions

The photos are real club photos, but every caption is wrong. Report A inspected them; I re-checked #4 and #9. Captions in `data.ts:304-375` and the seed at `supabase_schema.sql:203-212` must be replaced.

| File | What the photo shows | Suggested caption basis (the owner writes the final text) |
|---|---|---|
| `gallery/1.jpg` | RIACT '26 conference group photo in a VIT Chennai auditorium | RIACT '26 |
| `gallery/2.jpg` | About 100 students holding small robot cars | Workshop (which one?) |
| `gallery/3.jpg` | ROBOTICA-25 stage (Otomatiks' national inter-school competition, 7-8 Feb 2025, VIT Chennai) | ROBOTICA-25 |
| `gallery/4.jpg` | Auditorium audience with a Jeppiaar Academy anti-bullying slide | Not a robotics photo. Drop it (8.15). |
| `gallery/5.jpg` | Students soldering at an outdoor table | Soldering session |
| `gallery/6.jpg` | Packed computer-lab session (portrait, black bars) | Lab session; crop it |
| `gallery/7.jpg` | Night shot: RC transmitter, controller board, small robotic arm | Build close-up |
| `gallery/8.jpg` | Electronics trainer kit and multimeter | Electronics basics |
| `gallery/9.jpg` | Prize-giving on stage with trophies; a Bobble poster at the stage edge | Prize distribution (which event?) |
| `gallery/10.jpg` | Large club group photo on steps, core team in club polos | Club group photo |

### 2.8 Partners (only after the owner confirms)

Source: `AchievementsView.tsx:19-120`. Carry only the names and URLs. Every description and summary reads as invented and must be dropped.

| Name in source | Website | Fix |
|---|---|---|
| Jet Aerospace | https://jetaero.in | |
| Alstruct India | https://www.alstrut.com | Name and domain disagree ("Alstruct" vs "alstrut"). Confirm which is right. |
| Unbox Robotics | https://www.unboxrobotics.com | |
| Prag Robotics | https://pragrobotics.com | |
| EPR LABS | https://eprlabs.com | |
| Tezznova | https://tezznova.com | |
| L&T Technology Services | https://www.ltts.com | |
| PepsiCo | https://www.pepsico.com | |
| Booble AI | https://bobble.ai | Spell it "Bobble AI". This is the only partner with photo evidence (`gallery/9.jpg`). |
| KwickPic | https://kwikpic.in | Spell it "Kwikpic" |

Logos are hotlinked from Google's favicon service and Clearbit (`AchievementsView.tsx:27-117`). Replace them with self-hosted logos.

### 2.9 Data that lives only in the database (export after restoring)

- **`admins`:** the seed has 5 rows (`supabase_schema.sql:218-225`). The live table may have more from invites.
- **`certificates`:** this is the only copy of every issued certificate. The row count is unknown.
- **`form_submissions`:** waitlist sign-ups, if the table exists on the live project (see section 9).
- **`events` and `gallery`:** admins may have edited these after seeding. Their `image_url` values may point to ImageKit.
- **`members` and `collaborations`:** the contents are unknown. The schema header says it was "aligned with existing tables" (`supabase_schema.sql:3, 9`), which suggests `members` existed before the file was written and may hold real rows.
- **`auth.users`:** the Google accounts that have signed in.

### 2.10 Placeholders that need real content from the owner

- **Home:** a hero line to replace "precision mechanical rigs, cybernetics systems" (`HomeView.tsx:251`). Stats only if verified (8.8).
- **Team:** surnames, Ihsan's role, who the Chair or President is, and whether the developer is listed. Photos with consent; until then use initials. Contact links only if members opt in.
- **Divisions:** a new Web Dev description.
- **About:** the objectives wording and the competitions named; the workspace and inventory claims.
- **Events:** descriptions for the five events, a real image for each (or none), real dates, and the archive entries with real links.
- **Gallery:** captions for photos 1-3 and 5-10.
- **Partners:** confirmation, a one-line relationship description each, and logos.
- **Certificates:** the certificate wording and signatory. Today the text is hard-coded to "Control Theory Bootcamp" (`CertificatesView.tsx:326`).
- **Recruitment:** whether intake is open, and the copy for each state.
- **Site metadata:** the manifest name, short name and theme colour (today `"MyWebSite"` / `"MySite"` / `#ffffff`, `public/site.webmanifest:2-3, 18-19`), and a meta description (`index.html` has none).

### 2.11 Filler already written to the live database (if it was seeded from the file)

- **Events:** the descriptions at `supabase_schema.sql:191-195` and the date string `Technovit26'`.
- **Gallery:** the titles, subtitles, categories and stories at `supabase_schema.sql:203-212`, and `year` defaulting to `'2025'` on every row (`:76`, `api/index.ts:242`, `HighlightsManager.tsx:201, 308`).
- **Fix:** rewrite these in a data migration. Do not copy them into the new project.

---

## 3. Supabase contract

### 3.1 Project

- **Identity:** ref `osjvefbyxwvtycxukcmq`, name "rcweb", region ap-south-1, Postgres 17.6.1.155, created 2026-08-19.
- **Status:** INACTIVE (paused). Report C's calls to `list_tables`, `list_migrations`, `list_extensions` and `execute_sql` all timed out. Its security advisor returned `{"lints":[]}`, which proves nothing because the database was unreachable.
- **Migrations:** there is no migrations folder. The only schema source is `supabase_schema.sql`.
- **Do not re-run `supabase_schema.sql`:**
  - line 32 is `DROP TABLE IF EXISTS public.events CASCADE`, which wipes all events;
  - line 128 enables RLS on `form_submissions`, a table the file never creates, so the file fails on a fresh database.
- **Second project:** the same account also has "helpRifan's Project" (`qerekbtwimbxrvijrdce`), also paused. Nothing references it.

### 3.2 Tables

Columns come from `supabase_schema.sql` and are not verified against the live database.

| Table | Columns (type) | Read by | Written by | Rebuild notes |
|---|---|---|---|---|
| `events` (34-47) | `id` uuid PK; `title` text NOT NULL; `category` text; `date` **text**; `description` text; `image_url` text; `status` text default `'Upcoming'`; `registration_link` text; `stage` text NOT NULL default `'upcoming'`, CHECK `upcoming`/`completed`; `year` text; `link` text; `created_at` timestamptz | `HomeView.tsx:66`; `ActivitiesView.tsx:16`; `EventsManager.tsx:84-87`; `api/index.ts:126, 172` | `api/index.ts:184, 197, 209`; direct browser fallbacks at `EventsManager.tsx:157-160, 184-186, 221-224, 268-271` | Add a real `date` column for sorting and keep a display label. Normalise `year` to four digits. Replace the magic `status` string with a fixed set of values (8.12). |
| `gallery` (68-86) | `id` uuid; `title` text NOT NULL; `subtitle` text; `category` text; `image_url` text NOT NULL; `story` text; `description` text; `year` text default `'2025'`; `order_index` int default 0; `created_at` | `HomeView.tsx:78`; `AboutView.tsx:16-19`; `HighlightsManager.tsx:115-118`; `api/index.ts:221-224` | `api/index.ts:236-244, 258-273, 289`; direct at `HighlightsManager.tsx:222-225, 244-246, 284-287, 312` | Collapse the duplicate pairs `subtitle`/`category` and `story`/`description` into one column each (item 2 in 3.6). Drop the `'2025'` default. |
| `admins` (106-118) | `id` uuid; `email` text UNIQUE NOT NULL; `name` text; `role` text default `'Club Admin'`; `added_by` text default `'System'`; `created_at` | `api/index.ts:52-56, 353-356`; `src/lib/supabase.ts:37-41`; `AdminAccessManager.tsx:71-74` | `api/index.ts:401-410` (upsert on email), `:489-495` (delete); direct delete at `AdminAccessManager.tsx:182` | Store emails in lower case under a CHECK constraint. Add an `is_owner` boolean to replace the hard-coded lists (8.5). `role` stays a free-text label; the 8 dropdown values at `AdminAccessManager.tsx:377-384` carry no permissions. |
| `certificates` (52-63) | `id` uuid; `certificate_id` text UNIQUE NOT NULL; `year` text NOT NULL; `roll_number` text NOT NULL; `student_name` text NOT NULL; `event_name` text NOT NULL; `issue_date` **text** NOT NULL; `created_at`; index on (`year`, `roll_number`) | `api/index.ts:543-548` only | Nowhere in code (dashboard only) | Keep. Consider an optional `student_email` column (8.10). Allow several certificates per student per year. |
| `form_submissions` | **No CREATE statement.** The columns implied by `api/index.ts:657-668` are `id`, `form_type`, `full_name`, `email`, `phone`, `roll_number`, `department_preference`, `message`, `status` (`'pending'`), and presumably `created_at`. | Nothing | `api/index.ts:657` | Create it in a migration. Add a unique index on (`form_type`, lower(`email`)) to stop duplicate sign-ups. |
| `members` (11-27) | `id`; `name` NOT NULL; `role` NOT NULL; `department` NOT NULL; `department_id` NOT NULL; `subsystem`; `email`; `github`; `linkedin`; `instagram`; `bio`; `image_url`; `is_core` bool; `order_index` int; `created_at` | **Nothing** | **Nothing** | Becomes the source for P6 and P7. Keep `department_id` only, with a CHECK on the six ids. Add a tier (faculty, board or core) and `is_published`. Store contact fields only with consent. |
| `collaborations` (91-101) | `id`; `name` NOT NULL; `category` NOT NULL; `description` NOT NULL; `summary` NOT NULL; `logo_url`; `website_url`; `order_index`; `created_at` | **Nothing** | **Nothing** | Becomes the source for P8. Relax the NOT NULL on `description` and `summary`. Add `is_published`. |

No code references any other table. The grep of `src/` and `api/` for `.from(` returns only the tables above.

### 3.3 Auth

- **Provider:** Google OAuth only (`src/lib/supabase.ts:48-60`). There is no email/password, magic-link or OTP login.
- **Query parameters:** `hd: "vitstudent.ac.in"` and `prompt: "select_account"` (`:53-56`). `hd` only filters Google's account picker; neither Google nor Supabase enforces it.
- **Redirect:** `redirectTo: window.location.origin` (`:49`). Supabase's Site URL and redirect list must include every origin: local dev (port 5173 by default, `server.ts:9`), Vercel previews and production.
- **Client setup:** `createClient` is called with no auth options (`src/lib/supabase.ts:6`). That means:
  - the implicit flow (confirmed at `node_modules/@supabase/auth-js/dist/main/GoTrueClient.js:24`), so tokens come back in the URL fragment;
  - the session is stored in `localStorage` under `sb-<ref>-auth-token`;
  - tokens refresh automatically.

  The rebuild should use the PKCE flow.
- **Server check today:** `supabase.auth.getUser(token)` in `requireAuth` and `requireAdminAuth` (`api/index.ts:64-115`), with no domain check.
- **Admin status decided in five places today** (all to be replaced by the `admins` table alone):
  - `ADMIN_EMAILS` on the server (`api/index.ts:37-42`);
  - a lookup in `admins` (`:50-58`);
  - a browser copy of `ADMIN_EMAILS` plus `checkClubAdminAsync` (`src/lib/supabase.ts:11-46`);
  - a guess from `data.ts` membership (`AdminView.tsx:91-109`);
  - `PROTECTED_EMAILS`, which lists only 2 of the 4 (`AdminAccessManager.tsx:26-29`).

  The four hard-coded accounts are three `@vitstudent.ac.in` addresses (Mohamed Rifan Ajmal, Ihsan Hashir, Aditya Kumar Sahu) and the owner's personal Gmail. The browser signs the Gmail account out immediately (`App.tsx:28-36`). The seed's `robotics.club@vit.ac.in` admin row can never sign in for the same reason.
- **To configure in the dashboard:** enable the Google provider, set the Site URL and redirect list for the new origins, and optionally add a before-user-created hook that rejects other email domains, if the plan supports it.

### 3.4 Storage

- **No Supabase Storage is used anywhere.** There is no `.storage`, `.rpc(` or `.channel(` call in `src/` or `api/`.
- **All images go to ImageKit** at endpoint `https://ik.imagekit.io/Rifan`, which is a fallback literal in `EventsManager.tsx:21` and `HighlightsManager.tsx:35`.
  - **Bulk upload:** `upload_all_images.mjs:55-89` uploaded 38 local files into `/robotics-club/{branding,banners,campus,faculty,about,hero,gallery,events-archive}`. The map is in `imagekit_mapping.json`.
  - **Gallery uploads** from the admin go to `/robotics-club/gallery` (`HighlightsManager.tsx:650-653`).
  - **Event cover uploads have no folder**, so they land in the ImageKit root with the tag `event` (`EventsManager.tsx:503-510`).
- **Live buckets:** unknown (section 9).
- **The owner's decision says "storage".** The only storage in use is ImageKit. See 8.3.

### 3.5 RLS today, and what the rebuild needs

| Table | Today (`supabase_schema.sql`) | Rebuild |
|---|---|---|
| `events` | Public SELECT (135). INSERT, UPDATE and DELETE for **any authenticated user** with `true` (137-144). | Public SELECT only. Writes only through the API with the service-role key. |
| `gallery` | Public SELECT (150). Any authenticated user can write (152-159). | Same as `events` |
| `admins` | **Public SELECT** (167-168). **Any authenticated user can INSERT, UPDATE or DELETE** (170-177). | No anon or authenticated access. Service role only. |
| `certificates` | **Public SELECT** (146-147), which exposes every name and roll number to anyone with the anon key | No anon or authenticated access. Lookups go through the API. |
| `form_submissions` | Public INSERT (180-181). A policy named "Admin Read…" actually grants SELECT to **any authenticated user** (183-184). | No client access. Service role only. |
| `members` | Public SELECT (132) | Public SELECT of published rows and public columns only |
| `collaborations` | Public SELECT (161-162) | Public SELECT of published rows |

**The critical hole.** Any Google account can get a Supabase session, because the domain check runs only in the browser. With that session and the public anon key, it can insert its own row into `admins`. The API then treats it as an admin (`api/index.ts:50-58`). This is open on the live project as soon as the project is restored (see 8.2).

### 3.6 Code-vs-schema mismatches to settle in the rebuild

1. **Events are sorted on a text column.** `events.date` is text but is sorted like a date (`HomeView.tsx:66`, `ActivitiesView.tsx:16`), so the order is alphabetical.
2. **Gallery edits never reach the public site.**
   - Writes go only to `category` and `description` (`api/index.ts:236-243, 258-265`; `HighlightsManager.tsx:195-202`).
   - Reads prefer `subtitle` and `story` (`HomeView.tsx:82-83`, `AboutView.tsx:25, 27`).
   - So an edited seed row keeps showing its old seed text.
   - Pick one column of each pair. The recommended default is `category` and `description`, because admin edits land there. Rewrite the captions, then drop `subtitle` and `story`.
3. **Event fields use two naming styles.** Fixtures use `image`, `desc` and `registrationLink`; the database uses `image_url`, `description` and `registration_link`. Views read `a || b` (`types.ts:24-34`; `HomeView.tsx:347, 354, 540, 564`; `ActivitiesView.tsx:95-97, 119, 126, 175-186`). The rebuild uses the database names only.
4. **`year` has three formats:** `"2026"` in `data.ts:276`, `'2025'` as the gallery default, and `"26'"` from "Mark completed" (`EventsManager.tsx:248, 437`). The archive groups by exact string (`ActivitiesView.tsx:152`), so the same year splits into separate groups.
5. **`events.status` is free text** with at least four de-facto values: `Upcoming`, `Coming Soon` (a magic value that changes the button), `Completed` (`EventsManager.tsx:245`) and "Registration open" (the placeholder at `:454`).
6. **`form_submissions` is used but never created** (item 3.2).
7. **The gallery editor resets the year.** It never loads `year` (`HighlightsManager.tsx:347-358`), so every save writes `'2025'` (`:201`).
8. **The certificate display ignores the database.** It shows hard-coded event text (`CertificatesView.tsx:326`) instead of the returned `event`, and the cohort years are fixed at 2023-2025 (`:132-134`).
9. **Only one certificate per student per year is possible.** The lookup uses `maybeSingle` (`api/index.ts:548`), so two certificates in one year cause an error, which then falls through to the mock data.
10. **`members` and `collaborations` are defined but unused.** The static data (`data.ts`, `AchievementsView.tsx:19-120`) matches their shape.
11. **`GALLERY_ITEMS` uses numeric ids 1-10,** which is why the API has non-UUID branches (`api/index.ts:267-271, 286-288`). The rebuild uses UUIDs only.

---

## 4. API contract

### 4.1 Runtime today

- **App:** one Express app in `api/index.ts`, using `express.json()` (`:7`). The router is mounted at both `/api` and `/` (`:686-687`) and default-exported for Vercel (`:689`).
- **Vercel routing:** `vercel.json:2-11` rewrites `/api/(.*)` to `/api` and everything else to `/index.html`. The `/` mount therefore only works locally, and the browser's `/imagekit/auth` retry (`EventsManager.tsx:36`, `HighlightsManager.tsx:50`) never fires on Vercel.
- **Local development:** `server.ts` loads `.env.local`, runs Vite in middleware mode, and is skipped when `VERCEL` is set (`server.ts:1-34`).
- **Missing entirely:** CORS config, rate limiting, input validation and security headers.
- **Rebuild:** keep the `/api/*` paths and response shapes below, drop the `/` mount, and read the service-role key on the server only.

### 4.2 Conventions for the rebuild

- **Auth header:** `Authorization: Bearer <supabase access_token>`.
- **"Admin" means all of these:**
  - the token is valid (`auth.getUser`);
  - the email is verified;
  - the email domain is allowed;
  - there is an exact, lower-cased match in `admins`.
- **Errors:** `{ error: string }` with a generic message. Log the details on the server. Today raw `error.message` goes to the client (`api/index.ts:176, 188, 201, 213, 227, 248…`).
- **Missing configuration:** refuse to start if a required server variable is missing. There must be no silent fallback to the anon key (`api/index.ts:11`) and no "success" without saving (`:682`).

### 4.3 Endpoints to carry over

| Method and path | Access | Request | Response today | Required changes |
|---|---|---|---|---|
| GET `/api/events` (`:169-178`) | public | – | `Event[]`, all columns, `created_at` descending; 503 or 500 `{error}` | Add filters (`stage`) and a real date sort |
| POST `/api/events` (`:180-190`) | admin | Any columns except `id`, `created_at` | The inserted row | **Allow only** `title, category, date, description, image_url, status, registration_link, stage, year, link`. Validate the `stage` and `status` values, allow https URLs only, and use a real date. |
| PUT `/api/events/:id` (`:192-203`) | admin | Same | The updated row | Same allow-list. Return 404 for an unknown id. |
| DELETE `/api/events/:id` (`:205-215`) | admin | – | `{success:true}` | Return 404 for an unknown id |
| GET `/api/gallery` (`:218-230`) | public | – | `Gallery[]` by `order_index` ascending | One caption column set (item 2 in 3.6) |
| POST `/api/gallery` (`:232-250`) | admin | `{title, subtitle\|category, image_url, story\|description, order_index, year}` | The row. Defaults: title "Untitled", category "Operations", image `/gallery/1.jpg`, year "2025". | Require `title` and `image_url`. No invented defaults. |
| PUT `/api/gallery/:id` (`:252-279`) | admin | Same | The row. **A non-UUID id inserts a new row.** Every field is replaced, so missing fields reset to the defaults. | Partial update. Unknown id returns 404. Keep `year`. |
| DELETE `/api/gallery/:id` (`:281-295`) | admin | – | `{success}`. A non-UUID id does nothing but still returns success. | Unknown id returns 404 |
| GET `/api/imagekit/auth` (`:154-166`) | admin | – | `{token, expire, signature}`; 503 if ImageKit is not configured | Keep. Used by the upload widget's `authenticator`. |
| POST `/api/admin/request-access` (`:314-346`) | signed in | – | `{success, message}`; short-circuits if already admin (`:317-320`); 503 if Resend is not configured | Check the error Resend returns (today it is ignored, so the page always says "Request sent"). Escape the name. Read recipients from env instead of hard-coding (`:326`). Require an allowed domain. |
| GET `/api/admin/list` (`:349-386`) | admin | – | `AdminUser[]`: DB rows plus synthetic `core-N` rows with names guessed from the email (`:363-380`) | DB rows only, including `is_owner` |
| POST `/api/admin/invite` (`:388-476`) | admin (owner in the rebuild) | `{email, name?, role?}` | `{success, emailDispatched, emailError, admin, message}`; upserts on `email` | Validate the email and domain. Build the invite link from `SITE_URL` instead of the hard-coded `https://rc-web-rho.vercel.app/#admin` (`:442`). Escape the HTML. Drop the invented "Lab Telemetry" permissions text (`:438`). |
| DELETE `/api/admin/remove/:id` (`:478-504`) | admin (owner in the rebuild) | `:id` is a UUID or an email | `{success, message}`; 403 for the 4 hard-coded emails | UUID only, exact match. Cannot remove yourself or the last owner. Move `decodeURIComponent` (`:479`) inside the error handling, or remove it. |
| POST `/api/certificates/validate` (`:537-581`) | public | `{year, rollNumber}` | `{found:true, name, event, date, id, source}` or `{found:false, message}` (status 200) | Exact match on the normalised roll number. **No mock fallback.** Return a list of certificates. Rate limit. See 8.10. |
| POST `/api/forms/submit` (`:648-683`) | public | `{formType, fullName, email, phone?, rollNumber?, departmentPreference?, message?}` | `{success, submissionId}`; 400 if `fullName` or `email` is missing | Validate the email and domain, de-duplicate, rate limit, add a honeypot field. Return an error when the database is unavailable. Allow `formType` only as `recruitment`. Honour an open/closed switch. |

**Recommended new endpoints.** Each serves a table that already exists.
- **Certificate verification:** `GET /api/certificates/:certificateId` (public). Returns `{found, name, event, date, id}`.
- **Admin CRUD** for `members`, `collaborations` and `certificates` (including CSV import).
- **Waitlist:** `GET /api/forms/submissions` (admin), with CSV export.

### 4.4 Endpoints to drop

| Endpoint | Why |
|---|---|
| GET `/health` (`:120-151`) | Leaks raw database errors and which services are configured, and nothing calls it. At most, keep a bare `{status:"ok"}`. |
| GET and POST `/admin/settings` (`:298-311`) | Fake "lab access / equipment checkout / maintenance" settings, held in memory and lost on every cold start. Nothing reads them. |
| GET `/admin/activities` (`:507-516`) | Returns 4 hard-coded fake people |
| POST `/email/send-otp` (`:584-645`) | An unauthenticated email sender where the caller picks both the recipient and the code. It defaults to the owner's Gmail and `123456` (`:587-588`), returns the code in `simulatedOtp`, and puts unescaped HTML in the email. |
| The mock certificate fallback (`:519-534, 565-574`) | Made-up students, and "Control Theory Bootcamp" for everyone |
| The `/` router mount (`:687`) | Would collide with page routes in the rebuild |

### 4.5 Integrations

| Service | Used for | Details to carry |
|---|---|---|
| Supabase | Database and auth | Server: service-role client. Browser: anon (publishable) client for public reads and auth only. |
| Resend | The request-access email and the admin invite email | **The sender is hard-coded to `onboarding@resend.dev`** (`api/index.ts:325, 593`; default at `:423`). That is Resend's test sender, which only delivers to the Resend account's own address. It explains why all mail reaches the owner's inbox, and why invites to other people fail with "Resend test mode domain restriction" (`:452`). The rebuild needs a verified domain and `RESEND_FROM_EMAIL` (8.13). |
| ImageKit | Image hosting, signed browser uploads, URL transforms | Server: `imagekit` SDK `getAuthenticationParameters()` (`:161`). Browser: `imagekitio-react` `IKContext` / `IKUpload` (`EventsManager.tsx:2, 499-512`). Upload target: `upload.imagekit.io`. Transform syntax is `tr:w-…,h-…,q-…,f-…` (`src/lib/imagekit.ts:52-69`, which is dead code but documents the syntax). |
| Google OAuth | Sign-in, through Supabase | Google Cloud OAuth client configured in the Supabase dashboard |
| VIT Event Hub | Registration, as an external link only | https://eventhubcc.vit.ac.in/EventHub/ |
| Hotlinks to replace | Unsplash portraits (`data.ts`), Google favicon service and Clearbit logos (`AchievementsView.tsx:27-117`), picsum (`DriftWall.tsx:41-48`), Google Fonts (`src/index.css:1`) | Drop all of them |
| Unused | `@google/genai` (`package.json`), `GEMINI_API_KEY`, the "cognitive AI assistant" in `metadata.json` | Drop |

### 4.6 Security problems to fix in the rebuild (most severe first)

1. **Critical: self-promotion to admin** through the open RLS on `admins` (`supabase_schema.sql:170-177`), combined with the API trusting any `admins` row (`api/index.ts:50-58`). Fix: RLS as in 3.5; service-role-only writes; exact lower-cased match.
2. **Critical: any signed-in user can write** to `events` and `gallery` (`supabase_schema.sql:137-144, 152-159`). The old admin UI falls back to direct Supabase writes on *any* API failure, including 401 and 403 (`EventsManager.tsx:139-192, 207-229, 253-276`; `HighlightsManager.tsx:206-250, 271-290, 312`; `AdminAccessManager.tsx:180-184`). Fix: no client write policies and no client writes.
3. **High: the domain is enforced only in the browser** (`App.tsx:28-51`), and `hd` is just a hint. Fix: check the domain and `email_verified` on the server; optionally add a Supabase sign-up hook.
4. **High: personal data is publicly readable.** `certificates` (names and roll numbers) and `admins` (emails) are public; `form_submissions` is readable by any signed-in user. Fix: as in 3.5.
5. **High: an open email relay** at `/email/send-otp`. Fix: drop it (4.4).
6. **Medium: ILIKE with user input.**
   - Where: the admin check (`api/index.ts:55`, `src/lib/supabase.ts:40`), admin removal (`api/index.ts:494`, `AdminAccessManager.tsx:182`) and the certificate lookup (`api/index.ts:547`).
   - `_` matches any single character and `%` matches anything. A double-encoded `%2525` reaches `.ilike("email","%")` and deletes every admin row that is not hard-coded. (A single `%25` makes line 479 throw; see the cross-check log, item 4.)
   - Fix: use `eq` on normalised values.
7. **Medium: events accept any columns** (`api/index.ts:183, 196`), and URLs are saved unvalidated, then rendered as `href` and `src`. Fix: an allow-list and https-only URLs.
8. **Medium: no rate limiting** on the public POSTs (`/certificates/validate`, `/forms/submit`). Fix: per-IP limits.
9. **Low: unescaped HTML in emails** (`api/index.ts:331, 433-437, 601-604`). Fix: escape it.
10. **Low: leaks and weak defaults.**
    - Raw database errors reach the client, and `/health` leaks configuration.
    - The service-role key silently falls back to the anon key (`:11`).
    - Admin emails are hard-coded into the browser bundle (`src/lib/supabase.ts:11-16`, `AdminAccessManager.tsx:26-29`).
    - AdminView trusts `localStorage` (`AdminView.tsx:43-50`).
    - `decodeURIComponent` runs outside the error handling (`api/index.ts:479`).
11. **Hygiene.**
    - No `.env.example` exists.
    - `.gitignore` covers only `.env` and `.env.local`.
    - `RC-web/.env.local.txt` is neither tracked nor ignored.
    - The rebuild should ignore `.env*`, except `.env.example`.

---

## 5. Environment variables required (names only)

`.env.local` currently defines 13 names (names only were read): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `RESEND_API_KEY`, `VITE_IMAGEKIT_PUBLIC_KEY`, `VITE_IMAGEKIT_URL_ENDPOINT`, `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`, `PORT`.

| Name | Side | Required in the rebuild | Notes |
|---|---|---|---|
| `VITE_SUPABASE_URL` | browser | yes | Or the new framework's public prefix |
| `VITE_SUPABASE_ANON_KEY` | browser | yes | A public value. Newer Supabase projects call it the "publishable" key. |
| `SUPABASE_URL` | server | yes | Drop the `VITE_` fallback on the server |
| `SUPABASE_SERVICE_ROLE_KEY` | server | yes | Fail at boot if missing. No anon fallback. |
| `RESEND_API_KEY` | server | yes, if email is kept | |
| `RESEND_FROM_EMAIL` | server | yes, once a domain is verified | Read today only for invites (`api/index.ts:423`). Not in `.env.local`. |
| `IMAGEKIT_PUBLIC_KEY` | server | yes, if ImageKit is kept | |
| `IMAGEKIT_PRIVATE_KEY` | server | yes, if ImageKit is kept | Secret |
| `IMAGEKIT_URL_ENDPOINT` | server | yes, if ImageKit is kept | |
| `VITE_IMAGEKIT_PUBLIC_KEY` | browser | yes, if ImageKit is kept | Remove the hard-coded fallback literals at `EventsManager.tsx:20` and `HighlightsManager.tsx:34` |
| `VITE_IMAGEKIT_URL_ENDPOINT` | browser | yes, if ImageKit is kept | Same, for `:21` / `:35` |
| `SITE_URL` | server | **new** | Invite links and OAuth redirect. Replaces the hard-coded `rc-web-rho.vercel.app` (`api/index.ts:442`). |
| `ADMIN_NOTIFY_EMAILS` | server | **new** | Recipients for access requests. Replaces the hard-coded list at `api/index.ts:326`. |
| `ALLOWED_EMAIL_DOMAINS` | server and browser | **new**, optional | Replaces the hard-coded `@vitstudent.ac.in` (`src/lib/supabase.ts:8`) |
| `PORT` | local server | local only | Default 5173 (`server.ts:9`) |
| `NODE_ENV`, `VERCEL` | platform | set by tooling | Read at `server.ts:11, 32` |

**Drop:**
- `GEMINI_API_KEY`: defined, read nowhere.
- `SUPABASE_ANON_KEY` on the server: only a fallback.
- `DISABLE_HMR`: a Google AI Studio leftover (`vite.config.ts:15-19`).
- The server-side `VITE_*` fallbacks (`api/index.ts:10-11, 19, 21`).

**Not found:** no Vite `define` block inlines any server variable into the bundle (`vite.config.ts`).

---

## 6. Assets to carry over

All sizes and dimensions were checked with `ls` and `file`; transparency was checked with Pillow.

| File | Facts | Verdict |
|---|---|---|
| `RC-web/public/logo-nobg.png` | 1254×1254 RGBA, 516 KB, **88% fully transparent pixels**. Exists only in `D:/RC-web`. | **Master logo.** Export SVG (trace it, or ask for the original vector), plus WebP/PNG at 32, 64, 128 and 512 px. |
| `public/logo.png` | 1254×1254 RGBA, 354 KB. **Not transparent:** alpha minimum is 139 and the corner pixel is opaque black. | Fallback only, on dark backgrounds. Report A's "transparent" is wrong. |
| `public/fc.jpg` | 354×354, 25 KB. Faculty coordinator. | Keep. Confirm permission; probably VIT's own photo. |
| `public/genesis-1.jpg` | 4000×1848, 2.4 MB. Underwater ROV. | Keep. Resize to at most 1600 px wide and compress. |
| `public/genesis-2.jpg` | 1280×1109, 169 KB. Arduino car with an HC-SR04 sensor. | Keep |
| `public/campus.jpg` | 800×600, 148 KB. VIT Chennai main gate; EXIF shows it was edited by "Google" software. | Keep only if its source or licence is confirmed (8.16) |
| `public/gallery/1,2,3,5,6,7,8,9,10.jpg` | 59-562 KB each | Keep, with new captions (2.7). Crop the black bars on #6. |
| `public/gallery/4.jpg` | 324 KB. Jeppiaar Academy event, not the club. | Drop (8.15) |
| Favicons: `favicon.svg` (946 KB), `favicon.ico`, `favicon-96x96.png`, `apple-touch-icon.png`, `web-app-manifest-192x192.png`, `web-app-manifest-512x512.png` | `favicon.svg` wraps an embedded raster | Regenerate them all from the master logo |
| `public/site.webmanifest` | Placeholder names and a white theme | Rewrite (2.10) |

**Drop:**
- `public/logo.jpeg` and the repo-root `logo.jpeg`: black-background copies, unused.
- `public/arockia.jpg`: corrupt (a JPEG damaged by a text-encoding round trip). It was produced by `downloadImg.cjs`, which disables TLS verification.
- `public/about-banner.jpg`: stock dot-matrix "Creation of Adam" hands.
- `public/hero/1-9.jpg`: memes and stock images.
- `web pics/videoframe_4164.png`: another frame of the same dot-matrix hands.
- The ten `web pics/WhatsApp Image 2026-06-17 …jpeg`: byte-identical (MD5) duplicates of `public/gallery/1-10.jpg`.
- `web pics/1.png`: 500×500, an alternate monochrome mark (a gear with "R" and a magnet-shaped "C"). Keep only if the owner says it is current (8.20).

**Referenced but missing or broken:**
- Every local path the app references exists on disk.
- `arockia.jpg` is referenced only by an unused constant (`MembersView.tsx:13`) and by `src/lib/imagekit.ts:23`, and it is corrupt.
- The ImageKit copies of all 38 files (including the memes and duplicates) sit under `/robotics-club/*`. Admin-uploaded event covers sit in the ImageKit root. Either clean them up or leave them unreferenced.
- The external hotlinks (4.5) disappear in the rebuild.

---

## 7. Drop list (do not recreate)

| Item | Where | Why |
|---|---|---|
| 3D gear hero (`Hero/*`, `three`, `@react-three/fiber`) | `src/components/Hero/`, `package.json` | Owner decision |
| Fonts Inter, JetBrains Mono, Syne | `src/index.css:1, 4-27` | Owner decision |
| Gold `#E8B828` / `#C49A1F` and every hard-coded `#e8b828`, plus the indigo `#6366F1` stroke text | `src/index.css`, most views, the email templates (`api/index.ts:330, 430, 442, 598-604`), `StrokeText` (`AboutView.tsx:86-101`) | Owner decision: logo colours only |
| Home stats 50+ / 200+ / 15+ with count-up | `HomeView.tsx:109-168, 287-295` | Unverified numbers (8.8) |
| "Terminal / protocol / log" chrome: "Operations Recap", "View Project Details", "MISSION LOG FILE", "ENCRYPTED LOG READ SUCCESS", "EVENT LINK SECURED", "SYSTEM_AUTHORIZATION_OK", "Company Briefing // COM_XXXX", "Visit Official System Terminal", "Connection Secure", "Close Terminal", "Operational Core", "Physical Infrastructure", "Launch System Manifesto", "Operational Units", "ACTIVE MEMBERS FOUND", "Mission Archive", "SYSTEM SCHEMATIC LIVE_0N", "Level 01/02/03" badges, the blinking cursor | `HomeView.tsx:371, 426, 445-451, 582-584, 647, 660-662`; `AchievementsView.tsx:188, 226, 256, 276, 285-287`; `AboutView.tsx:110, 124, 171, 234-235`; `DepartmentsView.tsx:89, 91, 192`; `ActivitiesView.tsx:104`; `MembersView.tsx:203, 282, 359` | Decorative filler |
| `SOCIAL_NODES.logs` and `tagline` (never shown; invented "12 academic project publications") | `HomeView.tsx:15-49` | Invented |
| The "System Manifesto" pop-up and its "Cooperation…" and "Academic Transparency…" paragraphs | `AboutView.tsx:207-295` | Filler. Keep only the objectives' substance (2.5). |
| Unsplash portraits shown as club members | `data.ts` (16 URLs), `DepartmentsView.tsx:203`, `AdminView.tsx:104` | Photos of strangers |
| Invented member emails, GitHub, Instagram, LinkedIn, bios and subsystems; `getMemberDetails`; the sentence appended to every bio; "Verified Member Directory Entry"; "CONGRESS EXECUTIVE"; "exceptional student brains" | `data.ts:3-222`; `MembersView.tsx:71-142, 510, 558, 582, 657` | Invented, and makes false claims |
| The "LinkedIn" button that opens Instagram | `MembersView.tsx:638-640` | Bug |
| `DIVISIONAL_MEMBERS` | `data.ts:377-593` | Duplicate invented roster; used only to guess admin roles |
| `ARCHIVE_RECAPS` as-is | `data.ts:269-302` | Placeholder link and unverified figures (the titles may come back once confirmed, 2.6) |
| Invented event and gallery descriptions, and reused unrelated photos for events | `data.ts:226-375`, `supabase_schema.sql:189-213` | Invented |
| Invented partner descriptions and summaries; hotlinked logos | `AchievementsView.tsx:19-120` | Invented and fragile |
| Recruitment pop-up copy: "RECRUITMENT AUTONOMY PROTOCOL", "intake sprint has successfully closed", "automated registry will alert you", "Handshake accepted!" | `MembersView.tsx:697, 710, 713, 723` | False claims (there is no alert system) and filler |
| Certificate OTP step (hard-coded `123456`, checked in the browser, sent to the owner) | `CertificatesView.tsx:40-70, 200-245`; `api/index.ts:584-645` | Security theatre |
| Mock certificates and the fixed "Control Theory Bootcamp" body text; "SANDBOX INTEGRATION MODE", "Authorize Node", "visual mainframe preview box" | `api/index.ts:519-534, 565-574`; `CertificatesView.tsx:163-167, 204, 227, 245, 269, 326` | Fake |
| Admin fake panels: "Total Registered 428", "Active Projects 14", the static "Upcoming Events" count, "Simulate Lab Log Entry", "Recent Member Activity", "System Controls" (RFID gate, equipment checkout, maintenance), "ALERT: ACTIVE MAINTENANCE", "Secure Operational Gateway / TERMINAL_IDENT", "Student Portal Links", "TERMINAL SESSION ACTIVE" | `AdminView.tsx:278-294, 391-418, 458-461, 484-661, 666-758` | Fake |
| AI assistant state ("Cognitive Cybernetic Brain ONLINE"), the `ChatMessage` type, `@google/genai`, and the `metadata.json` description | `AdminView.tsx:64-72`, `types.ts:45-50`, `package.json`, `metadata.json` | Dead code and false claims |
| Fake API endpoints | See 4.4 | Fake |
| The `localStorage` admin-session key | `AdminView.tsx:43-50, 185`, `App.tsx:77` | Leftover; can be spoofed |
| Static-data fallbacks that make an empty database look populated, and "Import 10 Default Slides" (no duplicate check) | `HomeView.tsx:59-60`, `AboutView.tsx:38-42`, `HighlightsManager.tsx:148-175, 298-332` | They hide real state and re-seed filler |
| `saturate-150 contrast-125` filters on real photos | `HomeView.tsx:414`, `DepartmentsView.tsx:203` | Distorts the photos |
| One-off scripts `downloadImg.cjs`, `fetchImg.cjs`, `upload_all_images.mjs`, and `imagekit_mapping.json` | repo root | Scraping or migration scripts; no runtime role |
| Google AI Studio leftovers: `package.json` name `"react-example"`, `DISABLE_HMR`, the duplicate `vite` dependency, unused `autoprefixer`, the `@` alias pointing at the repo root | `package.json:2, 32, 50`, `vite.config.ts:11-19` | Not project-specific |
| README feature claims (dynamic members and collaborations, a contact form, "robust OTP") | `README.md:15-18` | False. Write a new README. |

---

## 8. Open questions and risks (each with a recommended default)

1. **Reuse the Supabase project or start a new one?**
   - Default: **reuse "rcweb"** after restoring it. That keeps the data, the auth users and the Google provider settings.
   - Manage it only with versioned migrations kept in the new repo. Never re-run `supabase_schema.sql`.
2. **Risk: restoring the project re-opens the self-admin hole on the live old site** (`rc-web-rho.vercel.app`).
   - Default: make the first migration after restoring **lock down RLS** on `admins`, `certificates`, `form_submissions`, `events` and `gallery`, as in 3.5.
   - The old admin UI keeps working through its API calls, and only its unsafe fallbacks break.
   - Keep schema changes additive until the old site is retired.
3. **"Storage" means ImageKit today, not Supabase Storage.**
   - Default: **keep ImageKit.** It already holds every uploaded image, the database probably references its URLs, and the signing endpoint is part of the API being carried over.
   - Move to a Supabase Storage bucket later only if the owner wants a single vendor.
   - Either way, move the ImageKit account under a club-controlled login. The endpoint name looks personal.
4. **Who may sign in?**
   - Default: sign-in happens only on `/admin`, with no public student login.
   - The server accepts `@vitstudent.ac.in`, plus `@vit.ac.in` so that the faculty coordinator and the club mailbox could be admins.
   - Admin rights come only from `admins`.
   - Drop the personal-Gmail admin.
5. **Admin tiers.**
   - Default: two tiers. **Owners** (`is_owner=true`) can invite and revoke admins. **Admins** manage content.
   - The `role` column stays a display label.
   - Seed the owners from the three `@vitstudent.ac.in` accounts that are hard-coded today, once the owner confirms them.
6. **Which division list is canonical?**
   - Default: the six `department_id`s and Departments-page names in 2.4.
   - The role titles (Technical, Management, Outreach, Publicity) stay as role strings.
7. **Roster confirmation.**
   - Open points: surnames, Ihsan's role (Vice-Chair vs President), whether a Chair or President exists, whether "Aditya" is Aditya Kumar Sahu, and whether to credit the developer under Web Dev.
   - Default: publish first names and roles only once confirmed; initials instead of photos; no contact links.
8. **Home stats (50+ / 200+ / 15+).** Default: drop them, unless the owner supplies verified numbers.
9. **Partners page.**
   - Default: build it from `collaborations` with `is_published=false`, and publish each partner only after the owner confirms it.
   - Use only the owner's one-line descriptions and self-hosted logos.
10. **Certificate access model.**
    - Default:
      - drop the fake OTP;
      - keep the year and roll-number lookup, with an exact match and a rate limit, returning name, event, date and ID;
      - add public "verify by certificate ID";
      - print with a proper print stylesheet.
    - Optional hardening: add `student_email` to `certificates` and require the student to sign in with a matching VIT email before printing.
    - Accept the residual risk that anyone who knows a roll number can see that student's name and event, or choose the sign-in variant.
11. **Recruitment waitlist.**
    - Default: keep it, with fields for name and VIT email.
    - Admins get a list and CSV export (AD9), and an open/closed switch drives the copy.
    - With no switch set, show "closed, join the waitlist".
12. **Event status values.**
    - Default: a fixed set of values: `upcoming`, `registration_open`, `coming_soon`, `completed`. Map the existing free-text values in a data migration.
13. **Resend sending domain.**
    - Default: verify a domain the club controls and set `RESEND_FROM_EMAIL`.
    - Until then, treat email as best effort, and have the UI report whether each email was actually sent. Access is decided by the database either way.
14. **Production URL.**
    - Default: a new Vercel project with `SITE_URL` set.
    - Add its production and preview origins, plus `http://localhost:<port>`, to Supabase's redirect list.
    - Keep the old deployment until cutover.
15. **Gallery photo #4** (a Jeppiaar Academy event). Default: drop it.
16. **Photo licensing.**
    - `campus.jpg` has an unknown source. Default: replace it with a club-owned photo, unless the source is confirmed.
    - `fc.jpg`: confirm with the faculty coordinator.
17. **Command palette and hotkeys.**
    - Default: leave them out of v1. The site has about seven pages.
    - If kept, index live data and never list Admin.
18. **Merge Divisions into Team?** Default: yes. One Team page grouped by division, with each division's description as the group intro.
19. **Scope of the new admin editors (AD6-AD9).**
    - Default: include simple forms and tables for members, partners, certificates (CSV import) and waitlist submissions (CSV export).
    - Without them, the moved data is editable only in the Supabase dashboard.
20. **Which logo mark?** Default: the blue gear-RC mark (`logo-nobg.png`). `web pics/1.png` is treated as an old or alternate mark.
21. **Palette limits.** WCAG contrast ratios, computed:

    | Pair | Ratio | Result |
    |---|---|---|
    | `#4A8DB7` on `#0D0D0D` | 5.35 | Passes AA |
    | `#619AC3` on `#0D0D0D` | 6.40 | Passes AA |
    | `#BFC7CE` on `#0D0D0D` | 11.36 | Passes |
    | `#E5E8EB` on `#0D0D0D` | 15.80 | Passes |
    | White on `#4A8DB7` | 3.63 | Fails AA for body text |
    | White on `#619AC3` | 3.04 | Fails AA for body text |
    | `#0D0D0D` on `#4A8DB7` | 5.35 | Passes |
    | `#0D0D0D` on `#619AC3` | 6.40 | Passes |
    | Blue on white | 3.63 / 3.04 | Fails |
    | `#BFC7CE` on white | 1.71 | Fails badly |
    | `#E5E8EB` on white | 1.23 | Fails badly |

    - Default: dark-first.
    - Use blue as text and accents only on black.
    - Put `#0D0D0D` text on blue buttons.
    - Use greys as text only on black.
    - Allow neutral in-between shades of the listed greys and black for surfaces and borders (the old `#141416`, `#1A1A1E`, `#2A2A2E`, `#3A3A3E`, `#8A8F96` and `#3A6D90` are not logo colours, and the owner should confirm whether shades are allowed).
    - Add no new hue for errors: show them with an icon and text.
22. **Risk: the live data may be seed filler.** Default: after restoring, export every table, compare it with the seed, and rewrite rather than import the filler (2.11).
23. **Risk: a paused free-tier project.** Supabase allows restoring a paused project only for a limited time. Default: restore it and take a full backup (`pg_dump`) before any other work.

---

## Cross-check log (contradictions and gaps resolved from the source)

1. **The logo's transparency.** Report A says `logo.png` is on a transparent background. **It is not:** it has 0% fully transparent pixels and an opaque black corner. The transparent master is `RC-web/public/logo-nobg.png` (88% transparent). Report A noted that file exists but not that it is the transparent version.
2. **`web pics/` (unopened by Report A).**
   - Ten of the files are MD5-identical copies of `public/gallery/1-10.jpg`, so the gallery photos are the 2026-06-17 WhatsApp set.
   - `1.png` is an alternate monochrome mark.
   - `videoframe_4164.png` is another frame of the dot-matrix hands in `about-banner.jpg`.
   - All 12 were uploaded to ImageKit `/robotics-club/events-archive` (`upload_all_images.mjs:84-89`, `imagekit_mapping.json:28-39`).
3. **Report B's "invite reports success without saving when Supabase is not configured" is unreachable.** `requireAdminAuth` returns 503 before the handler runs (`api/index.ts:65-67`). Only `/forms/submit` has a reachable success-without-saving path (`:682`).
4. **The `/api/admin/remove/%25` payload.**
   - Express 4 already decodes route parameters, and the handler decodes again at `:479`, outside its error handling.
   - So a single `%25` becomes `%`, `decodeURIComponent('%')` throws, the rejection goes unhandled, and the request hangs.
   - A double-encoded `%2525` does reach `.ilike("email","%")` and deletes every admin row that is not hard-coded.
   - The browser fallback (`AdminAccessManager.tsx:182`) allows the same deletion directly with any session.
   - The vulnerability is confirmed; the exact payload differs from Report B.
5. **Division taxonomy.** Report A groups the roster by role title (Technical, Design, Management, Outreach, Publicity). The actual `department` values are the six Departments-page divisions (`data.ts:12-219`), and the Members page relabels them (`MembersView.tsx:25-68`). There are three naming schemes in all (8.6).
6. **Report C says the 14 core members have `departmentId`.** The 3 board members have it too (`data.ts:13, 25, 37`). So the Departments pop-up lists Ihsan under Projects, and Grace and Vinayak under Operations.
7. **Resend sender.** Reports B and C list `RESEND_FROM_EMAIL` as used only for invites, which is true. But the other two Resend calls hard-code `onboarding@resend.dev` (`api/index.ts:325, 593`). That is Resend's test sender, which explains Report B's observation that every email goes to the owner.
8. **Environment variables.** `.env.local` has 13 names (read as names only).
   - Read by code but not defined: `RESEND_FROM_EMAIL`, `NODE_ENV`, `VERCEL`, `DISABLE_HMR`.
   - Defined but never read: `GEMINI_API_KEY`.
   - `vite.config.ts` has no `define` block, so no server variable leaks into the bundle.
9. **Every browser `fetch` target is one of the 20 routes.** I grepped all of `src/`. The one exception is the `/imagekit/auth` retry, which works only locally. There are also direct third-party calls to `upload.imagekit.io`.
10. **Tables in code vs schema.** Only `form_submissions` is used but not created. No other table appears in code without appearing in the schema. The policy named "Admin Read Form Submissions" actually grants read access to any signed-in user (`supabase_schema.sql:183-184`).
11. **Documents that contradict the code.**
    - The README claims members and collaborations load from Supabase, a contact form, and a "robust OTP" (`README.md:15-18`). All three are false.
    - `metadata.json` advertises an AI assistant.
    - The earlier redesign spec (`docs/superpowers/specs/2026-09-22-rc-web-redesign-design.md:9, 11`) calls the gallery captions "real" and the roster "Supabase-backed". Report A's photo inspection disproves the first; I re-checked #4 and #9. The roster is static.
    - That spec's gold accent, fonts, 3D hero and "preserve OTP" are overridden by the owner's decisions.
12. **Event cover uploads have no ImageKit folder** (`EventsManager.tsx:503-510`), unlike gallery uploads. No report mentioned this.
13. **"Import 10 Default Slides" writes to Supabase directly first** and uses the API only if that fails (`HighlightsManager.tsx:312-323`). This is the reverse of the other admin flows, and depends on the open RLS.
14. **RC-web against RCweb-reimagined.** They have the same 8 pages (`RC-web/src/App.tsx:268-275`). The components that exist only in RC-web (LoadingScreen, HeroGallery, PillNav, StaggeredMenu) carry no data. The only extra asset is `logo-nobg.png`. No report covered the root scripts `downloadImg.cjs` and `fetchImg.cjs`: they scrape the faculty photo with TLS verification disabled, and produced the corrupt `arockia.jpg`.
15. **The `worktree-member-grid` branch.** It changes only UI files (`git diff main --stat`: `Members/*`, `MembersView.tsx`, one plan doc). `data.ts` is unchanged. Its `MemberDrawer.tsx:82-110` still renders the invented email, GitHub, LinkedIn and Instagram links. Nothing on it needs carrying over.
16. **Other claims confirmed in source.**
    - The implicit auth flow is the default (`GoTrueClient.js:24`).
    - The admin role options are labels only (`AdminAccessManager.tsx:377-384`).
    - `events.status` has four de-facto values (`EventsManager.tsx:73, 131, 245, 454`).
    - `/admin/request-access` short-circuits for existing admins (`api/index.ts:317-320`). Report B missed this.
    - The 20-route count is correct.

---

## 9. Unresolved gaps

1. **The live database.** Its schema, RLS state, policies, functions, triggers, extensions and migrations are all unknown, because the project is paused. In particular it is unknown whether `form_submissions` exists. If it does not, every waitlist sign-up has failed while the page reported success (`MembersView.tsx:164-172`).
2. **Row counts and contents** of every table, and whether live `members` and `collaborations` hold real data.
3. **Seed filler in `events` and `gallery`.** It is unknown whether the live rows are still the seed text, and whether their `image_url` values point to local `/gallery/N.jpg` paths or to ImageKit.
4. **Supabase Storage.** No bucket is used in code; the live buckets are unknown.
5. **Supabase Auth settings.** The Site URL, the redirect list, which Google Cloud project owns the OAuth client and consent screen, any auth hooks, and the number of auth users are all unknown.
6. **ImageKit account.** Its full contents (admin uploads, and event covers in the root folder) and who owns the account are unknown.
7. **Resend account.** Whether any domain is verified, and whether `RESEND_FROM_EMAIL` is set in Vercel, are unknown.
8. **Vercel project settings.** The production environment variables (which may differ from `.env.local`), any custom domain beyond `rc-web-rho.vercel.app`, and the preview-deployment settings are unknown.
9. **Content only the owner can supply** (2.10): surnames and roles, the Chair or President, verified stats, real partners, event descriptions, dates and images, gallery captions, participation in ERC and RoboClash, the lab and inventory claims, the archive events, and the certificate wording and signatory.
10. **Partner relationships.** Nine of the ten have no evidence in the repo; only Bobble appears in a photo.
11. **Image origins.** Where `campus.jpg` and `fc.jpg` come from, and permission to use them.
12. **An original vector logo.** Only 1254×1254 raster versions exist in either repo.
13. **`RC-web/.env.local.txt`.** Deliberately not read, so it is unconfirmed whether it holds the same names as `.env.local` (Report B says it does).
